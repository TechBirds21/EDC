
import React, { createContext, useContext, useState } from 'react';

export interface VolunteerContextType {
  volunteerId: string;
  setVolunteerId: (id: string) => void;
  saveLabReport: (reportType: string, data: any) => Promise<void>;
  savePatientRecord: (recordType: string, data: any) => Promise<void>;
}

const VolunteerContext = createContext<VolunteerContextType | undefined>(undefined);

export const VolunteerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [volunteerId, setVolunteerId] = useState('');

  const saveLabReport = async (reportType: string, data: any) => {
    try {
      console.log('Saving lab report:', reportType, data);
      // Save to localStorage since we don't have the database tables
      localStorage.setItem(`lab_report_${reportType}_${volunteerId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving lab report:', error);
      throw error;
    }
  };

  const savePatientRecord = async (recordType: string, data: any) => {
    try {
      console.log('Saving patient record:', recordType, data);
      // Save to localStorage since we don't have the database tables
      localStorage.setItem(`patient_record_${recordType}_${volunteerId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving patient record:', error);
      throw error;
    }
  };

  return (
    <VolunteerContext.Provider value={{
      volunteerId,
      setVolunteerId,
      saveLabReport,
      savePatientRecord
    }}>
      {children}
    </VolunteerContext.Provider>
  );
};

export const useVolunteer = () => {
  const context = useContext(VolunteerContext);
  if (context === undefined) {
    throw new Error('useVolunteer must be used within a VolunteerProvider');
  }
  return context;
};
