import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { ApiKey, Region } from "../../../../.medusa/types/query-entry-points";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: publishableKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token"],
    filters: {
      type: "publishable",
    },
  });

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  });

  const publishableKey = ((publishableKeys || []) as ApiKey[])[0]?.token || "";
  const defaultRegion = ((regions || []) as Region[])[0];

  res.json({
    publishableKey,
    regionId: defaultRegion?.id || "",
    currencyCode: defaultRegion?.currency_code?.toLowerCase() || "",
    stripeEnabled: Boolean(process.env.STRIPE_API_KEY?.trim()),
  });
}
