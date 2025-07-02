"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Beer } from "lucide-react"
import { toast } from "sonner"
import { resetUserPassword } from "@/lib/auth/api"

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const error = searchParams.get("error")
    if (error === "expired") {
      setUrlError("Your password reset link is invalid or has been used. This can happen if your email provider scanned the link for security. Please request a new reset link.")
    } else if (error === "no_session") {
      setUrlError("Your password reset session has expired. Please request a new reset link.")
    }
  }, [searchParams])

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return

    if (countdown === 0) {
      router.push("/login")
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setUrlError(null) // Clear any previous URL error
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const email = formData.get("email") as string

      // Call Supabase directly so the PKCE code verifier is stored in the user's browser.
      const { error } = await resetUserPassword(email)

      if (error) {
        throw new Error(error.message)
      }

      // Show success toast with countdown
      toast.success("Password reset email sent!", {
        description: `Check your email for the reset link. Redirecting to login in 3 seconds...`,
        duration: Infinity, // Keep toast visible during countdown
      })

      // Start countdown
      setCountdown(3)

    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send reset email. Please try again."
      toast.error("Error", {
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
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
            Enter your email address and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {urlError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {urlError}
                </AlertDescription>
              </Alert>
            )}

            {countdown !== null && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  Password reset email sent! Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="me@example.com"
                required
                disabled={isLoading || countdown !== null}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || countdown !== null}>
              {isLoading ? "Sending..." : countdown !== null ? `Redirecting in ${countdown}...` : "Send Reset Email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 