import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

import Script from 'dangerous-html/react'

import Navigation from './navigation'
import Footer from './footer'
import { useGlobalContext } from '../global-context'
import { coffeeSelectorProducts } from '../lib/medusa-storefront'

const defaultReviews = [
  {
    name: 'Sarah J.',
    image:
      'https://images.pexels.com/photos/7156281/pexels-photo-7156281.jpeg?auto=compress&cs=tinysrgb&w=200',
    text: 'The drink was gorgeous, balanced, and absolutely worth sharing with friends.',
  },
  {
    name: 'Marcus T.',
    image:
      'https://images.pexels.com/photos/35558033/pexels-photo-35558033.jpeg?auto=compress&cs=tinysrgb&w=200',
    text: 'You can tell the beans are treated with care. It tastes premium without feeling stuffy.',
  },
  {
    name: 'Elena V.',
    image:
      'https://images.pexels.com/photos/6278520/pexels-photo-6278520.jpeg?auto=compress&cs=tinysrgb&w=200',
    text: 'The site, the vibe, and the coffee all match. It feels polished and fun at the same time.',
  },
]

const ProductDetailPage = ({
  slug,
  seoTitle,
  ogTitle,
  canonicalPath,
  image,
  imageAlt,
  badge = 'Best Seller',
  heroTags = [],
  title,
  description,
  price,
  originalPrice,
  discountLabel,
  currencyCode = 'usd',
  reviewCount = '1.2k Reviews',
  buyNowLabel = 'Buy Now',
  reviews = defaultReviews,
  selectorOptions = coffeeSelectorProducts.map((product) => ({
    ...product,
    title: product.fallbackTitle,
  })),
  productId = '',
  variantId = '',
}) => {
  const router = useRouter()
  const { addToCart, openCart } = useGlobalContext()
  const formatPrice = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
    }).format(amount)

  const product = {
    id: variantId || slug,
    name: title,
    price,
    productId,
    variantId,
    currencyCode,
  }

  const handleAddToCart = () => {
    addToCart(product)
    openCart()
  }

  const handleBuyNow = () => {
    addToCart(product)
    router.push('/checkout')
  }

  return (
    <>
      <div className="coffee-product-detail-container1">
        <Head>
          <title>{seoTitle}</title>
          <meta property="og:title" content={ogTitle} />
          <link
            rel="canonical"
            href={`https://third-brave-mandrill-dq10nb.teleporthq.app${canonicalPath}`}
          />
          <meta
            property="og:url"
            content={`https://third-brave-mandrill-dq10nb.teleporthq.app${canonicalPath}`}
          />
        </Head>
        <Navigation></Navigation>
        <section className="coffee-hero">
          <div className="coffee-hero-container">
            <div className="coffee-hero-image-wrapper">
              <img src={image} alt={imageAlt} className="coffee-hero-image" />
              <div className="coffee-hero-badge">
                <span className="coffee-hero-badge-text">New!</span>
              </div>
            </div>
            <div className="coffee-hero-content">
              <div className="coffee-hero-tag">
                <span>{badge}</span>
              </div>
              <h1 className="coffee-product-detail-hero-title hero-title">
                {title}
              </h1>
              {heroTags.length > 0 ? (
                <div className="coffee-hero-flavor-tags">
                  {heroTags.map((tag) => (
                    <span key={tag} className="coffee-hero-flavor-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              {typeof originalPrice === 'number' && originalPrice > price ? (
                <div className="coffee-hero-pricing-stack">
                  <div className="coffee-hero-original-price-row">
                    <span className="coffee-hero-original-price">
                      {formatPrice(originalPrice)}
                    </span>
                    {discountLabel ? (
                      <span className="coffee-hero-discount-badge">
                        SAVE {discountLabel}
                      </span>
                    ) : null}
                  </div>
                  <div className="coffee-hero-sale-price">{formatPrice(price)}</div>
                </div>
              ) : null}
              <p className="hero-subtitle">{description}</p>
              <div className="coffee-hero-meta">
                {!(typeof originalPrice === 'number' && originalPrice > price) ? (
                  <div className="coffee-hero-price">
                    <span>{formatPrice(price)}</span>
                  </div>
                ) : null}
                <div className="coffee-hero-rating">
                  <div className="star-group">
                    {[0, 1, 2, 3].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="var(--color-secondary)"
                      >
                        <path
                          d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                          stroke="var(--color-secondary)"
                          strokeWidth="2"
                        ></path>
                      </svg>
                    ))}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="var(--color-secondary)"
                    >
                      <path
                        d="M12 18.338a2.1 2.1 0 0 0-.987.244L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16l2.309-4.679A.53.53 0 0 1 12 2"
                        stroke="var(--color-secondary)"
                        strokeWidth="2"
                      ></path>
                    </svg>
                  </div>
                  <span className="coffee-hero-review-count">{reviewCount}</span>
                </div>
              </div>
              <div className="coffee-hero-actions">
                <button
                  className="btn btn-lg coffee-buy-now-btn"
                  onClick={handleBuyNow}
                >
                  <span>{buyNowLabel}</span>
                </button>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleAddToCart}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="8" cy="21" r="1"></circle>
                    <circle cx="19" cy="21" r="1"></circle>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                  </svg>
                  <span> Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="product-coffee-selector-section">
          <div className="product-coffee-selector-container">
            <div className="product-coffee-selector-header">
              <span className="product-coffee-selector-badge">Flash Sale!</span>
              <h2 className="section-title">Pick Your Perfect Brew!</h2>
              <p className="section-content">
                Tap a coffee to explore flavors &amp; unlock special pricing
              </p>
            </div>
            <div className="product-coffee-selector-grid">
              {selectorOptions.map((option) => {
                const isActive = option.href === canonicalPath

                return (
                  <Link key={option.href} href={option.href} legacyBehavior>
                    <a
                      className={`product-coffee-option ${option.themeClass}${
                        isActive ? ' is-active' : ''
                      }`}
                    >
                      <span className="product-coffee-option-title">
                        {option.title}
                      </span>
                      <span className="product-coffee-option-subtitle">
                        {option.subtitle}
                      </span>
                    </a>
                  </Link>
                )
              })}
            </div>
            <div className="product-coffee-selector-banner">
              <span className="product-coffee-selector-banner-icon">☕</span>
              <span>Limited Time: Free Shipping on orders over $25!</span>
              <span className="product-coffee-selector-banner-icon">☕</span>
            </div>
          </div>
        </section>
        <section className="reviews">
          <div className="reviews-header">
            <h2 className="section-title">What Our Coffee Family Says</h2>
            <p className="section-content">
              Guests keep coming back for the flavor, the energy, and the feel-good ritual.
            </p>
          </div>
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.name} className="review-card">
                <div className="review-image-container">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="review-customer-img"
                  />
                </div>
                <div className="review-content">
                  <div className="review-stars">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="var(--color-secondary)"
                      >
                        <path
                          d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                          stroke="var(--color-secondary)"
                          strokeWidth="2"
                        ></path>
                      </svg>
                    ))}
                  </div>
                  <p className="review-text">&quot;{review.text}&quot;</p>
                  <div className="review-author">
                    <span>{review.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <div className="coffee-product-detail-container2">
          <div className="coffee-product-detail-container3">
            <Script
              html={`<style>
        @keyframes float {0%,100% {transform: translateY(0) rotate(15deg);}
50% {transform: translateY(-10px) rotate(15deg);}}
        </style> `}
            ></Script>
          </div>
        </div>
        <div className="coffee-product-detail-container4">
          <div className="coffee-product-detail-container5">
            <Script
              html={`<script defer data-name="coffee-interactions">
(function(){
  const reviewCards = document.querySelectorAll(".review-card")

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = "1"
          entry.target.style.transform = "translateY(0)"
        }, index * 100)
        revealObserver.unobserve(entry.target)
      }
    })
  }, observerOptions)

  reviewCards.forEach((card) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(30px)"
    card.style.transition = "all 0.6s ease-out"
    revealObserver.observe(card)
  })

  const heroImage = document.querySelector(".coffee-hero-image")
  if (heroImage) {
    window.addEventListener("scroll", () => {
      const scroll = window.pageYOffset
      heroImage.style.transform = \`translateY(\${scroll * 0.05}px) rotate(\${scroll * 0.01}deg)\`
    })
  }
})()
</script>`}
            ></Script>
          </div>
        </div>
        <Footer></Footer>
      </div>
      <style jsx>{`
        .coffee-product-detail-container1 {
          width: 100%;
          min-height: 100vh;
        }
        .coffee-buy-now-btn {
          width: 100%;
          border: 0;
          min-height: 72px;
          padding: 1rem 1.5rem;
          color: #f8fff9;
          display: inline-flex;
          cursor: pointer;
          font-size: 1.42rem;
          font-weight: 900;
          line-height: 1;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at top left, rgba(178, 255, 202, 0.22), transparent 30%),
            linear-gradient(135deg, #0a9a4f 0%, #12c763 45%, #06753a 100%);
          box-shadow: 0 18px 34px rgba(8, 135, 67, 0.34);
          letter-spacing: 0.02em;
          text-align: center;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .coffee-buy-now-btn span {
          display: inline-block;
          transform: translateY(-1px);
        }
        .coffee-buy-now-btn:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 22px 42px rgba(8, 135, 67, 0.42);
        }
        .coffee-hero-flavor-tags {
          gap: 0.75rem;
          display: flex;
          flex-wrap: wrap;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        .coffee-hero-flavor-tag {
          color: #4e321d;
          padding: 0.55rem 0.9rem;
          font-size: 0.88rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          border-radius: 999px;
          background: rgba(255, 248, 239, 0.92);
          border: 1px solid rgba(118, 68, 31, 0.12);
        }
        .coffee-hero-pricing-stack {
          gap: 0.6rem;
          display: flex;
          margin-bottom: 1rem;
          flex-direction: column;
        }
        .coffee-hero-original-price-row {
          gap: 0.75rem;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }
        .coffee-hero-original-price {
          color: #916e53;
          font-size: 1.15rem;
          font-weight: 700;
          text-decoration: line-through;
        }
        .coffee-hero-discount-badge {
          color: #fff7f1;
          padding: 0.35rem 0.7rem;
          font-size: 0.78rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          border-radius: 999px;
          background: linear-gradient(135deg, #ff7b3d 0%, #ff4f7f 100%);
        }
        .coffee-hero-sale-price {
          color: #0e7c4b;
          font-size: 2rem;
          font-weight: 900;
          line-height: 1;
        }
        .coffee-product-detail-container2 {
          display: none;
        }
        .coffee-product-detail-container3 {
          display: contents;
        }
        .coffee-product-detail-container4 {
          display: none;
        }
        .coffee-product-detail-container5 {
          display: contents;
        }
        .product-coffee-selector-section {
          padding: 0 0 4.5rem;
        }
        .product-coffee-selector-container {
          margin: 0 auto;
          padding: 0 1.5rem;
          max-width: var(--content-max-width);
          display: flex;
          align-items: center;
          flex-direction: column;
        }
        .product-coffee-selector-header {
          max-width: 760px;
          text-align: center;
          margin-bottom: 2rem;
        }
        .product-coffee-selector-badge {
          color: #fff5ef;
          display: inline-flex;
          padding: 0.7rem 1.2rem;
          font-size: 0.8rem;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-radius: 999px;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ff7b3d 0%, #ff4f7f 100%);
          box-shadow: 0 14px 26px rgba(255, 96, 76, 0.24);
        }
        .product-coffee-selector-grid {
          gap: 1rem;
          display: grid;
          width: 100%;
          max-width: 1040px;
          margin-bottom: 1.75rem;
          grid-template-columns: repeat(4, 1fr);
        }
        .product-coffee-option {
          display: flex;
          min-height: 164px;
          padding: 1.35rem;
          position: relative;
          border-radius: 24px;
          text-decoration: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          border: 1px solid rgba(88, 48, 20, 0.1);
          box-shadow: 0 14px 30px rgba(70, 37, 18, 0.08);
          transition: transform 0.25s ease, box-shadow 0.25s ease,
            border-color 0.25s ease;
        }
        .product-coffee-option:hover {
          transform: translateY(-4px);
          box-shadow: 0 22px 36px rgba(70, 37, 18, 0.14);
        }
        .product-coffee-option.is-active {
          border-color: rgba(255, 122, 24, 0.4);
          box-shadow: 0 22px 38px rgba(255, 122, 24, 0.16);
        }
        .product-coffee-option-title {
          font-size: 1.08rem;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 0.4rem;
          max-width: 12ch;
        }
        .product-coffee-option-subtitle {
          opacity: 0.82;
          font-size: 0.92rem;
          font-weight: 700;
          letter-spacing: 0.01em;
        }
        .product-coffee-option--ethiopia {
          color: #3b2a1a;
          background: linear-gradient(135deg, #f7ecd9 0%, #f1dfbf 100%);
        }
        .product-coffee-option--colombia {
          color: #402a14;
          background: linear-gradient(135deg, #dcc0a0 0%, #cfab87 100%);
        }
        .product-coffee-option--sumatra {
          color: #f7ede0;
          background: linear-gradient(135deg, #4b2c17 0%, #2f190c 100%);
        }
        .product-coffee-option--guatemala {
          color: #f7ede0;
          background: linear-gradient(135deg, #2f1a0e 0%, #1d120a 100%);
        }
        .product-coffee-selector-banner {
          gap: 0.9rem;
          display: inline-flex;
          width: min(100%, 640px);
          padding: 1rem 1.35rem;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: rgba(255, 252, 246, 0.92);
          border: 2px dashed rgba(255, 166, 67, 0.45);
          color: var(--color-on-surface);
          font-weight: 800;
          text-align: center;
        }
        .product-coffee-selector-banner-icon {
          font-size: 1.15rem;
          flex-shrink: 0;
        }
        @media (max-width: 991px) {
          .product-coffee-selector-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 767px) {
          .coffee-buy-now-btn {
            min-height: 68px;
            font-size: 1.28rem;
          }
          .product-coffee-selector-grid {
            grid-template-columns: 1fr;
          }
          .product-coffee-selector-banner {
            width: 100%;
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>
    </>
  )
}

export default ProductDetailPage
