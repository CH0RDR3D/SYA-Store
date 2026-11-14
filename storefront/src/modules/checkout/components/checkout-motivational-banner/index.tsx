"use client"

import React, { useState } from "react"
import { useMedusaAuth } from "@lib/hooks/use-medusa-auth"
import { HttpTypes } from "@medusajs/types"
import {
  Sparkles,
  Zap,
  MapPin,
  Truck,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  LogIn,
  CheckCircle2,
  X,
} from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import GoogleAuthButton from "@modules/account/components/google-auth-button"

interface CheckoutMotivationalBannerProps {
  customer: HttpTypes.StoreCustomer | null
}

export default function CheckoutMotivationalBanner({
  customer,
}: CheckoutMotivationalBannerProps) {
  const { session, status, signInWithGoogle, isLoading } = useMedusaAuth()
  const [dismissed, setDismissed] = useState(false)

  const customerFullName = [customer?.first_name, customer?.last_name]
    .filter(Boolean)
    .join(" ")
  const accountName =
    customerFullName || session?.user?.name || customer?.email || session?.user?.email
  const activeEmail = customer?.email || session?.user?.email

  // If user is authenticated: Show sleek Verified Member Status
  if (customer || (status === "authenticated" && session?.user)) {
    return (
      <div
        className="mb-6 p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        data-testid="checkout-authenticated-badge"
      >
        <div className="flex items-center gap-3.5">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={accountName || "User"}
              className="w-10 h-10 rounded-full border-2 border-amber-500 object-cover shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-black flex items-center justify-center font-bold text-sm shadow-sm">
              {accountName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Member Account</span>
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              {accountName}
            </p>
            {activeEmail && (
              <p className="text-xs text-[var(--text-secondary)]">{activeEmail}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <LocalizedClientLink
            href="/account/addresses"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] transition"
          >
            Saved Addresses
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/account"
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1 transition"
          >
            <span>Dashboard</span>
            <ArrowRight className="w-3 h-3" />
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  // If dismissed by guest user
  if (dismissed) {
    return (
      <div className="mb-4 flex items-center justify-between px-3 py-2 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] text-xs text-[var(--text-muted)]">
        <span>Checking out as Guest.</span>
        <button
          type="button"
          onClick={() => setDismissed(false)}
          className="text-amber-500 font-semibold hover:underline"
        >
          Show member perks
        </button>
      </div>
    )
  }

  // High-converting motivational banner for guest shoppers
  return (
    <div
      className="mb-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-[var(--surface-card)] p-5 relative shadow-sm"
      data-testid="checkout-guest-motivational-banner"
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-3.5 right-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
        title="Dismiss notice"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Member Benefits Notice</span>
          </div>

          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Create an Account or Sign In for an Effortless Checkout
          </h3>

          <p className="text-xs text-[var(--text-secondary)] mt-1 mb-3">
            Register to unlock member-only rewards and first-buy promotion benefits:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>1-Click lightning checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Save Google Maps delivery locations</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Real-time SMS & WhatsApp dispatch tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Verified orders & warranty protection</span>
            </div>
          </div>
        </div>

        {/* Action Buttons & Google Sign-In */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 sm:self-start lg:self-center w-full lg:w-48">
          <LocalizedClientLink
            href="/account"
            className="w-full py-2 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Free Account</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/account"
            className="w-full py-2 px-3.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </LocalizedClientLink>

          <div className="w-full">
            <GoogleAuthButton compact label="Google 1-Click" />
          </div>
        </div>
      </div>
    </div>
  )
}
