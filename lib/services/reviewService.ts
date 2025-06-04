import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert, Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import type { FullReview } from "@/lib/types";

// Interface for the service methods
export interface ReviewService {
  insertReview: (reviewData: TablesInsert<"reviews">) => Promise<{ data: { id: string } | null; error: any }>;
  getReviewsByBeerId: (beerId: string) => Promise<{ data: Tables<"reviews">[] | null; error: any }>;
  getUserReviewForBeer: (beerId: string, userId: string) => Promise<{ data: Tables<"reviews"> | null; error: any }>;
  getUserFullReviews: (userId: string) => Promise<{ data: FullReview[] | null; error: any }>;
  getOtherReviews: (beerId: string, userId: string | undefined, page: number, pageSize: number) => Promise<{ data: any[] | null; error: any }>;
}

export function createServerReviewService(): ReviewService {
  // Note: Supabase client will be created inside each async method below

  async function insertReview(
    reviewData: TablesInsert<"reviews">
  ): Promise<{ data: { id: string } | null; error: any }> {
    try {
      const supabase = await createClient(); // Create client per call
      const { data, error } = await supabase
        .from("reviews")
        .insert(reviewData)
        .select("id")
        .single();

      if (error) {
        console.error("Service - Error inserting review:", error);
        return { data: null, error };
      }
      if (!data) {
        console.error("Service - Review insertion succeeded but no ID was returned.");
        return { data: null, error: { message: "Review submitted but failed to get ID." } };
      }
      return { data, error: null };
    } catch (e: any) {
      console.error("Service - Unexpected error inserting review:", e);
      return { data: null, error: e };
    }
  }

  async function getReviewsByBeerId(
    beerId: string
  ): Promise<{ data: Tables<"reviews">[] | null; error: any }> {
    try {
      const supabase = await createClient(); // Create client per call
      const { data, error } = await supabase
        .from("reviews")
        .select("*") // Consider specifying columns or related data like profiles
        .eq("beer_id", beerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Service - Error fetching reviews by beer ID:", error);
        return { data: null, error };
      }
      return { data, error: null };
    } catch (e: any) {
      console.error("Service - Unexpected error fetching reviews by beer ID:", e);
      return { data: null, error: e };
    }
  }

  async function getUserReviewForBeer(
    beerId: string,
    userId: string
  ): Promise<{ data: Tables<"reviews"> | null; error: any }> {
    try {
      const supabase = await createClient(); // Create client per call
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("beer_id", beerId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Service - Error fetching user review for beer:", error);
        return { data: null, error };
      }
      return { data, error: null };
    } catch (e: any) {
      console.error("Service - Unexpected error fetching user review for beer:", e);
      return { data: null, error: e };
    }
  }

  async function getUserFullReviews(
    userId: string
  ): Promise<{ data: FullReview[] | null; error: any }> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("reviews")
        .select("*, beer:beers!inner(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Service - Error fetching user's full reviews:", error);
        return { data: null, error };
      }
      return { data: data as FullReview[], error: null };
    } catch (e: any) {
      console.error("Service - Unexpected error fetching user's full reviews:", e);
      return { data: null, error: e };
    }
  }
  async function getOtherReviews(
    beerId: string,
    userId: string | undefined,
    page: number,
    pageSize: number
  ): Promise<{ data: any[] | null; error: any }> {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("reviews")
        .select(`
          *,
          profiles:user_id (username)
        `)
        .eq("beer_id", beerId);

      if (userId) {
        query = query.neq("user_id", userId);
      }

      query = query
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, error } = await query;

      if (error) {
        console.error("Service - Error fetching other reviews:", error);
        return { data: [], error };
      }

      return { data, error: null };
    } catch (e: any) {
      console.error("Service - Unexpected error fetching other reviews:", e);
      return { data: null, error: e };
    }
  }

    
  
  return {
    insertReview,
    getReviewsByBeerId,
    getUserReviewForBeer,
    getUserFullReviews,
    getOtherReviews,
  };
}

// The old individual exports are no longer needed as they are part of the service object
// export async function insertReview(...) { ... }
// export async function getReviewsByBeerIdService(...) { ... }
// export async function getUserReviewForBeerService(...) { ... } 