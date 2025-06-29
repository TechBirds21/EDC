
export interface SignatureData {
  name: string;
  date: string;
  time: string;
}

export interface CommonData {
  volunteerId: string;
  subjectNo: string;
  projectNo: string;
}

export interface VitalSigns {
  pulseRate: string;
  bloodPressure: string;
  temperature: string;
  respiratoryRate?: string;
}

export interface FormSubmissionResult {
  success: boolean;
  message: string;
  data?: any;
}

export type Gender = 'Male' | 'Female' | 'Other';
