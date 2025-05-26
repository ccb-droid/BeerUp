import { supabase } from "./supabase/client"
import type { Database } from "./database.types"

type Review = Database["public"]["Tables"]["reviews"]["Row"]
type NewReview = Database["public"]["Tables"]["reviews"]["Insert"]
type UpdateReview = Database["public"]["Tables"]["reviews"]["Update"]

export async function getReviewsByBeerId(beerId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles:user_id (username)
    `)
    .eq("beer_id", beerId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reviews:", error)
    return []
  }

  return data
}

export async function getUserReviews(userId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      beers:beer_id (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user reviews:", error)
    return []
  }

  return data
}

export async function getReviewById(id: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles:user_id (username),
      beers:beer_id (*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching review:", error)
    return null
  }

  return data
}

export async function createReview(review: NewReview) {
  const { data, error } = await supabase.from("reviews").insert(review).select().single()

  if (error) {
    console.error("Error creating review:", error)
    return null
  }

  return data as Review
}

export async function updateReview(id: string, review: UpdateReview) {
  const { data, error } = await supabase.from("reviews").update(review).eq("id", id).select().single()

  if (error) {
    console.error("Error updating review:", error)
    return null
  }

  return data as Review
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", id)

  if (error) {
    console.error("Error deleting review:", error)
    return false
  }

  return true
}
