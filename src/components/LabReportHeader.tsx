
import React from 'react';
import { FormField } from './FormField';

interface LabReportHeaderData {
  age: string;
  studyNo: string;
  subjectId: string;
  sampleAndSid: string;
  sex: string;
  collectionCentre: string;
  sampleCollectionDate: string;
  registrationDate: string;
  reportDate: string;
}

interface LabReportHeaderProps {
  volunteerId: string;
  formData: LabReportHeaderData;
  onUpdateForm: (field: string, value: string) => void;
  disabled?: boolean;
}

export const LabReportHeader: React.FC<LabReportHeaderProps> = ({
  volunteerId,
  formData,
  onUpdateForm,
  disabled = false
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 border border-border rounded-lg bg-muted/50">
      <FormField
        label="Volunteer ID"
        value={volunteerId}
        onChange={() => {}} // Read-only
        disabled={true}
      />
      <FormField
        label="Study No"
        value={formData.studyNo}
        onChange={(val) => onUpdateForm('studyNo', val)}
        disabled={true} // Read-only as specified
      />
      <FormField
        label="Subject ID"
        value={formData.subjectId}
        onChange={(val) => onUpdateForm('subjectId', val)}
        disabled={disabled}
      />
      <FormField
        label="Sample & SID"
        value={formData.sampleAndSid}
        onChange={(val) => onUpdateForm('sampleAndSid', val)}
        disabled={disabled}
      />
      <FormField
        label="Age"
        value={formData.age}
        onChange={(val) => onUpdateForm('age', val)}
        disabled={disabled}
      />
      <FormField
        label="Sex"
        value={formData.sex}
        onChange={(val) => onUpdateForm('sex', val)}
        disabled={disabled}
      />
      <FormField
        label="Collection Centre"
        value={formData.collectionCentre}
        onChange={(val) => onUpdateForm('collectionCentre', val)}
        disabled={disabled}
      />
      <FormField
        label="Sample Collection Date"
        type="date"
        value={formData.sampleCollectionDate}
        onChange={(val) => onUpdateForm('sampleCollectionDate', val)}
        disabled={disabled}
      />
      <FormField
        label="Registration Date"
        type="date"
        value={formData.registrationDate}
        onChange={(val) => onUpdateForm('registrationDate', val)}
        disabled={disabled}
      />
      <FormField
        label="Report Date"
        type="date"
        value={formData.reportDate}
        onChange={(val) => onUpdateForm('reportDate', val)}
        disabled={disabled}
      />
    </div>
  );
};
