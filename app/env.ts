// This file ensures environment variables are available
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Log environment variables to help with debugging
if (typeof window !== "undefined") {
  console.log("Environment variables loaded:", {
    url: supabaseUrl ? "Set" : "Not set",
    key: supabaseAnonKey ? "Set" : "Not set",
  })
}