/**
 * SYA Online Trading - Central Unified Analytics Dispatcher
 * Dispatches events to Meta Pixel, Google Analytics 4, and PostHog, gated by cookie consent.
 */

import { hasConsent } from "./consent"
import {
  AddToCartParams,
  ContactParams,
  InitiateCheckoutParams,
  LeadParams,
  PurchaseParams,
  SearchParams,
  UserIdentity,
  ViewItemParams,
} from "./types"

// Global type declarations
declare global {
  interface Window {
    fbq?: (...args: any[]) => void
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
    posthog?: any
  }
}

// Meta Pixel Helper
function sendMetaPixel(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined" || !window.fbq) return
  if (!hasConsent("marketing")) return

  try {
    if (params) {
      window.fbq("track", eventName, params)
    } else {
      window.fbq("track", eventName)
    }
  } catch (e) {
    console.debug("[Analytics] Meta Pixel error:", e)
  }
}

// GA4 / GTM Helper
function sendGA4(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return
  if (!hasConsent("analytics")) return

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params)
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...params,
      })
    }
  } catch (e) {
    console.debug("[Analytics] GA4 error:", e)
  }
}

// PostHog Helper
function sendPostHog(eventName: string, properties?: Record<string, any>) {
  if (typeof window === "undefined" || !window.posthog) return
  if (!hasConsent("analytics")) return

  try {
    window.posthog.capture(eventName, properties)
  } catch (e) {
    console.debug("[Analytics] PostHog error:", e)
  }
}

// ── Public Tracking API ──────────────────────────────────────────────────────

/**
 * Track Page Views (called on initial load and route changes)
 */
export function trackPageView(url?: string, title?: string) {
  const pagePath = url || (typeof window !== "undefined" ? window.location.pathname + window.location.search : "")
  const pageTitle = title || (typeof document !== "undefined" ? document.title : "")

  // Meta Pixel
  sendMetaPixel("PageView")

  // GA4
  sendGA4("page_view", {
    page_path: pagePath,
    page_title: pageTitle,
  })

  // PostHog
  sendPostHog("$pageview", {
    $current_url: typeof window !== "undefined" ? window.location.href : pagePath,
    title: pageTitle,
  })
}

/**
 * Track Product View
 */
export function trackViewItem(product: ViewItemParams) {
  const currency = product.currency || "ZMW"

  // Meta Pixel
  sendMetaPixel("ViewContent", {
    content_name: product.title,
    content_ids: [product.id],
    content_type: "product",
    value: product.price,
    currency,
  })

  // GA4
  sendGA4("view_item", {
    currency,
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.title,
        item_category: product.category,
        price: product.price,
        quantity: 1,
      },
    ],
  })

  // PostHog
  sendPostHog("product viewed", {
    product_id: product.id,
    product_name: product.title,
    category: product.category,
    price: product.price,
    currency,
  })
}

/**
 * Track Add to Cart
 */
export function trackAddToCart(params: AddToCartParams) {
  const currency = params.currency || "ZMW"
  const itemTotal = params.price * params.quantity

  // Meta Pixel
  sendMetaPixel("AddToCart", {
    content_name: params.title,
    content_ids: [params.id],
    content_type: "product",
    value: itemTotal,
    currency,
  })

  // GA4
  sendGA4("add_to_cart", {
    currency,
    value: itemTotal,
    items: [
      {
        item_id: params.id,
        item_name: params.title,
        item_category: params.category,
        price: params.price,
        quantity: params.quantity,
      },
    ],
  })

  // PostHog
  sendPostHog("add to cart", {
    product_id: params.id,
    product_name: params.title,
    category: params.category,
    price: params.price,
    quantity: params.quantity,
    total: itemTotal,
    currency,
  })
}

/**
 * Track Initiate Checkout
 */
export function trackInitiateCheckout(params: InitiateCheckoutParams) {
  const currency = params.currency || "ZMW"

  // Meta Pixel
  sendMetaPixel("InitiateCheckout", {
    content_ids: params.items.map((i) => i.item_id),
    contents: params.items.map((i) => ({
      id: i.item_id,
      quantity: i.quantity,
      item_price: i.price,
    })),
    num_items: params.items.reduce((acc, i) => acc + i.quantity, 0),
    value: params.value,
    currency,
  })

  // GA4
  sendGA4("begin_checkout", {
    currency,
    value: params.value,
    items: params.items,
  })

  // PostHog
  sendPostHog("checkout started", {
    cart_id: params.cartId,
    value: params.value,
    currency,
    item_count: params.items.length,
    items: params.items,
  })
}

/**
 * Track Completed Purchase
 */
export function trackPurchase(params: PurchaseParams) {
  const currency = params.currency || "ZMW"

  // Meta Pixel
  sendMetaPixel("Purchase", {
    content_ids: params.items.map((i) => i.item_id),
    contents: params.items.map((i) => ({
      id: i.item_id,
      quantity: i.quantity,
      item_price: i.price,
    })),
    num_items: params.items.reduce((acc, i) => acc + i.quantity, 0),
    value: params.value,
    currency,
  })

  // GA4
  sendGA4("purchase", {
    transaction_id: params.orderId,
    value: params.value,
    currency,
    tax: params.tax,
    shipping: params.shipping,
    items: params.items,
  })

  // PostHog
  sendPostHog("purchase completed", {
    order_id: params.orderId,
    value: params.value,
    currency,
    tax: params.tax,
    shipping: params.shipping,
    item_count: params.items.length,
    items: params.items,
  })
}

/**
 * Track Search
 */
export function trackSearch(params: SearchParams) {
  // Meta Pixel
  sendMetaPixel("Search", {
    search_string: params.query,
  })

  // GA4
  sendGA4("search", {
    search_term: params.query,
    results_count: params.resultsCount,
  })

  // PostHog
  sendPostHog("searched", {
    query: params.query,
    results_count: params.resultsCount,
  })
}

/**
 * Track Lead (e.g. Feedback survey, newsletter)
 */
export function trackLead(params: LeadParams) {
  // Meta Pixel
  sendMetaPixel("Lead", {
    content_name: params.formName,
    content_category: params.category,
  })

  // GA4
  sendGA4("generate_lead", {
    form_name: params.formName,
    category: params.category,
    contact_method: params.contactMethod,
  })

  // PostHog
  sendPostHog("lead generated", {
    form_name: params.formName,
    category: params.category,
    contact_method: params.contactMethod,
  })
}

/**
 * Track Contact (WhatsApp, phone, email, direct message)
 */
export function trackContact(params: ContactParams) {
  // Meta Pixel
  sendMetaPixel("Contact", {
    channel: params.channel,
    context: params.context,
  })

  // GA4
  sendGA4("contact", {
    channel: params.channel,
    context: params.context,
  })

  // PostHog
  sendPostHog("contact initiated", {
    channel: params.channel,
    context: params.context,
  })
}

/**
 * Identify Logged-In User
 */
export function identifyUser(user: UserIdentity) {
  if (typeof window === "undefined" || !hasConsent("analytics")) return

  try {
    if (window.posthog) {
      window.posthog.identify(user.id, {
        email: user.email,
        name: user.name,
        phone: user.phone,
      })
    }

    sendGA4("login", {
      method: "account",
    })
  } catch (e) {
    console.debug("[Analytics] Identify error:", e)
  }
}

/**
 * Reset User (on logout)
 */
export function resetUser() {
  if (typeof window === "undefined") return
  try {
    if (window.posthog) {
      window.posthog.reset()
    }
  } catch (e) {
    console.debug("[Analytics] Reset error:", e)
  }
}

