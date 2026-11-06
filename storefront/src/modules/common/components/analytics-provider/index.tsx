"use client"

import React, { Suspense, useEffect, useRef, useState } from "react"
import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"
import { trackPageView } from "@lib/analytics"
import {
  CONSENT_UPDATED_EVENT,
  getCookieConsent,
} from "@lib/analytics/consent"
import { captureUtmParameters } from "@lib/analytics/utm"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || ""
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"
const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "1182225574369880"

const META_PIXEL_BOOTSTRAP = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');`

function RouteTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedUrl = useRef("")

  useEffect(() => {
    if (!pathname) return

    const query = searchParams?.toString()
    const fullUrl = `${pathname}${query ? `?${query}` : ""}`
    if (lastTrackedUrl.current === fullUrl) return

    lastTrackedUrl.current = fullUrl
    captureUtmParameters()
    trackPageView(fullUrl, document.title)
  }, [pathname, searchParams])

  return null
}

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [marketingConsent, setMarketingConsent] = useState(false)

  useEffect(() => {
    captureUtmParameters()
    window.posthog = posthog

    const syncConsent = () => {
      const consent = getCookieConsent()
      const analyticsAllowed = Boolean(consent?.analytics)
      const marketingAllowed = Boolean(consent?.marketing)

      setMarketingConsent(marketingAllowed)
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: "analytics_consent_update",
        analytics_consent: analyticsAllowed ? "granted" : "denied",
        marketing_consent: marketingAllowed ? "granted" : "denied",
      })

      if (analyticsAllowed && POSTHOG_KEY && !posthog.__loaded) {
        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          autocapture: true,
          capture_pageview: false,
          disable_session_recording: false,
        })
      }

      if (analyticsAllowed) posthog.opt_in_capturing()
      else posthog.opt_out_capturing()
    }

    syncConsent()
    window.addEventListener(CONSENT_UPDATED_EVENT, syncConsent)
    return () =>
      window.removeEventListener(CONSENT_UPDATED_EVENT, syncConsent)
  }, [])

  return (
    <>
      {marketingConsent && META_PIXEL_ID && (
        <>
          <Script id="meta-pixel-bootstrap" strategy="afterInteractive">
            {META_PIXEL_BOOTSTRAP}
          </Script>
          <Script
            id="meta-pixel"
            src="https://connect.facebook.net/en_US/fbevents.js"
            strategy="afterInteractive"
            onLoad={() => {
              if (!window.fbq) return
              window.fbq("init", META_PIXEL_ID)
              window.fbq("track", "PageView")
            }}
          />
        </>
      )}
      <Suspense fallback={null}>
        <RouteTracker />
      </Suspense>
      {children}
    </>
  )
}
