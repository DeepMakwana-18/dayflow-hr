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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          profile_id: string
          status: Database["public"]["Enums"]["attendance_status"] | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          profile_id: string
          status?: Database["public"]["Enums"]["attendance_status"] | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          profile_id?: string
          status?: Database["public"]["Enums"]["attendance_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          document_type: string | null
          file_url: string
          id: string
          name: string
          profile_id: string
          uploaded_at: string | null
        }
        Insert: {
          document_type?: string | null
          file_url: string
          id?: string
          name: string
          profile_id: string
          uploaded_at?: string | null
        }
        Update: {
          document_type?: string | null
          file_url?: string
          id?: string
          name?: string
          profile_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          admin_comments: string | null
          created_at: string | null
          end_date: string
          id: string
          leave_type: Database["public"]["Enums"]["leave_type"]
          profile_id: string
          remarks: string | null
          reviewed_by: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"] | null
          updated_at: string | null
        }
        Insert: {
          admin_comments?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          leave_type: Database["public"]["Enums"]["leave_type"]
          profile_id: string
          remarks?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"] | null
          updated_at?: string | null
        }
        Update: {
          admin_comments?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          leave_type?: Database["public"]["Enums"]["leave_type"]
          profile_id?: string
          remarks?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll: {
        Row: {
          allowances: number | null
          basic_salary: number | null
          created_at: string | null
          deductions: number | null
          id: string
          month: string
          net_salary: number | null
          profile_id: string
          status: string | null
        }
        Insert: {
          allowances?: number | null
          basic_salary?: number | null
          created_at?: string | null
          deductions?: number | null
          id?: string
          month: string
          net_salary?: number | null
          profile_id: string
          status?: string | null
        }
        Update: {
          allowances?: number | null
          basic_salary?: number | null
          created_at?: string | null
          deductions?: number | null
          id?: string
          month?: string
          net_salary?: number | null
          profile_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          department: string | null
          email: string
          employee_id: string
          first_name: string | null
          hire_date: string | null
          id: string
          last_name: string | null
          phone: string | null
          position: string | null
          profile_picture: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          employee_id: string
          first_name?: string | null
          hire_date?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          position?: string | null
          profile_picture?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          employee_id?: string
          first_name?: string | null
          hire_date?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          position?: string | null
          profile_picture?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      salary_structure: {
        Row: {
          basic_salary: number | null
          created_at: string | null
          housing_allowance: number | null
          id: string
          other_allowances: number | null
          profile_id: string
          transport_allowance: number | null
          updated_at: string | null
        }
        Insert: {
          basic_salary?: number | null
          created_at?: string | null
          housing_allowance?: number | null
          id?: string
          other_allowances?: number | null
          profile_id: string
          transport_allowance?: number | null
          updated_at?: string | null
        }
        Update: {
          basic_salary?: number | null
          created_at?: string | null
          housing_allowance?: number | null
          id?: string
          other_allowances?: number | null
          profile_id?: string
          transport_allowance?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_structure_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_profile_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "employee"
      attendance_status: "present" | "absent" | "half_day" | "leave"
      leave_status: "pending" | "approved" | "rejected"
      leave_type: "paid" | "sick" | "unpaid"
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
    Enums: {
      app_role: ["admin", "employee"],
      attendance_status: ["present", "absent", "half_day", "leave"],
      leave_status: ["pending", "approved", "rejected"],
      leave_type: ["paid", "sick", "unpaid"],
    },
  },
} as const
