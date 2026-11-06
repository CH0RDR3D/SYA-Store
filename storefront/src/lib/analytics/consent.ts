import { CookieCategory, CookieConsentPreferences } from "./types"

const CONSENT_STORAGE_KEY = "sya_cookie_consent_v1"
export const CONSENT_UPDATED_EVENT = "sya:consent_updated"

export const DEFAULT_CONSENT: CookieConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  updatedAt: "",
}

export function getCookieConsent(): CookieConsentPreferences | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CookieConsentPreferences
    return {
      necessary: true, // Always true
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function setCookieConsent(preferences: {
  analytics: boolean
  marketing: boolean
}): CookieConsentPreferences {
  const finalConsent: CookieConsentPreferences = {
    necessary: true,
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
    updatedAt: new Date().toISOString(),
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(finalConsent))
      window.dispatchEvent(
        new CustomEvent(CONSENT_UPDATED_EVENT, { detail: finalConsent })
      )
    } catch (e) {
      console.warn("[Consent] Failed to save consent preferences:", e)
    }
  }

  return finalConsent
}

export function hasConsent(category: CookieCategory): boolean {
  if (category === "necessary") return true
  const current = getCookieConsent()
  if (!current) return false
  return Boolean(current[category])
}

export function acceptAllCookies(): CookieConsentPreferences {
  return setCookieConsent({ analytics: true, marketing: true })
}

export function rejectNonEssentialCookies(): CookieConsentPreferences {
  return setCookieConsent({ analytics: false, marketing: false })
}

