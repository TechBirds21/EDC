
import React from 'react';
import { FormField } from './FormField';

interface PathologistInfo {
  name: string;
  specialty: string;
}

interface PathologistFieldsProps {
  pathologist1: PathologistInfo;
  pathologist2: PathologistInfo;
  onUpdatePathologist: (pathologist: 'pathologist1' | 'pathologist2', field: 'name' | 'specialty', value: string) => void;
  disabled?: boolean;
}

export const PathologistFields: React.FC<PathologistFieldsProps> = ({
  pathologist1,
  pathologist2,
  onUpdatePathologist,
  disabled = false
}) => {
  return (
    <div className="space-y-6 p-4 border border-border rounded-lg">
      <h3 className="font-medium text-lg">Pathologist Information</h3>
      
      <div className="space-y-4">
        <h4 className="font-medium">Pathologist 1</h4>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Name"
            value={pathologist1.name}
            onChange={(val) => onUpdatePathologist('pathologist1', 'name', val)}
            disabled={disabled}
          />
          <FormField
            label="Specialty"
            value={pathologist1.specialty}
            onChange={(val) => onUpdatePathologist('pathologist1', 'specialty', val)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Pathologist 2</h4>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Name"
            value={pathologist2.name}
            onChange={(val) => onUpdatePathologist('pathologist2', 'name', val)}
            disabled={disabled}
          />
          <FormField
            label="Specialty"
            value={pathologist2.specialty}
            onChange={(val) => onUpdatePathologist('pathologist2', 'specialty', val)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};
