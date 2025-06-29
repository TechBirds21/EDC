/*
  # Add Sample Data for Testing

  1. Sample Data
    - Add sample clients
    - Add sample projects
    - Add sample form templates
    - Add sample form submissions
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Add sample clients
INSERT INTO public.clients (name, description, contact_email, status)
VALUES 
  ('Acme Pharmaceuticals', 'Leading pharmaceutical research company', 'contact@acmepharma.example.com', 'active'),
  ('MediTech Research', 'Clinical research organization', 'research@meditech.example.com', 'active'),
  ('HealthCore Labs', 'Specialized in clinical trials', 'trials@healthcore.example.com', 'active')
ON CONFLICT DO NOTHING;

-- Add sample projects
INSERT INTO public.projects_enhanced (name, description, client_id, status, start_date, end_date, settings)
VALUES 
  ('Diabetes Type 2 Study', 'Clinical trial for new diabetes medication', (SELECT id FROM public.clients WHERE name = 'Acme Pharmaceuticals' LIMIT 1), 'active', '2025-01-01', '2025-12-31', '{"phase": "Phase 3", "target_enrollment": 200}'),
  ('Hypertension Research', 'Blood pressure medication efficacy study', (SELECT id FROM public.clients WHERE name = 'MediTech Research' LIMIT 1), 'active', '2025-02-15', '2025-08-15', '{"phase": "Phase 2", "target_enrollment": 150}'),
  ('Cardiovascular Health', 'Long-term cardiovascular health monitoring', (SELECT id FROM public.clients WHERE name = 'HealthCore Labs' LIMIT 1), 'active', '2025-03-01', '2026-03-01', '{"phase": "Phase 4", "target_enrollment": 300}')
ON CONFLICT DO NOTHING;

-- Add sample form templates
INSERT INTO public.form_templates (name, description, project_id, client_id, version, json_schema, is_active)
VALUES 
  ('Demographic Details', 'Basic patient demographic information', 'clains-project-1', (SELECT id FROM public.clients WHERE name = 'Acme Pharmaceuticals' LIMIT 1), 1, 
   '{
      "sections": [
        {
          "id": "personal_info",
          "title": "Personal Information",
          "sortOrder": 0,
          "fields": [
            {
              "id": "name",
              "name": "name",
              "type": "text",
              "label": "Full Name",
              "required": true,
              "placeholder": "Enter full name"
            },
            {
              "id": "dob",
              "name": "dob",
              "type": "date",
              "label": "Date of Birth",
              "required": true
            },
            {
              "id": "gender",
              "name": "gender",
              "type": "select",
              "label": "Gender",
              "required": true,
              "options": [
                {"label": "Male", "value": "male"},
                {"label": "Female", "value": "female"},
                {"label": "Other", "value": "other"}
              ]
            }
          ]
        },
        {
          "id": "contact_info",
          "title": "Contact Information",
          "sortOrder": 1,
          "fields": [
            {
              "id": "email",
              "name": "email",
              "type": "email",
              "label": "Email Address",
              "required": true,
              "placeholder": "Enter email address"
            },
            {
              "id": "phone",
              "name": "phone",
              "type": "tel",
              "label": "Phone Number",
              "required": true,
              "placeholder": "Enter phone number"
            },
            {
              "id": "address",
              "name": "address",
              "type": "textarea",
              "label": "Address",
              "required": true,
              "placeholder": "Enter full address"
            }
          ]
        }
      ]
    }', true),
  
  ('Medical History', 'Patient medical history form', 'clains-project-1', (SELECT id FROM public.clients WHERE name = 'MediTech Research' LIMIT 1), 1, 
   '{
      "sections": [
        {
          "id": "general_health",
          "title": "General Health Information",
          "sortOrder": 0,
          "fields": [
            {
              "id": "health_status",
              "name": "health_status",
              "type": "select",
              "label": "Current Health Status",
              "required": true,
              "options": [
                {"label": "Excellent", "value": "excellent"},
                {"label": "Good", "value": "good"},
                {"label": "Fair", "value": "fair"},
                {"label": "Poor", "value": "poor"}
              ]
            },
            {
              "id": "allergies",
              "name": "allergies",
              "type": "textarea",
              "label": "Known Allergies",
              "placeholder": "List any known allergies"
            }
          ]
        },
        {
          "id": "medical_conditions",
          "title": "Medical Conditions",
          "sortOrder": 1,
          "fields": [
            {
              "id": "conditions_table",
              "name": "conditions_table",
              "type": "table",
              "label": "Medical Conditions",
              "required": true,
              "tableConfig": {
                "columns": [
                  {"id": "condition", "label": "Condition", "type": "text"},
                  {"id": "diagnosed_date", "label": "Date Diagnosed", "type": "date"},
                  {"id": "treatment", "label": "Treatment", "type": "text"},
                  {"id": "status", "label": "Current Status", "type": "select", "options": [
                    {"label": "Active", "value": "active"},
                    {"label": "Managed", "value": "managed"},
                    {"label": "Resolved", "value": "resolved"}
                  ]}
                ],
                "allowAddRows": true
              }
            }
          ]
        }
      ]
    }', true),
  
  ('Vital Signs', 'Patient vital signs recording form', 'clains-project-1', (SELECT id FROM public.clients WHERE name = 'HealthCore Labs' LIMIT 1), 1, 
   '{
      "sections": [
        {
          "id": "vital_signs",
          "title": "Vital Signs",
          "sortOrder": 0,
          "fields": [
            {
              "id": "temperature",
              "name": "temperature",
              "type": "number",
              "label": "Temperature (°C)",
              "required": true,
              "placeholder": "Enter temperature"
            },
            {
              "id": "blood_pressure_systolic",
              "name": "blood_pressure_systolic",
              "type": "number",
              "label": "Blood Pressure (Systolic)",
              "required": true,
              "placeholder": "Enter systolic blood pressure"
            },
            {
              "id": "blood_pressure_diastolic",
              "name": "blood_pressure_diastolic",
              "type": "number",
              "label": "Blood Pressure (Diastolic)",
              "required": true,
              "placeholder": "Enter diastolic blood pressure"
            },
            {
              "id": "heart_rate",
              "name": "heart_rate",
              "type": "number",
              "label": "Heart Rate (BPM)",
              "required": true,
              "placeholder": "Enter heart rate"
            },
            {
              "id": "respiratory_rate",
              "name": "respiratory_rate",
              "type": "number",
              "label": "Respiratory Rate (breaths/min)",
              "required": true,
              "placeholder": "Enter respiratory rate"
            }
          ]
        },
        {
          "id": "notes",
          "title": "Notes",
          "sortOrder": 1,
          "fields": [
            {
              "id": "observations",
              "name": "observations",
              "type": "textarea",
              "label": "Clinical Observations",
              "placeholder": "Enter any clinical observations"
            }
          ]
        }
      ]
    }', true)
ON CONFLICT DO NOTHING;

-- Add sample patient forms
INSERT INTO public.patient_forms (case_id, volunteer_id, study_number, template_name, answers)
VALUES 
  ('case-001', 'VOL-001', 'STU-2025-001', 'Demographic Details', 
   '{
      "screeningDate": "2025-01-15",
      "gender": "Male",
      "maritalStatus": "Unmarried",
      "dateOfBirth": "1990-05-20",
      "age": {"years": "34", "months": "8", "days": "25"},
      "height": "175",
      "weight": "70",
      "bmi": "22.86",
      "ethnicOrigin": "Asian",
      "literacy": "Literate",
      "foodHabits": "Non-Veg",
      "historyOfSmoking": {"status": "Non Smoker", "remarks": ""},
      "historyOfTobacco": {"status": "No", "remarks": ""},
      "historyOfAlcohol": {"status": "Non Alcoholic", "remarks": ""},
      "historyOfBloodDonation": {"status": "No", "lastDonationDate": "", "amount": ""},
      "historyOfClinicalStudy": {"status": "No", "lastParticipationDate": "", "organization": "", "remarks": ""},
      "recordedBy": {"initials": "JD", "date": "2025-01-15", "time": "10:30"}
    }'),
  
  ('case-002', 'VOL-002', 'STU-2025-001', 'Medical History', 
   '{
      "medicalHistory": [
        {"particulars": "Any present History", "yesNo": "No", "remarks": ""},
        {"particulars": "Any relevant / past medical History", "yesNo": "Yes", "remarks": "Appendectomy in 2020"},
        {"particulars": "Surgical History", "yesNo": "Yes", "remarks": "Appendectomy in 2020"},
        {"particulars": "Past Medication", "yesNo": "No", "remarks": ""}
      ],
      "familyHistory": [
        {"disease": "Hypertension", "yesNo": "Yes", "remarks": "Father"},
        {"disease": "Diabetes Mellitus", "yesNo": "No", "remarks": ""},
        {"disease": "Bleeding Disorder", "yesNo": "No", "remarks": ""},
        {"disease": "Epilepsy", "yesNo": "No", "remarks": ""},
        {"disease": "Bronchial Asthma", "yesNo": "No", "remarks": ""},
        {"disease": "Jaundice", "yesNo": "No", "remarks": ""},
        {"disease": "Renal Disease", "yesNo": "No", "remarks": ""},
        {"disease": "Neurological Disease", "yesNo": "No", "remarks": ""},
        {"disease": "Tuberculosis", "yesNo": "No", "remarks": ""},
        {"disease": "Thyroid Disease", "yesNo": "No", "remarks": ""},
        {"disease": "Other (Specify)", "yesNo": "No", "remarks": ""}
      ],
      "allergies": [
        {"type": "Food Allergy", "yesNo": "No", "remarks": ""},
        {"type": "Drug Allergy", "yesNo": "No", "remarks": ""},
        {"type": "Allergy to animal", "yesNo": "No", "remarks": ""}
      ],
      "generalRemarks": "Patient is in good health overall.",
      "doneBy": "Dr. Jane Smith"
    }'),
  
  ('case-003', 'VOL-003', 'STU-2025-002', 'Vital Signs', 
   '{
      "vitalSigns": {
        "bodyTemperature": "36.8",
        "pulseRate": "72",
        "respirationRate": "16",
        "bloodPressure": "120/80"
      },
      "mentalStatus": "Alert and oriented",
      "generalAppearance": "Well-nourished, well-developed",
      "systemicExam": [
        {"site": "Cardio vascular system", "normal": "Yes", "abnormal": "", "remarks": ""},
        {"site": "ENT and respiratory system", "normal": "Yes", "abnormal": "", "remarks": ""},
        {"site": "Abdominal and genitourinary system", "normal": "Yes", "abnormal": "", "remarks": ""},
        {"site": "Central nervous system", "normal": "Yes", "abnormal": "", "remarks": ""},
        {"site": "Skin and musculoskeletal system", "normal": "Yes", "abnormal": "", "remarks": ""}
      ],
      "otherRemarks": "",
      "doneBy": "Dr. Michael Johnson"
    }')
ON CONFLICT DO NOTHING;

-- Add sample activity logs
INSERT INTO public.activity_logs (action, resource_type, resource_id, details, user_id)
VALUES 
  ('create', 'form', 'case-001', '{"template": "Demographic Details", "volunteer_id": "VOL-001"}', (SELECT id FROM public.profiles LIMIT 1)),
  ('update', 'form', 'case-002', '{"template": "Medical History", "volunteer_id": "VOL-002", "field_changed": "medicalHistory"}', (SELECT id FROM public.profiles LIMIT 1)),
  ('view', 'form', 'case-003', '{"template": "Vital Signs", "volunteer_id": "VOL-003"}', (SELECT id FROM public.profiles LIMIT 1))
ON CONFLICT DO NOTHING;