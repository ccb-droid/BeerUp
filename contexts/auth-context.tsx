"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, username: string, dob: string) => Promise<{ error: any; user: any }>
  signOut: () => Promise<{ success: boolean; error?: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial session load
    // For @supabase/ssr, getSession() on the client can synchronously return the cached session
    // or trigger a fetch if needed. The onAuthStateChange listener will handle updates.
    supabase.auth.getSession().then(({ data: { session: initialSession } }: { data: { session: Session | null } }) => {
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      setIsLoading(false)
    }).catch((error: any) => {
      console.error("Error getting initial session:", error)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, currentSession: Session | null) => {
      console.log("Auth state changed (onAuthStateChange):", _event, currentSession?.user?.email)
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      // setIsLoading might be needed here if an event signifies a loading state, 
      // but typically it's false after initial load or auth event.
      // If an auth event happens (like sign out), user/session become null, which is fine.
      // If a sign in happens, user/session get populated.
      // If a token refresh happens silently, this might also fire with TOKEN_REFRESHED event.
      setIsLoading(false) // Ensure loading is false after any auth event resolution
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      // onAuthStateChange will handle setting user and session if successful
      // No need to manually setSession/setUser here if onAuthStateChange is robust
      return { error }
    } catch (error) {
      console.error("Error in signIn:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, username: string, dob: string) => {
    try {
      const { data: existingUsers, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .limit(1)

      if (checkError) {
        console.error("Error checking existing user:", checkError)
        // Decide if this is fatal or if sign-up should proceed with caution
      } else if (existingUsers && existingUsers.length > 0) {
        return { error: new Error("Username already exists"), user: null }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            date_of_birth: dob,
          },
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      })

      if (error) {
        console.error("Sign up error:", error)
        return { error, user: null }
      }

      if (!data.user) {
        // This case might indicate email confirmation is pending or another issue
        // onAuthStateChange should eventually reflect the user state
        return { error: new Error("User object not returned from signUp. Email confirmation may be pending."), user: null }
      }

      // Profile creation should ideally happen after email confirmation or be robust to it.
      // For now, creating it immediately after signUp call if data.user exists.
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
        // If profile creation fails, the user exists in auth.users but not profiles.
        // This is a state that needs careful handling (e.g., retry, cleanup, or allow user to proceed without profile).
        return { error: profileError, user: data.user } // Return user but with profile error
      }
      
      // onAuthStateChange will handle setting user and session
      return { error: null, user: data.user }
    } catch (error) {
      console.error("Unexpected error in signUp:", error)
      return { error, user: null }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      // onAuthStateChange will handle setting user and session to null
      if (error) {
        console.error("Error in signOut:", error)
        return { success: false, error }
      }
      return { success: true }
    } catch (error) {
      console.error("Error in signOut:", error)
      return { success: false, error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`,
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
