import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type FullReview } from '@/lib/types';
import Image from 'next/image';

interface UserReviewCardProps {
  review: FullReview;
}

export function UserReviewCard({ review }: UserReviewCardProps) {
  const { beer, rating, review_text, image_url: reviewImageUrl } = review;
  
  // Use review image if available, otherwise use beer image
  const displayImageUrl = reviewImageUrl || beer.image_url || "/placeholder.svg?height=120&width=120";

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-4">
          {/* Image display */}
          <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
            <Image
              src={displayImageUrl}
              alt={beer.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-lg font-semibold line-clamp-2">{beer.name}</CardTitle>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <Star
                    key={starValue}
                    className={`h-4 w-4 ${
                      rating >= starValue
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm font-medium text-amber-600">({rating}/5)</span>
              </div>
            </div>
            {beer.brewery && (
              <p className="text-sm text-muted-foreground mt-1">{beer.brewery}</p>
            )}
            {reviewImageUrl && (
              <p className="text-xs text-primary mt-1">📸 Your photo</p>
            )}
          </div>
        </div>
      </CardHeader>
      {review_text && (
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review_text}</p>
        </CardContent>
      )}
    </Card>
  );
} 