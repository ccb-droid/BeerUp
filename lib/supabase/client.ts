import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://thkpfeuwwyocnbavgsqn.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoa3BmZXV3d3lvY25iYXZnc3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NDc1MzYsImV4cCI6MjA2MzEyMzUzNn0.p-ho5a9n9iIQkYh90Sgc0Uz7ZztTBmRmLtMrcLhAaFM"

// Create a single supabase client for the entire app
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// Export the singleton instance
export const supabase = getSupabaseClient()
