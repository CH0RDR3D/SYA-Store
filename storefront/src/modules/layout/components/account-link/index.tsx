"use client"

import { useMedusaAuth } from "@lib/hooks/use-medusa-auth"
import { signout } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import {
  User,
  Package,
  MapPin,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type AccountLinkProps = {
  customer?: HttpTypes.StoreCustomer | null
  customerName?: string | null
}

interface StoredUser {
  first_name?: string | null
  last_name?: string | null
  name?: string | null
  email?: string | null
}

export default function AccountLink({
  customer,
  customerName,
}: AccountLinkProps) {
  const { session, signOut } = useMedusaAuth()
  const { countryCode } = useParams() as { countryCode: string }
  const router = useRouter()

  const [liveUser, setLiveUser] = useState<StoredUser | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 1. Check localStorage for instantly cached user from Google One Tap / sign-in
    try {
      const cached = window.localStorage.getItem("sya_user")
      if (cached) {
        const parsed = JSON.parse(cached)
        setLiveUser(parsed)
      }
    } catch {}

    // 2. Listen to custom auth events from Google One Tap or Sign In components
    const handleAuthEvent = (e: Event) => {
      const customEvent = e as CustomEvent<StoredUser | null>
      setLiveUser(customEvent.detail || null)
    }

    window.addEventListener("sya:auth", handleAuthEvent)
    return () => window.removeEventListener("sya:auth", handleAuthEvent)
  }, [])

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  // Extract first name and user details
  const rawFirstName =
    liveUser?.first_name ||
    customer?.first_name ||
    (liveUser?.name ? liveUser.name.trim().split(" ")[0] : null) ||
    (customerName ? customerName.trim().split(" ")[0] : null) ||
    (session?.user?.name ? session.user.name.trim().split(" ")[0] : null) ||
    (liveUser?.email
      ? liveUser.email.split("@")[0].replace(/[._-]/g, " ")
      : null) ||
    (customer?.email
      ? customer.email.split("@")[0].replace(/[._-]/g, " ")
      : null) ||
    (session?.user?.email
      ? session.user.email.split("@")[0].replace(/[._-]/g, " ")
      : null)

  const firstName = rawFirstName
    ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1)
    : null

  const fullName =
    [liveUser?.first_name, liveUser?.last_name].filter(Boolean).join(" ") ||
    liveUser?.name ||
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
    customerName ||
    session?.user?.name ||
    firstName ||
    "Customer"

  const email =
    liveUser?.email || customer?.email || session?.user?.email || null

  const isAuthenticated = Boolean(
    liveUser || customer || session?.user || customerName
  )

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    if (isAuthenticated) {
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  const handleLogout = async () => {
    setIsOpen(false)
    setIsLoggingOut(true)
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("sya_user")
        window.dispatchEvent(new CustomEvent("sya:auth", { detail: null }))
      }
      await signout(countryCode).catch(() => {})
      await signOut().catch(() => {})
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Guest view: Direct link to /account without dropdown
  if (!isAuthenticated) {
    return (
      <LocalizedClientLink
        href="/account"
        className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-md px-2 py-1"
        data-testid="nav-account-link"
        aria-label="Your Account and Orders"
      >
        <User className="w-3.5 h-3.5 text-amber-500" />
        <span>Account</span>
      </LocalizedClientLink>
    )
  }

  // Authenticated view: "Hi, John" with hover/click dropdown menu
  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-md px-2 py-1 cursor-pointer select-none"
        data-testid="nav-account-dropdown-trigger"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <User className="w-3.5 h-3.5 text-amber-500" />
        <span className="font-semibold text-[var(--text-primary)]">
          {firstName ? `Hi, ${firstName}` : "Account"}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-[var(--text-secondary)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Account Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* User Profile Header */}
          <div className="px-3 py-2.5 bg-[var(--surface-secondary)]/50 rounded-xl mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                {firstName ? firstName[0] : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {fullName}
                </p>
                {email && (
                  <p className="text-[11px] text-[var(--text-secondary)] truncate">
                    {email}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-emerald-500">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Customer</span>
            </div>
          </div>

          <div className="border-t border-[var(--surface-border)] my-1" />

          {/* Navigation Links */}
          <LocalizedClientLink
            href="/account"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-xl transition-colors"
            role="menuitem"
          >
            <User className="w-3.5 h-3.5 text-amber-500" />
            <span>My Account</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/account/orders"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-xl transition-colors"
            role="menuitem"
          >
            <Package className="w-3.5 h-3.5 text-amber-500" />
            <span>My Orders</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/account/addresses"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-xl transition-colors"
            role="menuitem"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>Saved Addresses</span>
          </LocalizedClientLink>

          <div className="border-t border-[var(--surface-border)] my-1" />

          {/* Sign Out Action */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors text-left cursor-pointer disabled:opacity-50"
            role="menuitem"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      )}
    </div>
  )
}
