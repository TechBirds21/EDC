
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVolunteer } from '../context/VolunteerContext';
import { CommonHeader } from '../components/CommonHeader';
import { LabReportHeader } from '../components/LabReportHeader';
import { PathologistFields } from '../components/PathologistFields';
import type { LabReportBaseForm } from '../types/lab-report';
import { useGlobalForm } from '../context/GlobalFormContext';
import { useFormSubmission } from '../hooks/useFormSubmission';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Navigation } from '../components/Navigation';
import { SuccessMessage } from '../components/SuccessMessage';
import { ErrorMessage } from '../components/ErrorMessage';

interface ImmunologyTest {
  result: string;
  unit: string;
  referenceRange: string;
}

interface ImmunologyForm extends LabReportBaseForm {
  tests: {
    vdrl: ImmunologyTest;
    hbsAg: ImmunologyTest;
    hivAntibody: ImmunologyTest;
    hcvAntibody: ImmunologyTest;
  };
}

export const Immunology = () => {
  const { volunteerId, saveLabReport } = useVolunteer();
  const { studyNo } = useGlobalForm();
  const { isSubmitting, error, success, setError, setSuccess } = useFormSubmission();
  const [dataLoading, setDataLoading] = useState(false);

  const [formData, setFormData] = useState<ImmunologyForm>({
    headerData: {
      age: '',
      studyNo: studyNo || '',
      subjectId: '',
      sampleAndSid: '',
      sex: '',
      collectionCentre: '',
      sampleCollectionDate: '',
      registrationDate: '',
      reportDate: '',
    },
    tests: {
      vdrl: { result: '', unit: '', referenceRange: '' },
      hbsAg: { result: '', unit: '', referenceRange: '' },
      hivAntibody: { result: '', unit: '', referenceRange: '' },
      hcvAntibody: { result: '', unit: '', referenceRange: '' },
    },
    pathologist1: { name: '', specialty: '' },
    pathologist2: { name: '', specialty: '' },
  });

  // Update studyNo when it changes in context
  useEffect(() => {
    if (studyNo) {
      setFormData(prev => ({
        ...prev,
        headerData: {
          ...prev.headerData,
          studyNo
        }
      }));
    }
  }, [studyNo]);

  // Load data from localStorage on component mount
  useEffect(() => {
    if (volunteerId) {
      setDataLoading(true);
      loadImmunologyData();
    }
  }, [volunteerId]);

  const loadImmunologyData = async () => {
    try {
      // Load from localStorage
      const storedData = localStorage.getItem(`immunology_${volunteerId}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setFormData(parsedData);
      }
    } catch (err) {
      setError('Failed to load immunology data');
    } finally {
      setDataLoading(false);
    }
  };

  const updateHeaderForm = (field: string, value: string) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        headerData: {
          ...prev.headerData,
          [field]: value
        }
      };
      saveToLocalStorage(updatedData);
      return updatedData;
    });
  };

  const updateTest = (testName: keyof ImmunologyForm['tests'], field: keyof ImmunologyTest, value: string) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        tests: {
          ...prev.tests,
          [testName]: {
            ...prev.tests[testName],
            [field]: value
          }
        }
      };
      saveToLocalStorage(updatedData);
      return updatedData;
    });
  };

  const updatePathologist = (pathologist: 'pathologist1' | 'pathologist2', field: 'name' | 'specialty', value: string) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [pathologist]: {
          ...prev[pathologist],
          [field]: value
        }
      };
      saveToLocalStorage(updatedData);
      return updatedData;
    });
  };

  const saveToLocalStorage = (data: ImmunologyForm) => {
    if (volunteerId) {
      localStorage.setItem(`immunology_${volunteerId}`, JSON.stringify(data));
    }
  };

  const handleSave = async () => {
    try {
      // Save to database through context
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: 'Immunology/Serology',
          volunteer_id: volunteerId || '',
          status: "submitted",
          data: formData,
        });
        
        // Show success message and save to localStorage
        setSuccess(true);
        saveToLocalStorage(formData);
        
        // Navigate after a short delay
        setTimeout(() => {
          setSuccess(false);
          window.location.href = '/dashboard';
        }, 1500);
        return;
      } catch (apiError) {
        console.warn('Python API submission failed, falling back to context method:', apiError);
        await saveLabReport('immunology', formData);
      }
      
      // Show success message and save to localStorage
      setSuccess(true);
      saveToLocalStorage(formData);
      
      // Navigate after a short delay
      setTimeout(() => {
        setSuccess(false);
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      setError('Failed to save immunology data');
    }
  };

  const handleContinue = () => {
    saveToLocalStorage(formData);
    handleSave();
  };

  const displayNames: Record<string, string> = {
    vdrl: 'Rapid Plasma Reagin (VDRL)*',
    hbsAg: 'Hepatitis B Surface antigen (HBsAg)',
    hivAntibody: 'HIV 1 & 2 Antibody',
    hcvAntibody: 'Hepatitis C Virus (HCV Antibody)',
  };

  const methods: Record<string, string> = {
    vdrl: '(Method: Flocculation)',
    hbsAg: '(Method: ELISA)',
    hivAntibody: '(Method: ELISA)',
    hcvAntibody: '(Method: ELISA)',
  };

  return (
    <div className="max-w-4xl mx-auto bg-background p-6 rounded-lg shadow-lg">
      <CommonHeader
        title="Laboratory Test Report - Immunology/Serology"
        subtitle="Page 5 of 5"
      />

      {success && (
        <SuccessMessage message="Immunology data saved successfully!" />
      )}

      {error && (
        <ErrorMessage message={error} />
      )}

      {dataLoading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-6">
          <LabReportHeader
            volunteerId={volunteerId}
            formData={formData.headerData}
            onUpdateForm={updateHeaderForm}
          />

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">IMMUNOLOGY / SEROLOGY</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-2 text-left text-sm font-medium text-foreground border border-border">TEST DESCRIPTION</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-foreground border border-border">RESULT</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-foreground border border-border">UNITS</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-foreground border border-border">REFERENCE RANGES</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(formData.tests).map(([key, test]) => (
                    <tr key={key} className="border-b border-border">
                      <td className="px-4 py-2 border border-border">
                        <div className="text-sm">{displayNames[key]}</div>
                        <div className="text-xs text-muted-foreground">{methods[key]}</div>
                      </td>
                      <td className="px-4 py-2 border border-border">
                        <input
                          type="text"
                          value={test.result}
                          onChange={(e) => updateTest(key as keyof ImmunologyForm['tests'], 'result', e.target.value)}
                          className="w-full px-2 py-1 border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                          autoComplete="off"
                        />
                      </td>
                      <td className="px-4 py-2 border border-border">
                        <input
                          type="text"
                          value={test.unit}
                          onChange={(e) => updateTest(key as keyof ImmunologyForm['tests'], 'unit', e.target.value)}
                          className="w-full px-2 py-1 border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                          autoComplete="off"
                        />
                      </td>
                      <td className="px-4 py-2 border border-border">
                        <input
                          type="text"
                          value={test.referenceRange}
                          onChange={(e) => updateTest(key as keyof ImmunologyForm['tests'], 'referenceRange', e.target.value)}
                          className="w-full px-2 py-1 border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                          autoComplete="off"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <PathologistFields
            pathologist1={formData.pathologist1}
            pathologist2={formData.pathologist2}
            onUpdatePathologist={updatePathologist}
          />
        </div>
      )}
      
      <div className="mt-8">
        <Navigation
          onBack={() => window.location.href = '/lab-report/hematology'}
          onContinue={handleContinue}
          disabled={isSubmitting || dataLoading}
        />
      </div>
    </div>
  );
};

export default Immunology;
