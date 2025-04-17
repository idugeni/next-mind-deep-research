import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import { MAIN_TITLE, DEFAULT_DESCRIPTION } from '@/lib/metadata'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://nextmind.oldsoul.id/"),
  title: MAIN_TITLE,
  description: DEFAULT_DESCRIPTION,
  generator: 'v0.dev',
  keywords: [
    "AI research report",
    "laporan riset AI",
    "deep research",
    "analisa mendalam",
    "literature review",
    "research automation",
    "laporan penelitian otomatis",
    "academic report generator",
    "sintesis sumber ilmiah",
    "critical appraisal",
    "sistem rekomendasi riset",
    "NextMind",
    "DEEP RESEARCH platform"
  ],
  openGraph: {
    title: MAIN_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "https://nextmind.oldsoul.id/",
    siteName: "NextMind - Deep Research",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NextMind - Deep Research AI Platform"
      }
    ],
    locale: "id_ID",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: MAIN_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.png"]
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar />
          <main className="min-h-screen pt-16 pb-16">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}