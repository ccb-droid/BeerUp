// This is now a Server Component (no "use client")

import { getBeers } from "@/lib/actions/beers" // Server Action to fetch beers
import { getUserFullReviewsAction } from "@/lib/actions/reviewActions" // Import action for user reviews
import { HomePageClientContent } from "@/app/home-page-client-content" // The new Client Component
import { type FullReview } from "@/lib/types" // Import FullReview for creating the map

export default async function HomePage() {
  // Fetch initial beers and user-specific reviews in parallel
  const [beersResult, userReviewsResult] = await Promise.all([
    getBeers(), // Assuming getBeers() returns Beer[] or similar directly
    getUserFullReviewsAction() // This returns { data: FullReview[] | null, error: string | null }
  ]);

  // Extract data. getBeers() is assumed to return the array directly or an object with a data property.
  // For this example, let's assume getBeers() returns the array directly as per previous context.
  const initialBeers = beersResult; // Or beersResult.data if it has that structure

  let userRatingsMap: Map<string, number> | undefined = undefined;
  if (userReviewsResult.data) {
    userRatingsMap = new Map();
    userReviewsResult.data.forEach((review: FullReview) => {
      // Ensure review.beer_id or review.beer.id is correctly accessed based on FullReview structure
      // Assuming FullReview has review.beer_id directly or review.beer.id
      // From previous definition: export type FullReview = Review & { beer: Beer; };
      // So it would be review.beer.id. However, the base Review type might have beer_id.
      // Let's check the Review type from lib/types/index.ts again. It has beer_id.
      // And FullReview is Review & { beer: Beer; }, so review.beer_id should be present.
      if (review.beer_id && userRatingsMap) { // Check that userRatingsMap is defined
        userRatingsMap.set(review.beer_id, review.rating);
      }
    });
  }

  return (
    <HomePageClientContent 
      initialBeers={initialBeers} 
      userReviews={userReviewsResult.data} 
      userReviewsError={userReviewsResult.error}
      userRatingsMap={userRatingsMap} // Pass the new map
    />
  );
}
