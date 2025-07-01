"use client"

import { Button } from "@/components/ui/button"
import { AddReviewDialog } from "@/components/add-review/add-review-dialog"
import { type FullReview } from "@/lib/types"
import { MyReviewsList } from "@/components/my-reviews-list"

interface HomePageClientContentProps {
  userReviews: FullReview[] | null
  userReviewsError?: string | null
}

export function HomePageClientContent({ 
  userReviews, 
  userReviewsError,
}: HomePageClientContentProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            My Beer Reviews
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Your personal beer review collection
          </p>
        </div>
        <AddReviewDialog>
          <Button size="lg" className="w-full sm:w-auto">
            Add Review
          </Button>
        </AddReviewDialog>
      </div>

      {/* Main Content - User Reviews */}
      <div className="w-full">
        <MyReviewsList reviews={userReviews} fetchError={userReviewsError} />
      </div>
    </div>
  )
} 