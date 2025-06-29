
import React from 'react';
import { FormField } from './FormField';

export interface SignatureData {
  name: string;
  date: string;
  time: string;
}

interface SignatureFieldsProps {
  label?: string;
  value: SignatureData;
  onChange: (value: SignatureData) => void;
  disabled?: boolean;
  vertical?: boolean;
  className?: string;
}

export const SignatureFields: React.FC<SignatureFieldsProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  vertical = false,
  className = ''
}) => {
  const updateField = (field: keyof SignatureData, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const fieldsContent = (
    <div className={`${vertical ? 'space-y-2' : 'grid grid-cols-3 gap-2'} ${className}`}>
      <FormField
        label={vertical ? "Name" : ""}
        value={value.name}
        onChange={(val) => updateField('name', val)}
        disabled={disabled}
        placeholder="Name"
      />
      <FormField
        label={vertical ? "Date" : ""}
        type="date"
        value={value.date}
        onChange={(val) => updateField('date', val)}
        disabled={disabled}
        placeholder="Date"
      />
      <FormField
        label={vertical ? "Time" : ""}
        type="time"
        value={value.time}
        onChange={(val) => updateField('time', val)}
        disabled={disabled}
        placeholder="Time"
      />
    </div>
  );

  if (label) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">{label}</label>
        {fieldsContent}
      </div>
    );
  }

  return fieldsContent;
};
