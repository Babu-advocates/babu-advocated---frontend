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
      admin_accounts: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          password: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          password: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          password?: string
          updated_at?: string
        }
        Relationships: []
      }
      advocate_employee_counters: {
        Row: {
          created_at: string
          id: string
          last_sequence: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_sequence?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_sequence?: number
          updated_at?: string
        }
        Relationships: []
      }
      advocate_employees: {
        Row: {
          account_no: string
          address: string
          alternate_phone_no: string | null
          bank: string
          branch: string
          created_at: string
          created_by: string | null
          date_of_joining: string
          details: string | null
          dob: string
          employee_id: string
          father_husband_name: string
          fixed_salary: number | null
          gender: string
          id: string
          ifsc_code: string
          mail_id: string
          name: string
          phone_no: string
          photo: string | null
          qr_code: string | null
          qualification: string
          reference: string | null
          updated_at: string
        }
        Insert: {
          account_no: string
          address: string
          alternate_phone_no?: string | null
          bank: string
          branch: string
          created_at?: string
          created_by?: string | null
          date_of_joining: string
          details?: string | null
          dob: string
          employee_id: string
          father_husband_name: string
          fixed_salary?: number | null
          gender: string
          id?: string
          ifsc_code: string
          mail_id: string
          name: string
          phone_no: string
          photo?: string | null
          qr_code?: string | null
          qualification: string
          reference?: string | null
          updated_at?: string
        }
        Update: {
          account_no?: string
          address?: string
          alternate_phone_no?: string | null
          bank?: string
          branch?: string
          created_at?: string
          created_by?: string | null
          date_of_joining?: string
          details?: string | null
          dob?: string
          employee_id?: string
          father_husband_name?: string
          fixed_salary?: number | null
          gender?: string
          id?: string
          ifsc_code?: string
          mail_id?: string
          name?: string
          phone_no?: string
          photo?: string | null
          qr_code?: string | null
          qualification?: string
          reference?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          account_number: string | null
          additional_notes: string | null
          address: string | null
          application_id: string
          application_type: string
          assigned_at: string | null
          assigned_to: string | null
          assigned_to_username: string | null
          bank_application_no: string | null
          bank_name: string
          borrower_name: string
          created_at: string
          customer_id: string
          digital_signature_applied: boolean | null
          district: string | null
          due_since: string | null
          email: string
          extent_of_property: string | null
          id: string
          layout_name: string | null
          loan_amount: number
          loan_type: string
          location_of_property: string | null
          nature_of_property: string | null
          opinion_files: Json | null
          original_assigned_to: string | null
          original_assigned_to_username: string | null
          outstanding_amount: number | null
          phone: string
          plot_no: string | null
          recovery_stage: string | null
          redirect_reason: string | null
          salesman_contact: string | null
          salesman_email: string | null
          salesman_name: string | null
          sanction_date: string | null
          status: string
          submission_date: string
          submitted_by: string | null
          submitted_date: string | null
          survey_number: string | null
          taluk: string | null
          updated_at: string
          uploaded_files: Json | null
          village: string | null
        }
        Insert: {
          account_number?: string | null
          additional_notes?: string | null
          address?: string | null
          application_id: string
          application_type: string
          assigned_at?: string | null
          assigned_to?: string | null
          assigned_to_username?: string | null
          bank_application_no?: string | null
          bank_name: string
          borrower_name: string
          created_at?: string
          customer_id: string
          digital_signature_applied?: boolean | null
          district?: string | null
          due_since?: string | null
          email: string
          extent_of_property?: string | null
          id?: string
          layout_name?: string | null
          loan_amount: number
          loan_type: string
          location_of_property?: string | null
          nature_of_property?: string | null
          opinion_files?: Json | null
          original_assigned_to?: string | null
          original_assigned_to_username?: string | null
          outstanding_amount?: number | null
          phone: string
          plot_no?: string | null
          recovery_stage?: string | null
          redirect_reason?: string | null
          salesman_contact?: string | null
          salesman_email?: string | null
          salesman_name?: string | null
          sanction_date?: string | null
          status?: string
          submission_date?: string
          submitted_by?: string | null
          submitted_date?: string | null
          survey_number?: string | null
          taluk?: string | null
          updated_at?: string
          uploaded_files?: Json | null
          village?: string | null
        }
        Update: {
          account_number?: string | null
          additional_notes?: string | null
          address?: string | null
          application_id?: string
          application_type?: string
          assigned_at?: string | null
          assigned_to?: string | null
          assigned_to_username?: string | null
          bank_application_no?: string | null
          bank_name?: string
          borrower_name?: string
          created_at?: string
          customer_id?: string
          digital_signature_applied?: boolean | null
          district?: string | null
          due_since?: string | null
          email?: string
          extent_of_property?: string | null
          id?: string
          layout_name?: string | null
          loan_amount?: number
          loan_type?: string
          location_of_property?: string | null
          nature_of_property?: string | null
          opinion_files?: Json | null
          original_assigned_to?: string | null
          original_assigned_to_username?: string | null
          outstanding_amount?: number | null
          phone?: string
          plot_no?: string | null
          recovery_stage?: string | null
          redirect_reason?: string | null
          salesman_contact?: string | null
          salesman_email?: string | null
          salesman_name?: string | null
          sanction_date?: string | null
          status?: string
          submission_date?: string
          submitted_by?: string | null
          submitted_date?: string | null
          survey_number?: string | null
          taluk?: string | null
          updated_at?: string
          uploaded_files?: Json | null
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employee_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_excluded_dates: {
        Row: {
          created_at: string
          created_by: string | null
          excluded_date: string
          id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          excluded_date: string
          id?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          excluded_date?: string
          id?: string
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          created_at: string
          date: string
          employee_id: string
          employee_username: string
          id: string
          location: string | null
          photo: string
          timestamp: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          employee_id: string
          employee_username: string
          id?: string
          location?: string | null
          photo: string
          timestamp?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          employee_id?: string
          employee_username?: string
          id?: string
          location?: string | null
          photo?: string
          timestamp?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          bank_name: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          password: string
          updated_at: string
          username: string
        }
        Insert: {
          bank_name: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          password: string
          updated_at?: string
          username: string
        }
        Update: {
          bank_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          password?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      bank_application_counters: {
        Row: {
          bank_name: string
          created_at: string
          id: string
          last_sequence: number
          updated_at: string
        }
        Insert: {
          bank_name: string
          created_at?: string
          id?: string
          last_sequence?: number
          updated_at?: string
        }
        Update: {
          bank_name?: string
          created_at?: string
          id?: string
          last_sequence?: number
          updated_at?: string
        }
        Relationships: []
      }
      employee_accounts: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          password: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          password: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          password?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      employee_salaries: {
        Row: {
          actual_salary: number | null
          bonus: number | null
          created_at: string
          days_absent: number | null
          days_present: number | null
          deductions: number | null
          employee_id: string
          fixed_salary: number
          id: string
          month: number
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          year: number
        }
        Insert: {
          actual_salary?: number | null
          bonus?: number | null
          created_at?: string
          days_absent?: number | null
          days_present?: number | null
          deductions?: number | null
          employee_id: string
          fixed_salary?: number
          id?: string
          month: number
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          actual_salary?: number | null
          bonus?: number | null
          created_at?: string
          days_absent?: number | null
          days_present?: number | null
          deductions?: number | null
          employee_id?: string
          fixed_salary?: number
          id?: string
          month?: number
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      files: {
        Row: {
          b2_file_id: string
          b2_file_name: string
          created_at: string
          download_url: string
          id: string
          name: string
          size: number
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          b2_file_id: string
          b2_file_name: string
          created_at?: string
          download_url: string
          id?: string
          name: string
          size: number
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          b2_file_id?: string
          b2_file_name?: string
          created_at?: string
          download_url?: string
          id?: string
          name?: string
          size?: number
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      litigation_access_accounts: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          password: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          password: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          password?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      litigation_accounts: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          litigation_name: string
          password: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          litigation_name: string
          password: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          litigation_name?: string
          password?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      litigation_case_visibility: {
        Row: {
          created_at: string
          id: string
          litigation_access_username: string
          litigation_case_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          litigation_access_username: string
          litigation_case_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          litigation_access_username?: string
          litigation_case_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "litigation_case_visibility_litigation_case_id_fkey"
            columns: ["litigation_case_id"]
            isOneToOne: false
            referencedRelation: "litigation_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      litigation_cases: {
        Row: {
          account_no: string | null
          bank_name: string | null
          borrower_name: string | null
          branch_name: string | null
          case_no: string
          case_type: string
          category: string
          co_borrower_name: string | null
          court_district: string
          court_name: string
          created_at: string
          created_by: string | null
          details: string | null
          filing_date: string
          final_fees: number | null
          final_fees_received_on: string | null
          id: string
          initial_fees: number | null
          initial_fees_received_on: string | null
          judgement_date: string | null
          loan_amount: number | null
          next_hearing_date: string | null
          petitioner_address: string | null
          petitioner_name: string | null
          present_status: string | null
          respondent_address: string | null
          respondent_name: string | null
          status: string
          total_advocate_fees: number | null
          updated_at: string
        }
        Insert: {
          account_no?: string | null
          bank_name?: string | null
          borrower_name?: string | null
          branch_name?: string | null
          case_no: string
          case_type: string
          category: string
          co_borrower_name?: string | null
          court_district: string
          court_name: string
          created_at?: string
          created_by?: string | null
          details?: string | null
          filing_date: string
          final_fees?: number | null
          final_fees_received_on?: string | null
          id?: string
          initial_fees?: number | null
          initial_fees_received_on?: string | null
          judgement_date?: string | null
          loan_amount?: number | null
          next_hearing_date?: string | null
          petitioner_address?: string | null
          petitioner_name?: string | null
          present_status?: string | null
          respondent_address?: string | null
          respondent_name?: string | null
          status?: string
          total_advocate_fees?: number | null
          updated_at?: string
        }
        Update: {
          account_no?: string | null
          bank_name?: string | null
          borrower_name?: string | null
          branch_name?: string | null
          case_no?: string
          case_type?: string
          category?: string
          co_borrower_name?: string | null
          court_district?: string
          court_name?: string
          created_at?: string
          created_by?: string | null
          details?: string | null
          filing_date?: string
          final_fees?: number | null
          final_fees_received_on?: string | null
          id?: string
          initial_fees?: number | null
          initial_fees_received_on?: string | null
          judgement_date?: string | null
          loan_amount?: number | null
          next_hearing_date?: string | null
          petitioner_address?: string | null
          petitioner_name?: string | null
          present_status?: string | null
          respondent_address?: string | null
          respondent_name?: string | null
          status?: string
          total_advocate_fees?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      loan_types: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          application_id: string
          created_at: string
          employee_email: string | null
          employee_username: string
          id: string
          is_read: boolean
          message: string
          type: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          employee_email?: string | null
          employee_username: string
          id?: string
          is_read?: boolean
          message: string
          type: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          employee_email?: string | null
          employee_username?: string
          id?: string
          is_read?: boolean
          message?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_otps: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          is_used: boolean
          otp: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          is_used?: boolean
          otp: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          otp?: string
        }
        Relationships: []
      }
      queries: {
        Row: {
          application_id: string
          attached_files: Json | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          sender_email: string | null
          sender_name: string
          sender_type: string
          updated_at: string
        }
        Insert: {
          application_id: string
          attached_files?: Json | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          sender_email?: string | null
          sender_name: string
          sender_type: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          attached_files?: Json | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          sender_email?: string | null
          sender_name?: string
          sender_type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      next_application_id: {
        Args: { bank: string }
        Returns: string
      }
      next_employee_id: {
        Args: Record<PropertyKey, never>
        Returns: string
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
