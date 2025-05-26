"use client"

import { Suspense } from "react"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { CreateReviewDialog } from "@/components/review/create-review-dialog"
import { Badge } from "@/components/ui/badge"
import OtherReviews from "@/components/other-reviews"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface BeerData {
  id: string
  name: string
  brewery: string
  style: string
  created_at: string
  abv?: number
  description?: string
  image_url?: string
}

// Mock data for when the beer doesn't exist in the database
const mockBeerData: Record<string, BeerData> = {
  "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11": {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    name: "Hazy Wonder",
    brewery: "Lagunitas",
    style: "IPA",
    created_at: "2023-05-01T00:00:00Z",
  },
  "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12": {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    name: "Guinness Draught",
    brewery: "Guinness",
    style: "Stout",
    created_at: "2023-05-01T00:00:00Z",
  },
  "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13": {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    name: "Blue Moon",
    brewery: "Blue Moon Brewing Co.",
    style: "Belgian White",
    created_at: "2023-05-01T00:00:00Z",
  },
  "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14": {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    name: "Sierra Nevada Pale Ale",
    brewery: "Sierra Nevada",
    style: "Pale Ale",
    created_at: "2023-05-01T00:00:00Z",
  },
  "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15": {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    name: "Deschutes Black Butte Porter",
    brewery: "Deschutes",
    style: "Porter",
    created_at: "2023-05-01T00:00:00Z",
  },
}

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id

  // For development, always use mock data
  const beerData: BeerData | undefined = mockBeerData[params.id] as BeerData | undefined

  // If the beer ID doesn't match any of our mock beers, show 404
  if (!beerData) {
    notFound()
  }

  // For development, we'll assume the user hasn't reviewed this beer yet
  const userReview = {
    id: "mock-review-id",
    user_id: userId || "",
    beer_id: params.id,
    rating: 4,
    review_text: "This is a sample review.",
    images: ["/placeholder.svg?height=300&width=400"],
    created_at: new Date().toISOString(),
    typically_drinks: false
  }
  
  const hasUserReview = Boolean(userReview)
  const isOwner = userReview?.user_id === userId

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{beerData.name}</h1>
      </div>

      {hasUserReview ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <Image
                src={userReview.images?.[0] || "/placeholder.svg?height=300&width=400"}
                alt={beerData.name}
                fill
                className="object-cover"
              />
            </div>

            {userReview.images.length > 0 && (
              <div className="flex space-x-2">
                {userReview.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative h-20 w-20 rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary"
                  >
                    <Image
                      src={image}
                      alt={`${beerData.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-lg">{beerData.brewery}</h2>
              <p className="text-muted-foreground">{beerData.style}</p>
              <div className="flex items-center mt-2">
                <div className="bg-amber-100 text-amber-800 font-medium rounded-full px-3 py-1">
                  Rating: {userReview.rating}/5
                </div>
                {userReview.typically_drinks && (
                  <Badge variant="outline" className="ml-2">
                    I typically drink this style
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium">My Review</h3>
              <p className="mt-1">{userReview.review_text}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Reviewed on {new Date(userReview.created_at).toLocaleDateString()}
              </p>
            </div>

            {isOwner && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex items-center" asChild>
                  <Link href={`/reviews/edit/${userReview.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">You haven’t reviewed this beer yet.</p>
          <CreateReviewDialog>
            <Button>Add Your Review</Button>
          </CreateReviewDialog>
        </div>
      )}

      <div className="border-t pt-6">
        <h2 className="font-semibold text-lg mb-4">Other Reviews</h2>
        <Suspense fallback={<div>Loading other reviews...</div>}>
          <OtherReviews beerId={params.id} userId={userId} />
        </Suspense>
      </div>
    </div>
  )
}
