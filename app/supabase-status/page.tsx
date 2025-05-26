"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SupabaseStatusPage() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  async function checkConnection() {
    try {
      setStatus("loading")

      // Basic connection test without using aggregate functions
      // Just try to fetch a single row with limit 1 instead of using count()
      const { data, error } = await supabase.from("beers").select("id").limit(1)

      if (error) {
        throw error
      }

      // Check auth status
      const { data: authData, error: authError } = await supabase.auth.getSession()

      setStatus("connected")
      setDetails({
        url: supabase.supabaseUrl,
        authUrl: `${supabase.supabaseUrl}/auth/v1`,
        hasKey: !!supabase.supabaseKey,
        isAuthenticated: !!authData?.session,
        tables: {
          beers: "Connected",
        },
      })
    } catch (error) {
      console.error("Supabase connection error:", error)
      setStatus("error")
      setDetails(error)
    }
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Status</CardTitle>
          <CardDescription>Check if your Supabase connection is working</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && <p>Testing connection...</p>}

          {status === "connected" && (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">✓ Connected to Supabase</p>
              <div className="text-sm space-y-1">
                <p>
                  <strong>URL:</strong> {details?.url}
                </p>
                <p>
                  <strong>Auth URL:</strong> {details?.authUrl}
                </p>
                <p>
                  <strong>API Key:</strong> {details?.hasKey ? "Present" : "Missing"}
                </p>
                <p>
                  <strong>Authentication:</strong> {details?.isAuthenticated ? "Logged in" : "Not logged in"}
                </p>
                <p>
                  <strong>Tables:</strong> {details?.tables?.beers}
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-2">
              <p className="text-red-600 font-medium">✗ Connection failed</p>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{JSON.stringify(details, null, 2)}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={checkConnection} disabled={status === "loading"}>
            {status === "loading" ? "Testing..." : "Test Connection"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
