import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DynamicFormBuilder from '@/components/DynamicFormBuilder';
import { VolunteerProvider } from '@/contexts/VolunteerContext'; 
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/FormBuilder/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplatePreview } from '@/components/templates/TemplatePreview';

// Example template
const exampleTemplate: {name: string, sections: FormSection[]} = {
  name: 'Medical History Form',
  sections: [
    {
      id: 'personal',
      title: 'Personal Information',
      sortOrder: 0,
      fields: [
        {
          id: 'name',
          name: 'name',
          type: 'text' as const,
          label: 'Full Name',
          required: true,
          placeholder: 'Enter your full name'
        },
        {
          id: 'dob',
          name: 'dob',
          type: 'date' as const,
          label: 'Date of Birth',
          required: true
        },
        {
          id: 'gender',
          name: 'gender',
          type: 'select' as const,
          label: 'Gender',
          required: true,
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Other', value: 'other' },
          ]
        }
      ]
    },
    {
      id: 'medical',
      title: 'Medical History',
      sortOrder: 1,
      fields: [
        {
          id: 'conditions',
          name: 'conditions',
          type: 'textarea' as const,
          label: 'Existing Medical Conditions',
          placeholder: 'List any existing medical conditions'
        },
        {
          id: 'allergies',
          name: 'allergies',
          type: 'textarea' as const,
          label: 'Allergies',
          placeholder: 'List any allergies'
        },
        {
          id: 'smoker',
          name: 'smoker',
          type: 'radio' as const,
          label: 'Do you smoke?',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
            { label: 'Former Smoker', value: 'former' },
          ]
        }
      ]
    },
    {
      id: 'tableSection',
      title: 'Table Example',
      sortOrder: 2,
      fields: [
        {
          id: 'patientTests',
          name: 'patientTests',
          type: 'table' as const,
          label: 'Patient Test Results',
          required: true,
          tableConfig: {
            columns: [
              { id: 'testName', label: 'Test Name', type: 'text', width: '30%' },
              { id: 'result', label: 'Result', type: 'text', width: '20%' },
              { id: 'unit', label: 'Unit', type: 'text', width: '15%' },
              { id: 'referenceRange', label: 'Reference Range', type: 'text', width: '20%' },
              { id: 'abnormal', label: 'Abnormal', type: 'checkbox', width: '15%' }
            ],
            allowAddRows: true
          }
        }
      ]
    },
    {
      id: 'vitals',
      title: 'Vital Signs',
      sortOrder: 3,
      fields: [
        {
          id: 'height',
          name: 'height',
          type: 'number' as const,
          label: 'Height (cm)',
          required: true
        },
        {
          id: 'weight',
          name: 'weight',
          type: 'number' as const,
          label: 'Weight (kg)',
          required: true
        },
        {
          id: 'bloodPressure',
          name: 'bloodPressure',
          type: 'text' as const,
          label: 'Blood Pressure',
          placeholder: 'e.g. 120/80'
        }
      ]
    }
  ],
};

// Example initial data
const initialData: Record<string, any> = {
  name: 'John Doe',
  dob: '1990-01-15',
  gender: 'male',
  conditions: 'None',
  allergies: 'Peanuts',
  smoker: 'no',
  patientTests: [
    { 
      id: 'row-1',
      cells: {
        testName: 'Hemoglobin',
        result: '14.5',
        unit: 'g/dL',
        referenceRange: '13.5-17.5',
        abnormal: false
      }
    },
    { 
      id: 'row-2',
      cells: {
        testName: 'White Blood Cells',
        result: '7.5',
        unit: '10^9/L',
        referenceRange: '4.5-11.0',
        abnormal: false
      }
    }
  ],
  height: '175',
  weight: '70',
  bloodPressure: '120/80'
};

const FormExample: React.FC = () => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  
  const handleFormChange = (data: Record<string, any>) => {
    setFormData(data);
    console.log('Form data updated:', data);
  };
  
  const handleAddRow = () => {
    const newRow = {
      id: `row-${Date.now()}`,
      cells: {
        testName: '',
        result: '',
        unit: '',
        referenceRange: '',
        abnormal: false
      }
    };
    
    const currentRows = formData['patientTests'] || [];
    setFormData({
      ...formData,
      'patientTests': [...currentRows, newRow]
    });
  };
  
  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="form">
        <div className="flex justify-between items-center mb-6">
          <CardTitle className="text-2xl">Form Example</CardTitle>
          <TabsList>
            <TabsTrigger value="form">Form View</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Medical History Form</CardTitle>
            </CardHeader>
            <CardContent>
              <VolunteerProvider>
                <DynamicFormBuilder
                  template={exampleTemplate}
                  data={formData}
                  onChange={handleFormChange}
                  formId="example-form-123"
                />
              </VolunteerProvider>
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Form Actions</h3>
                <div className="flex gap-4">
                  <Button onClick={handleAddRow}>
                    Add Test Result Row
                  </Button>
                  <Button variant="outline" onClick={() => console.log(formData)}>
                    Log Form Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardContent className="p-6">
              <TemplatePreview template={{
                id: 'example-id',
                name: exampleTemplate.name,
                description: 'Example form template for demonstration',
                project_id: 'example-project',
                version: 1,
                json_schema: { sections: exampleTemplate.sections },
                is_active: true,
                created_at: new Date().toISOString()
              }} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Form Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormExample;
