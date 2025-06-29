
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

interface WithdrawalFormData {
  // In-house and Washout
  inHouse: boolean;
  washout: boolean;
  
  // Date and time of withdrawal
  dateOfWithdrawal: string;
  timeOfWithdrawal: string;
  
  // Withdrawal reasons (numbered 1-16)
  withdrawalReasons: {
    [key: string]: boolean;
  };
  
  // Decision fields
  decisionByPi: string;
  decisionByQa: string;
  attendingPhysician: string;
  naDecision: string;
  
  // Case withdrawal discussion
  caseWithdrawalDiscussed: string;
  physicianDiscussedWith: string;
  
  // Subject participation
  subjectParticipateSubsequent: string;
  
  // Compensation
  compensationRecommended: string;
  sopProtocolRecommendation: string;
  ecRecommendation: string;
  
  // SAE Related fields
  anyInstanceClaimProcessRequired: string;
  informedToSponsorSAE: string;
  informedToECSAE: string;
  
  // Withdrawal reason text
  reasonForVoluntaryWithdrawal: string;
  
  // Subject signature and date
  subjectSignature: SignatureData;
  
  // Comments
  comments: string;
  
  // Done by and Checked by signatures
  doneBySignature: SignatureData;
  checkedBySignature: SignatureData;
}

const withdrawalReasonsList = [
  'Subject found positive in urine alcohol test',
  'Subject found positive in Breath alcohol test',
  'Subject found positive in urine for drugs of abuse test',
  'Abnormal vitals',
  'Although subject has not consumed high fat/high caloric meal served prior to dosing as per protocol',
  'Any subject experience emesis at or before reported two times of median Tmax or within dosing interval as per the protocol',
  'Subject is suffering from adverse event',
  'Subject is voluntarily withdrawn from the study',
  'Failure to comply the requirement of the protocol',
  'Any subject who requires unacceptable concomitant medication',
  'Erroneous inclusion in the study',
  'If it is felt by investigator that it is not in the subject\'s best interest to continue',
  'Positive in serum/urine pregnancy test (for female subjects)',
  'Subject is non-cooperative with the staff',
  'If the subject misbehaves during the study',
  'Others (specify):'
];

const initialFormData: WithdrawalFormData = {
  inHouse: false,
  washout: false,
  dateOfWithdrawal: '',
  timeOfWithdrawal: '',
  withdrawalReasons: {},
  decisionByPi: '',
  decisionByQa: '',
  attendingPhysician: '',
  naDecision: '',
  caseWithdrawalDiscussed: '',
  physicianDiscussedWith: '',
  subjectParticipateSubsequent: '',
  compensationRecommended: '',
  sopProtocolRecommendation: '',
  ecRecommendation: '',
  anyInstanceClaimProcessRequired: '',
  informedToSponsorSAE: '',
  informedToECSAE: '',
  reasonForVoluntaryWithdrawal: '',
  subjectSignature: { name: '', date: '', time: '' },
  comments: '',
  doneBySignature: { name: '', date: '', time: '' },
  checkedBySignature: { name: '', date: '', time: '' }
};

const SubjectWithdrawalPage: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [formData, setFormData] = useState<WithdrawalFormData>(initialFormData);
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
    const localKey = `subjectWithdrawal_${volunteerId}`;
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
        .eq('template_name', 'Subject Withdrawal')
        .maybeSingle();

      if (error) {
        console.error('Error loading data:', error);
        return;
      }

      if (data?.answers) {
        const answers = data.answers as unknown as WithdrawalFormData;
        setFormData(answers);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading subject withdrawal data:', error);
    }
  };

  const updateFormData = (updates: Partial<WithdrawalFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...updates };
      
      // Save to localStorage
      if (volunteerId) {
        const localKey = `subjectWithdrawal_${volunteerId}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const updateField = (field: keyof WithdrawalFormData, value: any) => {
    updateFormData({ [field]: value });
  };

  const updateWithdrawalReason = (index: number, checked: boolean) => {
    const updatedReasons = { ...formData.withdrawalReasons };
    updatedReasons[index.toString()] = checked;
    updateFormData({ withdrawalReasons: updatedReasons });
  };

  const updateSignature = (field: 'subjectSignature' | 'doneBySignature' | 'checkedBySignature', signatureData: SignatureData) => {
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
      const localKey = `subjectWithdrawal_${volunteerId}`;
      localStorage.setItem(localKey, JSON.stringify(formData));
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: 'Subject Withdrawal',
          volunteer_id: volunteerId,
          status: "submitted",
          data: formData,
        });
        
        setIsSaved(true);
        toast.success('Subject withdrawal saved successfully');
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
          template_name: 'Subject Withdrawal',
          answers: formData as any
        });

      if (error) throw error;

      setIsSaved(true);
      toast.success('Subject withdrawal saved successfully');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save subject withdrawal');
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
    navigate(`/employee/project/${pid}/post-study/any-other-information?${params.toString()}`);
  };

  const handleNext = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    if (volunteerId) params.set('volunteerId', volunteerId);
    if (studyNumber) params.set('studyNumber', studyNumber);
    navigate(`/employee/project/${pid}/post-study/dropout?${params.toString()}`);
  };

  return (
    <PrintableForm templateName="Subject Withdrawal">
      <CommonFormHeader
        formTitle="SUBJECT WITHDRAWAL FORM"
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
          {/* In-house/Washout Section */}
          <Card className="clinical-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-8">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.inHouse}
                    onChange={(e) => updateField('inHouse', e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>In-house</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.washout}
                    onChange={(e) => updateField('washout', e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>Washout</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Date and Time of Withdrawal */}
          <Card className="clinical-card">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Date of withdrawal:"
                  type="date"
                  value={formData.dateOfWithdrawal}
                  onChange={(value) => updateField('dateOfWithdrawal', value)}
                />
                <FormField
                  label="Time of withdrawal:"
                  type="time"
                  value={formData.timeOfWithdrawal}
                  onChange={(value) => updateField('timeOfWithdrawal', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal Reasons Table */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>Withdrawal Reasons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr>
                      <th className="border border-border p-2 text-left w-16">Sr. No.</th>
                      <th className="border border-border p-2 text-left">Reason</th>
                      <th className="border border-border p-2 text-center w-20">Tick (✓)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawalReasonsList.map((reason, index) => (
                      <tr key={index}>
                        <td className="border border-border p-2 text-center">{index + 1}</td>
                        <td className="border border-border p-2">{reason}</td>
                        <td className="border border-border p-2 text-center">
                          <input
                            type="checkbox"
                            checked={formData.withdrawalReasons[index.toString()] || false}
                            onChange={(e) => updateWithdrawalReason(index, e.target.checked)}
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

          {/* Decision Section */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>Decision of Subject withdrawal taken by:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  label="PI"
                  type="radio"
                  value={formData.decisionByPi}
                  onChange={(value) => updateField('decisionByPi', value)}
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' }
                  ]}
                />
                <FormField
                  label="QA"
                  type="radio"
                  value={formData.decisionByQa}
                  onChange={(value) => updateField('decisionByQa', value)}
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' }
                  ]}
                />
                <FormField
                  label="Attending Physician"
                  type="radio"
                  value={formData.attendingPhysician}
                  onChange={(value) => updateField('attendingPhysician', value)}
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' }
                  ]}
                />
                <FormField
                  label="NA"
                  type="radio"
                  value={formData.naDecision}
                  onChange={(value) => updateField('naDecision', value)}
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' }
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Case Withdrawal Discussion */}
          <Card className="clinical-card">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  label="In case, withdrawal decision taken by physician discussed with PI prior to withdrawal?"
                  type="radio"
                  value={formData.caseWithdrawalDiscussed}
                  onChange={(value) => updateField('caseWithdrawalDiscussed', value)}
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' },
                    { label: 'NA', value: 'NA' }
                  ]}
                />
                <FormField
                  label="Reason for withdrawal is informed to the subject"
                  type="radio"
                  value={formData.subjectParticipateSubsequent}
                  onChange={(value) => updateField('subjectParticipateSubsequent', value)}
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' },
                    { label: 'NA', value: 'NA' }
                  ]}
                />
                <FormField
                  label="The subject is able to participate in the subsequent Period(s)"
                  type="radio"
                  value={formData.physicianDiscussedWith}
                  onChange={(value) => updateField('physicianDiscussedWith', value)}
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' },
                    { label: 'NA', value: 'NA' }
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Compensation Section */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>Compensation recommended tick (✓) the applicable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="compensation"
                    value="sop"
                    checked={formData.sopProtocolRecommendation === 'selected'}
                    onChange={(e) => updateField('sopProtocolRecommendation', e.target.checked ? 'selected' : '')}
                    className="form-radio"
                  />
                  <span>As per SOP/Protocol Recommendation</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="compensation"
                    value="ec"
                    checked={formData.ecRecommendation === 'selected'}
                    onChange={(e) => updateField('ecRecommendation', e.target.checked ? 'selected' : '')}
                    className="form-radio"
                  />
                  <span>As per EC Recommendation (in case of SAE only)</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* SAE Related Questions */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>SAE Related Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Any insurance claim process required (In case of SAE only)"
                type="radio"
                value={formData.anyInstanceClaimProcessRequired}
                onChange={(value) => updateField('anyInstanceClaimProcessRequired', value)}
                options={[
                  { label: 'YES', value: 'YES' },
                  { label: 'No', value: 'No' },
                  { label: 'NA', value: 'NA' }
                ]}
                className="grid grid-cols-3 gap-4"
              />

              <FormField
                label="Informed to Sponsor (in case of SAE only)"
                type="radio"
                value={formData.informedToSponsorSAE}
                onChange={(value) => updateField('informedToSponsorSAE', value)}
                options={[
                  { label: 'YES', value: 'YES' },
                  { label: 'No', value: 'No' },
                  { label: 'NA', value: 'NA' }
                ]}
                className="grid grid-cols-3 gap-4"
              />

              <FormField
                label="Informed to EC (in case of SAE only)"
                type="radio"
                value={formData.informedToECSAE}
                onChange={(value) => updateField('informedToECSAE', value)}
                options={[
                  { label: 'YES', value: 'YES' },
                  { label: 'No', value: 'No' },
                  { label: 'NA', value: 'NA' }
                ]}
                className="grid grid-cols-3 gap-4"
              />

              <div className="text-sm text-gray-600 mt-2">
                <p>Note: Sponsor and IRB/IEC will be notified for the reason of the subject withdrawal/dropout in the optional update and EC periodic review reports respectively through CRF. (Tick (✓) if the appropriate)</p>
              </div>
            </CardContent>
          </Card>

          {/* Voluntary Withdrawal Reason */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>To be filled by the subject if voluntarily withdrawn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Reason for voluntarily withdrawn:"
                type="textarea"
                value={formData.reasonForVoluntaryWithdrawal}
                onChange={(value) => updateField('reasonForVoluntaryWithdrawal', value)}
                placeholder="Enter reason for voluntary withdrawal"
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>

          {/* Subject Signature */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>Subject (Sign & Date):</CardTitle>
            </CardHeader>
            <CardContent>
              <SignatureFields
                label=""
                value={formData.subjectSignature}
                onChange={(signatureData) => updateSignature('subjectSignature', signatureData)}
              />
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

          {/* Signatures */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>Signatures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SignatureFields
                    label="Done By:"
                    value={formData.doneBySignature}
                    onChange={(signatureData) => updateSignature('doneBySignature', signatureData)}
                  />
                  <div className="text-sm text-gray-600 mt-1">(Sign & Date)</div>
                </div>

                <div>
                  <SignatureFields
                    label="Checked by:"
                    value={formData.checkedBySignature}
                    onChange={(signatureData) => updateSignature('checkedBySignature', signatureData)}
                  />
                  <div className="text-sm text-gray-600 mt-1">(Sign & Date)</div>
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

export default SubjectWithdrawalPage;
