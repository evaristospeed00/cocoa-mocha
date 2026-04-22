export const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '') || ''

export const buildCanonicalUrl = (path = '/') => {
  const siteUrl = getSiteUrl()

  if (!siteUrl) {
    return ''
  }

  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}
