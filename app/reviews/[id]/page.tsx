// "use client"

// import { Suspense } from "react"
// import { ArrowLeft, Edit, Trash2 } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import Image from "next/image"
// import Link from "next/link"
// import { CreateReviewDialog } from "@/components/review/create-review-dialog"
// import { Badge } from "@/components/ui/badge"
// import OtherReviews from "@/components/other-reviews"
import { getCurrentSession } from "@/lib/auth/client"
import { notFound } from "next/navigation"
import ReviewDisplayClient from "./ReviewDisplayClient"
import { getUserReviewForBeerAction } from "@/lib/actions/reviewActions"
import { getBeerById } from "@/lib/actions/beers"
import { type Beer } from "@/lib/types"
import { type UserReviewData, type BeerData } from "./ReviewDisplayClient"

// Mock data for when the beer doesn't exist in the database
// const mockBeerData: Record<string, Beer> = {
// ... (mock data remains unchanged)
// }

// Page components in the app directory receive params as a prop
export default async function ReviewPage({ params }: { params: { id: string } }) {
  // Check if user is authenticated
  const { data: { session } } = await getCurrentSession()
  const userId = session?.user?.id
  const beerIdFromParams = params.id

  // Fetch the beer details first
  const fetchedBeer = await getBeerById(beerIdFromParams)

  if (!fetchedBeer) {
    console.error(`Beer data not found for beer ID: ${beerIdFromParams}`)
    notFound()
  }

  // Adapt fetchedBeer to BeerData for the client component
  // The Beer type from @/lib/types should be compatible with BeerData
  // now that BeerData.style is string | null
  const beerDataForClient: BeerData = fetchedBeer;

  // Fetch the user's review for this beer
  const userReviewResult = await getUserReviewForBeerAction(beerIdFromParams)

  let userReviewForClient: UserReviewData | null = null

  if (userReviewResult.error) {
    console.error("Error fetching user review:", userReviewResult.error)
    // Decide if this is a critical error, for now, proceed as if no review
  }

  if (userReviewResult.data) {
    const reviewDataFromDb = userReviewResult.data

    userReviewForClient = {
      id: reviewDataFromDb.id,
      user_id: reviewDataFromDb.user_id,
      beer_id: reviewDataFromDb.beer_id,
      rating: reviewDataFromDb.rating,
      review_text: reviewDataFromDb.review_text ?? "",
      created_at: reviewDataFromDb.created_at,
      typically_drinks: reviewDataFromDb.typically_drinks,
    }
  }
  
  const hasUserReview = Boolean(userReviewForClient)
  const isOwner = userReviewForClient?.user_id === userId

  return (
    <ReviewDisplayClient
      beerData={beerDataForClient}
      userReview={userReviewForClient}
      hasUserReview={hasUserReview}
      isOwner={isOwner}
      userId={userId}
      paramsId={beerIdFromParams}
    />
  )
}
