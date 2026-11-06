/**
 * SYA Online Trading - Unified Analytics Types & Schemas
 */

export type CookieCategory = "necessary" | "analytics" | "marketing"

export interface CookieConsentPreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  updatedAt: string
}

export interface AnalyticsItem {
  item_id: string
  item_name: string
  item_category?: string
  price: number
  quantity: number
  currency?: string
}

export interface ViewItemParams {
  id: string
  title: string
  category?: string
  price: number
  currency?: string
}

export interface AddToCartParams {
  id: string
  title: string
  category?: string
  price: number
  quantity: number
  currency?: string
}

export interface InitiateCheckoutParams {
  cartId?: string
  currency: string
  value: number
  items: AnalyticsItem[]
}

export interface PurchaseParams {
  orderId: string
  currency: string
  value: number
  tax?: number
  shipping?: number
  items: AnalyticsItem[]
}

export interface SearchParams {
  query: string
  resultsCount?: number
}

export interface LeadParams {
  formName: string
  category?: string
  contactMethod?: string
}

export interface ContactParams {
  channel: "whatsapp" | "phone" | "email" | "form"
  context?: string
}

export interface UserIdentity {
  id: string
  email?: string
  name?: string
  phone?: string
}

export interface UtmAttribution {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  referrer?: string
  landing_page?: string
  captured_at: string
}

