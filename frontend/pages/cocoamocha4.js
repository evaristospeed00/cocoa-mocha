import React from 'react'

import ProductDetailPage from '../components/product-detail-page'
import {
  fetchMedusaProduct,
  getCoffeeSelectorOptions,
  getPrimaryVariant,
  getProductTags,
  getProductPriceSnapshot,
} from '../lib/medusa-storefront'

const MEDUSA_PRODUCT_ID = 'prod_01KNQKZ0CAJ6VWSNV1937KZ830'
const MEDUSA_VARIANT_ID = 'variant_01KNQKZ0EM748WKGPVRDBQQNTA'

const fallbackProduct = {
  slug: 'guatemala-antigua',
  productId: MEDUSA_PRODUCT_ID,
  variantId: MEDUSA_VARIANT_ID,
  seoTitle: 'Guatemala Antigua - Third Brave Mandrill',
  ogTitle: 'Guatemala Antigua - Third Brave Mandrill',
  canonicalPath: '/cocoamocha4',
  image:
    'https://images.pexels.com/photos/15312642/pexels-photo-15312642.jpeg?auto=compress&cs=tinysrgb&w=1500',
  imageAlt: 'Guatemala Antigua Coffee Beans',
  badge: 'Luxury Pick',
  title: 'Guatemala Antigua Coffee',
  heroTags: ['Chocolate', 'Smoky', 'Complex'],
  description:
    'Guatemala Antigua brings a chocolate-forward profile with a soft smoky edge and a layered finish. It feels refined, memorable, and ideal for guests who want something a little more sophisticated.',
  originalPrice: 19.5,
  price: 19.5,
  discountLabel: '',
  currencyCode: 'usd',
  reviewCount: '910 Reviews',
}

const GuatemalaAntigua = ({ backendProduct, selectorOptions }) => {
  const product = backendProduct || fallbackProduct

  return (
    <ProductDetailPage
      slug={product.slug}
      seoTitle={product.seoTitle}
      ogTitle={product.ogTitle}
      canonicalPath={product.canonicalPath}
      image={product.image}
      imageAlt={product.imageAlt}
      badge={product.badge}
      title={product.title}
      heroTags={product.heroTags}
      description={product.description}
      originalPrice={product.originalPrice}
      price={product.price}
      discountLabel={product.discountLabel}
      currencyCode={product.currencyCode}
      reviewCount={product.reviewCount}
      selectorOptions={selectorOptions}
      productId={product.productId}
      variantId={product.variantId}
      reviews={[
        {
          name: 'Camila D.',
          image:
            'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
          text: 'The chocolate notes are gorgeous and elegant. It feels like a treat every single time.',
        },
        {
          name: 'Noah B.',
          image:
            'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200',
          text: 'This one feels elevated and gift-worthy. The smoky finish is subtle and classy.',
        },
        {
          name: 'Mia C.',
          image:
            'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=200',
          text: 'Complex without being intimidating. It tastes premium from the first sip to the last.',
        },
      ]}
    />
  )
}

export default GuatemalaAntigua

export async function getServerSideProps() {
  const selectorOptions = await getCoffeeSelectorOptions()

  try {
    const medusaProduct = await fetchMedusaProduct(MEDUSA_PRODUCT_ID)

    if (!medusaProduct) {
      return {
        props: {
          backendProduct: fallbackProduct,
          selectorOptions,
        },
      }
    }

    const priceSnapshot = getProductPriceSnapshot(medusaProduct)
    const hasBackendPrice = priceSnapshot.saleAmount > 0

    return {
      props: {
        backendProduct: hasBackendPrice
          ? {
              ...fallbackProduct,
              productId: medusaProduct.id || fallbackProduct.productId,
              variantId:
                getPrimaryVariant(medusaProduct)?.id || fallbackProduct.variantId,
              title: medusaProduct.title || fallbackProduct.title,
              description:
                medusaProduct.description?.trim() || fallbackProduct.description,
              image:
                medusaProduct.thumbnail ||
                medusaProduct.images?.[0]?.url ||
                fallbackProduct.image,
              imageAlt: medusaProduct.title || fallbackProduct.imageAlt,
              heroTags: getProductTags(medusaProduct, fallbackProduct.heroTags),
              originalPrice: priceSnapshot.originalAmount,
              price: priceSnapshot.saleAmount,
              discountLabel: priceSnapshot.discountPercent
                ? `${priceSnapshot.discountPercent}%`
                : '',
              currencyCode: priceSnapshot.currencyCode || fallbackProduct.currencyCode,
            }
          : fallbackProduct,
        selectorOptions,
      },
    }
  } catch (error) {
    return {
      props: {
        backendProduct: fallbackProduct,
        selectorOptions,
      },
    }
  }
}
