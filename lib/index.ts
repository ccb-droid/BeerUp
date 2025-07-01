// Types
export * from "./types";

// Data layer (repositories)
export * from "./data/beers";
export * from "./data/reviews";
export * from "./data/profiles";

// Service layer (business logic)
export * from "./services/beers-client";
export * from "./services/beers-server";

// Server actions
export * from "./actions/beers";

// Client utilities
export * from "./client/beers";

// Supabase clients
// Note: Server createClient is not exported here to prevent client-side bundling
// Import directly from "./supabase/server" in server components and API routes
export { supabase } from "./supabase/client";

// Auth utilities
export * from "./auth";

// Storage utilities
export * from "./storage";

// Utils
export * from "./utils"; 