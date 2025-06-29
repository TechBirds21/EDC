import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronDown } from 'lucide-react';
import { useValidatedDate } from '@/hooks/useValidatedDate';

interface FieldProps {
  id: string;
  type: 'text' | 'number' | 'date' | 'select' | 'radio' | 'textarea';
  label: string;
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  required?: boolean;
  placeholder?: string;
  options?: string[] | { label: string; value: string }[];
  isDirty?: boolean;
  minDate?: string;
  className?: string;
}

export const FormField: React.FC<FieldProps> = ({
  id,
  type,
  label,
  value,
  onChange,
  onBlur,
  required,
  placeholder,
  options = [],
  isDirty = false,
  minDate,
  className = '',
}) => {
  const validateDate = useValidatedDate(minDate);
  
  const renderField = () => {
    const baseClassName = `w-full ${isDirty ? 'border-amber-500' : ''} ${className}`;
    
    switch (type) {
      case 'text':
        return (
          <Input
            id={id}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            required={required}
            placeholder={placeholder}
            className={baseClassName}
          />
        );
        
      case 'number':
        return (
          <Input
            id={id}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            required={required}
            placeholder={placeholder}
            className={baseClassName}
          />
        );
        
      case 'date':
        return (
          <Input
            id={id}
            type="date"
            value={value || ''}
            onChange={(e) => {
              if (validateDate.isValid(e.target.value)) {
                onChange(e.target.value);
              }
            }}
            onBlur={onBlur}
            required={required}
            min={validateDate.minDate}
            className={baseClassName}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            required={required}
            placeholder={placeholder}
            className={baseClassName}
            rows={4}
          />
        );
        
      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(val) => onChange(val)}
            onOpenChange={() => {
              if (value !== undefined) {
                onBlur();
              }
            }}
          >
            <SelectTrigger className={isDirty ? 'border-amber-500' : ''}>
              <SelectValue placeholder={placeholder || `Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => {
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
        );
        
      case 'radio':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={(val) => {
              onChange(val);
              onBlur();
            }}
            className="flex flex-col space-y-1"
          >
            {options.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              
              return (
                <div key={optionValue} className="flex items-center space-x-2">
                  <RadioGroupItem value={optionValue} id={`${id}-${optionValue}`} />
                  <Label htmlFor={`${id}-${optionValue}`}>{optionLabel}</Label>
                </div>
              );
            })}
          </RadioGroup>
        );
        
      default:
        return (
          <Input
            id={id}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            required={required}
            placeholder={placeholder}
            className={baseClassName}
          />
        );
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor={id} className="flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {isDirty && (
          <div className="flex items-center text-amber-500 text-xs">
            <ChevronDown className="h-3 w-3 mr-1" />
            Unsaved
          </div>
        )}
      </div>
      {renderField()}
    </div>
  );
};