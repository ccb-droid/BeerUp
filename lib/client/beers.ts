import { createClientBeersService } from "../services/beers";
import type { Beer, NewBeer } from "../types";

const beersService = createClientBeersService();

/**
 * Client-side beer operations
 * These can be used in components that run on the client
 */

export async function getBeersClient(): Promise<Beer[]> {
  const result = await beersService.getAllBeers();
  
  if (result.error) {
    console.error("Client - getBeersClient:", result.error);
    return [];
  }
  
  return result.data || [];
}

export async function getBeerByIdClient(id: string): Promise<Beer | null> {
  if (!id) {
    return null;
  }

  const result = await beersService.getBeerById(id);
  
  if (result.error) {
    console.error("Client - getBeerByIdClient:", result.error);
    return null;
  }
  
  return result.data;
}

export async function searchBeersClient(query: string): Promise<Beer[]> {
  if (!query?.trim()) {
    return [];
  }

  const result = await beersService.searchBeers(query);
  
  if (result.error) {
    console.error("Client - searchBeersClient:", result.error);
    return [];
  }
  
  return result.data || [];
}

export async function createBeerClient(beerData: NewBeer): Promise<Beer | null> {
  const result = await beersService.createBeer(beerData);
  
  if (result.error) {
    console.error("Client - createBeerClient:", result.error);
    return null;
  }
  
  return result.data;
}

export async function findOrCreateBeerClient(
  name: string, 
  brewery: string, 
  style: string,
  uploadedImageUrls: string[]
): Promise<Beer | null> {
  if (!name?.trim() || !brewery?.trim()) {
    return null;
  }

  const result = await beersService.findOrCreateBeer(name, brewery, style || "", uploadedImageUrls);
  
  if (result.error) {
    console.error("Client - findOrCreateBeerClient:", result.error);
    return null;
  }
  
  return result.data;
} 