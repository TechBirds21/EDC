// pages/FormSelectionPage.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/FormBuilder/FormSection';

// === TYPES (mirror what you have in FormSection.tsx) ===
type FieldType = 'text' | 'number' | 'date' | 'select' | 'radio' | 'textarea';

interface Field {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[] | { label: string; value: string }[];
}

interface SideHeader {
  id: string;
  title: string;
  fields: string[]; // full IDs: "<sectionId>.<fieldId>"
}

// === SAMPLE CONFIGURATION ===
// One section called "Medical Screening"
const SECTION_ID = 'screening';
const SECTION_TITLE = 'Medical Screening';

// Define your fields here
const FIELDS: Field[] = [
  { id: 'volunteerId', type: 'text',    label: 'Volunteer ID', placeholder: 'Enter volunteer ID', required: true },
  { id: 'dateOfScreening', type: 'date', label: 'Date of Screening', required: true },
  { id: 'gender', type: 'select', label: 'Gender', options: ['Male', 'Female', 'Other'], required: true },
  { id: 'age', type: 'number', label: 'Age', placeholder: 'Enter age', required: true },
  { id: 'ethnicOrigin', type: 'text', label: 'Ethnic Origin', placeholder: 'Enter ethnic origin' },
  // …add more fields as needed
];

// (Optional) Side-headers you want to stick beside certain fields
const SIDE_HEADERS: SideHeader[] = [
  {
    id: 'hdr-demo',
    title: 'Demographic Info',
    fields: [`${SECTION_ID}.volunteerId`, `${SECTION_ID}.dateOfScreening`, `${SECTION_ID}.gender`],
  },
  {
    id: 'hdr-basic',
    title: 'Basic Details',
    fields: [`${SECTION_ID}.age`, `${SECTION_ID}.ethnicOrigin`],
  },
];

export const FormSelectionPage: React.FC = () => {
  // form data keyed by "sectionId.fieldId"
  const [data, setData] = useState<Record<string, any>>({});

  // track which fields have been edited
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());

  const handleFieldChange = (fieldKey: string, value: any) => {
    setData(prev => ({ ...prev, [fieldKey]: value }));
    setDirtyFields(prev => {
      const next = new Set(prev);
      next.add(fieldKey);
      return next;
    });
  };

  const handleFieldBlur = (fieldKey: string) => {
    // you can trigger validation here if you like
    console.log('Blurred:', fieldKey, data[fieldKey]);
  };

  const handleSubmit = () => {
    console.log('Final submission:', data);
    // call your API / service here…
    alert('Form submitted! Check console for payload.');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Form Selection Page</h1>

      <FormSection
        id={SECTION_ID}
        title={SECTION_TITLE}
        fields={FIELDS}
        data={data}
        dirtyFields={dirtyFields}
        sideHeaders={SIDE_HEADERS}
        screeningDate={data[`${SECTION_ID}.dateOfScreening`]}
        onFieldChange={(fieldId, val) => handleFieldChange(fieldId, val)}
        onFieldBlur={fieldId => handleFieldBlur(fieldId)}
      />

      <Button onClick={handleSubmit}>Submit Form</Button>
    </div>
  );
};

export default FormSelectionPage;
