import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define Supabase URL and key as constants
const SUPABASE_URL = "https://thkpfeuwwyocnbavgsqn.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoa3BmZXV3d3lvY25iYXZnc3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NDc1MzYsImV4cCI6MjA2MzEyMzUzNn0.p-ho5a9n9iIQkYh90Sgc0Uz7ZztTBmRmLtMrcLhAaFM"

export async function middleware(req: NextRequest) {
  // Simple cookie-based auth check without using Supabase client
  const authCookie = req.cookies.get("sb-thkpfeuwwyocnbavgsqn-auth-token")
  const isAuthenticated = !!authCookie?.value

  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
  const isReviewCreationPage = req.nextUrl.pathname === "/reviews/new"
  const isAccountPage = req.nextUrl.pathname.startsWith("/account")

  // Create a response that we'll modify and return
  const res = NextResponse.next()

  // Add debug headers
  res.headers.set("x-middleware-cache", "no-cache")
  res.headers.set("x-auth-status", isAuthenticated ? "authenticated" : "unauthenticated")

  // Redirect unauthenticated users to login when trying to access protected routes
  if (!isAuthenticated && (isReviewCreationPage || isAccountPage)) {
    const redirectUrl = new URL("/auth/login", req.url)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return res
}

// Update the config matcher to include the account page
export const config = {
  matcher: ["/reviews/new", "/account/:path*", "/auth/:path*"],
}
