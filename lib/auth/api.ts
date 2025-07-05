import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Helper function to get the base URL consistently
export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side: use window.location.origin
    return window.location.origin;
  }
  
  // Server-side: use environment variable with fallback
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return 'https://v0-new-project-mr6vrs4jhyg-ccb-droids-projects.vercel.app';
}

export const signUpUser = async (
  email: string,
  password: string,
  username: string,
  dob: string
): Promise<{ data: { user: User | null }; error: any }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        date_of_birth: dob,
      },
      emailRedirectTo: `${getBaseUrl()}/callback`,
    },
  });
  return { data, error };
};

export const signInUser = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOutUser = async () => {
  return await supabase.auth.signOut();
};

export const resetUserPassword = async (email: string) => {
  const redirectTo = `${getBaseUrl()}/reset-password`;
  console.log('[Auth API] Password reset redirect URL:', redirectTo);
  
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
};

export const getCurrentSession = async () => {
  return await supabase.auth.getSession();
}; 