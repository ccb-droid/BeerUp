"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

// Sample mock data for recent reviews with UUID-style IDs
const mockRecentReviews = [
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
    user_id: "e5e7b566-c92d-4baa-b94b-1c8759fc4f25",
    beer_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    rating: 4.5,
    review_text:
      "Fantastic IPA with a perfect balance of hops and citrus notes. The aroma is incredible and the finish is smooth.",
    typically_drinks: true,
    images: ["/placeholder.svg?height=200&width=300"],
    created_at: "2023-05-18T14:30:00Z",
    updated_at: "2023-05-18T14:30:00Z",
    profiles: {
      username: "beerLover42",
    },
    beers: {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      name: "Hazy Wonder",
      brewery: "Lagunitas",
      style: "IPA",
    },
  },
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0852",
    user_id: "e5e7b566-c92d-4baa-b94b-1c8759fc4f26",
    beer_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    rating: 4.8,
    review_text:
      "This stout is absolutely divine. Rich, chocolatey notes with a hint of coffee. Perfect for a cold evening.",
    typically_drinks: true,
    images: ["/placeholder.svg?height=200&width=300"],
    created_at: "2023-05-15T09:15:00Z",
    updated_at: "2023-05-15T09:15:00Z",
    profiles: {
      username: "craftBeerFan",
    },
    beers: {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
      name: "Guinness Draught",
      brewery: "Guinness",
      style: "Stout",
    },
  },
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0853",
    user_id: "e5e7b566-c92d-4baa-b94b-1c8759fc4f27",
    beer_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    rating: 4.2,
    review_text:
      "A refreshing Belgian white with subtle citrus and coriander notes. Very drinkable and perfect for summer.",
    typically_drinks: false,
    images: ["/placeholder.svg?height=200&width=300"],
    created_at: "2023-05-10T18:45:00Z",
    updated_at: "2023-05-10T18:45:00Z",
    profiles: {
      username: "hopHead",
    },
    beers: {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
      name: "Blue Moon",
      brewery: "Blue Moon Brewing Co.",
      style: "Belgian White",
    },
  },
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0854",
    user_id: "e5e7b566-c92d-4baa-b94b-1c8759fc4f28",
    beer_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    rating: 3.9,
    review_text: "A solid pale ale with good hop character. Not the best I've had, but definitely worth trying.",
    typically_drinks: true,
    images: ["/placeholder.svg?height=200&width=300"],
    created_at: "2023-05-05T12:30:00Z",
    updated_at: "2023-05-05T12:30:00Z",
    profiles: {
      username: "aleEnthusiast",
    },
    beers: {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
      name: "Sierra Nevada Pale Ale",
      brewery: "Sierra Nevada",
      style: "Pale Ale",
    },
  },
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0855",
    user_id: "e5e7b566-c92d-4baa-b94b-1c8759fc4f29",
    beer_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    rating: 4.7,
    review_text:
      "This porter has amazing chocolate and coffee notes. The mouthfeel is smooth and the finish is perfect.",
    typically_drinks: true,
    images: ["/placeholder.svg?height=200&width=300"],
    created_at: "2023-05-01T16:20:00Z",
    updated_at: "2023-05-01T16:20:00Z",
    profiles: {
      username: "darkBeerLover",
    },
    beers: {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
      name: "Deschutes Black Butte Porter",
      brewery: "Deschutes",
      style: "Porter",
    },
  },
]

export default function RecentReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 5

  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    setLoading(true)

    try {
      // Always use mock data for now to avoid runtime errors
      setReviews(mockRecentReviews)
      setHasMore(false)
      setLoading(false)
      return

      // The code below is commented out to prevent runtime errors
      // Uncomment when your Supabase database is properly set up
      /*
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles:user_id (username),
          beers:beer_id (id, name, brewery, style)
        `)
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (error) {
        console.error("Error fetching reviews:", error)
        // Use mock data if there's an error
        if (page === 0) {
          setReviews(mockRecentReviews)
        }
        setHasMore(false)
      } else if (data.length === 0 && page === 0) {
        // Use mock data if no reviews are found
        setReviews(mockRecentReviews)
        setHasMore(false)
      } else {
        if (data.length < pageSize) {
          setHasMore(false)
        }

        if (page === 0) {
          setReviews(data)
        } else {
          setReviews((prev) => [...prev, ...data])
        }
      }
      */
    } catch (e) {
      console.error("Error in fetchReviews:", e)
      // Fallback to mock data
      if (page === 0) {
        setReviews(mockRecentReviews)
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
    return <div className="text-center py-10">Loading recent reviews...</div>
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <Card key={review.id} className="overflow-hidden">
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

                <Link href={`/reviews/${review.beer_id}`} className="hover:underline">
                  <h3 className="text-xl font-bold">{review.beers?.name || "Unknown Beer"}</h3>
                </Link>
                <p className="text-muted-foreground mb-2">
                  {review.beers?.brewery || "Unknown Brewery"} · {review.beers?.style || "Unknown Style"}
                </p>

                <p className="line-clamp-3 mb-2">{review.review_text}</p>

                <Button variant="outline" size="sm" asChild>
                  <Link href={`/reviews/${review.beer_id}`}>Read Full Review</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
