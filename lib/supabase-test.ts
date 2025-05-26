import { supabase } from "./supabase/client"

export async function testSupabaseConnection() {
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from("beers")
      .select("count()", { count: "exact" })
      .limit(0)

    if (connectionError) {
      return {
        success: false,
        message: "Failed to connect to Supabase",
        error: connectionError,
      }
    }

    // Test authentication configuration
    const authConfig = {
      url: supabase.supabaseUrl,
      key: supabase.supabaseKey,
      authUrl: `${supabase.supabaseUrl}/auth/v1`,
    }

    // Test table structure
    const tables = ["profiles", "beers", "reviews"]
    const tableResults = {}

    for (const table of tables) {
      const { error } = await supabase.from(table).select("count()", { count: "exact" }).limit(0)
      tableResults[table] = error ? `Error: ${error.message}` : "OK"
    }

    // Test authentication
    const { data: authTest, error: authError } = await supabase.auth.getSession()

    return {
      success: true,
      message: "Supabase connection successful",
      config: authConfig,
      tables: tableResults,
      auth: authError ? `Error: ${authError.message}` : "OK",
      session: authTest?.session ? "Active session found" : "No active session",
    }
  } catch (error) {
    return {
      success: false,
      message: "Unexpected error testing Supabase connection",
      error,
    }
  }
}
