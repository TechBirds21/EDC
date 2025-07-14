
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import CommonFormHeader from '@/components/CommonFormHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/FormField';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PeriodNavigation } from '@/components/PeriodNavigation';
import { usePeriodForm } from '@/hooks/usePeriodForm';
import { useVolunteer } from '@/context/VolunteerContext';

interface BiochemistryTest {
  result: string;
  unit: string;
  referenceRange: string;
}

interface ClinicalBiochemistryForm {
  tests: {
    urea: BiochemistryTest;
    creatinine: BiochemistryTest;
    uricAcid: BiochemistryTest;
    bilirubinTotal: BiochemistryTest;
    ast: BiochemistryTest;
    alt: BiochemistryTest;
    alp: BiochemistryTest;
    proteinTotal: BiochemistryTest;
    albumin: BiochemistryTest;
    cholesterolTotal: BiochemistryTest;
    sodium: BiochemistryTest;
    potassium: BiochemistryTest;
    chloride: BiochemistryTest;
  };
}

const initialFormData: ClinicalBiochemistryForm = {
  tests: {
    urea: { result: '', unit: 'mg/dL', referenceRange: '16.6 - 48.5' },
    creatinine: { result: '', unit: 'mg/dL', referenceRange: '0.7 - 1.3' },
    uricAcid: { result: '', unit: 'mg/dL', referenceRange: '3.4 - 7.0' },
    bilirubinTotal: { result: '', unit: 'mg/dL', referenceRange: '0.3 - 1.2' },
    ast: { result: '', unit: 'U/L', referenceRange: '≤ 40' },
    alt: { result: '', unit: 'U/L', referenceRange: '≤ 41' },
    alp: { result: '', unit: 'U/L', referenceRange: '40 - 129' },
    proteinTotal: { result: '', unit: 'g/dL', referenceRange: '6.6 - 8.3' },
    albumin: { result: '', unit: 'g/dL', referenceRange: '3.5 - 5.2' },
    cholesterolTotal: { result: '', unit: 'mg/dL', referenceRange: '< 200' },
    sodium: { result: '', unit: 'mmol/L', referenceRange: '136 - 145' },
    potassium: { result: '', unit: 'mmol/L', referenceRange: '3.5 - 5.1' },
    chloride: { result: '', unit: 'mmol/L', referenceRange: '98 - 107' },
  }
};

const ClinicalBiochemistry2Page: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { volunteerData } = useVolunteer();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const period = parseInt(searchParams.get('period') || '1');

  // Use period-based form management
  const {
    formData,
    setFormData,
    currentPeriod,
    savePeriodData,
    switchPeriod,
    getSavedPeriods,
    hasPeriodData,
    isLoading,
    isSaved
  } = usePeriodForm({
    formType: 'clinical_biochemistry_2',
    initialData: initialFormData,
    period
  });

  const updateTest = (testName: keyof ClinicalBiochemistryForm['tests'], field: keyof BiochemistryTest, value: string) => {
    setFormData(prev => ({
      ...prev,
      tests: {
        ...prev.tests,
        [testName]: {
          ...prev.tests[testName],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      await savePeriodData({
        ...formData,
        period: currentPeriod
      });
      console.log(`Saved Clinical Biochemistry 2 data for period ${currentPeriod}`);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handlePeriodChange = (newPeriod: number) => {
    switchPeriod(newPeriod);
    // Update URL to reflect the new period
    const params = new URLSearchParams(location.search);
    params.set('period', newPeriod.toString());
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handlePrevious = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    params.set('period', currentPeriod.toString());
    navigate(`/employee/project/${pid}/lab-reports/biochemistry-1?${params.toString()}`);
  };

  const handleNext = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    params.set('period', currentPeriod.toString());
    navigate(`/employee/project/${pid}/lab-reports/pathology?${params.toString()}`);
  };

  const displayNames: Record<string, string> = {
    urea: 'Urea',
    creatinine: 'Creatinine',
    uricAcid: 'Uric Acid',
    bilirubinTotal: 'Bilirubin Total',
    ast: 'Aspartate Aminotransferase(AST/SGOT)',
    alt: 'Alanine Transaminase (ALT/SGPT)',
    alp: 'Alkaline Phosphatase (ALP)',
    proteinTotal: 'Protein Total',
    albumin: 'Albumin',
    cholesterolTotal: 'Cholesterol-Total',
    sodium: 'Sodium',
    potassium: 'Potassium',
    chloride: 'Chloride',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CommonFormHeader
        title="Clinical Biochemistry (Part 2)"
        volunteerId={volunteerData?.volunteerId}
        studyNumber={volunteerData?.studyNumber}
        caseId={caseId}
      />

      <PeriodNavigation
        currentPeriod={currentPeriod}
        onPeriodChange={handlePeriodChange}
        savedPeriods={getSavedPeriods()}
        hasPeriodData={hasPeriodData}
      />

      <Card className="clinical-card">
        <CardHeader>
          <CardTitle>CLINICAL BIOCHEMISTRY</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left border-r">Parameter</th>
                  <th className="px-4 py-2 text-left border-r">Result</th>
                  <th className="px-4 py-2 text-left border-r">Unit</th>
                  <th className="px-4 py-2 text-left">Reference Range</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(formData.tests).map(([testName, test], index) => (
                  <tr key={testName} className="border-t">
                    <td className="px-4 py-2 border-r font-medium">
                      {displayNames[testName]}
                    </td>
                    <td className="px-4 py-2 border-r">
                      <FormField
                        label=""
                        value={test.result}
                        onChange={(val) => updateTest(testName as keyof ClinicalBiochemistryForm['tests'], 'result', val)}
                        placeholder="Enter result"
                      />
                    </td>
                    <td className="px-4 py-2 border-r">
                      {test.unit}
                    </td>
                    <td className="px-4 py-2">
                      {test.referenceRange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="space-x-4">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicalBiochemistry2Page;
