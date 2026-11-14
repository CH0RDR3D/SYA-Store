"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import type {
  GoogleCredentialResponse,
  GooglePromptMomentNotification,
} from "types/google"

export default function GoogleOneTap() {
  const router = useRouter()
  const pathname = usePathname()
  const { status: nextAuthStatus } = useSession()

  const isInitialized = useRef(false)
  const isAuthenticating = useRef(false)

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential || isAuthenticating.current) {
        return
      }

      isAuthenticating.current = true

      try {
        const res = await fetch("/api/auth/google-one-tap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        })

        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Google authentication failed")
        }

        // Navigate or refresh smoothly
        if (pathname?.includes("/login") || pathname?.includes("/register")) {
          router.replace("/account")
        } else {
          router.refresh()
        }
      } catch (err) {
        console.error("[Google One Tap] Error completing sign-in:", err)
      } finally {
        isAuthenticating.current = false
      }
    },
    [pathname, router]
  )

  useEffect(() => {
    // 1. Skip if already authenticated in NextAuth
    if (nextAuthStatus === "authenticated") {
      return
    }

    // 2. Skip if already initialized on this component lifecycle
    if (isInitialized.current) {
      return
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[Google One Tap] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured in environment"
        )
      }
      return
    }

    // Expose global callback for HTML API initialization
    if (typeof window !== "undefined") {
      ;(window as any).handleGoogleOneTapResponse = handleCredentialResponse
    }

    let isSubscribed = true
    let attempts = 0
    const maxAttempts = 25 // Poll up to 5 seconds for script readiness

    const tryInitPrompt = () => {
      if (!isSubscribed) return true

      if (window.google?.accounts?.id) {
        isInitialized.current = true

        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: true,
            cancel_on_tap_outside: false,
            itp_support: true,
          })

          window.google.accounts.id.prompt(
            (notification: GooglePromptMomentNotification) => {
              if (notification.isNotDisplayed()) {
                console.warn(
                  "[Google One Tap] Prompt NOT displayed. Reason:",
                  notification.getNotDisplayedReason()
                )
              } else if (notification.isSkippedMoment()) {
                console.warn(
                  "[Google One Tap] Prompt skipped. Reason:",
                  notification.getSkippedReason()
                )
              } else if (notification.isDismissedMoment()) {
                console.info(
                  "[Google One Tap] Prompt dismissed. Reason:",
                  notification.getDismissedReason()
                )
              } else if (notification.isDisplayed()) {
                console.info("[Google One Tap] Prompt displayed successfully.")
              }
            }
          )
        } catch (err) {
          console.error("[Google One Tap] Prompt trigger error:", err)
        }
        return true
      }
      return false
    }

    if (tryInitPrompt()) {
      return () => {
        isSubscribed = false
      }
    }

    const interval = setInterval(() => {
      attempts++
      if (tryInitPrompt() || attempts >= maxAttempts) {
        clearInterval(interval)
      }
    }, 200)

    return () => {
      isSubscribed = false
      clearInterval(interval)
      try {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.cancel()
        }
      } catch {}
    }
  }, [handleCredentialResponse, nextAuthStatus])

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!clientId || nextAuthStatus === "authenticated") {
    return null
  }

  // HTML API configuration element automatically recognized by accounts.google.com/gsi/client
  return (
    <div
      id="g_id_onload"
      data-client_id={clientId}
      data-callback="handleGoogleOneTapResponse"
      data-auto_select="true"
      data-cancel_on_tap_outside="false"
      data-itp_support="true"
      style={{ display: "none" }}
    />
  )
}
