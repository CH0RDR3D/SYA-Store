import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import Script from "next/script"
import "styles/globals.css"
import AuthProvider from "@modules/common/components/auth-provider"
import ThemeProvider from "@modules/layout/components/theme-provider"

const BASE_URL = getBaseURL()

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
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)] transition-colors duration-300">
        <AuthProvider>
          <ThemeProvider>
            <main className="relative">{props.children}</main>
          </ThemeProvider>
        </AuthProvider>

        {/* ── Meta Pixel ───────────────────────────────────────── */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1182225574369880');
fbq('track', 'PageView');`}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1182225574369880&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  )
}
