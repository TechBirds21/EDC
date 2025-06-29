import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import  CommonFormHeader  from "@/components/CommonFormHeader";
import { FormField } from "@/components/FormField";
import { PrintableForm } from '@/components/PrintableForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronLeft, Printer } from 'lucide-react';

const initialFormData = {
  subjectNumber: '',
  studyTitle: 'Gabapentin enacarbil extended-release tablets 600 mg Fed BE Study',
  protocolNumber: '',
  protocolVersion: '',
  crfVersion: '',
  crfDate: '',
  clinicalFacility: '',
  principalInvestigator: '',
  status: {
    completed: false,
    adverse: false,
    withdrawn: false,
    dropout: false,
    underFollow: false,
    lost: false,
    terminated: false,
  },
  withdrawalDate: '',
  withdrawalReason: '',
  lostToFollowUpDate: '',
  comments: '',
  investigatorDeclaration: false,
  investigatorName: '',
  investigatorDate: '',
  investigatorTime: ''
};

function StudyCaseReportPage() {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [activePeriod, setActivePeriod] = useState('1');
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load data for current period
  useEffect(() => {
    if (caseId) {
      loadExistingData();
    }
  }, [caseId, activePeriod]);

  // Load from localStorage on period change
  useEffect(() => {
    if (!volunteerId) return;
    const localKey = `studyCaseReport_${volunteerId}_period${activePeriod}`;
    const stored = localStorage.getItem(localKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setFormData(data);
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    } else {
      setFormData(initialFormData);
    }
  }, [volunteerId, activePeriod]);

  const loadExistingData = async () => {
    if (!caseId) return;
    
    try {
      const { data, error } = await supabase
        .from('patient_forms')
        .select('answers')
        .eq('case_id', caseId)
        .eq('template_name', `Study Case Report Period ${activePeriod}`)
        .maybeSingle(); 

      if (error) {
        console.error('Error loading data:', error);
        return;
      }

      if (data?.answers) {
        const answers = data.answers as any;
        setFormData(answers);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading case report:', error);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Save to localStorage
      if (volunteerId) {
        const localKey = `studyCaseReport_${volunteerId}_period${activePeriod}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const handleStatusChange = (key: string) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        status: { 
          ...prev.status, 
          [key]: !prev.status[key as keyof typeof prev.status] 
        }
      };

      // Save to localStorage
      if (volunteerId) {
        const localKey = `studyCaseReport_${volunteerId}_period${activePeriod}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }

      return updated;
    });
    setIsSaved(false);
  };

  const handlePeriodChange = (newPeriod: string) => {
    // Save current period data first
    if (volunteerId) {
      const localKey = `studyCaseReport_${volunteerId}_period${activePeriod}`;
      localStorage.setItem(localKey, JSON.stringify(formData));
    }
    
    setActivePeriod(newPeriod);
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
      const localKey = `studyCaseReport_${volunteerId}_period${activePeriod}`;
      localStorage.setItem(localKey, JSON.stringify(formData));
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: `Study Case Report Period ${activePeriod}`,
          volunteer_id: volunteerId,
          status: "submitted",
          data: formData,
        });
        
        setIsSaved(true);
        toast.success(`Study case report for Period ${activePeriod} saved successfully`);
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
          template_name: `Study Case Report Period ${activePeriod}`,
          answers: formData as any
        });

      if (error) throw error;

      setIsSaved(true);
      toast.success(`Study case report for Period ${activePeriod} saved successfully`);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save study case report');
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
    
    navigate(`/employee/project/${pid}/study-period/inclusion-criteria?${params.toString()}`);
  };

  const handleContinue = async () => {
    if (!isSaved) {
      toast.error('Please save the form before continuing');
      return;
    }

    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    if (volunteerId) params.set('volunteerId', volunteerId);
    if (studyNumber) params.set('studyNumber', studyNumber);
    
    navigate(`/employee/project/${pid}/study-period/check-in?${params.toString()}`);
  };

  return (
    <PrintableForm templateName="Study Case Report Form">
      <CommonFormHeader
        formTitle="STUDY CASE REPORT FORM"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
      />

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Period Selection */}
          <div className="border-b pb-4">
            <FormField
              label="Study Period"
              type="select"
              value={activePeriod}
              onChange={handlePeriodChange}
              options={['1', '2']}
            />
          </div>

          {/* Study Details Section */}
          <div className="bg-white rounded-lg border border-gray-300 p-4 space-y-4">
            <FormField
              label="Subject Number"
              value={formData.subjectNumber}
              onChange={v => updateField('subjectNumber', v)}
            />

            <FormField
              label="Study Title"
              value={formData.studyTitle}
              onChange={v => updateField('studyTitle', v)}
              type="textarea"
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Protocol Number"
                value={formData.protocolNumber}
                onChange={v => updateField('protocolNumber', v)}
              />
              <FormField
                label="Protocol Version No."
                value={formData.protocolVersion}
                onChange={v => updateField('protocolVersion', v)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="CRF Version No."
                value={formData.crfVersion}
                onChange={v => updateField('crfVersion', v)}
              />
              <FormField
                label="CRF Date"
                type="date"
                value={formData.crfDate}
                onChange={v => updateField('crfDate', v)}
              />
            </div>

            <FormField
              label="Clinical Facility Address"
              value={formData.clinicalFacility}
              onChange={v => updateField('clinicalFacility', v)}
              type="textarea"
            />

            <FormField
              label="Principal Investigator"
              value={formData.principalInvestigator}
              onChange={v => updateField('principalInvestigator', v)}
            />
          </div>

          {/* Period Completion Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
            <h3 className="font-bold text-lg text-center mb-4 uppercase">
              To be filled after completion of period
            </h3>

            {/* Investigator Declaration */}
            <div className="mb-6 bg-white p-4 rounded border border-gray-200">
              <div className="flex items-start gap-2 mb-4">
                <input
                  type="checkbox"
                  id="declaration"
                  checked={formData.investigatorDeclaration}
                  onChange={(e) => updateField('investigatorDeclaration', e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="declaration" className="text-sm leading-tight">
                  I confirm that data recorded in this case report form is complete, accurate and verified for the correctness of data recorded.
                  I confirm that the study was conducted in accordance with the GCP, approved protocol and applicable Standard Operating Procedures (SOPs) of Clians Labs Pvt Ltd.
                  Written informed consent was obtained from the Participant prior to the study.
                </label>
              </div>
            </div>

            {/* Participation Status */}
            <div className="bg-white p-4 rounded border border-gray-200 mb-4">
              <h4 className="font-semibold mb-3">Status of the Participant:</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["completed", "Completed"],
                  ["adverse", "Any Adverse event(s) recorded"],
                  ["withdrawn", "Withdrawn"],
                  ["dropout", "Drop-out"],
                  ["underFollow", "Under Follow-Up"],
                  ["lost", "Lost to Follow up"],
                  ["terminated", "Study terminated"]
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.status[key as keyof typeof formData.status]}
                      onChange={() => handleStatusChange(key)}
                      className="form-checkbox h-4 w-4 text-primary-600 rounded"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4 bg-white p-4 rounded border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Date of withdrawal/drop-out"
                  type="date"
                  value={formData.withdrawalDate}
                  onChange={v => updateField('withdrawalDate', v)}
                />
                <FormField
                  label="Date of lost to follow up"
                  type="date"
                  value={formData.lostToFollowUpDate}
                  onChange={v => updateField('lostToFollowUpDate', v)}
                />
              </div>

              <FormField
                label="Reason for withdrawal/drop-out/follow-up"
                value={formData.withdrawalReason}
                onChange={v => updateField('withdrawalReason', v)}
                type="textarea"
              />

              <FormField
                label="Comments (if any)"
                value={formData.comments}
                onChange={v => updateField('comments', v)}
                type="textarea"
              />

              {/* Investigator Signature */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Investigator's Signature & Date</h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    label="Name"
                    value={formData.investigatorName}
                    onChange={v => updateField('investigatorName', v)}
                  />
                  <FormField
                    label="Date"
                    type="date"
                    value={formData.investigatorDate}
                    onChange={v => updateField('investigatorDate', v)}
                  />
                  <FormField
                    label="Time"
                    type="time"
                    value={formData.investigatorTime}
                    onChange={v => updateField('investigatorTime', v)}
                  />
                </div>
              </div>
            </div>
          </div>

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
                variant="outline"
                onClick={handlePrint}
                className="flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </Button>
              
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
                onClick={handleContinue}
                disabled={!isSaved}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                Continue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PrintableForm>
  );
}

export default StudyCaseReportPage;