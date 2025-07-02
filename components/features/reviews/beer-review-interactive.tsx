'use client';

import { useState, useEffect, useTransition } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { addReview } from '@/lib/actions/reviews';
// Assuming useUser hook exists in your auth setup to get client-side user
// If not, you might need to use Supabase client directly to get user/session
import { useAuth } from '@/lib/auth/context'; 
import { toast } from 'sonner'; // Assuming you use sonner for toasts

interface BeerReviewInteractiveProps {
  beerId: string;
  beerName: string;
  initialUserRating?: number; // Added new prop
}

export function BeerReviewInteractive({ 
  beerId, 
  beerName, 
  initialUserRating 
}: BeerReviewInteractiveProps) {
  const { user } = useAuth();
  // Initialize currentRating with initialUserRating if provided, otherwise 0
  const [currentRating, setCurrentRating] = useState(initialUserRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Effect to update currentRating if initialUserRating changes and no dialog is open
  // This helps if the prop updates after initial render, though less common for this specific case.
  useEffect(() => {
    if (initialUserRating !== undefined && !isDialogOpen) {
      setCurrentRating(initialUserRating);
    }
  }, [initialUserRating, isDialogOpen]);

  const handleStarClick = (rating: number) => {
    if (!user) {
      toast.error('Please sign in to rate beers.');
      return;
    }
    setCurrentRating(rating);
    setIsDialogOpen(true);
    setError(null); // Clear previous errors when opening dialog
  };

  const handleReviewSubmit = async () => {
    if (currentRating === 0) {
      setError('Please select a rating.');
      toast.error('A rating is required.');
      return;
    }
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('beerId', beerId);
      formData.append('rating', String(currentRating));
      formData.append('reviewText', reviewText);

      const result = await addReview(formData);

      if (result.success) {
        toast.success('Review submitted successfully!');
        setIsDialogOpen(false);
        // Reset state after successful submission if needed, or rely on revalidation
        // setCurrentRating(0); // Or keep it to show their submitted rating
        setReviewText(''); 
      } else {
        setError(result.error || 'Failed to submit review.');
        toast.error(result.error || 'Failed to submit review.');
      }
    });
  };

  if (!user && initialUserRating === undefined) { // Adjusted condition for non-logged in user
    return (
      <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground mr-0.5"
            // For non-logged in users without an initial rating, show as non-interactive (filled gray)
            // If an initialUserRating was somehow passed for a non-logged in user, it would show that rating.
            // This scenario (initialUserRating for non-logged in user) is unlikely given the data flow.
            fill="currentColor" 
          />
        ))}
        <Link href="/login" className="ml-2 hover:underline text-primary">
          Sign in to rate
        </Link>
      </div>
    );
  }
  // If the user is not logged in BUT there is an initialUserRating (e.g. viewing own profile logged out)
  // we should still display that rating statically.
  if (!user && initialUserRating !== undefined) {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <Star
            key={starValue}
            className={`w-5 h-5 sm:w-6 sm:h-6 mr-0.5 transition-colors ${
              (initialUserRating >= starValue)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'}`}
          />
        ))}
         {/* Optionally, add a (X/5) number here if desired */}
      </div>
    );
  }

  // Logged-in user experience (interactive or showing their initialUserRating)
  return (
    <>
      <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((starValue) => (
          <Star
            key={starValue}
            className={`w-5 h-5 sm:w-6 sm:h-6 cursor-pointer transition-colors mr-0.5 ${
              (hoverRating >= starValue || currentRating >= starValue)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'}`}
            onMouseEnter={() => setHoverRating(starValue)}
            onClick={() => handleStarClick(starValue)}
          />
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate {beerName}</DialogTitle>
            <DialogDescription>
              You selected {currentRating} star{currentRating !== 1 ? 's' : ''}. Add your notes below (optional).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did you think of this beer?"
            />
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleReviewSubmit} disabled={isPending || currentRating === 0}>
              {isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 