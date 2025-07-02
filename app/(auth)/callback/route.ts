import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")
  const error = requestUrl.searchParams.get("error")
  const errorCode = requestUrl.searchParams.get("error_code")
  const errorDescription = requestUrl.searchParams.get("error_description")

  console.log("[Auth Callback] Request URL:", requestUrl.toString())
  console.log("[Auth Callback] Code:", code)
  console.log("[Auth Callback] Type:", type)
  console.log("[Auth Callback] Error:", error)

  // Handle errors from Supabase
  if (error) {
    console.error("[Auth Callback] Supabase error:", { error, errorCode, errorDescription })
    
    if (errorCode === "otp_expired" || error === "access_denied") {
      // The link was likely consumed by email prefetching or has expired
      console.log("[Auth Callback] OTP expired or access denied - likely email prefetching issue")
      return NextResponse.redirect(`${requestUrl.origin}/forgot-password?error=expired`)
    }
    
    // For other errors, redirect to login with error
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${error}`)
  }

  if (code) {
    const supabase = createClient()
    const { error, data } = await (await supabase).auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[Auth Callback] Error exchanging code for session:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=invalid_code`)
    }
    console.log("[Auth Callback] Successfully exchanged code for session")
    
    // If we have a successful session exchange, check if this is a password recovery
    // by checking the user's metadata or the session context
    if (data?.session) {
      console.log("[Auth Callback] Session data:", data.session)
    }
  }

  // Check if this is a password recovery flow based on type parameter
  if (type === "recovery") {
    console.log("[Auth Callback] Detected password recovery, redirecting to reset password page")
    return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
  }

  // Also check for password recovery by looking at the referer or other indicators
  const referer = request.headers.get("referer")
  if (referer && referer.includes("recovery")) {
    console.log("[Auth Callback] Detected password recovery from referer, redirecting to reset password page")
    return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
  }

  // If we have a code but no explicit type, check if this might be a password recovery
  if (code && !type) {
    // In some cases, the type parameter might be missing but this is still a recovery flow
    // We can detect this by checking if the user was just created vs existing user
    const supabase = createClient()
    const { data: user } = await (await supabase).auth.getUser()
    
    if (user?.user) {
      console.log("[Auth Callback] User found, checking if this might be a recovery flow")
      // If user exists and we just exchanged a code, this could be password recovery
      // Let's be safe and check the URL pattern or other indicators
      const urlString = requestUrl.toString()
      if (urlString.includes("verify") || urlString.includes("recovery")) {
        console.log("[Auth Callback] URL suggests recovery flow, redirecting to reset password")
        return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
      }
    }
  }

  // Default redirect to homepage for other auth flows (signup confirmation, etc.)
  console.log("[Auth Callback] Default redirect to homepage")
  return NextResponse.redirect(requestUrl.origin)
}
