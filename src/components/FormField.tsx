
import React from 'react';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'date' | 'time' | 'textarea' | 'select' | 'radio';
  options?: string[] | { label: string; value: string }[];
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  step?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  options = [],
  disabled = false,
  placeholder,
  required = false,
  step,
  className = ''
}) => {
  const inputClasses = "w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:bg-muted disabled:text-muted-foreground";

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            required={required}
            className={`${inputClasses} min-h-[80px] resize-y ${className}`}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            className={`${inputClasses} ${className}`}
          >
            <option value="">Select...</option>
            {options.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        );
      case 'radio':
        return (
          <div className={`flex gap-4 ${className}`}>
            {options.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              return (
                <label key={optionValue} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    required={required}
                    className="form-radio"
                  />
                  <span className="ml-2">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        );
      default:
        return (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            required={required}
            step={step}
            className={`${inputClasses} ${className}`}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {renderInput()}
    </div>
  );
};
