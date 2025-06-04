"use client"

import { Suspense, useState } from "react"
import { ArrowLeft, Edit, Trash2, Star, Calendar, Beer } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { AddBeerDialog } from "@/components/add-beer/add-beer-dialog"
import { Badge } from "@/components/ui/badge"
import OtherReviews from "@/components/other-reviews"
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

interface ReviewDisplayProps {
  beerData: BeerData
  userReview: UserReviewData | null
  hasUserReview: boolean
  isOwner: boolean
  userId?: string
  paramsId: string
}

export default function ReviewDisplayClient({
  beerData,
  userReview,
  hasUserReview,
  isOwner,
  userId,
  paramsId,
}: ReviewDisplayProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="container max-w-6xl py-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild className="hover:bg-amber-100">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{beerData.name}</h1>
              <div className="flex items-center space-x-3 text-lg text-gray-600">
                <Beer className="h-5 w-5 text-amber-600" />
                <span className="font-semibold">{beerData.brewery}</span>
                <span>•</span>
                <span className="text-amber-700 font-medium">{beerData.style}</span>
              </div>
            </div>
          </div>
        </div>

        {hasUserReview && userReview ? (
          <div className="space-y-8">
            {/* Main Review Card */}
            <Card className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-5 gap-0">
                  {/* Image Gallery Section */}
                  {/* <div className="lg:col-span-3 p-6 space-y-4"> ... </div> */}

                  {/* Review Details Section */}
                  <div className="lg:col-span-5 p-6 bg-gradient-to-br from-gray-50 to-white space-y-6">
                    {/* Rating Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">My Review</h2>
                        {isOwner && (
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex items-center hover:bg-amber-50" asChild>
                              <Link href={`/reviews/edit/${userReview.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center text-red-600 hover:bg-red-50 hover:text-red-700">
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
                        <Badge 
                          variant="outline" 
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        >
                          ✓ I typically drink this style
                        </Badge>
                      )}
                    </div>

                    {/* Review Text */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-800 text-lg">Review</h3>
                      <p className="text-gray-700 leading-relaxed text-base bg-white/50 rounded-lg p-4 border border-gray-100">
                        "{userReview.review_text}"
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center space-x-2 text-sm text-gray-500 pt-4 border-t border-gray-200">
                      <Calendar className="h-4 w-4" />
                      <span>Reviewed on {new Date(userReview.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* No Review State */
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="space-y-6">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                  <Beer className="h-12 w-12 text-amber-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">Share Your Experience</h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    You haven't reviewed this beer yet. Be the first to share your thoughts!
                  </p>
                </div>
                <AddBeerDialog>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Add Your Review
                  </Button>
                </AddBeerDialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other Reviews Section */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Community Reviews</h2>
            </div>
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                <span className="ml-3 text-gray-600">Loading other reviews...</span>
              </div>
            }>
              <OtherReviews beerId={paramsId} userId={userId} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 