"use client"

import { useEffect } from "react"
import { trackViewItem } from "@lib/analytics"
import { HttpTypes } from "@medusajs/types"

export default function ProductAnalyticsTracker({
  product,
  currencyCode,
}: {
  product: HttpTypes.StoreProduct
  currencyCode?: string
}) {
  useEffect(() => {
    if (!product || !product.id) return

    const price =
      product.variants?.[0]?.calculated_price?.calculated_amount ?? 0

    trackViewItem({
      id: product.id,
      title: product.title || "Untitled Product",
      category: product.categories?.[0]?.name,
      price,
      currency: currencyCode?.toUpperCase() || "ZMW",
    })
  }, [product, currencyCode])

  return null
}

