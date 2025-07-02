import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ResetPasswordForm } from "@/components/features/auth"

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // If there's no active session, redirect to forgot password page
  // This handles the case where someone tries to access this page directly
  if (!session) {
    console.log("[Reset Password] No session found, redirecting to forgot password")
    redirect("/forgot-password?error=no_session")
  }

  return <ResetPasswordForm />
} 