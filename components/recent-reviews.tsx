"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { getRecentReviewsAction } from "@/lib/actions/reviewActions"

interface ReviewProfile {
  username: string;
}

interface ReviewBeer {
  id: string;
  name: string;
  brewery: string;
  style: string;
}

interface ReviewData {
  id: string;
  user_id: string;
  beer_id: string;
  rating: number;
  review_text: string;
  typically_drinks: boolean;
  images?: string[];
  created_at: string;
  updated_at: string;
  profiles: ReviewProfile | null;
  beers: ReviewBeer | null;
}

export default function RecentReviews() {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 5

  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getRecentReviewsAction(page, pageSize);

      if (fetchError) {
        console.error("Error fetching recent reviews:", fetchError);
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
          setReviews((prev) => [...prev, ...(data as ReviewData[])]);
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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading recent reviews...</p>
        </div>
      </div>
    )
  }

  if (error && reviews.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive text-lg">Error loading reviews</p>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => {
            setPage(0);
            fetchReviews();
          }}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground text-lg">No reviews yet</p>
        <p className="text-muted-foreground mt-2">
          Be the first to share your beer experience!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {review.images && review.images.length > 0 && (
                <div className="relative h-48 md:h-auto md:w-1/3">
                  <Image
                    src={review.images[0] || "/placeholder.svg?height=200&width=300"}
                    alt={review.beers?.name || "Beer"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4 md:p-6 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarFallback>
                        {review.profiles?.username?.substring(0, 2).toUpperCase() || "UN"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{review.profiles?.username || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="bg-amber-100 text-amber-800 font-medium rounded-full px-3 py-1">
                    {review.rating}/5
                  </div>
                </div>

                <Link href={`/beer/${review.beer_id}`} className="hover:underline">
                  <h3 className="text-xl font-bold">{review.beers?.name || "Unknown Beer"}</h3>
                </Link>
                <p className="text-muted-foreground mb-2">
                  {review.beers?.brewery || "Unknown Brewery"} · {review.beers?.style || "Unknown Style"}
                </p>

                <p className="line-clamp-3 mb-2">{review.review_text}</p>

                <Button variant="outline" size="sm" asChild>
                  <Link href={`/beer/${review.beer_id}`}>Read Full Review</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {error && reviews.length > 0 && (
        <div className="text-center pt-2">
          <p className="text-destructive text-sm mb-2">Failed to load more reviews: {error}</p>
          <Button variant="outline" onClick={() => fetchReviews()} disabled={loading}>
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
