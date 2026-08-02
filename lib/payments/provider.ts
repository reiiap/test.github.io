import crypto from "node:crypto";

export type PaymentProviderName = "MANUAL";
export type CreatePaymentInput = { orderId: string; amount: number; currency: string; description: string; userId: string };
export type CreatedPayment = { provider: PaymentProviderName; externalId: string; checkoutUrl: string | null };

export function isSandboxPaymentsEnabled() { return process.env.PAYMENT_SANDBOX_ENABLED === "true"; }

export async function createPayment(input: CreatePaymentInput): Promise<CreatedPayment> {
  if (!isSandboxPaymentsEnabled()) throw new Error("Provider pembayaran produksi belum dikonfigurasi. Aktifkan PAYMENT_SANDBOX_ENABLED=true hanya untuk sandbox/test.");
  const externalId = `sandbox_${input.orderId}_${crypto.randomUUID()}`;
  return { provider: "MANUAL", externalId, checkoutUrl: `/coins/checkout?payment=${encodeURIComponent(externalId)}` };
}

export async function verifyWebhook(req: Request, payload: unknown) {
  if (!isSandboxPaymentsEnabled()) throw new Error("Webhook sandbox dinonaktifkan untuk mode produksi.");
  const expected = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!expected) throw new Error("PAYMENT_WEBHOOK_SECRET belum dikonfigurasi.");
  const received = req.headers.get("x-payment-webhook-secret");
  if (!received || received !== expected) throw new Error("Signature webhook tidak valid.");
  return payload;
}
