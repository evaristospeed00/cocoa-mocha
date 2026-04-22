const routeByHandle = {
  'ethiopian-yirgacheffe': '/cocoamocha1',
  'colombian-supremo': '/cocoamocha2',
  'sumatra-mandheling': '/cocoamocha3',
  'guatemala-antigua': '/cocoamocha4',
}

const badgeByHandle = {
  'ethiopian-yirgacheffe': 'Bright & Floral',
  'colombian-supremo': 'Smooth Favorite',
  'sumatra-mandheling': 'Bold & Earthy',
  'guatemala-antigua': 'Chocolate Luxe',
}

const notesByHandle = {
  'ethiopian-yirgacheffe': 'Citrus bloom, floral aroma, lively finish',
  'colombian-supremo': 'Nutty sweetness, balanced body, silky cup',
  'sumatra-mandheling': 'Deep body, spice, low-acid intensity',
  'guatemala-antigua': 'Cocoa depth, smoky nuance, layered finish',
}

const fallbackDescription =
  'Freshly synced from your Medusa backend and ready to be added to cart from the storefront.'

const MEDUSA_PROXY_BASE_PATH = '/api/medusa'

const featuredProductsById = [
  {
    productId: 'prod_01KNQKZ0CA1EH81H8FN7JJW5ZW',
    href: '/cocoamocha1',
    badge: 'Bright & Floral',
    tastingNotes: 'Citrus bloom, floral aroma, lively finish',
    fallbackDescription:
      'An elegant, fruit-forward roast with sparkling acidity and a clean finish that feels vibrant from the first sip.',
  },
  {
    productId: 'prod_01KNQKZ0CACTPSX6X08TXDA8HN',
    href: '/cocoamocha2',
    badge: 'Smooth Favorite',
    tastingNotes: 'Nutty sweetness, balanced body, silky cup',
    fallbackDescription:
      'A polished crowd-pleaser with mellow richness and easy elegance, perfect for everyday mornings or slow afternoon breaks.',
  },
  {
    productId: 'prod_01KNQKZ0CADP473D7N5EZ34D52',
    href: '/cocoamocha3',
    badge: 'Bold & Earthy',
    tastingNotes: 'Deep body, spice, low-acid intensity',
    fallbackDescription:
      'Dark, moody, and memorable, this roast brings grounded earthiness and a confident finish with real personality.',
  },
  {
    productId: 'prod_01KNQKZ0CAJ6VWSNV1937KZ830',
    href: '/cocoamocha4',
    badge: 'Chocolate Luxe',
    tastingNotes: 'Cocoa depth, smoky nuance, layered finish',
    fallbackDescription:
      'A refined roast with chocolate-forward warmth and subtle smoky complexity that makes the whole page feel more premium.',
  },
]

export const coffeeSelectorProducts = [
  {
    key: 'ethiopia',
    href: '/cocoamocha1',
    productId: 'prod_01KNQKZ0CA1EH81H8FN7JJW5ZW',
    fallbackTitle: 'Ethiopian Yirgacheffe',
    subtitle: 'Fruity & Floral',
    themeClass: 'product-coffee-option--ethiopia',
  },
  {
    key: 'colombia',
    href: '/cocoamocha2',
    productId: 'prod_01KNQKZ0CACTPSX6X08TXDA8HN',
    fallbackTitle: 'Colombian Supremo',
    subtitle: 'Balanced & Nutty',
    themeClass: 'product-coffee-option--colombia',
  },
  {
    key: 'sumatra',
    href: '/cocoamocha3',
    productId: 'prod_01KNQKZ0CADP473D7N5EZ34D52',
    fallbackTitle: 'Sumatra Mandheling',
    subtitle: 'Earthy & Bold',
    themeClass: 'product-coffee-option--sumatra',
  },
  {
    key: 'guatemala',
    href: '/cocoamocha4',
    productId: 'prod_01KNQKZ0CAJ6VWSNV1937KZ830',
    fallbackTitle: 'Guatemala Antigua',
    subtitle: 'Chocolate & Smoke',
    themeClass: 'product-coffee-option--guatemala',
  },
]

export const getMedusaConfig = () => ({
  backendUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.trim() || '',
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY?.trim() || '',
  regionId: process.env.NEXT_PUBLIC_MEDUSA_REGION_ID?.trim() || '',
  currencyCode: process.env.NEXT_PUBLIC_MEDUSA_PRICE_CURRENCY_CODE?.trim().toLowerCase() || '',
})

export const isMedusaConfigured = () => {
  const { backendUrl, publishableKey } = getMedusaConfig()
  return Boolean(backendUrl && publishableKey)
}

export const getMedusaHeaders = () => {
  const { publishableKey } = getMedusaConfig()

  return {
    'Content-Type': 'application/json',
    'x-publishable-api-key': publishableKey,
  }
}

const normalizePrice = (variant = {}) => {
  const calculated = variant.calculated_price

  if (typeof calculated?.calculated_amount === 'number') {
    return calculated.calculated_amount
  }

  if (typeof calculated?.amount === 'number') {
    return calculated.amount
  }

  if (typeof variant.price === 'number') {
    return variant.price
  }

  return 0
}

const getConfiguredCurrencyCode = () => getMedusaConfig().currencyCode

const getVariantPrices = (variant = {}) => {
  if (Array.isArray(variant?.prices) && variant.prices.length > 0) {
    return variant.prices
  }

  if (Array.isArray(variant?.price_set?.prices) && variant.price_set.prices.length > 0) {
    return variant.price_set.prices
  }

  return []
}

const findVariantPriceByCurrency = (variant = {}, currencyCode) => {
  if (!currencyCode) {
    return null
  }

  return (
    getVariantPrices(variant).find(
      (price) => price?.currency_code?.toLowerCase() === currencyCode.toLowerCase()
    ) || null
  )
}

const normalizeOriginalPrice = (variant = {}) => {
  const calculated = variant.calculated_price

  if (typeof calculated?.original_amount === 'number') {
    return calculated.original_amount
  }

  if (typeof calculated?.original_price === 'number') {
    return calculated.original_price
  }

  if (typeof variant.compare_at_price === 'number') {
    return variant.compare_at_price
  }

  return normalizePrice(variant)
}

export const formatCurrencyAmount = (amount) => {
  const numericAmount = Number.parseFloat(amount ?? 0)
  return numericAmount.toFixed(2)
}

export const getProductTags = (product, fallbackTags = []) => {
  const productTags = Array.isArray(product?.tags)
    ? product.tags
        .map((tag) => {
          if (typeof tag === 'string') {
            return tag.trim()
          }

          return tag?.value?.trim() || tag?.name?.trim() || ''
        })
        .filter(Boolean)
    : []

  if (productTags.length > 0) {
    return productTags
  }

  const metadataTags = product?.metadata?.hero_tags

  if (Array.isArray(metadataTags) && metadataTags.length > 0) {
    return metadataTags.map((tag) => String(tag).trim()).filter(Boolean)
  }

  if (typeof metadataTags === 'string' && metadataTags.trim()) {
    return metadataTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  return fallbackTags
}

export const getProductPriceSnapshot = (product) => {
  const firstVariant = getPrimaryVariant(product) || {}
  const configuredCurrencyCode = getConfiguredCurrencyCode()
  const variantCalculatedCurrencyCode =
    firstVariant?.calculated_price?.currency_code?.toLowerCase() || ''
  const configuredVariantPrice = findVariantPriceByCurrency(
    firstVariant,
    configuredCurrencyCode
  )
  const fallbackVariantPrice = getVariantPrices(firstVariant)[0] || null
  const saleAmount =
    normalizePrice(firstVariant) ||
    configuredVariantPrice?.amount ||
    fallbackVariantPrice?.amount ||
    0
  const originalAmount = normalizeOriginalPrice(firstVariant)
  const hasDiscount = originalAmount > saleAmount && saleAmount > 0
  const discountPercent = hasDiscount
    ? Math.round(((originalAmount - saleAmount) / originalAmount) * 100)
    : 0
  const currencyCode =
    variantCalculatedCurrencyCode ||
    configuredVariantPrice?.currency_code?.toLowerCase() ||
    fallbackVariantPrice?.currency_code?.toLowerCase() ||
    configuredCurrencyCode ||
    'usd'

  return {
    saleAmount,
    originalAmount: hasDiscount ? originalAmount : saleAmount,
    discountPercent,
    currencyCode,
  }
}

export const getPrimaryVariant = (product) =>
  product?.variants?.find((variant) => normalizePrice(variant) > 0) ||
  product?.variants?.[0] ||
  null

export const mapMedusaProductToCartItem = (product, fallbackProduct = {}) => {
  const primaryVariant = getPrimaryVariant(product)
  const priceSnapshot = getProductPriceSnapshot(product)

  return {
    id:
      primaryVariant?.id ||
      fallbackProduct.variantId ||
      product?.id ||
      fallbackProduct.slug ||
      'coffee-item',
    name: product?.title || fallbackProduct.title || 'Coffee',
    price: priceSnapshot.saleAmount || fallbackProduct.price || 0,
    productId: product?.id || fallbackProduct.productId || '',
    variantId: primaryVariant?.id || fallbackProduct.variantId || '',
    variantTitle: primaryVariant?.title || fallbackProduct.variantTitle || '',
    currencyCode: priceSnapshot.currencyCode || fallbackProduct.currencyCode || 'usd',
    image:
      product?.thumbnail || product?.images?.[0]?.url || fallbackProduct.image || '',
  }
}

const medusaStoreFetch = async (path, options = {}) => {
  const { backendUrl } = getMedusaConfig()
  const baseUrl =
    typeof window === 'undefined' ? backendUrl : MEDUSA_PROXY_BASE_PATH
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...getMedusaHeaders(),
      ...(options.headers || {}),
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Medusa responded with ${response.status}`)
  }

  return response.json()
}

export const fetchMedusaRegions = async () => {
  if (!isMedusaConfigured()) {
    return []
  }

  const data = await medusaStoreFetch('/store/regions')
  return Array.isArray(data?.regions) ? data.regions : []
}

export const getDefaultMedusaRegion = async () => {
  const configuredRegionId = getMedusaConfig().regionId

  if (configuredRegionId) {
    return configuredRegionId
  }

  const regions = await fetchMedusaRegions()
  return regions[0]?.id || ''
}

export const fetchMedusaProduct = async (productId) => {
  if (!isMedusaConfigured() || !productId) {
    return null
  }

  const regionId = await getDefaultMedusaRegion()
  const productUrl = new URL(`/store/products/${productId}`, 'http://medusa.local')

  if (regionId) {
    productUrl.searchParams.set('region_id', regionId)
  }

  productUrl.searchParams.set(
    'fields',
    '*variants.calculated_price,*variants.prices,*variants.price_set,+variants.calculated_price,+variants.prices,+variants.price_set'
  )

  const data = await medusaStoreFetch(
    `${productUrl.pathname}${productUrl.search}`
  )
  return data?.product || null
}

export const getCoffeeSelectorOptions = async () => {
  const options = await Promise.all(
    coffeeSelectorProducts.map(async (product) => {
      try {
        const medusaProduct = await fetchMedusaProduct(product.productId)

        return {
          ...product,
          title: medusaProduct?.title || product.fallbackTitle,
        }
      } catch (error) {
        return {
          ...product,
          title: product.fallbackTitle,
        }
      }
    })
  )

  return options
}

export const fetchMedusaProducts = async () => {
  if (!isMedusaConfigured()) {
    return []
  }

  const data = await medusaStoreFetch('/store/products')
  return Array.isArray(data?.products) ? data.products : []
}

export const createMedusaCart = async (regionId) => {
  const data = await medusaStoreFetch('/store/carts', {
    method: 'POST',
    body: JSON.stringify({
      region_id: regionId,
    }),
  })

  return data?.cart || null
}

export const updateMedusaCart = async (cartId, payload) => {
  const data = await medusaStoreFetch(`/store/carts/${cartId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return data?.cart || null
}

export const addMedusaLineItem = async (cartId, payload) => {
  const data = await medusaStoreFetch(`/store/carts/${cartId}/line-items`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return data?.cart || null
}

export const listMedusaShippingOptions = async (cartId) => {
  const data = await medusaStoreFetch(`/store/shipping-options?cart_id=${cartId}`)
  return Array.isArray(data?.shipping_options) ? data.shipping_options : []
}

export const addMedusaShippingMethod = async (cartId, optionId) => {
  const data = await medusaStoreFetch(`/store/carts/${cartId}/shipping-methods`, {
    method: 'POST',
    body: JSON.stringify({
      option_id: optionId,
    }),
  })

  return data?.cart || null
}

export const listMedusaPaymentProviders = async (regionId) => {
  const data = await medusaStoreFetch(
    `/store/payment-providers?region_id=${regionId}`
  )

  return Array.isArray(data?.payment_providers) ? data.payment_providers : []
}

export const createMedusaPaymentCollection = async (cartId) => {
  const data = await medusaStoreFetch('/store/payment-collections', {
    method: 'POST',
    body: JSON.stringify({
      cart_id: cartId,
    }),
  })

  return data?.payment_collection || null
}

export const initializeMedusaPaymentSession = async (
  paymentCollectionId,
  providerId,
  payload = {}
) => {
  const data = await medusaStoreFetch(
    `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
    {
      method: 'POST',
      body: JSON.stringify({
        provider_id: providerId,
        data: payload,
      }),
    }
  )

  return data?.payment_collection || null
}

export const completeMedusaCart = async (cartId) =>
  medusaStoreFetch(`/store/carts/${cartId}/complete`, {
    method: 'POST',
  })

export const getFeaturedProductsFromMedusa = async (fallbackProducts) => {
  try {
    const medusaProducts = await Promise.all(
      featuredProductsById.map((product) => fetchMedusaProduct(product.productId))
    )
    const products = medusaProducts
      .map((product, index) =>
        mapMedusaProductToCard(product, featuredProductsById[index])
      )
      .filter((product) => product.price > 0)

    if (products.length === featuredProductsById.length) {
      return {
        products,
        source: 'medusa',
      }
    }
  } catch (error) {}

  return {
    products: fallbackProducts,
    source: 'fallback',
  }
}

export const mapMedusaProductToCard = (product) => {
  const config =
    featuredProductsById.find(
      (featuredProduct) => featuredProduct.productId === product?.id
    ) || null
  const primaryVariant = getPrimaryVariant(product)
  const { saleAmount } = getProductPriceSnapshot(product)
  const handle = product?.handle || ''
  const title = product?.title || 'Coffee'
  const description =
    product?.subtitle ||
    product?.description ||
    config?.fallbackDescription ||
    fallbackDescription
  const image = product?.thumbnail || product?.images?.[0]?.url || ''

  return {
    id: product?.id || handle || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: title,
    price: saleAmount,
    image,
    alt: title,
    href: config?.href || routeByHandle[handle] || '/coffee-product-detail',
    badge: config?.badge || badgeByHandle[handle] || 'From Medusa',
    tastingNotes: config?.tastingNotes || notesByHandle[handle] || 'Fresh catalog sync',
    description,
    handle,
    productId: product?.id || '',
    variantId: primaryVariant?.id || '',
  }
}
