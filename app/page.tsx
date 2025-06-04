// This is now a Server Component (no "use client")

import { getBeers } from "@/lib/actions/beers" // Server Action to fetch beers
import { getUserFullReviewsAction } from "@/lib/actions/reviewActions" // Import action for user reviews
import { HomePageClientContent } from "@/app/home-page-client-content" // The new Client Component
import { type FullReview } from "@/lib/types" // Import FullReview for creating the map

export default async function HomePage() {
  // Fetch initial beers and user-specific reviews in parallel
  const [beersResult, userReviewsResult] = await Promise.all([
    getBeers(), 
    getUserFullReviewsAction() // This returns { data: FullReview[] | null, error: string | null }
  ]);

  const initialBeers = beersResult; 

  let userRatingsMap: Map<string, number> | undefined = undefined;
  if (userReviewsResult.data) {
    userRatingsMap = new Map();
    userReviewsResult.data.forEach((review: FullReview) => {
      // Ensure review.beer_id or review.beer.id is correctly accessed based on FullReview structure
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
