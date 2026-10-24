import { Metadata } from "next"
import {
  HeartHandshake,
  House,
  Lightbulb,
  MapPin,
  Phone,
  ShieldCheck,
  Sun,
  Truck,
  Sparkles,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Laptop,
  Sofa,
  Hammer,
} from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "About Us | Who We Are | SYA Store Lusaka",
  description:
    "Discover SYA Store, Zambia's growing ecommerce destination for genuine appliances, electronics, solar equipment, furniture, hardware, and everyday essentials.",
}

const values = [
  {
    title: "Customer Obsession",
    text: "Everything begins with the customer. We work backwards from customer needs to create a shopping experience that is simple, reliable, and rewarding.",
    icon: HeartHandshake,
  },
  {
    title: "Vast Selection",
    text: "We continuously expand our catalog so customers can find more of what they need in one convenient destination.",
    icon: ShieldCheck,
  },
  {
    title: "Fast Fulfillment",
    text: "Customers value speed. We invest in efficient logistics and fulfillment processes to deliver orders quickly and reliably.",
    icon: Lightbulb,
  },
  {
    title: "Long-Term Trust",
    text: "We earn trust through genuine products, transparent pricing, responsive support, and consistent service.",
    icon: Award,
  },
]

const services = [
  {
    title: "Household Appliances",
    text: "Shop practical appliances selected to make everyday home life easier.",
    icon: House,
    badge: "Best Sellers",
  },
  {
    title: "Electronics & Technology",
    text: "Discover useful electronics and technology for home, work, and everyday life.",
    icon: Laptop,
    badge: "Latest Devices",
  },
  {
    title: "Solar & Renewable Energy",
    text: "Explore solar products that help homes and businesses access dependable power.",
    icon: Sun,
    badge: "Clean Power",
  },
  {
    title: "Furniture & Home Living",
    text: "Find furniture and home essentials that bring comfort and style to your space.",
    icon: Sofa,
    badge: "Comfort & Style",
  },
  {
    title: "Hardware & Essential Tools",
    text: "Browse essential tools and hardware for projects at home or work.",
    icon: Hammer,
    badge: "Built to Last",
  },
  {
    title: "Nationwide Delivery",
    text: "Shop from anywhere in Zambia with convenient delivery and local support.",
    icon: Truck,
    badge: "Fast Fulfillment",
  },
]

const stats = [
  { value: "100%", label: "Genuine Products", sub: "Sourced from trusted suppliers" },
  { value: "24h", label: "Lusaka Delivery", sub: "Fast local fulfillment" },
  { value: "7-Day", label: "Easy Returns", sub: "On eligible items" },
  { value: "5+", label: "Product Categories", sub: "Everything in one place" },
]

const advantages = [
  "Wide selection of products",
  "Competitive everyday pricing",
  "Verified and genuine inventory",
  "Fast order fulfillment",
  "Secure checkout",
  "Local customer support",
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] py-8 sm:py-12 transition-colors duration-200">
      <div className="content-container max-w-6xl mx-auto px-4 sm:px-6 space-y-16 sm:space-y-24">

        {/* ── HERO BANNER ── */}
        <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-[var(--bg-card)] shadow-sm">
          <div className="relative z-10 grid gap-8 px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-[1.3fr_0.7fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-500 mb-4">
                <Sparkles className="h-3.5 w-3.5" /> Lusaka, Zambia · Who We Are
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
                Zambia&apos;s Growing Destination for Everyday Shopping.
              </h1>
              <p className="mt-5 text-sm sm:text-base lg:text-lg leading-relaxed text-[var(--text-secondary)] max-w-2xl">
                Discover quality appliances, electronics, solar equipment, furniture, tools, and household essentials backed by genuine products, affordable prices, and customer-first service.
              </p>
              
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <LocalizedClientLink
                  href="/store"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-sm"
                >
                  <span>Explore Our Catalog</span>
                  <ArrowRight className="h-4 w-4" />
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/customer-care"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--surface-border)] bg-[var(--bg-base)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <span>Contact Customer Care</span>
                </LocalizedClientLink>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="flex flex-col gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-black font-bold">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xs uppercase tracking-wider text-amber-500 font-bold">Our Store</h2>
                  <p className="text-sm font-bold text-[var(--text-primary)]">Makeni Road, Lusaka</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-amber-500/15 pt-4">
                Shop online or visit us in Lusaka for local support and order collection.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 pt-1">
                <CheckCircle2 className="h-4 w-4" /> Open Monday through Saturday
              </div>
            </div>
          </div>
        </section>

        {/* ── IMPACT & TRUST NUMBERS ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-6 text-center shadow-sm"
            >
              <div className="text-3xl sm:text-4xl font-black text-amber-500">{item.value}</div>
              <div className="text-sm font-bold text-[var(--text-primary)] mt-1">{item.label}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{item.sub}</div>
            </div>
          ))}
        </section>

        {/* ── OUR STORY / WHO WE ARE ── */}
        <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] items-start">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Our Story</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] leading-snug">
              Making quality products more accessible.
            </h2>
          </div>
          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
            <p>
              SYA Store was founded with a simple goal: to make quality products more accessible to Zambian households and businesses.
            </p>
            <p>
              What began as a growing trading business has evolved into a diversified retail company serving customers through both physical operations and a modern ecommerce platform. Today, SYA Store offers a carefully selected range of appliances, electronics, solar solutions, furniture, hardware products, and everyday essentials sourced from trusted suppliers.
            </p>
            <p>
              As we continue to grow, our focus remains unchanged: delivering genuine products, competitive prices, and exceptional customer experiences that customers can rely on.
            </p>
          </div>
        </section>

        {/* ── CORE DIVISIONS / WHAT WE DO ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">What We Do</span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
                Shop Across Categories
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md">
              Explore everyday essentials for your home, business, and life.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ title, text, icon: Icon, badge }) => (
              <article
                key={title}
                className="group flex flex-col justify-between rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-6 hover:border-amber-500/40 hover:shadow-md transition duration-200"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition duration-200">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--bg-base)] text-amber-500 border border-amber-500/20">
                      {badge}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition duration-150">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── WHY CUSTOMERS CHOOSE SYA ── */}
        <section className="rounded-3xl border border-amber-500/20 bg-[var(--bg-card)] p-6 sm:p-10 shadow-sm">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Shopping with SYA</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Why Customers Choose SYA Store
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
              Whether you&apos;re upgrading your home, powering your business, or shopping for everyday essentials, SYA Store combines quality products, affordable pricing, and dependable service to make every purchase worthwhile.
            </p>
          </div>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((advantage) => (
              <li key={advantage} className="flex items-center gap-3 text-sm font-semibold text-[var(--text-primary)]">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
                {advantage}
              </li>
            ))}
          </ul>
        </section>

        {/* ── GUIDING PRINCIPLES / OUR VALUES ── */}
        <section>
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Our Culture</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Guiding Principles
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
              The foundational values that guide our team&apos;s daily decisions and customer relationships.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ title, text, icon: Icon }) => (
              <article
                key={title}
                className="rounded-2xl border-t-4 border-t-amber-500 border-x border-b border-[var(--surface-border)] bg-[var(--bg-card)] p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <Icon className="h-6 w-6 text-amber-500" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-bold text-[var(--text-primary)]">{title}</h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── STORE LOCATION & CONTACT ── */}
        <section className="rounded-3xl border border-[var(--surface-border)] bg-[var(--bg-card)] p-6 sm:p-10 shadow-sm">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Visit Us</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Visit Our Lusaka Store
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
              Find us in Makeni or contact our team for help with your order.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 border-t border-[var(--surface-border)] pt-8">
            {/* Address */}
            <div className="flex gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 h-fit">
                <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Warehouse Address</h4>
                <address className="not-italic text-sm font-semibold text-[var(--text-primary)] mt-1 leading-snug">
                  Plot No. F/687/A/1/A/8,<br />
                  Makeni Road, Lusaka, Zambia
                </address>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 h-fit">
                <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Call Support</h4>
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 space-y-1">
                  <a className="block hover:text-amber-500 transition" href="tel:+260976666611">+260-976-666-611</a>
                  <a className="block hover:text-amber-500 transition text-xs text-[var(--text-secondary)]" href="tel:+260966666608">+260-966-666-608</a>
                </p>
              </div>
            </div>

            {/* Online Channels */}
            <div className="flex gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 h-fit">
                <Users className="h-5 w-5 shrink-0" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Online & Inquiries</h4>
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 space-y-1">
                  <a className="block hover:text-amber-500 transition" href="mailto:info@syastore.com">info@syastore.com</a>
                  <LocalizedClientLink href="/customer-care" className="block text-xs text-amber-500 hover:underline">
                    Visit Customer Care Hub →
                  </LocalizedClientLink>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-amber-500 px-6 py-8 text-center sm:px-10">
          <p className="mx-auto max-w-4xl text-lg font-bold leading-relaxed text-black sm:text-xl">
            SYA Store is a diversified retail and ecommerce company that helps Zambian homes and businesses access genuine products, affordable prices, and convenient shopping across appliances, electronics, solar solutions, furniture, hardware, and everyday essentials.
          </p>
        </section>

      </div>
    </main>
  )
}