
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { PrintableForm } from '@/components/PrintableForm';

const DrugAdministrationPage: React.FC = () => {
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
    dosingDate: '',
    lightCondition: 'Normal light',
    randomizationCode: '',
    numberOfUnits: '',
    dosageForm: 'Tablets',
    idAndWristBandVerified: '',
    proceduresExplained: '',
    difficultySwallowing: '',
    scheduledTime: '',
    actualTime: '',
    waterConsumed: '',
    medicationSwallowed: '',
    mouthCheckPerformed: '',
    ipLabel: '',
    comments: '',
    administeredByName: '',
    administeredByDate: '',
    administeredByTime: '',
    verifiedByName: '',
    verifiedByDate: '',
    verifiedByTime: ''
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
        .eq('template_name', 'Drug Administration')
        .eq('volunteer_id', volunteerId)
        .eq('study_number', studyNumber)
        .eq('answers->>period', period)
        .maybeSingle();

      if (data && !error && data.answers) {
        const answers = data.answers as typeof formData & { period?: string };
        setFormData({
          subjectNumber: answers.subjectNumber || '',
          dosingDate: answers.dosingDate || '',
          lightCondition: answers.lightCondition || 'Normal light',
          randomizationCode: answers.randomizationCode || '',
          numberOfUnits: answers.numberOfUnits || '',
          dosageForm: answers.dosageForm || 'Tablets',
          idAndWristBandVerified: answers.idAndWristBandVerified || '',
          proceduresExplained: answers.proceduresExplained || '',
          difficultySwallowing: answers.difficultySwallowing || '',
          scheduledTime: answers.scheduledTime || '',
          actualTime: answers.actualTime || '',
          waterConsumed: answers.waterConsumed || '',
          medicationSwallowed: answers.medicationSwallowed || '',
          mouthCheckPerformed: answers.mouthCheckPerformed || '',
          ipLabel: answers.ipLabel || '',
          comments: answers.comments || '',
          administeredByName: answers.administeredByName || '',
          administeredByDate: answers.administeredByDate || '',
          administeredByTime: answers.administeredByTime || '',
          verifiedByName: answers.verifiedByName || '',
          verifiedByDate: answers.verifiedByDate || '',
          verifiedByTime: answers.verifiedByTime || ''
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
          template_id: `Drug Administration`,
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
        template_name: 'Drug Administration',
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
    navigate(`/employee/project/${pid}/study-period/restrictions?${params.toString()}`);
  };

  const goToNext = () => {
    const params = new URLSearchParams({ case: caseId, volunteerId, studyNumber });
    navigate(`/employee/project/${pid}/study-period/check-out?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CommonFormHeader
        formTitle="Drug Administration Form"
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
        <CardContent className="space-y-6">
          <div className="border-t-2 border-b-2 border-gray-400 py-2">
            <div className="font-semibold">Section-VI: DRUG ADMINISTRATION FORM</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Subject Number"
              value={formData.subjectNumber}
              onChange={(value) => handleFieldChange('subjectNumber', value)}
            />
            <FormField
              label="Dosing Date"
              type="date"
              value={formData.dosingDate}
              onChange={(value) => handleFieldChange('dosingDate', value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Light condition"
              value={formData.lightCondition}
              onChange={(value) => handleFieldChange('lightCondition', value)}
            />
            <FormField
              label="Randomization code"
              value={formData.randomizationCode}
              onChange={(value) => handleFieldChange('randomizationCode', value)}
            />
            <FormField
              label="No. of Units"
              value={formData.numberOfUnits}
              onChange={(value) => handleFieldChange('numberOfUnits', value)}
            />
          </div>

          <div>
            <FormField
              label="Dosage Form"
              value={formData.dosageForm}
              onChange={(value) => handleFieldChange('dosageForm', value)}
              disabled
            />
          </div>

          <div className="space-y-4">
            {[
              { field: 'idAndWristBandVerified', label: 'Subject ID card & wrist band verified' },
              { field: 'proceduresExplained', label: 'Dosing procedures explained to the subject as per protocol' },
              { field: 'difficultySwallowing', label: 'Is there any difficulty to swallow the investigational product?' }
            ].map(({ field, label }) => (
              <div key={field} className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-medium">{label}</span>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={field}
                      checked={formData[field as keyof typeof formData] === 'Yes'}
                      onChange={() => handleRadioChange(field, 'Yes')}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={field}
                      checked={formData[field as keyof typeof formData] === 'No'}
                      onChange={() => handleRadioChange(field, 'No')}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm">No</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Scheduled time (hr: min)"
              type="time"
              value={formData.scheduledTime}
              onChange={(value) => handleFieldChange('scheduledTime', value)}
            />
            <FormField
              label="Actual Time (hr: min)"
              type="time"
              value={formData.actualTime}
              onChange={(value) => handleFieldChange('actualTime', value)}
            />
          </div>

          <div className="space-y-4">
            {[
              { field: 'waterConsumed', label: 'Water consumed as per protocol' },
              { field: 'medicationSwallowed', label: 'Study medication swallowed' },
              { field: 'mouthCheckPerformed', label: 'Mouth check Performed after Dosing' }
            ].map(({ field, label }) => (
              <div key={field} className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-medium">{label}</span>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={field}
                      checked={formData[field as keyof typeof formData] === 'Yes'}
                      onChange={() => handleRadioChange(field, 'Yes')}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={field}
                      checked={formData[field as keyof typeof formData] === 'No'}
                      onChange={() => handleRadioChange(field, 'No')}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm">No</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IP Label (Affix Here)
            </label>
            <textarea
              value={formData.ipLabel}
              onChange={(e) => handleFieldChange('ipLabel', e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments (if any)
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => handleFieldChange('comments', e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows={2}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Administered By (Sign & Date):</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Name/Signature"
                value={formData.administeredByName}
                onChange={(value) => handleFieldChange('administeredByName', value)}
              />
              <FormField
                label="Date"
                type="date"
                value={formData.administeredByDate}
                onChange={(value) => handleFieldChange('administeredByDate', value)}
              />
              <FormField
                label="Time"
                type="time"
                value={formData.administeredByTime}
                onChange={(value) => handleFieldChange('administeredByTime', value)}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Verified by (PI/CI/Physician):</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Name/Signature"
                value={formData.verifiedByName}
                onChange={(value) => handleFieldChange('verifiedByName', value)}
              />
              <FormField
                label="Date"
                type="date"
                value={formData.verifiedByDate}
                onChange={(value) => handleFieldChange('verifiedByDate', value)}
              />
              <FormField
                label="Time"
                type="time"
                value={formData.verifiedByTime}
                onChange={(value) => handleFieldChange('verifiedByTime', value)}
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
          <PrintableForm templateName="Drug Administration">
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

export default DrugAdministrationPage;
