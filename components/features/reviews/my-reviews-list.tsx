import { UserReviewCard } from "@/components/features/reviews/user-review-card";
import { Button } from "@/components/ui/button";
import { AddReviewDialog } from "@/components/features/reviews/add-review-dialog";
import { Plus } from "lucide-react";
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
        <p className="mt-2 text-sm text-muted-foreground mb-4">
          You haven't reviewed any beers yet. Start by adding your first review!
        </p>
        <AddReviewDialog>
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Review
          </Button>
        </AddReviewDialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Reviews ({reviews.length})</h3>
        <AddReviewDialog>
          <Button size="lg" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        </AddReviewDialog>
      </div>
      {reviews.map((review) => (
        <UserReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
} 