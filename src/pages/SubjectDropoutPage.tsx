
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/FormField';
import { SignatureFields } from '@/components/SignatureFields';
import { PrintableForm } from '@/components/PrintableForm';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import type { SignatureData } from '@/types/common';

interface DropoutFormData {
  // Header fields
  projectStudyNo: string;
  subjectNo: string;
  periodNo: string;
  date: string;
  
  // Dropout reasons (numbered)
  dropoutReasons: {
    [key: string]: boolean;
  };
  
  // Comments
  comments: string;
  
  // Subject participation in subsequent periods
  subjectEligibleSubsequent: string;
  
  // Compensation recommended
  compensationRecommended: string;
  compensationType: 'sop' | 'protocol' | '';
  
  // Signatures
  doneBySignature: SignatureData;
  checkedBySignature: SignatureData;
}

const dropoutReasonsList = [
  'Did not report for check-in',
  'Others (specify):'
];

const initialFormData: DropoutFormData = {
  projectStudyNo: '',
  subjectNo: '',
  periodNo: '',
  date: '',
  dropoutReasons: {},
  comments: '',
  subjectEligibleSubsequent: '',
  compensationRecommended: '',
  compensationType: '',
  doneBySignature: { name: '', date: '', time: '' },
  checkedBySignature: { name: '', date: '', time: '' }
};

const SubjectDropoutPage: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [formData, setFormData] = useState<DropoutFormData>(initialFormData);
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
    const localKey = `subjectDropout_${volunteerId}`;
    const stored = localStorage.getItem(localKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setFormData(data);
      } catch (error) {
        console.error('Error parsing stored data:', error);
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
        .eq('template_name', 'Subject Dropout')
        .maybeSingle();

      if (error) {
        console.error('Error loading data:', error);
        return;
      }

      if (data?.answers) {
        const answers = data.answers as unknown as DropoutFormData;
        setFormData(answers);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading subject dropout data:', error);
    }
  };

  const updateFormData = (updates: Partial<DropoutFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...updates };
      
      // Save to localStorage
      if (volunteerId) {
        const localKey = `subjectDropout_${volunteerId}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const updateField = (field: keyof DropoutFormData, value: any) => {
    updateFormData({ [field]: value });
  };

  const updateDropoutReason = (index: number, checked: boolean) => {
    const updatedReasons = { ...formData.dropoutReasons };
    updatedReasons[index.toString()] = checked;
    updateFormData({ dropoutReasons: updatedReasons });
  };

  const updateSignature = (field: 'doneBySignature' | 'checkedBySignature', signatureData: SignatureData) => {
    updateFormData({ [field]: signatureData });
  };

  const handleSave = async () => {
    if (!caseId || !volunteerId || !studyNumber) {
      toast.error('Missing required information');
      return;
    }

    setLoading(true);
    
    try {
      // Save to localStorage
      const localKey = `subjectDropout_${volunteerId}`;
      localStorage.setItem(localKey, JSON.stringify(formData));
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: 'Subject Dropout',
          volunteer_id: volunteerId,
          status: "submitted",
          data: formData,
        });
        
        setIsSaved(true);
        toast.success('Subject dropout saved successfully');
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
          template_name: 'Subject Dropout',
          answers: formData as any
        });

      if (error) throw error;

      setIsSaved(true);
      toast.success('Subject dropout saved successfully');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save subject dropout');
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
    navigate(`/employee/project/${pid}/post-study/withdrawal?${params.toString()}`);
  };

  const handleNext = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    if (volunteerId) params.set('volunteerId', volunteerId);
    if (studyNumber) params.set('studyNumber', studyNumber);
    navigate(`/employee/project/${pid}/post-study/repeat-assessment?${params.toString()}`);
  };

  return (
    <PrintableForm templateName="Subject Dropout">
      <CommonFormHeader
        formTitle="SUBJECT DROPOUT FORM"
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
          {/* Header Information Table */}
          <Card className="clinical-card">
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr>
                      <th className="border border-border p-2 text-left">Project/Study No.:</th>
                      <th className="border border-border p-2 text-left">Subject No.:</th>
                      <th className="border border-border p-2 text-left">Period No.:</th>
                      <th className="border border-border p-2 text-left">Date:</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-2">
                        <FormField
                          label=""
                          value={studyNumber || ''}
                          onChange={(value) => updateField('projectStudyNo', value)}
                          disabled={true}
                        />
                      </td>
                      <td className="border border-border p-2">
                        <FormField
                          label=""
                          value={volunteerId || ''}
                          onChange={(value) => updateField('subjectNo', value)}
                          disabled={true}
                        />
                      </td>
                      <td className="border border-border p-2">
                        <FormField
                          label=""
                          value={formData.periodNo}
                          onChange={(value) => updateField('periodNo', value)}
                        />
                      </td>
                      <td className="border border-border p-2">
                        <FormField
                          label=""
                          type="date"
                          value={formData.date}
                          onChange={(value) => updateField('date', value)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Dropout Reasons Table */}
          <Card className="clinical-card">
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr>
                      <th className="border border-border p-2 text-left w-16">Sr. No</th>
                      <th className="border border-border p-2 text-left">Reason</th>
                      <th className="border border-border p-2 text-center w-20">Tick (✓)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dropoutReasonsList.map((reason, index) => (
                      <tr key={index}>
                        <td className="border border-border p-2 text-center">{index + 1}.</td>
                        <td className="border border-border p-2">{reason}</td>
                        <td className="border border-border p-2 text-center">
                          <input
                            type="checkbox"
                            checked={formData.dropoutReasons[index.toString()] || false}
                            onChange={(e) => updateDropoutReason(index, e.target.checked)}
                            className="form-checkbox"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>Comments:</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                label=""
                type="textarea"
                value={formData.comments}
                onChange={(value) => updateField('comments', value)}
                placeholder="Enter comments"
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Subject Participation Question */}
          <Card className="clinical-card">
            <CardContent className="p-4">
              <FormField
                label="Is the subject is eligible to participate in the subsequent Period(s)"
                type="radio"
                value={formData.subjectEligibleSubsequent}
                onChange={(value) => updateField('subjectEligibleSubsequent', value)}
                options={[
                  { label: 'Yes', value: 'Yes' },
                  { label: 'No', value: 'No' },
                  { label: 'NA', value: 'NA' }
                ]}
                className="flex gap-8"
              />
            </CardContent>
          </Card>

          {/* Compensation Section */}
          <Card className="clinical-card">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="font-medium">Compensation recommended tick (✓) the applicable</div>
                <div className="grid grid-cols-1 gap-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="compensation"
                      value="sop"
                      checked={formData.compensationType === 'sop'}
                      onChange={(e) => updateField('compensationType', e.target.checked ? 'sop' : '')}
                      className="form-radio"
                    />
                    <span>As per SOP</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="compensation"
                      value="protocol"
                      checked={formData.compensationType === 'protocol'}
                      onChange={(e) => updateField('compensationType', e.target.checked ? 'protocol' : '')}
                      className="form-radio"
                    />
                    <span>Protocol Recommendation</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signatures */}
          <Card className="clinical-card">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="font-medium mb-2">Done By</div>
                  <div className="text-sm text-gray-600 mb-2">(Sign & Date)</div>
                  <SignatureFields
                    label=""
                    value={formData.doneBySignature}
                    onChange={(signatureData) => updateSignature('doneBySignature', signatureData)}
                    vertical={true}
                  />
                </div>

                <div>
                  <div className="font-medium mb-2">Checked By</div>
                  <div className="text-sm text-gray-600 mb-2">(Sign & Date)</div>
                  <SignatureFields
                    label=""
                    value={formData.checkedBySignature}
                    onChange={(signatureData) => updateSignature('checkedBySignature', signatureData)}
                    vertical={true}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
    </PrintableForm>
  );
};

export default SubjectDropoutPage;
