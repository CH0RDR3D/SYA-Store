<p align="center">
  <img src="./public/logo.png" alt="SYA Storefront Logo" width="220" />
</p>

<h1 align="center">
  SYA Storefront
</h1>

<p align="center">
  A modern, scalable ecommerce platform built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Medusa v2.
</p>

<p align="center">
  Designed for speed, flexibility, and seamless online shopping experiences.
</p>

---

## Overview

SYA Storefront is the customer-facing ecommerce application powering the SYA Online ecosystem. Built on modern web technologies, it delivers a fast, responsive, and user-friendly shopping experience while integrating with a Medusa backend for product management, orders, customers, inventory, and payments.

### Tech Stack

- **Next.js 15 (App Router)**
- **React 19**
- **TypeScript**
- **Tailwind CSS & Medusa UI**
- **Medusa v2 Commerce Backend**
- **NextAuth & Google One Tap Integration**
- **Stripe & Lenco Payments**
- **Google Maps Places API**
- **MeiliSearch**
- **S3-Compatible Media Storage (Railway, AWS S3, Cloudflare R2, MinIO)**

---

### Key Features

#### Commerce & Shopping Experience
- Dynamic Product Catalog & Real-Time Search
- Responsive Category Carousel & Collections Showcase
- Comprehensive Product Detail Pages with specifications & full descriptions
- Shopping Cart & Cart Transfer on authentication
- Smart Checkout Auto-Fill (prioritizes default address and recent successful orders)
- Progressive Disclosure for optional checkout fields (Company, Address Line 2)
- Multi-Region Commerce & Dynamic Shipping Option mapping

#### Customer Identity & Account
- Google One Tap & Google OAuth authentication
- Reactive Navbar account display (`"Hi, {firstName}"`)
- Interactive Account Dropdown menu:
  - Profile header with verified customer badge
  - Quick access to **My Account**, **My Orders**, and **Saved Addresses**
  - Instant dual-session Sign Out (NextAuth + Medusa tokens)

#### Performance & Design
- React Server Components & Streaming Suspense
- Optimized image delivery & cross-fade hero banner
- Theme-aware styling (dark & light modes)
- Fully accessible keyboard navigation and ARIA attributes

---

## Getting Started

### Prerequisites

- Node.js 20+
- Medusa v2 Backend running
- Package manager (`pnpm` or `npm`)

### Setup

```bash
# Install dependencies
pnpm install # or npm install

# Copy environment variables
cp .env.local.template .env.local

# Run development server
pnpm dev # or npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Type Checking & Build

```bash
# Type-check TypeScript files
npx tsc --noEmit --skipLibCheck

# Production build
pnpm build
```
