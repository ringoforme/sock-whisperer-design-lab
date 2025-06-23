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
        ]
      }
      design_requirements: {
        Row: {
          additional_notes: string | null
          budget_range: string | null
          colors: string[] | null
          created_at: string | null
          id: string
          is_finalized: boolean | null
          material_preferences: string[] | null
          occasion: string | null
          patterns: string[] | null
          session_id: string
          size_range: string | null
          sock_type: string | null
          special_features: string[] | null
          style: string | null
          target_audience: string | null
          updated_at: string | null
        }
        Insert: {
          additional_notes?: string | null
          budget_range?: string | null
          colors?: string[] | null
          created_at?: string | null
          id?: string
          is_finalized?: boolean | null
          material_preferences?: string[] | null
          occasion?: string | null
          patterns?: string[] | null
          session_id: string
          size_range?: string | null
          sock_type?: string | null
          special_features?: string[] | null
          style?: string | null
          target_audience?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_notes?: string | null
          budget_range?: string | null
          colors?: string[] | null
          created_at?: string | null
          id?: string
          is_finalized?: boolean | null
          material_preferences?: string[] | null
          occasion?: string | null
          patterns?: string[] | null
          session_id?: string
          size_range?: string | null
          sock_type?: string | null
          special_features?: string[] | null
          style?: string | null
          target_audience?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_requirements_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "design_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      design_sessions: {
        Row: {
          created_at: string | null
          id: string
          initial_prompt: string
          metadata: Json | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          initial_prompt: string
          metadata?: Json | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          initial_prompt?: string
          metadata?: Json | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      design_tags: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      design_work_tags: {
        Row: {
          design_work_id: string
          tag_id: string
        }
        Insert: {
          design_work_id: string
          tag_id: string
        }
        Update: {
          design_work_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_work_tags_design_work_id_fkey"
            columns: ["design_work_id"]
            isOneToOne: false
            referencedRelation: "design_works"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_work_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "design_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      design_works: {
        Row: {
          created_at: string | null
          description: string | null
          download_count: number | null
          edit_history: Json | null
          error_message: string | null
          generation_model: string | null
          generation_params: Json | null
          generation_provider: string | null
          id: string
          image_url: string
          is_favorite: boolean | null
          name: string
          parent_work_id: string | null
          prompt_used: string
          requirements_id: string | null
          session_id: string
          status: string
          thumbnail_url: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          edit_history?: Json | null
          error_message?: string | null
          generation_model?: string | null
          generation_params?: Json | null
          generation_provider?: string | null
          id?: string
          image_url: string
          is_favorite?: boolean | null
          name: string
          parent_work_id?: string | null
          prompt_used: string
          requirements_id?: string | null
          session_id: string
          status?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          edit_history?: Json | null
          error_message?: string | null
          generation_model?: string | null
          generation_params?: Json | null
          generation_provider?: string | null
          id?: string
          image_url?: string
          is_favorite?: boolean | null
          name?: string
          parent_work_id?: string | null
          prompt_used?: string
          requirements_id?: string | null
          session_id?: string
          status?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "design_works_parent_work_id_fkey"
            columns: ["parent_work_id"]
            isOneToOne: false
            referencedRelation: "design_works"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_works_requirements_id_fkey"
            columns: ["requirements_id"]
            isOneToOne: false
            referencedRelation: "design_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_works_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "design_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          work_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          work_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "design_works"
            referencedColumns: ["id"]
          },
        ]
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
