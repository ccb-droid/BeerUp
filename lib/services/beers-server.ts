import { createClient } from "../supabase/server";
import { BeersRepository } from "../data/beers";
import type { Beer, NewBeer, ApiResponse } from "../types";

/**
 * Server-side business logic layer for beer operations
 * Only uses the server Supabase client
 */
export class ServerBeersService {
  private async getRepository(): Promise<BeersRepository> {
    const client = await createClient();
    return new BeersRepository(client);
  }

  async getAllBeers(): Promise<ApiResponse<Beer[]>> {
    try {
      const repo = await this.getRepository();
      const beers = await repo.findAll();
      return { data: beers, error: null };
    } catch (error) {
      console.error("ServerBeersService: Failed to get all beers:", error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  async getBeerById(id: string): Promise<ApiResponse<Beer>> {
    try {
      const repo = await this.getRepository();
      const beer = await repo.findById(id);
      return { data: beer, error: null };
    } catch (error) {
      console.error("ServerBeersService: Failed to get beer by id:", error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  async searchBeers(query: string): Promise<ApiResponse<Beer[]>> {
    try {
      if (!query.trim()) {
        return { data: [], error: null };
      }

      const repo = await this.getRepository();
      const beers = await repo.search(query.trim());
      return { data: beers, error: null };
    } catch (error) {
      console.error("ServerBeersService: Failed to search beers:", error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  async createBeer(beerData: NewBeer): Promise<ApiResponse<Beer>> {
    try {
      // Validate required fields
      if (!beerData.name?.trim() || !beerData.brewery?.trim()) {
        return { 
          data: null, 
          error: "Beer name and brewery are required" 
        };
      }

      const repo = await this.getRepository();
      
      // Check if beer already exists
      if (beerData.name && beerData.brewery && beerData.style) {
        const existing = await repo.findExisting(
          beerData.name.trim(), 
          beerData.brewery.trim(), 
          beerData.style.trim()
        );
        
        if (existing) {
          return { 
            data: existing, 
            error: null // Return existing beer, not an error
          };
        }
      }

      const beer = await repo.create({
        ...beerData,
        name: beerData.name.trim(),
        brewery: beerData.brewery.trim(),
        style: beerData.style?.trim() || "",
      });

      return { data: beer, error: null };
    } catch (error) {
      console.error("ServerBeersService: Failed to create beer:", error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  async findOrCreateBeer(name: string, brewery: string, style: string, imageUrl?: string): Promise<ApiResponse<Beer>> {
    try {
      const repo = await this.getRepository();
      
      // Try to find existing beer first
      const existing = await repo.findExisting(name.trim(), brewery.trim(), style.trim());
      if (existing) {
        return { data: existing, error: null };
      }

      // Create new beer if not found
      const newBeer = await repo.create({
        name: name.trim(),
        brewery: brewery.trim(),
        style: style.trim(),
        image_url: imageUrl || null,
      });

      return { data: newBeer, error: null };
    } catch (error) {
      console.error("ServerBeersService: Failed to find or create beer:", error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }
}

// Factory function
export function createServerBeersService() {
  return new ServerBeersService();
} 