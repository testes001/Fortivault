import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import { ClipboardPolyfill } from "@/components/utils/clipboard-polyfill"
import { PageTransitionLoader } from "@/components/page-transition-loader"
import "./globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "Fortivault - Built to protect. Trusted to Secure",
  description:
    "Built to protect. Trusted to Secure. Professional fraud recovery and scam reporting platform. We support victims of crypto and fiat fraud with secure reporting and recovery guidance.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <PageTransitionLoader />
            {children}
          </ThemeProvider>
        </Suspense>
        <Analytics />
        <ClipboardPolyfill />
      </body>
    </html>
  )
}
