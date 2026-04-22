import { getMedusaConfig, isMedusaConfigured } from '../../../lib/medusa-storefront'

export default function handler(req, res) {
  const { backendUrl } = getMedusaConfig()

  res.status(200).json({
    connected: isMedusaConfigured(),
    backendUrl,
  })
}

