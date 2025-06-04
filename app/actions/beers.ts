// Re-export from lib/actions for backward compatibility
export { 
  getBeers,
  getBeerById,
  searchBeers,
  createBeer,
  findOrCreateBeer
} from "@/lib/actions/beers";

// Re-export types for backward compatibility
export type { Beer } from "@/lib/types"; 