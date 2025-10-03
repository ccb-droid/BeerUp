"use server";

import { createClient } from "../supabase/server";
import type { Beer, NewBeer } from "../types";
import { beerSchema, type BeerInput, beerPricingSchema, type BeerPricingInput } from "../validations/beer";

/**
 * Server action to get all preorder beers
 */
export async function getBeers(): Promise<Beer[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("beers")
      .select("*")
      .eq("preorder", true)
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
 * Server action to get all beers for admin (no preorder filter)
 */
export async function getAllBeers(): Promise<Beer[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("beers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Server Action - getAllBeers:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Server Action - getAllBeers unexpected error:", error);
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
    console.error("Action `findOrCreateBeer`: Missing name or brewery");
    return null;
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    const beerDetails = { name: name.trim(), brewery: brewery.trim(), style: style.trim() };
    console.log("Action `findOrCreateBeer`: Searching for beer", { userId, ...beerDetails });

    // Try to find existing beer first
    const { data: existing, error: findError } = await supabase
      .from("beers")
      .select("*")
      .eq("name", beerDetails.name)
      .eq("brewery", beerDetails.brewery)
      .eq("style", beerDetails.style)
      .maybeSingle();

    if (findError) {
      console.error("Action `findOrCreateBeer`: Search error", { userId, ...beerDetails, error: findError });
      return null;
    }

    if (existing) {
      console.log("Action `findOrCreateBeer`: Found existing beer", { userId, beerId: existing.id });
      return existing;
    }

    console.log("Action `findOrCreateBeer`: Beer not found, creating new one", { userId, ...beerDetails, imageUrl });
    // Create new beer if not found
    const { data: newBeer, error: createError } = await supabase
      .from("beers")
      .insert({
        ...beerDetails,
        image_url: imageUrl || null,
      })
      .select()
      .single();

    if (createError) {
      console.error("Action `findOrCreateBeer`: Create error", { 
        userId, 
        ...beerDetails,
        isRLSError: createError.code === '42501',
        error: createError 
      });
      return null;
    }

    console.log("Action `findOrCreateBeer`: Successfully created new beer", { userId, beerId: newBeer.id });
    return newBeer;
  } catch (error) {
    console.error("Action `findOrCreateBeer`: Unexpected error", { name, brewery, style, error });
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

/**
 * Server action to update beer pricing (price, MOQ, and preorder status)
 */
export async function updateBeerPricing(id: string, pricingData: BeerPricingInput): Promise<Beer | null> {
  try {
    const validated = beerPricingSchema.parse(pricingData);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("beers")
      .update({
        price: validated.price,
        moq: validated.moq,
        preorder: validated.preorder
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Server Action - updateBeerPricing:", error);
      return null;
    }

    console.log("Server Action - updateBeerPricing: Successfully updated", {
      beerId: id,
      price: validated.price,
      moq: validated.moq,
      preorder: validated.preorder
    });

    return data;
  } catch (error) {
    console.error("Server Action - updateBeerPricing unexpected error:", error);
    return null;
  }
} 