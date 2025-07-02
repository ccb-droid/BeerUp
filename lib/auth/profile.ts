import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
// import type { Database } from "@/lib/database.types"; // Will be removed as types come from shared
import type { Profile, UpdateProfile } from "@/lib/types"; // Import from new shared types

export const checkUsernameExists = async (username: string): Promise<{
  exists: boolean;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .limit(1);

    if (error) {
      console.error("Error checking existing username:", error);
      return { exists: false, error };
    }
    return { exists: data && data.length > 0, error: null };
  } catch (error) {
    console.error("Unexpected error in checkUsernameExists:", error);
    return { exists: false, error };
  }
};

export const createUserProfile = async (
  user: User,
  username: string,
  dob: string
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      username,
      date_of_birth: dob,
      notifications_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Profile creation error:", error);
      return { error };
    }
    return { error: null };
  } catch (error) {
    console.error("Unexpected error in createUserProfile:", error);
    return { error };
  }
};

export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as Profile;
  } catch (error) {
    console.error("Unexpected error in getProfile:", error);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  profileData: UpdateProfile
): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(), // Keep ISO string for consistency
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return null;
    }
    return data as Profile;
  } catch (error) {
    console.error("Unexpected error in updateProfile:", error);
    return null;
  }
};

// Remove local type definitions
// type Profile = Database["public"]["Tables"]["profiles"]["Row"];
// type UpdateProfile = Database["public"]["Tables"]["profiles"]["Update"]; 