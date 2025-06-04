"use server";

import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, Tables } from "@/lib/database.types";
import { revalidatePath } from "next/cache";
import { createServerReviewService } from "@/lib/services/reviewService";
import type { FullReview } from "@/lib/types";

const reviewService = createServerReviewService();

export async function addReview(
  formData: FormData
): Promise<{ success: boolean; error?: string; reviewId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated." };
  }

  const beerId = formData.get("beerId") as string;
  const ratingString = formData.get("rating") as string;
  const reviewText = formData.get("reviewText") as string | null;

  if (!beerId || !ratingString) {
    return { success: false, error: "Missing beer ID or rating." };
  }

  const rating = parseInt(ratingString, 10);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return {
      success: false,
      error: "Invalid rating. Must be between 1 and 5.",
    };
  }

  const reviewData: TablesInsert<"reviews"> = {
    beer_id: beerId,
    user_id: user.id,
    rating: rating,
    review_text: reviewText || null,
    // typically_drinks can be omitted to use database default or set explicitly
    // typically_drinks: false,
  };

  const { data: newReview, error: serviceError } = await reviewService.insertReview(reviewData);

  if (serviceError || !newReview?.id) {
    console.error("Action - Error inserting review via service:", serviceError);
    return {
      success: false,
      error: (serviceError as any)?.message || "Could not submit review via service.",
    };
  }

  // Revalidate the beer detail page and potentially beer listings if they show review summaries
  revalidatePath(`/beers/${beerId}`);
  revalidatePath("/beers"); // If your main beer listing shows average ratings etc.
  // Consider revalidating user profile pages if they list user\'s reviews

  return { success: true, reviewId: newReview.id };
}

export async function getReviewsAction(
  beerId: string
): Promise<{ data: Tables<"reviews">[] | null; error: string | null }> {
  const { data, error } = await reviewService.getReviewsByBeerId(beerId);

  if (error) {
    return { data: null, error: (error as any)?.message || "Failed to fetch reviews." };
  }
  return { data, error: null };
}

export async function getUserReviewForBeerAction(
  beerId: string
): Promise<{ data: Tables<"reviews"> | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "User not authenticated. Cannot fetch user-specific review." };
  }

  const { data, error } = await reviewService.getUserReviewForBeer(beerId, user.id);

  if (error) {
    return { data: null, error: (error as any)?.message || "Failed to fetch user review." };
  }
  return { data, error: null };
}

// New server action to get all of current user's reviews with beer details
export async function getUserFullReviewsAction(): Promise<{
  data: FullReview[] | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // If no user, return empty data. The component can decide to show a login prompt or "no reviews".
    return { data: [], error: null }; 
  }

  const { data, error: serviceError } = await reviewService.getUserFullReviews(
    user.id
  );

  if (serviceError) {
    console.error("Action - Error fetching user's full reviews:", serviceError);
    // Return empty data on error as well, to prevent breaking UI expecting an array.
    return { data: [], error: "Failed to load your reviews." }; 
  }

  return { data, error: null };
} 