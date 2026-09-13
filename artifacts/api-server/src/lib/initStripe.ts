import { stripeEnabled } from "./stripeClient";
import { logger } from "./logger";

/**
 * Boot-time configuration check for direct Stripe access.
 * No-op when Stripe is not configured — the rest of the
 * billing flow falls back to the mock processor in that case.
 */
export async function initStripeIntegration(): Promise<void> {
  if (!stripeEnabled()) {
    logger.info("Stripe integration not connected; using mock billing path");
    return;
  }
  if (!process.env["STRIPE_WEBHOOK_SECRET"]) {
    logger.warn("STRIPE_WEBHOOK_SECRET is missing; Stripe webhooks will be rejected");
  }
  logger.info("Stripe configured with direct environment credentials");
}
