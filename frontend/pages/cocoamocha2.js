import React from 'react'

import ProductDetailPage from '../components/product-detail-page'
import {
  fetchMedusaProduct,
  getCoffeeSelectorOptions,
  getPrimaryVariant,
  getProductTags,
  getProductPriceSnapshot,
} from '../lib/medusa-storefront'

const MEDUSA_PRODUCT_HANDLE = 'colombian-supremo'
const MEDUSA_PRODUCT_ID = 'prod_01KPVK5HVBD17DH33FV5MNTZ6M'
const MEDUSA_VARIANT_ID = 'variant_01KPVK5JMCH7RKSFG1BJ4ZA3B5'

const fallbackProduct = {
  slug: 'colombian-supremo',
  productId: MEDUSA_PRODUCT_ID,
  variantId: MEDUSA_VARIANT_ID,
  seoTitle: 'Colombian Supremo - Cocoa Mocha',
  ogTitle: 'Colombian Supremo - Cocoa Mocha',
  canonicalPath: '/cocoamocha2',
  image:
    'https://images.pexels.com/photos/36343671/pexels-photo-36343671.jpeg?auto=compress&cs=tinysrgb&w=1500',
  imageAlt: 'Colombian Supremo Coffee Beans',
  badge: 'Smooth Favorite',
  title: 'Colombian Supremo Coffee',
  heroTags: ['Balanced', 'Nutty', 'Smooth'],
  description:
    'Meet the crowd-pleaser! Our Colombian Supremo is perfectly balanced with rich nutty undertones and a velvety smooth body. It\'s like a warm hug in a cup that keeps you coming back for more. The ultimate comfort coffee that never disappoints!',
  originalPrice: 22.99,
  price: 17.99,
  discountLabel: '20%',
  currencyCode: 'usd',
  reviewCount: '980 Reviews',
}

const ColombianSupremo = ({ backendProduct, selectorOptions }) => {
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
          name: 'Nina R.',
          image:
            'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
          text: 'Silky, balanced, and never bitter. This is my everyday go-to bag.',
        },
        {
          name: 'Owen M.',
          image:
            'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
          text: 'It feels approachable but still premium. Exactly the type of coffee I can serve guests with confidence.',
        },
        {
          name: 'Jade P.',
          image:
            'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
          text: 'The nutty finish is so clean and satisfying. It is easy to love from the first sip.',
        },
      ]}
    />
  )
}

export default ColombianSupremo

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
