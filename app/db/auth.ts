import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

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
      emailRedirectTo: `${
        typeof window !== "undefined" ? window.location.origin : ""
      }/auth/callback`,
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
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${
      typeof window !== "undefined" ? window.location.origin : ""
    }/auth/reset-password`,
  });
};

export const getCurrentSession = async () => {
  return await supabase.auth.getSession();
}; 