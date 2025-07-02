import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { 
  loginSchema, 
  registerSchema, 
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