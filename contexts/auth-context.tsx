"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, username: string, dob: string) => Promise<{ error: any; user: any }>
  signOut: () => Promise<{ success: boolean; error?: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setUser(data.session?.user ?? null)
    } catch (error) {
      console.error("Error refreshing session:", error)
    }
  }

  useEffect(() => {
    // Get initial session
    refreshSession().then(() => setIsLoading(false))

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (!error && data.session) {
        // Manually update the session and user
        setSession(data.session)
        setUser(data.user)
      }

      return { error }
    } catch (error) {
      console.error("Error in signIn:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, username: string, dob: string) => {
    try {
      // First, check if the user already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .limit(1)

      if (checkError) {
        console.error("Error checking existing user:", checkError)
      } else if (existingUsers && existingUsers.length > 0) {
        return { error: new Error("Username already exists"), user: null }
      }

      // For development, we'll use sign up which bypasses email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            date_of_birth: dob,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Sign up error:", error)
        return { error, user: null }
      }

      if (!data.user) {
        return { error: new Error("Failed to create user"), user: null }
      }

      // Create a profile for the user
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username,
        date_of_birth: dob,
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        return { error: profileError, user: null }
      }

      // For development, we'll auto-sign in the user
      if (!data.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          console.error("Auto sign-in error:", signInError)
          return { error: signInError, user: data.user }
        }

        // Manually update the session and user
        if (signInData.session) {
          setSession(signInData.session)
          setUser(signInData.user)
        }
      } else {
        // If we already have a session from signUp, use it
        setSession(data.session)
        setUser(data.user)
      }

      return { error: null, user: data.user }
    } catch (error) {
      console.error("Unexpected error in signUp:", error)
      return { error, user: null }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // Manually clear the session and user
      setSession(null)
      setUser(null)

      // Return success
      return { success: true }
    } catch (error) {
      console.error("Error in signOut:", error)
      return { success: false, error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      return { error }
    } catch (error) {
      console.error("Error in resetPassword:", error)
      return { error }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
