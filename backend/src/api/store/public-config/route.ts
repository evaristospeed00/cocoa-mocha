import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { ApiKey, Region } from "../../../../.medusa/types/query-entry-points";
import bootstrapStorefront from "../../../scripts/bootstrap";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const getPublishableKeys = async () =>
    query.graph({
      entity: "api_key",
      fields: ["id", "token"],
      filters: {
        type: "publishable",
      },
    });

  const getRegions = async () =>
    query.graph({
      entity: "region",
      fields: ["id", "currency_code"],
    });

  let { data: publishableKeys } = await getPublishableKeys();
  let { data: regions } = await getRegions();

  const missingBootstrapData =
    !((publishableKeys || []) as ApiKey[])[0]?.token ||
    !((regions || []) as Region[])[0]?.id;

  if (missingBootstrapData) {
    await bootstrapStorefront({ container: req.scope, args: [] });
    ({ data: publishableKeys } = await getPublishableKeys());
    ({ data: regions } = await getRegions());
  }

  const publishableKey = ((publishableKeys || []) as ApiKey[])[0]?.token || "";
  const defaultRegion = ((regions || []) as Region[])[0];

  res.json({
    publishableKey,
    regionId: defaultRegion?.id || "",
    currencyCode: defaultRegion?.currency_code?.toLowerCase() || "",
    stripeEnabled: Boolean(process.env.STRIPE_API_KEY?.trim()),
  });
}
