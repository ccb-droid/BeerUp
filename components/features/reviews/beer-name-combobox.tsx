"use client"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { supabase } from "@/lib/supabase/client"
import type { Beer } from "@/lib/types"
import { Button } from "@/components/ui/button"

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

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setSearchQuery(value) // Reset search query to current value when closing
    }
  }

  const handleInputClick = () => {
    setOpen(true)
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal h-10 px-3"
            onClick={handleInputClick}
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <div className="border-b">
              <Input
                value={searchQuery}
                onChange={(e) => {
                  const newValue = e.target.value
                  setSearchQuery(newValue)
                  onValueChange(newValue)
                  
                  // If user is typing something different, clear the selected beer
                  if (selectedBeer && newValue !== selectedBeer.name) {
                    setSelectedBeer(null)
                    onBeerSelect(null)
                  }
                }}
                placeholder={placeholder}
                disabled={disabled}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            </div>
            <CommandList>
              {isSearching ? (
                <div className="py-6 text-center text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
                  Searching beers...
                </div>
              ) : (
                <>
                  {beerOptions.length > 0 ? (
                    <CommandGroup heading="Existing Beers">
                      {beerOptions.map((beer) => (
                        <CommandItem
                          key={beer.id}
                          value={`${beer.name}-${beer.brewery}`}
                          onSelect={() => handleSelect(beer)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{beer.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {beer.brewery}
                              {beer.style && ` • ${beer.style}`}
                            </span>
                          </div>
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4",
                              selectedBeer?.id === beer.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : searchQuery.trim().length >= 2 ? (
                    <CommandEmpty>
                      <div className="py-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          No existing beers found for "{searchQuery}"
                        </p>
                        <p className="text-xs text-muted-foreground">
                          You can continue typing to add a new beer
                        </p>
                      </div>
                    </CommandEmpty>
                  ) : (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      Type at least 2 characters to search for beers
                    </div>
                  )}
                  
                  {searchQuery.trim().length >= 2 && (
                    <CommandGroup heading="Add New Beer">
                      <CommandItem
                        value={`new-beer-${searchQuery}`}
                        onSelect={() => {
                          onValueChange(searchQuery)
                          onBeerSelect(null) // null indicates new beer
                          setOpen(false)
                        }}
                        className="flex items-center"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">Create "{searchQuery}"</span>
                          <span className="text-sm text-muted-foreground">
                            Add as a new beer
                          </span>
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
} 