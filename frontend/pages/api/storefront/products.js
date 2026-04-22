import {
  getFeaturedProductsFromMedusa,
} from '../../../lib/medusa-storefront'
import { defaultFeaturedProducts } from '../../../lib/default-products'

export default async function handler(req, res) {
  const result = await getFeaturedProductsFromMedusa(defaultFeaturedProducts)
  return res.status(200).json(result)
}
