import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { ApiKey } from "../../.medusa/types/query-entry-points";
import seedDemoData from "./seed";
import syncStripeRegions from "./sync-stripe-regions";

type EntityRecord = {
  id: string;
  token?: string | null;
};

export default async function bootstrap({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id"],
  });

  const { data: publishableKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token"],
    filters: {
      type: "publishable",
    },
  });

  const typedProducts = (products || []) as EntityRecord[];
  const typedPublishableKeys = (publishableKeys || []) as ApiKey[];
  const needsSeed =
    typedProducts.length === 0 || typedPublishableKeys.length === 0;

  if (needsSeed) {
    logger.info("Bootstrap detected an empty catalog or missing publishable key. Running seed...");
    await seedDemoData({ container, args: [] });
  } else {
    logger.info("Bootstrap found existing catalog data. Skipping seed.");
  }

  if (process.env.STRIPE_API_KEY?.trim()) {
    logger.info("STRIPE_API_KEY detected. Ensuring Stripe is enabled for regions...");
    await syncStripeRegions({ container, args: [] });
  } else {
    logger.info("STRIPE_API_KEY not set. Stripe region sync skipped.");
  }

  const { data: finalPublishableKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token"],
    filters: {
      type: "publishable",
    },
  });

  const publishableKey = ((finalPublishableKeys || []) as ApiKey[])[0]?.token;

  if (publishableKey) {
    logger.info(`Publishable API key ready: ${publishableKey}`);
  } else {
    logger.warn("No publishable API key is available after bootstrap.");
  }
}
