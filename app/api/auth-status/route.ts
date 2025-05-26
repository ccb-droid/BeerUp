import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// This endpoint can be used to check authentication status
// without going through middleware
export async function GET() {
  const cookieStore = cookies()
  const authCookie = cookieStore.get("sb-thkpfeuwwyocnbavgsqn-auth-token")

  return NextResponse.json({
    status: "ok",
    isAuthenticated: !!authCookie?.value,
    authCookie: authCookie
      ? {
          name: authCookie.name,
          value: "***REDACTED***", // Don't expose the actual token
          exists: true,
        }
      : null,
    allCookies: cookieStore.getAll().map((c) => c.name),
  })
}
