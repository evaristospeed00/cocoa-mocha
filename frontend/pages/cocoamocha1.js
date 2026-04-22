import React from 'react'

import ProductDetailPage from '../components/product-detail-page'
import {
  fetchMedusaProductByHandle,
  getCoffeeSelectorOptions,
  getPrimaryVariant,
  getProductTags,
  getProductPriceSnapshot,
} from '../lib/medusa-storefront'

const MEDUSA_PRODUCT_HANDLE = 'ethiopian-yirgacheffe'
const MEDUSA_PRODUCT_ID = 'prod_01KNQKZ0CA1EH81H8FN7JJW5ZW'
const MEDUSA_VARIANT_ID = 'variant_01KNQKZ0EJWPC4959EM031PW7F'

const fallbackProduct = {
  slug: 'ethiopian-yirgacheffe',
  productId: MEDUSA_PRODUCT_ID,
  variantId: MEDUSA_VARIANT_ID,
  seoTitle: 'Ethiopian Yirgacheffe - Third Brave Mandrill',
  ogTitle: 'Ethiopian Yirgacheffe - Third Brave Mandrill',
  canonicalPath: '/cocoamocha1',
  image:
    'https://images.pexels.com/photos/19052799/pexels-photo-19052799.jpeg?auto=compress&cs=tinysrgb&w=1500',
  imageAlt: 'Ethiopian Yirgacheffe Coffee Beans',
  badge: 'Bright & Floral',
  title: 'Ethiopian Yirgacheffe',
  heroTags: ['Fruity', 'Floral', 'Bright Acidity'],
  description:
    'A lively, fruit-forward coffee with floral aromatics and bright acidity that keeps every sip crisp and expressive.',
  originalPrice: 10,
  price: 10,
  discountLabel: '',
  currencyCode: 'eur',
  reviewCount: '1.1k Reviews',
}

const EthiopianYirgacheffe = ({ backendProduct, selectorOptions }) => {
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
          name: 'Sarah J.',
          image:
            'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
          text: 'Floral, juicy, and incredibly clean. This one feels vibrant from the very first sip.',
        },
        {
          name: 'Mark T.',
          image:
            'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
          text: 'The brightness is exactly what I want from an Ethiopian roast. It tastes fresh and exciting.',
        },
        {
          name: 'Elena R.',
          image:
            'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
          text: 'Super expressive coffee with a beautiful fruit note. It absolutely stands out on the menu.',
        },
      ]}
    />
  )
}

export default EthiopianYirgacheffe

export async function getServerSideProps() {
  const selectorOptions = await getCoffeeSelectorOptions()

  try {
    const medusaProduct = await fetchMedusaProductByHandle(MEDUSA_PRODUCT_HANDLE)

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
              currencyCode:
                priceSnapshot.currencyCode || fallbackProduct.currencyCode,
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
