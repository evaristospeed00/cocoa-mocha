import React, { useEffect, useRef, useState } from 'react'
import Head from 'next/head'

import Script from 'dangerous-html/react'

import Navigation from '../components/navigation'
import Footer from '../components/footer'
import { useGlobalContext } from '../global-context'
import { submitCustomerSignup } from '../lib/customer-signup'
import { defaultFeaturedProducts } from '../lib/default-products'
import { getFeaturedProductsFromMedusa } from '../lib/medusa-storefront'

const Home = (props) => {
  const { addToCart, openCart } = useGlobalContext()
  const [isRewardsBubbleOpen, setIsRewardsBubbleOpen] = useState(false)
  const [isRewardsBubbleClosing, setIsRewardsBubbleClosing] = useState(false)
  const [rewardsEmail, setRewardsEmail] = useState('')
  const [rewardsStatus, setRewardsStatus] = useState({
    type: '',
    message: '',
  })
  const [isRewardsSubmitting, setIsRewardsSubmitting] = useState(false)
  const [showRewardsCelebration, setShowRewardsCelebration] = useState(false)
  const [featuredCoffees, setFeaturedCoffees] = useState(
    props.initialFeaturedCoffees || defaultFeaturedProducts
  )
  const [catalogSource, setCatalogSource] = useState(
    props.initialCatalogSource || 'fallback'
  )
  const rewardsBubbleRef = useRef(null)
  const rewardsBubbleCloseTimerRef = useRef(null)

  const handleAddToCart = (product) => {
    addToCart(product)
    openCart()
  }

  const finishRewardsBubbleClose = () => {
    if (rewardsBubbleCloseTimerRef.current) {
      clearTimeout(rewardsBubbleCloseTimerRef.current)
    }

    rewardsBubbleCloseTimerRef.current = setTimeout(() => {
      setIsRewardsBubbleOpen(false)
      setIsRewardsBubbleClosing(false)
      setRewardsStatus({
        type: '',
        message: '',
      })
      rewardsBubbleCloseTimerRef.current = null
    }, 520)
  }

  const closeRewardsBubble = () => {
    setIsRewardsBubbleClosing(true)
    finishRewardsBubbleClose()
  }

  const toggleRewardsBubble = () => {
    if (isRewardsBubbleOpen && !isRewardsBubbleClosing) {
      closeRewardsBubble()
      return
    }

    if (rewardsBubbleCloseTimerRef.current) {
      clearTimeout(rewardsBubbleCloseTimerRef.current)
      rewardsBubbleCloseTimerRef.current = null
    }

    setRewardsStatus({
      type: '',
      message: '',
    })
    setIsRewardsBubbleClosing(false)
    setIsRewardsBubbleOpen(true)
  }

  const handleRewardsSubmit = async (event) => {
    event.preventDefault()

    if (!rewardsEmail.trim()) {
      setRewardsStatus({
        type: 'error',
        message: 'Please enter your email first.',
      })
      return
    }

    setIsRewardsSubmitting(true)
    setRewardsStatus({
      type: '',
      message: '',
    })

    try {
      const result = await submitCustomerSignup(rewardsEmail, 'rewards-bubble')

      setRewardsEmail('')
      setRewardsStatus({
        type: 'success',
        message: result?.alreadyExists
          ? 'You are already on the list. Your reward moment is still very much alive.'
          : 'You are officially in. Something indulgent just unlocked for you.',
      })
      setShowRewardsCelebration(true)
      setTimeout(() => {
        setShowRewardsCelebration(false)
      }, 3000)
      setTimeout(() => {
        closeRewardsBubble()
      }, 3450)
    } catch (error) {
      setRewardsStatus({
        type: 'error',
        message:
          error?.message || 'We could not save your email right now.',
      })
    } finally {
      setIsRewardsSubmitting(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      try {
        const response = await fetch('/api/storefront/products')
        const data = await response.json()

        if (!isMounted) {
          return
        }

        if (Array.isArray(data?.products) && data.products.length > 0) {
          setFeaturedCoffees(data.products)
        }

        if (data?.source) {
          setCatalogSource(data.source)
        }
      } catch (error) {
        if (isMounted) {
          setCatalogSource('fallback')
        }
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isRewardsBubbleOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!rewardsBubbleRef.current?.contains(event.target)) {
        closeRewardsBubble()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeRewardsBubble()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isRewardsBubbleOpen])

  useEffect(
    () => () => {
      if (rewardsBubbleCloseTimerRef.current) {
        clearTimeout(rewardsBubbleCloseTimerRef.current)
      }
    },
    []
  )

  return (
    <>
      <div className="home-container1">
        <Head>
          <title>Third Brave Mandrill</title>
          <meta property="og:title" content="Third Brave Mandrill" />
          <link
            rel="canonical"
            href="https://third-brave-mandrill-dq10nb.teleporthq.app/"
          />
          <meta
            property="og:url"
            content="https://third-brave-mandrill-dq10nb.teleporthq.app/"
          />
        </Head>
        <Navigation></Navigation>
        <section className="welcome-hero">
          <div className="welcome-hero-media">
            <video
              autoPlay="true"
              muted="true"
              loop="true"
              playsInline="true"
              poster="https://images.pexels.com/photos/15244937/pexels-photo-15244937.jpeg?auto=compress&amp;cs=tinysrgb&amp;h=650&amp;w=940"
              src="https://videos.pexels.com/video-files/9434835/9434835-hd_720_1280_30fps.mp4"
              className="welcome-hero-video"
            ></video>
            <div className="welcome-hero-overlay"></div>
          </div>
          <div className="welcome-hero-content-wrapper">
            <div className="welcome-hero-card">
              <div className="welcome-hero-brand">
                <div className="welcome-hero-logo-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 2v2m4-2v2m2 4a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1M6 2v2"
                    ></path>
                  </svg>
                </div>
                <span className="welcome-hero-brand-name">Cocoa Mocha</span>
              </div>
              <h1 className="hero-title">
                <span>
                  {' '}
                  Wake Up to a
                  <span
                    dangerouslySetInnerHTML={{
                      __html: ' ',
                    }}
                  />
                </span>
                <span className="home-thq-welcome-hero-highlight-elm">
                  Fun-Filled
                </span>
                <span>
                  {' '}
                  Brew
                  <span
                    dangerouslySetInnerHTML={{
                      __html: ' ',
                    }}
                  />
                </span>
              </h1>
              <p className="hero-subtitle">
                The most attractive, playful, and delicious coffee experience in
                town. Your daily spark of joy starts right here.
              </p>
              <div className="welcome-hero-nav">
                <a href="/cocoamocha1">
                  <div className="btn btn-primary btn-lg">
                    <span>Shop Drinks</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="featured-drinks">
          <div className="featured-drinks-header">
            <span className="featured-drinks-kicker">Signature coffees</span>
            <h2 className="section-title">Freshly Roasted Bestsellers</h2>
            <p className="section-content">
              Four real coffees, each with its own mood, origin, and flavor
              story.
            </p>
            <p className="featured-drinks-source">
              {catalogSource === 'medusa'
                ? 'Catalog synced from your Medusa backend.'
                : 'Showing local catalog fallback while backend data is unavailable.'}
            </p>
          </div>
          <div id="drinksRail" className="featured-drinks-rail">
            {featuredCoffees.map((coffee) => (
              <article key={coffee.id} className="featured-drinks-card">
                <div className="featured-drinks-image-wrap">
                  <img
                    src={coffee.image}
                    alt={coffee.alt}
                    className="featured-drinks-img"
                  />
                  <span className="featured-drinks-badge">{coffee.badge}</span>
                </div>
                <div className="featured-drinks-card-content">
                  <p className="featured-drinks-notes">{coffee.tastingNotes}</p>
                  <div className="featured-drinks-name-row">
                    <h3 className="featured-drinks-name">{coffee.name}</h3>
                    <p className="featured-drinks-price">
                      ${coffee.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="featured-drinks-description">
                    {coffee.description}
                  </p>
                  <div className="featured-drinks-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        handleAddToCart({
                          id: coffee.variantId || coffee.id,
                          name: coffee.name,
                          price: coffee.price,
                          productId: coffee.productId || '',
                          variantId: coffee.variantId || '',
                        })
                      }
                    >
                      Add to Cart
                    </button>
                    <a href={coffee.href} className="featured-drinks-link">
                      View Details
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="quick-explore">
          <div className="quick-explore-container">
            <div className="quick-explore-header">
              <h2 className="section-title">Coffee Notes Worth Knowing</h2>
              <p className="section-content">
                A few quick details to make every order feel a little more
                intentional, a little more delicious, and a lot more fun.
              </p>
            </div>
            <div className="quick-explore-grid">
              <article className="quick-explore-feature">
                <span className="quick-explore-kicker">House guide</span>
                <h3 className="quick-explore-feature-title">
                  Lighter roasts usually taste brighter. Darker roasts feel
                  deeper.
                </h3>
                <p className="quick-explore-feature-copy">
                  If you love citrus, floral notes, or a crisp finish, start
                  with a lighter roast. If you want cocoa, caramel, and a more
                  comforting body, go darker. Same bean, totally different mood.
                </p>
                <div className="quick-explore-pills">
                  <span className="quick-explore-pill">Bright</span>
                  <span className="quick-explore-pill">Chocolatey</span>
                  <span className="quick-explore-pill">Smooth</span>
                </div>
              </article>
              <div className="quick-explore-stack">
                <div className="quick-explore-item">
                  <span className="quick-explore-mini-label">Fun fact</span>
                  <h3 className="quick-explore-label">Coffee is a fruit first.</h3>
                  <p className="quick-explore-copy">
                    Beans begin inside a cherry, which is why great coffee can
                    carry notes that feel fruity, juicy, and unexpectedly bright.
                  </p>
                </div>
                <div className="quick-explore-item">
                  <span className="quick-explore-mini-label">Best sip window</span>
                  <h3 className="quick-explore-label">
                    Freshly roasted shines brightest in the first few weeks.
                  </h3>
                  <p className="quick-explore-copy">
                    That sweet spot is where aromatics feel lively and the cup
                    tastes more layered, fragrant, and expressive.
                  </p>
                </div>
                <div className="quick-explore-item">
                  <span className="quick-explore-mini-label">Quick pairing</span>
                  <h3 className="quick-explore-label">
                    Chocolate desserts love coffees with nutty or caramel notes.
                  </h3>
                  <p className="quick-explore-copy">
                    It makes the whole experience feel richer without fighting for
                  attention, which is exactly the kind of balance a good café
                    aims for.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="trust-proof">
          <div className="trust-proof-container">
            <div className="trust-proof-header">
              <h2 className="section-title">Loved by Thousands</h2>
              <p className="section-content">
                See why Cocoa Mocha is the new favorite neighborhood spot.
              </p>
            </div>
            <div className="trust-proof-grid">
              <div className="trust-proof-card">
                <div className="trust-proof-stars">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                </div>
                <p className="trust-proof-text">
                  &quot;Best iced latte I&apos;ve ever had! The atmosphere is so
                  fun and the staff is amazing.&quot;
                </p>
                <div className="trust-proof-user">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="10" r="3"></circle>
                      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
                    </g>
                  </svg>
                  <span>Sarah J.</span>
                </div>
              </div>
              <div className="trust-proof-card">
                <div className="trust-proof-stars">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                </div>
                <p className="trust-proof-text">
                  &quot;The mobile ordering is so easy. I just grab my drink on
                  the way to work. No hassle!&quot;
                </p>
                <div className="trust-proof-user">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="10" r="3"></circle>
                      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
                    </g>
                  </svg>
                  <span>Mike R.</span>
                </div>
              </div>
              <div className="trust-proof-card">
                <div className="trust-proof-stars">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                </div>
                <p className="trust-proof-text">
                  &quot;Love the branding! It&apos;s so bright and happy. Plus,
                  the mocha is actually balanced and rich.&quot;
                </p>
                <div className="trust-proof-user">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="10" r="3"></circle>
                      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
                    </g>
                  </svg>
                  <span>Elena W.</span>
                </div>
              </div>
              <div className="trust-proof-badge-item">
                <div className="trust-proof-badge-inner">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                      <path d="m9 11l3 3L22 4"></path>
                    </g>
                  </svg>
                  <span className="trust-proof-badge-name">
                    Certified Fresh
                  </span>
                </div>
              </div>
              <div className="trust-proof-badge-item">
                <div className="trust-proof-badge-inner">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="m9 12l2 2l4-4"></path>
                    </g>
                  </svg>
                  <span className="trust-proof-badge-name">Local Partner</span>
                </div>
              </div>
              <div className="trust-proof-badge-item">
                <div className="trust-proof-badge-inner">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    >
                      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594zM20 2v4m2-2h-4"></path>
                      <circle cx="4" cy="20" r="2"></circle>
                    </g>
                  </svg>
                  <span className="trust-proof-badge-name">Daily Spark</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="how-to-order">
          <div className="how-to-order-container">
            <div className="how-to-order-header">
              <h2 className="section-title">Your Perfect Bag in 3 Steps</h2>
              <p className="section-content">
                Discover your next favorite beans, place your order, and let us
                ship coffee joy straight to your door.
              </p>
            </div>
            <div className="how-to-order-steps">
              <div className="how-to-order-step">
                <div className="how-to-order-number">
                  <span>1</span>
                </div>
                <div className="how-to-order-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    >
                      <path d="M4 19a2 2 0 1 0 4 0a2 2 0 1 0-4 0m11 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"></path>
                      <path d="M17 17H6V3H4"></path>
                      <path d="m6 5l14 1l-1 7H6"></path>
                    </g>
                  </svg>
                </div>
                <h3 className="how-to-order-title">Choose Your Roast</h3>
                <p className="how-to-order-desc">
                  Explore our signature beans, compare tasting notes, and pick
                  the roast that matches your mood.
                </p>
              </div>
              <div className="how-to-order-connector"></div>
              <div className="how-to-order-step">
                <div className="how-to-order-number">
                  <span>2</span>
                </div>
                <div className="how-to-order-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    >
                      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594zM20 2v4m2-2h-4"></path>
                      <circle cx="4" cy="20" r="2"></circle>
                    </g>
                  </svg>
                </div>
                <h3 className="how-to-order-title">Add to Cart</h3>
                <p className="how-to-order-desc">
                  Build your order in seconds with our favorite coffees,
                  polished product pages, and a checkout flow that feels easy.
                </p>
              </div>
              <div className="how-to-order-connector"></div>
              <div className="how-to-order-step">
                <div className="how-to-order-number">
                  <span>3</span>
                </div>
                <div className="how-to-order-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    >
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </g>
                  </svg>
                </div>
                <h3 className="how-to-order-title">Fast Home Delivery</h3>
                <p className="how-to-order-desc">
                  We roast, pack, and ship your coffee directly to you, so your
                  next great brew arrives ready for the grinder.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="rewards-teaser">
          <div className="rewards-teaser-container">
            <div className="rewards-teaser-card">
              <div className="rewards-teaser-visual">
                <img
                  src="https://images.pexels.com/photos/2456429/pexels-photo-2456429.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=1500"
                  alt="Rewards Drinks"
                  className="rewards-teaser-img"
                />
                <div className="rewards-teaser-badge">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"
                    ></path>
                  </svg>
                  <span>Join Now</span>
                </div>
              </div>
              <div className="rewards-teaser-content">
                <h2 className="section-title">Earn Sips While You Shop</h2>
                <p className="section-content">
                  Join Cocoa Mocha Rewards and unlock exclusive perks, free
                  birthday drinks, and points on every dollar spent. Your
                  loyalty deserves to be delicious!
                </p>
                <div className="rewards-teaser-perks">
                  <div className="rewards-teaser-perk">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="m9 12l2 2l4-4"></path>
                      </g>
                    </svg>
                    <span>Free Drink on Signup</span>
                  </div>
                  <div className="rewards-teaser-perk">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="m9 12l2 2l4-4"></path>
                      </g>
                    </svg>
                    <span>Skip the Line with Mobile Orders</span>
                  </div>
                  <div className="rewards-teaser-perk">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="m9 12l2 2l4-4"></path>
                      </g>
                    </svg>
                    <span>Double Points Days</span>
                  </div>
                </div>
                <div
                  ref={rewardsBubbleRef}
                  className="rewards-teaser-cta-wrap"
                >
                  <button
                    type="button"
                    className="btn btn-accent btn-xl rewards-teaser-trigger"
                    aria-expanded={isRewardsBubbleOpen}
                    aria-controls="rewardsBubble"
                    onClick={toggleRewardsBubble}
                  >
                    <span>Join Rewards &amp; Order</span>
                  </button>
                  {isRewardsBubbleOpen ? (
                    <div
                      id="rewardsBubble"
                      className={`rewards-bubble${
                        isRewardsBubbleClosing ? ' rewards-bubble--closing' : ''
                      }`}
                      role="dialog"
                      aria-label="Rewards signup"
                    >
                      {showRewardsCelebration ? (
                        <div
                          className="rewards-bubble-celebration"
                          aria-hidden="true"
                        >
                          <span className="rewards-bubble-orb rewards-bubble-orb--1"></span>
                          <span className="rewards-bubble-orb rewards-bubble-orb--2"></span>
                          <span className="rewards-bubble-orb rewards-bubble-orb--3"></span>
                          <span className="rewards-bubble-orb rewards-bubble-orb--4"></span>
                          <span className="rewards-bubble-orb rewards-bubble-orb--5"></span>
                          <span className="rewards-bubble-spark rewards-bubble-spark--1">
                            reward unlocked
                          </span>
                          <span className="rewards-bubble-spark rewards-bubble-spark--2">
                            cocoa club
                          </span>
                        </div>
                      ) : null}
                      <div className="rewards-bubble-header">
                        <div>
                          <span className="rewards-bubble-kicker">
                            Rewards Access
                          </span>
                          <h3 className="rewards-bubble-title">
                            Drop your email and unlock a reward.
                          </h3>
                          <p className="rewards-bubble-copy">
                            Join the list for sweet perks, fresh updates, and a
                            little coffee love in your inbox.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="rewards-bubble-close"
                          aria-label="Close rewards signup"
                          onClick={() => {
                            closeRewardsBubble()
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <form
                        className="rewards-bubble-form"
                        onSubmit={handleRewardsSubmit}
                      >
                        <label
                          htmlFor="rewardsEmail"
                          className="rewards-bubble-label"
                        >
                          Email address
                        </label>
                        <input
                          id="rewardsEmail"
                          type="email"
                          placeholder="you@example.com"
                          className="rewards-bubble-input"
                          value={rewardsEmail}
                          onChange={(event) => setRewardsEmail(event.target.value)}
                          disabled={isRewardsSubmitting}
                        />
                        <button
                          type="submit"
                          className="btn btn-primary rewards-bubble-submit"
                          disabled={isRewardsSubmitting}
                        >
                          {isRewardsSubmitting ? 'Saving...' : 'Claim My Reward'}
                        </button>
                        {rewardsStatus.message ? (
                          <p
                            className={`rewards-bubble-status rewards-bubble-status--${rewardsStatus.type || 'info'}`}
                          >
                            {rewardsStatus.message}
                          </p>
                        ) : null}
                      </form>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="home-container2">
          <div className="home-container3">
            <Script
              html={`<style>
        @keyframes bounce {0%,100% {transform: translateY(0);}
50% {transform: translateY(-10px);}}
        </style> `}
            ></Script>
          </div>
        </div>
        <div className="home-container4">
          <div className="home-container5">
            <Script
              html={`<script defer data-name="cocoa-mocha-interactions">
(function(){
  const rail = document.getElementById("drinksRail")
  let isDown = false
  let startX
  let scrollLeft

  if (rail) {
    rail.addEventListener("mousedown", (e) => {
      isDown = true
      rail.classList.add("active")
      startX = e.pageX - rail.offsetLeft
      scrollLeft = rail.scrollLeft
    })

    rail.addEventListener("mouseleave", () => {
      isDown = false
      rail.classList.remove("active")
    })

    rail.addEventListener("mouseup", () => {
      isDown = false
      rail.classList.remove("active")
    })

    rail.addEventListener("mousemove", (e) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - rail.offsetLeft
      const walk = (x - startX) * 2
      rail.scrollLeft = scrollLeft - walk
    })
  }

  const exploreItems = document.querySelectorAll(".quick-explore-item")
  exploreItems.forEach((item) => {
    item.addEventListener("click", () => {
      const label = item.querySelector(".quick-explore-label").textContent
      console.log(\`Filtering for: \${label}\`)
      item.style.transform = "scale(0.95)"
      setTimeout(() => {
        item.style.transform = ""
      }, 150)
    })
  })

  const observerOptions = {
    threshold: 0.1,
  }

  const revealOnScroll = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  document.querySelectorAll(".featured-drinks-card, .quick-explore-item, .trust-proof-card, .how-to-order-step").forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(20px)"
    el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out"
    revealOnScroll.observe(el)
  })
})()
</script>`}
            ></Script>
          </div>
        </div>
        <Footer></Footer>
      </div>
      <style jsx>
        {`
          .home-container1 {
            width: 100%;
            min-height: 100vh;
          }
          .home-thq-welcome-hero-highlight-elm {
            color: var(--color-accent);
            display: inline-block;
            position: relative;
          }
          .home-container2 {
            display: none;
          }
          .home-container3 {
            display: contents;
          }
          .home-container4 {
            display: none;
          }
          .home-container5 {
            display: contents;
          }
          .home-container6 {
            right: 50px;
            border: 1px solid #ffffff5c;
            bottom: 30px;
            display: flex;
            z-index: 22;
            position: fixed;
            box-shadow: 5px 5px 10px 0px rgba(31, 31, 31, 0.4);
            min-height: auto;
            align-items: center;
            padding-top: 8px;
            padding-left: 12px;
            border-radius: 8px;
            padding-right: 12px;
            padding-bottom: 8px;
            backdrop-filter: blur(6px);
            background-color: rgba(41, 41, 41, 0.41);
          }
          .home-icon219 {
            width: 24px;
            margin-right: 4px;
          }
          .home-text27 {
            color: white;
            font-size: 13px;
            font-style: normal;
            font-weight: 500;
            line-height: 24px;
          }
          .featured-drinks-source {
            margin-top: 0.75rem;
            color: var(--color-on-surface-secondary);
          }
          .rewards-bubble-status {
            margin: 0;
            font-size: 0.92rem;
            line-height: 1.45;
          }
          .rewards-bubble {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
            transition:
              opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 520ms cubic-bezier(0.22, 1, 0.36, 1),
              filter 520ms cubic-bezier(0.22, 1, 0.36, 1);
            will-change: opacity, transform, filter;
          }
          .rewards-bubble--closing {
            opacity: 0;
            filter: blur(6px);
            transform: translateY(-10px) scale(0.985);
            pointer-events: none;
          }
          .rewards-bubble-status--success {
            color: #8e4c24;
            font-weight: 700;
          }
          .rewards-bubble-status--error {
            color: #b23a2a;
          }
          .rewards-bubble-celebration {
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            position: absolute;
            border-radius: 28px;
          }
          .rewards-bubble-orb {
            opacity: 0;
            position: absolute;
            border-radius: 999px;
            animation: rewardsFloatUp 2.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            background: radial-gradient(circle at 30% 30%, rgba(255, 248, 239, 0.95), rgba(240, 170, 110, 0.72));
            box-shadow: 0 10px 26px rgba(143, 76, 36, 0.2);
            will-change: transform, opacity;
          }
          .rewards-bubble-orb--1 {
            left: 12%;
            bottom: 14%;
            width: 14px;
            height: 14px;
            animation-delay: 0s;
          }
          .rewards-bubble-orb--2 {
            left: 26%;
            bottom: 6%;
            width: 10px;
            height: 10px;
            animation-delay: 0.12s;
          }
          .rewards-bubble-orb--3 {
            right: 18%;
            bottom: 12%;
            width: 16px;
            height: 16px;
            animation-delay: 0.2s;
          }
          .rewards-bubble-orb--4 {
            right: 8%;
            bottom: 22%;
            width: 12px;
            height: 12px;
            animation-delay: 0.08s;
          }
          .rewards-bubble-orb--5 {
            left: 48%;
            bottom: 18%;
            width: 9px;
            height: 9px;
            animation-delay: 0.18s;
          }
          .rewards-bubble-spark {
            opacity: 0;
            position: absolute;
            padding: 0.35rem 0.7rem;
            border-radius: 999px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            font-size: 0.68rem;
            font-weight: 800;
            color: #8e4c24;
            background: rgba(255, 248, 239, 0.92);
            box-shadow: 0 12px 28px rgba(122, 67, 32, 0.12);
            animation: rewardsSparkle 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            will-change: transform, opacity;
          }
          .rewards-bubble-spark--1 {
            top: 16%;
            left: 9%;
          }
          .rewards-bubble-spark--2 {
            top: 28%;
            right: 10%;
            animation-delay: 0.12s;
          }
          @keyframes rewardsFloatUp {
            0% {
              opacity: 0;
              transform: translateY(10px) scale(0.82);
            }
            16% {
              opacity: 0.95;
            }
            68% {
              opacity: 0.92;
            }
            100% {
              opacity: 0;
              transform: translateY(-118px) scale(1.12);
            }
          }
          @keyframes rewardsSparkle {
            0% {
              opacity: 0;
              transform: translateY(10px) scale(0.96);
            }
            18% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            72% {
              opacity: 0.95;
            }
            100% {
              opacity: 0;
              transform: translateY(-28px) scale(1.01);
            }
          }
        `}
      </style>
    </>
  )
}

export default Home

export async function getServerSideProps() {
  const result = await getFeaturedProductsFromMedusa(defaultFeaturedProducts)

  return {
    props: {
      initialFeaturedCoffees: result.products,
      initialCatalogSource: result.source,
    },
  }
}
