// This file ensures environment variables are available
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://thkpfeuwwyocnbavgsqn.supabase.co"
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoa3BmZXV3d3lvY25iYXZnc3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NDc1MzYsImV4cCI6MjA2MzEyMzUzNn0.p-ho5a9n9iIQkYh90Sgc0Uz7ZztTBmRmLtMrcLhAaFM"

// Log environment variables to help with debugging
if (typeof window !== "undefined") {
  console.log("Environment variables loaded:", {
    url: supabaseUrl ? "Set" : "Not set",
    key: supabaseAnonKey ? "Set" : "Not set",
  })
}