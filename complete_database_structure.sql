-- ================================================================
-- Complete Database Structure for EDC - Electronic Data Capture
-- Requirements: Dynamic forms, audit trails, projects, users, etc.
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- AUTHENTICATION & USER MANAGEMENT
-- ================================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'admin', 'super_admin')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  client_id uuid REFERENCES clients(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$;

-- ================================================================
-- ORGANIZATIONAL STRUCTURE
-- ================================================================

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  contact_email text,
  contact_phone text,
  address text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table (enhanced for dynamic project management)
CREATE TABLE IF NOT EXISTS projects_enhanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  client_id uuid REFERENCES clients(id),
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
  start_date date,
  end_date date,
  settings jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ================================================================
-- DYNAMIC FORM SYSTEM
-- ================================================================

-- Form templates registry
CREATE TABLE IF NOT EXISTS form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  project_id text,
  client_id uuid REFERENCES clients(id),
  version integer NOT NULL DEFAULT 1,
  json_schema jsonb NOT NULL,
  is_active boolean DEFAULT true,
  template_type text DEFAULT 'custom' CHECK (template_type IN ('system', 'custom', 'global')),
  field_order jsonb DEFAULT '[]',
  validation_rules jsonb DEFAULT '{}',
  ui_config jsonb DEFAULT '{}',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dynamic field definitions
CREATE TABLE IF NOT EXISTS field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES form_templates(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  field_label text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN (
    'text', 'textarea', 'number', 'email', 'tel', 'url', 'password', 'hidden',
    'date', 'time', 'datetime', 'select', 'radio', 'checkbox', 'yesno',
    'table', 'matrix', 'file', 'signature', 'rating', 'scale', 'range',
    'calculation', 'header'
  )),
  field_order integer NOT NULL DEFAULT 0,
  section_id text,
  is_required boolean DEFAULT false,
  default_value jsonb,
  options jsonb,
  validation jsonb DEFAULT '{}',
  ui_props jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(template_id, field_name)
);

-- ================================================================
-- VOLUNTEERS & STUDY MANAGEMENT
-- ================================================================

-- Volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id text UNIQUE NOT NULL,
  study_number text NOT NULL,
  screening_date date,
  demographics jsonb DEFAULT '{}',
  medical_history jsonb DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn', 'screened_out')),
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ================================================================
-- FORM DATA & SUBMISSIONS
-- ================================================================

-- Patient forms (main data storage)
CREATE TABLE IF NOT EXISTS patient_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id text NOT NULL,
  volunteer_id text NOT NULL,
  study_number text NOT NULL,
  template_name text NOT NULL,
  template_id uuid REFERENCES form_templates(id),
  period_number text,
  answers jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'validated', 'locked')),
  metadata jsonb DEFAULT '{}',
  submitted_by uuid REFERENCES profiles(id),
  submitted_at timestamptz,
  validated_by uuid REFERENCES profiles(id),
  validated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id, template_name, period_number)
);

-- Form submission history
CREATE TABLE IF NOT EXISTS form_submission_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES patient_forms(id) ON DELETE CASCADE,
  field_path text,
  old_value jsonb,
  new_value jsonb,
  change_reason text,
  change_type text DEFAULT 'update' CHECK (change_type IN ('create', 'update', 'delete', 'submit', 'validate')),
  changed_by uuid REFERENCES profiles(id),
  changed_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- ================================================================
-- AUDIT & ACTIVITY TRACKING
-- ================================================================

-- Activity logs (comprehensive audit trail)
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  details jsonb DEFAULT '{}',
  user_id uuid REFERENCES profiles(id),
  session_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Change logs for critical data
CREATE TABLE IF NOT EXISTS change_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  operation text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  changed_by uuid REFERENCES profiles(id),
  reason text,
  created_at timestamptz DEFAULT now()
);

-- ================================================================
-- REPORTING & ANALYTICS
-- ================================================================

-- Report definitions
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  report_type text NOT NULL CHECK (report_type IN ('form_completion', 'audit', 'analytics', 'custom')),
  query_definition jsonb NOT NULL,
  parameters jsonb DEFAULT '{}',
  access_roles text[] DEFAULT '{"admin", "super_admin"}',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Report executions log
CREATE TABLE IF NOT EXISTS report_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES reports(id),
  executed_by uuid REFERENCES profiles(id),
  parameters jsonb DEFAULT '{}',
  execution_time interval,
  status text DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout')),
  error_message text,
  result_count integer,
  executed_at timestamptz DEFAULT now()
);

-- ================================================================
-- SYSTEM CONFIGURATION
-- ================================================================

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  category text DEFAULT 'general',
  is_public boolean DEFAULT false,
  updated_by uuid REFERENCES profiles(id),
  updated_at timestamptz DEFAULT now()
);

-- ================================================================
-- VIEWS FOR BETTER DATA ACCESS
-- ================================================================

-- Comprehensive audit logs view
CREATE OR REPLACE VIEW audit_logs_view AS
SELECT 
  al.id,
  al.action,
  al.resource_type,
  al.resource_id,
  al.details,
  al.created_at,
  p.email as user_email,
  CONCAT(p.first_name, ' ', p.last_name) as user_name,
  p.role as user_role,
  al.user_id,
  al.ip_address,
  al.user_agent
FROM activity_logs al
LEFT JOIN profiles p ON al.user_id = p.id
ORDER BY al.created_at DESC;

-- Form completion status view
CREATE OR REPLACE VIEW form_completion_status AS
SELECT 
  pf.case_id,
  pf.volunteer_id,
  pf.study_number,
  pf.template_name,
  pf.status,
  pf.submitted_at,
  pf.created_at,
  p.email as submitted_by_email,
  CONCAT(p.first_name, ' ', p.last_name) as submitted_by_name
FROM patient_forms pf
LEFT JOIN profiles p ON pf.submitted_by = p.id;

-- Project progress view
CREATE OR REPLACE VIEW project_progress AS
SELECT 
  pe.id as project_id,
  pe.name as project_name,
  pe.status as project_status,
  COUNT(pf.id) as total_forms,
  COUNT(CASE WHEN pf.status = 'submitted' THEN 1 END) as submitted_forms,
  COUNT(CASE WHEN pf.status = 'draft' THEN 1 END) as draft_forms,
  COUNT(DISTINCT pf.volunteer_id) as total_volunteers
FROM projects_enhanced pe
LEFT JOIN form_templates ft ON ft.project_id = pe.id::text
LEFT JOIN patient_forms pf ON pf.template_id = ft.id
GROUP BY pe.id, pe.name, pe.status;

-- ================================================================
-- SECURITY POLICIES (Row Level Security)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submission_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be expanded based on requirements)

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (id = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "Admins can manage profiles" ON profiles
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- Client policies
CREATE POLICY "Users can view clients based on role" ON clients
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('admin', 'super_admin') OR 
    id = (SELECT client_id FROM profiles WHERE id = auth.uid())
  );

-- Form templates policies
CREATE POLICY "Anyone can view active templates" ON form_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage templates" ON form_templates
  FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- Patient forms policies
CREATE POLICY "Users can view forms they created or admins can view all" ON patient_forms
  FOR SELECT USING (
    submitted_by = auth.uid() OR 
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

CREATE POLICY "Users can create and update their own forms" ON patient_forms
  FOR INSERT WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Users can update their own draft forms" ON patient_forms
  FOR UPDATE USING (
    (submitted_by = auth.uid() AND status = 'draft') OR 
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- Activity logs policies
CREATE POLICY "Users can view their own activities" ON activity_logs
  FOR SELECT USING (
    user_id = auth.uid() OR 
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- ================================================================
-- HELPER FUNCTIONS
-- ================================================================

-- Function to log activities
CREATE OR REPLACE FUNCTION log_activity(
  p_action text,
  p_resource_type text,
  p_resource_id text,
  p_details jsonb DEFAULT '{}',
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO activity_logs (
    action, resource_type, resource_id, details, user_id
  ) VALUES (
    p_action, p_resource_type, p_resource_id, p_details, p_user_id
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to submit form with history tracking
CREATE OR REPLACE FUNCTION submit_form_with_history(
  p_case_id text,
  p_template_name text,
  p_answers jsonb,
  p_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_form_id uuid;
  v_old_answers jsonb;
BEGIN
  -- Get existing form data
  SELECT id, answers INTO v_form_id, v_old_answers
  FROM patient_forms
  WHERE case_id = p_case_id AND template_name = p_template_name;
  
  IF v_form_id IS NOT NULL THEN
    -- Update existing form
    UPDATE patient_forms 
    SET 
      answers = p_answers,
      status = 'submitted',
      submitted_by = auth.uid(),
      submitted_at = now(),
      updated_at = now()
    WHERE id = v_form_id;
    
    -- Log the change
    INSERT INTO form_submission_history (
      form_id, old_value, new_value, change_reason, 
      change_type, changed_by
    ) VALUES (
      v_form_id, v_old_answers, p_answers, p_reason, 
      'submit', auth.uid()
    );
  ELSE
    -- Create new form
    INSERT INTO patient_forms (
      case_id, template_name, answers, status, 
      submitted_by, submitted_at
    ) VALUES (
      p_case_id, p_template_name, p_answers, 'submitted',
      auth.uid(), now()
    ) RETURNING id INTO v_form_id;
    
    -- Log the creation
    INSERT INTO form_submission_history (
      form_id, new_value, change_reason, change_type, changed_by
    ) VALUES (
      v_form_id, p_answers, p_reason, 'create', auth.uid()
    );
  END IF;
  
  -- Log activity
  PERFORM log_activity(
    'submit_form', 
    'patient_form', 
    v_form_id::text,
    jsonb_build_object('case_id', p_case_id, 'template', p_template_name)
  );
  
  RETURN v_form_id;
END;
$$;

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_patient_forms_case_id ON patient_forms(case_id);
CREATE INDEX IF NOT EXISTS idx_patient_forms_volunteer_id ON patient_forms(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_patient_forms_status ON patient_forms(status);
CREATE INDEX IF NOT EXISTS idx_patient_forms_submitted_at ON patient_forms(submitted_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_form_templates_project_id ON form_templates(project_id);
CREATE INDEX IF NOT EXISTS idx_form_templates_active ON form_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_client_id ON profiles(client_id);

-- ================================================================
-- TRIGGERS FOR AUDIT TRAIL
-- ================================================================

-- Trigger function for automatic change logging
CREATE OR REPLACE FUNCTION log_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO change_logs (table_name, record_id, operation, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO change_logs (table_name, record_id, operation, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO change_logs (table_name, record_id, operation, old_values, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
END;
$$;

-- Apply triggers to critical tables
CREATE TRIGGER trigger_log_patient_forms_changes
  AFTER INSERT OR UPDATE OR DELETE ON patient_forms
  FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER trigger_log_form_templates_changes
  AFTER INSERT OR UPDATE OR DELETE ON form_templates
  FOR EACH ROW EXECUTE FUNCTION log_changes();

-- ================================================================
-- SAMPLE DATA FOR TESTING
-- ================================================================

-- Insert default system settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
  ('app_name', '"EDC - Electronic Data Capture"', 'Application name', 'general', true),
  ('app_version', '"1.0.0"', 'Application version', 'general', true),
  ('max_file_size', '10485760', 'Maximum file upload size in bytes', 'files', false),
  ('session_timeout', '3600', 'Session timeout in seconds', 'security', false),
  ('enable_audit_logging', 'true', 'Enable comprehensive audit logging', 'security', false)
ON CONFLICT (key) DO NOTHING;

-- ================================================================
-- NOTES
-- ================================================================

/*
This complete database structure provides:

1. Dynamic Forms: Comprehensive form template system with field definitions
2. Audit Trails: Complete audit logging with activity logs and change logs
3. Projects: Enhanced project management with client relationships
4. Users: Role-based user management with proper security
5. Volunteers: Study participant management
6. Form Submissions: Complete form data capture and history
7. Reports: Reporting framework for analytics
8. Security: Row Level Security policies for data protection
9. Performance: Indexes for common query patterns
10. Automation: Triggers for automatic audit trail generation

Key Features:
- Supports dynamic form creation with any field types
- Complete audit trail for all changes
- Role-based access control (employee, admin, super_admin)
- Project and client management
- Form versioning and validation
- Comprehensive reporting capabilities
- Data integrity and security
*/