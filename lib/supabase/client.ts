import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

// Note: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are read from process.env
// Ensure they are available in your client-side environment (e.g., prefixed with NEXT_PUBLIC_).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // In a client environment, you might want to log this error or display a message to the user.
  console.error("Supabase URL and Anon Key must be defined in environment variables for client.")
  // Depending on the app's needs, you might throw an error or return a non-functional client.
  // For this example, we'll throw an error to highlight misconfiguration.
  throw new Error("Supabase client environment variables not set.")
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})
