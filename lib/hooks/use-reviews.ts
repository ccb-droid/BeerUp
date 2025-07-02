import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getReviews, getReviewById, addReviewValidated, updateReview, deleteReview, getReviewsByBeer, getReviewsByUser } from "@/lib/actions/reviews"
import { ReviewInput, UpdateReviewInput, ReviewFilter } from "@/lib/validations/review"

export function useReviews(filters?: ReviewFilter) {
  return useQuery({
    queryKey: ["reviews", filters],
    queryFn: () => getReviews(filters),
  })
}

export function useReviewById(id: string) {
  return useQuery({
    queryKey: ["review", id],
    queryFn: () => getReviewById(id),
    enabled: !!id,
  })
}

export function useReviewsByBeer(beerId: string) {
  return useQuery({
    queryKey: ["reviews", "beer", beerId],
    queryFn: () => getReviewsByBeer(beerId),
    enabled: !!beerId,
  })
}

export function useReviewsByUser(userId: string) {
  return useQuery({
    queryKey: ["reviews", "user", userId],
    queryFn: () => getReviewsByUser(userId),
    enabled: !!userId,
  })
}

export function useAddReview() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (review: ReviewInput) => addReviewValidated(review),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] })
      queryClient.invalidateQueries({ queryKey: ["reviews", "beer", variables.beer_id] })
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (review: UpdateReviewInput) => updateReview(review),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] })
      queryClient.invalidateQueries({ queryKey: ["review", variables.id] })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] })
    },
  })
} 