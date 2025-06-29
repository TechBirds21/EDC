
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { FormField } from '@/components/FormField';
import { PrintableForm } from '@/components/PrintableForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';

interface FormData {
  inclusionExclusionCompleted: string;
  exclusionCriteriaCompleted: string;
  friskingPerformed: string;
  allottedSubjectNumber: string;
  clinicalPharmacologyUnit: string;
  idCardIssued: string;
  subjectWristBandIssued: string;
  allottedBedNumber: string;
  dateOfCheckIn: string;
  timeOfCheckIn: string;
  subjectSignDate: string;
  comments: string;
  doneBySignDate: string;
  reviewedBySignDate: string;
}

const initialFormData: FormData = {
  inclusionExclusionCompleted: '',
  exclusionCriteriaCompleted: '',
  friskingPerformed: '',
  allottedSubjectNumber: '',
  clinicalPharmacologyUnit: '',
  idCardIssued: '',
  subjectWristBandIssued: '',
  allottedBedNumber: '',
  dateOfCheckIn: '',
  timeOfCheckIn: '',
  subjectSignDate: '',
  comments: '',
  doneBySignDate: '',
  reviewedBySignDate: ''
};

const SubjectCheckInPage: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [activePeriod, setActivePeriod] = useState('1');
  const [formData, setFormData] = useState<FormData>(initialFormData);
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
    const localKey = `subjectCheckIn_${volunteerId}_period${activePeriod}`;
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
        .eq('template_name', `Subject Check-In Period ${activePeriod}`)
        .maybeSingle();

      if (error) {
        console.error('Error loading data:', error);
        return;
      }

      if (data?.answers) {
        const answers = data.answers as unknown as FormData;
        setFormData(answers);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading check-in data:', error);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Save to localStorage
      if (volunteerId) {
        const localKey = `subjectCheckIn_${volunteerId}_period${activePeriod}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const handlePeriodChange = (newPeriod: string) => {
    // Save current period data first
    if (volunteerId) {
      const localKey = `subjectCheckIn_${volunteerId}_period${activePeriod}`;
      localStorage.setItem(localKey, JSON.stringify(formData));
    }
    
    setActivePeriod(newPeriod);
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!caseId || !volunteerId || !studyNumber) {
      toast.error('Missing required information');
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: `Subject Check-In Period ${period}`,
          volunteer_id: volunteerId || '',
          status: "submitted",
          data: { ...formData, period },
        });
        
        alert('Form saved successfully!');
        return;
      } catch (apiError) {
        console.warn('Python API submission failed, falling back to Supabase:', apiError);
      }
      
      return;
    }

    setLoading(true);
    
    try {
      // Save to localStorage
      const localKey = `subjectCheckIn_${volunteerId}_period${activePeriod}`;
      localStorage.setItem(localKey, JSON.stringify(formData));

      // Save to database
      const { error } = await supabase
        .from('patient_forms')
        .upsert({
          case_id: caseId,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          template_name: `Subject Check-In Period ${activePeriod}`,
          answers: formData as any
        });

      if (error) throw error;

      setIsSaved(true);
      toast.success(`Subject check-in for Period ${activePeriod} saved successfully`);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save subject check-in');
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
    
    navigate(`/employee/project/${pid}/study-period/case-report?${params.toString()}`);
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
    
    navigate(`/employee/project/${pid}/study-period/vitals?${params.toString()}`);
  };

  return (
    <PrintableForm templateName="Subject Check-In Form">
      <CommonFormHeader
        formTitle="Subject Check-In"
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
          {/* Period Selection */}
          <div className="border-b pb-4">
            <FormField
              label="Study Period"
              type="select"
              value={activePeriod}
              onChange={handlePeriodChange}
              options={[
                { label: 'Period 1', value: '1' },
                { label: 'Period 2', value: '2' }
              ]}
            />
          </div>

          {/* Check-In Form Fields */}
          <div className="space-y-6">
            <FormField
              label="Inclusion and Exclusion Criteria is Completed, and subject is eligible for check-in (applicable for only period-01)"
              type="radio"
              value={formData.inclusionExclusionCompleted}
              onChange={(value) => updateField('inclusionExclusionCompleted', value)}
              options={[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
                { label: 'NA', value: 'na' }
              ]}
            />

            <FormField
              label="Exclusion Criteria is Completed (applicable for other than period-01)"
              type="radio"
              value={formData.exclusionCriteriaCompleted}
              onChange={(value) => updateField('exclusionCriteriaCompleted', value)}
              options={[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
                { label: 'NA', value: 'na' }
              ]}
            />

            <FormField
              label="Frisking Performed, locker, utility kit and dress issued"
              type="radio"
              value={formData.friskingPerformed}
              onChange={(value) => updateField('friskingPerformed', value)}
              options={[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' }
              ]}
            />

            <FormField
              label="Allotted Subject Number* (applicable for period-01)"
              value={formData.allottedSubjectNumber}
              onChange={(value) => updateField('allottedSubjectNumber', value)}
            />

            <FormField
              label="Clinical Pharmacology Unit"
              value={formData.clinicalPharmacologyUnit}
              onChange={(value) => updateField('clinicalPharmacologyUnit', value)}
            />

            <FormField
              label="ID Card issued"
              type="radio"
              value={formData.idCardIssued}
              onChange={(value) => updateField('idCardIssued', value)}
              options={[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' }
              ]}
            />

            <FormField
              label="Subject wrist band issued"
              type="radio"
              value={formData.subjectWristBandIssued}
              onChange={(value) => updateField('subjectWristBandIssued', value)}
              options={[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' }
              ]}
            />

            <FormField
              label="Allotted Bed Number"
              value={formData.allottedBedNumber}
              onChange={(value) => updateField('allottedBedNumber', value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Date of Check-in"
                type="date"
                value={formData.dateOfCheckIn}
                onChange={(value) => updateField('dateOfCheckIn', value)}
              />
              <FormField
                label="Time of Check-in"
                type="time"
                value={formData.timeOfCheckIn}
                onChange={(value) => updateField('timeOfCheckIn', value)}
              />
            </div>

            <FormField
              label="Subject Sign & Date"
              value={formData.subjectSignDate}
              onChange={(value) => updateField('subjectSignDate', value)}
            />

            <FormField
              label="Comments"
              type="textarea"
              value={formData.comments}
              onChange={(value) => updateField('comments', value)}
            />

            <FormField
              label="Done by Sign & Date"
              value={formData.doneBySignDate}
              onChange={(value) => updateField('doneBySignDate', value)}
            />

            <FormField
              label="Reviewed By (Coordinator/Designee): (Sign & Date)"
              value={formData.reviewedBySignDate}
              onChange={(value) => updateField('reviewedBySignDate', value)}
            />
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
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PrintableForm>
  );
};

export default SubjectCheckInPage;
