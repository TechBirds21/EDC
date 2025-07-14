
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { LabReportHeader } from '@/components/LabReportHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/FormField';
import { PathologistFields } from '@/components/PathologistFields';
import { PrintableForm } from '@/components/PrintableForm';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';

interface BiochemistryTest {
  result: string;
  unit: string;
  referenceRange: string;
}

interface ClinicalBiochemistryForm {
  headerData: {
    age: string;
    studyNo: string;
    subjectId: string;
    sampleAndSid: string;
    sex: string;
    collectionCentre: string;
    sampleCollectionDate: string;
    registrationDate: string;
    reportDate: string;
  };
  tests: {
    urea: BiochemistryTest;
    creatinine: BiochemistryTest;
    bilirubinTotal: BiochemistryTest;
    ast: BiochemistryTest;
    alt: BiochemistryTest;
    alp: BiochemistryTest;
    proteinTotal: BiochemistryTest;
    sodium: BiochemistryTest;
    potassium: BiochemistryTest;
    chloride: BiochemistryTest;
  };
  pathologist1: {
    name: string;
    specialty: string;
  };
  pathologist2: {
    name: string;
    specialty: string;
  };
}

const initialFormData: ClinicalBiochemistryForm = {
  headerData: {
    age: '',
    studyNo: '',
    subjectId: '',
    sampleAndSid: '',
    sex: '',
    collectionCentre: '',
    sampleCollectionDate: '',
    registrationDate: '',
    reportDate: ''
  },
  tests: {
    urea: { result: '', unit: 'mg/dL', referenceRange: '16.6 - 48.5' },
    creatinine: { result: '', unit: 'mg/dL', referenceRange: '0.7 - 1.3' },
    bilirubinTotal: { result: '', unit: 'mg/dL', referenceRange: '0.3 - 1.2' },
    ast: { result: '', unit: 'U/L', referenceRange: '≤ 40' },
    alt: { result: '', unit: 'U/L', referenceRange: '≤ 41' },
    alp: { result: '', unit: 'U/L', referenceRange: '40 - 129' },
    proteinTotal: { result: '', unit: 'g/dL', referenceRange: '6.6 - 8.3' },
    sodium: { result: '', unit: 'mmol/L', referenceRange: '136 - 145' },
    potassium: { result: '', unit: 'mmol/L', referenceRange: '3.5 - 5.1' },
    chloride: { result: '', unit: 'mmol/L', referenceRange: '98 - 107' }
  },
  pathologist1: {
    name: '',
    specialty: ''
  },
  pathologist2: {
    name: '',
    specialty: ''
  }
};

const PostStudyClinicalBiochemistryPage: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [formData, setFormData] = useState<ClinicalBiochemistryForm>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (caseId) {
      loadExistingData();
    }
  }, [caseId]);

  // Load from localStorage
  useEffect(() => {
    if (!volunteerId) return;
    const localKey = `postStudyClinicalBiochemistry_${volunteerId}`;
    const stored = localStorage.getItem(localKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setFormData(data);
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    } else {
      setFormData({
        ...initialFormData,
        headerData: {
          ...initialFormData.headerData,
          studyNo: studyNumber || ''
        }
      });
    }
  }, [volunteerId, studyNumber]);

  const loadExistingData = async () => {
    if (!caseId) return;
    
    try {
      const { data, error } = await supabase
        .from('patient_forms')
        .select('answers')
        .eq('case_id', caseId)
        .eq('template_name', 'Post Study Clinical Biochemistry')
        .maybeSingle();

      if (error) {
        console.error('Error loading data:', error);
        return;
      }

      if (data?.answers) {
        const answers = data.answers as unknown as ClinicalBiochemistryForm;
        setFormData(answers);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading clinical biochemistry data:', error);
    }
  };

  const updateHeaderField = (field: string, value: string) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        headerData: {
          ...prev.headerData,
          [field]: value
        }
      };
      
      // Save to localStorage
      if (volunteerId) {
        const localKey = `postStudyClinicalBiochemistry_${volunteerId}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const updateTest = (testName: keyof ClinicalBiochemistryForm['tests'], field: keyof BiochemistryTest, value: string) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        tests: {
          ...prev.tests,
          [testName]: {
            ...prev.tests[testName],
            [field]: value
          }
        }
      };
      
      // Save to localStorage
      if (volunteerId) {
        const localKey = `postStudyClinicalBiochemistry_${volunteerId}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const updatePathologist = (pathologist: 'pathologist1' | 'pathologist2', field: 'name' | 'specialty', value: string) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [pathologist]: {
          ...prev[pathologist],
          [field]: value
        }
      };
      
      // Save to localStorage
      if (volunteerId) {
        const localKey = `postStudyClinicalBiochemistry_${volunteerId}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!caseId || !volunteerId || !studyNumber) {
      toast.error('Missing required information');
      return;
    }

    setLoading(true);
    
    try {
      // Save to localStorage
      const localKey = `postStudyClinicalBiochemistry_${volunteerId}`;
      localStorage.setItem(localKey, JSON.stringify(formData));
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: 'Post Study Clinical Biochemistry',
          volunteer_id: volunteerId,
          status: "submitted",
          data: formData,
        });
        
        setIsSaved(true);
        toast.success('Post study clinical biochemistry saved successfully');
        setLoading(false);
        return;
      } catch (apiError) {
        console.warn('Python API submission failed, falling back to Supabase:', apiError);
      }
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: 'Post Study Clinical Biochemistry',
          volunteer_id: volunteerId,
          status: "submitted",
          data: formData,
        });
        
        setIsSaved(true);
        toast.success('Post study clinical biochemistry saved successfully');
        setLoading(false);
        return;
      } catch (apiError) {
        console.warn('Python API submission failed, falling back to Supabase:', apiError);
      }

      // Save to database
      const { error } = await supabase
        .from('patient_forms')
        .upsert({
          case_id: caseId,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          template_name: 'Post Study Clinical Biochemistry',
          answers: formData as any
        });

      if (error) throw error;

      setIsSaved(true);
      toast.success('Post study clinical biochemistry saved successfully');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save post study clinical biochemistry');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrevious = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    if (volunteerId) params.set('volunteerId', volunteerId);
    if (studyNumber) params.set('studyNumber', studyNumber);
    navigate(`/employee/project/${pid}/post-study/covid-screening?${params.toString()}`);
  };

  const handleNext = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    if (volunteerId) params.set('volunteerId', volunteerId);
    if (studyNumber) params.set('studyNumber', studyNumber);
    navigate(`/employee/project/${pid}/post-study/hematology?${params.toString()}`);
  };

  const displayNames: Record<string, string> = {
    urea: 'Urea',
    creatinine: 'Creatinine',
    bilirubinTotal: 'Bilirubin Total',
    ast: 'Aspartate Aminotransferase (AST/SGOT)',
    alt: 'Alanine Transaminase (ALT/SGPT)',
    alp: 'Alkaline Phosphatase (ALP)',
    proteinTotal: 'Protein Total',
    sodium: 'Sodium',
    potassium: 'Potassium',
    chloride: 'Chloride'
  };

  return (
    <PrintableForm templateName="Post Study Clinical Biochemistry">
      <CommonFormHeader
        formTitle="POST STUDY CLINICAL BIOCHEMISTRY"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
      />

      <div className="no-print flex justify-end mb-4">
        <Button onClick={handlePrint} variant="outline" className="flex items-center space-x-2">
          <Printer className="w-4 h-4" />
          <span>Print Form</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <LabReportHeader
            volunteerId={volunteerId || ''}
            formData={formData.headerData}
            onUpdateForm={updateHeaderField}
            disabled={false}
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
                    <tr className="border-b">
                      <td className="px-4 py-2 border-r font-semibold bg-gray-50" colSpan={4}>
                        BIOCHEMISTRY
                        <div className="text-xs text-gray-500 font-normal">(Method: spectrophotometry)</div>
                      </td>
                    </tr>
                    {Object.entries(formData.tests).map(([testName, test]) => (
                      <tr key={testName} className="border-b">
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

              <PathologistFields
                pathologist1={formData.pathologist1}
                pathologist2={formData.pathologist2}
                onUpdatePathologist={updatePathologist}
                disabled={false}
              />

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 no-print">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className={`${isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {loading ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </PrintableForm>
  );
};

export default PostStudyClinicalBiochemistryPage;
