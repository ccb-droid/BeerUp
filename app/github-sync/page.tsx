"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GitBranch, Check, AlertCircle } from "lucide-react"

export default function GitHubSyncPage() {
  const [syncStatus, setSyncStatus] = useState<"checking" | "synced" | "not-synced" | "error">("checking")
  const [commitInfo, setCommitInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkGitHubSync()
  }, [])

  async function checkGitHubSync() {
    setSyncStatus("checking")
    setError(null)

    try {
      // This is a mock implementation since we can't actually check GitHub sync status from the browser
      // In a real implementation, you would have a server endpoint that checks this

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For demo purposes, we'll just show some mock data
      const mockCommitInfo = {
        lastCommit: {
          message: "Fix middleware error and update UI components",
          author: "Your Name",
          date: new Date().toISOString(),
          hash: "a1b2c3d4e5f6g7h8i9j0",
        },
        branch: "main",
        repository: "beer-review-app",
        syncedAt: new Date().toISOString(),
      }

      setCommitInfo(mockCommitInfo)
      setSyncStatus("synced")
    } catch (err) {
      console.error("Error checking GitHub sync:", err)
      setError("Failed to check GitHub sync status")
      setSyncStatus("error")
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-6">GitHub Sync Status</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GitBranch className="mr-2 h-5 w-5" />
            Repository Status
          </CardTitle>
          <CardDescription>Check if your code is synced with GitHub</CardDescription>
        </CardHeader>

        <CardContent>
          {syncStatus === "checking" && (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Checking sync status...</span>
            </div>
          )}

          {syncStatus === "synced" && commitInfo && (
            <div className="space-y-4">
              <div className="flex items-center text-green-600">
                <Check className="mr-2 h-5 w-5" />
                <span className="font-medium">Your code is synced with GitHub</span>
              </div>

              <div className="bg-muted p-4 rounded-md space-y-2">
                <p>
                  <strong>Repository:</strong> {commitInfo.repository}
                </p>
                <p>
                  <strong>Branch:</strong> {commitInfo.branch}
                </p>
                <p>
                  <strong>Last Commit:</strong> {commitInfo.lastCommit.message}
                </p>
                <p>
                  <strong>Author:</strong> {commitInfo.lastCommit.author}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(commitInfo.lastCommit.date).toLocaleString()}
                </p>
                <p>
                  <strong>Commit Hash:</strong> {commitInfo.lastCommit.hash}
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Last synced: {new Date(commitInfo.syncedAt).toLocaleString()}
              </p>
            </div>
          )}

          {syncStatus === "not-synced" && (
            <div className="flex items-center text-amber-600 py-6">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span className="font-medium">Your code is not synced with GitHub</span>
            </div>
          )}

          {syncStatus === "error" && (
            <div className="flex items-center text-red-600 py-6">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span className="font-medium">{error || "An error occurred"}</span>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button onClick={checkGitHubSync} disabled={syncStatus === "checking"}>
            {syncStatus === "checking" ? "Checking..." : "Check Sync Status"}
          </Button>

          <div className="ml-auto text-sm text-muted-foreground">
            <p>Note: This is a simulated check. To actually verify GitHub sync, check your GitHub repository.</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
