import { forgotPassword } from "@/lib/actions/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const result = await forgotPassword(formData)
    
    if (result?.message && !result.message.includes("sent")) {
      return NextResponse.json(
        { message: result.message, errors: result.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: result?.message || "Password reset email sent!" 
    })
  } catch (error) {
    console.error("API - Forgot password error:", error)
    return NextResponse.json(
      { message: "An error occurred sending reset email" },
      { status: 500 }
    )
  }
} 