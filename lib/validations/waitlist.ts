import { z } from "zod"

export const waitlistSchema = z.object({
  beer_id: z.string().uuid("Invalid beer ID"),
  quantity: z.number().min(1, "Quantity must be at least 1").max(10, "Quantity cannot exceed 10").default(1),
  phone_number: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format").optional().or(z.literal("")),
})

export const waitlistUpdateSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1").max(10, "Quantity cannot exceed 10").optional(),
  phone_number: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format").optional().or(z.literal("")),
})

export type WaitlistInput = z.infer<typeof waitlistSchema>
export type WaitlistUpdateInput = z.infer<typeof waitlistUpdateSchema>