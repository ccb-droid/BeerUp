"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export default function AuthDebugPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [cookieData, setCookieData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    setLoading(true)
    try {
      // Get session from Supabase
      const { data, error } = await supabase.auth.getSession()
      setSessionData({ data, error })

      // Parse cookies
      const cookies = document.cookie.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        if (key) acc[key] = value
        return acc
      }, {})
      setCookieData(cookies)
    } catch (error) {
      console.error("Error checking auth:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    checkAuth()
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current authentication state from useAuth hook</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Authenticated:</strong> {user ? "Yes" : "No"}
              </p>
              {user && (
                <>
                  <p>
                    <strong>User ID:</strong> {user.id}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Data</CardTitle>
            <CardDescription>Raw session data from Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading session data...</p>
            ) : (
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={checkAuth} disabled={loading}>
              Refresh
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookie Data</CardTitle>
            <CardDescription>Browser cookies that may affect authentication</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading cookie data...</p>
            ) : (
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60">
                {JSON.stringify(cookieData, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
