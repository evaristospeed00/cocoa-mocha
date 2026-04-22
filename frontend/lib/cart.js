export const addCartItem = (cart, product) => {
  const existingItem = cart.find((item) => item.id === product.id)

  if (existingItem) {
    return cart.map((item) =>
      item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
    )
  }

  return [...cart, { ...product, quantity: 1 }]
}

export const removeCartItem = (cart, id) =>
  cart.reduce((acc, item) => {
    if (item.id === id) {
      if (item.quantity > 1) {
        acc.push({ ...item, quantity: item.quantity - 1 })
      }
    } else {
      acc.push(item)
    }

    return acc
  }, [])

export const getCartItemCount = (cart) =>
  cart.reduce((sum, item) => sum + item.quantity, 0)

export const getCartSubtotal = (cart) =>
  cart.reduce((sum, item) => {
    const price = Number.parseFloat(item.price ?? 0)
    return sum + price * item.quantity
  }, 0)
