
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/FormField';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [formData, setFormData] = useState<ClinicalBiochemistryForm>(initialFormData);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      localStorage.setItem(`biochemistry2_${volunteerId}`, JSON.stringify(formData)); 
      console.log('Saved biochemistry data to localStorage');
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: 'Clinical Biochemistry 2',
          volunteer_id: volunteerId || '',
          status: "submitted",
          data: formData,
        });
        
        setIsSaved(true);
        toast.success('Clinical biochemistry data saved successfully');
        setLoading(false);
        return;
      } catch (apiError) {
        console.warn('Python API submission failed:', apiError);
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    if (volunteerId) params.set('volunteerId', volunteerId);
    if (studyNumber) params.set('studyNumber', studyNumber);
    navigate(`/employee/project/${pid}/lab-reports/biochemistry-1?${params.toString()}`);
  };

  const handleNext = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    if (volunteerId) params.set('volunteerId', volunteerId);
    if (studyNumber) params.set('studyNumber', studyNumber);
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
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
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
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
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
