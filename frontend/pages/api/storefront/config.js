import {
  getMedusaConfig,
  isMedusaConfigured,
  resolveMedusaConfig,
} from '../../../lib/medusa-storefront'

export default async function handler(req, res) {
  const configured = getMedusaConfig()
  const resolved = await resolveMedusaConfig()

  res.status(200).json({
    connected: Boolean(resolved.backendUrl && resolved.publishableKey),
    backendUrl: resolved.backendUrl,
    publishableKeyPresent: Boolean(resolved.publishableKey),
    regionId: resolved.regionId || '',
    currencyCode: resolved.currencyCode || '',
    envPublishableKeyPresent: Boolean(configured.publishableKey),
    envRegionIdPresent: Boolean(configured.regionId),
    backendConfigured: isMedusaConfigured(),
  })
}
