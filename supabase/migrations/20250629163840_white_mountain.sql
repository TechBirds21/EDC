/*
  # Form Data Integration

  1. New Tables
    - `form_data_registry` - Registry of all form data in the system
    - `form_data_history` - History of changes to form data

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create form_data_registry table
CREATE TABLE IF NOT EXISTS form_data_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  volunteer_id text NOT NULL,
  study_number text NOT NULL,
  case_id text NOT NULL,
  period_number text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id, template_name, period_number)
);

-- Create form_data_history table
CREATE TABLE IF NOT EXISTS form_data_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_data_id uuid REFERENCES form_data_registry(id) ON DELETE CASCADE,
  field_path text,
  old_value jsonb,
  new_value jsonb,
  change_reason text,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE form_data_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_data_history ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- form_data_registry policies
CREATE POLICY "Users can view their own form data" 
  ON form_data_registry FOR SELECT 
  USING (created_by = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "Users can create their own form data" 
  ON form_data_registry FOR INSERT 
  WITH CHECK (created_by = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "Users can update their own form data" 
  ON form_data_registry FOR UPDATE 
  USING (created_by = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- form_data_history policies
CREATE POLICY "Users can view history of their form data" 
  ON form_data_history FOR SELECT 
  USING (changed_by = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "Users can create history entries" 
  ON form_data_history FOR INSERT 
  WITH CHECK (changed_by = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- Create function to submit form data with history
CREATE OR REPLACE FUNCTION submit_form_data_with_history(
  p_template_name text,
  p_volunteer_id text,
  p_study_number text,
  p_case_id text,
  p_period_number text,
  p_data jsonb,
  p_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_form_data_id uuid;
  v_old_data jsonb;
BEGIN
  -- Check if form data exists
  SELECT id, data INTO v_form_data_id, v_old_data
  FROM form_data_registry
  WHERE case_id = p_case_id 
    AND template_name = p_template_name
    AND (period_number = p_period_number OR (period_number IS NULL AND p_period_number IS NULL))
  LIMIT 1;
  
  IF v_form_data_id IS NULL THEN
    -- Insert new form data
    INSERT INTO form_data_registry (
      template_name, volunteer_id, study_number, 
      case_id, period_number, data, 
      status, created_by
    )
    VALUES (
      p_template_name, p_volunteer_id, p_study_number,
      p_case_id, p_period_number, p_data,
      'submitted', auth.uid()
    )
    RETURNING id INTO v_form_data_id;
  ELSE
    -- Update existing form data
    UPDATE form_data_registry
    SET 
      data = p_data,
      status = 'submitted',
      updated_at = now()
    WHERE id = v_form_data_id;
    
    -- Record history if reason provided
    IF p_reason IS NOT NULL THEN
      INSERT INTO form_data_history (
        form_data_id, old_value, new_value, 
        change_reason, changed_by
      )
      VALUES (
        v_form_data_id, v_old_data, p_data,
        p_reason, auth.uid()
      );
    END IF;
  END IF;
  
  RETURN v_form_data_id;
END;
$$;

-- Create function to get form data by volunteer
CREATE OR REPLACE FUNCTION get_form_data_by_volunteer(volunteer_id_param text)
RETURNS SETOF form_data_registry
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM form_data_registry 
  WHERE volunteer_id = volunteer_id_param
  ORDER BY created_at DESC;
$$;

-- Create function to get form data by case
CREATE OR REPLACE FUNCTION get_form_data_by_case(case_id_param text)
RETURNS SETOF form_data_registry
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM form_data_registry 
  WHERE case_id = case_id_param
  ORDER BY created_at DESC;
$$;

-- Create function to get form data by template
CREATE OR REPLACE FUNCTION get_form_data_by_template(template_name_param text)
RETURNS SETOF form_data_registry
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM form_data_registry 
  WHERE template_name = template_name_param
  ORDER BY created_at DESC;
$$;

-- Create function to get form data history
CREATE OR REPLACE FUNCTION get_form_data_history(form_data_id_param uuid)
RETURNS SETOF form_data_history
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM form_data_history 
  WHERE form_data_id = form_data_id_param
  ORDER BY changed_at DESC;
$$;

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_form_data_registry_updated_at
BEFORE UPDATE ON form_data_registry
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();