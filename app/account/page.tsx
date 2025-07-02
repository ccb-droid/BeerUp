"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth/context"
import { getUserProfile, updateUserProfile } from "@/lib/auth"

export default function AccountPage() {
  const [username, setUsername] = useState("")
  const [dob, setDob] = useState("")
  const [email, setEmail] = useState("")
  const [notifications, setNotifications] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { user, signOut } = useAuth()

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      setEmail(user.email || "")

      const profile = await getUserProfile(user.id)
      if (profile) {
        setUsername(profile.username || "")
        setDob(profile.date_of_birth || "")
        setNotifications(profile.notifications_enabled)
      }
    }

    loadProfile()
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const updatedProfile = await updateUserProfile(user.id, {
        username,
        date_of_birth: dob,
      })

      if (!updatedProfile) {
        throw new Error("Failed to update profile")
      }

      setSuccess("Profile updated successfully")
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("Password update not implemented in this demo")
  }

  const handleNotificationsUpdate = async (value: boolean) => {
    if (!user) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const updatedProfile = await updateUserProfile(user.id, {
        notifications_enabled: value,
      })

      if (!updatedProfile) {
        throw new Error("Failed to update notifications")
      }

      setNotifications(value)
      setSuccess("Notification settings updated")
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    signOut()
  }

  if (!user) {
    return (
      <div className="container max-w-2xl py-6 space-y-6">
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">You need to be logged in to view this page.</p>
          <Button asChild>
            <Link href="/auth/login?redirectTo=/account">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Account Settings</h1>
      </div>

      {error && <div className="bg-destructive/15 text-destructive p-3 rounded-md">{error}</div>}
      {success && <div className="bg-green-100 text-green-800 p-3 rounded-md">{success}</div>}

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
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

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled={true} readOnly />
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed directly. Contact support for assistance.
                  </p>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" required disabled={isLoading} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" required disabled={isLoading} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" required disabled={isLoading} />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={handleNotificationsUpdate}
                  disabled={isLoading}
                />
                <Label htmlFor="notifications">Enable email notifications</Label>
              </div>

              <Button type="button" onClick={handleLogout} variant="destructive" disabled={isLoading}>
                Log Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
