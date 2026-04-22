export const submitCustomerSignup = async (email, source = 'unknown') => {
  const response = await fetch('/api/storefront/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      source,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data?.message || 'We could not save your email right now.'
    )
  }

  return data
}
