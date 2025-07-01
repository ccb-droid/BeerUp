import { supabase } from "../supabase/client";
import { BeersRepository } from "../data/beers";
import type { Beer, NewBeer, ApiResponse } from "../types";

/**
 * Client-side business logic layer for beer operations
 * Only uses the browser Supabase client
 */
export class ClientBeersService {
  private readonly repository: BeersRepository;

  constructor() {
    this.repository = new BeersRepository(supabase);
  }

  async getAllBeers(): Promise<ApiResponse<Beer[]>> {
    try {
      const beers = await this.repository.findAll();
      return { data: beers, error: null };
    } catch (error) {
      console.error("ClientBeersService: Failed to get all beers:", error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  async getBeerById(id: string): Promise<ApiResponse<Beer>> {
    try {
      const beer = await this.repository.findById(id);
      return { data: beer, error: null };
    } catch (error) {
      console.error("ClientBeersService: Failed to get beer by id:", error);
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

      const beers = await this.repository.search(query.trim());
      return { data: beers, error: null };
    } catch (error) {
      console.error("ClientBeersService: Failed to search beers:", error);
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

      // Check if beer already exists
      if (beerData.name && beerData.brewery && beerData.style) {
        const existing = await this.repository.findExisting(
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

      const beer = await this.repository.create({
        ...beerData,
        name: beerData.name.trim(),
        brewery: beerData.brewery.trim(),
        style: beerData.style?.trim() || "",
      });

      return { data: beer, error: null };
    } catch (error) {
      console.error("ClientBeersService: Failed to create beer:", error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  async findOrCreateBeer(name: string, brewery: string, style: string, uploadedImageUrls: string[]): Promise<ApiResponse<Beer>> {
    try {
      // Try to find existing beer first
      const existing = await this.repository.findExisting(name.trim(), brewery.trim(), style.trim());
      if (existing) {
        return { data: existing, error: null };
      }

      // Create new beer if not found
      const newBeer = await this.repository.create({
        name: name.trim(),
        brewery: brewery.trim(),
        style: style.trim(),
        images: uploadedImageUrls,
      });

      return { data: newBeer, error: null };
    } catch (error) {
      console.error("ClientBeersService: Failed to find or create beer:", error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }
}

// Factory function
export function createClientBeersService() {
  return new ClientBeersService();
} 