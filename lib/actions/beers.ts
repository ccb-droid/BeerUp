"use server";

import { createServerBeersService } from "../services/beers";
import type { Beer, NewBeer } from "../types";

const beersService = createServerBeersService();

/**
 * Server action to get all beers
 */
export async function getBeers(): Promise<Beer[]> {
  const result = await beersService.getAllBeers();
  
  if (result.error) {
    console.error("Server Action - getBeers:", result.error);
    return [];
  }
  
  return result.data || [];
}

/**
 * Server action to get a beer by ID
 */
export async function getBeerById(id: string): Promise<Beer | null> {
  if (!id) {
    return null;
  }

  const result = await beersService.getBeerById(id);
  
  if (result.error) {
    console.error("Server Action - getBeerById:", result.error);
    return null;
  }
  
  return result.data;
}

/**
 * Server action to search beers
 */
export async function searchBeers(query: string): Promise<Beer[]> {
  if (!query?.trim()) {
    return [];
  }

  const result = await beersService.searchBeers(query);
  
  if (result.error) {
    console.error("Server Action - searchBeers:", result.error);
    return [];
  }
  
  return result.data || [];
}

/**
 * Server action to create a new beer
 */
export async function createBeer(beerData: NewBeer): Promise<Beer | null> {
  const result = await beersService.createBeer(beerData);
  
  if (result.error) {
    console.error("Server Action - createBeer:", result.error);
    return null;
  }
  
  return result.data;
}

/**
 * Server action to find or create a beer
 */
export async function findOrCreateBeer(
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
    console.error("Server Action - findOrCreateBeer:", result.error);
    return null;
  }
  
  return result.data;
} 