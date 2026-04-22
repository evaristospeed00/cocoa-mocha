import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  remoteQueryObjectFromString,
} from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"

const STRIPE_PROVIDER_ID = "pp_stripe_stripe"
const SYSTEM_PROVIDER_ID = "pp_system_default"

type RegionRecord = {
  id: string
  name?: string
}

type RegionPaymentProviderLink = {
  region_id: string
  payment_provider?: {
    id?: string
  }
}

export default async function syncStripeRegions({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const remoteQuery = container.resolve(ContainerRegistrationKeys.REMOTE_QUERY)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
  })

  const typedRegions = (regions || []) as RegionRecord[]

  if (!typedRegions.length) {
    logger.info("No regions found. Skipping Stripe region sync.")
    return
  }

  const regionIds = typedRegions.map((region) => region.id)
  const regionProvidersQuery = remoteQueryObjectFromString({
    entryPoint: "region_payment_provider",
    variables: {
      filters: {
        region_id: regionIds,
      },
      take: 9999,
    },
    fields: ["region_id", "payment_provider.id"],
  })

  const { rows } = await remoteQuery(
    regionProvidersQuery
  ) as { rows: RegionPaymentProviderLink[] }

  const providerIdsByRegion = new Map<string, string[]>()

  for (const row of rows || []) {
    const providerId = row.payment_provider?.id

    if (!providerId) {
      continue
    }

    const currentProviders = providerIdsByRegion.get(row.region_id) || []
    currentProviders.push(providerId)
    providerIdsByRegion.set(row.region_id, currentProviders)
  }

  let updatedCount = 0

  for (const region of typedRegions) {
    const currentProviders = Array.from(
      new Set(providerIdsByRegion.get(region.id) || [])
    )

    const nextProviders = Array.from(
      new Set([SYSTEM_PROVIDER_ID, ...currentProviders, STRIPE_PROVIDER_ID])
    )

    const isUnchanged =
      currentProviders.length === nextProviders.length &&
      currentProviders.every((providerId) => nextProviders.includes(providerId))

    if (isUnchanged) {
      logger.info(
        `Region "${region.name || region.id}" already includes Stripe.`
      )
      continue
    }

    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: {
          payment_providers: nextProviders,
        },
      },
    })

    updatedCount++
    logger.info(
      `Enabled Stripe for region "${region.name || region.id}".`
    )
  }

  logger.info(`Stripe region sync completed. Updated ${updatedCount} region(s).`)
}
