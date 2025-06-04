import { type SupabaseClient } from "@supabase/supabase-js";
import type { Database, Beer, NewBeer } from "../types";

/**
 * Pure database access layer for beers
 * All functions require a supabase client to be passed in
 */
export class BeersRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findAll(): Promise<Beer[]> {
    const { data, error } = await this.client
      .from("beers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch beers: ${error.message}`);
    }

    return data || [];
  }

  async findById(id: string): Promise<Beer | null> {
    const { data, error } = await this.client
      .from("beers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch beer: ${error.message}`);
    }

    return data;
  }

  async search(query: string): Promise<Beer[]> {
    const { data, error } = await this.client
      .from("beers")
      .select("*")
      .or(`name.ilike.%${query}%,brewery.ilike.%${query}%,style.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to search beers: ${error.message}`);
    }

    return data || [];
  }

  async create(beer: NewBeer): Promise<Beer> {
    const { data, error } = await this.client
      .from("beers")
      .insert(beer)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create beer: ${error.message}`);
    }

    return data;
  }

  async findExisting(name: string, brewery: string, style: string): Promise<Beer | null> {
    const { data, error } = await this.client
      .from("beers")
      .select("*")
      .eq("name", name)
      .eq("brewery", brewery)
      .eq("style", style)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to find existing beer: ${error.message}`);
    }

    return data;
  }
}

// Convenience functions for backward compatibility
export function createBeersRepository(client: SupabaseClient<Database>) {
  return new BeersRepository(client);
} 