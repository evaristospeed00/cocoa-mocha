import {
  getMedusaConfig,
  getMedusaHeaders,
  isMedusaConfigured,
  resolveMedusaConfig,
} from '../../../lib/medusa-storefront'

const parseJsonSafely = async (response) => {
  const text = await response.text()

  if (!text) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch (error) {
    return {
      message: text,
    }
  }
}

const createTemporaryPassword = () =>
  `Cm!${Math.random().toString(36).slice(2, 10)}9Z`

const isDuplicateStatus = (status) => [401, 409, 422].includes(status)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({
      message: 'Method not allowed.',
    })
    return
  }

  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase()
  const source = String(req.body?.source || 'unknown').trim()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({
      message: 'Please enter a valid email address.',
    })
    return
  }

  if (!isMedusaConfigured()) {
    res.status(500).json({
      message: 'Medusa storefront is not configured in this frontend environment.',
    })
    return
  }

  const { backendUrl } = await resolveMedusaConfig()

  if (!backendUrl) {
    res.status(500).json({
      message: 'Missing NEXT_PUBLIC_MEDUSA_BACKEND_URL in the frontend environment.',
    })
    return
  }

  const baseUrl = backendUrl.replace(/\/+$/, '')
  const baseHeaders = await getMedusaHeaders()

  try {
    const registerResponse = await fetch(
      `${baseUrl}/auth/customer/emailpass/register`,
      {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({
          email,
          password: createTemporaryPassword(),
        }),
      }
    )

    if (!registerResponse.ok) {
      if (isDuplicateStatus(registerResponse.status)) {
        res.status(200).json({
          created: false,
          alreadyExists: true,
          email,
          source,
          message: 'This email is already registered in Medusa.',
        })
        return
      }

      const registerError = await parseJsonSafely(registerResponse)
      res.status(registerResponse.status).json({
        message:
          registerError?.message ||
          'Could not register this email in Medusa.',
      })
      return
    }

    const registerData = await parseJsonSafely(registerResponse)
    const authToken = registerData?.token

    if (!authToken) {
      res.status(500).json({
        message: 'Medusa did not return a customer registration token.',
      })
      return
    }

    const createCustomerResponse = await fetch(`${baseUrl}/store/customers`, {
      method: 'POST',
      headers: {
        ...baseHeaders,
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        email,
      }),
    })

    if (!createCustomerResponse.ok) {
      if (isDuplicateStatus(createCustomerResponse.status)) {
        res.status(200).json({
          created: false,
          alreadyExists: true,
          email,
          source,
          message: 'This email is already registered in Medusa.',
        })
        return
      }

      const createCustomerError = await parseJsonSafely(createCustomerResponse)
      res.status(createCustomerResponse.status).json({
        message:
          createCustomerError?.message ||
          'Could not create the customer in Medusa.',
      })
      return
    }

    const customerData = await parseJsonSafely(createCustomerResponse)

    res.status(200).json({
      created: true,
      alreadyExists: false,
      email,
      source,
      customer: customerData?.customer || null,
      message: 'Customer created in Medusa successfully.',
    })
  } catch (error) {
    res.status(500).json({
      message:
        error?.message || 'Could not reach Medusa to create the customer.',
    })
  }
}
