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
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string | null
          id: number
          new_values: Json | null
          old_values: Json | null
          reason: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by?: string | null
          id?: never
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: never
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      backup_logs: {
        Row: {
          backup_type: string
          completed_at: string | null
          error_message: string | null
          file_path: string | null
          file_size: number | null
          id: string
          started_at: string | null
          status: string
          triggered_by: string | null
        }
        Insert: {
          backup_type: string
          completed_at?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          started_at?: string | null
          status: string
          triggered_by?: string | null
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          started_at?: string | null
          status?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      client_projects: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          project_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          project_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          contact_email: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          contact_email: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          contact_email?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_form_submissions: {
        Row: {
          employee_id: string
          id: string
          project_id: string
          submission_data: Json
          submitted_at: string | null
          template_id: string
        }
        Insert: {
          employee_id: string
          id?: string
          project_id: string
          submission_data: Json
          submitted_at?: string | null
          template_id: string
        }
        Update: {
          employee_id?: string
          id?: string
          project_id?: string
          submission_data?: Json
          submitted_at?: string | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_form_submissions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_change_reasons: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          form_entry_id: string | null
          id: number
          reason: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          form_entry_id?: string | null
          id?: never
          reason: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          form_entry_id?: string | null
          id?: never
          reason?: string
        }
        Relationships: []
      }
      form_field_configs: {
        Row: {
          created_at: string | null
          field_id: string
          field_label: string
          field_name: string
          field_type: string
          id: string
          options: Json | null
          placeholder: string | null
          required: boolean | null
          section_id: string
          sort_order: number | null
          table_config: Json | null
          template_id: string | null
          updated_at: string | null
          validation_rules: Json | null
          width_class: string | null
        }
        Insert: {
          created_at?: string | null
          field_id: string
          field_label: string
          field_name: string
          field_type: string
          id?: string
          options?: Json | null
          placeholder?: string | null
          required?: boolean | null
          section_id: string
          sort_order?: number | null
          table_config?: Json | null
          template_id?: string | null
          updated_at?: string | null
          validation_rules?: Json | null
          width_class?: string | null
        }
        Update: {
          created_at?: string | null
          field_id?: string
          field_label?: string
          field_name?: string
          field_type?: string
          id?: string
          options?: Json | null
          placeholder?: string | null
          required?: boolean | null
          section_id?: string
          sort_order?: number | null
          table_config?: Json | null
          template_id?: string | null
          updated_at?: string | null
          validation_rules?: Json | null
          width_class?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_field_configs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      form_fields: {
        Row: {
          created_at: string
          default_value: string | null
          field_key: string
          field_label: string
          field_name: string
          field_type: string
          id: string
          options: Json | null
          required: boolean | null
          sort_order: number | null
          template_id: string | null
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          default_value?: string | null
          field_key: string
          field_label: string
          field_name: string
          field_type: string
          id?: string
          options?: Json | null
          required?: boolean | null
          sort_order?: number | null
          template_id?: string | null
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          default_value?: string | null
          field_key?: string
          field_label?: string
          field_name?: string
          field_type?: string
          id?: string
          options?: Json | null
          required?: boolean | null
          sort_order?: number | null
          template_id?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_instances: {
        Row: {
          created_at: string | null
          form_data: Json
          id: string
          instance_name: string
          status: string | null
          submitted_by: string | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          form_data?: Json
          id?: string
          instance_name: string
          status?: string | null
          submitted_by?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          form_data?: Json
          id?: string
          instance_name?: string
          status?: string | null
          submitted_by?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      form_template_calculations: {
        Row: {
          created_at: string | null
          field_id: string | null
          formula: string
          id: string
          template_id: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          field_id?: string | null
          formula: string
          id?: string
          template_id?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          field_id?: string | null
          formula?: string
          id?: string
          template_id?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_template_calculations_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "form_template_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_template_calculations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_template_fields: {
        Row: {
          created_at: string | null
          default_value: string | null
          field_key: string
          field_type: string
          help_text: string | null
          id: string
          label: string
          options: Json | null
          placeholder: string | null
          required: boolean | null
          section_id: string | null
          sort_order: number | null
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          default_value?: string | null
          field_key: string
          field_type: string
          help_text?: string | null
          id?: string
          label: string
          options?: Json | null
          placeholder?: string | null
          required?: boolean | null
          section_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          default_value?: string | null
          field_key?: string
          field_type?: string
          help_text?: string | null
          id?: string
          label?: string
          options?: Json | null
          placeholder?: string | null
          required?: boolean | null
          section_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_template_fields_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "form_template_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      form_template_logic: {
        Row: {
          condition_field: string | null
          condition_type: string
          created_at: string | null
          field_id: string | null
          id: string
          operator: string
          template_id: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          condition_field?: string | null
          condition_type: string
          created_at?: string | null
          field_id?: string | null
          id?: string
          operator: string
          template_id?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          condition_field?: string | null
          condition_type?: string
          created_at?: string | null
          field_id?: string | null
          id?: string
          operator?: string
          template_id?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_template_logic_condition_field_fkey"
            columns: ["condition_field"]
            isOneToOne: false
            referencedRelation: "form_template_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_template_logic_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "form_template_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_template_logic_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_template_sections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          sort_order: number | null
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          sort_order?: number | null
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          sort_order?: number | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_template_sections_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_template_versions: {
        Row: {
          changes: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          template_id: string | null
          version_number: number
        }
        Insert: {
          changes?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          template_id?: string | null
          version_number: number
        }
        Update: {
          changes?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          template_id?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          client_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          json_schema: Json
          name: string
          project_id: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          json_schema: Json
          name: string
          project_id: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          json_schema?: Json
          name?: string
          project_id?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "form_templates_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates_enhanced: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          project_id: string
          sections: Json
          updated_at: string | null
          version: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          project_id: string
          sections?: Json
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          project_id?: string
          sections?: Json
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "form_templates_enhanced_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string | null
          type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject?: string | null
          type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string | null
          type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          settings: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      patient_forms: {
        Row: {
          answers: Json
          case_id: string
          created_at: string | null
          id: string
          study_number: string
          submitted_by: string | null
          template_name: string
          updated_at: string | null
          volunteer_id: string
        }
        Insert: {
          answers: Json
          case_id: string
          created_at?: string | null
          id?: string
          study_number: string
          submitted_by?: string | null
          template_name?: string
          updated_at?: string | null
          volunteer_id: string
        }
        Update: {
          answers?: Json
          case_id?: string
          created_at?: string | null
          id?: string
          study_number?: string
          submitted_by?: string | null
          template_name?: string
          updated_at?: string | null
          volunteer_id?: string
        }
        Relationships: []
      }
      print_settings: {
        Row: {
          created_at: string | null
          font_size: string | null
          id: string
          line_height: string | null
          margins: Json | null
          page_size: string | null
          template_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          font_size?: string | null
          id?: string
          line_height?: string | null
          margins?: Json | null
          page_size?: string | null
          template_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          font_size?: string | null
          id?: string
          line_height?: string | null
          margins?: Json | null
          page_size?: string | null
          template_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          created_by: string | null
          department: string | null
          email: string | null
          first_name: string | null
          hire_date: string | null
          id: string
          last_login: string | null
          last_name: string | null
          phone: string | null
          position: string | null
          role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          email?: string | null
          first_name?: string | null
          hire_date?: string | null
          id: string
          last_login?: string | null
          last_name?: string | null
          phone?: string | null
          position?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          email?: string | null
          first_name?: string | null
          hire_date?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          phone?: string | null
          position?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_menus: {
        Row: {
          created_at: string | null
          id: string
          menu_structure: Json
          project_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_structure: Json
          project_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_structure?: Json
          project_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          organization_id: string | null
          settings: Json | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          organization_id?: string | null
          settings?: Json | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          settings?: Json | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_enhanced: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          settings: Json | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          settings?: Json | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          settings?: Json | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_enhanced_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_organizations: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_table_row: {
        Args: {
          p_form_id: string
          p_field_path: string
          p_row_data: Json
          p_reason: string
          p_user_id: string
        }
        Returns: Json
      }
      admin_create_client: {
        Args: {
          client_name: string
          client_description: string
          client_email: string
          client_status: string
          user_id: string
        }
        Returns: Json
      }
      admin_delete_client: {
        Args: { client_id: string }
        Returns: boolean
      }
      admin_update_client: {
        Args: {
          client_id: string
          client_name: string
          client_description: string
          client_email: string
          client_status: string
        }
        Returns: Json
      }
      create_form_template_privileged: {
        Args:
          | {
              p_name: string
              p_description: string
              p_project_id: string
              p_client_id: string
              p_version: number
              p_json_schema: Json
              p_is_active: boolean
            }
          | { p_name: string; p_project_id: string; p_json_schema: Json }
        Returns: {
          client_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          json_schema: Json
          name: string
          project_id: string
          updated_at: string | null
          version: number | null
        }
      }
      create_form_template_privileged_full: {
        Args: {
          p_name: string
          p_project_id: string
          p_description: string
          p_client_id: string
          p_version: number
          p_json_schema: Json
          p_is_active: boolean
        }
        Returns: {
          client_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          json_schema: Json
          name: string
          project_id: string
          updated_at: string | null
          version: number | null
        }
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      save_form_template_complete: {
        Args: { p_template_data: Json }
        Returns: string
      }
      update_table_cell: {
        Args: {
          p_form_id: string
          p_field_path: string
          p_row_id: string
          p_column_id: string
          p_value: Json
          p_reason: string
          p_user_id: string
        }
        Returns: Json
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
