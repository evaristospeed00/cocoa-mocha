import { getMedusaConfig, getMedusaHeaders, isMedusaConfigured } from '../../../lib/medusa-storefront'

const buildTargetUrl = (pathSegments = [], query = {}) => {
  const { backendUrl } = getMedusaConfig()
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
    const pathSegments = Array.isArray(req.query.path) ? req.query.path : []
    const targetUrl = buildTargetUrl(pathSegments, req.query)
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...getMedusaHeaders(),
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
