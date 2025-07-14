import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { PrintableForm } from '@/components/PrintableForm';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/FormField';
import { toast } from 'sonner';
import  CommonFormNavigation  from '@/components/CommonFormNavigation';
import { useEmployeeFormFlow } from '@/hooks/useEmployeeFormFlow';

interface SystemicExamItem {
  site: string;
  normal: string;
  abnormal: string;
  remarks: string;
}

interface FemaleVolunteerItem {
  particulars: string;
  remarks: string;
}

interface FormData {
  systemicExam: SystemicExamItem[];
  femaleVolunteer: FemaleVolunteerItem[];
  otherRemarks: string;
  doneBy: string;
}

const initialSystemicExam: SystemicExamItem[] = [
  { site: 'Cardio vascular system', normal: '', abnormal: '', remarks: '' },
  { site: 'ENT and respiratory system', normal: '', abnormal: '', remarks: '' },
  { site: 'Abdominal and genitourinary system', normal: '', abnormal: '', remarks: '' },
  { site: 'Central nervous system', normal: '', abnormal: '', remarks: '' },
  { site: 'Skin and musculoskeletal system', normal: '', abnormal: '', remarks: '' },
];

const initialFemaleVolunteer: FemaleVolunteerItem[] = [
  { particulars: 'Marital Status', remarks: '' },
  { particulars: 'No of Children', remarks: '' },
  { particulars: 'Did you attain menarche', remarks: '' },
  { particulars: 'Menstrual cycle', remarks: '' },
  { particulars: 'Menstrual flow', remarks: '' },
  { particulars: 'Did you attain menopause', remarks: '' },
  { particulars: 'Are you Pregnant', remarks: '' },
  { particulars: 'Are you lactating', remarks: '' },
  { particulars: 'History of sterilization', remarks: '' },
  { particulars: 'Using any contraception', remarks: '' },
  { particulars: 'Is the volunteer under any Hormone replacement Therapy', remarks: '' },
  { particulars: 'History of Others', remarks: '' },
];

const SystemicExaminationPage: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [systemicExam, setSystemicExam] = useState(initialSystemicExam);
  const [femaleVolunteer, setFemaleVolunteer] = useState(initialFemaleVolunteer);
  const [otherRemarks, setOtherRemarks] = useState('');
  const [doneBy, setDoneBy] = useState('');

  const {
    saveLocalAnswers,
    goToForm,
    isFirst,
    isLast,
    sectionIndex,
  } = useEmployeeFormFlow("Systemic Examination");

  useEffect(() => {
    if (caseId) {
      loadExistingData();
    }
  }, [caseId]);

  // Load existing data from localStorage
  useEffect(() => {
    const storedSystemicExam = localStorage.getItem(`systemicExamination_${volunteerId}`);
    if (storedSystemicExam) {
      try {
        const parsedData = JSON.parse(storedSystemicExam);
        if (parsedData.systemicExam) setSystemicExam(parsedData.systemicExam);
        if (parsedData.femaleVolunteer) setFemaleVolunteer(parsedData.femaleVolunteer);
        if (parsedData.otherRemarks) setOtherRemarks(parsedData.otherRemarks);
        if (parsedData.doneBy) setDoneBy(parsedData.doneBy);
      } catch (err) {
        console.error('Error parsing localStorage data:', err);
      }
    }
  }, [volunteerId]);

  const loadExistingData = async () => {
    if (!caseId) return;
    
    try {
      const { data, error } = await supabase
        .from('patient_forms')
        .select('answers')
        .eq('case_id', caseId)
        .eq('template_name', 'Systemic Examination')
        .maybeSingle();

      if (error) {
        console.error('Error loading data:', error);
        return;
      }

      if (data?.answers) {
        const answers = data.answers as unknown as FormData;
        if (answers.systemicExam) setSystemicExam(answers.systemicExam);
        if (answers.femaleVolunteer) setFemaleVolunteer(answers.femaleVolunteer);
        if (answers.otherRemarks) setOtherRemarks(answers.otherRemarks);
        if (answers.doneBy) setDoneBy(answers.doneBy);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading systemic examination:', error);
    }
  };

  // Only one of normal/abnormal per row
  const updateSystemicExam = (index: number, type: 'normal' | 'abnormal', value: string) => {
    setSystemicExam(prev =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (type === 'normal' && value === 'Yes') {
          return { ...item, normal: 'Yes', abnormal: '' };
        } else if (type === 'abnormal' && value === 'Yes') {
          return { ...item, normal: '', abnormal: 'Yes' };
        } else {
          // Unchecking
          return { ...item, [type]: '' };
        }
      })
    );
    setIsSaved(false);
  };

  const updateSystemicExamRemarks = (index: number, value: string) => {
    setSystemicExam(prev => prev.map((item, i) => 
      i === index ? { ...item, remarks: value } : item
    ));
    setIsSaved(false);
  };

  const updateFemaleVolunteer = (index: number, value: string) => {
    setFemaleVolunteer(prev => prev.map((item, i) =>
      i === index ? { ...item, remarks: value } : item
    ));
    setIsSaved(false);
  };

  const handleSaveLocal = async () => {
    const formData: FormData = {
      systemicExam,
      femaleVolunteer, 
      otherRemarks,
      doneBy,
    };
    setLoading(true);
    try {
      await saveLocalAnswers(formData);
      setIsSaved(true);
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: 'Systemic Examination',
          volunteer_id: volunteerId || '',
          status: "submitted",
          data: formData,
        });
        toast.success('Systemic examination saved successfully');
      } catch (apiError) {
        console.warn('Python API submission failed:', apiError);
        toast.success('Systemic examination saved locally');
      }
    } catch {
      toast.error('Failed to save systemic examination locally');
      setIsSaved(false);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    const formData: FormData = {
      systemicExam,
      femaleVolunteer,
      otherRemarks,
      doneBy,
    };
    await saveLocalAnswers(formData);
    setIsSaved(true);
    goToForm(formData, "next");
  };

  const handlePrevious = async () => {
    const formData: FormData = {
      systemicExam,
      femaleVolunteer,
      otherRemarks,
      doneBy,
    };
    await saveLocalAnswers(formData);
    goToForm(formData, "previous");
  };

  return (
    <PrintableForm templateName="Systemic Examination">
      <CommonFormHeader
        title="Systemic Examination"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
      />

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Systemic Examination</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Site</th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium" colSpan={2}>Normal / Abnormal</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {systemicExam.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{item.site}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center" colSpan={2}>
                        <div className="flex justify-center gap-8">
                          <label className="flex flex-col items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`exam-result-${index}`}
                              checked={item.normal === 'Yes'}
                              onChange={() => updateSystemicExam(index, 'normal', 'Yes')}
                              className="w-6 h-6 accent-blue-600"
                            />
                            <span className="text-sm mt-1">Normal</span>
                          </label>
                          <label className="flex flex-col items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`exam-result-${index}`}
                              checked={item.abnormal === 'Yes'}
                              onChange={() => updateSystemicExam(index, 'abnormal', 'Yes')}
                              className="w-6 h-6 accent-blue-600"
                            />
                            <span className="text-sm mt-1">Abnormal</span>
                          </label>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <FormField
                          label=""
                          value={item.remarks}
                          onChange={(value) => updateSystemicExamRemarks(index, value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Other :</h3>
            <FormField
              label=""
              value={otherRemarks}
              onChange={(value) => {
                setOtherRemarks(value);
                setIsSaved(false);
              }}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">For female volunteer</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Srl No.</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Particulars</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {femaleVolunteer.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{item.particulars}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <FormField
                          label=""
                          value={item.remarks}
                          onChange={(value) => updateFemaleVolunteer(index, value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Done by :</h3>
            <FormField
              label=""
              value={doneBy}
              onChange={(value) => {
                setDoneBy(value);
                setIsSaved(false);
              }}
            />
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
    </PrintableForm>
  );
};

export default SystemicExaminationPage;
