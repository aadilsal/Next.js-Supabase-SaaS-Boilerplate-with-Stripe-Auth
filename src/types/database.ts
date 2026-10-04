// This file mirrors the output of `pnpm db:types` (supabase gen types).
// Regenerate it after every migration instead of editing it by hand.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      billing_customers: {
        Row: {
          created_at: string
          stripe_customer_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          stripe_customer_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          stripe_customer_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_platform_admin: boolean
          updated_at: string
          welcome_email_sent_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_platform_admin?: boolean
          updated_at?: string
          welcome_email_sent_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_platform_admin?: boolean
          updated_at?: string
          welcome_email_sent_at?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_total: number | null
          created_at: string
          currency: string | null
          id: string
          price_id: string
          status: string
          team_id: string
        }
        Insert: {
          amount_total?: number | null
          created_at?: string
          currency?: string | null
          id: string
          price_id: string
          status: string
          team_id: string
        }
        Update: {
          amount_total?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          price_id?: string
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          id: string
          processed_at: string
          type: string
        }
        Insert: {
          id: string
          processed_at?: string
          type: string
        }
        Update: {
          id?: string
          processed_at?: string
          type?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          id: string
          interval: string | null
          price_id: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id: string
          interval?: string | null
          price_id: string
          status: string
          team_id: string
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          interval?: string | null
          price_id?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_personal: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_personal?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_personal?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { p_token: string }; Returns: string }
      create_team: {
        Args: { p_name: string; p_slug?: string }
        Returns: {
          created_at: string
          created_by: string | null
          id: string
          is_personal: boolean
          name: string
          slug: string
          updated_at: string
        }
      }
      get_invitation: {
        Args: { p_token: string }
        Returns: {
          email: string
          inviter_name: string
          role: Database["public"]["Enums"]["team_role"]
          status: string
          team_name: string
          team_slug: string
        }[]
      }
      has_team_role: {
        Args: {
          p_roles: Database["public"]["Enums"]["team_role"][]
          p_team_id: string
        }
        Returns: boolean
      }
      is_team_member: { Args: { p_team_id: string }; Returns: boolean }
      shares_team_with: { Args: { p_user_id: string }; Returns: boolean }
    }
    Enums: {
      team_role: "owner" | "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]

// App-level aliases (not generated). Kept here so imports stay short.
export type TeamRole = Enums<"team_role">
export type Team = Tables<"teams">
export type Profile = Tables<"profiles">
