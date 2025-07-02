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
    const { error } = await (await supabase).auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=invalid_code`)
    }
    console.log("[Auth Callback] Successfully exchanged code for session")
  }

  // Check if this is a password recovery flow based on type parameter
  if (type === "recovery") {
    console.log("[Auth Callback] Detected password recovery, redirecting to reset password page")
    return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
  }

  // Default redirect to homepage for other auth flows (signup confirmation, etc.)
  console.log("[Auth Callback] Default redirect to homepage")
  return NextResponse.redirect(requestUrl.origin)
}
