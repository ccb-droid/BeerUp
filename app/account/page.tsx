"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth/context"
import { getUserProfile, updateUserProfile } from "@/lib/auth"
import { changePasswordSchema } from "@/lib/validations/auth"
import { supabase } from "@/lib/supabase/client"

export default function AccountPage() {
  const [username, setUsername] = useState("")
  const [dob, setDob] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Password change form fields
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const { user, signOut } = useAuth()

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      setEmail(user.email || "")

      const profile = await getUserProfile(user.id)
      if (profile) {
        setUsername(profile.username || "")
        setDob(profile.date_of_birth || "")
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

      if (updatedProfile) {
        return
      }

      setSuccess("Profile updated successfully")
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.email) {
      setError("User email not found")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Validate the form data using the existing schema
      const validatedFields = changePasswordSchema.safeParse({
        currentPassword,
        newPassword,
        confirmPassword,
      })

      if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors
        const errorMessages = Object.values(errors).flat()
        setError(errorMessages.join(", "))
        return
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) {
        setError("Current password is incorrect")
        return
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setError(updateError.message || "Failed to update password")
        return
      }

      setSuccess("Password updated successfully")
      // Clear form fields
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred while updating password")
      }
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
            <Link href="/login?redirectTo=/account">Sign In</Link>
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
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
                  <Input 
                    id="current-password" 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required 
                    disabled={isLoading} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required 
                    disabled={isLoading} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                    disabled={isLoading} 
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t">
                <Button type="button" onClick={handleLogout} variant="destructive" disabled={isLoading}>
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
