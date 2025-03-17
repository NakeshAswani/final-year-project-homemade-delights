import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/app/components/common/Header"
import Footer from "@/app/components/common/Footer"
import './globals.css'
import { StoreProvider } from "@/lib/redux/StoreProvider"
import { ThemeProvider } from "@/lib/theme-provider"
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "HomeMade Delights",
  description: "Discover and buy homemade food items"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} font-mono`}>
        <ThemeProvider>
          <StoreProvider>
            <Toaster />
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
