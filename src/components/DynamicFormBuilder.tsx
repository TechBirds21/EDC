
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableField } from './DynamicFormBuilder/TableField';
import { FormField, FormSection as FormSectionType, TableColumn } from './FormBuilder/types';

interface DynamicFormBuilderProps {
  template: {
    name?: string;
    sections: FormSectionType[];
  };
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  formId: string;
}

const DynamicFormBuilder: React.FC<DynamicFormBuilderProps> = ({
  template,
  data,
  onChange,
  formId
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleFieldChange = (fieldId: string, value: any) => {
    const updatedData = {
      ...formData,
      [fieldId]: value
    };
    setFormData(updatedData);
    onChange(updatedData);
  };

  const renderField = (field: FormField) => {
    const fieldId = field.id || field.name;
    
    // Handle table/matrix fields
    if (field.type === 'table' && field.tableConfig) {
      const columns: TableColumn[] = field.tableConfig.columns || [];

      const currentValue = formData[fieldId] || [];

      return (
        <TableField
          key={fieldId}
          id={fieldId}
          label={field.label || 'Table'}
          columns={columns}
          rows={[]}
          value={currentValue}
          onChange={(newValue) => handleFieldChange(fieldId, newValue)}
          onBlur={() => {}}
          allowAddRows={field.tableConfig.allowAddRows ?? true}
          allowEditColumns={true}
          onColumnsChange={(newColumns) => {
            // Update field configuration if needed
            console.log('Columns updated:', newColumns);
          }}
        />
      );
    }

    // Handle other field types
    return (
      <div key={fieldId} className="mb-4">
        <label className="block text-sm font-medium mb-2">
          {field.label || fieldId}
        </label>
        <input
          type={field.type || 'text'}
          value={formData[fieldId] || ''}
          onChange={(e) => handleFieldChange(fieldId, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={field.placeholder || ''}
        />
      </div>
    );
  };

  const renderSection = (section: FormSectionType) => {
    if (!section.fields || !Array.isArray(section.fields)) {
      return null;
    }

    return (
      <div key={section.id || section.title} className="mb-6">
        <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
        {section.fields.map(renderField)}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{template?.name || 'Dynamic Form'}</CardTitle>
      </CardHeader>
      <CardContent>
        {template?.sections && Array.isArray(template.sections) ? (
          template.sections.map(renderSection)
        ) : (
          <div>
            <p className="text-gray-500 mb-4">
              Template structure: {JSON.stringify(template, null, 2)}
            </p>
            
            {/* Example table field for testing */}
            <TableField
              id="example-table"
              label="Example Data Table"
              columns={[
                {
                  id: 'name',
                  label: 'Name',
                  type: 'text',
                  required: true
                },
                {
                  id: 'age',
                  label: 'Age',
                  type: 'number',
                  required: false
                },
                {
                  id: 'status',
                  label: 'Status',
                  type: 'select',
                  options: [
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                    { label: 'Pending', value: 'pending' },
                  ],
                  required: false
                }
              ]}
              rows={[]}
              value={formData['example-table'] || []}
              onChange={(value) => handleFieldChange('example-table', value)}
              onBlur={() => {}}
              allowAddRows={true}
              allowEditColumns={true}
              onColumnsChange={(columns) => console.log('Columns updated:', columns)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DynamicFormBuilder;
