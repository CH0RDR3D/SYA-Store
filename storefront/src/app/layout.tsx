import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import AuthProvider from "@modules/common/components/auth-provider"
import ThemeProvider from "@modules/layout/components/theme-provider"
import AnalyticsProvider from "@modules/common/components/analytics-provider"
import CookieConsentBanner from "@modules/common/components/cookie-consent"

const BASE_URL = getBaseURL()
const GTM_ID = "GTM-P9N3JSM4"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SYA Store — Lusaka's Premier Online Shopping Destination",
    template: "%s | SYA Store",
  },
  description:
    "SYA Store is Lusaka's premier online shopping destination. Shop electronics, fashion, beauty, solar products, home essentials and more. Fast delivery across Zambia.",
  keywords: [
    "SYA Store",
    "online shopping Zambia",
    "Lusaka online store",
    "electronics Lusaka",
    "fashion Zambia",
    "solar products Zambia",
    "beauty products Lusaka",
    "home appliances Zambia",
  ],
  authors: [{ name: "SYA Online Trading", url: BASE_URL }],
  creator: "SYA Online Trading",
  publisher: "SYA Online Trading",
  openGraph: {
    type: "website",
    locale: "en_ZM",
    url: BASE_URL,
    siteName: "SYA Store",
    title: "SYA Store — Lusaka's Premier Online Shopping Destination",
    description:
      "Shop electronics, fashion, beauty, solar products, home essentials and more. Fast delivery across Zambia.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SYA Store — Lusaka's Premier Online Shopping Destination",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SYA Store — Lusaka's Premier Online Shopping Destination",
    description:
      "Shop electronics, fashion, beauty, solar products and more. Fast delivery across Zambia.",
    images: ["/og-image.png"],
    creator: "@syastore",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

const themeInitScript = `(() => {
  try {
    const key = "shadystore-theme";
    const saved = localStorage.getItem(key);
    const pref = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const mode = pref === "system" ? system : pref;
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(mode);
    document.documentElement.setAttribute("data-mode", mode);
  } catch {}
})();`

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];
function gtag(){window.dataLayer.push(arguments);}
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`,
          }}
        />
        <script async src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`} />
        {/* Theme init — must run before first paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)] transition-colors duration-300">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <AuthProvider>
          <ThemeProvider>
            <AnalyticsProvider>
              <main className="relative">{props.children}</main>
              <CookieConsentBanner />
            </AnalyticsProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}