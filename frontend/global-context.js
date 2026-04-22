
import { createContext, useEffect, useMemo, useContext, useRef, useState } from 'react'
import { addCartItem, removeCartItem } from './lib/cart'

const GlobalContext = createContext(null)

export const GlobalProvider = ({ initialLocales, children }) => {
  const [locales, setLocales] = useState(initialLocales ?? [{"name":"English","short":"en"}])
  const [locale, setLocale] = useState({"name":"English","short":"en"})

  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartNotice, setCartNotice] = useState(null)
  const cartNoticeTimerRef = useRef(null)

  const showCartNotice = (product) => {
    if (cartNoticeTimerRef.current) {
      clearTimeout(cartNoticeTimerRef.current)
    }

    setCartNotice({
      id: Date.now(),
      name: product?.name || 'Coffee',
      message: 'Added to cart',
    })

    cartNoticeTimerRef.current = setTimeout(() => {
      setCartNotice(null)
      cartNoticeTimerRef.current = null
    }, 2600)
  }

  const addToCart = (product) => {
    setCart((prevCart) => addCartItem(prevCart, product))
    showCartNotice(product)
  }

  const removeFromCart = (id) => {
    setCart((prevCart) => removeCartItem(prevCart, id))
  }

  const clearCart = () => setCart([])
  const toggleCart = () => setIsCartOpen((prev) => !prev)
  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)
  const dismissCartNotice = () => {
    if (cartNoticeTimerRef.current) {
      clearTimeout(cartNoticeTimerRef.current)
      cartNoticeTimerRef.current = null
    }
    setCartNotice(null)
  }

  useEffect(() => {
    return () => {
      if (cartNoticeTimerRef.current) {
        clearTimeout(cartNoticeTimerRef.current)
      }
    }
  }, [])

  const value = useMemo(() => {
    return {
      locales,
      locale,
      setLocales,
      setLocale,
      cart,
      isCartOpen,
      cartNotice,
      addToCart,
      removeFromCart,
      clearCart,
      toggleCart,
      openCart,
      closeCart,
      dismissCartNotice
    }
  }, [locales, locale, cart, isCartOpen, cartNotice])

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => {
  const context = useContext(GlobalContext)
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider')
  }

  return {
    ...context
  }
}
