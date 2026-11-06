"use client"

import { useEffect, useRef } from "react"
import { trackInitiateCheckout } from "@lib/analytics"
import { getAttributionMetadata } from "@lib/analytics/utm"
import { attachUtmToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"

export default function CheckoutAnalyticsTracker({
  cart,
}: {
  cart: HttpTypes.StoreCart
}) {
  const tracked = useRef(false)

  useEffect(() => {
    if (!cart || tracked.current) return
    tracked.current = true

    const items = (cart.items || []).map((i) => ({
      item_id: i.variant_id || i.id,
      item_name: i.title || "",
      price: i.unit_price ?? 0,
      quantity: i.quantity,
    }))

    // 1. Track Initiate Checkout Event
    trackInitiateCheckout({
      cartId: cart.id,
      currency: cart.currency_code?.toUpperCase() || "ZMW",
      value: cart.total ?? 0,
      items,
    })

    // 2. Attach UTM Attribution metadata to Cart if not already stored
    if (!cart.metadata?.traffic_source) {
      const attribution = getAttributionMetadata()
      if (attribution && Object.keys(attribution).length > 0) {
        attachUtmToCart(attribution)
      }
    }
  }, [cart])

  return null
}

