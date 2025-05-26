"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Beer, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/toast-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/"
  const { signIn } = useAuth()
  const { showToast } = useToast()

  // Validation function
  const validateForm = () => {
    const errors: string[] = []

    if (!email.trim()) {
      errors.push("Email is required")
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push("Email format is invalid")
    }

    if (!password) {
      errors.push("Password is required")
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setValidationErrors([])

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        setError(error.message || "Invalid email or password")
        throw error
      }

      // Show success message
      showToast("Logged in successfully", "success")

      // Small delay to let the auth state update, then redirect
      setTimeout(() => {
        router.push(redirectTo)
        router.refresh()
      }, 10)
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Invalid email or password")
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
          <CardTitle className="text-2xl text-center">Welcome to BeerUp</CardTitle>
          <CardDescription className="text-center">Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Please fix the following errors:</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className={validationErrors.some((e) => e.includes("Email")) ? "border-red-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className={validationErrors.some((e) => e.includes("Password")) ? "border-red-500" : ""}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
