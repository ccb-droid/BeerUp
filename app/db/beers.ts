// ⚠️ DEPRECATED: This file is kept for backward compatibility only
// 
// For new code, use:
// - Server actions: @/lib/actions/beers
// - Client components: @/lib/client/beers  
// - Direct repository access: @/lib/data/beers
// - Service layer: @/lib/services/beers

// Legacy file - use @/lib/client/beers or @/lib/actions/beers instead
import { getBeersClient } from "@/lib/client/beers";
import type { Beer, NewBeer } from "@/lib/types";
import { createBeersRepository } from "@/lib/data/beers";
import { type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export async function _getBeersFromDb(supabaseClient: SupabaseClient<Database>) {
  const repository = createBeersRepository(supabaseClient);
  try {
    return await repository.findAll();
  } catch (error) {
    console.error("Error fetching beers:", error);
    return [];
  }
}

export async function getBeersClientSide() {
  return getBeersClient();
}

export async function getBeerById(supabaseClient: SupabaseClient<Database>, id: string) {
  const repository = createBeersRepository(supabaseClient);
  try {
    return await repository.findById(id);
  } catch (error) {
    console.error("Error fetching beer:", error);
    return null;
  }
}

export async function searchBeers(supabaseClient: SupabaseClient<Database>, query: string) {
  const repository = createBeersRepository(supabaseClient);
  try {
    return await repository.search(query);
  } catch (error) {
    console.error("Error searching beers:", error);
    return [];
  }
}

export async function createBeer(supabaseClient: SupabaseClient<Database>, beer: NewBeer) {
  const repository = createBeersRepository(supabaseClient);
  try {
    return await repository.create(beer);
  } catch (error) {
    console.error("Error creating beer:", error);
    return null;
  }
}

export async function findExistingBeer(supabaseClient: SupabaseClient<Database>, name: string, brewery: string, style: string): Promise<Beer | null> {
  const repository = createBeersRepository(supabaseClient);
  try {
    return await repository.findExisting(name, brewery, style);
  } catch (error) {
    console.error("Error finding existing beer:", error);
    return null;
  }
} 