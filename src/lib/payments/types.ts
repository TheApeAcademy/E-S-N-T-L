export interface ChargeParams {
  amount: number;
  currency: string;
  email: string;
  reference: string;
  metadata?: Record<string, unknown>;
}

export interface ChargeResult {
  success: boolean;
  status: "successful" | "failed";
  providerReference: string;
  message?: string;
}

/**
 * Provider-agnostic payment interface. A Nigerian provider (Paystack,
 * Flutterwave, etc.) implements this without touching call sites — see
 * docs/ARCHITECTURE.md section 7.
 */
export interface PaymentProvider {
  readonly name: string;
  charge(params: ChargeParams): Promise<ChargeResult>;
}
