
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface FormField {
  name: string;
  type: 'text' | 'textarea' | 'email' | 'number' | 'date' | 'time' | 'select' | 'computed' | 'group' | 'radio' | 'static';
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number | string;
  fields?: FormField[];
  formula?: string;
  onChange?: string;
  calculate?: string;
  range?: [number, number];
  default?: string;
}

export interface JsonSchema {
  headerFields?: string[];
  previous?: string;
  next?: string;
  sections: {
    title: string;
    fields?: FormField[];
    arrayField?: string;
    columns?: FormField[];
    seed?: string[];
  }[];
}

// Helper functions for computed fields
export const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const calculateBMI = (height: number, weight: number): number => {
  if (!height || !weight) return 0;
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

export const getDefaultValue = (field: FormField): any => {
  if (field.default === 'today') {
    return new Date().toISOString().split('T')[0];
  }
  if (field.default === 'now') {
    return new Date().toTimeString().split(' ')[0].slice(0, 5);
  }
  return '';
};

export const renderField = (
  field: FormField, 
  value: any, 
  onChange: (value: any) => void,
  allValues: Record<string, any> = {},
  isReadOnly: boolean = false
): React.ReactElement => {
  
  const handleChange = (newValue: any) => {
    onChange(newValue);
    
    // Handle computed field updates
    if (field.onChange === 'recalcBMI' && allValues.height && allValues.weight) {
      const bmi = calculateBMI(allValues.height, allValues.weight);
      onChange(bmi);
    }
    
    if (field.calculate === 'age' && newValue) {
      const age = calculateAge(newValue);
      onChange(age);
    }
  };

  const renderInput = (inputField: FormField, inputValue: any, inputOnChange: (value: any) => void) => {
    if (inputField.type === 'static') {
      return (
        <div className="p-2 bg-gray-50 border rounded text-gray-700">
          {inputValue || inputField.label}
        </div>
      );
    }

    if (inputField.type === 'radio') {
      return (
        <RadioGroup
          value={inputValue || ''}
          onValueChange={inputOnChange}
          disabled={isReadOnly}
          className="flex gap-4"
        >
          {inputField.options?.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${inputField.name}-${option}`} />
              <Label htmlFor={`${inputField.name}-${option}`} className="text-sm">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    }

    if (inputField.type === 'computed') {
      let computedValue = inputValue;
      
      if (inputField.formula === 'ageFromDOB' && allValues.dateOfBirth) {
        computedValue = calculateAge(allValues.dateOfBirth);
      } else if (inputField.formula === 'bmi(height,weight)' && allValues.height && allValues.weight) {
        computedValue = calculateBMI(allValues.height, allValues.weight);
      }
      
      return (
        <Input
          value={computedValue || ''}
          readOnly
          className="bg-gray-100 cursor-not-allowed"
        />
      );
    }

    if (inputField.type === 'select') {
      return (
        <Select
          value={inputValue || ''}
          onValueChange={inputOnChange}
          disabled={isReadOnly}
        >
          <SelectTrigger>
            <SelectValue placeholder={inputField.placeholder || `Select ${inputField.label}`} />
          </SelectTrigger>
          <SelectContent>
            {inputField.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (inputField.type === 'textarea') {
      return (
        <Textarea
          value={inputValue || ''}
          onChange={(e) => inputOnChange(e.target.value)}
          placeholder={inputField.placeholder}
          required={inputField.required}
          readOnly={isReadOnly}
          rows={4}
        />
      );
    }

    return (
      <Input
        type={inputField.type}
        value={inputValue || ''}
        onChange={(e) => {
          const newValue = inputField.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
          inputOnChange(newValue);
        }}
        placeholder={inputField.placeholder}
        required={inputField.required}
        min={inputField.min}
        max={inputField.max}
        readOnly={isReadOnly}
      />
    );
  };

  if (field.type === 'group') {
    return (
      <Card key={field.name} className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {field.fields?.map((subField) => (
            <div key={subField.name} className="space-y-2">
              <Label htmlFor={`${field.name}.${subField.name}`}>
                {subField.label}
                {subField.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderInput(
                subField,
                value?.[subField.name],
                (newValue) => onChange({ ...value, [subField.name]: newValue })
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div key={field.name} className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderInput(field, value, handleChange)}
    </div>
  );
};
