"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import type {
  GoogleCredentialResponse,
  GoogleGsiButtonConfiguration,
} from "types/google"

interface GoogleSignInButtonProps {
  text?: "signin_with" | "signup_with" | "continue_with" | "signin"
  shape?: "rectangular" | "pill" | "circle" | "square"
  size?: "large" | "medium" | "small"
  width?: string | number
  className?: string
  onSuccess?: (user: any) => void
  onError?: (err: Error) => void
}

export default function GoogleSignInButton({
  text = "signin_with",
  shape = "rectangular",
  size = "large",
  width,
  className = "",
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const buttonRef = useRef<HTMLDivElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Detect and track dark mode changes
  useEffect(() => {
    const checkDark = () => {
      if (typeof document === "undefined") return false
      return (
        document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-mode") === "dark"
      )
    }

    setIsDark(checkDark())

    const observer = new MutationObserver(() => {
      setIsDark(checkDark())
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-mode"],
    })

    return () => observer.disconnect()
  }, [])

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential || isLoading) return

      setIsLoading(true)

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

        if (onSuccess) {
          onSuccess(data.user)
        }

        if (pathname?.includes("/login") || pathname?.includes("/register")) {
          router.replace("/account")
        } else {
          router.refresh()
        }
      } catch (err: any) {
        console.error("[Google Sign-In Button] Error completing login:", err)
        if (onError) {
          onError(err)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, onError, onSuccess, pathname, router]
  )

  // Initialize and render Google button
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[GoogleSignInButton] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured"
        )
      }
      return
    }

    let isSubscribed = true
    let attempts = 0
    const maxAttempts = 30

    const renderGsiButton = () => {
      if (!isSubscribed || !buttonRef.current || !window.google?.accounts?.id) {
        return false
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
        })

        // Clear existing button content before re-rendering (e.g. on theme toggle)
        buttonRef.current.innerHTML = ""

        const buttonOptions: GoogleGsiButtonConfiguration = {
          type: "standard",
          theme: isDark ? "filled_black" : "outline",
          size,
          text,
          shape,
          logo_alignment: "left",
          width: width ? String(width) : undefined,
        }

        window.google.accounts.id.renderButton(
          buttonRef.current,
          buttonOptions
        )

        setIsReady(true)
        return true
      } catch (err) {
        console.error("[GoogleSignInButton] Failed to render button:", err)
        return false
      }
    }

    if (renderGsiButton()) {
      return () => {
        isSubscribed = false
      }
    }

    const interval = setInterval(() => {
      attempts++
      if (renderGsiButton() || attempts >= maxAttempts) {
        clearInterval(interval)
      }
    }, 200)

    return () => {
      isSubscribed = false
      clearInterval(interval)
    }
  }, [handleCredentialResponse, isDark, shape, size, text, width])

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--app-bg,#0f172a)]/80 backdrop-blur-sm">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          <span className="ml-2 text-xs font-semibold text-ui-fg-base">
            Signing in...
          </span>
        </div>
      )}

      {/* Target container for Google GSI renderButton */}
      <div
        ref={buttonRef}
        className={`min-h-[44px] w-full flex items-center justify-center overflow-hidden transition-opacity duration-200 ${
          isReady ? "opacity-100" : "opacity-0 absolute pointer-events-none"
        }`}
      />

      {/* Elegant Fallback Skeleton / Placeholder while Google script loads */}
      {!isReady && (
        <div
          className="flex h-[44px] w-full items-center justify-center gap-3 rounded-lg border border-ui-border-base bg-ui-bg-base px-4 py-2 text-sm font-medium text-ui-fg-base opacity-90 shadow-sm"
          aria-hidden="true"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.005 10.05.005 12s.455 3.8 1.265 5.42l4.01-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </div>
      )}
    </div>
  )
}
