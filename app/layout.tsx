import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/layout/theme-provider"
import Header from "@/components/layout/header"
import { AuthProvider } from "@/lib/auth/context"
import { ToastProvider } from "@/components/layout/toast-provider"
import { QueryProvider } from "@/components/layout/query-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Malty - Beer Review App",
  description: "Review and discover great beers",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <AuthProvider>
              <ToastProvider>
                <div className="min-h-screen bg-background">
                  <Header />
                  <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="py-4 sm:py-6 lg:py-8">
                      {children}
                    </div>
                  </main>
                </div>
              </ToastProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
