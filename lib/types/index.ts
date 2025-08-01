// Re-export database types for easier importing
import type { Database } from "../supabase/types";

export type { Database };

// Specific table types
export type Beer = Database["public"]["Tables"]["beers"]["Row"];
export type NewBeer = Database["public"]["Tables"]["beers"]["Insert"];
export type UpdateBeer = Database["public"]["Tables"]["beers"]["Update"];

export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type NewReview = Database["public"]["Tables"]["reviews"]["Insert"];
export type UpdateReview = Database["public"]["Tables"]["reviews"]["Update"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type NewProfile = Database["public"]["Tables"]["profiles"]["Insert"];
export type UpdateProfile = Database["public"]["Tables"]["profiles"]["Update"];

export type Waitlist = Database["public"]["Tables"]["waitlist"]["Row"];
export type NewWaitlist = Database["public"]["Tables"]["waitlist"]["Insert"];
export type UpdateWaitlist = Database["public"]["Tables"]["waitlist"]["Update"];

// Extended types with relations based on actual database relationships
export type ReviewWithProfile = Review & {
  profiles: Pick<Profile, 'username' | 'id'> | null;
};

export type ReviewWithBeer = Review & {
  beers: Beer | null;
};

export type ReviewWithBoth = Review & {
  profiles: Pick<Profile, 'username' | 'id'> | null;
  beers: Beer | null;
};

// Type for a review that includes full beer details (not nullable)
export type FullReview = Review & {
  beer: Beer;
};

// Beer with review statistics
export type BeerWithStats = Beer & {
  review_count?: number;
  average_rating?: number;
  reviews?: Review[];
};

// Profile with review statistics
export type ProfileWithStats = Profile & {
  review_count?: number;
  reviews?: Review[];
};

// API Response types
export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  error: string | null;
  hasMore?: boolean;
  totalCount?: number;
}; 