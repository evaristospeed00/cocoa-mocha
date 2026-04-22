import React from 'react'

import ProductDetailPage from '../components/product-detail-page'
import {
  fetchMedusaProductByHandle,
  getCoffeeSelectorOptions,
  getPrimaryVariant,
  getProductTags,
  getProductPriceSnapshot,
} from '../lib/medusa-storefront'

const MEDUSA_PRODUCT_HANDLE = 'sumatra-mandheling'
const MEDUSA_PRODUCT_ID = 'prod_01KNQKZ0CADP473D7N5EZ34D52'
const MEDUSA_VARIANT_ID = 'variant_01KNQKZ0EMK728AHWZ2RDBN78Z'

const fallbackProduct = {
  slug: 'sumatra-mandheling',
  productId: MEDUSA_PRODUCT_ID,
  variantId: MEDUSA_VARIANT_ID,
  seoTitle: 'Sumatra Mandheling - Third Brave Mandrill',
  ogTitle: 'Sumatra Mandheling - Third Brave Mandrill',
  canonicalPath: '/cocoamocha3',
  image:
    'https://images.pexels.com/photos/6729581/pexels-photo-6729581.jpeg?auto=compress&cs=tinysrgb&w=1500',
  imageAlt: 'Sumatra Mandheling Coffee Beans',
  badge: 'Bold Roast',
  title: 'Sumatra Mandheling Coffee',
  heroTags: ['Earthy', 'Bold', 'Spicy'],
  description:
    'Earthy, bold, and full of character, Sumatra Mandheling is built for customers who want depth and drama in every sip. The body is rich, the finish is spicy, and the experience lingers.',
  originalPrice: 18.99,
  price: 18.99,
  discountLabel: '',
  currencyCode: 'usd',
  reviewCount: '860 Reviews',
}

const SumatraMandheling = ({ backendProduct, selectorOptions }) => {
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
          name: 'Leo K.',
          image:
            'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=200',
          text: 'Deep, moody, and powerful in the best way. This one has real personality.',
        },
        {
          name: 'Ava N.',
          image:
            'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200',
          text: 'If you love darker, more serious cups, this one absolutely delivers.',
        },
        {
          name: 'Ruben S.',
          image:
            'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
          text: 'The earthy finish is unforgettable. It feels adventurous without becoming harsh.',
        },
      ]}
    />
  )
}

export default SumatraMandheling

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
