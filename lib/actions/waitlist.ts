"use server";

import { createClient } from "../supabase/server";
import type { Waitlist, NewWaitlist } from "../types";
import { waitlistSchema, waitlistUpdateSchema, type WaitlistInput, type WaitlistUpdateInput } from "../validations/waitlist";

/**
 * Server action to add user to waitlist
 */
export async function addToWaitlist(input: WaitlistInput): Promise<Waitlist | null> {
  try {
    const validated = waitlistSchema.parse(input);
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Server Action - addToWaitlist: Authentication error", authError);
      return null;
    }

    // Check if user is already on waitlist for this beer
    const { data: existing, error: existingError } = await supabase
      .from("waitlist")
      .select("*")
      .eq("user_id", user.id)
      .eq("beer_id", validated.beer_id)
      .maybeSingle();

    if (existingError) {
      console.error("Server Action - addToWaitlist: Error checking existing waitlist entry", existingError);
      return null;
    }

    if (existing) {
      console.log("Server Action - addToWaitlist: User already on waitlist for this beer", {
        userId: user.id,
        beerId: validated.beer_id
      });
      return existing;
    }

    // Add to waitlist
    const waitlistData: NewWaitlist = {
      user_id: user.id,
      beer_id: validated.beer_id,
      email: user.email!,
      quantity: validated.quantity,
      phone_number: validated.phone_number || null,
    };

    const { data, error } = await supabase
      .from("waitlist")
      .insert(waitlistData)
      .select()
      .single();

    if (error) {
      console.error("Server Action - addToWaitlist: Insert error", error);
      return null;
    }

    console.log("Server Action - addToWaitlist: Successfully added to waitlist", {
      userId: user.id,
      beerId: validated.beer_id,
      waitlistId: data.id
    });

    return data;
  } catch (error) {
    console.error("Server Action - addToWaitlist: Unexpected error", error);
    return null;
  }
}

/**
 * Server action to get user's waitlist items
 */
export async function getUserWaitlistItems(): Promise<(Waitlist & { beers: { name: string; brewery: string; image_url: string | null } })[]> {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Server Action - getUserWaitlistItems: Authentication error", authError);
      return [];
    }

    const { data, error } = await supabase
      .from("waitlist")
      .select(`
        *,
        beers (
          name,
          brewery,
          image_url
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Server Action - getUserWaitlistItems: Query error", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Server Action - getUserWaitlistItems: Unexpected error", error);
    return [];
  }
}

/**
 * Server action to remove item from waitlist
 */
export async function removeFromWaitlist(waitlistId: string): Promise<boolean> {
  if (!waitlistId) {
    return false;
  }

  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Server Action - removeFromWaitlist: Authentication error", authError);
      return false;
    }

    const { error } = await supabase
      .from("waitlist")
      .delete()
      .eq("id", waitlistId)
      .eq("user_id", user.id); // Ensure user can only delete their own items

    if (error) {
      console.error("Server Action - removeFromWaitlist: Delete error", error);
      return false;
    }

    console.log("Server Action - removeFromWaitlist: Successfully removed from waitlist", {
      userId: user.id,
      waitlistId
    });

    return true;
  } catch (error) {
    console.error("Server Action - removeFromWaitlist: Unexpected error", error);
    return false;
  }
}

/**
 * Server action to update waitlist item
 */
export async function updateWaitlistItem(waitlistId: string, input: WaitlistUpdateInput): Promise<Waitlist | null> {
  if (!waitlistId) {
    return null;
  }

  try {
    const validated = waitlistUpdateSchema.parse(input);
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Server Action - updateWaitlistItem: Authentication error", authError);
      return null;
    }

    const { data, error } = await supabase
      .from("waitlist")
      .update(validated)
      .eq("id", waitlistId)
      .eq("user_id", user.id) // Ensure user can only update their own items
      .select()
      .single();

    if (error) {
      console.error("Server Action - updateWaitlistItem: Update error", error);
      return null;
    }

    console.log("Server Action - updateWaitlistItem: Successfully updated waitlist item", {
      userId: user.id,
      waitlistId,
      updates: validated
    });

    return data;
  } catch (error) {
    console.error("Server Action - updateWaitlistItem: Unexpected error", error);
    return null;
  }
}

/**
 * Server action to check if user is on waitlist for a specific beer
 */
export async function isOnWaitlist(beerId: string): Promise<boolean> {
  if (!beerId) {
    return false;
  }

  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return false;
    }

    const { data, error } = await supabase
      .from("waitlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("beer_id", beerId)
      .maybeSingle();

    if (error) {
      console.error("Server Action - isOnWaitlist: Query error", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Server Action - isOnWaitlist: Unexpected error", error);
    return false;
  }
}