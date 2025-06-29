import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { PrintableForm } from '@/components/PrintableForm';
import  CommonFormNavigation  from '@/components/CommonFormNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/FormField';
import { toast } from 'sonner';
import { db } from '@/lib/dexie';
import { useEmployeeFormFlow } from '@/hooks/useEmployeeFormFlow';

interface GeneralExaminationItem {
  site: string;
  yesNo: string;
  remarks: string;
}

interface PhysicalExaminationItem {
  site: string;
  normal: string;
  abnormal: string;
  remarks: string;
}

interface VitalSigns {
  bodyTemperature: string;
  pulseRate: string;
  respirationRate: string;
  bloodPressure: string;
}

interface FormData {
  vitalSigns: VitalSigns;
  mentalStatus: string;
  generalAppearance: string;
  generalExamination: GeneralExaminationItem[];
  physicalExamination: PhysicalExaminationItem[];
}

const yesNoOptions = ['Yes', 'No'];

const initialGeneralExamination: GeneralExaminationItem[] = [
  { site: 'Pallor', yesNo: '', remarks: '' },
  { site: 'Cyanosis', yesNo: '', remarks: '' },
  { site: 'Lymphadenopathy', yesNo: '', remarks: '' },
];

const initialPhysicalExamination: PhysicalExaminationItem[] = [
  { site: 'Head', normal: '', abnormal: '', remarks: '' },
  { site: 'Eyes', normal: '', abnormal: '', remarks: '' },
  { site: 'Ears', normal: '', abnormal: '', remarks: '' },
  { site: 'Nose', normal: '', abnormal: '', remarks: '' },
  { site: 'Throat', normal: '', abnormal: '', remarks: '' },
  { site: 'Neck', normal: '', abnormal: '', remarks: '' },
  { site: 'Chest', normal: '', abnormal: '', remarks: '' },
  { site: 'Musculoskeletal System', normal: '', abnormal: '', remarks: '' },
  { site: 'Upper Extremities', normal: '', abnormal: '', remarks: '' },
  { site: 'Lower Extremities', normal: '', abnormal: '', remarks: '' },
  { site: 'Skin', normal: '', abnormal: '', remarks: '' },
  { site: 'Nails', normal: '', abnormal: '', remarks: '' },
  { site: 'Spinal Cord', normal: '', abnormal: '', remarks: '' },
];

const MedicalExaminationPage: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    bodyTemperature: '',
    pulseRate: '',
    respirationRate: '',
    bloodPressure: '',
  });
  const [mentalStatus, setMentalStatus] = useState('');
  const [generalAppearance, setGeneralAppearance] = useState('');
  const [generalExamination, setGeneralExamination] = useState(initialGeneralExamination);
  const [physicalExamination, setPhysicalExamination] = useState(initialPhysicalExamination);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const {
    saveLocalAnswers,
    goToForm,
    isFirst,
    isLast,
    sectionIndex,
  } = useEmployeeFormFlow("Medical Examination");

  useEffect(() => {
    if (caseId) {
      loadExistingData();
    }
  }, [caseId]);

  // Load existing data from localStorage
  useEffect(() => {
    const storedMedicalExam = localStorage.getItem(`medicalExamination_${volunteerId}`);
    if (storedMedicalExam) {
      try {
        const parsed = JSON.parse(storedMedicalExam);
        if (parsed.vitalSigns) setVitalSigns(parsed.vitalSigns);
        if (parsed.mentalStatus) setMentalStatus(parsed.mentalStatus);
        if (parsed.generalAppearance) setGeneralAppearance(parsed.generalAppearance);
        if (parsed.generalExamination) setGeneralExamination(parsed.generalExamination);
        if (parsed.physicalExamination) setPhysicalExamination(parsed.physicalExamination);
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
        .eq('template_name', 'Medical Examination')
        .maybeSingle();

      if (error) {
        console.error('Error loading data:', error);
        return;
      }

      if (data?.answers) {
        const answers = data.answers as unknown as FormData;
        if (answers.vitalSigns) setVitalSigns(answers.vitalSigns);
        if (answers.mentalStatus) setMentalStatus(answers.mentalStatus);
        if (answers.generalAppearance) setGeneralAppearance(answers.generalAppearance);
        if (answers.generalExamination) setGeneralExamination(answers.generalExamination);
        if (answers.physicalExamination) setPhysicalExamination(answers.physicalExamination);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading medical examination:', error);
    }
  };

  // Table field updates
  const updateGeneralExamination = (index: number, field: keyof GeneralExaminationItem, value: string) => {
    setGeneralExamination(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
    setIsSaved(false);
  };

  const updatePhysicalExamination = (index: number, field: keyof PhysicalExaminationItem, value: string) => {
    setPhysicalExamination(prev => prev.map((item, i) => {
      if (i !== index) return item;
      // Mutually exclusive normal/abnormal
      if (field === 'normal' && value === 'Yes') return { ...item, normal: value, abnormal: 'No' };
      if (field === 'abnormal' && value === 'Yes') return { ...item, abnormal: value, normal: 'No' };
      return { ...item, [field]: value };
    }));
    setIsSaved(false);
  };

  const handleSaveLocal = async () => {
    const answers: FormData = {
      vitalSigns,
      mentalStatus,
      generalAppearance,
      generalExamination,
      physicalExamination,
    };
    setLoading(true);
    try {
      await saveLocalAnswers(answers);
      setIsSaved(true);
      toast.success('Saved locally!');
    } catch {
      toast.error('Failed to save form locally');
      setIsSaved(false);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    const answers: FormData = {
      vitalSigns,
      mentalStatus,
      generalAppearance,
      generalExamination,
      physicalExamination,
    };
    await saveLocalAnswers(answers);
    setIsSaved(true);
    goToForm(answers, "next");
  };

  const handlePrevious = async () => {
    const answers: FormData = {
      vitalSigns,
      mentalStatus,
      generalAppearance,
      generalExamination,
      physicalExamination,
    };
    await saveLocalAnswers(answers);
    goToForm(answers, "previous");
  };

  const renderYesNoRadio = (
    name: string, selectedValue: string, onChange: (value: string) => void, disabled = false
  ) => (
    <div className="flex gap-6 justify-center">
      {yesNoOptions.map(opt => (
        <label key={opt} className="flex flex-col items-center cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={selectedValue === opt}
            onChange={() => onChange(opt)}
            className="w-5 h-5 accent-blue-600"
            disabled={disabled}
          />
          <span className="text-sm mt-1">{opt}</span>
        </label>
      ))}
    </div>
  );

  return (
    <PrintableForm templateName="Medical Examination">
      <CommonFormHeader
        title="Medical Examination"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
      />

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Vital Signs */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Vital Signs</h3>
            <div className="grid grid-cols-4 gap-4">
              <FormField
                label="Body Temperature (°F)"
                type="number"
                step="0.1"
                value={vitalSigns.bodyTemperature}
                onChange={(v) => {
                  setVitalSigns(prev => ({ ...prev, bodyTemperature: v }));
                  setIsSaved(false);
                }}
              />
              <FormField
                label="Pulse rate"
                type="number"
                value={vitalSigns.pulseRate}
                onChange={(v) => {
                  setVitalSigns(prev => ({ ...prev, pulseRate: v }));
                  setIsSaved(false);
                }}
              />
              <FormField
                label="Respiration per minute"
                type="number"
                value={vitalSigns.respirationRate}
                onChange={(v) => {
                  setVitalSigns(prev => ({ ...prev, respirationRate: v }));
                  setIsSaved(false);
                }}
              />
              <FormField
                label="Blood Pressure (mmHg)"
                value={vitalSigns.bloodPressure}
                onChange={(v) => {
                  setVitalSigns(prev => ({ ...prev, bloodPressure: v }));
                  setIsSaved(false);
                }}
              />
            </div>
          </div>

          {/* Mental Status */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Mental Status:</h3>
            <FormField 
              label="Mental Status"
              value={mentalStatus} 
              onChange={(value) => {
                setMentalStatus(value);
                setIsSaved(false);
              }} 
            />
          </div>

          {/* General Appearance */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">General Appearance:</h3>
            <FormField 
              label="General Appearance"
              value={generalAppearance} 
              onChange={(value) => {
                setGeneralAppearance(value);
                setIsSaved(false);
              }} 
            />
          </div>

          {/* General Examination */}
          <div>
            <h3 className="text-lg font-semibold mb-4">General Examination</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Site</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Yes / No</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {generalExamination.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{item.site}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <FormField
                          label=""
                          type="select"
                          options={yesNoOptions}
                          value={item.yesNo}
                          onChange={(v) => updateGeneralExamination(index, 'yesNo', v)}
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <FormField
                          label=""
                          value={item.remarks}
                          onChange={(v) => updateGeneralExamination(index, 'remarks', v)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Physical Examination */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Physical Examination</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Site</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Normal</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Any Abnormality detected</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {physicalExamination.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{item.site}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <FormField
                          label=""
                          type="select"
                          options={yesNoOptions}
                          value={item.normal}
                          onChange={(v) => updatePhysicalExamination(index, 'normal', v)}
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <FormField
                          label=""
                          type="select"
                          options={yesNoOptions}
                          value={item.abnormal}
                          onChange={(v) => updatePhysicalExamination(index, 'abnormal', v)}
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <FormField
                          label=""
                          value={item.remarks}
                          onChange={(v) => updatePhysicalExamination(index, 'remarks', v)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

export default MedicalExaminationPage;
