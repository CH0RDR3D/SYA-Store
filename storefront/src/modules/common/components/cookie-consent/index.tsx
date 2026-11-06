"use client"

import React, { useState, useEffect } from "react"
import {
  getCookieConsent,
  setCookieConsent,
  acceptAllCookies,
  rejectNonEssentialCookies,
  CONSENT_UPDATED_EVENT,
} from "@lib/analytics/consent"

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showCustomizer, setShowCustomizer] = useState(false)

  const [analyticsChecked, setAnalyticsChecked] = useState(true)
  const [marketingChecked, setMarketingChecked] = useState(true)

  useEffect(() => {
    setMounted(true)
    const existing = getCookieConsent()
    if (!existing) {
      // Delay display slightly so it doesn't jarringly block the initial paint
      const timer = setTimeout(() => setShowBanner(true), 1200)
      return () => clearTimeout(timer)
    } else {
      setAnalyticsChecked(existing.analytics)
      setMarketingChecked(existing.marketing)
    }

    const handleConsentUpdated = (e: Event) => {
      const custom = (e as CustomEvent).detail
      if (custom) {
        setAnalyticsChecked(Boolean(custom.analytics))
        setMarketingChecked(Boolean(custom.marketing))
      }
    }

    window.addEventListener(CONSENT_UPDATED_EVENT, handleConsentUpdated)
    window.addEventListener("sya:open_cookie_preferences", () => {
      setShowBanner(true)
      setShowCustomizer(true)
    })

    return () => {
      window.removeEventListener(CONSENT_UPDATED_EVENT, handleConsentUpdated)
    }
  }, [])

  if (!mounted || !showBanner) return null

  const handleAcceptAll = () => {
    acceptAllCookies()
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    rejectNonEssentialCookies()
    setShowBanner(false)
  }

  const handleSaveCustom = () => {
    setCookieConsent({
      analytics: analyticsChecked,
      marketing: marketingChecked,
    })
    setShowBanner(false)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-lg z-[9990] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className="rounded-2xl p-5 md:p-6 shadow-2xl backdrop-blur-xl border border-amber-500/30 text-white"
        style={{
          background: "linear-gradient(145deg, rgba(24, 24, 27, 0.98) 0%, rgba(9, 9, 11, 0.98) 100%)",
        }}
      >
        {/* Banner Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </span>
            <h3 className="text-sm md:text-base font-bold text-white tracking-tight">
              Privacy & Cookie Preferences
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            className="text-zinc-400 hover:text-white p-1 rounded-md transition"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-300 leading-relaxed mb-4">
          We use cookies to personalize content, analyze traffic, optimize your shopping experience, and serve relevant offers. You have full control over optional tracking.
        </p>

        {/* Granular Customizer */}
        {showCustomizer && (
          <div className="space-y-2.5 mb-5 p-3.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs">
            {/* Necessary */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-semibold text-white">Essential Cookies</p>
                <p className="text-[11px] text-zinc-400">Required for store operation, cart, and authentication.</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Always Active
              </span>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between py-1 border-t border-white/5">
              <div>
                <p className="font-semibold text-white">Analytics & Performance</p>
                <p className="text-[11px] text-zinc-400">Helps us understand customer journeys and improve the store.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analyticsChecked}
                  onChange={(e) => setAnalyticsChecked(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400"></div>
              </label>
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between py-1 border-t border-white/5">
              <div>
                <p className="font-semibold text-white">Marketing & Social Ads</p>
                <p className="text-[11px] text-zinc-400">Allows Meta Pixel & ad platforms to provide relevant promotions.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingChecked}
                  onChange={(e) => setMarketingChecked(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400"></div>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {showCustomizer ? (
            <button
              type="button"
              onClick={handleSaveCustom}
              className="flex-1 py-2 px-4 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black transition shadow-md shadow-amber-400/20 text-center"
            >
              Save Preferences
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 py-2 px-4 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black transition shadow-md shadow-amber-400/20 text-center"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={handleRejectAll}
                className="py-2 px-4 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition border border-white/10 text-center"
              >
                Decline Optional
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="py-2 px-3 text-[11px] text-zinc-400 hover:text-amber-400 transition underline underline-offset-4 text-center"
          >
            {showCustomizer ? "Hide Details" : "Customize"}
          </button>
        </div>
      </div>
    </div>
  )
}

