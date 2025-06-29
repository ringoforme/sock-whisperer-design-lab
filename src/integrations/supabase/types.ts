export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      conversation_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "design_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "session_history_view"
            referencedColumns: ["id"]
          },
        ]
      }
      design_briefs: {
        Row: {
          additional_notes: string | null
          colors: Json | null
          completion_status: string | null
          created_at: string | null
          id: string
          occasion: string | null
          pattern: string | null
          session_id: string
          sock_type: string | null
          style: string | null
          updated_at: string | null
        }
        Insert: {
          additional_notes?: string | null
          colors?: Json | null
          completion_status?: string | null
          created_at?: string | null
          id?: string
          occasion?: string | null
          pattern?: string | null
          session_id: string
          sock_type?: string | null
          style?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_notes?: string | null
          colors?: Json | null
          completion_status?: string | null
          created_at?: string | null
          id?: string
          occasion?: string | null
          pattern?: string | null
          session_id?: string
          sock_type?: string | null
          style?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_briefs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "design_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_briefs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "session_history_view"
            referencedColumns: ["id"]
          },
        ]
      }
      design_sessions: {
        Row: {
          created_at: string | null
          id: string
          initial_idea: string
          session_title: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          initial_idea: string
          session_title?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          initial_idea?: string
          session_title?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expanded_prompts: {
        Row: {
          brief_id: string
          created_at: string | null
          expanded_prompt: string
          id: string
          original_brief: string
          prompt_version: number | null
          session_id: string
        }
        Insert: {
          brief_id: string
          created_at?: string | null
          expanded_prompt: string
          id?: string
          original_brief: string
          prompt_version?: number | null
          session_id: string
        }
        Update: {
          brief_id?: string
          created_at?: string | null
          expanded_prompt?: string
          id?: string
          original_brief?: string
          prompt_version?: number | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expanded_prompts_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "design_briefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expanded_prompts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "design_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expanded_prompts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "session_history_view"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_images: {
        Row: {
          created_at: string | null
          design_name: string
          display_order: number | null
          error_message: string | null
          generation_status: string | null
          id: string
          image_url: string
          is_downloaded: boolean | null
          is_edited: boolean | null
          is_hidden_from_user: boolean | null
          is_vectorized: boolean | null
          message_id: string | null
          prompt_id: string
          session_id: string
          thumbnail_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          design_name: string
          display_order?: number | null
          error_message?: string | null
          generation_status?: string | null
          id?: string
          image_url: string
          is_downloaded?: boolean | null
          is_edited?: boolean | null
          is_hidden_from_user?: boolean | null
          is_vectorized?: boolean | null
          message_id?: string | null
          prompt_id: string
          session_id: string
          thumbnail_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          design_name?: string
          display_order?: number | null
          error_message?: string | null
          generation_status?: string | null
          id?: string
          image_url?: string
          is_downloaded?: boolean | null
          is_edited?: boolean | null
          is_hidden_from_user?: boolean | null
          is_vectorized?: boolean | null
          message_id?: string | null
          prompt_id?: string
          session_id?: string
          thumbnail_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_images_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "conversation_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_images_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "expanded_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_images_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "design_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_images_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "session_history_view"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      session_history_view: {
        Row: {
          created_at: string | null
          id: string | null
          initial_idea: string | null
          session_title: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          user_message_count: number | null
        }
        Relationships: []
      }
      user_design_library: {
        Row: {
          category: string | null
          created_at: string | null
          design_name: string | null
          generation_status: string | null
          id: string | null
          image_url: string | null
          is_downloaded: boolean | null
          is_edited: boolean | null
          is_vectorized: boolean | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          category?: never
          created_at?: string | null
          design_name?: string | null
          generation_status?: string | null
          id?: string | null
          image_url?: string | null
          is_downloaded?: boolean | null
          is_edited?: boolean | null
          is_vectorized?: boolean | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          category?: never
          created_at?: string | null
          design_name?: string | null
          generation_status?: string | null
          id?: string | null
          image_url?: string | null
          is_downloaded?: boolean | null
          is_edited?: boolean | null
          is_vectorized?: boolean | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_images_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "design_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_images_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "session_history_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_session_by_image_id: {
        Args: { image_id: string }
        Returns: {
          session_id: string
          session_title: string
          message_id: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
