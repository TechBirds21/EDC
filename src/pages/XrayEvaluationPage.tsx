import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { PrintableForm } from '@/components/PrintableForm';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/FormField';
import { toast } from 'sonner';
import  CommonFormNavigation  from '@/components/CommonFormNavigation';
import { useEmployeeFormFlow } from '@/hooks/useEmployeeFormFlow';

interface ChestXRayItem {
  description: string;
  normal: boolean;
  abnormal: boolean;
}

interface XRayFormData {
  xrayDoneDate: string;
  xrayType: string;
  chestXRayItems: ChestXRayItem[];
  others: string;
  impression: string;
  abnormalityDetails: string;
  radiologistStamp: string;
  signDate: string;
  internalAssessment: string;
  remarks: string;
  verifiedBy: string;
  xrayValidity: string;
  documentedBy: string;
}

const XrayEvaluationPage: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [formData, setFormData] = useState<XRayFormData>({
    xrayDoneDate: '',
    xrayType: '',
    chestXRayItems: [
      { description: 'The cardio thoracic ratio angle', normal: false, abnormal: false },
      { description: 'The heart size and configuration', normal: false, abnormal: false },
      { description: 'Aortic Arch', normal: false, abnormal: false },
      { description: 'Broncho vascular markings', normal: false, abnormal: false },
      { description: 'Both pulmonary hila are normal in size', normal: false, abnormal: false },
      { description: 'Costophrenic and cardio phrenic recesses', normal: false, abnormal: false },
      { description: 'Dome of diaphragm', normal: false, abnormal: false },
      { description: 'The bone and soft tissue of chest wall', normal: false, abnormal: false },
    ],
    others: '',
    impression: '',
    abnormalityDetails: '',
    radiologistStamp: '',
    signDate: '',
    internalAssessment: '',
    remarks: '',
    verifiedBy: '',
    xrayValidity: '',
    documentedBy: '',
  });

  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const {
    saveLocalAnswers,
    goToForm,
    isFirst,
    isLast,
    sectionIndex,
  } = useEmployeeFormFlow("X-Ray Evaluation");

  useEffect(() => {
    if (caseId) {
      loadExistingData();
    }
  }, [caseId]);

  // Load existing data from localStorage
  useEffect(() => {
    const storedXRayData = localStorage.getItem(`xrayEvaluation_${volunteerId}`);
    if (storedXRayData) {
      try {
        setFormData(JSON.parse(storedXRayData));
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
        .eq('template_name', 'X-Ray Evaluation')
        .maybeSingle();

      if (error) {
        console.error('Error loading data:', error);
        return;
      }

      if (data?.answers) {
        const answers = data.answers as unknown as XRayFormData;
        setFormData(answers);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading X-ray evaluation:', error);
    }
  };

  const updateForm = (field: keyof XRayFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsSaved(false);
  };

  const updateChestXRayItem = (index: number, field: keyof ChestXRayItem, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      chestXRayItems: prev.chestXRayItems.map((item, i) => 
        i === index ? { 
          ...item, 
          [field]: value,
          [field === 'normal' ? 'abnormal' : 'normal']: false 
        } : item
      )
    }));
    setIsSaved(false);
  };

  const handleSaveLocal = async () => {
    setLoading(true);
    try {
      await saveLocalAnswers(formData); 
      setIsSaved(true);
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: 'X-Ray Evaluation',
          volunteer_id: volunteerId || '',
          status: "submitted",
          data: formData,
        });
        toast.success('X-ray evaluation saved successfully');
      } catch (apiError) {
        console.warn('Python API submission failed:', apiError);
        toast.success('X-ray evaluation saved locally');
      }
    } catch {
      toast.error('Failed to save X-ray evaluation locally');
      setIsSaved(false);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    await saveLocalAnswers(formData);
    setIsSaved(true);
    goToForm(formData, "next");
  };

  const handlePrevious = async () => {
    await saveLocalAnswers(formData);
    goToForm(formData, "previous");
  };

  return (
    <PrintableForm templateName="X-Ray Evaluation">
      <CommonFormHeader
        title="X-Ray Evaluation Report"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
      />

      <Card>
        <CardContent className="p-6 space-y-6">
          <FormField
            label="X-ray Done Date"
            type="date"
            value={formData.xrayDoneDate}
            onChange={v => updateForm('xrayDoneDate', v)}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium">X-ray taken:</label>
            <div className="flex gap-6">
              {['Internal', 'External'].map(type => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={type}
                    checked={formData.xrayType === type}
                    onChange={e => updateForm('xrayType', e.target.value)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Chest X-ray PA View</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Description</th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium">Normal</th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium">Abnormal</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.chestXRayItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="border border-gray-300 px-4 py-2">{index + 1}. {item.description}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={item.normal}
                          onChange={e => updateChestXRayItem(index, 'normal', e.target.checked)}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={item.abnormal}
                          onChange={e => updateChestXRayItem(index, 'abnormal', e.target.checked)}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <FormField
            label="Others (if any)"
            value={formData.others}
            onChange={v => updateForm('others', v)}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium">Impression:</label>
            <div className="flex gap-6">
              {['Normal', 'Abnormal'].map(type => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={type}
                    checked={formData.impression === type}
                    onChange={e => updateForm('impression', e.target.value)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <FormField
            label="If any abnormality (specify)"
            value={formData.abnormalityDetails}
            onChange={v => updateForm('abnormalityDetails', v)}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Radiologist stamp"
              value={formData.radiologistStamp}
              onChange={v => updateForm('radiologistStamp', v)}
            />
            <FormField
              label="Sign & Date"
              value={formData.signDate}
              onChange={v => updateForm('signDate', v)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Internal physician assessment:</label>
            <div className="flex gap-6">
              {['Eligible', 'Not eligible'].map(type => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="radio"
                    value={type}
                    checked={formData.internalAssessment === type}
                    onChange={e => updateForm('internalAssessment', e.target.value)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <FormField
            label="Remarks"
            value={formData.remarks}
            onChange={v => updateForm('remarks', v)}
          />

          <FormField
            label="Verified By (Physician sign & date)"
            value={formData.verifiedBy}
            onChange={v => updateForm('verifiedBy', v)}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="X-ray validity till (Date)"
              type="date"
              value={formData.xrayValidity}
              onChange={v => updateForm('xrayValidity', v)}
            />
            <FormField
              label="Documented By (X-ray technician/Designee)"
              value={formData.documentedBy}
              onChange={v => updateForm('documentedBy', v)}
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

export default XrayEvaluationPage;
