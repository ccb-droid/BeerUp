"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { getOtherReviewsAction } from "@/lib/actions/reviewActions"

// Define a type for the review data
interface ReviewProfile {
  username: string;
}

interface ReviewData {
  id: string;
  user_id: string;
  beer_id: string;
  rating: number;
  review_text: string;
  typically_drinks: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
  profiles: ReviewProfile | null; // Profile can be null
}

// Sample mock data with UUID-style IDs
const mockOtherReviews: ReviewData[] = [
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0861",
    user_id: "e5e7b566-c92d-4baa-b94b-1c8759fc4f35",
    beer_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    rating: 4.2,
    review_text: "Solid IPA with good hop character. Not too bitter, which I appreciate.",
    typically_drinks: true,
    images: ["/placeholder.svg?height=80&width=80"],
    created_at: "2023-05-10T14:30:00Z",
    updated_at: "2023-05-10T14:30:00Z",
    profiles: {
      username: "beerLover42",
    },
  },
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0862",
    user_id: "e5e7b566-c92d-4baa-b94b-1c8759fc4f36",
    beer_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    rating: 4.7,
    review_text: "One of my favorite IPAs. The citrus notes really come through and the finish is clean.",
    typically_drinks: true,
    images: ["/placeholder.svg?height=80&width=80"],
    created_at: "2023-04-22T09:15:00Z",
    updated_at: "2023-04-22T09:15:00Z",
    profiles: {
      username: "craftBeerFan",
    },
  },
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0863",
    user_id: "e5e7b566-c92d-4baa-b94b-1c8759fc4f37",
    beer_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    rating: 3.8,
    review_text: "Good but not great. I prefer more bitterness in my IPAs.",
    typically_drinks: false,
    images: ["/placeholder.svg?height=80&width=80"],
    created_at: "2023-03-15T18:45:00Z",
    updated_at: "2023-03-15T18:45:00Z",
    profiles: {
      username: "hopHead",
    },
  },
]

export default function OtherReviews({ beerId, userId }: { beerId: string; userId?: string }) {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 5

  useEffect(() => {
    fetchReviews()
  }, [beerId, userId])

  async function fetchReviews() {
    setLoading(true)

    try {
      // Always use mock data for now to avoid runtime errors
      // setReviews(mockOtherReviews);
      // setHasMore(false);
      // setLoading(false);
      // return;

      // The code below is commented out to prevent runtime errors
      // Uncomment when your Supabase database is properly set up
      
      const { data, error } = await getOtherReviewsAction(beerId, userId, page, pageSize);
      
      if (error || !data) {
        console.error('Error fetching reviews:', error);
        // Use mock data if there's an error
        if (page === 0) {
          setReviews(mockOtherReviews);
        }
        setHasMore(false);
      } else if (data.length === 0 && page === 0) {
        // Use mock data if no reviews are found
        setReviews(mockOtherReviews);
        setHasMore(false);
      } else {
        if (data.length < pageSize) {
          setHasMore(false);
        }
        
        if (page === 0) {
          setReviews(data as ReviewData[]);
        } else {
          setReviews(prev => [...prev, ...(data as ReviewData[])]);
        }
      }
      
    } catch (e) {
      console.error("Error in fetchReviews:", e)
      // Fallback to mock data
      if (page === 0) {
        setReviews(mockOtherReviews)
      }
      setHasMore(false)
    }

    setLoading(false)
  }

  const loadMore = () => {
    setPage((prev) => prev + 1)
  }

  useEffect(() => {
    if (page > 0) {
      fetchReviews()
    }
  }, [page])

  if (loading && reviews.length === 0) {
    return <div>Loading reviews...</div>
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-0">
          <div className="flex items-center space-x-2 mb-3">
            <Avatar>
              <AvatarFallback>{review.profiles?.username?.substring(0, 2).toUpperCase() || "UN"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{review.profiles?.username || "Unknown User"}</p>
              <p className="text-sm text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
            </div>
            <div className="ml-auto bg-amber-100 text-amber-800 font-medium rounded-full px-3 py-1">
              {review.rating}/5
            </div>
          </div>
          <p className="text-base">{review.review_text}</p>

          {review.images && review.images.length > 0 && (
            <div className="flex mt-3 space-x-2">
              {review.images.slice(0, 3).map((image, index) => (
                <div key={index} className="relative h-16 w-16 rounded-md overflow-hidden">
                  <Image src={image || "/placeholder.svg"} alt="Beer" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {hasMore && (
        <div className="text-center pt-2">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More Reviews"}
          </Button>
        </div>
      )}
    </div>
  )
}
