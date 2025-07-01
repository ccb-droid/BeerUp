"use client"; // Marking functions within as usable in client components if they are, or this file exports hooks

import {
  getOtherReviewsAction,
  getUserReviewForBeerAction,
} from "@/lib/actions/reviewActions"; // Or from "@/app/actions/reviewActions" if you prefer that abstraction
import type { Tables } from "@/lib/database.types";

/**
 * Fetches all reviews for a specific beer.
 * Intended for use in client components.
 * @param beerId The ID of the beer.
 * @returns Promise resolving to reviews data or an error.
 */
export async function fetchReviewsForBeer(beerId: string): Promise<{
  data: Tables<"reviews">[] | null;
  error: string | null;
}> {
  try {
    // Directly calling the server action
    const result = await getOtherReviewsAction(beerId, undefined, 1, 10);
    return result;
  } catch (error) {
    console.error("Client - Error fetching reviews for beer:", error);
    return { data: null, error: "An unexpected error occurred while fetching reviews." };
  }
}

/**
 * Fetches the current logged-in user's review for a specific beer.
 * Intended for use in client components.
 * @param beerId The ID of the beer.
 * @returns Promise resolving to the user's review data or an error.
 */
export async function fetchUserReviewForBeer(beerId: string): Promise<{
  data: Tables<"reviews"> | null;
  error: string | null;
}> {
  try {
    // Directly calling the server action
    const result = await getUserReviewForBeerAction(beerId);
    return result;
  } catch (error) {
    console.error("Client - Error fetching user review for beer:", error);
    return { data: null, error: "An unexpected error occurred while fetching user review." };
  }
}

// Example of how you might use this with SWR or TanStack Query (optional)
// import useSWR from 'swr';
//
// export function useBeerReviews(beerId: string) {
//   const { data, error, isLoading } = useSWR(
//     beerId ? `/api/beers/${beerId}/reviews` : null, // Or a unique key for the action
//     () => fetchReviewsForBeer(beerId)
//   );
// 
//   return {
//     reviews: data?.data,
//     error: data?.error || error?.message,
//     isLoading,
//   };
// }
//
// export function useUserBeerReview(beerId: string) {
//   const { data, error, isLoading } = useSWR(
//     beerId ? `/api/beers/${beerId}/user-review` : null, // Or a unique key for the action
//     () => fetchUserReviewForBeer(beerId)
//   );
// 
//   return {
//     review: data?.data,
//     error: data?.error || error?.message,
//     isLoading,
//   };
// } 