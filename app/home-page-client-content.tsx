"use client"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import RecentReviews from "@/components/recent-reviews"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SearchBar from "@/components/search-bar"
import { AddBeerDialog } from "@/components/add-beer/add-beer-dialog"
import { BeerGrid } from "@/components/beer-grid"
import { type Beer, type FullReview } from "@/lib/types"
import { MyReviewsList } from "@/components/my-reviews-list"

interface HomePageClientContentProps {
  initialBeers: Beer[]
  userReviews: FullReview[] | null
  userReviewsError?: string | null
  userRatingsMap?: Map<string, number>
}

export function HomePageClientContent({ 
  initialBeers, 
  userReviews, 
  userReviewsError,
  userRatingsMap
}: HomePageClientContentProps) {
  // Client-side auth check is handled by the CreateReviewDialog component

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Discover Great Beers
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Review, rate, and share your favorite brews
          </p>
        </div>
        <AddBeerDialog>
          <Button size="lg" className="w-full sm:w-auto">
            Add Beer
          </Button>
        </AddBeerDialog>
      </div>

      {/* Search Section */}
      <div className="w-full">
        <SearchBar />
      </div>

      {/* Main Content Tabs */}
      <div className="w-full">
        <Tabs defaultValue="beers" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-11">
            <TabsTrigger value="beers" className="text-xs sm:text-sm">
              All Beers
            </TabsTrigger>
            <TabsTrigger value="recent" className="text-xs sm:text-sm">
              Recent Reviews
            </TabsTrigger>
            <TabsTrigger value="my-beers" className="text-xs sm:text-sm">
              My Reviews
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="beers" className="mt-6 sm:mt-8">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">Beer Collection</h2>
              <BeerGrid beers={initialBeers} userRatingsMap={userRatingsMap} />
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="mt-6 sm:mt-8">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">Recent Reviews</h2>
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading recent reviews...</p>
                  </div>
                </div>
              }>
                <RecentReviews />
              </Suspense>
            </div>
          </TabsContent>
          
          <TabsContent value="my-beers" className="mt-6 sm:mt-8">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">Your Beer Reviews</h2>
              <MyReviewsList reviews={userReviews} fetchError={userReviewsError} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 