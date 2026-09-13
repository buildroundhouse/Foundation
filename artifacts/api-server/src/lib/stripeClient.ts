import Stripe from "stripe";

function requireEnv(name: "STRIPE_SECRET_KEY" | "STRIPE_WEBHOOK_SECRET"): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is required`);
  return value;
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  return new Stripe(requireEnv("STRIPE_SECRET_KEY"));
}

export function getStripeWebhookSecret(): string {
  return requireEnv("STRIPE_WEBHOOK_SECRET");
}

/**
 * True iff direct Stripe credentials are configured. Callers use this as a
 * feature flag — when false the
 * billing routes fall back to the original mock processor so local tests
 * still pass without needing live Stripe credentials.
 */
export function stripeEnabled(): boolean {
  if (process.env["BILLING_DISABLE_STRIPE"] === "1") return false;
  if (process.env["NODE_ENV"] === "test" || process.env["VITEST"]) return false;
  return Boolean(process.env["STRIPE_SECRET_KEY"]);
}
