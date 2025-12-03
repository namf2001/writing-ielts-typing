import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Merriweather } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes"
import { AppLayout } from "@/components/app-layout"
import "./globals.css"

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
})

const merriweather = Merriweather({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-merriweather",
})

export const metadata: Metadata = {
  title: "TypeMaster - IELTS Writing Practice",
  description: "Luyện gõ phím kết hợp luyện viết IELTS với AI scoring và feedback chi tiết",
}

export const viewport: Viewport = {
  themeColor: "#1e1b4b",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${merriweather.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
