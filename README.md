<p align="center">
  <a href="#">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
      <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg" width=100>
    </picture>
  </a>
  <a href="https://railway.com/deploy">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://railway.app/brand/logo-light.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://railway.app/brand/logo-dark.svg">
      <img alt="Railway logo" src="https://railway.app/brand/logo-light.svg" width=100>
    </picture>
  </a>
</p>

<h1 align="center">
  SYA Store — Medusa v2 & Next.js 15 Monorepo
</h1>

<p align="center">
  A high-performance ecommerce platform combining <strong>Medusa v2.17.2</strong> backend with a responsive <strong>Next.js 15 App Router</strong> storefront.
</p>

<p align="center">
  <strong>Backend (Medusa 2.0)</strong> • <strong>Storefront (Next.js 15)</strong> • <strong>PostgreSQL</strong> • <strong>Redis</strong> • <strong>S3/MinIO</strong> • <strong>Meilisearch</strong>
</p>

---

## 🚀 Overview

SYA Store is an enterprise-ready headless ecommerce solution architected as a monorepo:

- **`backend/`**: Medusa v2.17.2 commerce engine with automated SKU normalization, option value sanitation, PostgreSQL database, custom workflows, and Resend transactional email templates.
- **`storefront/`**: Next.js 15 App Router storefront with frosted-glass responsive navigation, instant Google authentication, intelligent checkout autofill, dynamic multi-region shipping, and animated product carousels.

---

## ✨ Key Features & Architectural Enhancements

### 1. SKU Duplication Prevention & Sanitization
- **Centralized Normalizer**: Sanitizes SKU strings (`trim`, collapses whitespace, removes non-printable unicode characters, and standardizes casing).
- **Write-Time Middleware**: Intercepts variant create/update endpoints (`/admin/products/:id/variants`, `/admin/products`) to prevent duplicate SKU generation.
- **Audit & Cleanup CLI**:
  ```bash
  # In backend/
  npx medusa exec ./src/scripts/sku-audit.ts          # Dry-run audit report
  npx medusa exec ./src/scripts/sku-audit.ts -- --merge # Safe deduplication
  ```
- **Regression Suite**: Tested with Jest (`src/__tests__/sku-normalizer.spec.ts`).

### 2. Product Option Value Normalization
- **Title-Case Sanitizer**: Eliminates duplicate variant options (e.g. `Red`, `RED`, ` Red `) by normalizing whitespace and formatting to title case before save.
- **Option Audit CLI**:
  ```bash
  # In backend/
  npx medusa exec ./src/scripts/option-value-audit.ts          # Audit report
  npx medusa exec ./src/scripts/option-value-audit.ts -- --merge # Safe merge
  ```
- **Regression Suite**: Tested with Jest (`src/__tests__/option-value-normalizer.spec.ts`).

### 3. Smart Checkout Auto-Fill
- **Priority Address Resolution**: Seamlessly prefills customer shipping details preferring the default shipping address, falling back to recent successful order addresses.
- **Progressive Disclosure**: Non-destructive checkout experience with expandable inputs for Company and Address Line 2 without overwriting customer profile defaults.

### 4. Dynamic Shipping Methods
- **Accurate Label Presentation**: Dynamically resolves shipping method labels from `cart.shipping_methods` eliminating hardcoded delivery assumptions throughout Cart, Checkout, Review, Payment, and Order Confirmation.

### 5. Identity, Google One Tap & Responsive Navigation
- **Navbar Account Dropdown**: Greets authenticated users with `"Hi, {firstName}"` and features an interactive hover/click dropdown with:
  - User profile details & Verified Customer status
  - 👤 **My Account** (`/account`)
  - 📦 **My Orders** (`/account/orders`)
  - 📍 **Saved Addresses** (`/account/addresses`)
  - 🚪 **Sign Out** (synchronously clears Medusa and NextAuth sessions)
- **Google One Tap Fallback**: Configured to bypass native FedCM token rejects in Incognito/partitioned environments while dispatching instant `sya:auth` events for immediate client reactivity.

### 6. Full Product Hydration
- Enhanced Medusa remote query field wildcards (`*`) to guarantee full hydration of product descriptions, dimensions, weight, and materials, paired with graceful fallbacks for product information accordions.

---

## 🛠️ Preconfigured Integrations

- **Authentication**: Google OAuth + Google One Tap (NextAuth + Medusa JWT integration).
- **Transactional Emails**: Resend & React Email templates ([Setup Guide](backend/src/modules/email-notifications/README.md)).
- **Payment Providers**: Stripe & Lenco payment gateways.
- **Location & Maps**: Google Maps Places API for checkout address selection.
- **Search Engine**: Meilisearch product catalog indexing.
- **Asset Storage**: S3-compatible storage (Railway Buckets, Cloudflare R2, AWS S3, or MinIO).

---

## 💻 Local Development Setup

### 1. Start Local Infrastructure (Docker Compose)
The root directory includes a `docker-compose.yml` provisioning **PostgreSQL**, **Redis**, **Meilisearch**, and **MinIO**:

```bash
docker compose up -d
```
- **MinIO Console**: `http://localhost:9005` (`medusa` / `supersecret`)
- **Meilisearch**: `http://localhost:7700`

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pnpm install # or npm install

# Configure environment
cp .env.template .env
# Set DATABASE_URL and secrets in .env

# Initialize backend (run migrations & seed default data)
npm run ib

# Start backend dev server
npm run dev
```
*Backend runs on `http://localhost:9000` (Admin dashboard at `http://localhost:9000/app`).*

### 3. Storefront Setup

```bash
cd storefront

# Install dependencies
pnpm install # or npm install

# Configure environment
cp .env.local.template .env.local
# Verify NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Start storefront dev server
npm run dev
```
*Storefront runs on `http://localhost:3000`.*

---

## 🧪 Testing & Verification

Run backend unit tests for SKU and option normalization:
```bash
cd backend
npx jest src/__tests__/sku-normalizer.spec.ts src/__tests__/option-value-normalizer.spec.ts
```

Run storefront type checks:
```bash
cd storefront
npx tsc --noEmit --skipLibCheck
```

---

## ☁️ Deployment (Railway)

This repository is optimized for one-click or continuous deployment on [Railway](https://railway.app):

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy)

1. Connect this repository to your Railway project.
2. Link the backend service to the Railway PostgreSQL and Redis plugins.
3. Configure environment variables using `backend/.env.template` and `storefront/.env.local.template`.
4. Deploy the backend service, run database migrations, and deploy the storefront service.
