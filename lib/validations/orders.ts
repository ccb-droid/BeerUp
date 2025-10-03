import { z } from "zod"

export const orderSchema = z.object({
  beer_id: z.string().uuid("Invalid beer ID"),
  quantity: z.number().min(1, "Quantity must be at least 1").max(100, "Quantity cannot exceed 100").default(1),
  payment_confirmed: z.boolean().default(false),
})

export const orderUpdateSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1").max(100, "Quantity cannot exceed 100").optional(),
  payment_confirmed: z.boolean().optional(),
})

export type OrderInput = z.infer<typeof orderSchema>
export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>
