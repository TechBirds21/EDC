import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { LabReportHeader } from '@/components/LabReportHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/FormField';
import  CommonFormNavigation  from '@/components/CommonFormNavigation';
import { useEmployeeFormFlow } from '@/hooks/useEmployeeFormFlow';
import { toast } from 'sonner';

interface HematologyTest {
  result: string;
  unit: string;
  referenceRange: string;
}

interface HematologyForm {
  tests: {
    hemoglobin: HematologyTest;
    rbcCount: HematologyTest;
    wbcCount: HematologyTest;
    plateletCount: HematologyTest;
    hematocrit: HematologyTest;
    mcv: HematologyTest;
    mch: HematologyTest;
    mchc: HematologyTest;
    neutrophils: HematologyTest;
    lymphocytes: HematologyTest;
    eosinophils: HematologyTest;
    monocytes: HematologyTest;
    basophils: HematologyTest;
  };
}

const initialFormData: HematologyForm = {
  tests: {
    hemoglobin: { result: '', unit: 'g/dL', referenceRange: '11.5 - 16.0' },
    rbcCount: { result: '', unit: 'mil/μL', referenceRange: '3.8 - 4.8' },
    wbcCount: { result: '', unit: 'cells/μL', referenceRange: '4000 - 11000' },
    plateletCount: { result: '', unit: 'lakhs/μL', referenceRange: '1.5 - 4.0' },
    hematocrit: { result: '', unit: '%', referenceRange: '36.0 - 48.0' },
    mcv: { result: '', unit: 'fL', referenceRange: '80 - 100' },
    mch: { result: '', unit: 'pg', referenceRange: '27 - 33' },
    mchc: { result: '', unit: 'g/dL', referenceRange: '32 - 36' },
    neutrophils: { result: '', unit: '%', referenceRange: '40 - 75' },
    lymphocytes: { result: '', unit: '%', referenceRange: '20 - 40' },
    eosinophils: { result: '', unit: '%', referenceRange: '1 - 6' },
    monocytes: { result: '', unit: '%', referenceRange: '2 - 10' },
    basophils: { result: '', unit: '%', referenceRange: '0 - 1' },
  }
};

const HematologyPage: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [labHeaderData, setLabHeaderData] = useState({
    age: '',
    studyNo: studyNumber || '',
    subjectId: '',
    sampleAndSid: '',
    sex: '',
    collectionCentre: '',
    sampleCollectionDate: '',
    registrationDate: '',
    reportDate: ''
  });

  const [formData, setFormData] = useState<HematologyForm>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const {
    saveLocalAnswers,
    goToForm,
    isFirst,
    isLast,
    sectionIndex,
  } = useEmployeeFormFlow("Hematology");

  useEffect(() => {
    // Load saved data from localStorage
    const savedData = localStorage.getItem(`hematology_${volunteerId}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, [volunteerId]);

  const updateLabHeader = (field: string, value: string) => {
    setLabHeaderData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsSaved(false);
  };

  const updateTest = (testName: keyof HematologyForm['tests'], field: keyof HematologyTest, value: string) => {
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
    setIsSaved(false);
  };

  const handleSaveLocal = async () => {
    setLoading(true);
    try {
      mentalStatus, 
      await saveLocalAnswers(answers);
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: 'Hematology',
          volunteer_id: volunteerId || '',
          status: "submitted",
          data: answers,
        });
        toast.success('Hematology data saved successfully');
      } catch (apiError) {
        console.warn('Python API submission failed:', apiError);
        toast.success('Saved locally!');
      }
      toast.success('Hematology data saved locally');
    } catch {
      toast.error('Failed to save hematology data locally');
      setIsSaved(false);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    const answers = { ...formData, labHeaderData };
    await saveLocalAnswers(answers);
    setIsSaved(true);
    goToForm(answers, "next");
  };

  const handlePrevious = async () => {
    const answers = { ...formData, labHeaderData };
    await saveLocalAnswers(answers);
    goToForm(answers, "previous");
  };

  const displayNames: Record<string, string> = {
    hemoglobin: 'Hemoglobin (Hb)',
    rbcCount: 'RBC Count',
    wbcCount: 'WBC Count',
    plateletCount: 'Platelet Count',
    hematocrit: 'Hematocrit (HCT)',
    mcv: 'Mean Corpuscular Volume (MCV)',
    mch: 'Mean Corpuscular Hemoglobin (MCH)',
    mchc: 'Mean Corpuscular Hemoglobin Concentration (MCHC)',
    neutrophils: 'Neutrophils',
    lymphocytes: 'Lymphocytes',
    eosinophils: 'Eosinophils',
    monocytes: 'Monocytes',
    basophils: 'Basophils',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CommonFormHeader
        title="Hematology"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
      />

      <LabReportHeader
        volunteerId={volunteerId || ''}
        formData={labHeaderData}
        onUpdateForm={updateLabHeader}
        disabled={false}
      />

      <Card className="clinical-card">
        <CardHeader>
          <CardTitle>HEMATOLOGY</CardTitle>
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
                <tr className="border-b">
                  <td className="px-4 py-2 border-r font-semibold" colSpan={4}>
                    COMPLETE BLOOD COUNT
                    <div className="text-xs text-gray-500">(Method: Electrical Impedance)</div>
                  </td>
                </tr>
                {Object.entries(formData.tests).map(([testName, test], index) => (
                  <tr key={testName} className="border-t">
                    <td className="px-4 py-2 border-r font-medium">
                      {displayNames[testName]}
                    </td>
                    <td className="px-4 py-2 border-r">
                      <FormField
                        label=""
                        value={test.result}
                        onChange={(val) => updateTest(testName as keyof HematologyForm['tests'], 'result', val)}
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

          <CommonFormNavigation
            onPrevious={handlePrevious}
            onSaveLocal={handleSaveLocal}
            onContinue={handleContinue}
            loading={loading}
            isSaved={isSaved}
            showPrint={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HematologyPage;
