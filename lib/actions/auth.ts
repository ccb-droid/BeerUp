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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        date_of_birth: dob,
      },
    },
  });

  if (error) {
    console.error("Action `signUp`: Auth error", { error });
    return {
      message: error.message,
    };
  }

  if (!data.user) {
    console.error("Action `signUp`: Auth succeeded but no user returned");
    return {
      message: "An unexpected error occurred. No user data returned after sign up.",
    };
  }
  
  // A new user has been created in auth.users, now create their public profile.
  console.log("Action `signUp`: User created in auth, now creating profile", { userId: data.user.id });

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    username: username,
    date_of_birth: dob,
  });

  if (profileError) {
    console.error("Action `signUp`: Failed to create user profile", { 
      userId: data.user.id, 
      error: profileError 
    });
    // This is a critical failure. The user has an auth entry but no profile.
    // While we could try to delete the auth user, it's safer to alert and log.
    return {
      message: "Your account was created, but we failed to set up your user profile. Please contact support.",
    };
  }

  console.log("Action `signUp`: User profile created successfully", { userId: data.user.id });
  return {
    success: true,
  };
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