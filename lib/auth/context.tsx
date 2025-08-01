"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js"
import {
  checkUsernameExists,
  createUserProfile,
} from "./profile"
import {
  signInUser,
  signUpUser,
  signOutUser,
  resetUserPassword,
} from "./api"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, username: string, dob: string) => Promise<{ error: Error | null; user: User | null }>
  signOut: () => Promise<{ success: boolean; error?: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data: { session: initialSession } }: { data: { session: Session | null } }) => {
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      setIsLoading(false)
    }).catch((error: Error) => {
      console.error("Error getting initial session:", error)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, currentSession: Session | null) => {
      console.log("Auth state changed (onAuthStateChange):", _event, currentSession?.user?.email)
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await signInUser(email, password)
      return { error }
    } catch (error) {
      console.error("Error in signIn:", error)
      return { error: error instanceof Error ? error : new Error(String(error)) }
    }
  }

  const signUp = async (email: string, password: string, username: string, dob: string) => {
    try {
      // Check if username exists
      const { exists: usernameExists, error: checkError } =
        await checkUsernameExists(username)

      if (checkError) {
        console.error("Error checking existing user:", checkError)
      } else if (usernameExists) {
        return { error: new Error("Username already exists"), user: null }
      }

      // Sign up the user
      const { data, error: signUpError } = await signUpUser(
        email,
        password,
        username,
        dob
      )

      if (signUpError) {
        console.error("Sign up error:", signUpError)
        return { error: signUpError, user: null }
      }

      if (!data.user) {
        return { error: new Error("User object not returned from signUp. Email confirmation may be pending."), user: null }
      }

      // Create user profile
      const { error: profileError } = await createUserProfile(
        data.user,
        username,
        dob
      )

      if (profileError) {
        console.error("Profile creation error:", profileError)
        return { error: profileError, user: data.user }
      }

      return { error: null, user: data.user }
    } catch (error) {
      console.error("Unexpected error in signUp:", error)
      return { error: error instanceof Error ? error : new Error(String(error)), user: null }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await signOutUser()
      if (error) {
        console.error("Error in signOut:", error)
        return { success: false, error }
      }
      return { success: true }
    } catch (error) {
      console.error("Error in signOut:", error)
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await resetUserPassword(email)
      return { error }
    } catch (error) {
      console.error("Error in resetPassword:", error)
      return { error: error instanceof Error ? error : new Error(String(error)) }
    }
  }

  const refreshSession = async () => {
    try {
      setIsLoading(true)
      const { data: { session: refreshedSession } } = await supabase.auth.getSession()
      console.log("Manual session refresh:", refreshedSession?.user?.email)
      setSession(refreshedSession)
      setUser(refreshedSession?.user ?? null)
    } catch (error) {
      console.error("Error refreshing session:", error)
    } finally {
      setIsLoading(false)
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