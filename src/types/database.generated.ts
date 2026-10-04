
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "app_logs": {
                  Row: {
                    "context": NonNullable<Json>,"created_at": string,"environment": string | null,"error": Json | null,"event": string,"id": number,"level": string,"message": string | null,"team_id": string | null,"user_id": string | null
                  }
                  Insert: {
                    "context"?: NonNullable<Json>,"created_at"?: string,"environment"?: string | null,"error"?: Json | null,"event": string,"id"?: never,"level": string,"message"?: string | null,"team_id"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "context"?: NonNullable<Json>,"created_at"?: string,"environment"?: string | null,"error"?: Json | null,"event"?: string,"id"?: never,"level"?: string,"message"?: string | null,"team_id"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"audit_logs": {
                  Row: {
                    "action": string,"actor_email": string | null,"actor_id": string | null,"created_at": string,"id": number,"ip_address": string | null,"metadata": NonNullable<Json>,"target_id": string | null,"target_type": string | null,"team_id": string | null,"user_agent": string | null
                  }
                  Insert: {
                    "action": string,"actor_email"?: string | null,"actor_id"?: string | null,"created_at"?: string,"id"?: never,"ip_address"?: string | null,"metadata"?: NonNullable<Json>,"target_id"?: string | null,"target_type"?: string | null,"team_id"?: string | null,"user_agent"?: string | null
                  }
                  Update: {
                    "action"?: string,"actor_email"?: string | null,"actor_id"?: string | null,"created_at"?: string,"id"?: never,"ip_address"?: string | null,"metadata"?: NonNullable<Json>,"target_id"?: string | null,"target_type"?: string | null,"team_id"?: string | null,"user_agent"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"billing_customers": {
                  Row: {
                    "created_at": string,"stripe_customer_id": string,"team_id": string
                  }
                  Insert: {
                    "created_at"?: string,"stripe_customer_id": string,"team_id": string
                  }
                  Update: {
                    "created_at"?: string,"stripe_customer_id"?: string,"team_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "billing_customers_team_id_fkey"
      columns: ["team_id"]
isOneToOne: true
      referencedRelation: "teams"
      referencedColumns: ["id"]
    }
                  ]
                },"invitations": {
                  Row: {
                    "accepted_at": string | null,"created_at": string,"email": string,"expires_at": string,"id": string,"invited_by": string | null,"role": Database["public"]['Enums']["team_role"],"team_id": string,"token_hash": string
                  }
                  Insert: {
                    "accepted_at"?: string | null,"created_at"?: string,"email": string,"expires_at"?: string,"id"?: string,"invited_by"?: string | null,"role"?: Database["public"]['Enums']["team_role"],"team_id": string,"token_hash": string
                  }
                  Update: {
                    "accepted_at"?: string | null,"created_at"?: string,"email"?: string,"expires_at"?: string,"id"?: string,"invited_by"?: string | null,"role"?: Database["public"]['Enums']["team_role"],"team_id"?: string,"token_hash"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "invitations_invited_by_fkey"
      columns: ["invited_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "invitations_team_id_fkey"
      columns: ["team_id"]
isOneToOne: false
      referencedRelation: "teams"
      referencedColumns: ["id"]
    }
                  ]
                },"prices": {
                  Row: {
                    "active": boolean,"created_at": string,"currency": string,"id": string,"interval": string | null,"interval_count": number | null,"metadata": NonNullable<Json>,"product_id": string,"trial_period_days": number | null,"type": string,"unit_amount": number | null,"updated_at": string
                  }
                  Insert: {
                    "active"?: boolean,"created_at"?: string,"currency": string,"id": string,"interval"?: string | null,"interval_count"?: number | null,"metadata"?: NonNullable<Json>,"product_id": string,"trial_period_days"?: number | null,"type": string,"unit_amount"?: number | null,"updated_at"?: string
                  }
                  Update: {
                    "active"?: boolean,"created_at"?: string,"currency"?: string,"id"?: string,"interval"?: string | null,"interval_count"?: number | null,"metadata"?: NonNullable<Json>,"product_id"?: string,"trial_period_days"?: number | null,"type"?: string,"unit_amount"?: number | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "prices_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "active": boolean,"created_at": string,"description": string | null,"id": string,"metadata": NonNullable<Json>,"name": string,"updated_at": string
                  }
                  Insert: {
                    "active"?: boolean,"created_at"?: string,"description"?: string | null,"id": string,"metadata"?: NonNullable<Json>,"name": string,"updated_at"?: string
                  }
                  Update: {
                    "active"?: boolean,"created_at"?: string,"description"?: string | null,"id"?: string,"metadata"?: NonNullable<Json>,"name"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string,"email": string,"full_name": string | null,"id": string,"is_platform_admin": boolean,"updated_at": string,"welcome_email_sent_at": string | null
                  }
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string,"email": string,"full_name"?: string | null,"id": string,"is_platform_admin"?: boolean,"updated_at"?: string,"welcome_email_sent_at"?: string | null
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string,"email"?: string,"full_name"?: string | null,"id"?: string,"is_platform_admin"?: boolean,"updated_at"?: string,"welcome_email_sent_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"purchases": {
                  Row: {
                    "amount_total": number | null,"created_at": string,"currency": string | null,"id": string,"price_id": string,"status": string,"team_id": string
                  }
                  Insert: {
                    "amount_total"?: number | null,"created_at"?: string,"currency"?: string | null,"id": string,"price_id": string,"status": string,"team_id": string
                  }
                  Update: {
                    "amount_total"?: number | null,"created_at"?: string,"currency"?: string | null,"id"?: string,"price_id"?: string,"status"?: string,"team_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "purchases_team_id_fkey"
      columns: ["team_id"]
isOneToOne: false
      referencedRelation: "teams"
      referencedColumns: ["id"]
    }
                  ]
                },"stripe_events": {
                  Row: {
                    "id": string,"processed_at": string,"type": string
                  }
                  Insert: {
                    "id": string,"processed_at"?: string,"type": string
                  }
                  Update: {
                    "id"?: string,"processed_at"?: string,"type"?: string
                  }
                  Relationships: [
                    
                  ]
                },"subscriptions": {
                  Row: {
                    "cancel_at_period_end": boolean,"created_at": string,"current_period_end": string | null,"id": string,"interval": string | null,"price_id": string,"status": string,"team_id": string,"updated_at": string
                  }
                  Insert: {
                    "cancel_at_period_end"?: boolean,"created_at"?: string,"current_period_end"?: string | null,"id": string,"interval"?: string | null,"price_id": string,"status": string,"team_id": string,"updated_at"?: string
                  }
                  Update: {
                    "cancel_at_period_end"?: boolean,"created_at"?: string,"current_period_end"?: string | null,"id"?: string,"interval"?: string | null,"price_id"?: string,"status"?: string,"team_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "subscriptions_team_id_fkey"
      columns: ["team_id"]
isOneToOne: false
      referencedRelation: "teams"
      referencedColumns: ["id"]
    }
                  ]
                },"team_members": {
                  Row: {
                    "created_at": string,"role": Database["public"]['Enums']["team_role"],"team_id": string,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"role"?: Database["public"]['Enums']["team_role"],"team_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"role"?: Database["public"]['Enums']["team_role"],"team_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "team_members_team_id_fkey"
      columns: ["team_id"]
isOneToOne: false
      referencedRelation: "teams"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "team_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"teams": {
                  Row: {
                    "created_at": string,"created_by": string | null,"id": string,"is_personal": boolean,"name": string,"slug": string,"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"is_personal"?: boolean,"name": string,"slug": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"is_personal"?: boolean,"name"?: string,"slug"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "accept_invitation":
{ Args: { "p_token": string }; Returns: string
                           },
"create_team":
{ Args: { "p_name": string,"p_slug"?: string }; Returns: {
              "created_at": string,
"created_by": string | null,
"id": string,
"is_personal": boolean,
"name": string,
"slug": string,
"updated_at": string
            }
                          SetofOptions: {
        from: "*"
        to: "teams"
        isOneToOne: true
        isSetofReturn: false
      } },
"generate_team_slug":
{ Args: { "p_base": string }; Returns: string
                           },
"get_invitation":
{ Args: { "p_token": string }; Returns: {
              "email": string,"inviter_name": string,"role": Database["public"]['Enums']["team_role"],"status": string,"team_name": string,"team_slug": string
            }[]
                           },
"has_team_role":
{ Args: { "p_roles": (Database["public"]['Enums']["team_role"])[],"p_team_id": string }; Returns: boolean
                           },
"is_team_member":
{ Args: { "p_team_id": string }; Returns: boolean
                           },
"purge_old_logs":
{ Args: { "p_app_log_days"?: number,"p_audit_log_days"?: number }; Returns: Json
                           },
"shares_team_with":
{ Args: { "p_user_id": string }; Returns: boolean
                           }
          }
          Enums: {
            "team_role": "owner"|"admin"|"member"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "team_role": ["owner", "admin", "member"]
          }
        }
} as const
