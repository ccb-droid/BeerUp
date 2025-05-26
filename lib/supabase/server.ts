import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://thkpfeuwwyocnbavgsqn.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoa3BmZXV3d3lvY25iYXZnc3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NDc1MzYsImV4cCI6MjA2MzEyMzUzNn0.p-ho5a9n9iIQkYh90Sgc0Uz7ZztTBmRmLtMrcLhAaFM"

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}
