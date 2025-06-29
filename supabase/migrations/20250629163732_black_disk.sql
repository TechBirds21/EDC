/*
  # Form Database Schema

  1. New Tables
    - `form_templates_registry` - Registry of all form templates in the system
    - `form_submissions` - Centralized table for all form submissions
    - `form_submission_history` - History of changes to form submissions
    - `form_field_definitions` - Definitions of form fields for each template
    - `form_validation_rules` - Validation rules for form fields

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create form_templates_registry table
CREATE TABLE IF NOT EXISTS form_templates_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  template_code text NOT NULL UNIQUE,
  category text NOT NULL,
  description text,
  version integer NOT NULL DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES form_templates_registry(id),
  template_name text NOT NULL,
  template_version integer NOT NULL,
  volunteer_id text NOT NULL,
  study_number text NOT NULL,
  case_id text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  submitted_by uuid REFERENCES auth.users(id),
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id, template_name)
);

-- Create form_submission_history table
CREATE TABLE IF NOT EXISTS form_submission_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES form_submissions(id) ON DELETE CASCADE,
  field_path text,
  old_value jsonb,
  new_value jsonb,
  change_reason text,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now()
);

-- Create form_field_definitions table
CREATE TABLE IF NOT EXISTS form_field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES form_templates_registry(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  field_label text NOT NULL,
  field_type text NOT NULL,
  field_order integer NOT NULL DEFAULT 0,
  is_required boolean DEFAULT false,
  default_value jsonb,
  options jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(template_id, field_name)
);

-- Create form_validation_rules table
CREATE TABLE IF NOT EXISTS form_validation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES form_field_definitions(id) ON DELETE CASCADE,
  rule_type text NOT NULL,
  rule_params jsonb NOT NULL,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE form_templates_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submission_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_validation_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- form_templates_registry policies
CREATE POLICY "Anyone can view form templates" 
  ON form_templates_registry FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify form templates" 
  ON form_templates_registry FOR ALL 
  USING (get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- form_submissions policies
CREATE POLICY "Users can view their own submissions" 
  ON form_submissions FOR SELECT 
  USING (submitted_by = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "Users can create their own submissions" 
  ON form_submissions FOR INSERT 
  WITH CHECK (submitted_by = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "Users can update their own submissions" 
  ON form_submissions FOR UPDATE 
  USING (submitted_by = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- form_submission_history policies
CREATE POLICY "Users can view history of their submissions" 
  ON form_submission_history FOR SELECT 
  USING (changed_by = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "Users can create history entries" 
  ON form_submission_history FOR INSERT 
  WITH CHECK (changed_by = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- form_field_definitions policies
CREATE POLICY "Anyone can view field definitions" 
  ON form_field_definitions FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify field definitions" 
  ON form_field_definitions FOR ALL 
  USING (get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- form_validation_rules policies
CREATE POLICY "Anyone can view validation rules" 
  ON form_validation_rules FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify validation rules" 
  ON form_validation_rules FOR ALL 
  USING (get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- Insert form template registry entries for all forms
INSERT INTO form_templates_registry (template_name, template_code, category, description, version, is_active)
VALUES
  -- Volunteer Medical Screening
  ('Demographic Details', 'demographic_details', 'Screening', 'Basic demographic information about the volunteer', 1, true),
  ('Medical History', 'medical_history', 'Screening', 'Patient medical history information', 1, true),
  ('Medical Examination', 'medical_examination', 'Screening', 'Medical examination results', 1, true),
  ('Systemic Examination', 'systemic_examination', 'Screening', 'Systemic examination results', 1, true),
  ('ECG Evaluation', 'ecg_evaluation', 'Screening', 'ECG evaluation results', 1, true),
  ('ECG', 'ecg', 'Screening', 'ECG test results', 1, true),
  ('X-Ray Evaluation', 'xray_evaluation', 'Screening', 'X-ray evaluation results', 1, true),
  ('COVID-19 Screening', 'covid_screening', 'Screening', 'COVID-19 screening results', 1, true),
  
  -- Pregnancy Tests
  ('Screening Pregnancy Test Evaluation', 'screening_pregnancy_test', 'Pregnancy Tests', 'Screening pregnancy test evaluation', 1, true),
  ('Urine Pregnancy Test', 'urine_pregnancy_test', 'Pregnancy Tests', 'Urine pregnancy test results', 1, true),
  ('β-HCG Test', 'bhcg_test', 'Pregnancy Tests', 'Beta HCG test results', 1, true),
  
  -- Laboratory Reports
  ('Clinical Biochemistry 1', 'clinical_biochemistry_1', 'Laboratory Reports', 'Clinical biochemistry test results part 1', 1, true),
  ('Clinical Biochemistry 2', 'clinical_biochemistry_2', 'Laboratory Reports', 'Clinical biochemistry test results part 2', 1, true),
  ('Clinical Pathology', 'clinical_pathology', 'Laboratory Reports', 'Clinical pathology test results', 1, true),
  ('Hematology', 'hematology', 'Laboratory Reports', 'Hematology test results', 1, true),
  ('Immunology/Serology', 'immunology_serology', 'Laboratory Reports', 'Immunology and serology test results', 1, true),
  
  -- Study Period
  ('Eligibility Tests for Check-In', 'eligibility_tests', 'Study Period', 'Eligibility tests for check-in', 1, true),
  ('Depression Scale', 'depression_scale', 'Study Period', 'Depression scale assessment', 1, true),
  ('Inclusion and Exclusion Criteria', 'inclusion_exclusion_criteria', 'Study Period', 'Inclusion and exclusion criteria assessment', 1, true),
  ('Study Case Report Form', 'study_case_report', 'Study Period', 'Study case report form', 1, true),
  ('Subject Check-In Form', 'subject_check_in', 'Study Period', 'Subject check-in form', 1, true),
  ('Meal Consumption Form', 'meal_consumption', 'Study Period', 'Meal consumption form', 1, true),
  ('Subject Vital Signs Form', 'subject_vital_signs', 'Study Period', 'Subject vital signs form', 1, true),
  ('Blood Sample Collection Form', 'blood_sample_collection', 'Study Period', 'Blood sample collection form', 1, true),
  ('Pre-dose and Post-dose Restrictions', 'pre_post_dose_restrictions', 'Study Period', 'Pre-dose and post-dose restrictions', 1, true),
  ('Drug Administration Form', 'drug_administration', 'Study Period', 'Drug administration form', 1, true),
  ('Subject Check-Out Form', 'subject_check_out', 'Study Period', 'Subject check-out form', 1, true),
  ('Any Other Information', 'any_other_information', 'Study Period', 'Any other information', 1, true),
  
  -- Post Study
  ('Safety Evaluation', 'safety_evaluation', 'Post Study', 'Safety evaluation', 1, true),
  ('Post Study Depression Scale', 'post_study_depression_scale', 'Post Study', 'Post study depression scale assessment', 1, true),
  ('Post Study COVID-19 Screening', 'post_study_covid_screening', 'Post Study', 'Post study COVID-19 screening', 1, true),
  ('Post Study Clinical Biochemistry', 'post_study_clinical_biochemistry', 'Post Study', 'Post study clinical biochemistry', 1, true),
  ('Post Study Hematology', 'post_study_hematology', 'Post Study', 'Post study hematology', 1, true),
  ('Adverse Event Recording', 'adverse_event', 'Post Study', 'Adverse event recording', 1, true),
  ('Concomitant Medication', 'concomitant_medication', 'Post Study', 'Concomitant medication', 1, true),
  ('Subject Withdrawal Form', 'subject_withdrawal', 'Post Study', 'Subject withdrawal form', 1, true),
  ('Subject Dropout Form', 'subject_dropout', 'Post Study', 'Subject dropout form', 1, true),
  ('Repeat Assessment Form', 'repeat_assessment', 'Post Study', 'Repeat assessment form', 1, true),
  ('Telephone Notes', 'telephone_notes', 'Post Study', 'Telephone notes', 1, true)
ON CONFLICT (template_code) DO NOTHING;

-- Create function to get form templates by category
CREATE OR REPLACE FUNCTION get_form_templates_by_category(category_name text)
RETURNS SETOF form_templates_registry
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM form_templates_registry 
  WHERE category = category_name AND is_active = true
  ORDER BY template_name;
$$;

-- Create function to get form submissions by volunteer
CREATE OR REPLACE FUNCTION get_form_submissions_by_volunteer(volunteer_id_param text)
RETURNS SETOF form_submissions
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM form_submissions 
  WHERE volunteer_id = volunteer_id_param
  ORDER BY submitted_at DESC;
$$;

-- Create function to get form submissions by case
CREATE OR REPLACE FUNCTION get_form_submissions_by_case(case_id_param text)
RETURNS SETOF form_submissions
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM form_submissions 
  WHERE case_id = case_id_param
  ORDER BY submitted_at DESC;
$$;

-- Create function to submit form data
CREATE OR REPLACE FUNCTION submit_form_data(
  p_template_name text,
  p_volunteer_id text,
  p_study_number text,
  p_case_id text,
  p_data jsonb,
  p_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template_id uuid;
  v_template_version integer;
  v_submission_id uuid;
  v_old_data jsonb;
BEGIN
  -- Get template ID and version
  SELECT id, version INTO v_template_id, v_template_version
  FROM form_templates_registry
  WHERE template_name = p_template_name
  LIMIT 1;
  
  -- Check if submission exists
  SELECT id, data INTO v_submission_id, v_old_data
  FROM form_submissions
  WHERE case_id = p_case_id AND template_name = p_template_name
  LIMIT 1;
  
  IF v_submission_id IS NULL THEN
    -- Insert new submission
    INSERT INTO form_submissions (
      template_id, template_name, template_version, 
      volunteer_id, study_number, case_id, 
      status, data, submitted_by
    )
    VALUES (
      v_template_id, p_template_name, v_template_version,
      p_volunteer_id, p_study_number, p_case_id,
      'submitted', p_data, auth.uid()
    )
    RETURNING id INTO v_submission_id;
  ELSE
    -- Update existing submission
    UPDATE form_submissions
    SET 
      data = p_data,
      status = 'submitted',
      updated_at = now()
    WHERE id = v_submission_id;
    
    -- Record history if reason provided
    IF p_reason IS NOT NULL THEN
      INSERT INTO form_submission_history (
        submission_id, old_value, new_value, 
        change_reason, changed_by
      )
      VALUES (
        v_submission_id, v_old_data, p_data,
        p_reason, auth.uid()
      );
    END IF;
  END IF;
  
  RETURN v_submission_id;
END;
$$;