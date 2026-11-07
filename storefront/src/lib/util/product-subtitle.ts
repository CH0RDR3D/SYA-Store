import { HttpTypes } from "@medusajs/types"

const shortenDescription = (description?: string | null, limit = 110) => {
  const text = description?.trim()
  if (!text) {
    return undefined
  }

  if (text.length <= limit) {
    return text
  }

  return `${text.slice(0, limit).trimEnd()}...`
}

export const getProductSubtitle = (
  product: HttpTypes.StoreProduct
): string | undefined => {
  if (product.subtitle?.trim()) {
    return product.subtitle
  }

  const categoryName = product.categories?.find((category) => category.name)?.name
  if (categoryName?.trim()) {
    return categoryName
  }

  return shortenDescription(product.description)
}
