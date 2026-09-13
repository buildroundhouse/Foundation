/**
 * Seed the Stripe catalog with the "Expanded capabilities" bundle used
 * by the per-skin billing flow. Idempotent: safe to run repeatedly.
 *
 * Run with:
 *   pnpm --filter @workspace/scripts exec tsx src/seed-stripe-products.ts
 *
 * Requires STRIPE_SECRET_KEY in the environment.
 */
import Stripe from "stripe";

const BUNDLE_NAME = "Expanded capabilities";
const BUNDLE_DESCRIPTION =
  "Per-skin paid bundle: create property records, expand member participation, and unlock pro tools.";
const BUNDLE_METADATA_KEY = "bundle";
const BUNDLE_METADATA_VALUE = "expanded_capabilities";
const PRICE_CENTS = 2900;
const PRICE_CURRENCY = "usd";

function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY environment variable is required");
  return key;
}

async function main(): Promise<void> {
  const stripe = new Stripe(getStripeSecretKey());

  // Find existing bundle product by metadata tag (Stripe search supports
  // metadata equality queries).
  const search = await stripe.products.search({
    query: `metadata['${BUNDLE_METADATA_KEY}']:'${BUNDLE_METADATA_VALUE}' AND active:'true'`,
  });

  let product = search.data[0];
  if (!product) {
    product = await stripe.products.create({
      name: BUNDLE_NAME,
      description: BUNDLE_DESCRIPTION,
      metadata: { [BUNDLE_METADATA_KEY]: BUNDLE_METADATA_VALUE },
    });
    console.log(`Created product ${product.id} (${product.name})`);
  } else {
    console.log(`Product already exists: ${product.id} (${product.name})`);
  }

  // Find a matching active recurring price; if not present, create it.
  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });
  const match = prices.data.find(
    (p) =>
      p.unit_amount === PRICE_CENTS &&
      (p.currency ?? "").toLowerCase() === PRICE_CURRENCY &&
      p.recurring?.interval === "month",
  );
  if (match) {
    console.log(`Price already exists: ${match.id}`);
  } else {
    const created = await stripe.prices.create({
      product: product.id,
      unit_amount: PRICE_CENTS,
      currency: PRICE_CURRENCY,
      recurring: { interval: "month" },
    });
    console.log(`Created price ${created.id} ($${(PRICE_CENTS / 100).toFixed(2)}/mo)`);
  }

  console.log("Done. Stripe catalog is ready.");
}

main().catch((err) => {
  console.error("seed-stripe-products failed:", err);
  process.exit(1);
});
