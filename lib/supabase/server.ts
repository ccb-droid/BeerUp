import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "./types"

// Note: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are read from process.env
// Ensure they are available in your server environment.

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // In a server environment, you might want to log this error or handle it differently
    // rather than throwing an error that could crash the server process for some requests.
    // However, for essential config, throwing can be appropriate to prevent misconfiguration.
    console.error("Supabase URL and Anon Key must be defined in environment variables for server client.")
    throw new Error("Supabase server client environment variables not set.")
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
          // console.warn("Supabase server client (set cookie):", error) // Optional: log warning
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
          // console.warn("Supabase server client (remove cookie):", error) // Optional: log warning
        }
      },
    },
  })
}

// Service role client for server actions that need to bypass RLS
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Supabase URL and Service Role Key must be defined in environment variables for service role client.")
    throw new Error("Supabase service role client environment variables not set.")
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
