"use client"

import { useState, useEffect, useRef } from "react"
import { Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase/client"

interface BeerOption {
  id: string
  name: string
  brewery: string
  style?: string
}

interface BeerNameComboboxProps {
  value: string
  onValueChange: (value: string) => void
  onBeerSelect: (beer: BeerOption | null) => void
  placeholder?: string
  disabled?: boolean
}

export function BeerNameCombobox({
  value,
  onValueChange,
  onBeerSelect,
  placeholder = "Search for a beer or type a new name...",
  disabled = false
}: BeerNameComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [beerOptions, setBeerOptions] = useState<BeerOption[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedBeer, setSelectedBeer] = useState<BeerOption | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Simple client-side beer search function
  const searchBeers = async (query: string): Promise<BeerOption[]> => {
    try {
      const { data, error } = await supabase
        .from("beers")
        .select("id, name, brewery, style")
        .or(`name.ilike.%${query}%,brewery.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error searching beers:", error)
        return []
      }

      return (data || []).map((beer) => ({
        id: beer.id,
        name: beer.name,
        brewery: beer.brewery,
        style: beer.style || undefined
      }))
    } catch (error) {
      console.error("Error searching beers:", error)
      return []
    }
  }

  // Debounced search for existing beers
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim().length < 2) {
      setBeerOptions([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchBeers(searchQuery.trim())
        setBeerOptions(results)
      } catch (error) {
        console.error("Error searching beers:", error)
        setBeerOptions([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Update search query when input value changes
  useEffect(() => {
    setSearchQuery(value)
  }, [value])

  const handleSelect = (beerOption: BeerOption) => {
    setSelectedBeer(beerOption)
    onValueChange(beerOption.name)
    onBeerSelect(beerOption)
    setOpen(false)
  }


  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => {
          const newValue = e.target.value
          onValueChange(newValue)
          setSearchQuery(newValue)
          
          // If user is typing something different, clear the selected beer
          if (selectedBeer && newValue !== selectedBeer.name) {
            setSelectedBeer(null)
            onBeerSelect(null)
          }
          
          // Show dropdown when typing
          if (newValue.trim().length >= 2) {
            setOpen(true)
          } else {
            setOpen(false)
          }
        }}
        onFocus={() => {
          if (value.trim().length >= 2) {
            setOpen(true)
          }
        }}
        onBlur={(e) => {
          // Delay closing to allow for item selection
          setTimeout(() => {
            if (!e.currentTarget.contains(document.activeElement)) {
              setOpen(false)
            }
          }, 200)
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />
      
      {open && (value.trim().length >= 2) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {isSearching ? (
            <div className="py-6 text-center text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
              Searching beers...
            </div>
          ) : (
            <>
              {beerOptions.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">Existing Beers</p>
                  {beerOptions.map((beer) => (
                    <div
                      key={beer.id}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleSelect(beer)}
                    >
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">{beer.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {beer.brewery}
                          {beer.style && ` • ${beer.style}`}
                        </span>
                      </div>
                      {selectedBeer?.id === beer.id && (
                        <Check className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {value.trim().length >= 2 && (
                <div className="p-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">Add New Beer</p>
                  <div
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      onValueChange(value)
                      onBeerSelect(null) // null indicates new beer
                      setOpen(false)
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">Create &quot;{value}&quot;</span>
                      <span className="text-xs text-muted-foreground">
                        Add as a new beer
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {beerOptions.length === 0 && value.trim().length >= 2 && (
                <div className="py-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    No existing beers found for &quot;{value}&quot;
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You can continue typing to add a new beer
                  </p>
                </div>
              )}
              
              {value.trim().length < 2 && (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Type at least 2 characters to search for beers
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
} 