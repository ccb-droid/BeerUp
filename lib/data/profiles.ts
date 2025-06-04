import { type SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { Database, Profile, NewProfile, UpdateProfile } from "../types";

/**
 * Pure database access layer for profiles
 * All functions require a supabase client to be passed in
 */
export class ProfilesRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findById(id: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  }

  async findByUsername(username: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch profile by username: ${error.message}`);
    }

    return data;
  }

  async checkUsernameExists(username: string): Promise<boolean> {
    const { data, error } = await this.client
      .from("profiles")
      .select("id")
      .eq("username", username)
      .limit(1);

    if (error) {
      throw new Error(`Failed to check username existence: ${error.message}`);
    }

    return data && data.length > 0;
  }

  async create(profile: NewProfile): Promise<Profile> {
    const { data, error } = await this.client
      .from("profiles")
      .insert(profile)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return data;
  }

  async update(id: string, profileData: UpdateProfile): Promise<Profile> {
    const { data, error } = await this.client
      .from("profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete profile: ${error.message}`);
    }
  }
}

// Convenience functions for backward compatibility
export function createProfilesRepository(client: SupabaseClient<Database>) {
  return new ProfilesRepository(client);
} 