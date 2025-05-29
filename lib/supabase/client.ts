import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Type guard to ensure env variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in environment variables.")
}

// Create and export the Supabase browser client instance
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
