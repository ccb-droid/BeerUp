// This is now a Server Component (no "use client")

import { getUserFullReviewsAction } from "@/lib/actions/reviewActions" // Import action for user reviews
import { HomePageClientContent } from "@/app/home-page-client-content" // The new Client Component

export default async function HomePage() {
  // Fetch user-specific reviews
  const userReviewsResult = await getUserFullReviewsAction();

  return (
    <HomePageClientContent 
      userReviews={userReviewsResult.data} 
      userReviewsError={userReviewsResult.error}
    />
  );
}
