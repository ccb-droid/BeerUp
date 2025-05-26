"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

// Mock beers for development
const mockBeers = [
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    name: "Hazy Wonder",
    brewery: "Lagunitas",
    style: "IPA",
  },
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    name: "Guinness Draught",
    brewery: "Guinness",
    style: "Stout",
  },
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    name: "Blue Moon",
    brewery: "Blue Moon Brewing Co.",
    style: "Belgian White",
  },
]

export default function BeerList() {
  const [beers, setBeers] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchBeers() {
      setLoading(true)

      // For authenticated users, show mock beers
      // For unauthenticated users, show empty list (will display sign-in prompt)
      if (user) {
        setBeers(mockBeers)
      } else {
        setBeers([])
      }

      setLoading(false)
    }

    fetchBeers()
  }, [user])

  if (loading) {
    return <div className="text-center py-10">Loading your beers...</div>
  }

  // For unauthenticated users, show sign-in prompt with updated copy
  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">Sign in to leave a review</p>
        <Button asChild>
          <Link href="/auth/login?redirectTo=/">Sign In</Link>
        </Button>
      </div>
    )
  }

  if (beers.length === 0 && user) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">You haven't reviewed any beers yet.</p>
        <Button asChild>
          <Link href="/reviews/new">Add Your First Review</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {beers.map((beer) => (
        <Link key={beer.id} href={`/reviews/${beer.id}`}>
          <Card className="hover:bg-accent transition-colors">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                <Image src="/placeholder.svg?height=80&width=80" alt={beer.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{beer.name}</h3>
                <p className="text-muted-foreground">{beer.brewery}</p>
                <p className="text-sm text-muted-foreground">{beer.style}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
