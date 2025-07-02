"use server";

import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, Tables } from "@/lib/supabase/types";
import { revalidatePath } from "next/cache";
import type { FullReview } from "@/lib/types";
import { reviewSchema, updateReviewSchema, type ReviewInput, type UpdateReviewInput, type ReviewFilter } from "@/lib/validations/review";

export async function addReview(
  formData: FormData
): Promise<{ success: boolean; error?: string; reviewId?: string }> {
  try {
    const supabase = await createClient();
    
    // Get and validate authentication
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Action - Auth error:", authError);
      return { success: false, error: "Authentication error occurred." };
    }

    if (!user) {
      console.error("Action - No authenticated user found");
      return { success: false, error: "User not authenticated." };
    }

    console.log("Action - Authenticated user:", { id: user.id, email: user.email });

    const beerId = formData.get("beerId") as string;
    const ratingString = formData.get("rating") as string;
    const reviewText = formData.get("reviewText") as string | null;
    const imageFile = formData.get("imageFile") as File | null;

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

    // Handle image upload if provided
    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const fileName = `reviews/${user.id}/${Date.now()}-${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("beer-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error("Action - Image upload failed:", uploadError);
        return { success: false, error: `Image upload failed: ${uploadError.message}` };
      }

      const { data: publicUrlData } = supabase.storage
        .from("beer-images")
        .getPublicUrl(uploadData.path);
      
      imageUrl = publicUrlData.publicUrl;
    }

    const reviewData: TablesInsert<"reviews"> = {
      beer_id: beerId,
      user_id: user.id,
      rating: rating,
      review_text: reviewText || null,
      image_url: imageUrl,
      // typically_drinks can be omitted to use database default or set explicitly
      // typically_drinks: false,
    };

    console.log("Action - Creating review with data:", {
      beer_id: reviewData.beer_id,
      user_id: reviewData.user_id,
      rating: reviewData.rating
    });

    const { data: newReview, error: insertError } = await supabase
      .from("reviews")
      .insert(reviewData)
      .select("id")
      .single();

    if (insertError || !newReview?.id) {
      console.error("Action - Error inserting review:", insertError);
      
      // Handle specific RLS errors
      if (insertError?.code === '42501') {
        return {
          success: false,
          error: "Permission denied. Please try logging out and back in.",
        };
      }
      
      return {
        success: false,
        error: insertError?.message || "Could not submit review.",
      };
    }

    console.log("Action - Successfully created review:", newReview.id);

    // Revalidate the beer detail page and potentially beer listings if they show review summaries
    revalidatePath(`/beers/${beerId}`);
    revalidatePath("/beers"); // If your main beer listing shows average ratings etc.
    // Consider revalidating user profile pages if they list user\'s reviews

    return { success: true, reviewId: newReview.id };
  } catch (error) {
    console.error("Action - Unexpected error in addReview:", error);
    return {
      success: false,
      error: "An unexpected error occurred while adding the review.",
    };
  }
}

export async function getReviewsByBeerIdAction(
  beerId: string
): Promise<{ data: Tables<"reviews">[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("beer_id", beerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Action - Error fetching reviews by beer ID:", error);
      return { data: null, error: "Failed to fetch reviews." };
    }
    return { data, error: null };
  } catch (error) {
    console.error("Action - Unexpected error fetching reviews by beer ID:", error);
    return { data: null, error: "Failed to fetch reviews." };
  }
}

export async function getUserReviewForBeerAction(
  beerId: string
): Promise<{ data: Tables<"reviews"> | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated. Cannot fetch user-specific review." };
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("beer_id", beerId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Action - Error fetching user review for beer:", error);
      return { data: null, error: "Failed to fetch user review." };
    }
    return { data, error: null };
  } catch (error) {
    console.error("Action - Unexpected error fetching user review for beer:", error);
    return { data: null, error: "Failed to fetch user review." };
  }
}

// New server action to get all of current user's reviews with beer details
export async function getUserFullReviewsAction(): Promise<{
  data: FullReview[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // If no user, return empty data. The component can decide to show a login prompt or "no reviews".
      return { data: [], error: null }; 
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("*, beer:beers!inner(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Action - Error fetching user's full reviews:", error);
      // Return empty data on error as well, to prevent breaking UI expecting an array.
      return { data: [], error: "Failed to load your reviews." }; 
    }

    return { data: data as FullReview[], error: null };
  } catch (error) {
    console.error("Action - Unexpected error fetching user's full reviews:", error);
    return { data: [], error: "Failed to load your reviews." };
  }
} 

export async function getOtherReviewsAction(
  beerId: string,
  userId: string | undefined,
  page: number,
  pageSize: number
): Promise<{ data: any[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const offset = page * pageSize;
    
    let query = supabase
      .from("reviews")
      .select(`
        *,
        profiles!inner(username)
      `)
      .eq("beer_id", beerId)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    // If userId is provided, exclude that user's reviews
    if (userId) {
      query = query.neq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Action - Error fetching other reviews:", error);
      return { data: null, error: "Failed to fetch other reviews." };
    }
    return { data, error: null };
  } catch (error) {
    console.error("Action - Unexpected error fetching other reviews:", error);
    return { data: null, error: "Failed to fetch other reviews." };
  }
}

export async function getRecentReviewsAction(
  page: number,
  pageSize: number
): Promise<{ data: any[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const offset = page * pageSize;

    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        beers!inner(*),
        profiles!inner(username)
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Action - Error fetching recent reviews:", error);
      return { data: null, error: "Failed to fetch recent reviews." };
    }
    return { data, error: null };
  } catch (error) {
    console.error("Action - Unexpected error fetching recent reviews:", error);
    return { data: null, error: "Failed to fetch recent reviews." };
  }
}

/**
 * Server action to get all reviews with optional filters
 */
export async function getReviews(filters?: ReviewFilter): Promise<Tables<"reviews">[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from("reviews")
    .select("*");

  if (filters?.beer_id) {
    query = query.eq("beer_id", filters.beer_id);
  }

  if (filters?.user_id) {
    query = query.eq("user_id", filters.user_id);
  }

  if (filters?.min_rating) {
    query = query.gte("rating", filters.min_rating);
  }

  if (filters?.max_rating) {
    query = query.lte("rating", filters.max_rating);
  }

  query = query
    .order("created_at", { ascending: false })
    .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 10) - 1);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Server action to get a review by ID
 */
export async function getReviewById(id: string): Promise<Tables<"reviews"> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Server action to get reviews by beer ID
 */
export async function getReviewsByBeer(beerId: string): Promise<Tables<"reviews">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("beer_id", beerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Server action to get reviews by user ID
 */
export async function getReviewsByUser(userId: string): Promise<Tables<"reviews">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Server action to add a review with validation
 */
export async function addReviewValidated(reviewData: ReviewInput): Promise<Tables<"reviews">> {
  const validated = reviewSchema.parse(reviewData);
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      ...validated,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/beer/${validated.beer_id}`);
  revalidatePath("/");

  return data;
}

/**
 * Server action to update a review
 */
export async function updateReview(reviewData: UpdateReviewInput): Promise<Tables<"reviews">> {
  const validated = updateReviewSchema.parse(reviewData);
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("reviews")
    .update({
      rating: validated.rating,
      review_text: validated.review_text,
      typically_drinks: validated.typically_drinks,
    })
    .eq("id", validated.id)
    .eq("user_id", user.id) // Ensure user can only update their own reviews
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/beer/${data.beer_id}`);
  revalidatePath("/");

  return data;
}

/**
 * Server action to delete a review
 */
export async function deleteReview(id: string): Promise<void> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // Ensure user can only delete their own reviews

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}