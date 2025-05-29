import { createClient } from '@/lib/supabase/server';

export async function checkAuth() {
  // Create a Supabase client instance for server-side operations
  const supabase = await createClient(); // Await because createClient is now async

  // Use getUser() for a more secure check that revalidates the session with the server
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    // An error occurred, or the session is invalid (e.g., token expired and couldn't be refreshed)
    // console.error("[checkAuth] Error getting user:", error.message); // Optional: log the error
    return false;
  }

  return !!user; // Returns true if a user object exists, false otherwise
} 