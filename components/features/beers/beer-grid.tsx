import { BeerCard } from "@/components/features/beers/beer-card"
import { type Beer } from "@/lib/types"

interface BeerGridProps {
  beers: Beer[]
  userRatingsMap?: Map<string, number>
}

export function BeerGrid({ beers, userRatingsMap }: BeerGridProps) {
  if (!beers || beers.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold">No beers found</h3>
          <p className="text-muted-foreground text-sm sm:text-base">
            There are currently no beers to display. Try adding some reviews to get started!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
      {beers.map((beer) => {
        return <BeerCard key={beer.id} beer={beer} />
      })}
    </div>
  )
} 