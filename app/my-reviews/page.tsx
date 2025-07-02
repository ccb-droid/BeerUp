"use client"

import { Suspense } from "react"
import { useAuth } from "@/lib/auth/context"
import { getUserFullReviewsAction } from "@/lib/actions/reviews"
import { useQuery } from "@tanstack/react-query"
import { MyReviewsList } from "@/components/features/reviews/my-reviews-list"
import NavigationBreadcrumb from "@/components/layout/navigation-breadcrumb"

export default function MyReviewsPage() {
  const { user } = useAuth()
  const { data: reviewsData, error, isLoading } = useQuery({
    queryKey: ["userFullReviews", user?.id],
    queryFn: getUserFullReviewsAction,
    enabled: !!user?.id,
  })
  
  const reviews = reviewsData?.data || null

  if (!user) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* <NavigationBreadcrumb /> */}
        <div className="text-center py-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            My Reviews
          </h1>
          <p className="text-muted-foreground">
            Please sign in to view your reviews.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Navigation Breadcrumb */}
      {/* <NavigationBreadcrumb /> */}
      
      {/* Header Section */}
      <div className="flex flex-col items-start gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            My Reviews
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Your beer reviews and ratings
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading your reviews...</p>
            </div>
          </div>
        ) : (
          <MyReviewsList 
            reviews={reviews || null} 
            fetchError={reviewsData?.error || error?.message || null} 
          />
        )}
      </div>
    </div>
  )
} 