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
      }/callback`,
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const redirectTo = `${baseUrl}/callback?type=recovery`;
  console.log(redirectTo);
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  }
);
};

export const getCurrentSession = async () => {
  return await supabase.auth.getSession();
}; 

