import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { 
  loginSchema, 
  registerSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from "@/lib/validations/auth"

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

  return {
    success: true,
  }
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

  // Age validation is already handled by the Zod schema
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

  return {
    success: true,
  }
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

  // Determine the base URL for the redirect - use the actual Vercel deployment URL
  let baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  
  if (!baseUrl) {
    if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`
    } else {
      // Fallback to the known Vercel URL for this deployment
      baseUrl = 'https://v0-new-project-mr6vrs4jhyg-ccb-droids-projects.vercel.app'
    }
  }

  // Ensure baseUrl doesn't have trailing slash
  baseUrl = baseUrl.replace(/\/$/, '')
  
  // Construct the full redirect URL for password reset
  const redirectUrl = `${baseUrl}/callback?type=recovery`
  
  console.log("[Auth] Using redirect URL for password reset:", redirectUrl)

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  })

  if (error) {
    console.error("[Auth] Password reset error:", error)
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

  return {
    success: true,
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return {
    success: true,
  }
} 