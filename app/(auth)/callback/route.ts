import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")

  console.log("[Auth Callback] Request URL:", requestUrl.toString())
  console.log("[Auth Callback] Code:", code)
  console.log("[Auth Callback] Type:", type)

  if (code) {
    const supabase = createClient()
    const { error } = await (await supabase).auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=invalid_code`)
    }
    console.log("[Auth Callback] Successfully exchanged code for session")
  }

  // Check if this is a password recovery flow based on type parameter
  if (type === "recovery") {
    console.log("[Auth Callback] Detected password recovery, redirecting to reset password page")
    return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password`)
  }

  // Default redirect to homepage for other auth flows (signup confirmation, etc.)
  console.log("[Auth Callback] Default redirect to homepage")
  return NextResponse.redirect(requestUrl.origin)
}
