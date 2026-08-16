import type { ChargeParams, ChargeResult, PaymentProvider } from "@/lib/payments/types";

/** Always succeeds. Stands in until a real Nigerian payment provider is wired up. */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async charge(params: ChargeParams): Promise<ChargeResult> {
    return {
      success: true,
      status: "successful",
      providerReference: `mock_${params.reference}`,
    };
  }
}
