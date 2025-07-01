"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { searchBeersClient } from "@/lib/client/beers"
import type { Beer } from "@/lib/types"

// Beer result type for search
type BeerSearchResult = Beer & {
  averageRating?: number;
  reviewCount?: number;
}

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<BeerSearchResult[]>([])
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

  // Function to search through beers
  const searchBeers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowResults(false)
      setSelectedIndex(-1)
      return
    }

    try {
      setIsSearching(true)
      const results = await searchBeersClient(query)
      
      // Transform Beer[] to BeerSearchResult[] with placeholder stats
      const searchResults: BeerSearchResult[] = results.map(beer => ({
        ...beer,
        averageRating: undefined, // We could add this later if needed
        reviewCount: undefined
      }))

      setSearchResults(searchResults)
      setShowResults(true)
      setSelectedIndex(-1)
    } catch (error) {
      console.error("Error searching beers:", error)
      setSearchResults([])
      setShowResults(false)
    } finally {
      setIsSearching(false)
    }
  }

  // Search when the user types (with a small delay)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchBeers(searchQuery)
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
      window.location.href = `/beer/${beerId}`
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
                          src={beer.image_url || "/placeholder.svg?height=48&width=48"}
                          alt={beer.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-sm sm:text-base">{beer.name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {beer.brewery}{beer.style ? ` • ${beer.style}` : ""}
                        </p>
                        {beer.description && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {beer.description}
                          </p>
                        )}
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
                Try searching by beer name, brewery, or style
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
