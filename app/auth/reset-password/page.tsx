"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Beer, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth/client"
import { useToast } from "@/components/toast-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  useEffect(() => {
    const checkPasswordRecoverySession = async () => {
      const { supabase } = await import("@/lib/supabase/client")
      
      console.log("[Reset Password] Checking password recovery session...")
      
      // Listen for auth state changes to detect password recovery
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("[Reset Password] Auth state change:", event, session?.user?.email)
        if (event === "PASSWORD_RECOVERY") {
          console.log("[Reset Password] PASSWORD_RECOVERY event detected, enabling form")
          setIsValidSession(true)
        } else if (event === "SIGNED_IN" && session) {
          console.log("[Reset Password] SIGNED_IN event with session, enabling form")
          setIsValidSession(true)
        }
      })

      // Check current session
      const { data: { session } } = await supabase.auth.getSession()
      console.log("[Reset Password] Current session:", session?.user?.email)
      if (session) {
        console.log("[Reset Password] Valid session found, enabling form")
        setIsValidSession(true)
      }

      return () => subscription.unsubscribe()
    }

    checkPasswordRecoverySession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 9) {
      setError("Password must be at least 9 characters long")
      return
    }

    setIsLoading(true)

    try {
      // Import supabase client directly for this operation
      const { supabase } = await import("@/lib/supabase/client")
      
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message || "Failed to update password")
        showToast(error.message || "Failed to update password", "error")
        return
      }

      setSuccess(true)
      showToast("Password updated successfully!", "success")
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "An error occurred")
      showToast(err.message || "An error occurred", "error")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-center">Password Updated</CardTitle>
            <CardDescription className="text-center">
              Your password has been successfully updated
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              You can now sign in with your new password. You'll be redirected to the login page shortly.
            </p>
            <Button asChild>
              <Link href="/auth/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading state while checking session
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <Beer className="h-12 w-12 text-amber-500" />
            </div>
            <CardTitle className="text-2xl text-center">Verifying Reset Link</CardTitle>
            <CardDescription className="text-center">
              Please wait while we verify your password reset link...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              If this takes too long, the link may have expired. Please request a new password reset.
            </p>
            <Button asChild>
              <Link href="/auth/forgot-password">
                Request New Reset Link
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <Beer className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={9}
              />
              <p className="text-sm text-muted-foreground">Password must be at least 9 characters long</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <Beer className="h-12 w-12 text-amber-500" />
            </div>
            <CardTitle className="text-2xl text-center">Loading...</CardTitle>
            <CardDescription className="text-center">
              Please wait while we load the password reset form...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
} 