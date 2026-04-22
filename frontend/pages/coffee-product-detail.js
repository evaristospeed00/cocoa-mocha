import React from 'react'

import ProductDetailPage from '../components/product-detail-page'

const CoffeeProductDetail = () => {
  return (
    <ProductDetailPage
      slug="cloud-nine-caramel-mocha"
      seoTitle="Coffee Product Detail - Third Brave Mandrill"
      ogTitle="Coffee Product Detail - Third Brave Mandrill"
      canonicalPath="/coffee-product-detail"
      image="https://images.pexels.com/photos/5567647/pexels-photo-5567647.jpeg?auto=compress&cs=tinysrgb&w=500"
      imageAlt="Cocoa Mocha Signature Caramel Latte"
      badge="Best Seller"
      title="Cloud Nine Caramel Mocha"
      description="Prepare for a flavor vacation. Cloud Nine Caramel Mocha brings together velvety espresso, rich cocoa, and buttery caramel with a playful finish that feels indulgent without losing balance."
      price={5.75}
      reviewCount="1.2k Reviews"
      reviews={[
        {
          name: 'Sarah J.',
          image:
            'https://images.pexels.com/photos/7156281/pexels-photo-7156281.jpeg?auto=compress&cs=tinysrgb&w=200',
          text: 'The Cloud Nine Caramel Mocha is literally a dessert in a cup. It is the highlight of my week.',
        },
        {
          name: 'Marcus T.',
          image:
            'https://images.pexels.com/photos/35558033/pexels-photo-35558033.jpeg?auto=compress&cs=tinysrgb&w=200',
          text: 'It tastes premium and polished, but still comforting enough to order again and again.',
        },
        {
          name: 'Elena V.',
          image:
            'https://images.pexels.com/photos/6278520/pexels-photo-6278520.jpeg?auto=compress&cs=tinysrgb&w=200',
          text: 'The website and the drink both feel playful and elevated. It matches the shop energy perfectly.',
        },
      ]}
    />
  )
}

export default CoffeeProductDetail
