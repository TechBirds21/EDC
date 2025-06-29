
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { PrintableForm } from '@/components/PrintableForm';
import { supabase } from '@/integrations/supabase/client';

interface RestrictionItem {
  question: string;
  answer: boolean | null;
}

const PrePostDoseRestrictionsPage: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case') || 'temp-case';
  const volunteerId = searchParams.get('volunteerId') || '';
  const studyNumber = searchParams.get('studyNumber') || '';

  const [period, setPeriod] = useState<'1' | '2'>('1');
  const [formData, setFormData] = useState({
    subjectNumber: '',
    preDoseRestrictions: [
      {
        question: 'Is subject maintained fasting condition of at least 10.0 hours before serving of high fat high calorie meal?',
        answer: null
      },
      {
        question: 'Water restriction for one hour before dosing was maintained',
        answer: null
      },
      {
        question: 'Subject is eligible for dosing',
        answer: null
      }
    ] as RestrictionItem[],
    preDoseComments: '',
    preDoseEvaluatedByName: '',
    preDoseEvaluatedByDate: '',
    preDoseEvaluatedByTime: '',
    postDoseRestrictions: [
      {
        question: '1.0 hour post-dose water restriction maintained',
        answer: null
      },
      {
        question: 'Sitting position maintained for initial 04 hours',
        answer: null
      },
      {
        question: 'Is subject maintained fasting condition at least 04 hours post dose?',
        answer: null
      }
    ] as RestrictionItem[],
    postDoseComments: '',
    postDoseEvaluatedByName: '',
    postDoseEvaluatedByDate: '',
    postDoseEvaluatedByTime: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExistingData();
  }, [period, caseId]);

  const loadExistingData = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_forms')
        .select('answers')
        .eq('case_id', caseId)
        .eq('template_name', 'Pre-Post Dose Restrictions')
        .eq('volunteer_id', volunteerId)
        .eq('study_number', studyNumber)
        .eq('answers->>period', period)
        .single();

      if (data && !error && data.answers && typeof data.answers === 'object' && !Array.isArray(data.answers)) {
        const answers = data.answers as any;
        setFormData({
          subjectNumber: answers.subjectNumber || '',
          preDoseRestrictions: answers.preDoseRestrictions || formData.preDoseRestrictions,
          preDoseComments: answers.preDoseComments || '',
          preDoseEvaluatedByName: answers.preDoseEvaluatedByName || '',
          preDoseEvaluatedByDate: answers.preDoseEvaluatedByDate || '',
          preDoseEvaluatedByTime: answers.preDoseEvaluatedByTime || '',
          postDoseRestrictions: answers.postDoseRestrictions || formData.postDoseRestrictions,
          postDoseComments: answers.postDoseComments || '',
          postDoseEvaluatedByName: answers.postDoseEvaluatedByName || '',
          postDoseEvaluatedByDate: answers.postDoseEvaluatedByDate || '',
          postDoseEvaluatedByTime: answers.postDoseEvaluatedByTime || ''
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: `Pre-Post Dose Restrictions`,
          volunteer_id: volunteerId || '',
          status: "submitted",
          data: { ...formData, period },
        });
        
        alert('Form saved successfully!');
        return;
      } catch (apiError) {
        console.warn('Python API submission failed, falling back to Supabase:', apiError);
      }
      
      const formEntry = {
        case_id: caseId,
        volunteer_id: volunteerId,
        study_number: studyNumber,
        template_name: 'Pre-Post Dose Restrictions',
        answers: { ...formData, period } as any,
        submitted_by: (await supabase.auth.getUser()).data.user?.id
      };

      const { error } = await supabase
        .from('patient_forms')
        .upsert(formEntry, {
          onConflict: 'case_id,template_name,volunteer_id,study_number'
        });

      if (error) throw error;
      
      alert('Form saved successfully!');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateRestriction = (type: 'preDose' | 'postDose', index: number, value: boolean) => {
    const fieldName = `${type}Restrictions`;
    const currentRestrictions = formData[fieldName as keyof typeof formData] as RestrictionItem[];
    const updatedRestrictions = currentRestrictions.map((item, i) => 
      i === index ? { ...item, answer: value } : item
    );
    handleFieldChange(fieldName, updatedRestrictions);
  };

  const goToPrevious = () => {
    const params = new URLSearchParams({ case: caseId, volunteerId, studyNumber });
    navigate(`/employee/project/${pid}/study-period/blood-sample?${params.toString()}`);
  };

  const goToNext = () => {
    const params = new URLSearchParams({ case: caseId, volunteerId, studyNumber });
    navigate(`/employee/project/${pid}/study-period/drug-administration?${params.toString()}`);
  };

  const renderRestrictions = (
    restrictions: RestrictionItem[],
    type: 'preDose' | 'postDose',
    comments: string,
    evaluatedByName: string,
    evaluatedByDate: string,
    evaluatedByTime: string
  ) => (
    <div className="space-y-4">
      {restrictions.map((restriction, index) => (
        <div key={index} className="flex items-start justify-between gap-4">
          <span className="flex-1">{restriction.question}</span>
          <div className="flex gap-4 min-w-[120px]">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name={`${type}-${index}`}
                checked={restriction.answer === true}
                onChange={() => updateRestriction(type, index, true)}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name={`${type}-${index}`}
                checked={restriction.answer === false}
                onChange={() => updateRestriction(type, index, false)}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium mb-1">Comments (if any):</label>
        <textarea
          value={comments}
          onChange={(e) => handleFieldChange(`${type}Comments`, e.target.value)}
          className="w-full p-2 border rounded"
          rows={2}
        />
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-4">Evaluated By (sign & date) - (Coordinator/Designee):</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Name/Signature"
            value={evaluatedByName}
            onChange={(value) => handleFieldChange(`${type}EvaluatedByName`, value)}
          />
          <FormField
            label="Date"
            type="date"
            value={evaluatedByDate}
            onChange={(value) => handleFieldChange(`${type}EvaluatedByDate`, value)}
          />
          <FormField
            label="Time"
            type="time"
            value={evaluatedByTime}
            onChange={(value) => handleFieldChange(`${type}EvaluatedByTime`, value)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CommonFormHeader
        formTitle="Pre-Dose and Post Dose Restrictions Form"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
      />

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Auto-save enabled - Your progress is automatically saved locally
        </AlertDescription>
      </Alert>

      <Card className="clinical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-gray-900">Study Case Report Form</CardTitle>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Period:</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as '1' | '2')}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="1">Period 1</option>
                <option value="2">Period 2</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="border-t-2 border-b-2 border-gray-400 py-2">
            <div className="font-semibold">Section-V: PRE-DOSE AND POST DOSE RESTRICTIONS FORM</div>
          </div>

          <div>
            <FormField
              label="Subject Number"
              value={formData.subjectNumber}
              onChange={(value) => handleFieldChange('subjectNumber', value)}
            />
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">Pre-Dose Restrictions</h3>
            {renderRestrictions(
              formData.preDoseRestrictions,
              'preDose',
              formData.preDoseComments,
              formData.preDoseEvaluatedByName,
              formData.preDoseEvaluatedByDate,
              formData.preDoseEvaluatedByTime
            )}
          </div>

          <div>
            <h3 className="font-medium text-lg mb-4">Post-Dose Restrictions</h3>
            {renderRestrictions(
              formData.postDoseRestrictions,
              'postDose',
              formData.postDoseComments,
              formData.postDoseEvaluatedByName,
              formData.postDoseEvaluatedByDate,
              formData.postDoseEvaluatedByTime
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button
          onClick={goToPrevious}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <div className="flex space-x-2">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
          <PrintableForm templateName="Pre-Post Dose Restrictions">
            <Button variant="outline">Print</Button>
          </PrintableForm>
        </div>

        <Button
          onClick={goToNext}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PrePostDoseRestrictionsPage;
