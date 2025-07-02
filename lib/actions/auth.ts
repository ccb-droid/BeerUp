import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(9, "Password must be at least 9 characters long"),
  username: z.string().min(1, "Username is required"),
  dob: z.string().min(1, "Date of birth is required"),
})

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

const resetPasswordSchema = z.object({
  password: z.string().min(9, "Password must be at least 9 characters long"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient()
  
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      message: error.message,
    }
  }

  redirect("/")
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  
  const validatedFields = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
    dob: formData.get("dob"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, username, dob } = validatedFields.data

  // Check if user is at least 18 years old
  const birthDate = new Date(dob)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (age < 18 || (age === 18 && monthDiff < 0) || 
      (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return {
      message: "You must be at least 18 years old to register",
    }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        date_of_birth: dob,
      },
    },
  })

  if (error) {
    return {
      message: error.message,
    }
  }

  redirect("/")
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  
  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email } = validatedFields.data

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })

  if (error) {
    return {
      message: error.message,
    }
  }

  return {
    message: "Password reset email sent! Check your inbox.",
  }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  
  const validatedFields = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { password } = validatedFields.data

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return {
      message: error.message,
    }
  }

  redirect("/")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
} 