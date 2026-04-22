import React, { useEffect, useMemo, useRef, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/router'

import Navigation from '../components/navigation'
import Footer from '../components/footer'
import { useGlobalContext } from '../global-context'
import { getCartItemCount, getCartSubtotal } from '../lib/cart'
import {
  addMedusaLineItem,
  addMedusaShippingMethod,
  completeMedusaCart,
  createMedusaCart,
  createMedusaPaymentCollection,
  fetchMedusaRegions,
  initializeMedusaPaymentSession,
  listMedusaPaymentProviders,
  listMedusaShippingOptions,
  updateMedusaCart,
} from '../lib/medusa-storefront'

const STRIPE_JS_URL = 'https://js.stripe.com/v3/'

const defaultForm = {
  email: '',
  firstName: '',
  lastName: '',
  address1: '',
  city: '',
  postalCode: '',
  countryCode: 'dk',
}

const STRIPE_PROVIDER_ID = 'pp_stripe_stripe'
const PAYMENT_STATUSES_READY_TO_COMPLETE = new Set([
  'succeeded',
  'requires_capture',
])

const formatMoney = (amount, currencyCode = 'usd') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(Number(amount || 0))

const getStripePublishableKey = () =>
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || ''

const getStripeSessionFromCollection = (paymentCollection, providerId) => {
  const paymentSessions = Array.isArray(paymentCollection?.payment_sessions)
    ? paymentCollection.payment_sessions
    : []

  return (
    paymentSessions.find((session) => session.provider_id === providerId) ||
    paymentSessions[0] ||
    null
  )
}

const getStripeClientSecret = (paymentSession) => {
  const data = paymentSession?.data || {}

  return typeof data.client_secret === 'string' ? data.client_secret : ''
}

const buildStripeAppearance = () => ({
  theme: 'stripe',
  variables: {
    colorPrimary: '#159a61',
    colorBackground: '#ffffff',
    colorText: '#2f2018',
    colorDanger: '#b8472a',
    borderRadius: '14px',
    fontFamily:
      'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
})

const cleanStripeReturnQuery = (router) => {
  if (!router?.replace) {
    return Promise.resolve()
  }

  return router.replace('/checkout', undefined, { shallow: true })
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getFriendlyCheckoutError = (message = '') => {
  const normalizedMessage = String(message || '').trim()

  if (!normalizedMessage) {
    return 'Something went wrong while preparing your checkout. Please try again.'
  }

  if (
    normalizedMessage.includes('Backend connection is required') ||
    normalizedMessage.includes('No Medusa region is available')
  ) {
    return 'Checkout is getting ready. Please try again in a moment.'
  }

  if (
    normalizedMessage.includes('Stripe.js is still loading') ||
    normalizedMessage.includes('Stripe.js could not load automatically') ||
    normalizedMessage.includes('Stripe.js could not be downloaded') ||
    normalizedMessage.includes('Stripe.js did not finish loading')
  ) {
    return 'The secure payment form is taking a moment to load. Please try again.'
  }

  if (
    normalizedMessage.includes('Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') ||
    normalizedMessage.includes('Stripe is not enabled')
  ) {
    return 'Online payment is not available right now. Please try again shortly.'
  }

  if (normalizedMessage.includes('One or more cart items are missing')) {
    return 'One of the items in your cart needs a quick refresh before checkout.'
  }

  if (normalizedMessage.includes('Complete the customer and shipping details first')) {
    return 'Please complete your contact and shipping details first.'
  }

  if (normalizedMessage.includes('No shipping options are available')) {
    return 'We could not find a shipping option for that address yet.'
  }

  if (normalizedMessage.includes('A shipping option is required')) {
    return 'Please choose a shipping option to continue.'
  }

  if (normalizedMessage.includes('did not include a client secret')) {
    return 'The secure payment form could not be prepared. Please try again.'
  }

  if (normalizedMessage.includes('could not initialize')) {
    return 'The secure payment form could not start correctly. Please refresh and try again.'
  }

  if (normalizedMessage.includes('could not verify')) {
    return 'We could not verify your payment just yet. Please try again.'
  }

  if (normalizedMessage.includes('could not confirm')) {
    return 'We could not confirm your payment. Please try again.'
  }

  if (normalizedMessage.includes('Medusa could not complete the cart')) {
    return 'Your payment went through, but we could not finish the order just yet. Please contact us right away.'
  }

  return normalizedMessage
}

const Checkout = () => {
  const router = useRouter()
  const { cart, clearCart } = useGlobalContext()
  const paymentElementRef = useRef(null)
  const stripeRef = useRef(null)
  const elementsRef = useRef(null)
  const mountedClientSecretRef = useRef('')
  const completionLockRef = useRef('')
  const stripePublishableKey = getStripePublishableKey()

  const [backendStatus, setBackendStatus] = useState({
    connected: false,
    backendUrl: '',
  })
  const [region, setRegion] = useState(null)
  const [paymentProviderId, setPaymentProviderId] = useState(STRIPE_PROVIDER_ID)
  const [form, setForm] = useState(defaultForm)
  const [isPreparingPayment, setIsPreparingPayment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [paymentMessage, setPaymentMessage] = useState('')
  const [orderResult, setOrderResult] = useState(null)
  const [stripeScriptReady, setStripeScriptReady] = useState(false)
  const [stripeScriptError, setStripeScriptError] = useState('')
  const [stripeElementReady, setStripeElementReady] = useState(false)
  const [preparedCheckout, setPreparedCheckout] = useState(null)
  const [shippingOptions, setShippingOptions] = useState([])
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState('')

  const itemCount = getCartItemCount(cart)
  const subtotal = getCartSubtotal(cart)
  const cartCurrencyCode = cart[0]?.currencyCode || 'usd'
  const canCreateOrder = useMemo(
    () => cart.length > 0 && cart.every((item) => item.variantId),
    [cart]
  )

  useEffect(() => {
    let isMounted = true

    const loadConfig = async () => {
      let config = null

      try {
        const configResponse = await fetch('/api/storefront/config')
        config = await configResponse.json()

        if (!isMounted) {
          return
        }

        setBackendStatus({
          connected: Boolean(config?.connected),
          backendUrl: config?.backendUrl || '',
        })
      } catch (error) {}

      try {
        const regions = await fetchMedusaRegions()
        const defaultRegion = regions[0] || null
        const paymentProviders = defaultRegion
          ? await listMedusaPaymentProviders(defaultRegion.id)
          : []
        const preferredProvider =
          paymentProviders.find((provider) => provider.id === STRIPE_PROVIDER_ID) ||
          paymentProviders[0] ||
          null

        if (!isMounted) {
          return
        }

        setRegion(defaultRegion)
        setPaymentProviderId(preferredProvider?.id || STRIPE_PROVIDER_ID)
        setForm((prev) => ({
          ...prev,
          countryCode:
            defaultRegion?.countries?.[0]?.iso_2?.toLowerCase() || prev.countryCode,
        }))
      } catch (error) {}
    }

    loadConfig()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.Stripe === 'function') {
      setStripeScriptReady(true)
      setStripeScriptError('')
    }
  }, [])

  useEffect(() => {
    return () => {
      if (elementsRef.current) {
        elementsRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const shouldHandleReturn =
      router.isReady &&
      stripeScriptReady &&
      stripePublishableKey &&
      typeof window !== 'undefined' &&
      typeof window.Stripe === 'function' &&
      typeof router.query.cart_id === 'string' &&
      typeof router.query.payment_intent_client_secret === 'string'

    if (!shouldHandleReturn) {
      return
    }

    const handleReturnFromStripe = async () => {
      const cartId = router.query.cart_id
      const clientSecret = router.query.payment_intent_client_secret
      const completionKey = `${cartId}:${clientSecret}`

      if (completionLockRef.current === completionKey) {
        return
      }

      completionLockRef.current = completionKey
      setIsSubmitting(true)
      setPaymentMessage('Checking your payment...')
      setCheckoutError('')

      try {
        stripeRef.current =
          stripeRef.current || window.Stripe(stripePublishableKey)

        const { paymentIntent, error } =
          await stripeRef.current.retrievePaymentIntent(clientSecret)

        if (error) {
          throw new Error(error.message || 'We could not verify your payment.')
        }

        if (!paymentIntent) {
          throw new Error('We could not verify your payment just yet.')
        }

        if (!PAYMENT_STATUSES_READY_TO_COMPLETE.has(paymentIntent.status)) {
          setPaymentMessage(
            paymentIntent.status === 'requires_payment_method'
              ? 'Your payment was not completed. Please try another card.'
              : 'Your payment is still processing.'
          )
          await cleanStripeReturnQuery(router)
          return
        }

        await finalizeMedusaOrder(cartId)
        await cleanStripeReturnQuery(router)
      } catch (error) {
        setCheckoutError(
          getFriendlyCheckoutError(
            error?.message || 'We could not finalize your Stripe payment.'
          )
        )
      } finally {
        setIsSubmitting(false)
      }
    }

    handleReturnFromStripe()
  }, [router, stripePublishableKey, stripeScriptReady])

  const resetStripeElement = () => {
    if (paymentElementRef.current) {
      paymentElementRef.current.innerHTML = ''
    }

    elementsRef.current = null
    mountedClientSecretRef.current = ''
    setStripeElementReady(false)
  }

  const resetPreparedCheckout = () => {
    resetStripeElement()
    setPreparedCheckout(null)
    setPaymentMessage('')
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setCheckoutError('')
    setOrderResult(null)
    resetPreparedCheckout()
    setShippingOptions([])
    setSelectedShippingOptionId('')
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateCheckoutDetails = () => {
    if (!backendStatus.connected) {
      return 'Checkout is getting ready. Please try again in a moment.'
    }

    if (!region?.id) {
      return 'No Medusa region is available for checkout yet.'
    }

    if (!canCreateOrder) {
      return 'One or more cart items are missing their Medusa variant mapping.'
    }

    if (!stripePublishableKey) {
      return 'Online payment is not available right now. Please try again shortly.'
    }

    if (!stripeScriptReady) {
      return 'The secure payment form is taking a moment to load. Please try again.'
    }

    if (paymentProviderId !== STRIPE_PROVIDER_ID) {
      return 'Online payment is not available right now. Please try again shortly.'
    }

    if (
      !form.email.trim() ||
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.address1.trim() ||
      !form.city.trim() ||
      !form.postalCode.trim() ||
      !form.countryCode.trim()
    ) {
      return 'Complete the customer and shipping details first.'
    }

    return ''
  }

  const prepareMedusaCart = async () => {
    const createdCart = await createMedusaCart(region.id)

    for (const item of cart) {
      await addMedusaLineItem(createdCart.id, {
        variant_id: item.variantId,
        quantity: item.quantity,
      })
    }

    await updateMedusaCart(createdCart.id, {
      email: form.email.trim(),
      shipping_address: {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        address_1: form.address1.trim(),
        city: form.city.trim(),
        postal_code: form.postalCode.trim(),
        country_code: form.countryCode.trim().toLowerCase(),
      },
      billing_address: {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        address_1: form.address1.trim(),
        city: form.city.trim(),
        postal_code: form.postalCode.trim(),
        country_code: form.countryCode.trim().toLowerCase(),
      },
    })

    return createdCart
  }

  const ensureStripeJsReady = async () => {
    if (typeof window === 'undefined') {
      throw new Error('Stripe can only load in the browser.')
    }

    if (typeof window.Stripe === 'function') {
      setStripeScriptReady(true)
      setStripeScriptError('')
      return window.Stripe
    }

    const existingScript = document.querySelector(
      `script[src="${STRIPE_JS_URL}"]`
    )

    if (!existingScript) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = STRIPE_JS_URL
        script.async = true
        script.onload = resolve
        script.onerror = () =>
          reject(new Error('Stripe.js could not be downloaded in this browser.'))
        document.head.appendChild(script)
      })
    } else if (!stripeScriptReady) {
      await wait(300)
    }

    if (typeof window.Stripe !== 'function') {
      throw new Error(
        'Stripe.js did not finish loading. Disable blockers and reload the page.'
      )
    }

    setStripeScriptReady(true)
    setStripeScriptError('')
    return window.Stripe
  }

  const mountStripePaymentElement = async (clientSecret) => {
    if (
      !clientSecret ||
      !paymentElementRef.current ||
      typeof window === 'undefined'
    ) {
      return
    }

    const stripeFactory = await ensureStripeJsReady()

    stripeRef.current = stripeRef.current || stripeFactory(stripePublishableKey)

    if (!stripeRef.current) {
      throw new Error('Stripe could not initialize in the browser.')
    }

    resetStripeElement()

    elementsRef.current = stripeRef.current.elements({
      clientSecret,
      appearance: buildStripeAppearance(),
    })

    const paymentElement = elementsRef.current.create('payment', {
      layout: 'tabs',
    })

    paymentElement.on('ready', () => setStripeElementReady(true))
    paymentElement.mount(paymentElementRef.current)
    mountedClientSecretRef.current = clientSecret
  }

  const finalizeMedusaOrder = async (cartId) => {
    const completion = await completeMedusaCart(cartId)

    if (completion?.type !== 'order' || !completion?.order) {
      throw new Error('Medusa could not complete the cart after Stripe payment.')
    }

    setOrderResult(completion.order)
    clearCart()
    resetPreparedCheckout()
    setShippingOptions([])
    setSelectedShippingOptionId('')
    setForm(defaultForm)
    setPaymentMessage('Payment approved. Your Cocoa Mocha order is confirmed.')
  }

  const handlePreparePayment = async () => {
    try {
      await ensureStripeJsReady()
    } catch (error) {
      setCheckoutError(
        getFriendlyCheckoutError(error?.message || 'Stripe.js could not be loaded.')
      )
      return
    }

    const validationError = validateCheckoutDetails()

    if (validationError) {
      setCheckoutError(getFriendlyCheckoutError(validationError))
      return
    }

    setIsPreparingPayment(true)
    setCheckoutError('')
    setPaymentMessage('')
    setOrderResult(null)

    try {
      const medusaCart = await prepareMedusaCart()
      const availableShippingOptions = await listMedusaShippingOptions(medusaCart.id)

      if (availableShippingOptions.length === 0) {
        throw new Error('No shipping options are available for this address.')
      }

      setShippingOptions(availableShippingOptions)

      const shippingOptionId =
        selectedShippingOptionId || availableShippingOptions[0]?.id

      if (!shippingOptionId) {
        throw new Error('A shipping option is required before payment.')
      }

      setSelectedShippingOptionId(shippingOptionId)

      await addMedusaShippingMethod(medusaCart.id, shippingOptionId)

      const paymentCollection = await createMedusaPaymentCollection(medusaCart.id)

      if (!paymentCollection?.id) {
        throw new Error('Medusa did not return a payment collection.')
      }

      const initializedCollection = await initializeMedusaPaymentSession(
        paymentCollection.id,
        STRIPE_PROVIDER_ID,
        {
          capture_method: 'automatic',
          automatic_payment_methods: {
            enabled: true,
          },
        }
      )

      const paymentSession = getStripeSessionFromCollection(
        initializedCollection,
        STRIPE_PROVIDER_ID
      )
      const clientSecret = getStripeClientSecret(paymentSession)

      if (!clientSecret) {
        throw new Error('Medusa Stripe session did not include a client secret.')
      }

      setPreparedCheckout({
        cartId: medusaCart.id,
        paymentCollectionId: paymentCollection.id,
        clientSecret,
      })

      await mountStripePaymentElement(clientSecret)
      setPaymentMessage('Your secure payment form is ready.')
    } catch (error) {
      const rawMessage = String(error?.message || '')
      const parsedMessage = rawMessage.includes('"message":"')
        ? rawMessage.split('"message":"')[1]?.split('"')[0]
        : rawMessage

      setCheckoutError(
        getFriendlyCheckoutError(
          parsedMessage || 'Something went wrong while preparing Stripe payment.'
        )
      )
      resetPreparedCheckout()
    } finally {
      setIsPreparingPayment(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (!preparedCheckout?.cartId || !elementsRef.current || !stripeRef.current) {
      setCheckoutError('Please continue to the payment form before placing your order.')
      return
    }

    setIsSubmitting(true)
    setCheckoutError('')
    setPaymentMessage('Placing your order...')

    try {
      const { error, paymentIntent } = await stripeRef.current.confirmPayment({
        elements: elementsRef.current,
        confirmParams: {
          return_url: `${window.location.origin}/checkout?cart_id=${preparedCheckout.cartId}`,
        },
        redirect: 'if_required',
      })

      if (error) {
        throw new Error(error.message || 'We could not confirm your payment.')
      }

      if (!paymentIntent) {
        throw new Error('We could not confirm your payment just yet.')
      }

      if (!PAYMENT_STATUSES_READY_TO_COMPLETE.has(paymentIntent.status)) {
        setPaymentMessage('Your payment is still processing.')
        return
      }

      await finalizeMedusaOrder(preparedCheckout.cartId)
    } catch (error) {
      setCheckoutError(
        getFriendlyCheckoutError(
          error?.message || 'Something went wrong while confirming the payment.'
        )
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Script
        src={STRIPE_JS_URL}
        strategy="afterInteractive"
        onLoad={() => {
          setStripeScriptReady(true)
          setStripeScriptError('')
        }}
        onError={() => {
          setStripeScriptReady(false)
          setStripeScriptError(
            'Stripe.js could not load automatically. We will retry when you prepare payment.'
          )
        }}
      />
      <div className="checkout-container">
        <Head>
          <title>Checkout - Cocoa Mocha</title>
          <meta property="og:title" content="Checkout - Cocoa Mocha" />
        </Head>
        <Navigation></Navigation>
        <section className="checkout-hero">
          <div className="checkout-shell">
            <div className="checkout-copy">
              <span className="checkout-kicker">Checkout</span>
              <h1 className="hero-title">Almost coffee time.</h1>
              <p className="hero-subtitle">
                Finish your Cocoa Mocha order with a smooth, secure checkout.
                Add your details, choose shipping, and place your order when you
                are ready.
              </p>
              <div className="checkout-trust-row">
                <div className="checkout-status">
                  <span className="checkout-status-dot"></span>
                  <span>Secure checkout</span>
                </div>
                <div className="checkout-status">
                  <span className="checkout-status-dot"></span>
                  <span>Roasted with joy</span>
                </div>
              </div>
              {stripeScriptError ? (
                <div className="checkout-status checkout-status-warning">
                  <span>{getFriendlyCheckoutError(stripeScriptError)}</span>
                </div>
              ) : null}
            </div>
            <div className="checkout-card">
              <div className="checkout-card-top">
                <div>
                  <span className="checkout-eyebrow">Order Summary</span>
                  <h2 className="section-title">Your Cocoa Mocha order</h2>
                </div>
                <span className="checkout-pill">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="checkout-empty">
                  <span className="checkout-empty-icon">Coffee</span>
                  <p>
                    {orderResult
                      ? `Order #${orderResult.display_id} is confirmed for ${orderResult.email}.`
                      : 'Your cart is empty right now.'}
                  </p>
                  <Link href="/" legacyBehavior>
                    <a className="btn btn-primary btn-lg">Browse the menu</a>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="checkout-list">
                    {cart.map((item) => (
                      <div key={item.id} className="checkout-item">
                        <div>
                          <strong>{item.name}</strong>
                          <span>
                            {item.quantity} x{' '}
                            {formatMoney(item.price, item.currencyCode)}
                          </span>
                          {item.variantTitle ? (
                            <small className="checkout-item-meta">
                              {item.variantTitle}
                            </small>
                          ) : null}
                        </div>
                        <span className="checkout-line-total">
                          {formatMoney(
                            item.quantity * Number.parseFloat(item.price),
                            item.currencyCode
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="checkout-form">
                    <div className="checkout-form-grid">
                      <label className="checkout-field">
                        <span>Email Address</span>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleInputChange}
                          placeholder="customer@example.com"
                        />
                      </label>
                      <label className="checkout-field">
                        <span>Country Code</span>
                        <input
                          name="countryCode"
                          value={form.countryCode}
                          onChange={handleInputChange}
                          placeholder="dk"
                        />
                      </label>
                      <label className="checkout-field">
                        <span>First Name</span>
                        <input
                          name="firstName"
                          value={form.firstName}
                          onChange={handleInputChange}
                          placeholder="Jane"
                        />
                      </label>
                      <label className="checkout-field">
                        <span>Last Name</span>
                        <input
                          name="lastName"
                          value={form.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe"
                        />
                      </label>
                      <label className="checkout-field checkout-field-wide">
                        <span>Street Address</span>
                        <input
                          name="address1"
                          value={form.address1}
                          onChange={handleInputChange}
                          placeholder="123 Test Street"
                        />
                      </label>
                      <label className="checkout-field">
                        <span>City</span>
                        <input
                          name="city"
                          value={form.city}
                          onChange={handleInputChange}
                          placeholder="Copenhagen"
                        />
                      </label>
                      <label className="checkout-field">
                        <span>Postal Code</span>
                        <input
                          name="postalCode"
                          value={form.postalCode}
                          onChange={handleInputChange}
                          placeholder="2100"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="checkout-totals">
                    <div className="checkout-total-row">
                      <span>Subtotal</span>
                      <strong>{formatMoney(subtotal, cartCurrencyCode)}</strong>
                    </div>
                    <div className="checkout-total-row checkout-total-row-muted">
                      <span>Checkout</span>
                      <span>Secure card payment</span>
                    </div>
                    {shippingOptions.length > 0 ? (
                      <div className="checkout-shipping-options">
                        <span className="checkout-shipping-title">Choose shipping</span>
                        {shippingOptions.map((option) => (
                          <label key={option.id} className="checkout-shipping-option">
                            <input
                              type="radio"
                              name="shippingOption"
                              value={option.id}
                              checked={selectedShippingOptionId === option.id}
                              onChange={(event) => {
                                setSelectedShippingOptionId(event.target.value)
                                resetPreparedCheckout()
                              }}
                            />
                            <span>
                              {option.name} -{' '}
                              {formatMoney(
                                option.amount ?? option.calculated_price?.calculated_amount,
                                option.calculated_price?.currency_code || cartCurrencyCode
                              )}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="checkout-payment-panel">
                    <div className="checkout-payment-header">
                      <span className="checkout-shipping-title">Payment</span>
                      <span className="checkout-payment-badge">
                        {preparedCheckout ? 'Card form ready' : 'Ready when you are'}
                      </span>
                    </div>
                    <p className="checkout-payment-copy">
                      {preparedCheckout
                        ? 'Enter your card details below to complete your order securely.'
                        : 'Continue when you are ready and we will open the secure payment form.'}
                    </p>
                    <div
                      ref={paymentElementRef}
                      className={`checkout-stripe-element${
                        stripeElementReady ? ' checkout-stripe-element-ready' : ''
                      }`}
                    ></div>
                  </div>

                  {checkoutError ? (
                    <div className="checkout-feedback checkout-feedback-error">
                      {checkoutError}
                    </div>
                  ) : null}

                  {paymentMessage ? (
                    <div className="checkout-feedback checkout-feedback-info">
                      {paymentMessage}
                    </div>
                  ) : null}

                  {orderResult ? (
                    <div className="checkout-feedback checkout-feedback-success">
                      Order #{orderResult.display_id} is confirmed for {orderResult.email}.
                    </div>
                  ) : null}

                  {!preparedCheckout ? (
                    <button
                      type="button"
                      className="checkout-pay-btn btn btn-xl"
                      disabled={isPreparingPayment || !canCreateOrder}
                      onClick={handlePreparePayment}
                    >
                      {isPreparingPayment
                        ? 'Opening Payment Form...'
                        : 'Continue to Payment'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="checkout-pay-btn btn btn-xl"
                      disabled={isSubmitting || !stripeElementReady}
                      onClick={handleConfirmPayment}
                    >
                      {isSubmitting ? 'Placing Your Order...' : 'Place Order'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
        <Footer></Footer>
      </div>
      <style jsx>{`
        .checkout-container {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(255, 187, 120, 0.22), transparent 30%),
            radial-gradient(circle at bottom right, rgba(49, 207, 130, 0.16), transparent 28%),
            linear-gradient(180deg, #fffaf4 0%, #fff4e8 100%);
        }
        .checkout-hero {
          padding: 8rem 1.5rem 5rem;
        }
        .checkout-shell {
          gap: 2rem;
          display: grid;
          max-width: 1180px;
          margin: 0 auto;
          align-items: start;
          grid-template-columns: 1.1fr 0.9fr;
        }
        .checkout-kicker {
          color: #17925e;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .checkout-status {
          gap: 0.75rem;
          display: inline-flex;
          margin-top: 1rem;
          padding: 0.9rem 1.2rem;
          border-radius: 999px;
          align-items: center;
          background: rgba(255, 255, 255, 0.7);
          color: var(--color-on-surface);
          border: 1px solid rgba(23, 146, 94, 0.14);
        }
        .checkout-trust-row {
          gap: 0.85rem;
          display: flex;
          flex-wrap: wrap;
          margin-top: 0.4rem;
        }
        .checkout-status-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #31cf82;
          box-shadow: 0 0 0 8px rgba(49, 207, 130, 0.15);
        }
        .checkout-status-warning {
          border-color: rgba(196, 136, 70, 0.18);
          background: rgba(255, 247, 231, 0.92);
          color: #8e5b24;
        }
        .checkout-card {
          padding: 1.6rem;
          border-radius: 28px;
          border: 1px solid rgba(118, 68, 31, 0.12);
          background:
            radial-gradient(circle at top right, rgba(255, 205, 150, 0.28), transparent 32%),
            rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(16px);
          box-shadow: 0 24px 60px rgba(84, 46, 23, 0.14);
        }
        .checkout-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .checkout-eyebrow {
          color: #a35c29;
          display: block;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 0.35rem;
        }
        .checkout-pill {
          padding: 0.7rem 0.95rem;
          border-radius: 999px;
          background: rgba(49, 207, 130, 0.12);
          color: #11774b;
          font-weight: 800;
        }
        .checkout-list {
          gap: 0.9rem;
          display: flex;
          margin-bottom: 1.5rem;
          flex-direction: column;
        }
        .checkout-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.1rem;
          border-radius: 18px;
          background: rgba(255, 250, 244, 0.95);
          border: 1px solid rgba(118, 68, 31, 0.08);
        }
        .checkout-item strong,
        .checkout-line-total {
          color: var(--color-on-surface);
        }
        .checkout-item span {
          display: block;
          margin-top: 0.3rem;
          color: var(--color-on-surface-secondary);
        }
        .checkout-item-meta {
          display: block;
          margin-top: 0.45rem;
          color: #8a674d;
          font-size: 0.72rem;
          word-break: break-all;
        }
        .checkout-form {
          margin-bottom: 1.5rem;
        }
        .checkout-form-grid {
          gap: 0.9rem;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .checkout-field {
          display: flex;
          gap: 0.45rem;
          flex-direction: column;
        }
        .checkout-field span {
          color: var(--color-on-surface);
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .checkout-field input {
          width: 100%;
          border: 1px solid rgba(118, 68, 31, 0.14);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.92);
          padding: 0.9rem 1rem;
        }
        .checkout-field-wide {
          grid-column: 1 / -1;
        }
        .checkout-totals {
          padding-top: 1.2rem;
          border-top: 1px solid rgba(118, 68, 31, 0.12);
        }
        .checkout-total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          color: var(--color-on-surface);
        }
        .checkout-total-row-muted {
          color: var(--color-on-surface-secondary);
        }
        .checkout-shipping-options {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px dashed rgba(118, 68, 31, 0.12);
        }
        .checkout-shipping-title {
          display: block;
          margin-bottom: 0.75rem;
          color: var(--color-on-surface);
          font-weight: 800;
        }
        .checkout-shipping-option {
          gap: 0.65rem;
          display: flex;
          align-items: center;
          margin-bottom: 0.6rem;
          color: var(--color-on-surface-secondary);
        }
        .checkout-payment-panel {
          margin-top: 1.4rem;
          padding: 1rem;
          border-radius: 20px;
          background: rgba(255, 250, 244, 0.85);
          border: 1px solid rgba(118, 68, 31, 0.1);
        }
        .checkout-payment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .checkout-payment-badge {
          padding: 0.45rem 0.7rem;
          border-radius: 999px;
          color: #11774b;
          font-size: 0.72rem;
          font-weight: 800;
          background: rgba(49, 207, 130, 0.12);
        }
        .checkout-payment-copy {
          margin: 0 0 1rem;
          color: var(--color-on-surface-secondary);
        }
        .checkout-stripe-element {
          min-height: 88px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px dashed rgba(118, 68, 31, 0.16);
          padding: 1rem;
        }
        .checkout-stripe-element-ready {
          border-style: solid;
        }
        .checkout-feedback {
          margin-top: 1rem;
          padding: 0.95rem 1rem;
          border-radius: 16px;
          font-weight: 700;
        }
        .checkout-feedback-error {
          color: #842f1f;
          background: rgba(255, 235, 228, 0.92);
          border: 1px solid rgba(196, 88, 58, 0.2);
        }
        .checkout-feedback-success {
          color: #0d6f47;
          background: rgba(236, 255, 244, 0.94);
          border: 1px solid rgba(21, 154, 97, 0.16);
        }
        .checkout-feedback-info {
          color: #205f93;
          background: rgba(234, 245, 255, 0.94);
          border: 1px solid rgba(70, 134, 196, 0.18);
        }
        .checkout-pay-btn {
          width: 100%;
          border: 0;
          color: #f6fff8;
          margin-top: 1rem;
          font-weight: 800;
          background:
            radial-gradient(circle at top left, rgba(180, 255, 213, 0.35), transparent 30%),
            linear-gradient(135deg, #159a61 0%, #31cf82 55%, #0d6f47 100%);
          box-shadow: 0 20px 40px rgba(21, 154, 97, 0.22);
        }
        .checkout-pay-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .checkout-empty {
          display: flex;
          padding: 2rem 1rem;
          text-align: center;
          align-items: center;
          flex-direction: column;
          gap: 1rem;
          border-radius: 20px;
          background: rgba(255, 248, 239, 0.9);
          border: 1px dashed rgba(118, 68, 31, 0.16);
        }
        .checkout-empty-icon {
          font-size: 2rem;
        }
        @media (max-width: 991px) {
          .checkout-shell {
            grid-template-columns: 1fr;
          }
          .checkout-form-grid {
            grid-template-columns: 1fr;
          }
          .checkout-payment-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </>
  )
}

export default Checkout
