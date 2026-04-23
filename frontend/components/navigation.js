import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

import Script from 'dangerous-html/react'
import { useGlobalContext } from '../global-context'
import { getCartItemCount, getCartSubtotal } from '../lib/cart'
import { coffeeSelectorProducts } from '../lib/medusa-storefront'

const Navigation = (props) => {
  const {
    cart,
    isCartOpen,
    cartNotice,
    toggleCart,
    closeCart,
    dismissCartNotice,
    removeFromCart,
    clearCart,
  } = useGlobalContext()
  const cartRef = useRef(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [shopProducts, setShopProducts] = useState(
    coffeeSelectorProducts.map((product) => ({
      key: product.key,
      href: product.href,
      title: product.fallbackTitle,
    }))
  )

  const totalItems = useMemo(() => getCartItemCount(cart), [cart])
  const subtotal = useMemo(() => getCartSubtotal(cart), [cart])

  useEffect(() => {
    let isMounted = true

    const loadShopProducts = async () => {
      try {
        const response = await fetch('/api/storefront/navigation-products')
        const data = await response.json()

        if (!isMounted) {
          return
        }

        if (Array.isArray(data?.products) && data.products.length > 0) {
          setShopProducts(data.products)
        }
      } catch (error) {}
    }

    loadShopProducts()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    shopProducts.forEach((product) => {
      const links = document.querySelectorAll(
        `.navigation-root a[href="${product.href}"]`
      )

      links.forEach((link) => {
        const container = link.querySelector('.dropdown-item, .mobile-shop-item')
        const spans = container?.querySelectorAll('span')
        const titleSpan = spans?.[1]

        if (titleSpan) {
          titleSpan.textContent = product.title
        }
      })
    })
  }, [shopProducts])

  useEffect(() => {
    if (!isCartOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!cartRef.current?.contains(event.target)) {
        closeCart()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeCart()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [closeCart, isCartOpen])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMobileMenuOpen])

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <div className="navigation-container1">
        <div className="navigation-spacer" aria-hidden="true"></div>
        <nav className="navigation-root">
          <div className="navigation-container">
            <div className="navigation-brand-wrapper">
              <Link href="/" legacyBehavior>
                <a>
                  <div
                    aria-label="Cocoa Mocha Home"
                    className="navigation-logo-link"
                  >
                    <div className="navigation-logo-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
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
                    <span className="navigation-brand-name section-title">
                      Cocoa Mocha
                    </span>
                  </div>
                </a>
              </Link>
            </div>
            <div className="navigation-desktop-menu">
              <ul className="navigation-link-list">
                <li className="navigation-link-item">
                  <Link href="/" legacyBehavior>
                    <a>
                      <div className="navigation-link">
                        <span>Home</span>
                      </div>
                    </a>
                  </Link>
                </li>
                <li
                  data-dropdown="shop"
                  className="navigation-link-item navigation-dropdown"
                >
                  <a href="#">
                    <div className="navigation-link navigation-link-shop">
                      <span>Shop</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="navigation-thq-dropdown-chevron-elm dropdown-chevron"
                      >
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                    </div>
                  </a>
                  <ul
                    data-dropdown-menu="shop"
                    className="navigation-thq-dropdown-menu-elm dropdown-menu list"
                  >
                    <li className="list-item">
                      <Link href="/cocoamocha1" legacyBehavior>
                        <a>
                          <div className="navigation-thq-dropdown-item-elm1 dropdown-item">
                            <span className="product-icon">☕</span>
                            <span>
                              {' '}
                              Ethiopian Yirgacheffe Coffee
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: ' ',
                                }}
                              />
                            </span>
                          </div>
                        </a>
                      </Link>
                    </li>
                    <li className="list-item">
                      <Link href="/cocoamocha2" legacyBehavior>
                        <a>
                          <div className="navigation-thq-dropdown-item-elm2 dropdown-item">
                            <span className="product-icon">☕</span>
                            <span>
                              {' '}
                              Colombian Supremo Coffee
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: ' ',
                                }}
                              />
                            </span>
                          </div>
                        </a>
                      </Link>
                    </li>
                    <li className="list-item">
                      <Link href="/cocoamocha3" legacyBehavior>
                        <a>
                          <div className="navigation-thq-dropdown-item-elm3 dropdown-item">
                            <span className="product-icon">☕</span>
                            <span>
                              {' '}
                              Sumatra Mandheling Coffee
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: ' ',
                                }}
                              />
                            </span>
                          </div>
                        </a>
                      </Link>
                    </li>
                    <li className="list-item">
                      <Link href="/cocoamocha4" legacyBehavior>
                        <a>
                          <div className="navigation-thq-dropdown-item-elm4 dropdown-item">
                            <span className="product-icon">☕</span>
                            <span>
                              {' '}
                              Guatemala Antigua Coffee
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: ' ',
                                }}
                              />
                            </span>
                          </div>
                        </a>
                      </Link>
                    </li>
                  </ul>
                </li>
                <li
                  data-dropdown="rewards"
                  className="navigation-link-item navigation-dropdown"
                >
                  <a href="#">
                    <div className="navigation-link navigation-link-shop">
                      <span>Rewards</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="navigation-thq-dropdown-chevron-elm dropdown-chevron"
                      >
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                    </div>
                  </a>
                  <ul
                    data-dropdown-menu="rewards"
                    className="navigation-thq-dropdown-menu-elm navigation-rewards-menu dropdown-menu list"
                  >
                    <li className="list-item">
                      <div className="navigation-rewards-card">
                        <span className="navigation-rewards-badge">
                          Fan Favorite
                        </span>
                        <span className="navigation-rewards-title">
                          Buy 5 handcrafted drinks, get 1 classic brewed coffee free
                        </span>
                        <span className="navigation-rewards-copy">
                          Keeps guests coming back while protecting margin on premium drinks.
                        </span>
                      </div>
                    </li>
                    <li className="list-item">
                      <div className="navigation-rewards-card">
                        <span className="navigation-rewards-badge navigation-rewards-badge--green">
                          Smart Upgrade
                        </span>
                        <span className="navigation-rewards-title">
                          Spend $18 on any visit and unlock 50% off a pastry
                        </span>
                        <span className="navigation-rewards-copy">
                          Encourages bigger tickets without giving away a full item.
                        </span>
                      </div>
                    </li>
                    <li className="list-item">
                      <div className="navigation-rewards-card">
                        <span className="navigation-rewards-badge navigation-rewards-badge--gold">
                          Morning Rush
                        </span>
                        <span className="navigation-rewards-title">
                          Order before 10 AM three times and earn a free flavor add-on
                        </span>
                        <span className="navigation-rewards-copy">
                          Builds habit, boosts volume, and keeps the reward low-cost.
                        </span>
                      </div>
                    </li>
                  </ul>
                </li>
                <li
                  data-dropdown="gift-cards"
                  className="navigation-link-item navigation-dropdown"
                >
                    <a href="#">
                      <div className="navigation-link navigation-link-shop">
                        <span>Gift Cards</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="navigation-thq-dropdown-chevron-elm dropdown-chevron"
                        >
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </div>
                    </a>
                    <ul
                      data-dropdown-menu="gift-cards"
                      className="navigation-thq-dropdown-menu-elm navigation-gift-menu dropdown-menu list"
                    >
                      <li className="list-item">
                        <div className="navigation-gift-card">
                          <span className="navigation-gift-badge">
                            Better Value
                          </span>
                          <span className="navigation-gift-title">
                            Load a $25 gift card and get a $3 bonus for your next visit
                          </span>
                          <span className="navigation-gift-copy">
                            Guests feel rewarded, and you bring them back in for another order.
                          </span>
                        </div>
                      </li>
                      <li className="list-item">
                        <div className="navigation-gift-card">
                          <span className="navigation-gift-badge navigation-gift-badge--pink">
                            Email Capture
                          </span>
                          <span className="navigation-gift-title">
                            Send a digital gift card and unlock a surprise reward by joining the email club
                          </span>
                          <span className="navigation-gift-copy">
                            You grow your list, and the customer gets an extra reason to come back.
                          </span>
                        </div>
                      </li>
                      <li className="list-item">
                        <div className="navigation-gift-card">
                          <span className="navigation-gift-badge navigation-gift-badge--gold">
                            Team Favorite
                          </span>
                          <span className="navigation-gift-title">
                            Buy 2 gift cards and earn a free pastry add-on with your own order
                          </span>
                          <span className="navigation-gift-copy">
                            Encourages gifting while keeping the reward low-cost and high-feel.
                          </span>
                        </div>
                      </li>
                    </ul>
                </li>
                <li className="navigation-link-item">
                  <Link href="/about-us" legacyBehavior>
                    <a>
                      <div className="navigation-link">
                        <span>About Us</span>
                      </div>
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="navigation-actions">
              <div
                ref={cartRef}
                className={`navigation-cart-shell${
                  isCartOpen ? ' is-open' : ''
                }`}
              >
                {cartNotice ? (
                  <div
                    key={cartNotice.id}
                    className="navigation-cart-toast"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="navigation-cart-toast-icon">
                      <span>+</span>
                    </div>
                    <div className="navigation-cart-toast-copy">
                      <span className="navigation-cart-toast-title">
                        {cartNotice.message}
                      </span>
                      <span className="navigation-cart-toast-name">
                        {cartNotice.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="navigation-cart-toast-close"
                      aria-label="Dismiss cart notification"
                      onClick={dismissCartNotice}
                    >
                      ×
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  aria-label="Open shopping cart"
                  aria-expanded={isCartOpen}
                  className="navigation-action-btn navigation-cart-trigger"
                  onClick={toggleCart}
                >
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
                      <path d="M16 10a4 4 0 0 1-8 0M3.103 6.034h17.794"></path>
                      <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"></path>
                    </g>
                  </svg>
                  <span className="navigation-cart-count">{totalItems}</span>
                </button>
                <div className="navigation-cart-panel">
                  <div className="navigation-cart-header">
                    <div>
                      <span className="navigation-cart-eyebrow">Cart</span>
                      <h3 className="navigation-cart-title">Your happy haul</h3>
                    </div>
                    <button
                      type="button"
                      className="navigation-cart-close"
                      aria-label="Close shopping cart"
                      onClick={closeCart}
                    >
                      ×
                    </button>
                  </div>
                  {cart.length === 0 ? (
                    <div className="navigation-cart-empty">
                      <span className="navigation-cart-empty-icon">☕</span>
                      <p>Your cart is waiting for something delicious.</p>
                    </div>
                  ) : (
                    <>
                      <div className="navigation-cart-list">
                        {cart.map((item) => (
                          <div key={item.id} className="navigation-cart-item">
                            <div className="navigation-cart-item-copy">
                              <span className="navigation-cart-item-name">
                                {item.name}
                              </span>
                              <span className="navigation-cart-item-meta">
                                {item.quantity} × $
                                {Number.parseFloat(item.price ?? 0).toFixed(2)}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="navigation-cart-remove"
                              onClick={() => removeFromCart(item.id)}
                            >
                              Remove one
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="navigation-cart-footer">
                        <div className="navigation-cart-subtotal">
                          <span>Subtotal</span>
                          <strong>${subtotal.toFixed(2)}</strong>
                        </div>
                        <div className="navigation-cart-cta-group">
                          <button
                            type="button"
                            className="btn btn-outline navigation-cart-secondary"
                            onClick={clearCart}
                          >
                            Clear cart
                          </button>
                          <Link href="/checkout" legacyBehavior>
                            <a className="btn btn-primary navigation-cart-primary">
                              Checkout
                            </a>
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button
                aria-label="Open Menu"
                aria-controls="mobileOverlay"
                aria-expanded={isMobileMenuOpen}
                className="navigation-mobile-toggle"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
          <div
            id="mobileOverlay"
            className={`navigation-mobile-overlay${
              isMobileMenuOpen ? ' is-active' : ''
            }`}
            aria-hidden={!isMobileMenuOpen}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeMobileMenu()
              }
            }}
          >
            <div className="navigation-overlay-header">
              <div className="navigation-overlay-title-wrap">
                <span className="navigation-overlay-kicker">Quick Menu</span>
                <span className="navigation-overlay-title">Explore Cocoa Mocha</span>
              </div>
              <button
                aria-label="Close Menu"
                className="navigation-mobile-close"
                onClick={closeMobileMenu}
              >
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
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </g>
                </svg>
              </button>
            </div>
            <div className="navigation-overlay-content">
              <ul className="navigation-overlay-links">
                <li className="navigation-overlay-item">
                  <Link href="/" legacyBehavior>
                    <a onClick={closeMobileMenu}>
                      <div className="navigation-overlay-link">
                        <span>Home</span>
                      </div>
                    </a>
                  </Link>
                </li>
                <li className="navigation-overlay-item">
                  <div className="navigation-overlay-link navigation-overlay-link--rewards">
                    <span>Rewards</span>
                    <div className="navigation-mobile-rewards">
                      <span>Buy 5 handcrafted drinks, get 1 classic brewed coffee free.</span>
                      <span>Spend $18 and unlock 50% off a pastry.</span>
                      <span>Three early orders earn a free flavor add-on.</span>
                    </div>
                  </div>
                </li>
                <li className="navigation-overlay-item">
                  <div className="navigation-overlay-link navigation-overlay-link--gift-cards">
                    <span>Gift Cards</span>
                    <div className="navigation-mobile-rewards">
                      <span>Load $25 and get a $3 bounce-back bonus.</span>
                      <span>Send a digital gift card and unlock a surprise email-club reward.</span>
                      <span>Buy 2 gift cards and earn a free pastry add-on.</span>
                    </div>
                  </div>
                </li>
                <li className="navigation-overlay-item list-item">
                  <div className="navigation-thq-navigation-overlay-link-elm5 navigation-overlay-link">
                    <span>Shop</span>
                    <ul className="navigation-thq-mobile-shop-list-elm list">
                      <li className="list-item">
                        <Link href="/cocoamocha1" legacyBehavior>
                          <a onClick={closeMobileMenu}>
                            <div className="navigation-thq-mobile-shop-item-elm1 mobile-shop-item">
                              <span className="product-icon">☕</span>
                              <span>
                                {' '}
                                Ethiopian Yirgacheffe Coffee
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: ' ',
                                  }}
                                />
                              </span>
                            </div>
                          </a>
                        </Link>
                      </li>
                      <li className="list-item">
                        <Link href="/cocoamocha2" legacyBehavior>
                          <a onClick={closeMobileMenu}>
                            <div className="navigation-thq-mobile-shop-item-elm2 mobile-shop-item">
                              <span className="product-icon">☕</span>
                              <span>
                                {' '}
                                Colombian Supremo Coffee
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: ' ',
                                  }}
                                />
                              </span>
                            </div>
                          </a>
                        </Link>
                      </li>
                      <li className="list-item">
                        <Link href="/cocoamocha3" legacyBehavior>
                          <a onClick={closeMobileMenu}>
                            <div className="navigation-thq-mobile-shop-item-elm3 mobile-shop-item">
                              <span className="product-icon">☕</span>
                              <span>
                                {' '}
                                Sumatra Mandheling Coffee
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: ' ',
                                  }}
                                />
                              </span>
                            </div>
                          </a>
                        </Link>
                      </li>
                      <li className="list-item">
                        <Link href="/cocoamocha4" legacyBehavior>
                          <a onClick={closeMobileMenu}>
                            <div className="navigation-thq-mobile-shop-item-elm4 mobile-shop-item">
                              <span className="product-icon">☕</span>
                              <span>
                                {' '}
                                Guatemala Antigua Coffee
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: ' ',
                                  }}
                                />
                              </span>
                            </div>
                          </a>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="navigation-overlay-item">
                  <Link href="/about-us" legacyBehavior>
                    <a onClick={closeMobileMenu}>
                      <div className="navigation-overlay-link">
                        <span>About Us</span>
                      </div>
                    </a>
                  </Link>
                </li>
              </ul>
              <div className="navigation-overlay-footer">
                <Link href="/" legacyBehavior>
                  <a onClick={closeMobileMenu}>
                    <div className="navigation-cta btn btn-primary btn-lg">
                      <span>Order Now</span>
                    </div>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="navigation-container2">
          <div className="navigation-container3">
            <Script
              html={`<style>
@media (prefers-reduced-motion: reduce) {
.navigation-mobile-overlay {
  transition: none;
}
.navigation-link::after {
  transition: none;
}
}
</style>`}
            ></Script>
          </div>
        </div>
        <div className="navigation-container4"></div>
      </div>
      <style jsx>
        {`
          .navigation-container1 {
            display: contents;
          }
          .navigation-spacer {
            width: 100%;
            height: 88px;
            display: block;
          }
          .navigation-thq-dropdown-chevron-elm {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            margin-left: var(--spacing-xs);
          }
          .navigation-thq-dropdown-menu-elm {
            top: 100%;
            left: 0;
            border: 2px solid var(--color-secondary);
            opacity: 0;
            padding: var(--spacing-md) 0;
            z-index: 1001;
            overflow: hidden;
            position: absolute;
            min-width: 280px;
            transform: translateY(-10px) scale(0.95);
            background: var(--color-surface-elevated);
            box-shadow: var(--shadow-level-3);
            list-style: none;
            margin-top: var(--spacing-sm);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            visibility: hidden;
            border-radius: var(--border-radius-card);
          }
          .navigation-root {
            top: 0;
            left: 0;
            right: 0;
            z-index: 1100;
            position: fixed;
            border-bottom: 1px solid rgba(126, 67, 31, 0.08);
            backdrop-filter: blur(14px);
            background: rgba(255, 254, 248, 0.92);
            box-shadow: 0 12px 30px rgba(84, 45, 21, 0.08);
            transition: box-shadow 0.25s ease, background 0.25s ease;
          }
          .navigation-container {
            gap: 24px;
            margin: 0 auto;
            width: 100%;
            display: flex;
            padding: 14px 24px;
            align-items: center;
            max-width: 1320px;
          }
          .navigation-brand-wrapper {
            flex: 0 0 auto;
          }
          .navigation-desktop-menu {
            flex: 1;
            justify-content: center;
          }
          .navigation-link-list {
            gap: 6px;
            width: 100%;
            justify-content: center;
          }
          .navigation-link-item {
            display: flex;
            align-items: center;
          }
          .navigation-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 44px;
            padding: 0.7rem 1rem;
            border-radius: 999px;
            font-size: 0.98rem;
            font-weight: 700;
            letter-spacing: 0.01em;
          }
          .navigation-link:hover {
            background: rgba(255, 255, 255, 0.76);
          }
          .navigation-link::after {
            left: 16px;
            right: 16px;
            width: auto;
            opacity: 0;
            bottom: 8px;
            transform: scaleX(0.4);
            transform-origin: center;
            transition: opacity 0.25s ease, transform 0.25s ease;
          }
          .navigation-link:hover::after {
            width: auto;
            opacity: 1;
            transform: scaleX(1);
          }
          .navigation-link-shop {
            gap: 0.45rem;
          }
          .navigation-actions {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
          }
          .navigation-thq-dropdown-item-elm1 {
            text-decoration: none;
          }
          .navigation-thq-dropdown-item-elm2 {
            text-decoration: none;
          }
          .navigation-thq-dropdown-item-elm3 {
            text-decoration: none;
          }
          .navigation-thq-dropdown-item-elm4 {
            text-decoration: none;
          }
          .navigation-rewards-menu {
            min-width: 360px;
            padding: var(--spacing-md);
          }
          .navigation-gift-menu {
            min-width: 360px;
            padding: var(--spacing-md);
          }
          .navigation-rewards-card {
            display: flex;
            gap: 8px;
            padding: 14px 16px;
            border-radius: 18px;
            flex-direction: column;
            background:
              radial-gradient(circle at top right, rgba(255, 201, 138, 0.2), transparent 34%),
              rgba(255, 250, 243, 0.95);
            border: 1px solid rgba(126, 67, 31, 0.1);
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }
          .navigation-rewards-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 18px 28px rgba(84, 45, 21, 0.12);
          }
          .navigation-rewards-badge {
            width: fit-content;
            padding: 6px 10px;
            border-radius: 999px;
            background: rgba(255, 122, 24, 0.16);
            color: #9b4f1a;
            font-size: 0.72rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .navigation-rewards-badge--green {
            background: rgba(31, 166, 103, 0.14);
            color: #137246;
          }
          .navigation-rewards-badge--gold {
            background: rgba(214, 154, 40, 0.16);
            color: #8f6111;
          }
          .navigation-rewards-title {
            color: var(--color-on-surface);
            font-size: 0.98rem;
            font-weight: 800;
            line-height: 1.35;
          }
          .navigation-rewards-copy {
            color: var(--color-on-surface-secondary);
            font-size: 0.9rem;
            line-height: 1.5;
          }
          .navigation-gift-card {
            display: flex;
            gap: 8px;
            padding: 14px 16px;
            border-radius: 18px;
            flex-direction: column;
            background:
              radial-gradient(circle at top right, rgba(255, 176, 208, 0.18), transparent 34%),
              rgba(255, 248, 243, 0.96);
            border: 1px solid rgba(126, 67, 31, 0.1);
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }
          .navigation-gift-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 18px 28px rgba(84, 45, 21, 0.12);
          }
          .navigation-gift-badge {
            width: fit-content;
            padding: 6px 10px;
            border-radius: 999px;
            background: rgba(255, 122, 24, 0.16);
            color: #9b4f1a;
            font-size: 0.72rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .navigation-gift-badge--pink {
            background: rgba(245, 111, 177, 0.16);
            color: #ad2d68;
          }
          .navigation-gift-badge--gold {
            background: rgba(214, 154, 40, 0.16);
            color: #8f6111;
          }
          .navigation-gift-title {
            color: var(--color-on-surface);
            font-size: 0.98rem;
            font-weight: 800;
            line-height: 1.35;
          }
          .navigation-gift-copy {
            color: var(--color-on-surface-secondary);
            font-size: 0.9rem;
            line-height: 1.5;
          }
          .navigation-thq-dropdown1 {
            cursor: pointer;
            display: inline-block;
            padding: 4px 8px;
            position: relative;
            border-color: rgba(0, 0, 0, 0.45);
            border-style: solid;
            border-width: 1px;
            border-radius: 4px;
          }
          .navigation-thq-dropdown-toggle1 {
            gap: 4px;
            display: inline-flex;
            align-items: center;
          }
          .navigation-thq-dropdown-arrow1 {
            transition: 0.3s;
          }
          .navigation-icon13 {
            width: 18px;
            height: 18px;
          }
          .navigation-thq-dropdown-list1 {
            display: none;
            z-index: 100;
            position: absolute;
            min-width: 100%;
            flex-direction: column;
            list-style-type: none;
          }
          .navigation-thq-navigation-overlay-link-elm5 {
            color: var(--color-secondary) !important;
          }
          .navigation-thq-mobile-shop-list-elm {
            margin: var(--spacing-sm) 0 0 0;
            padding: var(--spacing-md) 0 0 var(--spacing-xl);
            list-style: none;
            border-left: 2px solid var(--color-secondary);
          }
          .navigation-thq-mobile-shop-item-elm1 {
            text-decoration: none;
          }
          .navigation-thq-mobile-shop-item-elm2 {
            text-decoration: none;
          }
          .navigation-thq-mobile-shop-item-elm3 {
            text-decoration: none;
          }
          .navigation-thq-mobile-shop-item-elm4 {
            text-decoration: none;
          }
          .navigation-overlay-link--rewards {
            align-items: flex-start;
            flex-direction: column;
          }
          .navigation-overlay-link--gift-cards {
            align-items: flex-start;
            flex-direction: column;
          }
          .navigation-mobile-rewards {
            display: flex;
            gap: 10px;
            margin-top: 12px;
            color: var(--color-on-surface-secondary);
            font-size: 0.92rem;
            line-height: 1.5;
            flex-direction: column;
            padding-left: 16px;
            border-left: 2px solid var(--color-secondary);
          }
          .navigation-thq-dropdown2 {
            cursor: pointer;
            display: inline-block;
            padding: 4px 8px;
            position: relative;
            border-color: rgba(0, 0, 0, 0.45);
            border-style: solid;
            border-width: 1px;
            border-radius: 4px;
          }
          .navigation-thq-dropdown-toggle2 {
            gap: 4px;
            display: inline-flex;
            align-items: center;
          }
          .navigation-thq-dropdown-arrow2 {
            transition: 0.3s;
          }
          .navigation-icon27 {
            width: 18px;
            height: 18px;
          }
          .navigation-thq-dropdown-list2 {
            display: none;
            z-index: 100;
            position: absolute;
            min-width: 100%;
            flex-direction: column;
            list-style-type: none;
          }
          .navigation-thq-dropdown-list3 {
            display: none;
            z-index: 100;
            position: absolute;
            min-width: 100%;
            flex-direction: column;
            list-style-type: none;
          }
          .navigation-container2 {
            display: none;
          }
          .navigation-cart-shell {
            position: relative;
          }
          .navigation-cart-toast {
            top: 84px;
            right: 22px;
            gap: 12px;
            z-index: 1006;
            display: flex;
            min-width: 280px;
            max-width: 320px;
            padding: 12px 14px;
            position: fixed;
            align-items: center;
            border-radius: 20px;
            border: 1px solid rgba(126, 67, 31, 0.14);
            background:
              radial-gradient(circle at top right, rgba(255, 199, 120, 0.45), transparent 36%),
              linear-gradient(135deg, rgba(255, 250, 244, 0.98), rgba(255, 240, 225, 0.98));
            box-shadow: 0 20px 44px rgba(80, 39, 18, 0.18);
            backdrop-filter: blur(18px);
            pointer-events: auto;
            animation: navigation-toast-in 0.35s ease, navigation-toast-out 0.35s ease 2.25s forwards;
          }
          .navigation-cart-toast::after {
            display: none;
            content: "";
          }
          .navigation-cart-toast-icon {
            width: 38px;
            height: 38px;
            color: #5f2d12;
            display: inline-flex;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            font-size: 1.1rem;
            font-weight: 900;
            background: linear-gradient(135deg, #ffd37f, #ffb258);
            box-shadow: 0 10px 20px rgba(255, 153, 68, 0.28);
          }
          .navigation-cart-toast-copy {
            display: flex;
            min-width: 0;
            flex: 1;
            flex-direction: column;
          }
          .navigation-cart-toast-title {
            color: #8c4f26;
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }
          .navigation-cart-toast-name {
            color: var(--color-on-surface);
            font-size: 0.95rem;
            font-weight: 700;
            line-height: 1.35;
          }
          .navigation-cart-toast-close {
            width: 28px;
            height: 28px;
            border: 0;
            color: #8a5734;
            cursor: pointer;
            flex-shrink: 0;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.55);
            font-size: 1.1rem;
            line-height: 1;
          }
          .navigation-cart-trigger {
            border: 0;
            position: relative;
            cursor: pointer;
          }
          .navigation-cart-count {
            top: -6px;
            right: -8px;
            width: 22px;
            height: 22px;
            display: inline-flex;
            position: absolute;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            background: linear-gradient(135deg, #ff7a18, #ffb347);
            color: #3d1d0c;
            font-size: 0.72rem;
            font-weight: 800;
            box-shadow: 0 10px 18px rgba(255, 122, 24, 0.28);
          }
          .navigation-cart-panel {
            top: calc(100% + 16px);
            right: 0;
            width: min(360px, calc(100vw - 32px));
            opacity: 0;
            padding: 18px;
            z-index: 1005;
            position: absolute;
            pointer-events: none;
            transform: translateY(-10px) scale(0.98);
            transition: opacity 0.25s ease, transform 0.25s ease;
            border-radius: 26px;
            border: 1px solid rgba(126, 67, 31, 0.15);
            background:
              radial-gradient(circle at top right, rgba(255, 200, 135, 0.35), transparent 35%),
              linear-gradient(180deg, rgba(255, 249, 241, 0.98), rgba(255, 244, 232, 0.96));
            box-shadow: 0 28px 60px rgba(72, 37, 18, 0.18);
            backdrop-filter: blur(18px);
          }
          .navigation-cart-shell.is-open .navigation-cart-panel {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0) scale(1);
          }
          .navigation-cart-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 18px;
          }
          .navigation-cart-eyebrow {
            color: #a15a2a;
            display: block;
            font-size: 0.72rem;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .navigation-cart-title {
            margin: 0;
            color: var(--color-on-surface);
            font-size: 1.2rem;
          }
          .navigation-cart-close {
            width: 34px;
            height: 34px;
            border: 0;
            cursor: pointer;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.7);
            color: var(--color-on-surface);
            font-size: 1.5rem;
            line-height: 1;
          }
          .navigation-cart-empty {
            min-height: 180px;
            display: flex;
            padding: 24px;
            text-align: center;
            align-items: center;
            border-radius: 20px;
            justify-content: center;
            flex-direction: column;
            color: var(--color-on-surface-secondary);
            background: rgba(255, 255, 255, 0.55);
            border: 1px dashed rgba(126, 67, 31, 0.2);
          }
          .navigation-cart-empty-icon {
            font-size: 2rem;
            margin-bottom: 10px;
          }
          .navigation-cart-list {
            gap: 12px;
            display: flex;
            max-height: 280px;
            overflow-y: auto;
            margin-bottom: 18px;
            padding-right: 4px;
            flex-direction: column;
          }
          .navigation-cart-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 14px 16px;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.72);
            border: 1px solid rgba(126, 67, 31, 0.08);
          }
          .navigation-cart-item-copy {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .navigation-cart-item-name {
            color: var(--color-on-surface);
            font-weight: 700;
          }
          .navigation-cart-item-meta {
            color: var(--color-on-surface-secondary);
            font-size: 0.9rem;
          }
          .navigation-cart-remove {
            border: 0;
            cursor: pointer;
            padding: 8px 12px;
            white-space: nowrap;
            border-radius: 999px;
            background: rgba(126, 67, 31, 0.08);
            color: #8f4f27;
            font-weight: 700;
          }
          .navigation-cart-footer {
            gap: 14px;
            display: flex;
            flex-direction: column;
          }
          .navigation-cart-subtotal {
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: var(--color-on-surface);
            font-size: 1rem;
          }
          .navigation-cart-cta-group {
            gap: 10px;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
          .navigation-overlay-title-wrap {
            display: flex;
            min-width: 0;
            flex-direction: column;
          }
          .navigation-overlay-kicker {
            color: #a25c2d;
            font-size: 0.74rem;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }
          .navigation-overlay-title {
            color: var(--color-on-surface);
            font-size: 1.1rem;
            font-weight: 800;
            line-height: 1.2;
          }
          .navigation-overlay-item > a,
          .navigation-thq-mobile-shop-list-elm a {
            width: 100%;
            display: block;
          }
          .navigation-overlay-item {
            width: 100%;
          }
          .navigation-cart-secondary,
          .navigation-cart-primary {
            width: 100%;
            justify-content: center;
          }
          @keyframes navigation-toast-in {
            from {
              opacity: 0;
              transform: translateY(-8px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes navigation-toast-out {
            from {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            to {
              opacity: 0;
              transform: translateY(-10px) scale(0.98);
            }
          }
          .navigation-container3 {
            display: contents;
          }
          .navigation-container4 {
            display: none;
          }
          .navigation-container5 {
            display: contents;
          }
          @media (max-width: 1100px) {
            .navigation-spacer {
              height: 82px;
            }
            .navigation-container {
              gap: 18px;
              padding: 12px 18px;
            }
            .navigation-link {
              padding: 0.7rem 0.8rem;
              font-size: 0.93rem;
            }
          }
          @media (max-width: 767px) {
            .navigation-spacer {
              height: 76px;
            }
            .navigation-mobile-overlay {
              display: flex;
              height: 100dvh;
              opacity: 0;
              visibility: hidden;
              pointer-events: none;
              padding: 0;
              transform: none;
              overflow: hidden;
              background:
                linear-gradient(180deg, rgba(62, 28, 12, 0.12), rgba(32, 13, 4, 0.34));
              transition: opacity 0.25s ease, visibility 0.25s ease;
            }
            .navigation-mobile-overlay.is-active {
              opacity: 1;
              visibility: visible;
              pointer-events: auto;
            }
            .navigation-overlay-header,
            .navigation-overlay-content {
              width: min(100%, 32rem);
              max-width: 100%;
              margin-left: auto;
              background:
                radial-gradient(circle at top right, rgba(255, 193, 132, 0.24), transparent 26%),
                linear-gradient(180deg, rgba(255, 251, 244, 0.98), rgba(255, 244, 231, 0.98));
            }
            .navigation-overlay-header {
              border-radius: 30px 0 0 0;
              box-shadow: -14px 0 38px rgba(64, 29, 12, 0.14);
            }
            .navigation-overlay-content {
              min-height: 0;
              border-radius: 0 0 0 30px;
              box-shadow: -14px 18px 38px rgba(64, 29, 12, 0.14);
            }
            .navigation-mobile-toggle {
              width: 46px;
              height: 46px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: 16px;
              background: rgba(255, 248, 239, 0.9);
              border: 1px solid rgba(126, 67, 31, 0.1);
              box-shadow: 0 10px 24px rgba(84, 45, 21, 0.08);
            }
            .navigation-mobile-close {
              width: 44px;
              height: 44px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: 16px;
              background: rgba(255, 255, 255, 0.72);
              border: 1px solid rgba(126, 67, 31, 0.1);
            }
            .navigation-overlay-header {
              padding-top: max(0.9rem, env(safe-area-inset-top));
            }
            .navigation-overlay-content {
              flex: 1 1 auto;
              min-height: 0;
              max-height: calc(100dvh - max(5.25rem, calc(env(safe-area-inset-top) + 4.25rem)));
              overflow-y: auto;
              overscroll-behavior: contain;
              -webkit-overflow-scrolling: touch;
              padding: 1rem 1rem max(1.5rem, env(safe-area-inset-bottom));
            }
            .navigation-overlay-links {
              gap: 0.85rem;
              padding-bottom: 0.35rem;
            }
            .navigation-overlay-link {
              gap: 0.8rem;
              width: 100%;
              display: flex;
              font-size: 1.02rem;
              line-height: 1.25;
              align-items: flex-start;
              padding: 1rem 1.05rem;
              border-radius: 22px;
              justify-content: space-between;
              border: 1px solid rgba(126, 67, 31, 0.12);
              background:
                radial-gradient(circle at top right, rgba(255, 201, 138, 0.16), transparent 38%),
                rgba(255, 255, 255, 0.78);
              box-shadow: 0 14px 32px rgba(84, 45, 21, 0.08);
            }
            .navigation-overlay-link:hover {
              color: var(--color-on-surface);
              transform: none;
            }
            .navigation-thq-navigation-overlay-link-elm5 {
              color: var(--color-on-surface) !important;
            }
            .navigation-thq-mobile-shop-list-elm {
              gap: 0.6rem;
              display: grid;
              width: 100%;
              margin-top: 0.85rem;
              padding: 0;
              border-left: 0;
            }
            .mobile-shop-item {
              gap: 0.7rem;
              display: flex;
              align-items: center;
              width: 100%;
              padding: 0.85rem 0.95rem;
              border-radius: 16px;
              background: rgba(255, 248, 239, 0.96);
              border: 1px solid rgba(126, 67, 31, 0.08);
            }
            .navigation-mobile-rewards {
              gap: 0.55rem;
              width: 100%;
              margin-top: 0.85rem;
              padding-left: 0;
              border-left: 0;
            }
            .navigation-mobile-rewards span {
              display: block;
              padding: 0.75rem 0.9rem;
              border-radius: 16px;
              background: rgba(255, 248, 239, 0.96);
              border: 1px solid rgba(126, 67, 31, 0.08);
            }
            .navigation-overlay-footer {
              padding-top: 1.1rem;
              padding-bottom: 0.75rem;
              margin-top: auto;
            }
            .navigation-cart-toast {
              top: 78px;
              right: 12px;
              min-width: 248px;
              max-width: min(280px, calc(100vw - 24px));
              padding: 11px 12px;
            }
            .navigation-cart-panel {
              position: fixed;
              top: 88px;
              right: 16px;
            }
            .navigation-cart-cta-group {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </>
  )
}

export default Navigation

