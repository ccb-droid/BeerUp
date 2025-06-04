import { type SupabaseClient } from "@supabase/supabase-js";
import type { 
  Database, 
  Review, 
  NewReview, 
  UpdateReview,
  ReviewWithProfile,
  ReviewWithBeer,
  ReviewWithBoth,
  PaginatedResponse
} from "../types";

/**
 * Pure database access layer for reviews
 * All functions require a supabase client to be passed in
 */
export class ReviewsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findByBeerId(beerId: string): Promise<ReviewWithProfile[]> {
    const { data, error } = await this.client
      .from("reviews")
      .select(`
        *,
        profiles:user_id (username)
      `)
      .eq("beer_id", beerId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch reviews for beer: ${error.message}`);
    }

    return data || [];
  }

  async findByUserId(userId: string): Promise<ReviewWithBeer[]> {
    const { data, error } = await this.client
      .from("reviews")
      .select(`
        *,
        beers:beer_id (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user reviews: ${error.message}`);
    }

    return data || [];
  }

  async findById(id: string): Promise<ReviewWithBoth | null> {
    const { data, error } = await this.client
      .from("reviews")
      .select(`
        *,
        profiles:user_id (username),
        beers:beer_id (*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch review: ${error.message}`);
    }

    return data;
  }

  async create(review: NewReview): Promise<Review> {
    const { data, error } = await this.client
      .from("reviews")
      .insert(review)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create review: ${error.message}`);
    }

    return data;
  }

  async update(id: string, review: UpdateReview): Promise<Review> {
    const { data, error } = await this.client
      .from("reviews")
      .update(review)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update review: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("reviews")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete review: ${error.message}`);
    }
  }

  async findOtherReviews(
    beerId: string, 
    excludeUserId: string | undefined, 
    page: number, 
    pageSize: number
  ): Promise<PaginatedResponse<ReviewWithProfile>> {
    let query = this.client
      .from("reviews")
      .select(`
        *,
        profiles:user_id (username)
      `)
      .eq("beer_id", beerId);

    if (excludeUserId) {
      query = query.neq("user_id", excludeUserId);
    }
    
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      throw new Error(`Failed to fetch other reviews: ${error.message}`);
    }

    return {
      data: data || [],
      error: null,
      hasMore: data?.length === pageSize
    };
  }
}

// Convenience functions for backward compatibility
export function createReviewsRepository(client: SupabaseClient<Database>) {
  return new ReviewsRepository(client);
} 