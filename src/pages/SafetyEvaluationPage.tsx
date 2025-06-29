
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { FormField } from '@/components/FormField';
import { SignatureFields } from '@/components/SignatureFields';
import { PrintableForm } from '@/components/PrintableForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import type { SignatureData } from '@/types/common';

interface VitalSign {
  date: string;
  temperature: string;
  respiratoryRate: string;
  pulseRate: string;
  bloodPressure: string;
  actualTime: string;
  checkedBy: SignatureData;
}

interface ExaminationTest {
  name: string;
  evaluation: string;
  remarks: string;
  doneBy: string;
}

interface SampleCollection {
  type: string;
  volume: string;
  collectionTime: string;
  collectedBy: SignatureData;
}

interface LabReport {
  test: string;
  normal: boolean | null;
  abnormal: boolean | null;
  remarks: string;
}

interface RepeatSample {
  parameter: string;
  repeatAfter: string;
  signAndDate: string;
}

interface PostStudySafetyFormData {
  crfVersion: string;
  date: string;
  subjectNumber: string;
  presentComplaints: string;
  complaintsSpecification: string;
  medicalExamination: {
    generalAppearance: string;
    observations: string;
    systems: {
      cardiovascular: string;
      entRespiratory: string;
      abdominalGastrointestinal: string;
      centralNervous: string;
      skinMusculoskeletal: string;
    };
  };
  remarks: string;
  doneBy: SignatureData;
  vitals: VitalSign[];
  serumPregnancyTest: string;
  otherTests: string;
  examinationTests: ExaminationTest[];
  isEligibleForSampleCollection: string;
  sampleCollectionSpecification: string;
  samples: SampleCollection[];
  labReports: LabReport[];
  anyAbnormalParameter: string;
  repeatSamples: RepeatSample[];
  comments: string;
  evaluatedBy: SignatureData;
  verifiedBy: SignatureData;
}

const initialFormData: PostStudySafetyFormData = {
  crfVersion: '02',
  date: '',
  subjectNumber: '',
  presentComplaints: '',
  complaintsSpecification: '',
  medicalExamination: {
    generalAppearance: '',
    observations: '',
    systems: {
      cardiovascular: '',
      entRespiratory: '',
      abdominalGastrointestinal: '',
      centralNervous: '',
      skinMusculoskeletal: '',
    },
  },
  remarks: '',
  doneBy: { name: '', date: '', time: '' },
  vitals: [
    {
      date: '',
      temperature: '',
      respiratoryRate: '',
      pulseRate: '',
      bloodPressure: '',
      actualTime: '',
      checkedBy: { name: '', date: '', time: '' },
    },
  ],
  serumPregnancyTest: '',
  otherTests: '',
  examinationTests: [
    {
      name: '',
      evaluation: '',
      remarks: '',
      doneBy: ''
    }
  ],
  isEligibleForSampleCollection: '',
  sampleCollectionSpecification: '',
  samples: [
    {
      type: 'Blood',
      volume: '',
      collectionTime: '',
      collectedBy: { name: '', date: '', time: '' },
    },
  ],
  labReports: [
    { test: 'Haematology', normal: null, abnormal: null, remarks: '' },
    { test: 'Biochemistry', normal: null, abnormal: null, remarks: '' },
  ],
  anyAbnormalParameter: '',
  repeatSamples: [],
  comments: '',
  evaluatedBy: { name: '', date: '', time: '' },
  verifiedBy: { name: '', date: '', time: '' },
};

const PostStudySafetyEvaluationPage: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [activePeriod, setActivePeriod] = useState('1');
  const [formData, setFormData] = useState<PostStudySafetyFormData>(initialFormData);
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
    const localKey = `postStudySafety_${volunteerId}_period${activePeriod}`;
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
        .eq('template_name', `Post Study Safety Evaluation Period ${activePeriod}`)
        .maybeSingle();

      if (error) {
        console.error('Error loading data:', error);
        return;
      }

      if (data?.answers) {
        const answers = data.answers as unknown as PostStudySafetyFormData;
        setFormData(answers);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading safety evaluation data:', error);
    }
  };

  const updateField = (field: keyof PostStudySafetyFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Save to localStorage
      if (volunteerId) {
        const localKey = `postStudySafety_${volunteerId}_period${activePeriod}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const updateNestedField = (parent: keyof PostStudySafetyFormData, field: string, value: any) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [parent]: {
          ...(prev[parent] as any),
          [field]: value,
        },
      };
      
      // Save to localStorage
      if (volunteerId) {
        const localKey = `postStudySafety_${volunteerId}_period${activePeriod}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const updateSystemsField = (systemKey: keyof PostStudySafetyFormData['medicalExamination']['systems'], value: string) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        medicalExamination: {
          ...prev.medicalExamination,
          systems: {
            ...prev.medicalExamination.systems,
            [systemKey]: value,
          },
        },
      };
      
      // Save to localStorage
      if (volunteerId) {
        const localKey = `postStudySafety_${volunteerId}_period${activePeriod}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const updateVital = (index: number, field: keyof VitalSign, value: any) => {
    const updatedVitals = [...formData.vitals];
    updatedVitals[index] = { ...updatedVitals[index], [field]: value };
    updateField('vitals', updatedVitals);
  };

  const addVitalRow = () => {
    const newVital: VitalSign = {
      date: '',
      temperature: '',
      respiratoryRate: '',
      pulseRate: '',
      bloodPressure: '',
      actualTime: '',
      checkedBy: { name: '', date: '', time: '' }
    };
    updateField('vitals', [...formData.vitals, newVital]);
  };

  const updateExaminationTest = (index: number, field: keyof ExaminationTest, value: string) => {
    const updatedTests = [...formData.examinationTests];
    updatedTests[index] = { ...updatedTests[index], [field]: value };
    updateField('examinationTests', updatedTests);
  };

  const addExaminationTestRow = () => {
    const newTest: ExaminationTest = {
      name: '',
      evaluation: '',
      remarks: '',
      doneBy: ''
    };
    updateField('examinationTests', [...formData.examinationTests, newTest]);
  };

  const updateSample = (index: number, field: keyof SampleCollection, value: any) => {
    const updatedSamples = [...formData.samples];
    updatedSamples[index] = { ...updatedSamples[index], [field]: value };
    updateField('samples', updatedSamples);
  };

  const addSampleRow = () => {
    const newSample: SampleCollection = {
      type: '',
      volume: '',
      collectionTime: '',
      collectedBy: { name: '', date: '', time: '' }
    };
    updateField('samples', [...formData.samples, newSample]);
  };

  const updateLabReport = (index: number, field: keyof LabReport, value: any) => {
    const updatedReports = [...formData.labReports];
    updatedReports[index] = { ...updatedReports[index], [field]: value };
    updateField('labReports', updatedReports);
  };

  const addRepeatSample = () => {
    const newRepeatSample: RepeatSample = {
      parameter: '',
      repeatAfter: '',
      signAndDate: ''
    };
    updateField('repeatSamples', [...formData.repeatSamples, newRepeatSample]);
  };

  const updateRepeatSample = (index: number, field: keyof RepeatSample, value: string) => {
    const updatedRepeatSamples = [...formData.repeatSamples];
    updatedRepeatSamples[index] = { ...updatedRepeatSamples[index], [field]: value };
    updateField('repeatSamples', updatedRepeatSamples);
  };

  const handlePeriodChange = (newPeriod: string) => {
    // Save current period data first
    if (volunteerId) {
      const localKey = `postStudySafety_${volunteerId}_period${activePeriod}`;
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
      const localKey = `postStudySafety_${volunteerId}_period${activePeriod}`;
      localStorage.setItem(localKey, JSON.stringify(formData));

      // Save to database
      const { error } = await supabase
        .from('patient_forms')
        .upsert({
          case_id: caseId,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          template_name: `Post Study Safety Evaluation Period ${activePeriod}`,
          answers: formData as any
        });

      if (error) throw error;

      setIsSaved(true);
      toast.success(`Post study safety evaluation for Period ${activePeriod} saved successfully`);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save post study safety evaluation');
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
    
    navigate(`/employee/project/${pid}/post-study/depression-scale?${params.toString()}`);
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
    
    // Navigate to next form or dashboard
    navigate(`/employee/project/${pid}/dashboard?${params.toString()}`);
  };

  return (
    <PrintableForm templateName="Post Study Safety Evaluation">
      <CommonFormHeader
        formTitle="POST/REPEAT POST STUDY SAFETY EVALUATION AND SAMPLE COLLECTION FORM"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
        sopNumber="SOP-CL-F-017"
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

          {/* Form Header Info */}
          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="CRF Version"
              value={formData.crfVersion}
              onChange={(value) => updateField('crfVersion', value)}
            />
            <FormField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(value) => updateField('date', value)}
            />
            <FormField
              label="Subject Number"
              value={formData.subjectNumber}
              onChange={(value) => updateField('subjectNumber', value)}
            />
          </div>

          {/* Present Complaints */}
          <div className="space-y-4">
            <FormField
              label="Present complaints"
              type="radio"
              value={formData.presentComplaints}
              onChange={(value) => updateField('presentComplaints', value)}
              options={[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' }
              ]}
            />

            {formData.presentComplaints === 'yes' && (
              <FormField
                label="If Yes Specify:"
                type="textarea"
                value={formData.complaintsSpecification}
                onChange={(value) => updateField('complaintsSpecification', value)}
              />
            )}
          </div>

          {/* Medical Examination */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Medical Examination</h3>
            
            <FormField
              label="General appearance"
              type="radio"
              value={formData.medicalExamination.generalAppearance}
              onChange={(value) => updateNestedField('medicalExamination', 'generalAppearance', value)}
              options={[
                { label: 'Normal', value: 'normal' },
                { label: 'Abnormal', value: 'abnormal' }
              ]}
            />

            <FormField
              label="Observations"
              type="textarea"
              value={formData.medicalExamination.observations}
              onChange={(value) => updateNestedField('medicalExamination', 'observations', value)}
            />

            {/* Systemic Examination */}
            <div className="space-y-3">
              <h4 className="font-medium">Systemic examination which includes the examination of the following systems</h4>
              
              {[
                { key: 'cardiovascular', label: 'Cardiovascular System' },
                { key: 'entRespiratory', label: 'ENT and Respiratory' },
                { key: 'abdominalGastrointestinal', label: 'Abdominal and Gastrointestinal system' },
                { key: 'centralNervous', label: 'Central Nervous System' },
                { key: 'skinMusculoskeletal', label: 'Skin and Musculoskeletal system' }
              ].map((system) => (
                <FormField
                  key={system.key}
                  label={system.label}
                  type="radio"
                  value={formData.medicalExamination.systems[system.key as keyof typeof formData.medicalExamination.systems]}
                  onChange={(value) => updateSystemsField(system.key as keyof PostStudySafetyFormData['medicalExamination']['systems'], value)}
                  options={[
                    { label: 'Normal', value: 'normal' },
                    { label: 'Abnormal', value: 'abnormal' }
                  ]}
                />
              ))}
            </div>

            <div className="text-sm text-gray-600">
              Please tick ☑ appropriate boxes; if abnormal, specify in remarks.
            </div>
          </div>

          <FormField
            label="Remarks:"
            type="textarea"
            value={formData.remarks}
            onChange={(value) => updateField('remarks', value)}
          />

          <SignatureFields
            label="Done By (Sign & Date):"
            value={formData.doneBy}
            onChange={(value) => updateField('doneBy', value)}
          />

          {/* Vitals Table */}
          <div className="space-y-4">
            <h3 className="font-semibold">Vitals:</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-2 text-left border-r">Date</th>
                    <th className="px-2 py-2 text-left border-r">Temp (°F)</th>
                    <th className="px-2 py-2 text-left border-r">Respiratory rate(/min)</th>
                    <th className="px-2 py-2 text-left border-r">Pulse rate (per min)</th>
                    <th className="px-2 py-2 text-left border-r">Blood Pressure (mm of Hg)</th>
                    <th className="px-2 py-2 text-left border-r">Actual time (Hrs)</th>
                    <th className="px-2 py-2 text-left">Checked by (Sign and Date)</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.vitals.map((vital, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-2 py-2 border-r">
                        <input
                          type="date"
                          value={vital.date}
                          onChange={(e) => updateVital(index, 'date', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-2 py-2 border-r">
                        <input
                          type="text"
                          value={vital.temperature}
                          onChange={(e) => updateVital(index, 'temperature', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-2 py-2 border-r">
                        <input
                          type="text"
                          value={vital.respiratoryRate}
                          onChange={(e) => updateVital(index, 'respiratoryRate', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-2 py-2 border-r">
                        <input
                          type="text"
                          value={vital.pulseRate}
                          onChange={(e) => updateVital(index, 'pulseRate', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-2 py-2 border-r">
                        <input
                          type="text"
                          value={vital.bloodPressure}
                          onChange={(e) => updateVital(index, 'bloodPressure', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-2 py-2 border-r">
                        <input
                          type="text"
                          value={vital.actualTime}
                          onChange={(e) => updateVital(index, 'actualTime', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <SignatureFields
                          value={vital.checkedBy}
                          onChange={(value) => updateVital(index, 'checkedBy', value)}
                          vertical={true}
                          className="text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={addVitalRow} variant="outline" className="no-print">
              Add Vital Row
            </Button>
          </div>

          {/* Serum Pregnancy Test */}
          <FormField
            label="Serum pregnancy test for female as per protocol:"
            type="radio"
            value={formData.serumPregnancyTest}
            onChange={(value) => updateField('serumPregnancyTest', value)}
            options={[
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },
              { label: 'NA', value: 'na' }
            ]}
          />

          <FormField
            label="Any other test:"
            type="textarea"
            value={formData.otherTests}
            onChange={(value) => updateField('otherTests', value)}
          />

          {/* Examination Tests Table */}
          <div className="space-y-4">
            <h3 className="font-semibold">Examination/Tests:</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left border-r">Name of the Examination/test</th>
                    <th className="px-4 py-2 text-left border-r">Evaluation</th>
                    <th className="px-4 py-2 text-left border-r">Remarks</th>
                    <th className="px-4 py-2 text-left">Done by</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.examinationTests.map((test, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 border-r">
                        <input
                          type="text"
                          value={test.name}
                          onChange={(e) => updateExaminationTest(index, 'name', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Enter examination/test name"
                        />
                      </td>
                      <td className="px-4 py-2 border-r">
                        <input
                          type="text"
                          value={test.evaluation}
                          onChange={(e) => updateExaminationTest(index, 'evaluation', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Enter evaluation"
                        />
                      </td>
                      <td className="px-4 py-2 border-r">
                        <input
                          type="text"
                          value={test.remarks}
                          onChange={(e) => updateExaminationTest(index, 'remarks', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Enter remarks"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={test.doneBy}
                          onChange={(e) => updateExaminationTest(index, 'doneBy', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                          placeholder="Enter done by"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={addExaminationTestRow} variant="outline" className="no-print">
              Add Examination Test Row
            </Button>
          </div>

          {/* Sample Collection Section */}
          <div className="space-y-4">
            <FormField
              label="Is Subject Eligible for Sample Collection?"
              type="radio"
              value={formData.isEligibleForSampleCollection}
              onChange={(value) => updateField('isEligibleForSampleCollection', value)}
              options={[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' }
              ]}
            />

            {formData.isEligibleForSampleCollection === 'no' && (
              <FormField
                label="Specification"
                type="textarea"
                value={formData.sampleCollectionSpecification}
                onChange={(value) => updateField('sampleCollectionSpecification', value)}
              />
            )}

            <h3 className="font-semibold">Sample Collection:</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left border-r">Sample Type</th>
                    <th className="px-4 py-2 text-left border-r">Volume</th>
                    <th className="px-4 py-2 text-left border-r">Collection Time</th>
                    <th className="px-4 py-2 text-left">Collected By</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.samples.map((sample, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 border-r">
                        <input
                          type="text"
                          value={sample.type}
                          onChange={(e) => updateSample(index, 'type', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-2 border-r">
                        <input
                          type="text"
                          value={sample.volume}
                          onChange={(e) => updateSample(index, 'volume', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-2 border-r">
                        <input
                          type="time"
                          value={sample.collectionTime}
                          onChange={(e) => updateSample(index, 'collectionTime', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <SignatureFields
                          value={sample.collectedBy}
                          onChange={(value) => updateSample(index, 'collectedBy', value)}
                          vertical={true}
                          className="text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={addSampleRow} variant="outline" className="no-print">
              Add Sample Row
            </Button>
          </div>

          {/* Lab Reports */}
          <div className="space-y-4">
            <h3 className="font-semibold">Lab Reports</h3>
            {formData.labReports.map((report, index) => (
              <div key={index} className="space-y-3 p-4 border rounded">
                <h4 className="font-medium">{report.test}</h4>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`labReport_${index}`}
                      checked={report.normal === true}
                      onChange={() => {
                        updateLabReport(index, 'normal', true);
                        updateLabReport(index, 'abnormal', false);
                      }}
                      className="mr-2"
                    />
                    Normal
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`labReport_${index}`}
                      checked={report.abnormal === true}
                      onChange={() => {
                        updateLabReport(index, 'abnormal', true);
                        updateLabReport(index, 'normal', false);
                      }}
                      className="mr-2"
                    />
                    Abnormal
                  </label>
                </div>
                <FormField
                  label="Remarks"
                  type="textarea"
                  value={report.remarks}
                  onChange={(value) => updateLabReport(index, 'remarks', value)}
                />
              </div>
            ))}
          </div>

          {/* Abnormal Parameters */}
          <FormField
            label="Any Abnormal Parameter?"
            type="radio"
            value={formData.anyAbnormalParameter}
            onChange={(value) => updateField('anyAbnormalParameter', value)}
            options={[
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' }
            ]}
          />

          {formData.anyAbnormalParameter === 'yes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Repeat Samples Required</h3>
                <Button onClick={addRepeatSample} variant="outline" className="no-print">
                  Add Repeat Sample
                </Button>
              </div>
              {formData.repeatSamples.map((sample, index) => (
                <div key={index} className="space-y-3 p-4 border rounded">
                  <FormField
                    label="Parameter"
                    value={sample.parameter}
                    onChange={(value) => updateRepeatSample(index, 'parameter', value)}
                  />
                  <FormField
                    label="Repeat After"
                    value={sample.repeatAfter}
                    onChange={(value) => updateRepeatSample(index, 'repeatAfter', value)}
                  />
                  <FormField
                    label="Sign and Date"
                    value={sample.signAndDate}
                    onChange={(value) => updateRepeatSample(index, 'signAndDate', value)}
                  />
                </div>
              ))}
            </div>
          )}

          <FormField
            label="Comments"
            type="textarea"
            value={formData.comments}
            onChange={(value) => updateField('comments', value)}
          />

          <SignatureFields
            label="Evaluated By"
            value={formData.evaluatedBy}
            onChange={(value) => updateField('evaluatedBy', value)}
          />

          <SignatureFields
            label="Verified By"
            value={formData.verifiedBy}
            onChange={(value) => updateField('verifiedBy', value)}
          />

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

export default PostStudySafetyEvaluationPage;
