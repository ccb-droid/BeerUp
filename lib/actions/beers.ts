"use server";

import { createClient } from "../supabase/server";
import type { Beer, NewBeer } from "../types";
import { beerSchema, type BeerInput, type BeerSearch } from "../validations/beer";

/**
 * Server action to get all beers
 */
export async function getBeers(): Promise<Beer[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("beers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Server Action - getBeers:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Server Action - getBeers unexpected error:", error);
    return [];
  }
}

/**
 * Server action to get a beer by ID
 */
export async function getBeerById(id: string): Promise<Beer | null> {
  if (!id) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("beers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Server Action - getBeerById:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Server Action - getBeerById unexpected error:", error);
    return null;
  }
}

/**
 * Server action to search beers
 */
export async function searchBeers(query: string): Promise<Beer[]> {
  if (!query?.trim()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const searchTerm = `%${query.trim()}%`;
    
    const { data, error } = await supabase
      .from("beers")
      .select("*")
      .or(`name.ilike.${searchTerm},brewery.ilike.${searchTerm},style.ilike.${searchTerm}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Server Action - searchBeers:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Server Action - searchBeers unexpected error:", error);
    return [];
  }
}

/**
 * Server action to create a new beer
 */
export async function createBeer(beerData: NewBeer): Promise<Beer | null> {
  try {
    // Validate required fields
    if (!beerData.name?.trim() || !beerData.brewery?.trim()) {
      console.error("Server Action - createBeer: Beer name and brewery are required");
      return null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("beers")
      .insert({
        ...beerData,
        name: beerData.name.trim(),
        brewery: beerData.brewery.trim(),
        style: beerData.style?.trim() || "",
      })
      .select()
      .single();

    if (error) {
      console.error("Server Action - createBeer:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Server Action - createBeer unexpected error:", error);
    return null;
  }
}

/**
 * Server action to find or create a beer
 */
export async function findOrCreateBeer(
  name: string, 
  brewery: string, 
  style: string,
  imageUrl?: string
): Promise<Beer | null> {
  if (!name?.trim() || !brewery?.trim()) {
    return null;
  }

  try {
    const supabase = await createClient();
    
    // Try to find existing beer first
    const { data: existing, error: findError } = await supabase
      .from("beers")
      .select("*")
      .eq("name", name.trim())
      .eq("brewery", brewery.trim())
      .eq("style", style.trim())
      .maybeSingle();

    if (findError) {
      console.error("Server Action - findOrCreateBeer search error:", findError);
      return null;
    }

    if (existing) {
      return existing;
    }

    // Create new beer if not found
    const { data: newBeer, error: createError } = await supabase
      .from("beers")
      .insert({
        name: name.trim(),
        brewery: brewery.trim(),
        style: style.trim(),
        image_url: imageUrl || null,
      })
      .select()
      .single();

    if (createError) {
      console.error("Server Action - findOrCreateBeer create error:", createError);
      return null;
    }

    return newBeer;
  } catch (error) {
    console.error("Server Action - findOrCreateBeer unexpected error:", error);
    return null;
  }
}

/**
 * Server action to add a new beer with validation
 */
export async function addBeer(beerData: BeerInput): Promise<Beer> {
  const validated = beerSchema.parse(beerData);
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("beers")
    .insert(validated)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Server action to update a beer
 */
export async function updateBeer(id: string, beerData: Partial<BeerInput>): Promise<Beer> {
  const validated = beerSchema.partial().parse(beerData);
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("beers")
    .update(validated)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Server action to delete a beer
 */
export async function deleteBeer(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("beers")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
} 