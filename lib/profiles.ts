import { supabase } from "./supabase/client"
import type { Database } from "./database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type UpdateProfile = Database["public"]["Tables"]["profiles"]["Update"]

export async function getProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data as Profile
}

export async function updateProfile(userId: string, profile: UpdateProfile) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...profile,
      updated_at: new Date().toISOString().split("T")[0],
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating profile:", error)
    return null
  }

  return data as Profile
}
