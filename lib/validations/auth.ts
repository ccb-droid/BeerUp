import { z } from "zod"

// Email validation schema
export const emailSchema = z.string()
  .min(1, "Email is required")
  .email("Invalid email format")

// Password validation schema
export const passwordSchema = z.string()
  .min(6, "Password must be at least 6 characters")

// Username validation schema
export const usernameSchema = z.string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be less than 30 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")

// Date of birth validation schema
export const dobSchema = z.string()
  .min(1, "Date of birth is required")
  .refine((dob) => {
    const birthDate = new Date(dob)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18
    }
    return age >= 18
  }, "You must be at least 18 years old")

// Login form validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
})

// Register form validation schema
export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  dob: dobSchema,
})

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// Reset password schema
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Profile update schema
export const profileUpdateSchema = z.object({
  username: usernameSchema.optional(),
  email: emailSchema.optional(),
  dob: dobSchema.optional(),
})

// Type exports for TypeScript
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

// Legacy validation functions for backward compatibility during migration
// These will be removed once all components are migrated to use Zod schemas
export const validateLoginForm = (email: string, password: string): string[] => {
  const result = loginSchema.safeParse({ email, password })
  if (result.success) return []
  return result.error.errors.map(err => err.message)
}

export const validateRegisterForm = (
  username: string,
  email: string,
  password: string,
  dob: string
): string[] => {
  const result = registerSchema.safeParse({ username, email, password, dob })
  if (result.success) return []
  return result.error.errors.map(err => err.message)
} 