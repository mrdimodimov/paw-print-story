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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          confusion_text: string | null
          created_at: string
          id: string
          missing_text: string | null
          photos_uploaded: number | null
          positive_text: string | null
          rating: string | null
          tester_token: string | null
          time_to_complete_seconds: number | null
          tribute_id: string | null
        }
        Insert: {
          confusion_text?: string | null
          created_at?: string
          id?: string
          missing_text?: string | null
          photos_uploaded?: number | null
          positive_text?: string | null
          rating?: string | null
          tester_token?: string | null
          time_to_complete_seconds?: number | null
          tribute_id?: string | null
        }
        Update: {
          confusion_text?: string | null
          created_at?: string
          id?: string
          missing_text?: string | null
          photos_uploaded?: number | null
          positive_text?: string | null
          rating?: string | null
          tester_token?: string | null
          time_to_complete_seconds?: number | null
          tribute_id?: string | null
        }
        Relationships: []
      }
      generation_jobs: {
        Row: {
          created_at: string
          error_message: string | null
          form_data: Json | null
          id: string
          narrative_context: string | null
          owner_name: string | null
          pet_name: string
          photo_urls: string[]
          prompt_context_hash: string | null
          share_card_text: string | null
          short_caption: string | null
          social_post: string | null
          status: string
          tier_name: string
          tribute_story: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          form_data?: Json | null
          id?: string
          narrative_context?: string | null
          owner_name?: string | null
          pet_name: string
          photo_urls?: string[]
          prompt_context_hash?: string | null
          share_card_text?: string | null
          short_caption?: string | null
          social_post?: string | null
          status?: string
          tier_name: string
          tribute_story?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          form_data?: Json | null
          id?: string
          narrative_context?: string | null
          owner_name?: string | null
          pet_name?: string
          photo_urls?: string[]
          prompt_context_hash?: string | null
          share_card_text?: string | null
          short_caption?: string | null
          social_post?: string | null
          status?: string
          tier_name?: string
          tribute_story?: string | null
        }
        Relationships: []
      }
      public_tributes: {
        Row: {
          breed: string | null
          created_at: string
          custom_slug: string | null
          id: string
          pet_name: string
          pet_type: string
          photo_urls: string[]
          share_card_text: string | null
          slug: string
          social_post: string | null
          story: string
          tier_id: string
          years_of_life: string | null
        }
        Insert: {
          breed?: string | null
          created_at?: string
          custom_slug?: string | null
          id?: string
          pet_name: string
          pet_type?: string
          photo_urls?: string[]
          share_card_text?: string | null
          slug: string
          social_post?: string | null
          story: string
          tier_id?: string
          years_of_life?: string | null
        }
        Update: {
          breed?: string | null
          created_at?: string
          custom_slug?: string | null
          id?: string
          pet_name?: string
          pet_type?: string
          photo_urls?: string[]
          share_card_text?: string | null
          slug?: string
          social_post?: string | null
          story?: string
          tier_id?: string
          years_of_life?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      tester_access: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          source: string | null
          token: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          source?: string | null
          token: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          source?: string | null
          token?: string
        }
        Relationships: []
      }
      tribute_email_sequence: {
        Row: {
          created_at: string
          email: string
          email_number: number
          id: string
          pet_name: string
          sent_at: string | null
          stopped: boolean
          tribute_email_id: string
          tribute_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          email_number: number
          id?: string
          pet_name?: string
          sent_at?: string | null
          stopped?: boolean
          tribute_email_id: string
          tribute_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          email_number?: number
          id?: string
          pet_name?: string
          sent_at?: string | null
          stopped?: boolean
          tribute_email_id?: string
          tribute_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tribute_email_sequence_tribute_email_id_fkey"
            columns: ["tribute_email_id"]
            isOneToOne: false
            referencedRelation: "tribute_emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tribute_email_sequence_tribute_id_fkey"
            columns: ["tribute_id"]
            isOneToOne: false
            referencedRelation: "tributes"
            referencedColumns: ["id"]
          },
        ]
      }
      tribute_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          tribute_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          tribute_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          tribute_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tribute_emails_tribute_id_fkey"
            columns: ["tribute_id"]
            isOneToOne: false
            referencedRelation: "tributes"
            referencedColumns: ["id"]
          },
        ]
      }
      tribute_memories: {
        Row: {
          created_at: string
          id: string
          message: string
          tribute_id: string
          visitor_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          tribute_id: string
          visitor_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          tribute_id?: string
          visitor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tribute_memories_tribute_id_fkey"
            columns: ["tribute_id"]
            isOneToOne: false
            referencedRelation: "tributes"
            referencedColumns: ["id"]
          },
        ]
      }
      tribute_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          tribute_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: string
          tribute_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          tribute_id?: string
        }
        Relationships: []
      }
      tributes: {
        Row: {
          breed: string | null
          created_at: string
          form_data: Json | null
          id: string
          is_paid: boolean
          is_public: boolean
          owner_name: string | null
          pet_name: string
          pet_type: string
          photo_urls: string[]
          share_card_text: string | null
          short_caption: string | null
          slug: string | null
          social_post: string | null
          stripe_session_id: string | null
          tier_name: string
          title: string | null
          tribute_story: string
          years_of_life: string | null
        }
        Insert: {
          breed?: string | null
          created_at?: string
          form_data?: Json | null
          id?: string
          is_paid?: boolean
          is_public?: boolean
          owner_name?: string | null
          pet_name: string
          pet_type?: string
          photo_urls?: string[]
          share_card_text?: string | null
          short_caption?: string | null
          slug?: string | null
          social_post?: string | null
          stripe_session_id?: string | null
          tier_name: string
          title?: string | null
          tribute_story: string
          years_of_life?: string | null
        }
        Update: {
          breed?: string | null
          created_at?: string
          form_data?: Json | null
          id?: string
          is_paid?: boolean
          is_public?: boolean
          owner_name?: string | null
          pet_name?: string
          pet_type?: string
          photo_urls?: string[]
          share_card_text?: string | null
          short_caption?: string | null
          slug?: string | null
          social_post?: string | null
          stripe_session_id?: string | null
          tier_name?: string
          title?: string | null
          tribute_story?: string
          years_of_life?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
