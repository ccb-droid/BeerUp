import { signInWithEmail } from "@/lib/actions/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const result = await signInWithEmail(formData)
    
    if (result?.message || result?.errors) {
      return NextResponse.json(
        { message: result.message || "Validation errors", errors: result.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API - Sign in error:", error)
    return NextResponse.json(
      { message: "An error occurred during sign in" },
      { status: 500 }
    )
  }
} 