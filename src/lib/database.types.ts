// Hand-written to match supabase/migrations/0001_init.sql.
// Regenerate with `supabase gen types typescript` once a project is linked.

export type BasketKind = "template" | "custom";
export type BasketStatus = "draft" | "saved" | "subscribed" | "archived";
export type SubscriptionFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "bimonthly"
  | "semester"
  | "custom";
export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type DeliveryStatus =
  | "pending"
  | "processing"
  | "vendor_confirmed"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "skipped";
export type PaymentStatus = "pending" | "successful" | "failed" | "refunded";
export type AddressLabel = "home" | "school" | "office" | "other";
export type UserRole = "customer" | "admin";

interface Table<Row, Insert, Update = Partial<Insert>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          role: UserRole;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        },
        { id: string; role?: UserRole; full_name?: string | null; phone?: string | null }
      >;
      addresses: Table<
        {
          id: string;
          profile_id: string;
          label: AddressLabel;
          line1: string;
          line2: string | null;
          city: string;
          state: string;
          country: string;
          is_default: boolean;
          created_at: string;
        },
        {
          id?: string;
          profile_id: string;
          label?: AddressLabel;
          line1: string;
          line2?: string | null;
          city: string;
          state: string;
          country?: string;
          is_default?: boolean;
        }
      >;
      payment_methods: Table<
        {
          id: string;
          owner_id: string;
          provider: string;
          type: "card" | "bank_transfer" | "wallet";
          label: string;
          last4: string | null;
          token_ref: string | null;
          is_default: boolean;
          created_at: string;
        },
        {
          id?: string;
          owner_id: string;
          provider?: string;
          type?: "card" | "bank_transfer" | "wallet";
          label: string;
          last4?: string | null;
          token_ref?: string | null;
          is_default?: boolean;
        }
      >;
      businesses: Table<
        {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          status: "active" | "inactive";
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          status?: "active" | "inactive";
        }
      >;
      categories: Table<
        {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          parent_id: string | null;
        },
        { id?: string; name: string; slug: string; icon?: string | null; parent_id?: string | null }
      >;
      products: Table<
        {
          id: string;
          business_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          images: string[];
          unit: string;
          price: number;
          currency: string;
          stock_qty: number;
          is_subscription_eligible: boolean;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          business_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          images?: string[];
          unit?: string;
          price: number;
          currency?: string;
          stock_qty?: number;
          is_subscription_eligible?: boolean;
          is_available?: boolean;
        }
      >;
      vendor_inventory: Table<
        {
          id: string;
          business_id: string;
          product_id: string;
          stock_qty: number;
          is_available: boolean;
          updated_at: string;
        },
        {
          id?: string;
          business_id: string;
          product_id: string;
          stock_qty?: number;
          is_available?: boolean;
        }
      >;
      baskets: Table<
        {
          id: string;
          kind: BasketKind;
          owner_id: string | null;
          status: BasketStatus;
          name: string;
          description: string | null;
          image_url: string | null;
          category_id: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          kind?: BasketKind;
          owner_id?: string | null;
          status?: BasketStatus;
          name: string;
          description?: string | null;
          image_url?: string | null;
          category_id?: string | null;
          updated_at?: string;
        }
      >;
      basket_items: Table<
        {
          id: string;
          basket_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
        },
        { id?: string; basket_id: string; product_id: string; quantity?: number }
      >;
      subscriptions: Table<
        {
          id: string;
          basket_id: string;
          owner_id: string;
          frequency: SubscriptionFrequency;
          custom_interval_days: number | null;
          status: SubscriptionStatus;
          next_delivery_at: string;
          address_id: string;
          payment_method_id: string | null;
          delivery_fee: number;
          item_version: number;
          created_at: string;
          updated_at: string;
          paused_at: string | null;
          cancelled_at: string | null;
        },
        {
          id?: string;
          basket_id: string;
          owner_id: string;
          frequency: SubscriptionFrequency;
          custom_interval_days?: number | null;
          status?: SubscriptionStatus;
          next_delivery_at: string;
          address_id: string;
          payment_method_id?: string | null;
          delivery_fee?: number;
          item_version?: number;
          paused_at?: string | null;
          cancelled_at?: string | null;
        }
      >;
      subscription_items: Table<
        {
          id: string;
          subscription_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          version: number;
          created_at: string;
        },
        {
          id?: string;
          subscription_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          version?: number;
        }
      >;
      deliveries: Table<
        {
          id: string;
          subscription_id: string;
          status: DeliveryStatus;
          scheduled_at: string;
          delivered_at: string | null;
          subtotal: number;
          delivery_fee: number;
          total: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          subscription_id: string;
          status?: DeliveryStatus;
          scheduled_at: string;
          delivered_at?: string | null;
          subtotal?: number;
          delivery_fee?: number;
          total?: number;
        }
      >;
      delivery_items: Table<
        {
          id: string;
          delivery_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        },
        {
          id?: string;
          delivery_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        }
      >;
      payments: Table<
        {
          id: string;
          owner_id: string;
          delivery_id: string | null;
          basket_id: string | null;
          payment_method_id: string | null;
          amount: number;
          currency: string;
          status: PaymentStatus;
          provider: string;
          provider_reference: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          owner_id: string;
          delivery_id?: string | null;
          basket_id?: string | null;
          payment_method_id?: string | null;
          amount: number;
          currency?: string;
          status?: PaymentStatus;
          provider?: string;
          provider_reference?: string | null;
        }
      >;
      activity_events: Table<
        {
          id: string;
          profile_id: string;
          type: string;
          title: string;
          description: string | null;
          metadata: Record<string, unknown>;
          occurred_at: string;
        },
        {
          id?: string;
          profile_id: string;
          type: string;
          title: string;
          description?: string | null;
          metadata?: Record<string, unknown>;
          occurred_at?: string;
        }
      >;
      notification_preferences: Table<
        {
          profile_id: string;
          subscription_reminders: boolean;
          payment_notifications: boolean;
          delivery_updates: boolean;
          promotions: boolean;
        },
        {
          profile_id: string;
          subscription_reminders?: boolean;
          payment_notifications?: boolean;
          delivery_updates?: boolean;
          promotions?: boolean;
        }
      >;
      notifications: Table<
        {
          id: string;
          profile_id: string;
          type: string;
          title: string;
          body: string | null;
          is_read: boolean;
          created_at: string;
        },
        {
          id?: string;
          profile_id: string;
          type: string;
          title: string;
          body?: string | null;
          is_read?: boolean;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
