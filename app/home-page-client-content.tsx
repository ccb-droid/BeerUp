"use client"

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
      <div className="flex flex-col items-start gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            My Beer Reviews
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Your personal beer review collection
          </p>
        </div>
      </div>

      {/* Main Content - User Reviews */}
      <div className="w-full">
        <MyReviewsList reviews={userReviews} fetchError={userReviewsError} />
      </div>
    </div>
  )
} 