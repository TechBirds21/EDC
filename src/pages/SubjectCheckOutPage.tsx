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

const SubjectCheckOutPage: React.FC = () => {
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
    feelingWell: '',
    followRestrictions: '',
    subsequentVisit: '',
    checkoutTime: '',
    subjectSignatureName: '',
    subjectSignatureDate: '',
    subjectSignatureTime: '',
    comments: '',
    checkoutDoneByName: '',
    checkoutDoneByDate: '',
    checkoutDoneByTime: '',
    reviewedByName: '',
    reviewedByDate: '',
    reviewedByTime: ''
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
        .eq('template_name', 'Subject Check-out')
        .eq('volunteer_id', volunteerId)
        .eq('study_number', studyNumber)
        .eq('answers->>period', period)
        .maybeSingle();

      if (data && !error && data.answers) {
        // Type assertion to ensure the data matches our form structure
        const answers = data.answers as typeof formData & { period?: string };
        setFormData({
          subjectNumber: answers.subjectNumber || '',
          feelingWell: answers.feelingWell || '',
          followRestrictions: answers.followRestrictions || '',
          subsequentVisit: answers.subsequentVisit || '',
          checkoutTime: answers.checkoutTime || '',
          subjectSignatureName: answers.subjectSignatureName || '',
          subjectSignatureDate: answers.subjectSignatureDate || '',
          subjectSignatureTime: answers.subjectSignatureTime || '',
          comments: answers.comments || '',
          checkoutDoneByName: answers.checkoutDoneByName || '',
          checkoutDoneByDate: answers.checkoutDoneByDate || '',
          checkoutDoneByTime: answers.checkoutDoneByTime || '',
          reviewedByName: answers.reviewedByName || '',
          reviewedByDate: answers.reviewedByDate || '',
          reviewedByTime: answers.reviewedByTime || ''
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
          template_id: `Subject Check-out`,
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
        template_name: 'Subject Check-out',
        answers: { ...formData, period },
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

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRadioChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const goToPrevious = () => {
    const params = new URLSearchParams({ case: caseId, volunteerId, studyNumber });
    navigate(`/employee/project/${pid}/study-period/drug-administration?${params.toString()}`);
  };

  const goToNext = () => {
    const params = new URLSearchParams({ case: caseId, volunteerId, studyNumber });
    navigate(`/employee/project/${pid}/study-period/any-other-info?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CommonFormHeader
        formTitle="Subject Check-out Form"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
        showPeriod={true}
        periodNo={period}
        setPeriodNo={(newPeriod) => setPeriod(newPeriod as '1' | '2')}
      />

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Auto-save enabled - Your progress is automatically saved locally
        </AlertDescription>
      </Alert>

      <Card className="clinical-card">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Study Case Report Form</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-t-2 border-b-2 border-gray-400 py-2">
            <div className="font-semibold">Section-VII: SUBJECT CHECK-OUT FORM</div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              label="Subject Number"
              value={formData.subjectNumber}
              onChange={(value) => handleFieldChange('subjectNumber', value)}
            />
          </div>

          <div className="space-y-4">
            {[
              { 
                field: 'feelingWell', 
                label: 'Does the subject feeling well during check out',
                options: ['Yes', 'No']
              },
              { 
                field: 'followRestrictions', 
                label: 'Is the subject instructed to follow the restrictions as per the protocol',
                options: ['Yes', 'No', 'NA']
              },
              { 
                field: 'subsequentVisit', 
                label: 'Is the subject instructed to come for subsequent period visit?',
                options: ['Yes', 'No', 'NA']
              }
            ].map(({ field, label, options }) => (
              <div key={field} className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-medium">{label}</span>
                <div className="flex gap-4">
                  {options.map(option => (
                    <label key={option} className="inline-flex items-center">
                      <input
                        type="radio"
                        name={field}
                        checked={formData[field as keyof typeof formData] === option}
                        onChange={() => handleRadioChange(field, option)}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <FormField
              label="Check out Time"
              type="time"
              value={formData.checkoutTime}
              onChange={(value) => handleFieldChange('checkoutTime', value)}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Subject (Sign & Date):</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Name/Signature"
                value={formData.subjectSignatureName}
                onChange={(value) => handleFieldChange('subjectSignatureName', value)}
              />
              <FormField
                label="Date"
                type="date"
                value={formData.subjectSignatureDate}
                onChange={(value) => handleFieldChange('subjectSignatureDate', value)}
              />
              <FormField
                label="Time"
                type="time"
                value={formData.subjectSignatureTime}
                onChange={(value) => handleFieldChange('subjectSignatureTime', value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments (if any)
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => handleFieldChange('comments', e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Check-out Done By (Sign & Date):</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Name/Signature"
                value={formData.checkoutDoneByName}
                onChange={(value) => handleFieldChange('checkoutDoneByName', value)}
              />
              <FormField
                label="Date"
                type="date"
                value={formData.checkoutDoneByDate}
                onChange={(value) => handleFieldChange('checkoutDoneByDate', value)}
              />
              <FormField
                label="Time"
                type="time"
                value={formData.checkoutDoneByTime}
                onChange={(value) => handleFieldChange('checkoutDoneByTime', value)}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Reviewed By (Coordinator/Designee):</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Name/Signature"
                value={formData.reviewedByName}
                onChange={(value) => handleFieldChange('reviewedByName', value)}
              />
              <FormField
                label="Date"
                type="date"
                value={formData.reviewedByDate}
                onChange={(value) => handleFieldChange('reviewedByDate', value)}
              />
              <FormField
                label="Time"
                type="time"
                value={formData.reviewedByTime}
                onChange={(value) => handleFieldChange('reviewedByTime', value)}
              />
            </div>
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
          <PrintableForm templateName="Subject Check-out">
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

export default SubjectCheckOutPage;
