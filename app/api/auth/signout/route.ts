import { signOut } from "@/lib/actions/auth"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await signOut()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API - Sign out error:", error)
    return NextResponse.json(
      { message: "An error occurred during sign out" },
      { status: 500 }
    )
  }
} 