import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { Database } from "@/lib/database.types" // Assuming you have this types file

// Get environment variables if not already in lib/supabase/server.ts or ensure they are accessible
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: new Headers(req.headers),
    },
  })

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is set, update the request cookies object.
          // This is needed for Server Components to see the new session.
          req.cookies.set({
            name,
            value,
            ...options,
          })
          // Clone the request headers and update the 'cookie' header explicitly
          const newHeaders = new Headers(req.headers)
          newHeaders.set('cookie', req.cookies.toString())

          res = NextResponse.next({
            request: {
              // Pass the new headers with the updated cookie
              headers: newHeaders,
            },
          })
          // And also set it on the response so the browser gets it
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request cookies object.
          req.cookies.delete(name) // Simpler way to remove from NextRequestCookies
          // Clone the request headers and update the 'cookie' header explicitly
          const newHeaders = new Headers(req.headers)
          newHeaders.set('cookie', req.cookies.toString())
          
          res = NextResponse.next({
            request: {
              // Pass the new headers with the updated cookie
              headers: newHeaders,
            },
          })
          // And also remove it from the response
          // Correctly use delete with options by passing a single object
          res.cookies.delete({ name, path: options.path, domain: options.domain } as any)
        },
      },
    }
  )

  // Refresh session if expired - important!
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthenticated = !!session

  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
  const isReviewCreationPage = req.nextUrl.pathname === "/reviews/new"
  const isAccountPage = req.nextUrl.pathname.startsWith("/account")

  // Add debug headers
  res.headers.set("x-middleware-cache", "no-cache")
  res.headers.set("x-auth-status", isAuthenticated ? "authenticated" : "unauthenticated")
  res.headers.set("x-pathname", req.nextUrl.pathname) // For debugging

  // Redirect unauthenticated users to login when trying to access protected routes
  if (!isAuthenticated && (isReviewCreationPage || isAccountPage)) {
    const redirectUrl = new URL("/auth/login", req.url)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    console.log(`[Middleware] Unauthenticated access to ${req.nextUrl.pathname}, redirecting to: ${redirectUrl.toString()}`)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  // (unless they are trying to complete a flow like reset password or email confirmation)
  const isAuthCallback = req.nextUrl.pathname.startsWith("/auth/callback") || 
                         req.nextUrl.pathname.startsWith("/auth/reset-password") ||
                         req.nextUrl.pathname.startsWith("/auth/confirm") // Add other auth flow paths if needed

  if (isAuthenticated && isAuthPage && !isAuthCallback) {
    let redirectTo = req.nextUrl.searchParams.get("redirectTo")
    // Prevent redirect loops to auth pages
    if (redirectTo && redirectTo.startsWith("/auth")) {
        redirectTo = "/"
    } else if (!redirectTo) {
        redirectTo = "/"
    }
    console.log(`[Middleware] Authenticated access to auth page ${req.nextUrl.pathname}, redirecting to: ${redirectTo}`)
    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (static images in /public/images)
     * - manifest.json (PWA manifest)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     * - assets (static assets in /public/assets)
     * - auth/callback (allow Supabase redirect)
     * - auth/confirm (allow email confirmation)
     * - auth/reset-password (allow password reset flow)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|manifest.json|robots.txt|sitemap.xml|assets).*)",
  ],
}
