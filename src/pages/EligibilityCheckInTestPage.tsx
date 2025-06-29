
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

const initialPeriodForm = {
  breathAlcoholApplicable: "",
  breathAlcoholResultTime: "",
  breathAlcoholResult: "",
  breathAlcoholDoneBy: "",
  breathAlcoholDoneDate: "",
  urineSampleApplicable: "",
  urineSampleVolume: "",
  urineSampleReceivedTime: "",
  urineSampleReceivedBy: "",
  urineSampleReceivedDate: "",
  urineAlcoholApplicable: "",
  urineAlcoholDropTime: "",
  urineAlcoholResultTime: "",
  urineAlcoholResult: "",
  urineAlcoholDoneBy: "",
  urineAlcoholDoneDate: "",
  urineDrugAbuseApplicable: "",
  urineDrugAbuseDropTime: "",
  urineDrugAbuseResultTime: "",
  urineDrugAbuseResult: "",
  urineDrugAbuseParam: "",
  urineDrugAbuseDoneBy: "",
  urineDrugAbuseDoneDate: "",
  vitalApplicable: "",
  bloodPressure: "",
  pulseRate: "",
  respirationRate: "",
  temperature: "",
  actualTime: "",
  vitalDoneBy: "",
  vitalDoneDate: "",
  eligibleCheckIn: "",
  remarks: "",
  verifiedBy: "",
  verifiedDate: "",
  verifiedTime: "",
  subjectNumber: "",
};

function EligibilityCheckInTestPage() {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [activePeriod, setActivePeriod] = useState('1');
  const [formData, setFormData] = useState(initialPeriodForm);
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
    const localKey = `eligibilityCheckIn_${volunteerId}_period${activePeriod}`;
    const stored = localStorage.getItem(localKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setFormData(data);
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    } else {
      setFormData(initialPeriodForm);
    }
  }, [volunteerId, activePeriod]);

  const loadExistingData = async () => {
    if (!caseId) return;
    
    try {
      const { data, error } = await supabase
        .from('patient_forms')
        .select('answers')
        .eq('case_id', caseId)
        .eq('template_name', `Eligibility Check-In Test Period ${activePeriod}`)
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
      console.error('Error loading eligibility test:', error);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Save to localStorage
      if (volunteerId) {
        const localKey = `eligibilityCheckIn_${volunteerId}_period${activePeriod}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const handlePeriodChange = (newPeriod: string) => {
    // Save current period data first
    if (volunteerId) {
      const localKey = `eligibilityCheckIn_${volunteerId}_period${activePeriod}`;
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
      const localKey = `eligibilityCheckIn_${volunteerId}_period${activePeriod}`;
      localStorage.setItem(localKey, JSON.stringify(formData));

      // Save to database
      const { error } = await supabase
        .from('patient_forms')
        .upsert({
          case_id: caseId,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          template_name: `Eligibility Check-In Test Period ${activePeriod}`,
          answers: formData as any
        });

      if (error) throw error;

      setIsSaved(true);
      toast.success(`Eligibility test for Period ${activePeriod} saved successfully`);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save eligibility test');
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
    
    navigate(`/employee/project/${pid}/screening/bhcg-test?${params.toString()}`);
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
    
    navigate(`/employee/project/${pid}/study-period/depression-scale?${params.toString()}`);
  };

  // Helper Components
  const RadioGroup = ({ label, options, value, onChange, className = "" }: {
    label?: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
  }) => (
    <div className={className}>
      {label && <span className="font-semibold mb-1 block">{label}</span>}
      <div className="flex gap-6">
        {options.map(option => (
          <label key={option} className="inline-flex items-center">
            <input
              type="radio"
              checked={value === option}
              onChange={() => onChange(option)}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const SignatureFieldsGroup = ({ 
    doneBy, 
    doneDate, 
    onDoneByChange, 
    onDoneDateChange 
  }: {
    doneBy: string;
    doneDate: string;
    onDoneByChange: (value: string) => void;
    onDoneDateChange: (value: string) => void;
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Done by (Sign)" value={doneBy} onChange={onDoneByChange} />
      <FormField label="Date" type="date" value={doneDate} onChange={onDoneDateChange} />
    </div>
  );

  return (
    <PrintableForm templateName="Eligibility Check-In Test">
      <CommonFormHeader
        formTitle="Eligibility Tests for Check-In"
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

          {/* Subject Number */}
          <FormField 
            label="Subject No." 
            value={formData.subjectNumber} 
            onChange={v => updateField("subjectNumber", v)} 
          />

          {/* Breath Alcohol Test */}
          <div className="border p-4 rounded space-y-4">
            <h3 className="font-semibold">BREATH ALCOHOL TEST:</h3>
            <RadioGroup
              options={["Applicable", "Not Applicable"]}
              value={formData.breathAlcoholApplicable}
              onChange={v => updateField("breathAlcoholApplicable", v)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Result Time (Hrs)" 
                type="time" 
                value={formData.breathAlcoholResultTime} 
                onChange={v => updateField("breathAlcoholResultTime", v)} 
              />
              <div>
                <label className="font-semibold block mb-1">Test Result</label>
                <div className="flex gap-4">
                  {["Positive", "Negative"].map(val => (
                    <label key={val} className="inline-flex items-center">
                      <input 
                        type="radio" 
                        checked={formData.breathAlcoholResult === val} 
                        onChange={() => updateField("breathAlcoholResult", val)} 
                        className="form-radio h-4 w-4 text-blue-600" 
                      />
                      <span className="ml-2">{val}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <SignatureFieldsGroup 
              doneBy={formData.breathAlcoholDoneBy} 
              doneDate={formData.breathAlcoholDoneDate} 
              onDoneByChange={v => updateField("breathAlcoholDoneBy", v)} 
              onDoneDateChange={v => updateField("breathAlcoholDoneDate", v)} 
            />
          </div>

          {/* Urine Sample Collection */}
          <div className="border p-4 rounded space-y-4">
            <h3 className="font-semibold">URINE SAMPLE COLLECTION:</h3>
            <RadioGroup
              options={["Applicable", "Not Applicable"]}
              value={formData.urineSampleApplicable}
              onChange={v => updateField("urineSampleApplicable", v)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Volume (approx. 15-20 mL)" 
                type="number" 
                value={formData.urineSampleVolume} 
                onChange={v => updateField("urineSampleVolume", v)} 
              />
              <FormField 
                label="Received Time (Hrs)" 
                type="time" 
                value={formData.urineSampleReceivedTime} 
                onChange={v => updateField("urineSampleReceivedTime", v)} 
              />
            </div>
            <SignatureFieldsGroup 
              doneBy={formData.urineSampleReceivedBy} 
              doneDate={formData.urineSampleReceivedDate} 
              onDoneByChange={v => updateField("urineSampleReceivedBy", v)} 
              onDoneDateChange={v => updateField("urineSampleReceivedDate", v)} 
            />
          </div>

          {/* Urine Alcohol Test */}
          <div className="border p-4 rounded space-y-4">
            <h3 className="font-semibold">URINE ALCOHOL TEST:</h3>
            <RadioGroup
              options={["Applicable", "Not Applicable"]}
              value={formData.urineAlcoholApplicable}
              onChange={v => updateField("urineAlcoholApplicable", v)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Urine Dropping Time (Hrs)" 
                type="time" 
                value={formData.urineAlcoholDropTime} 
                onChange={v => updateField("urineAlcoholDropTime", v)} 
              />
              <FormField 
                label="Result Time (end time) (Hrs)" 
                type="time" 
                value={formData.urineAlcoholResultTime} 
                onChange={v => updateField("urineAlcoholResultTime", v)} 
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Test Result</label>
              <div className="flex gap-4">
                {["Positive", "Negative"].map(val => (
                  <label key={val} className="inline-flex items-center">
                    <input 
                      type="radio" 
                      checked={formData.urineAlcoholResult === val} 
                      onChange={() => updateField("urineAlcoholResult", val)} 
                      className="form-radio h-4 w-4 text-blue-600" 
                    />
                    <span className="ml-2">{val}</span>
                  </label>
                ))}
              </div>
            </div>
            <SignatureFieldsGroup 
              doneBy={formData.urineAlcoholDoneBy} 
              doneDate={formData.urineAlcoholDoneDate} 
              onDoneByChange={v => updateField("urineAlcoholDoneBy", v)} 
              onDoneDateChange={v => updateField("urineAlcoholDoneDate", v)} 
            />
          </div>

          {/* Urine Drugs of Abuse Test */}
          <div className="border p-4 rounded space-y-4">
            <h3 className="font-semibold">URINE DRUGS OF ABUSE TEST:</h3>
            <RadioGroup
              options={["Applicable", "Not Applicable"]}
              value={formData.urineDrugAbuseApplicable}
              onChange={v => updateField("urineDrugAbuseApplicable", v)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Urine Dropping Time (Hrs)" 
                type="time" 
                value={formData.urineDrugAbuseDropTime} 
                onChange={v => updateField("urineDrugAbuseDropTime", v)} 
              />
              <FormField 
                label="Result Time (end time) (Hrs)" 
                type="time" 
                value={formData.urineDrugAbuseResultTime} 
                onChange={v => updateField("urineDrugAbuseResultTime", v)} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Parameter (If Positive)" 
                value={formData.urineDrugAbuseParam} 
                onChange={v => updateField("urineDrugAbuseParam", v)} 
              />
              <div>
                <label className="font-semibold block mb-1">Test Result</label>
                <div className="flex gap-4">
                  {["Positive", "Negative"].map(val => (
                    <label key={val} className="inline-flex items-center">
                      <input 
                        type="radio" 
                        checked={formData.urineDrugAbuseResult === val} 
                        onChange={() => updateField("urineDrugAbuseResult", val)} 
                        className="form-radio h-4 w-4 text-blue-600" 
                      />
                      <span className="ml-2">{val}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <SignatureFieldsGroup 
              doneBy={formData.urineDrugAbuseDoneBy} 
              doneDate={formData.urineDrugAbuseDoneDate} 
              onDoneByChange={v => updateField("urineDrugAbuseDoneBy", v)} 
              onDoneDateChange={v => updateField("urineDrugAbuseDoneDate", v)} 
            />
          </div>

          {/* Vital Signs */}
          <div className="border p-4 rounded space-y-4">
            <h3 className="font-semibold">VITAL SIGNS:</h3>
            <RadioGroup
              options={["Applicable", "Not Applicable"]}
              value={formData.vitalApplicable}
              onChange={v => updateField("vitalApplicable", v)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField 
                label="Blood Pressure (mmHg)" 
                value={formData.bloodPressure} 
                onChange={v => updateField("bloodPressure", v)} 
              />
              <FormField 
                label="Pulse Rate (per min)" 
                value={formData.pulseRate} 
                onChange={v => updateField("pulseRate", v)} 
              />
              <FormField 
                label="Respiration Rate (per min)" 
                value={formData.respirationRate} 
                onChange={v => updateField("respirationRate", v)} 
              />
              <FormField 
                label="Temperature (°F)" 
                value={formData.temperature} 
                onChange={v => updateField("temperature", v)} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField 
                label="Actual Time (Hrs)" 
                type="time" 
                value={formData.actualTime} 
                onChange={v => updateField("actualTime", v)} 
              />
              <FormField 
                label="Done by (Sign)" 
                value={formData.vitalDoneBy} 
                onChange={v => updateField("vitalDoneBy", v)} 
              />
              <FormField 
                label="Date" 
                type="date" 
                value={formData.vitalDoneDate} 
                onChange={v => updateField("vitalDoneDate", v)} 
              />
            </div>
          </div>

          {/* Remarks and Eligibility */}
          <div className="space-y-4">
            <RadioGroup
              label="Eligible for check-in:"
              options={["Yes", "No"]}
              value={formData.eligibleCheckIn}
              onChange={v => updateField("eligibleCheckIn", v)}
            />
            <FormField 
              label="Remarks" 
              value={formData.remarks} 
              onChange={v => updateField("remarks", v)} 
            />
          </div>

          {/* Verification */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Verified By</h3>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="Name"
                value={formData.verifiedBy}
                onChange={v => updateField('verifiedBy', v)}
              />
              <FormField
                label="Date"
                type="date"
                value={formData.verifiedDate}
                onChange={v => updateField('verifiedDate', v)}
              />
              <FormField
                label="Time"
                type="time"
                value={formData.verifiedTime}
                onChange={v => updateField('verifiedTime', v)}
              />
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

export default EligibilityCheckInTestPage;
