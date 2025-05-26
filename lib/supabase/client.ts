import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey =
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a single supabase client for the entire app
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// Export the singleton instance
export const supabase = getSupabaseClient()
