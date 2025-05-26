export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          date_of_birth: string
          notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          date_of_birth: string
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          date_of_birth?: string
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      beers: {
        Row: {
          id: string
          name: string
          brewery: string
          style: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          brewery: string
          style: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          brewery?: string
          style?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          beer_id: string
          rating: number
          review_text: string
          typically_drinks: boolean
          images: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          beer_id: string
          rating: number
          review_text: string
          typically_drinks?: boolean
          images?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          beer_id?: string
          rating?: number
          review_text?: string
          typically_drinks?: boolean
          images?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
