"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Beer, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/toast-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [dob, setDob] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const router = useRouter()
  const { signUp } = useAuth()
  const { showToast } = useToast()

  // Validation function
  const validateForm = () => {
    const errors: string[] = []

    if (!username.trim()) {
      errors.push("Username is required")
    } else if (username.length < 3) {
      errors.push("Username must be at least 3 characters")
    }

    if (!email.trim()) {
      errors.push("Email is required")
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push("Email format is invalid")
    }

    if (!password) {
      errors.push("Password is required")
    } else if (password.length < 6) {
      errors.push("Password must be at least 6 characters")
    }

    if (!dob) {
      errors.push("Date of birth is required")
    } else {
      const birthDate = new Date(dob)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 18) {
        errors.push("You must be at least 18 years old")
      }
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
      const { error, user } = await signUp(email, password, username, dob)

      if (error) {
        setError(error.message || "Error creating account")
        throw error
      }

      if (user) {
        showToast("Account created successfully! Welcome to BeerUp!", "success")
        // Small delay to let the auth state update
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 100)
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      setError(error.message || "Error creating account")
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
          <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Sign up to start reviewing your favorite beers</CardDescription>
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
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="beerLover42"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                className={validationErrors.some((e) => e.includes("Username")) ? "border-red-500" : ""}
              />
            </div>

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
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                disabled={isLoading}
                className={
                  validationErrors.some((e) => e.includes("Date of birth") || e.includes("18 years"))
                    ? "border-red-500"
                    : ""
                }
              />
              <p className="text-sm text-muted-foreground">You must be of legal drinking age to use this app.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className={validationErrors.some((e) => e.includes("Password")) ? "border-red-500" : ""}
              />
              <p className="text-sm text-muted-foreground">Password must be at least 9 characters long</p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
