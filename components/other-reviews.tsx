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

interface ReviewBeer {
  image_url?: string | null;
}

interface ReviewData {
  id: string;
  user_id: string;
  beer_id: string;
  rating: number;
  review_text: string;
  typically_drinks: boolean;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  profiles: ReviewProfile | null; // Profile can be null
  beers: ReviewBeer | null;
}

export default function OtherReviews({ beerId, userId }: { beerId: string; userId?: string }) {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 5

  useEffect(() => {
    fetchReviews()
  }, [beerId, userId])

  async function fetchReviews() {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getOtherReviewsAction(beerId, userId, page, pageSize);
      
      if (fetchError) {
        console.error('Error fetching other reviews:', fetchError);
        setError(fetchError);
        setHasMore(false);
      } else if (!data || data.length === 0) {
        if (page === 0) {
          setReviews([]);
        }
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
      console.error("Unexpected error in fetchReviews:", e);
      setError("An unexpected error occurred while loading reviews.");
      setHasMore(false);
    }

    setLoading(false);
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

  if (error && reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading reviews</p>
        <p className="text-muted-foreground text-sm mt-1">{error}</p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setPage(0);
            fetchReviews();
          }}
          className="mt-3"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No other reviews for this beer yet.</p>
        <p className="text-muted-foreground text-sm mt-1">
          Be the first to share your thoughts!
        </p>
      </div>
    );
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

          {(review.image_url || review.beers?.image_url) && (
            <div className="flex mt-3 space-x-2">
              <div className="relative h-16 w-16 rounded-md overflow-hidden">
                <Image 
                  src={review.image_url || review.beers?.image_url || "/placeholder.svg"} 
                  alt="Beer" 
                  fill 
                  className="object-cover" 
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {error && reviews.length > 0 && (
        <div className="text-center pt-2">
          <p className="text-destructive text-sm mb-2">Failed to load more reviews: {error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchReviews()} disabled={loading}>
            Try Again
          </Button>
        </div>
      )}

      {hasMore && !error && (
        <div className="text-center pt-2">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More Reviews"}
          </Button>
        </div>
      )}

      {!hasMore && !error && reviews.length > 0 && (
        <div className="text-center pt-2">
          <p className="text-muted-foreground text-sm">No more reviews to load</p>
        </div>
      )}
    </div>
  )
}
