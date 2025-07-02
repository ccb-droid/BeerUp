import { z } from "zod"

export const beerSchema = z.object({
  name: z.string().min(1, "Beer name is required").max(100, "Beer name must be less than 100 characters"),
  brewery: z.string().min(1, "Brewery is required").max(100, "Brewery name must be less than 100 characters"),
  style: z.string().min(1, "Beer style is required").max(50, "Beer style must be less than 50 characters"),
  abv: z.number().min(0, "ABV must be positive").max(100, "ABV must be less than 100%").optional(),
  ibu: z.number().min(0, "IBU must be positive").max(120, "IBU must be less than 120").optional(),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  image_url: z.string().url("Invalid image URL").optional(),
})

export const beerSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().min(1).max(50).default(10),
  offset: z.number().min(0).default(0),
})

export const beerFilterSchema = z.object({
  style: z.string().optional(),
  brewery: z.string().optional(),
  min_abv: z.number().min(0).max(100).optional(),
  max_abv: z.number().min(0).max(100).optional(),
  min_ibu: z.number().min(0).max(120).optional(),
  max_ibu: z.number().min(0).max(120).optional(),
})

export type BeerInput = z.infer<typeof beerSchema>
export type BeerSearch = z.infer<typeof beerSearchSchema>
export type BeerFilter = z.infer<typeof beerFilterSchema> 