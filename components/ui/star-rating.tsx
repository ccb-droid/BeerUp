"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  onRatingChange: (rating: number) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5", 
  lg: "h-6 w-6"
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  disabled = false,
  size = "md",
  showLabel = true 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const handleClick = (newRating: number) => {
    if (!disabled) {
      onRatingChange(newRating)
    }
  }

  const handleMouseEnter = (newRating: number) => {
    if (!disabled) {
      setHoverRating(newRating)
    }
  }

  const handleMouseLeave = () => {
    setHoverRating(0)
  }

  const displayRating = hoverRating || rating

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return "Poor"
      case 2: return "Fair"
      case 3: return "Good"
      case 4: return "Very Good"
      case 5: return "Excellent"
      default: return "Select rating"
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={cn(
              "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded",
              disabled ? "cursor-default" : "cursor-pointer hover:scale-110"
            )}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors duration-150",
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-muted text-muted-foreground",
                !disabled && "hover:text-yellow-400"
              )}
            />
          </button>
        ))}
      </div>
      
      {showLabel && (
        <span className={cn(
          "text-sm transition-colors duration-150",
          displayRating > 0 ? "text-foreground" : "text-muted-foreground"
        )}>
          {getRatingLabel(displayRating)}
        </span>
      )}
    </div>
  )
} 