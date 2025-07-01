import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// This endpoint can be used to check authentication status
// without going through middleware
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get session and user info
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Test database connection with current auth context
    let profileCheck = null
    
    try {
      // Check if profile exists for current user
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, username")
          .eq("id", user.id)
          .single()
        
        profileCheck = { profile, error: profileError }
      }
    } catch (dbError) {
      console.error("Database check failed:", dbError)
    }
    
    const response = {
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        user_id: session?.user?.id || null,
        expires_at: session?.expires_at || null,
        error: sessionError
      },
      user: {
        exists: !!user,
        id: user?.id || null,
        email: user?.email || null,
        error: userError
      },
      profileCheck
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error("Auth status check failed:", error)
    return NextResponse.json({
      error: "Failed to check auth status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
