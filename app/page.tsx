"use client"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import RecentReviews from "@/components/recent-reviews"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BeerList from "@/components/beer-list"
import SearchBar from "@/components/search-bar"
import { CreateReviewDialog } from "@/components/review/create-review-dialog"

export default function HomePage() {
  // Client-side auth check is handled by the CreateReviewDialog component

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">BeerUp</h1>
        <CreateReviewDialog>
          <Button>Add Review</Button>
        </CreateReviewDialog>
      </div>

      {/* Updated search bar with functionality */}
      <SearchBar />

      <Tabs defaultValue="recent">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recent">Recent Reviews</TabsTrigger>
          <TabsTrigger value="my-beers">My Beer Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="mt-4">
          <Suspense fallback={<div className="text-center py-10">Loading recent reviews...</div>}>
            <RecentReviews />
          </Suspense>
        </TabsContent>
        <TabsContent value="my-beers" className="mt-4">
          <Suspense fallback={<div className="text-center py-10">Loading your beers...</div>}>
            <BeerList />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
