import type { PaymentProvider } from "@/lib/payments/types";
import { MockPaymentProvider } from "@/lib/payments/mock-provider";

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? "mock";

  switch (provider) {
    case "mock":
    default:
      return new MockPaymentProvider();
  }
}

export type { PaymentProvider, ChargeParams, ChargeResult } from "@/lib/payments/types";
