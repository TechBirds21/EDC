
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

interface UrineAnalysisTest {
  result: string;
  unit: string;
  referenceRange: string;
}

interface ClinicalPathologyForm extends LabReportBaseForm {
  urineAnalysis: {
    color: UrineAnalysisTest;
    appearance: UrineAnalysisTest;
    specificGravity: UrineAnalysisTest;
    reactionPh: UrineAnalysisTest;
    proteins: UrineAnalysisTest;
    glucose: UrineAnalysisTest;
    bileSalts: UrineAnalysisTest;
    ketones: UrineAnalysisTest;
    blood: UrineAnalysisTest;
    urobilinogen: UrineAnalysisTest;
    nitrites: UrineAnalysisTest;
    pusWbc: UrineAnalysisTest;
    urineRbc: UrineAnalysisTest;
    epithelialCells: UrineAnalysisTest;
    casts: UrineAnalysisTest;
    others: UrineAnalysisTest;
  };
}

export const ClinicalPathology = () => {
  const { volunteerId, saveLabReport } = useVolunteer();
  const { studyNo } = useGlobalForm();
  const { loading, error, success, setError, setSuccess } = useFormSubmission();
  const [dataLoading, setDataLoading] = useState(false);

  const [formData, setFormData] = useState<ClinicalPathologyForm>({
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
    urineAnalysis: {
      color: { result: '', unit: '', referenceRange: '' },
      appearance: { result: '', unit: '', referenceRange: '' },
      specificGravity: { result: '', unit: '', referenceRange: '' },
      reactionPh: { result: '', unit: '', referenceRange: '' },
      proteins: { result: '', unit: '', referenceRange: '' },
      glucose: { result: '', unit: '', referenceRange: '' },
      bileSalts: { result: '', unit: '', referenceRange: '' },
      ketones: { result: '', unit: '', referenceRange: '' },
      blood: { result: '', unit: '', referenceRange: '' },
      urobilinogen: { result: '', unit: '', referenceRange: '' },
      nitrites: { result: '', unit: '', referenceRange: '' },
      pusWbc: { result: '', unit: '', referenceRange: '' },
      urineRbc: { result: '', unit: '', referenceRange: '' },
      epithelialCells: { result: '', unit: '', referenceRange: '' },
      casts: { result: '', unit: '', referenceRange: '' },
      others: { result: '', unit: '', referenceRange: '' },
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
      loadPathologyData();
    }
  }, [volunteerId]);

  const loadPathologyData = async () => {
    try {
      // Load from localStorage
      const storedData = localStorage.getItem(`pathology_${volunteerId}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setFormData(parsedData);
      }
    } catch (err) {
      setError('Failed to load pathology data');
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

  const updateUrineAnalysis = (
    testName: keyof ClinicalPathologyForm['urineAnalysis'],
    field: keyof UrineAnalysisTest,
    value: string
  ) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        urineAnalysis: {
          ...prev.urineAnalysis,
          [testName]: {
            ...prev.urineAnalysis[testName],
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

  const saveToLocalStorage = (data: ClinicalPathologyForm) => {
    if (volunteerId) {
      localStorage.setItem(`pathology_${volunteerId}`, JSON.stringify(data));
    }
  };

  const handleSave = async () => {
    try {
      // Save to database through context
      await saveLabReport('pathology', formData);
      
      // Show success message and save to localStorage
      setSuccess(true);
      saveToLocalStorage(formData);
      
      // Navigate after a short delay
      setTimeout(() => {
        setSuccess(false);
        window.location.href = '/lab-report/hematology';
      }, 1500);
    } catch (err) {
      setError('Failed to save pathology data');
    }
  };

  const handleContinue = () => {
    saveToLocalStorage(formData);
    handleSave();
  };

  // Map for display names
  const displayNames: Record<string, string> = {
    color: 'Colour',
    appearance: 'Appearance',
    specificGravity: 'Specific gravity',
    reactionPh: 'Reaction(pH)',
    proteins: 'Proteins',
    glucose: 'Glucose',
    bileSalts: 'Bile salts & Bile pigments',
    ketones: 'Ketones',
    blood: 'Blood',
    urobilinogen: 'Urobilinogen',
    nitrites: 'Nitrites',
    pusWbc: 'PUS(WBC) Cells',
    urineRbc: 'Urine RBC',
    epithelialCells: 'U.Epithelial Cells',
    casts: 'Casts & Crystals',
    others: 'Others',
  };

  return (
    <div className="max-w-4xl mx-auto bg-background p-6 rounded-lg shadow-lg">
      <CommonHeader
        title="Laboratory Test Report - Clinical Pathology"
        subtitle="Page 3 of 5"
      />

      {success && (
        <SuccessMessage message="Pathology data saved successfully!" />
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
            <h3 className="text-lg font-semibold mb-4">CLINICAL PATHOLOGY</h3>
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
                  <tr className="border-b border-border">
                    <td className="px-4 py-2 font-semibold" colSpan={4}>
                      Complete Urine Analysis (CUE)
                      <div className="text-xs text-muted-foreground">(Method: Strip/Microscopy)</div>
                    </td>
                  </tr>
                  {Object.entries(formData.urineAnalysis).map(([key, test]) => (
                    <tr key={key} className="border-b border-border">
                      <td className="px-4 py-2 border border-border">{displayNames[key]}</td>
                      <td className="px-4 py-2 border border-border">
                        <input
                          type="text"
                          value={test.result}
                          onChange={(e) =>
                            updateUrineAnalysis(key as keyof ClinicalPathologyForm['urineAnalysis'], 'result', e.target.value)
                          }
                          className="w-full px-2 py-1 border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                          autoComplete="off"
                        />
                      </td>
                      <td className="px-4 py-2 border border-border">
                        <input
                          type="text"
                          value={test.unit}
                          onChange={(e) =>
                            updateUrineAnalysis(key as keyof ClinicalPathologyForm['urineAnalysis'], 'unit', e.target.value)
                          }
                          className="w-full px-2 py-1 border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                          autoComplete="off"
                        />
                      </td>
                      <td className="px-4 py-2 border border-border">
                        <input
                          type="text"
                          value={test.referenceRange}
                          onChange={(e) =>
                            updateUrineAnalysis(key as keyof ClinicalPathologyForm['urineAnalysis'], 'referenceRange', e.target.value)
                          }
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
          onBack={() => window.location.href = '/lab-report/biochemistry-2'}
          onContinue={handleContinue}
          disabled={loading || dataLoading}
        />
      </div>
    </div>
  );
};

export default ClinicalPathology;
