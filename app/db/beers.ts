import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

type Beer = Database["public"]["Tables"]["beers"]["Row"];
type NewBeer = Database["public"]["Tables"]["beers"]["Insert"];

export async function getBeers() {
  const { data, error } = await supabase.from("beers").select("*").order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching beers:", error);
    return [];
  }

  return data as Beer[];
}

export async function getBeerById(id: string) {
  const { data, error } = await supabase.from("beers").select("*").eq("id", id).single();

  if (error) {
    console.error("Error fetching beer:", error);
    return null;
  }

  return data as Beer;
}

export async function searchBeers(query: string) {
  const { data, error } = await supabase
    .from("beers")
    .select("*")
    .or(`name.ilike.%${query}%,brewery.ilike.%${query}%,style.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching beers:", error);
    return [];
  }

  return data as Beer[];
}

export async function createBeer(beer: NewBeer) {
  const { data, error } = await supabase.from("beers").insert(beer).select().single();

  if (error) {
    console.error("Error creating beer:", error);
    return null;
  }
  return data as Beer;
}

export async function findExistingBeer(name: string, brewery: string, style: string): Promise<Beer | null> {
  const { data, error } = await supabase
    .from("beers")
    .select("id")
    .eq("name", name)
    .eq("brewery", brewery)
    .eq("style", style)
    .limit(1);

  if (error) {
    console.error("Error finding existing beer:", error);
    return null;
  }

  if (data && data.length > 0) {
    return data[0] as Beer;
  }
  return null;
} 