"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { testSupabaseConnection } from "@/lib/supabase-test"
import { supabase } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SupabaseTestPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("password123")
  const [authResult, setAuthResult] = useState<any>(null)

  async function runConnectionTest() {
    setLoading(true)
    const results = await testSupabaseConnection()
    setTestResults(results)
    setLoading(false)
  }

  async function createTestAccount() {
    setAuthLoading(true)
    setAuthResult(null)

    try {
      // Try to sign up with the test account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: "TestUser",
            date_of_birth: "2000-01-01",
          },
        },
      })

      if (error) {
        setAuthResult({
          success: false,
          message: `Sign up failed: ${error.message}`,
          error,
        })
      } else {
        setAuthResult({
          success: true,
          message: "Sign up successful",
          user: data.user,
          session: data.session,
        })

        // Create profile if sign up was successful
        if (data.user) {
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            username: "TestUser",
            date_of_birth: "2000-01-01",
            notifications_enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (profileError) {
            setAuthResult((prev) => ({
              ...prev,
              profileCreation: `Failed: ${profileError.message}`,
            }))
          } else {
            setAuthResult((prev) => ({
              ...prev,
              profileCreation: "Success",
            }))
          }
        }
      }
    } catch (error) {
      setAuthResult({
        success: false,
        message: "Unexpected error during sign up",
        error,
      })
    } finally {
      setAuthLoading(false)
    }
  }

  async function testSignIn() {
    setAuthLoading(true)
    setAuthResult(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setAuthResult({
          success: false,
          message: `Sign in failed: ${error.message}`,
          error,
        })
      } else {
        setAuthResult({
          success: true,
          message: "Sign in successful",
          user: data.user,
          session: data.session,
        })
      }
    } catch (error) {
      setAuthResult({
        success: false,
        message: "Unexpected error during sign in",
        error,
      })
    } finally {
      setAuthLoading(false)
    }
  }

  async function signOut() {
    setAuthLoading(true)

    try {
      await supabase.auth.signOut()
      setAuthResult({
        success: true,
        message: "Signed out successfully",
      })
    } catch (error) {
      setAuthResult({
        success: false,
        message: "Error signing out",
        error,
      })
    } finally {
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    runConnectionTest()
  }, [])

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Supabase Integration Test</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Test</CardTitle>
            <CardDescription>Test the connection to your Supabase project</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Testing connection...</div>
            ) : testResults ? (
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-gray-100">
                  <h3 className="font-medium mb-2">Connection Status:</h3>
                  <p className={testResults.success ? "text-green-600" : "text-red-600"}>{testResults.message}</p>

                  {testResults.success && (
                    <>
                      <h3 className="font-medium mt-4 mb-2">Tables:</h3>
                      <ul className="space-y-1">
                        {Object.entries(testResults.tables).map(([table, status]) => (
                          <li key={table}>
                            {table}:{" "}
                            <span className={status === "OK" ? "text-green-600" : "text-red-600"}>{status}</span>
                          </li>
                        ))}
                      </ul>

                      <h3 className="font-medium mt-4 mb-2">Authentication:</h3>
                      <p className={testResults.auth === "OK" ? "text-green-600" : "text-red-600"}>
                        {testResults.auth}
                      </p>
                      <p className="mt-1">{testResults.session}</p>
                    </>
                  )}

                  {!testResults.success && testResults.error && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Error Details:</h3>
                      <pre className="bg-red-50 p-3 rounded text-sm overflow-auto">
                        {JSON.stringify(testResults.error, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">No test results yet</div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={runConnectionTest} disabled={loading}>
              {loading ? "Testing..." : "Run Connection Test"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Test</CardTitle>
            <CardDescription>Test creating an account and signing in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={authLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={authLoading}
                />
              </div>

              {authResult && (
                <div className={`p-4 rounded-md ${authResult.success ? "bg-green-50" : "bg-red-50"}`}>
                  <h3 className="font-medium mb-2">Result:</h3>
                  <p className={authResult.success ? "text-green-600" : "text-red-600"}>{authResult.message}</p>

                  {authResult.profileCreation && (
                    <p className="mt-2">
                      Profile creation:{" "}
                      <span className={authResult.profileCreation === "Success" ? "text-green-600" : "text-red-600"}>
                        {authResult.profileCreation}
                      </span>
                    </p>
                  )}

                  {authResult.user && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">User:</h3>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                        {JSON.stringify(authResult.user, null, 2)}
                      </pre>
                    </div>
                  )}

                  {authResult.error && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Error Details:</h3>
                      <pre className="bg-red-100 p-3 rounded text-sm overflow-auto">
                        {JSON.stringify(authResult.error, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button onClick={createTestAccount} disabled={authLoading}>
              {authLoading ? "Creating..." : "Create Test Account"}
            </Button>
            <Button onClick={testSignIn} disabled={authLoading} variant="outline">
              {authLoading ? "Signing in..." : "Test Sign In"}
            </Button>
            <Button onClick={signOut} disabled={authLoading} variant="outline">
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
