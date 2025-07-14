
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableField } from './DynamicFormBuilder/TableField';
import { FormField, FormSection as FormSectionType, TableColumn } from './FormBuilder/types'; 
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';

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
    if (field.type === 'table') {
      // Use tableConfig if available, otherwise use columns directly
      const columns: TableColumn[] = field.tableConfig?.columns || field.columns || [];
      const currentValue = formData[fieldId] || [];

      return (
        <div key={fieldId} className={field.width === 'full' ? 'col-span-full' : ''}>
          <TableField
            id={fieldId}
            label={field.label || 'Table'}
            columns={columns}
            rows={[]}
            value={currentValue}
            onChange={(newValue) => handleFieldChange(fieldId, newValue)}
            onBlur={() => {}}
            allowAddRows={field.tableConfig?.allowAddRows ?? true}
            allowEditColumns={false} // Don't allow column editing in preview
            onColumnsChange={(newColumns) => {
              console.log('Columns updated in preview:', newColumns);
              // In a real scenario, you might want to save this back to the template
            }}
          />
        </div>
      );
    }

    // Handle other field types
    const fieldWidth = field.width === 'full' ? 'col-span-full' : '';
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
      case 'time':
      case 'url':
      case 'tel':
        return (
          <div key={fieldId} className={`mb-4 ${fieldWidth}`}>
            <Label htmlFor={fieldId} className="mb-2">
              {field.label || fieldId}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldId}
              type={field.type || 'text'}
              value={formData[fieldId] || ''}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              placeholder={field.placeholder || ''}
              required={field.required}
            />
          </div>
        );
        
      case 'textarea':
        return (
          <div key={fieldId} className={`mb-4 ${fieldWidth}`}>
            <Label htmlFor={fieldId} className="mb-2">
              {field.label || fieldId}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={fieldId}
              value={formData[fieldId] || ''}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              placeholder={field.placeholder || ''}
              required={field.required}
              rows={field.rows || 3}
            />
          </div>
        );
        
      case 'select':
        return (
          <div key={fieldId} className={`mb-4 ${fieldWidth}`}>
            <Label htmlFor={fieldId} className="mb-2">
              {field.label || fieldId}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={formData[fieldId] || ''}
              onValueChange={(value) => handleFieldChange(fieldId, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => {
                  const optionValue = typeof option === 'string' ? option : option.value;
                  const optionLabel = typeof option === 'string' ? option : option.label;
                  return (
                    <SelectItem key={optionValue} value={optionValue}>
                      {optionLabel}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'radio':
        return (
          <div key={fieldId} className={`mb-4 ${fieldWidth}`}>
            <Label className="mb-2">
              {field.label || fieldId}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={formData[fieldId] || ''}
              onValueChange={(value) => handleFieldChange(fieldId, value)}
              className="flex flex-col space-y-2"
            >
              {field.options?.map((option) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                return (
                  <div key={optionValue} className="flex items-center space-x-2">
                    <RadioGroupItem value={optionValue} id={`${fieldId}-${optionValue}`} />
                    <Label htmlFor={`${fieldId}-${optionValue}`}>{optionLabel}</Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        );
        
      case 'checkbox':
        return (
          <div key={fieldId} className={`mb-4 flex items-center space-x-2 ${fieldWidth}`}>
            <Checkbox
              id={fieldId}
              checked={!!formData[fieldId]}
              onCheckedChange={(checked) => handleFieldChange(fieldId, checked)}
            />
            <Label htmlFor={fieldId}>
              {field.label || fieldId}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );
        
      default:
        return (
          <div key={fieldId} className={`mb-4 ${fieldWidth}`}>
            <Label htmlFor={fieldId} className="mb-2">
              {field.label || fieldId} ({field.type})
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldId}
              value={formData[fieldId] || ''}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              placeholder={field.placeholder || ''}
            />
          </div>
        );
    }
  };

  const renderSection = (section: FormSectionType) => {
    if (!section.fields || !Array.isArray(section.fields)) {
      return null;
    }

    return (
      <Card key={section.id || section.title} className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{section.title}</CardTitle>
          {section.description && (
            <p className="text-sm text-muted-foreground">{section.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className={`grid gap-6 ${section.columns ? `grid-cols-${Math.min(section.columns, 3)}` : 'grid-cols-1'}`}>
            {section.fields.map(renderField)}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {template?.sections && Array.isArray(template.sections) && template.sections.length > 0 ? (
        template.sections.map(renderSection)
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">No Form Sections</p>
              <p className="text-sm">This template doesn't have any sections defined yet.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DynamicFormBuilder;
