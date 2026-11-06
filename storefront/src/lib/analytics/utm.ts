import { UtmAttribution } from "./types"

const UTM_STORAGE_KEY = "sya_utm_attribution"

export function parseReferrerSource(referrer: string): string | undefined {
  if (!referrer) return undefined
  try {
    const url = new URL(referrer)
    const host = url.hostname.toLowerCase()

    if (host.includes("facebook.com") || host.includes("fb.com") || host.includes("meta.com")) {
      return "Facebook"
    }
    if (host.includes("instagram.com")) {
      return "Instagram"
    }
    if (host.includes("whatsapp.com") || host.includes("wa.me")) {
      return "WhatsApp"
    }
    if (host.includes("google.") || host.includes("googleadservices.com")) {
      return "Google Search"
    }
    if (host.includes("t.co") || host.includes("twitter.com") || host.includes("x.com")) {
      return "Twitter/X"
    }
    if (host.includes("tiktok.com")) {
      return "TikTok"
    }
    if (host.includes("linkedin.com")) {
      return "LinkedIn"
    }
    if (host.includes("youtube.com")) {
      return "YouTube"
    }

    // Ignore self-referrals
    if (typeof window !== "undefined" && host === window.location.hostname) {
      return undefined
    }

    return host
  } catch {
    return undefined
  }
}

export function captureUtmParameters(): UtmAttribution | null {
  if (typeof window === "undefined") return null

  try {
    const params = new URLSearchParams(window.location.search)
    const utmSource = params.get("utm_source")
    const utmMedium = params.get("utm_medium")
    const utmCampaign = params.get("utm_campaign")
    const utmTerm = params.get("utm_term")
    const utmContent = params.get("utm_content")
    const ref = document.referrer

    const referrerSource = parseReferrerSource(ref)

    // Check if new UTM parameters or external referrer are present
    const hasUtm = Boolean(utmSource || utmMedium || utmCampaign || utmTerm || utmContent)

    if (!hasUtm && !referrerSource) {
      // Return existing stored attribution if available
      return getStoredUtm()
    }

    const attribution: UtmAttribution = {
      utm_source: utmSource || referrerSource || "Direct",
      utm_medium: utmMedium || (referrerSource ? "referral" : "none"),
      utm_campaign: utmCampaign || undefined,
      utm_term: utmTerm || undefined,
      utm_content: utmContent || undefined,
      referrer: ref || undefined,
      landing_page: window.location.pathname + window.location.search,
      captured_at: new Date().toISOString(),
    }

    // Save in sessionStorage so it persists throughout the customer's checkout session
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(attribution))
    return attribution
  } catch (e) {
    console.warn("[Analytics] Error capturing UTM parameters:", e)
    return null
  }
}

export function getStoredUtm(): UtmAttribution | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UtmAttribution
  } catch {
    return null
  }
}

export function getAttributionMetadata(): Record<string, any> {
  const utm = getStoredUtm()
  if (!utm) return {}

  return {
    traffic_source: utm.utm_source || "Direct",
    traffic_medium: utm.utm_medium || "none",
    traffic_campaign: utm.utm_campaign || "",
    traffic_landing_page: utm.landing_page || "",
    traffic_captured_at: utm.captured_at || "",
  }
}

