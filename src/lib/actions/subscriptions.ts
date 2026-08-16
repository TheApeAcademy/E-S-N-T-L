"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getBasketById } from "@/lib/data/baskets";
import { logActivity } from "@/lib/data/activity";
import { getPaymentProvider } from "@/lib/payments";
import { addFrequencyInterval, toDateInputValue } from "@/lib/data/frequency";
import type { SubscriptionFrequency } from "@/lib/database.types";

const DELIVERY_FEE = 2000;

export async function createSubscriptionAction(params: {
  basketId: string;
  frequency: SubscriptionFrequency;
  deliveryDate: string;
  addressId: string;
  paymentMethodId: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const basket = await getBasketById(supabase, params.basketId);
  if (basket.owner_id !== user.id) throw new Error("Not your basket");
  if (basket.items.length === 0) throw new Error("Basket is empty");

  const subtotal = basket.items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0,
  );
  const total = subtotal + DELIVERY_FEE;

  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .insert({
      basket_id: basket.id,
      owner_id: user.id,
      frequency: params.frequency,
      status: "active",
      next_delivery_at: params.deliveryDate,
      address_id: params.addressId,
      payment_method_id: params.paymentMethodId,
      delivery_fee: DELIVERY_FEE,
    })
    .select()
    .single();
  if (subError) throw subError;

  const { error: itemsError } = await supabase.from("subscription_items").insert(
    basket.items.map((item) => ({
      subscription_id: subscription.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.product.price,
      version: 1,
    })),
  );
  if (itemsError) throw itemsError;

  await supabase.from("baskets").update({ status: "subscribed" }).eq("id", basket.id);

  const { data: delivery, error: deliveryError } = await supabase
    .from("deliveries")
    .insert({
      subscription_id: subscription.id,
      status: "pending",
      scheduled_at: params.deliveryDate,
      subtotal,
      delivery_fee: DELIVERY_FEE,
      total,
    })
    .select()
    .single();
  if (deliveryError) throw deliveryError;

  const { error: deliveryItemsError } = await supabase.from("delivery_items").insert(
    basket.items.map((item) => ({
      delivery_id: delivery.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.product.price,
    })),
  );
  if (deliveryItemsError) throw deliveryItemsError;

  const provider = getPaymentProvider();
  const chargeResult = await provider.charge({
    amount: total,
    currency: "NGN",
    email: user.email ?? "",
    reference: `${subscription.id}-1`,
  });

  const { error: paymentError } = await supabase.from("payments").insert({
    owner_id: user.id,
    delivery_id: delivery.id,
    basket_id: basket.id,
    payment_method_id: params.paymentMethodId,
    amount: total,
    status: chargeResult.status,
    provider: provider.name,
    provider_reference: chargeResult.providerReference,
  });
  if (paymentError) throw paymentError;

  await logActivity(supabase, {
    profileId: user.id,
    type: "subscription_created",
    title: `Subscribed to ${basket.name}`,
  });
  await logActivity(supabase, {
    profileId: user.id,
    type: "payment",
    title: chargeResult.success
      ? `Payment successful ₦${total.toLocaleString("en-NG")}`
      : "Payment failed",
  });

  if (chargeResult.success) {
    await supabase.from("deliveries").update({ status: "processing" }).eq("id", delivery.id);
    await logActivity(supabase, {
      profileId: user.id,
      type: "fulfillment",
      title: "Basket sent to fulfillment",
    });
  }

  revalidatePath("/baskets");
  revalidatePath("/subscriptions");
  revalidatePath("/");
  redirect(`/subscriptions/${subscription.id}?welcome=1`);
}

async function requireSubscriptionOwner(subscriptionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", subscriptionId)
    .single();
  if (error) throw error;
  if (subscription.owner_id !== user.id) throw new Error("Not your subscription");

  return { supabase, user, subscription };
}

export async function pauseSubscriptionAction(subscriptionId: string) {
  const { supabase, user } = await requireSubscriptionOwner(subscriptionId);
  await supabase
    .from("subscriptions")
    .update({ status: "paused", paused_at: new Date().toISOString() })
    .eq("id", subscriptionId);
  await logActivity(supabase, {
    profileId: user.id,
    type: "subscription_paused",
    title: "Subscription paused",
  });
  revalidatePath(`/subscriptions/${subscriptionId}`);
  revalidatePath("/subscriptions");
}

export async function resumeSubscriptionAction(subscriptionId: string) {
  const { supabase, user } = await requireSubscriptionOwner(subscriptionId);
  await supabase
    .from("subscriptions")
    .update({ status: "active", paused_at: null })
    .eq("id", subscriptionId);
  await logActivity(supabase, {
    profileId: user.id,
    type: "subscription_resumed",
    title: "Subscription resumed",
  });
  revalidatePath(`/subscriptions/${subscriptionId}`);
  revalidatePath("/subscriptions");
}

export async function cancelSubscriptionAction(subscriptionId: string) {
  const { supabase, user, subscription } = await requireSubscriptionOwner(subscriptionId);
  await supabase
    .from("subscriptions")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", subscriptionId);
  await supabase.from("baskets").update({ status: "archived" }).eq("id", subscription.basket_id);
  await supabase
    .from("deliveries")
    .delete()
    .eq("subscription_id", subscriptionId)
    .eq("status", "pending");
  await logActivity(supabase, {
    profileId: user.id,
    type: "subscription_cancelled",
    title: "Subscription cancelled",
  });
  revalidatePath(`/subscriptions/${subscriptionId}`);
  revalidatePath("/subscriptions");
  revalidatePath("/baskets");
}

export async function skipNextDeliveryAction(subscriptionId: string) {
  const { supabase, user, subscription } = await requireSubscriptionOwner(subscriptionId);

  const { data: pendingDelivery } = await supabase
    .from("deliveries")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .eq("status", "pending")
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const nextDate = addFrequencyInterval(
    new Date(subscription.next_delivery_at),
    subscription.frequency,
  );

  if (pendingDelivery) {
    await supabase
      .from("deliveries")
      .update({ status: "skipped" })
      .eq("id", pendingDelivery.id);
  }

  await supabase
    .from("subscriptions")
    .update({ next_delivery_at: toDateInputValue(nextDate) })
    .eq("id", subscriptionId);

  const { data: items } = await supabase
    .from("subscription_items")
    .select("*")
    .eq("subscription_id", subscriptionId);

  const subtotal = (items ?? []).reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const { data: newDelivery } = await supabase
    .from("deliveries")
    .insert({
      subscription_id: subscriptionId,
      status: "pending",
      scheduled_at: toDateInputValue(nextDate),
      subtotal,
      delivery_fee: subscription.delivery_fee,
      total: subtotal + subscription.delivery_fee,
    })
    .select()
    .single();

  if (newDelivery && items) {
    await supabase.from("delivery_items").insert(
      items.map((item) => ({
        delivery_id: newDelivery.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    );
  }

  await logActivity(supabase, {
    profileId: user.id,
    type: "delivery_skipped",
    title: "Skipped next delivery",
    description: `Next delivery moved to ${toDateInputValue(nextDate)}`,
  });

  revalidatePath(`/subscriptions/${subscriptionId}`);
}

export async function changeFrequencyAction(
  subscriptionId: string,
  frequency: SubscriptionFrequency,
) {
  const { supabase, user } = await requireSubscriptionOwner(subscriptionId);
  await supabase.from("subscriptions").update({ frequency }).eq("id", subscriptionId);
  await logActivity(supabase, {
    profileId: user.id,
    type: "subscription_updated",
    title: `Frequency changed to ${frequency}`,
  });
  revalidatePath(`/subscriptions/${subscriptionId}`);
}

export async function changeDeliveryDateAction(subscriptionId: string, date: string) {
  const { supabase, user } = await requireSubscriptionOwner(subscriptionId);
  await supabase
    .from("subscriptions")
    .update({ next_delivery_at: date })
    .eq("id", subscriptionId);

  const { data: pendingDelivery } = await supabase
    .from("deliveries")
    .select("id")
    .eq("subscription_id", subscriptionId)
    .eq("status", "pending")
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (pendingDelivery) {
    await supabase
      .from("deliveries")
      .update({ scheduled_at: date })
      .eq("id", pendingDelivery.id);
  }

  await logActivity(supabase, {
    profileId: user.id,
    type: "subscription_updated",
    title: `Next delivery date changed to ${date}`,
  });

  revalidatePath(`/subscriptions/${subscriptionId}`);
}
