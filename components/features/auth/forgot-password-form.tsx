"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Beer } from "lucide-react"
import { useForgotPassword } from "@/lib/hooks/use-auth"

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const forgotPasswordMutation = useForgotPassword()

  useEffect(() => {
    const error = searchParams.get("error")
    if (error === "expired") {
      setUrlError("Your password reset link is invalid or has been used. This can happen if your email provider scanned the link for security. Please request a new reset link.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setUrlError(null) // Clear any previous URL error
    
    const formData = new FormData(e.currentTarget)
    await forgotPasswordMutation.mutateAsync(formData)
    
    setIsLoading(false)
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
            {(forgotPasswordMutation.error || urlError) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {urlError || 
                   (forgotPasswordMutation.error instanceof Error 
                    ? forgotPasswordMutation.error.message 
                    : "An error occurred sending the reset email")}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || forgotPasswordMutation.isPending}>
              {isLoading || forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 