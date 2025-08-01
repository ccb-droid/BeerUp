"use client"

import { Suspense } from "react"
import { Edit, Trash2, Star, Calendar, Beer } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AddReviewDialog } from "@/components/features/reviews/add-review-dialog"
import { Badge } from "@/components/ui/badge"
import OtherReviews from "@/components/features/reviews/other-reviews"
import { Card, CardContent } from "@/components/ui/card"

export interface BeerData {
  id: string
  name: string
  brewery: string
  style: string | null
  created_at: string
  abv?: number | null
  description?: string | null
  image_url?: string | null
}

export interface UserReviewData {
  id: string
  user_id: string
  beer_id: string;
  rating: number
  review_text: string
  created_at: string
  typically_drinks: boolean
}

interface BeerDetailProps {
  beerData: BeerData
  userReview: UserReviewData | null
  hasUserReview: boolean
  isOwner: boolean
  userId?: string
  paramsId: string
}

export default function BeerDetailClient({
  beerData,
  userReview,
  hasUserReview,
  isOwner,
  userId,
  paramsId,
}: BeerDetailProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating
            ? "fill-amber-400 text-amber-400"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ))
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Navigation Breadcrumb */}
      {/* <NavigationBreadcrumb beerName={beerData.name} /> */}
      
      {/* Header Section */}
      <div className="flex flex-col items-start gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{beerData.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            <span className="font-semibold">{beerData.brewery}</span>
            {beerData.style && (
              <>
                <span className="mx-2">•</span>
                <span>{beerData.style}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {hasUserReview && userReview ? (
        <>
          {/* User's Review Card */}
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Rating Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">My Review</h2>
                  {isOwner && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/reviews/edit/${userReview.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {renderStars(userReview.rating)}
                  </div>
                  <span className="text-2xl font-bold text-amber-600">
                    {userReview.rating}/5
                  </span>
                </div>
                
                {userReview.typically_drinks && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ✓ I typically drink this style
                  </Badge>
                )}
              </div>

              {/* Review Text */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Review</h3>
                <p className="text-muted-foreground leading-relaxed">
                  &quot;{userReview.review_text}&quot;
                </p>
              </div>

              {/* Date */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-4 border-t">
                <Calendar className="h-4 w-4" />
                <span>Reviewed on {new Date(userReview.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </CardContent>
          </Card>

          {/* Community Reviews Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Community Reviews</h2>
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading community reviews...</p>
                  </div>
                </div>
              }>
                <OtherReviews beerId={paramsId} userId={userId} />
              </Suspense>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Community Reviews Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Community Reviews</h2>
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading community reviews...</p>
                  </div>
                </div>
              }>
                <OtherReviews beerId={paramsId} userId={userId} />
              </Suspense>
            </CardContent>
          </Card>

          {/* No Review State */}
          <Card>
            <CardContent className="text-center py-16">
              <div className="space-y-6">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                  <Beer className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Share Your Experience</h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    You haven&apos;t reviewed this beer yet. Be the first to share your thoughts!
                  </p>
                </div>
                <AddReviewDialog>
                  <Button size="lg">
                    Add Your Review
                  </Button>
                </AddReviewDialog>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 