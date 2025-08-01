import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Beer } from "@/lib/types"
import { Building2 } from "lucide-react"

interface BeerCardProps {
  beer: Beer
  userRating?: number
}

export function BeerCard({ beer, userRating }: BeerCardProps) {
  // Use the beer image if available, otherwise use placeholder
  const imageUrl = beer.image_url || "/placeholder.svg?height=200&width=200"

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group animate-fade-in">
        <div className="relative h-44 sm:h-48 w-full bg-muted">
          <Image
            src={imageUrl}
            alt={beer.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </div>
        
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            <h3 className="font-semibold text-base sm:text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {beer.name}
            </h3>
            
            <div className="flex items-center text-muted-foreground text-xs sm:text-sm">
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{beer.brewery}</span>
            </div>
            
            {beer.style && (
              <Badge variant="secondary" className="text-xs max-w-fit">
                {beer.style}
              </Badge>
            )}
          </div>
        </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            Buy now
          </div>
      </CardFooter>
    </Card>
  )
} 