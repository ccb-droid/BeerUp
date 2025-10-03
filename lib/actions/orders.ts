"use server";

import { createClient } from "../supabase/server";
import type { Waitlist, NewWaitlist } from "../types";
import { orderSchema, orderUpdateSchema, type OrderInput, type OrderUpdateInput } from "../validations/orders";

/**
 * Server action to create an order
 */
export async function createOrder(input: OrderInput): Promise<Waitlist | null> {
  try {
    const validated = orderSchema.parse(input);
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Server Action - createOrder: Authentication error", authError);
      return null;
    }

    // Check if user already has an order for this beer
    const { data: existing, error: existingError } = await supabase
      .from("waitlist")
      .select("*")
      .eq("user_id", user.id)
      .eq("beer_id", validated.beer_id)
      .maybeSingle();

    if (existingError) {
      console.error("Server Action - createOrder: Error checking existing order", existingError);
      return null;
    }

    if (existing) {
      console.log("Server Action - createOrder: User already has an order for this beer", {
        userId: user.id,
        beerId: validated.beer_id
      });
      return existing;
    }

    // Create order
    const orderData: NewWaitlist = {
      user_id: user.id,
      beer_id: validated.beer_id,
      email: user.email!,
      quantity: validated.quantity,
      payment_confirmed: validated.payment_confirmed,
    };

    const { data, error } = await supabase
      .from("waitlist")
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error("Server Action - createOrder: Insert error", error);
      return null;
    }

    console.log("Server Action - createOrder: Successfully created order", {
      userId: user.id,
      beerId: validated.beer_id,
      orderId: data.id
    });

    return data;
  } catch (error) {
    console.error("Server Action - createOrder: Unexpected error", error);
    return null;
  }
}

/**
 * Server action to get user's orders
 */
export async function getUserOrders(): Promise<(Waitlist & { beers: { name: string; brewery: string; image_url: string | null } })[]> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Server Action - getUserOrders: Authentication error", authError);
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
      console.error("Server Action - getUserOrders: Query error", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Server Action - getUserOrders: Unexpected error", error);
    return [];
  }
}

/**
 * Server action to remove/cancel an order
 */
export async function cancelOrder(orderId: string): Promise<boolean> {
  if (!orderId) {
    return false;
  }

  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Server Action - cancelOrder: Authentication error", authError);
      return false;
    }

    const { error } = await supabase
      .from("waitlist")
      .delete()
      .eq("id", orderId)
      .eq("user_id", user.id); // Ensure user can only delete their own items

    if (error) {
      console.error("Server Action - cancelOrder: Delete error", error);
      return false;
    }

    console.log("Server Action - cancelOrder: Successfully cancelled order", {
      userId: user.id,
      orderId
    });

    return true;
  } catch (error) {
    console.error("Server Action - cancelOrder: Unexpected error", error);
    return false;
  }
}

/**
 * Server action to update order
 */
export async function updateOrder(orderId: string, input: OrderUpdateInput): Promise<Waitlist | null> {
  if (!orderId) {
    return null;
  }

  try {
    const validated = orderUpdateSchema.parse(input);
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Server Action - updateOrder: Authentication error", authError);
      return null;
    }

    const { data, error } = await supabase
      .from("waitlist")
      .update(validated)
      .eq("id", orderId)
      .eq("user_id", user.id) // Ensure user can only update their own items
      .select()
      .single();

    if (error) {
      console.error("Server Action - updateOrder: Update error", error);
      return null;
    }

    console.log("Server Action - updateOrder: Successfully updated order", {
      userId: user.id,
      orderId,
      updates: validated
    });

    return data;
  } catch (error) {
    console.error("Server Action - updateOrder: Unexpected error", error);
    return null;
  }
}

/**
 * Server action to check if user has an order for a specific beer
 */
export async function hasOrder(beerId: string): Promise<boolean> {
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
      console.error("Server Action - hasOrder: Query error", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Server Action - hasOrder: Unexpected error", error);
    return false;
  }
}