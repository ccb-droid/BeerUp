"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

// Beer review type
type BeerReview = {
  id: string
  name: string
  brewery: string
  style: string
  rating: number
  reviewer: string
  reviewText: string
}

// Mock data that represents all available beer reviews
const allBeerReviews: BeerReview[] = [
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    name: "Hazy Wonder",
    brewery: "Lagunitas",
    style: "IPA",
    rating: 4.5,
    reviewer: "beerLover42",
    reviewText: "Fantastic IPA with a perfect balance of hops and citrus notes.",
  },
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    name: "Guinness Draught",
    brewery: "Guinness",
    style: "Stout",
    rating: 4.8,
    reviewer: "craftBeerFan",
    reviewText: "This stout is absolutely divine. Rich, chocolatey notes with a hint of coffee.",
  },
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    name: "Blue Moon",
    brewery: "Blue Moon Brewing Co.",
    style: "Belgian White",
    rating: 4.2,
    reviewer: "hopHead",
    reviewText: "A refreshing Belgian white with subtle citrus and coriander notes.",
  },
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    name: "Sierra Nevada Pale Ale",
    brewery: "Sierra Nevada",
    style: "Pale Ale",
    rating: 3.9,
    reviewer: "aleEnthusiast",
    reviewText: "A solid pale ale with good hop character. Not the best I've had, but definitely worth trying.",
  },
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    name: "Deschutes Black Butte Porter",
    brewery: "Deschutes",
    style: "Porter",
    rating: 4.7,
    reviewer: "darkBeerLover",
    reviewText: "This porter has amazing chocolate and coffee notes. The mouthfeel is smooth.",
  },
]

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<BeerReview[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  // Add ref for the search container
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Add click-outside effect
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Function to search through beer reviews
  const searchBeers = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowResults(false)
      setSelectedIndex(-1)
      return
    }

    const lowercaseQuery = query.toLowerCase()
    const results = allBeerReviews.filter(
      (beer) =>
        beer.name.toLowerCase().includes(lowercaseQuery) ||
        beer.brewery.toLowerCase().includes(lowercaseQuery) ||
        beer.style.toLowerCase().includes(lowercaseQuery) ||
        beer.reviewer.toLowerCase().includes(lowercaseQuery) ||
        beer.reviewText.toLowerCase().includes(lowercaseQuery),
    )

    setSearchResults(results)
    setShowResults(true)
    setSelectedIndex(-1)
  }

  // Search when the user types (with a small delay)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchBeers(searchQuery)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsSearching(true)
    if (!e.target.value.trim()) {
      setShowResults(false)
      setSelectedIndex(-1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleResultClick(searchResults[selectedIndex].id)
        }
        break
      case "Escape":
        setShowResults(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleResultClick = (beerId?: string) => {
    setShowResults(false)
    setSearchQuery("")
    setSelectedIndex(-1)

    if (beerId) {
      // Navigate programmatically
      window.location.href = `/reviews/${beerId}`
    }
  }

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search beers, breweries, styles..."
          className="pl-10 h-11 text-base sm:text-sm bg-background"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          aria-expanded={showResults}
          aria-haspopup="listbox"
          role="combobox"
        />
      </div>

      {/* Search Results Dropdown */}
      {searchQuery && showResults && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-2 bg-background border rounded-lg shadow-lg max-h-80 sm:max-h-96 overflow-y-auto scrollbar-thin"
          role="listbox"
        >
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="p-2">
              <div className="text-xs sm:text-sm text-muted-foreground mb-2 px-2">
                Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                <span className="hidden sm:inline text-xs ml-2">(Use ↑↓ to navigate, Enter to select)</span>
              </div>
              {searchResults.map((beer, index) => (
                <div
                  key={beer.id}
                  className={`mb-2 cursor-pointer rounded-lg ${selectedIndex === index ? "ring-2 ring-primary ring-offset-1" : ""}`}
                  onClick={() => handleResultClick(beer.id)}
                  role="option"
                  aria-selected={selectedIndex === index}
                >
                  <Card className="hover:bg-accent/50 transition-colors border-0 shadow-none">
                    <CardContent className="p-3 flex items-center space-x-3">
                      <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                        <Image
                          src="/placeholder.svg?height=48&width=48"
                          alt={beer.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-sm sm:text-base">{beer.name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {beer.brewery} • {beer.style}
                        </p>
                        <div className="flex items-center mt-1 flex-wrap gap-1">
                          <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">
                            {beer.rating}/5
                          </span>
                          <span className="text-xs text-muted-foreground">by {beer.reviewer}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <div className="text-sm sm:text-base">No beers found matching "{searchQuery}"</div>
              <div className="text-xs sm:text-sm mt-2 text-muted-foreground/70">
                Try searching by beer name, brewery, style, or reviewer
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
