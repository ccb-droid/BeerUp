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
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <Star
                key={starValue}
                className={`w-5 h-5 mr-0.5 ${
                  rating >= starValue
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-1 text-sm text-muted-foreground">({rating}/5)</span>
          </div>
        </div>
        {beer.brewery && (
          <p className="text-xs text-muted-foreground">{beer.brewery}</p>
        )}
      </CardHeader>
      {review_text && (
        <CardContent>
          <p className="text-sm text-foreground whitespace-pre-wrap">{review_text}</p>
        </CardContent>
      )}
    </Card>
  );
} 