import {
  getMedusaConfig,
  getMedusaHeaders,
  isMedusaConfigured,
  resolveMedusaConfig,
} from '../../../lib/medusa-storefront'

const buildTargetUrl = (backendUrl, pathSegments = [], query = {}) => {
  const sanitizedBaseUrl = backendUrl.replace(/\/+$/, '')
  const targetUrl = new URL(
    `${sanitizedBaseUrl}/${pathSegments.join('/')}`
  )

  Object.entries(query).forEach(([key, value]) => {
    if (key === 'path') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== undefined) {
          targetUrl.searchParams.append(key, String(entry))
        }
      })
      return
    }

    if (value !== undefined) {
      targetUrl.searchParams.set(key, String(value))
    }
  })

  return targetUrl
}

const getForwardBody = (req) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined
  }

  if (req.body == null || req.body === '') {
    return undefined
  }

  if (typeof req.body === 'string') {
    return req.body
  }

  return JSON.stringify(req.body)
}

export default async function handler(req, res) {
  if (!isMedusaConfigured()) {
    res.status(500).json({
      message: 'Medusa storefront is not configured in this frontend environment.',
    })
    return
  }

  try {
    const { backendUrl } = await resolveMedusaConfig()

    if (!backendUrl) {
      res.status(500).json({
        message: 'Missing NEXT_PUBLIC_MEDUSA_BACKEND_URL in the frontend environment.',
      })
      return
    }

    const pathSegments = Array.isArray(req.query.path) ? req.query.path : []
    const targetUrl = buildTargetUrl(backendUrl, pathSegments, req.query)
    const medusaHeaders = await getMedusaHeaders()
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...medusaHeaders,
      },
      body: getForwardBody(req),
    })
    const responseText = await response.text()
    const contentType = response.headers.get('content-type') || 'application/json'

    res.status(response.status)
    res.setHeader('content-type', contentType)
    res.send(responseText)
  } catch (error) {
    res.status(500).json({
      message: error?.message || 'Could not reach the Medusa backend from the proxy.',
    })
  }
}
