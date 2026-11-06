# Analytics & Marketing Tracking System Implementation Tracking

This document tracks the end-to-end implementation of the analytics, marketing tracking, and business intelligence architecture for **SYA Store** (Medusa v2 + Next.js App Router on Railway).

---

## 🏗️ Architecture Overview

```
                        ┌─────────────────────────────────────────────────────────┐
                        │                  Storefront (Next.js)                   │
                        │                                                         │
                        │   ┌─────────────────────────────────────────────────┐   │
                        │   │         Cookie Consent Manager (Banner)         │   │
                        │   └──────────────────────┬──────────────────────────┘   │
                        │                          │ (Gated by Consent)           │
                        │                          ▼                              │
                        │   ┌─────────────────────────────────────────────────┐   │
                        │   │       Unified Analytics Dispatcher (Client)     │   │
                        │   │  (trackViewContent, trackAddToCart, trackCheckout)│ │
                        │   └───┬──────────────┬──────────────┬───────────────┘   │
                        └───────┼──────────────┼──────────────┼───────────────────┘
                                │              │              │
                    ┌───────────▼───┐  ┌───────▼──────┐  ┌────▼──────────┐
                    │  Meta Pixel   │  │     GA4      │  │    PostHog    │
                    │ (Advertising) │  │(Attribution) │  │(Behaviour/UX) │
                    └───────────────┘  └──────────────┘  └───────────────┘
                                               │
                                               ▼ UTM & Attribution
                        ┌─────────────────────────────────────────────────────────┐
                        │              Medusa v2 Backend (Railway)                │
                        │                                                         │
                        │  - UTM Attribution attached to Carts & Orders           │
                        │  - Aggregated Metrics API (/admin/analytics/*)          │
                        │  - Low database footprint (no per-click spam)           │
                        │                                                         │
                        │  ┌───────────────────────────────────────────────────┐  │
                        │  │       Admin Analytics Dashboard (Recharts)        │  │
                        │  │  - Overview, Visitors, Behaviour, Products,       │  │
                        │  │    Traffic Sources, Conversion Funnels            │  │
                        │  └───────────────────────────────────────────────────┘  │
                        └─────────────────────────────────────────────────────────┘
```

---

## 📋 Milestone Checklist & Execution Status

### Phase 1: Storefront Unified Analytics Engine & Consent
- [x] **1.1 Cookie Consent Banner & Privacy Controls**:
  - Categories: `Necessary`, `Analytics`, `Marketing`
  - Opt-in / Opt-out modal & persistent preferences in localStorage
  - Tracking gates: Meta Pixel, GA4, PostHog only fire when respective consent is granted
- [x] **1.2 Unified Analytics Abstraction (`@lib/analytics`)**:
  - `trackPageView(url)`
  - `trackViewItem(product)`
  - `trackAddToCart(item, cart)`
  - `trackInitiateCheckout(cart)`
  - `trackPurchase(order)`
  - `trackSearch(query, resultsCount)`
  - `trackLead(formName, data)`
  - `trackContact(channel)`
- [x] **1.3 Meta Pixel Client Integration**:
  - Pixel ID `1182225574369880`
  - App Router route change listener (deduplicated)
  - Full ecommerce payload mapping (currency, value, contents)
- [x] **1.4 Google Analytics 4 (GA4)**:
  - Integration via Google Tag / GTM (`GTM-TVV7S9H8` or direct GA4 ID)
  - Full GA4 Ecommerce Event schema (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`)
  - UTM parameter extractor & sessionStorage persistence (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`)
- [x] **1.5 PostHog SDK**:
  - Install `posthog-js`
  - Client provider with session recording & heatmap enablement
  - User identification (`posthog.identify` on login / register)
  - Anonymous guest tracking (`Guest Visitor`)

---

### Phase 2: Attribution Persistence & Checkout Flow
- [x] **2.1 UTM Attribution Capture & Storage**:
  - Store UTM parameters on cart creation / update in cart metadata
- [x] **2.2 Order Attribution Pass-through**:
  - Transfer cart UTM metadata to completed order metadata
  - Facilitates source revenue reporting (Direct, Facebook, Instagram, Google Ads, WhatsApp, Email, Referral)

---

### Phase 3: Medusa Backend Analytics Endpoints
- [~] **3.1 Analytics Aggregation API Routes (`/admin/analytics`)**:
  - `GET /admin/analytics/overview` (KPIs, revenue, orders, conversion rate)
  - `GET /admin/analytics/products` (Views, conversion, revenue per product)
  - `GET /admin/analytics/sources` (Attribution breakdown from order metadata)
  - `GET /admin/analytics/funnel` (Cart -> Checkout -> Order completion drop-offs)
- [~] **3.2 Performance & Railway Safeguards**:
  - In-memory / Redis caching on analytical queries
  - Avoid heavy table scans; utilize indices on `created_at`, `total`, `metadata`

---

### Phase 4: Medusa v2 Admin Analytics Dashboard
- [ ] **4.1 Admin Route Extension (`backend/src/admin/routes/analytics`)**:
  - Register `Analytics` sidebar navigation item in Medusa v2 Dashboard
  - Sub-views / tabs:
    - **Overview**: KPI summary cards, revenue/orders time series
    - **Visitors & Traffic Sources**: UTM breakdown, device & browser splits
    - **Behaviour & Heatmaps**: PostHog integration shortcuts / embedded stats
    - **Products**: Best-sellers, view-to-buy ratios
    - **Conversion Funnel**: Step drop-off chart
- [ ] **4.2 Visualization Stack**:
  - Install `recharts` in `backend` admin extensions
  - Dark/Gold theme styled charts matching SYA branding

---

## 🔑 Environment Variables Required

### Storefront (`storefront/.env.local` & Railway Storefront):
```env
NEXT_PUBLIC_META_PIXEL_ID=1182225574369880
NEXT_PUBLIC_GA_MEASUREMENT_ID=       # e.g., G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=              # phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com # or https://eu.i.posthog.com
```

### Backend (`backend/.env` & Railway Backend):
```env
# Optional PostHog Personal/Project API Key for Admin Dashboard sync (if querying PostHog directly)
POSTHOG_PROJECT_ID=
POSTHOG_PERSONAL_API_KEY=
```

---

## 📌 Current Status: Storefront foundation and backend aggregate endpoints implemented
*Last updated: 2026-11-06*

- Storefront analytics is consent-gated for Meta Pixel, GA4, and PostHog.
- PostHog SDK is installed; set `NEXT_PUBLIC_POSTHOG_KEY` to enable it.
- UTM attribution is attached to carts and copied to orders by the `order.placed` subscriber.
- Initial admin overview and traffic-source endpoints are implemented under `/admin/analytics`.
- Storefront TypeScript check passes.
- Medusa backend/frontend compilation passes; the final post-build package install requires a runnable `pnpm` executable in the build environment.
