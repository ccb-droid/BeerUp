import { z } from "zod"

export const reviewSchema = z.object({
  beer_id: z.string().uuid("Invalid beer ID"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  review_text: z.string().min(1, "Review text is required").max(1000, "Review must be less than 1000 characters"),
  typically_drinks: z.boolean().optional(),
})

export const updateReviewSchema = z.object({
  id: z.string().uuid("Invalid review ID"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  review_text: z.string().min(1, "Review text is required").max(1000, "Review must be less than 1000 characters"),
  typically_drinks: z.boolean().optional(),
})

export const reviewFilterSchema = z.object({
  beer_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  min_rating: z.number().min(1).max(5).optional(),
  max_rating: z.number().min(1).max(5).optional(),
  limit: z.number().min(1).max(50).default(10),
  offset: z.number().min(0).default(0),
})

export type ReviewInput = z.infer<typeof reviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
export type ReviewFilter = z.infer<typeof reviewFilterSchema> 