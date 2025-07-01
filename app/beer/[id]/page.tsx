import { getCurrentSession } from "@/lib/auth/client"
import { notFound } from "next/navigation"
import BeerDetailClient from "./BeerDetailClient"
import { getUserReviewForBeerAction } from "@/lib/actions/reviewActions"
import { getBeerById } from "@/lib/actions/beers"
import { type UserReviewData, type BeerData } from "./BeerDetailClient"

// Page components in the app directory receive params as a prop
export default async function BeerDetailPage({ params }: { params: { id: string } }) {
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
    <BeerDetailClient
      beerData={beerDataForClient}
      userReview={userReviewForClient}
      hasUserReview={hasUserReview}
      isOwner={isOwner}
      userId={userId}
      paramsId={beerIdFromParams}
    />
  )
} 