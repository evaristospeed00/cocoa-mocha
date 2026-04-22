import { getCoffeeSelectorOptions } from '../../../lib/medusa-storefront'

export default async function handler(req, res) {
  try {
    const products = await getCoffeeSelectorOptions()

    res.status(200).json({
      products: products.map((product) => ({
        key: product.key,
        href: product.href,
        title: product.title,
      })),
    })
  } catch (error) {
    res.status(200).json({
      products: [],
    })
  }
}
