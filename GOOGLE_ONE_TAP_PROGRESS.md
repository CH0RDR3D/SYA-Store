# Google Identity Services (GIS) One Tap & Sign-In Implementation Log

This tracking document monitors the implementation of Google Identity Services (One Tap + Official Sign-In Button) for **SYA Store** (Medusa v2 + Next.js App Router).

---

## 📋 Implementation Checklist

### 1. Preparation & Environment
- [x] Document existing auth architecture (`useMedusaAuth`, `NextAuth`, `_medusa_jwt` cookie, HMAC password bridge).
- [x] Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `storefront/.env`, `storefront/.env.local`, and `storefront/.env.local.template`.
- [x] Create Google Identity Services type definitions in `storefront/src/types/google.d.ts`.

### 2. Google Identity Services Loader
- [x] Inject `https://accounts.google.com/gsi/client` via Next.js `next/script` (`strategy="afterInteractive"`) in `storefront/src/app/layout.tsx`.

### 3. Server-Side Token Verification & Medusa Customer Session Bridge
- [x] Create `storefront/src/app/api/auth/google-one-tap/route.ts`:
  - [x] Verify Google ID Token against `https://oauth2.googleapis.com/tokeninfo`.
  - [x] Validate audience (`aud` matches client ID).
  - [x] Validate issuer (`iss` is `accounts.google.com` or `https://accounts.google.com`).
  - [x] Validate expiration (`exp`) and verified email (`email_verified`).
  - [x] Extract `sub`, `email`, `given_name`, `family_name`, `picture`.
  - [x] Deterministically derive bridge password via HMAC-SHA256 (`deriveBridgePassword(googleSub)`).
  - [x] Register customer identity with Medusa v2 `sdk.auth.register("customer", "emailpass", ...)`.
  - [x] Authenticate with Medusa v2 `sdk.auth.login("customer", "emailpass", ...)`.
  - [x] Upsert customer profile (`sdk.store.customer.retrieve` / `create` / `update`).
  - [x] Issue `_medusa_jwt` HTTP-only session cookie via `setAuthToken(medusaToken)`.
  - [x] Invalidate customer cache tag (`revalidateTag(customerCacheTag)`).
  - [x] Automatically transfer active guest cart (`transferCart()`).
  - [x] Add `GET` endpoint for lightweight client authentication pre-checks.

### 4. Google One Tap Component
- [x] Created `storefront/src/modules/account/components/google-one-tap/index.tsx` and re-exported at `storefront/src/components/auth/google-one-tap.tsx`:
  - [x] Runs after page hydration.
  - [x] Pre-checks store authentication state (avoids prompting logged-in users).
  - [x] Respects dismissal cooldown (`sya_onetap_dismissed` in sessionStorage).
  - [x] Initializes GIS with `auto_select: true` and `use_fedcm_for_prompt: true`.
  - [x] Handles credential callback with secure server exchange.
  - [x] Displays floating status banner (loading / success / error).
  - [x] Automatically redirects to `/account` from login/register or revalidates current page.
  - [x] Proper unmount cleanup (`window.google.accounts.id.cancel()`).

### 5. Google Sign-In Button Component
- [x] Created `storefront/src/modules/account/components/google-signin-button/index.tsx` and re-exported at `storefront/src/components/auth/google-signin-button.tsx`:
  - [x] Renders official button via `window.google.accounts.id.renderButton`.
  - [x] Dynamic dark/light mode detection and mutation observer for theme changes (`filled_black` vs `outline`).
  - [x] Flexible props: `text`, `shape`, `size`, `width`, `className`, `onSuccess`, `onError`.
  - [x] Accessible loading overlay and graceful skeleton fallback.

### 6. Integration Across Storefront
- [x] Mounted `<GoogleOneTap />` globally in `storefront/src/app/layout.tsx`.
- [x] Integrated `<GoogleSignInButton />` on Login page (`storefront/src/modules/account/components/login/index.tsx`).
- [x] Integrated `<GoogleSignInButton />` on Register page (`storefront/src/modules/account/components/register/index.tsx`).
- [x] Integrated `<GoogleSignInButton />` in Checkout motivational banner (`storefront/src/modules/checkout/components/checkout-motivational-banner/index.tsx`).

### 7. Diagnostics & Validation
- [x] Ran TypeScript compiler check across all touched files: `Relevant Diagnostics count: 0`.

---

## 📌 Status
*Phase: Implementation Complete & Verified*
*Timestamp: 2026-11-14*
