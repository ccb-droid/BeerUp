import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type FullReview } from '@/lib/types'; // Assuming FullReview includes beer and review details

interface UserReviewCardProps {
  review: FullReview;
}

export function UserReviewCard({ review }: UserReviewCardProps) {
  const { beer, rating, review_text } = review;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{beer.name}</CardTitle>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <Star
                key={starValue}
                className={`h-5 w-5 ${
                  rating >= starValue
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-medium text-amber-600">({rating}/5)</span>
          </div>
        </div>
        {beer.brewery && (
          <p className="text-sm text-muted-foreground">{beer.brewery}</p>
        )}
      </CardHeader>
      {review_text && (
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review_text}</p>
        </CardContent>
      )}
    </Card>
  );
} 