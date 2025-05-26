"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function DirectSignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [dob, setDob] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      // Step 1: Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error("No user returned from signUp")
      }

      setResult({
        step: "auth",
        success: true,
        message: "Auth user created successfully",
        user: authData.user,
      })

      // Step 2: Create the profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        username,
        date_of_birth: dob,
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        throw profileError
      }

      setResult((prev) => ({
        ...prev,
        step: "profile",
        success: true,
        message: "Profile created successfully",
      }))

      // Step 3: Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      setResult((prev) => ({
        ...prev,
        step: "signin",
        success: true,
        message: "Signed in successfully",
      }))

      // Redirect to home page
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Signup error:", error)
      setResult({
        success: false,
        message: "Error during signup",
        error,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Direct Signup</CardTitle>
          <CardDescription>Create an account bypassing middleware</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
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
              />
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
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
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          {result && (
            <div
              className={`mt-4 p-3 rounded-md ${
                result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              <p className="font-medium">{result.message}</p>
              {result.error && (
                <pre className="mt-2 text-xs overflow-auto max-h-40">{JSON.stringify(result.error, null, 2)}</pre>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
