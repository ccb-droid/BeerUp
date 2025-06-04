import { UserReviewCard } from "@/components/user-review-card";
import Link from "next/link";
import type { FullReview } from "@/lib/types";

interface MyReviewsListProps {
  reviews: FullReview[] | null;
  fetchError?: string | null; // Optional error prop
}

export function MyReviewsList({ reviews, fetchError }: MyReviewsListProps) {
  if (fetchError) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive text-lg">{fetchError}</p>
        <p className="text-muted-foreground mt-2">
          We couldn't load your reviews. Please try again later.
        </p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
        <h3 className="text-xl font-semibold text-muted-foreground">No Reviews Yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You haven't reviewed any beers yet. 
          <Link href="/" className="text-primary hover:underline ml-1">
            Explore beers and add your first review!
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <UserReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
} 