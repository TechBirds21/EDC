import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import  DemographicDetailsForm  from '@/components/DemographicDetailsForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import CommonFormHeader  from '@/components/CommonFormHeader';
import  FormNavigation  from '@/components/FormNavigation';
import { JsonSchema, renderField } from '@/utils/formHelpers';
import { db } from '@/lib/dexie';
import { useProjectMenu } from '@/hooks/useProjectMenu';

interface DynamicFormRendererProps {
  formTitle?: string;
  sectionTitle?: string;
  formPath?: string;
}

const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({ 
  formTitle = 'Form',
  sectionTitle = 'Section',
  formPath = 'default'
}) => {
  // If this is the demographic details form, use the dedicated component
  if (formTitle === 'Demographic Details' || formPath === 'screening/demographics') {
    return <DemographicDetailsForm />;
  }

  const { pid } = useParams<{ pid: string }>();
  const location = useLocation();
  const { menu } = useProjectMenu(pid!);
  const [schema, setSchema] = useState<JsonSchema | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [volunteerId, setVolunteerId] = useState('');
  const [studyNumber, setStudyNumber] = useState('');
  const [isLastForm, setIsLastForm] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case') || 'temp-case';

  const allFormPaths = menu?.flatMap(section => 
    section.subsections?.map(sub => sub.path) || []
  ) || [];

  useEffect(() => {
    loadFormTemplate();
    loadExistingData();
    loadCaseInfo();
    checkIfLastForm();
  }, [formPath, pid, caseId, formTitle, menu]);

  const checkIfLastForm = () => {
    const currentIndex = allFormPaths.indexOf(formPath);
    setIsLastForm(currentIndex === allFormPaths.length - 1);
  };

  const loadCaseInfo = async () => {
    try {
      const caseData = await db.pending_forms
        .where('patient_id')
        .equals(caseId)
        .first();

      if (caseData) {
        setVolunteerId(caseData.volunteer_id || '');
        setStudyNumber(caseData.study_number || '');
      }
    } catch (error) {
      console.error('Failed to load case info:', error);
    }
  };

  const loadFormTemplate = async () => {
    try {
      const { data: template, error } = await supabase
        .from('form_templates')
        .select('json_schema, id')
        .eq('project_id', pid || 'clains-project-1')
        .eq('name', formTitle)
        .single();

      if (template && !error && template.json_schema) {
        const jsonSchema = template.json_schema as unknown;
        if (isValidJsonSchema(jsonSchema)) {
          const validSchema = jsonSchema as JsonSchema;
          setSchema(validSchema);
        } else {
          loadFallbackSchema();
        }
      } else {
        loadFallbackSchema();
      }
    } catch (error) {
      console.error('Failed to load form template:', error);
      loadFallbackSchema();
    } finally {
      setLoading(false);
    }
  };

  const loadExistingData = async () => {
    try {
      const existingData = await db.pending_forms
        .where('patient_id')
        .equals(caseId)
        .and(form => form.template_id === formTitle)
        .first();

      if (existingData) {
        setValues(existingData.answers || {});
      }
    } catch (error) {
      console.error('Failed to load existing data:', error);
    }
  };

  const isValidJsonSchema = (obj: unknown): obj is JsonSchema => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'sections' in obj &&
      'sections' in obj &&
      Array.isArray((obj as any).sections)
    );
  };

  const loadFallbackSchema = () => {
    if (formTitle === 'Medical History') {
      const medicalHistorySchema: JsonSchema = {
        headerFields: ['volunteer_id', 'study_number'],
        sections: [
          {
            title: 'Medical History',
            arrayField: 'medicalHistory',
            columns: [
              { name: 'particulars', label: 'Particulars', type: 'static' },
              { name: 'yesNo', label: 'Yes / No', type: 'radio', options: ['Yes', 'No'] },
              { name: 'remarks', label: 'Remarks', type: 'text' }
            ],
            seed: [
              'Any present History',
              'Any relevant / past medical History',
              'Surgical History',
              'Past Medication'
            ]
          }
        ]
      };
      setSchema(medicalHistorySchema);
    } else {
      // Generic fallback schema
      const genericSchema: JsonSchema = {
        headerFields: ['volunteer_id', 'study_number'],
        sections: [
          {
            title: formTitle,
            fields: [
              { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Enter any notes or observations' },
              { name: 'date', label: 'Date', type: 'date', required: true, default: 'today' },
              { name: 'time', label: 'Time', type: 'time', required: true, default: 'now' }
            ]
          }
        ]
      };
      setSchema(genericSchema);
    }
  };

  const handleChange = async (name: string, value: any) => {
    const newValues = { ...values, [name]: value };
    setValues(newValues);
    
    // Auto-save to IndexedDB on every change
    try {
      const existingForm = await db.pending_forms
        .where('patient_id')
        .equals(caseId)
        .and(form => form.template_id === formTitle)
        .first();

      if (existingForm) {
        await db.pending_forms.update(existingForm.id!, {
          answers: newValues,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          last_modified: new Date()
        });
      } else {
        await db.pending_forms.add({
          template_id: formTitle,
          patient_id: caseId,
          answers: newValues,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          created_at: new Date(),
          last_modified: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to auto-save:', error);
    }
  };

  const handleNavigation = (direction: 'previous' | 'next') => {
    const currentIndex = allFormPaths.indexOf(formPath);
    let targetPath = '';
    
    if (direction === 'previous' && currentIndex > 0) {
      targetPath = allFormPaths[currentIndex - 1];
    } else if (direction === 'next' && currentIndex < allFormPaths.length - 1) {
      targetPath = allFormPaths[currentIndex + 1];
    }
    
    if (targetPath) {
      // navigate(`/employee/project/${pid}/dashboard/${targetPath}?case=${caseId}`);
      console.log({direction, targetPath});
    }
  };

  const handleSaveLocal = async () => {
    try {
      const existingForm = await db.pending_forms
        .where('patient_id')
        .equals(caseId)
        .and(form => form.template_id === formTitle)
        .first();

      if (existingForm) {
        await db.pending_forms.update(existingForm.id!, {
          answers: values,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          last_modified: new Date()
        });
      } else {
        await db.pending_forms.add({
          template_id: formTitle,
          patient_id: caseId,
          answers: values,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          created_at: new Date(),
          last_modified: new Date()
        });
      }
      alert('Form saved locally!');
    } catch (error) {
      console.error('Failed to save locally:', error);
      alert('Failed to save form locally');
    }
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    alert('Preview functionality will be implemented');
  };

  const handleSubmit = async () => {
    try {
      // TODO: Implement submit functionality
      alert('Submit functionality will be implemented');
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to submit form');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Form template not found</p>
      </div>
    );
  }

  const currentIndex = allFormPaths.indexOf(formPath);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allFormPaths.length - 1;

  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CommonFormHeader
        formTitle={formTitle}
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
        readOnly={true}
      />

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Auto-save enabled - Your progress is automatically saved locally
        </AlertDescription>
      </Alert>

      {schema.sections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="clinical-card">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {section.arrayField ? (
              <ArrayFieldRenderer
                section={section}
                values={values[section.arrayField] || []}
                onChange={(arrayValues) => setValues(prev => ({ ...prev, [section.arrayField!]: arrayValues }))}
              />
            ) : (
              section.fields?.map(field => 
                renderField(field, values[field.name], value => setValues(prev => ({ ...prev, [field.name]: value })), values)
              )
            )}
          </CardContent>
        </Card>
      ))}

      <FormNavigation
        hasPrevious={allFormPaths.indexOf(formPath) > 0}
        hasNext={allFormPaths.indexOf(formPath) < allFormPaths.length - 1}
        isLastForm={isLastForm}
        onPrevious={() => console.log('Previous')}
        onNext={() => console.log('Next')}
        onSaveLocal={() => console.log('Save Local')}
        onPreview={isLastForm ? () => console.log('Preview') : undefined}
        onSubmit={isLastForm ? () => console.log('Submit') : undefined}
        loading={loading}
      />
    </div>
  );
};

interface ArrayFieldRendererProps {
  section: any;
  values: any[];
  onChange: (values: any[]) => void;
}

const ArrayFieldRenderer: React.FC<ArrayFieldRendererProps> = ({ section, values, onChange }) => {
  const initializeRows = () => {
    if (values.length === 0 && section.seed) {
      const initialRows = section.seed.map((seedItem: string, index: number) => {
        const row: Record<string, any> = {};
        section.columns.forEach((col: any) => {
          if (col.type === 'static') {
            row[col.name] = seedItem;
          } else {
            row[col.name] = '';
          }
        });
        return row;
      });
      onChange(initialRows);
      return initialRows;
    }
    return values;
  };

  const currentValues = initializeRows();

  const handleCellChange = (rowIndex: number, columnName: string, value: any) => {
    const newValues = [...currentValues];
    newValues[rowIndex] = { ...newValues[rowIndex], [columnName]: value };
    onChange(newValues);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {section.columns.map((column: any) => (
              <th key={column.name} className="border border-gray-300 p-3 text-left font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentValues.map((row: any, rowIndex: number) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {section.columns.map((column: any) => (
                <td key={column.name} className="border border-gray-300 p-3">
                  {renderField(
                    column,
                    row[column.name],
                    (value) => handleCellChange(rowIndex, column.name, value),
                    row,
                    column.type === 'static'
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicFormRenderer;
