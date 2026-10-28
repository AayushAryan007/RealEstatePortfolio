import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Manrope } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { site } from "@/lib/site"
import "./globals.css"

// Self-hosted by next/font: no layout shift, no third-party requests.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: Property Dealer in Vasundhara, Ghaziabad | Since ${site.since}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
  keywords: [
    "property in Vasundhara",
    "flats in Indirapuram",
    "property dealer Ghaziabad",
    "real estate Noida",
    "plots in Ghaziabad",
    "commercial property Indirapuram",
    "flats for rent Vasundhara",
  ],
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined },
}

export const viewport: Viewport = {
  themeColor: "#0e0d0b",
  colorScheme: "dark",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="min-h-dvh">
        {children}
        {/* Cookie-free visitor stats; only active when hosted on Vercel. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
