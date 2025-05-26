import { supabase } from "./supabase/client"
import type { Database } from "./database.types"

type Beer = Database["public"]["Tables"]["beers"]["Row"]
type NewBeer = Database["public"]["Tables"]["beers"]["Insert"]

export async function getBeers() {
  const { data, error } = await supabase.from("beers").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching beers:", error)
    return []
  }

  return data as Beer[]
}

export async function getBeerById(id: string) {
  const { data, error } = await supabase.from("beers").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching beer:", error)
    return null
  }

  return data as Beer
}

export async function searchBeers(query: string) {
  const { data, error } = await supabase
    .from("beers")
    .select("*")
    .or(`name.ilike.%${query}%,brewery.ilike.%${query}%,style.ilike.%${query}%`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error searching beers:", error)
    return []
  }

  return data as Beer[]
}

export async function createBeer(beer: NewBeer) {
  const { data, error } = await supabase.from("beers").insert(beer).select().single()

  if (error) {
    console.error("Error creating beer:", error)
    return null
  }

  return data as Beer
}
