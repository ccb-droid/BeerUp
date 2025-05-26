import { NextResponse } from "next/server"

// This endpoint can be used to check authentication status
// without going through middleware
export async function GET() {
  return NextResponse.json({
    status: "ok",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
  })
}
