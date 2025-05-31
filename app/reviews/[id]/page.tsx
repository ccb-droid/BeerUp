// "use client"

// import { Suspense } from "react"
// import { ArrowLeft, Edit, Trash2 } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import Image from "next/image"
// import Link from "next/link"
// import { CreateReviewDialog } from "@/components/review/create-review-dialog"
// import { Badge } from "@/components/ui/badge"
// import OtherReviews from "@/components/other-reviews"
import { getCurrentSession } from "@/app/db/auth"
import { notFound } from "next/navigation"
import ReviewDisplayClient from "./ReviewDisplayClient"
import { getReviewById } from "@/app/db/reviews"

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

interface UserReviewData {
  id: string
  user_id: string
  beer_id: string;
  rating: number
  review_text: string
  images: string[]
  created_at: string
  typically_drinks: boolean
  profiles?: { username: string } | null; 
  beers?: BeerData | null; 
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

// Page components in the app directory receive params as a prop
export default async function ReviewPage({ params }: { params: { id: string } }) {
  // Check if user is authenticated
  const { data: { session } } = await getCurrentSession()
  const userId = session?.user?.id
  const paramsId = await params.id

  // Fetch the review by ID
  const review = await getReviewById(params.id)

  // If the review doesn't exist, show 404
  if (!review) {
    notFound()
  }

  // Extract beer data from the review, or use mock data if not available
  // This assumes `beers` relation is populated by `getReviewById`
  // and matches the `BeerData` interface.
  // You might need to adjust this based on the actual structure of `review.beers`
  const beerData: BeerData = review.beers as BeerData || mockBeerData[review.beer_id] as BeerData | undefined;

  // If beerData is still not found (e.g. review.beers is null and review.beer_id is not in mock data)
  if (!beerData) {
    console.error(`Beer data not found for review ID: ${params.id} and beer_id: ${review.beer_id}`);
    notFound();
  }
  
  // Ensure images is an array. If it's a string, try to parse it.
  let processedImages: string[] = [];
  if (Array.isArray(review.images)) {
    processedImages = review.images;
  } else if (typeof review.images === 'string') {
    try {
      const parsedImages = JSON.parse(review.images);
      if (Array.isArray(parsedImages)) {
        processedImages = parsedImages;
      } else {
        console.warn("Parsed review.images is not an array:", parsedImages);
      }
    } catch (e) {
      console.error("Failed to parse review.images:", e);
      // If parsing fails and it's a non-empty string, perhaps it's a single image URL
      // Or handle as an error / empty array
      // For now, we'll leave it as an empty array if parsing fails
    }
  } else if (review.images) {
    // If review.images is truthy but not an array or string, log a warning.
     console.warn("review.images is neither an array nor a string:", review.images);
  }

  // The fetched review is the userReview
  const userReview: UserReviewData = {
    ...review,
    images: processedImages, // Use the processed images
  } as UserReviewData;
  
  const hasUserReview = Boolean(userReview) 
  const isOwner = userReview?.user_id === userId

  return (
    <ReviewDisplayClient 
      beerData={beerData} 
      userReview={userReview} 
      hasUserReview={hasUserReview} 
      isOwner={isOwner} 
      userId={userId} 
      paramsId={paramsId} 
    />
  )
}
