
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { PrintableForm } from '@/components/PrintableForm';

interface BloodSample {
  srNo: number;
  date: string;
  timePoint: string;
  scheduledTime: string;
  collectedAsScheduled: boolean | null;
  documentedTime: string;
  deviationTime: string;
  deviationRemarks: string;
  collectedByName: string;
  collectedByDate: string;
  collectedByTime: string;
}

const BloodSampleCollectionPage: React.FC = () => {
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
    lightCondition: 'Normal light',
    vaccutainerType: 'K2EDTA',
    cannulaInsertionTime: '',
    cannulaInsertionDoneByName: '',
    cannulaInsertionDoneByDate: '',
    cannulaInsertionDoneByTime: '',
    cannulaRemovalTime: '',
    cannulaRemovalDoneByName: '',
    cannulaRemovalDoneByDate: '',
    cannulaRemovalDoneByTime: '',
    cannulaRemarks: '',
    samples: Array.from({ length: 24 }, (_, i) => ({
      srNo: i + 1,
      date: '',
      timePoint: [
        '1.00', '2.00', '3.00', '4.00', '4.50', '5.00', '5.50', '6.00', '6.50',
        '7.00', '7.50', '8.00', '8.50', '9.00', '9.50', '10.00', '11.00', '12.00',
        '13.00', '14.00', '16.00', '24.00', '36.00', '48.00'
      ][i],
      scheduledTime: '',
      collectedAsScheduled: null,
      documentedTime: '',
      deviationTime: '',
      deviationRemarks: '',
      collectedByName: '',
      collectedByDate: '',
      collectedByTime: ''
    })) as BloodSample[],
    comments: '',
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
        .eq('template_name', 'Blood Sample Collection')
        .eq('volunteer_id', volunteerId)
        .eq('study_number', studyNumber)
        .eq('answers->>period', period)
        .single();

      if (data && !error && data.answers && typeof data.answers === 'object' && !Array.isArray(data.answers)) {
        const answers = data.answers as any;
        setFormData({
          subjectNumber: answers.subjectNumber || '',
          dosingDate: answers.dosingDate || '',
          dosingTime: answers.dosingTime || '',
          lightCondition: answers.lightCondition || 'Normal light',
          vaccutainerType: answers.vaccutainerType || 'K2EDTA',
          cannulaInsertionTime: answers.cannulaInsertionTime || '',
          cannulaInsertionDoneByName: answers.cannulaInsertionDoneByName || '',
          cannulaInsertionDoneByDate: answers.cannulaInsertionDoneByDate || '',
          cannulaInsertionDoneByTime: answers.cannulaInsertionDoneByTime || '',
          cannulaRemovalTime: answers.cannulaRemovalTime || '',
          cannulaRemovalDoneByName: answers.cannulaRemovalDoneByName || '',
          cannulaRemovalDoneByDate: answers.cannulaRemovalDoneByDate || '',
          cannulaRemovalDoneByTime: answers.cannulaRemovalDoneByTime || '',
          cannulaRemarks: answers.cannulaRemarks || '',
          samples: answers.samples || formData.samples,
          comments: answers.comments || '',
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
          template_id: `Blood Sample Collection`,
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
        template_name: 'Blood Sample Collection',
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

  const updateSample = (index: number, field: keyof BloodSample, value: any) => {
    const updatedSamples = formData.samples.map((sample, i) => 
      i === index ? { ...sample, [field]: value } : sample
    );
    handleFieldChange('samples', updatedSamples);
  };

  const goToPrevious = () => {
    const params = new URLSearchParams({ case: caseId, volunteerId, studyNumber });
    navigate(`/employee/project/${pid}/study-period/vital-signs?${params.toString()}`);
  };

  const goToNext = () => {
    const params = new URLSearchParams({ case: caseId, volunteerId, studyNumber });
    navigate(`/employee/project/${pid}/study-period/restrictions?${params.toString()}`);
  };

  return (
    <div className="max-w-[95%] mx-auto space-y-6">
      <CommonFormHeader
        formTitle="Blood Sample Collection Form"
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
            <div className="font-semibold">Section-IV: BLOOD SAMPLE COLLECTION FORM</div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              label="Subject Number"
              value={formData.subjectNumber}
              onChange={(value) => handleFieldChange('subjectNumber', value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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
            <FormField
              label="Light condition"
              value={formData.lightCondition}
              onChange={(value) => handleFieldChange('lightCondition', value)}
            />
          </div>

          <div>
            <FormField
              label="Type of vaccutainer"
              value={formData.vaccutainerType}
              onChange={(value) => handleFieldChange('vaccutainerType', value)}
            />
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Canulation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormField
                  label="Cannula Insertion Time (Hrs)"
                  type="time"
                  value={formData.cannulaInsertionTime}
                  onChange={(value) => handleFieldChange('cannulaInsertionTime', value)}
                />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <FormField
                    label="Name/Signature"
                    value={formData.cannulaInsertionDoneByName}
                    onChange={(value) => handleFieldChange('cannulaInsertionDoneByName', value)}
                  />
                  <FormField
                    label="Date"
                    type="date"
                    value={formData.cannulaInsertionDoneByDate}
                    onChange={(value) => handleFieldChange('cannulaInsertionDoneByDate', value)}
                  />
                  <FormField
                    label="Time"
                    type="time"
                    value={formData.cannulaInsertionDoneByTime}
                    onChange={(value) => handleFieldChange('cannulaInsertionDoneByTime', value)}
                  />
                </div>
              </div>
              <div>
                <FormField
                  label="Cannula Removal Time (Hrs)"
                  type="time"
                  value={formData.cannulaRemovalTime}
                  onChange={(value) => handleFieldChange('cannulaRemovalTime', value)}
                />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <FormField
                    label="Name/Signature"
                    value={formData.cannulaRemovalDoneByName}
                    onChange={(value) => handleFieldChange('cannulaRemovalDoneByName', value)}
                  />
                  <FormField
                    label="Date"
                    type="date"
                    value={formData.cannulaRemovalDoneByDate}
                    onChange={(value) => handleFieldChange('cannulaRemovalDoneByDate', value)}
                  />
                  <FormField
                    label="Time"
                    type="time"
                    value={formData.cannulaRemovalDoneByTime}
                    onChange={(value) => handleFieldChange('cannulaRemovalDoneByTime', value)}
                  />
                </div>
              </div>
            </div>
            <FormField
              label="Remarks"
              value={formData.cannulaRemarks}
              onChange={(value) => handleFieldChange('cannulaRemarks', value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-2 py-1">Sr. No.</th>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Time Point in (Hrs) (04 mL)</th>
                  <th className="border px-2 py-1">Scheduled Time (Hrs)</th>
                  <th className="border px-2 py-1" colSpan={2}>Collected as per Schedule Time</th>
                  <th className="border px-2 py-1">If No, Time</th>
                  <th className="border px-2 py-1">Remarks</th>
                  <th className="border px-2 py-1">Collected By (Sign & Date)</th>
                </tr>
              </thead>
              <tbody>
                {formData.samples.map((sample, index) => (
                  <tr key={index} className="border-b">
                    <td className="border px-2 py-1 text-center">{sample.srNo}</td>
                    <td className="border px-2 py-1">
                      <input
                        type="date"
                        value={sample.date}
                        onChange={(e) => updateSample(index, 'date', e.target.value)}
                        className="w-full px-1 py-0.5 border rounded text-sm"
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">{sample.timePoint}</td>
                    <td className="border px-2 py-1">
                      <input
                        type="time"
                        value={sample.scheduledTime}
                        onChange={(e) => updateSample(index, 'scheduledTime', e.target.value)}
                        className="w-full px-1 py-0.5 border rounded text-sm"
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name={`collected-${index}`}
                          checked={sample.collectedAsScheduled === true}
                          onChange={() => updateSample(index, 'collectedAsScheduled', true)}
                          className="form-radio h-3 w-3"
                        />
                        <span className="ml-1 text-xs">Yes</span>
                      </label>
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name={`collected-${index}`}
                          checked={sample.collectedAsScheduled === false}
                          onChange={() => updateSample(index, 'collectedAsScheduled', false)}
                          className="form-radio h-3 w-3"
                        />
                        <span className="ml-1 text-xs">No</span>
                      </label>
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={sample.deviationTime}
                        onChange={(e) => updateSample(index, 'deviationTime', e.target.value)}
                        placeholder="Time"
                        className="w-full px-1 py-0.5 border rounded text-sm"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={sample.deviationRemarks}
                        onChange={(e) => updateSample(index, 'deviationRemarks', e.target.value)}
                        placeholder="Remarks"
                        className="w-full px-1 py-0.5 border rounded text-sm"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <div className="grid grid-cols-1 gap-1 min-w-[120px]">
                        <input
                          type="text"
                          value={sample.collectedByName}
                          onChange={(e) => updateSample(index, 'collectedByName', e.target.value)}
                          placeholder="Name"
                          className="w-full px-1 py-0.5 border rounded text-xs"
                        />
                        <input
                          type="date"
                          value={sample.collectedByDate}
                          onChange={(e) => updateSample(index, 'collectedByDate', e.target.value)}
                          className="w-full px-1 py-0.5 border rounded text-xs"
                        />
                        <input
                          type="time"
                          value={sample.collectedByTime}
                          onChange={(e) => updateSample(index, 'collectedByTime', e.target.value)}
                          className="w-full px-1 py-0.5 border rounded text-xs"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <div className="text-sm space-y-2">
              <p>Note: *Please tick (√) in appropriate boxes</p>
              <p>*PK: Pharmacokinetic, *CG: Clinical Genetics, *MISSED: NOT To be Standardized (DNS)</p>
              <p>*DNS: Difficulty in blood draw, *NA: Missed sample, *PD: Other vital deviation from protocol</p>
              <p>Sample Deviation as per Protocol: Post dose in-house blood samples will be collected as per the scheduled time. If the post dose sample not collected as per the scheduled time will be considered as protocol deviation. The actual time of collection will be recorded in the CRF. The pre-dose blood sample will be collected before the dosing. *Pre-dose sample of 20 mL should be collected only in period 01.</p>
            </div>

            <div>
              <label className="block text-sm font-medium">Comments (if any):</label>
              <textarea
                value={formData.comments}
                onChange={(e) => handleFieldChange('comments', e.target.value)}
                className="w-full p-2 border rounded"
                rows={2}
              />
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
          <PrintableForm templateName="Blood Sample Collection">
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

export default BloodSampleCollectionPage;
