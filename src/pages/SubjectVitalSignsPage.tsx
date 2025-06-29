
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

interface VitalSignEntry {
  date: string;
  scheduledTimePoint: string;
  scheduledTime: string;
  pulseRate: string;
  bloodPressure: string;
  subjectWell: boolean | null;
  recordingTime: string;
  doneByName: string;
  doneByDate: string;
  doneByTime: string;
}

const SubjectVitalSignsPage: React.FC = () => {
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
    dosingTime: '',
    isSubjectFitForDosing: null as boolean | null,
    comments: '',
    reviewedByName: '',
    reviewedByDate: '',
    reviewedByTime: '',
    preDoseVitals: {
      date: '',
      scheduledTimePoint: 'Pre-dose',
      scheduledTime: '',
      pulseRate: '',
      bloodPressure: '',
      subjectWell: null as boolean | null,
      recordingTime: '',
      doneByName: '',
      doneByDate: '',
      doneByTime: ''
    },
    postDoseVitals: [
      { scheduledTimePoint: '2.0', scheduledTime: '', pulseRate: '', bloodPressure: '', subjectWell: null, recordingTime: '', doneByName: '', doneByDate: '', doneByTime: '' },
      { scheduledTimePoint: '5.0', scheduledTime: '', pulseRate: '', bloodPressure: '', subjectWell: null, recordingTime: '', doneByName: '', doneByDate: '', doneByTime: '' },
      { scheduledTimePoint: '10.0', scheduledTime: '', pulseRate: '', bloodPressure: '', subjectWell: null, recordingTime: '', doneByName: '', doneByDate: '', doneByTime: '' },
      { scheduledTimePoint: '25.0', scheduledTime: '', pulseRate: '', bloodPressure: '', subjectWell: null, recordingTime: '', doneByName: '', doneByDate: '', doneByTime: '' },
      { scheduledTimePoint: 'check-out', scheduledTime: '', pulseRate: '', bloodPressure: '', subjectWell: null, recordingTime: '', doneByName: '', doneByDate: '', doneByTime: '' }
    ] as VitalSignEntry[],
    postDoseComments: ''
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
        .eq('template_name', 'Subject Vital Signs')
        .eq('volunteer_id', volunteerId)
        .eq('study_number', studyNumber)
        .like('answers->period', period)
        .single();

      if (data && !error && data.answers && typeof data.answers === 'object' && !Array.isArray(data.answers)) {
        const answers = data.answers as any;
        setFormData({
          subjectNumber: answers.subjectNumber || '',
          dosingDate: answers.dosingDate || '',
          dosingTime: answers.dosingTime || '',
          isSubjectFitForDosing: answers.isSubjectFitForDosing || null,
          comments: answers.comments || '',
          reviewedByName: answers.reviewedByName || '',
          reviewedByDate: answers.reviewedByDate || '',
          reviewedByTime: answers.reviewedByTime || '',
          preDoseVitals: answers.preDoseVitals || formData.preDoseVitals,
          postDoseVitals: answers.postDoseVitals || formData.postDoseVitals,
          postDoseComments: answers.postDoseComments || ''
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formEntry = {
        case_id: caseId,
        volunteer_id: volunteerId,
        study_number: studyNumber,
        template_name: 'Subject Vital Signs',
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

  const updatePreDoseVitals = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preDoseVitals: {
        ...prev.preDoseVitals,
        [field]: value
      }
    }));
  };

  const updatePostDoseVital = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      postDoseVitals: prev.postDoseVitals.map((vital, i) => 
        i === index ? { ...vital, [field]: value } : vital
      )
    }));
  };

  const goToPrevious = () => {
    const params = new URLSearchParams({ case: caseId, volunteerId, studyNumber });
    navigate(`/employee/project/${pid}/study-period/case-report?${params.toString()}`);
  };

  const goToNext = () => {
    const params = new URLSearchParams({ case: caseId, volunteerId, studyNumber });
    navigate(`/employee/project/${pid}/study-period/blood-sample?${params.toString()}`);
  };

  const renderVitalSignsRow = (entry: VitalSignEntry, index?: number, isPreDose = false) => {
    const updateFn = isPreDose ? updatePreDoseVitals : (field: string, value: any) => updatePostDoseVital(index!, field, value);
    
    return (
      <tr key={isPreDose ? 'pre-dose' : index} className="border-b">
        <td className="border px-2 py-1">
          <input
            type="date"
            value={entry.date || ''}
            onChange={(e) => updateFn('date', e.target.value)}
            className="w-full px-1 py-0.5 border rounded text-sm"
          />
        </td>
        <td className="border px-2 py-1 text-center">{entry.scheduledTimePoint}</td>
        <td className="border px-2 py-1">
          <input
            type="time"
            value={entry.scheduledTime}
            onChange={(e) => updateFn('scheduledTime', e.target.value)}
            className="w-full px-1 py-0.5 border rounded text-sm"
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="text"
            value={entry.pulseRate}
            onChange={(e) => updateFn('pulseRate', e.target.value)}
            className="w-full px-1 py-0.5 border rounded text-sm"
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="text"
            value={entry.bloodPressure}
            onChange={(e) => updateFn('bloodPressure', e.target.value)}
            className="w-full px-1 py-0.5 border rounded text-sm"
          />
        </td>
        <td className="border px-2 py-1">
          <div className="flex justify-center gap-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name={`subject-well-${isPreDose ? 'pre' : index}`}
                checked={entry.subjectWell === true}
                onChange={() => updateFn('subjectWell', true)}
                className="form-radio h-3 w-3"
              />
              <span className="ml-1 text-sm">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name={`subject-well-${isPreDose ? 'pre' : index}`}
                checked={entry.subjectWell === false}
                onChange={() => updateFn('subjectWell', false)}
                className="form-radio h-3 w-3"
              />
              <span className="ml-1 text-sm">No</span>
            </label>
          </div>
        </td>
        <td className="border px-2 py-1">
          <input
            type="time"
            value={entry.recordingTime}
            onChange={(e) => updateFn('recordingTime', e.target.value)}
            className="w-full px-1 py-0.5 border rounded text-sm"
          />
        </td>
        <td className="border px-2 py-1">
          <div className="grid grid-cols-1 gap-1 min-w-[120px]">
            <input
              type="text"
              value={entry.doneByName}
              onChange={(e) => updateFn('doneByName', e.target.value)}
              placeholder="Name"
              className="w-full px-1 py-0.5 border rounded text-xs"
            />
            <input
              type="date"
              value={entry.doneByDate}
              onChange={(e) => updateFn('doneByDate', e.target.value)}
              className="w-full px-1 py-0.5 border rounded text-xs"
            />
            <input
              type="time"
              value={entry.doneByTime}
              onChange={(e) => updateFn('doneByTime', e.target.value)}
              className="w-full px-1 py-0.5 border rounded text-xs"
            />
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="max-w-[95%] mx-auto space-y-6">
      <CommonFormHeader
        formTitle="Subject Vital Signs and Well-being Form"
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
            <div className="font-semibold">Section-III: SUBJECT VITAL SIGNS AND WELL-BEING FORM</div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              label="Subject Number"
              value={formData.subjectNumber}
              onChange={(value) => handleFieldChange('subjectNumber', value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="*Dosing Date"
              type="date"
              value={formData.dosingDate}
              onChange={(value) => handleFieldChange('dosingDate', value)}
            />
            <FormField
              label="*Dosing Time"
              type="time"
              value={formData.dosingTime}
              onChange={(value) => handleFieldChange('dosingTime', value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm">*Dosing time recorded after dosing.</p>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-2 py-1 text-left">Date</th>
                    <th className="border px-2 py-1 text-left">Scheduled Time Point (Hrs)</th>
                    <th className="border px-2 py-1 text-left">Scheduled time (Hrs)</th>
                    <th className="border px-2 py-1 text-left">Pulse rate (per min)</th>
                    <th className="border px-2 py-1 text-left">Blood Pressure (mm of Hg)</th>
                    <th className="border px-2 py-1 text-center">Subject well-being Yes/No</th>
                    <th className="border px-2 py-1 text-left">Recording Time (Fact time) (Hrs)</th>
                    <th className="border px-2 py-1 text-left">Done by (Sign and Date)</th>
                  </tr>
                </thead>
                <tbody>
                  {renderVitalSignsRow(formData.preDoseVitals, undefined, true)}
                  {formData.postDoseVitals.map((vital, index) => renderVitalSignsRow(vital, index))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span>*Subject fit for dosing:</span>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="subject-fit-dosing"
                  checked={formData.isSubjectFitForDosing === true}
                  onChange={() => handleFieldChange('isSubjectFitForDosing', true)}
                  className="form-radio h-4 w-4"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="subject-fit-dosing"
                  checked={formData.isSubjectFitForDosing === false}
                  onChange={() => handleFieldChange('isSubjectFitForDosing', false)}
                  className="form-radio h-4 w-4"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Comments:</label>
            <textarea
              value={formData.comments}
              onChange={(e) => handleFieldChange('comments', e.target.value)}
              className="w-full p-2 border rounded"
              rows={2}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Reviewed By (PI/CI/Physician):</h3>
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

          <div className="space-y-4 text-sm">
            <p>Note: The in-house post dose vital signs will be done with a window period of ± 60 minutes to the scheduled time except check-in. Pre-dose vital signs will be done before dosing.</p>
            
            <div>
              <label className="block text-sm font-medium">Comments (if any):</label>
              <textarea
                value={formData.postDoseComments}
                onChange={(e) => handleFieldChange('postDoseComments', e.target.value)}
                className="w-full p-2 border rounded"
                rows={2}
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
          <PrintableForm templateName="Subject Vital Signs">
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

export default SubjectVitalSignsPage;
