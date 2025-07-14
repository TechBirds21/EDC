
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/FormField';
import { SignatureFields } from '@/components/SignatureFields';
import { PrintableForm } from '@/components/PrintableForm';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Printer, Plus, Trash2 } from 'lucide-react';
import type { SignatureData } from '@/types/common';

interface VitalsData {
  bloodPressure: string;
  temperature: string;
  pulseRate: string;
}

interface SampleData {
  id: string;
  typeOfSample: string;
  volumeInMl: string;
  collectionTimeHrs: string;
  reasonForCollection: string;
  collectedBy: string;
}

interface EcgData {
  time: string;
  takenBy: string;
  normal: string;
  abnormal: string;
  remarks: string;
  evaluatedBy: string;
}

interface LabTestData {
  id: string;
  testName: string;
  normal: string;
  abnormalCS: string;
  abnormalNCS: string;
  remarks: string;
}

interface AdverseEventData {
  id: string;
  labParameter: string;
  repeatAfterDays: string;
}

interface RepeatAssessmentFormData {
  // Follow up section
  followUpDate: string;
  followUpTime: string;
  clinicalExamination: string;
  
  // Vitals
  vitals: VitalsData;
  vitalsRemarks: string;
  
  // Done by signature
  doneBySignature: SignatureData;
  
  // Sample collection
  samples: SampleData[];
  othersSpecify: string;
  ecgPerformed: string;
  ecgDetails: EcgData;
  
  // Lab report evaluation
  labTests: LabTestData[];
  
  // Adverse events
  adverseEventExperienced: string;
  adverseEventDetails: string;
  adverseEventsList: AdverseEventData[];
  
  // Comments and signatures
  comments: string;
  physicianSignature: SignatureData;
}

const initialFormData: RepeatAssessmentFormData = {
  followUpDate: '',
  followUpTime: '',
  clinicalExamination: '',
  vitals: {
    bloodPressure: '',
    temperature: '',
    pulseRate: ''
  },
  vitalsRemarks: '',
  doneBySignature: { name: '', date: '', time: '' },
  samples: [{
    id: '1',
    typeOfSample: '',
    volumeInMl: '',
    collectionTimeHrs: '',
    reasonForCollection: '',
    collectedBy: ''
  }],
  othersSpecify: '',
  ecgPerformed: 'No',
  ecgDetails: {
    time: '',
    takenBy: '',
    normal: '',
    abnormal: '',
    remarks: '',
    evaluatedBy: ''
  },
  labTests: [{
    id: '1',
    testName: '',
    normal: '',
    abnormalCS: '',
    abnormalNCS: '',
    remarks: ''
  }],
  adverseEventExperienced: 'No',
  adverseEventDetails: '',
  adverseEventsList: [{
    id: '1',
    labParameter: '',
    repeatAfterDays: ''
  }],
  comments: '',
  physicianSignature: { name: '', date: '', time: '' }
};

const RepeatAssessmentPage: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [formData, setFormData] = useState<RepeatAssessmentFormData>(initialFormData);
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
    const localKey = `repeatAssessment_${volunteerId}`;
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
        .eq('template_name', 'Repeat Assessment')
        .maybeSingle();

      if (error) {
        console.error('Error loading data:', error);
        return;
      }

      if (data?.answers) {
        const answers = data.answers as unknown as RepeatAssessmentFormData;
        setFormData(answers);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading repeat assessment data:', error);
    }
  };

  const updateFormData = (updates: Partial<RepeatAssessmentFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...updates };
      
      // Save to localStorage
      if (volunteerId) {
        const localKey = `repeatAssessment_${volunteerId}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const updateField = (field: keyof RepeatAssessmentFormData, value: any) => {
    updateFormData({ [field]: value });
  };

  const updateVitals = (field: keyof VitalsData, value: string) => {
    updateFormData({ vitals: { ...formData.vitals, [field]: value } });
  };

  const updateEcgDetails = (field: keyof EcgData, value: string) => {
    updateFormData({ ecgDetails: { ...formData.ecgDetails, [field]: value } });
  };

  const addSample = () => {
    const newSample: SampleData = {
      id: Date.now().toString(),
      typeOfSample: '',
      volumeInMl: '',
      collectionTimeHrs: '',
      reasonForCollection: '',
      collectedBy: ''
    };
    updateFormData({ samples: [...formData.samples, newSample] });
  };

  const updateSample = (id: string, field: keyof SampleData, value: string) => {
    const updatedSamples = formData.samples.map(sample =>
      sample.id === id ? { ...sample, [field]: value } : sample
    );
    updateFormData({ samples: updatedSamples });
  };

  const removeSample = (id: string) => {
    if (formData.samples.length > 1) {
      const updatedSamples = formData.samples.filter(sample => sample.id !== id);
      updateFormData({ samples: updatedSamples });
    }
  };

  const addLabTest = () => {
    const newTest: LabTestData = {
      id: Date.now().toString(),
      testName: '',
      normal: '',
      abnormalCS: '',
      abnormalNCS: '',
      remarks: ''
    };
    updateFormData({ labTests: [...formData.labTests, newTest] });
  };

  const updateLabTest = (id: string, field: keyof LabTestData, value: string) => {
    const updatedTests = formData.labTests.map(test =>
      test.id === id ? { ...test, [field]: value } : test
    );
    updateFormData({ labTests: updatedTests });
  };

  const removeLabTest = (id: string) => {
    if (formData.labTests.length > 1) {
      const updatedTests = formData.labTests.filter(test => test.id !== id);
      updateFormData({ labTests: updatedTests });
    }
  };

  const addAdverseEvent = () => {
    const newEvent: AdverseEventData = {
      id: Date.now().toString(),
      labParameter: '',
      repeatAfterDays: ''
    };
    updateFormData({ adverseEventsList: [...formData.adverseEventsList, newEvent] });
  };

  const updateAdverseEvent = (id: string, field: keyof AdverseEventData, value: string) => {
    const updatedEvents = formData.adverseEventsList.map(event =>
      event.id === id ? { ...event, [field]: value } : event
    );
    updateFormData({ adverseEventsList: updatedEvents });
  };

  const removeAdverseEvent = (id: string) => {
    if (formData.adverseEventsList.length > 1) {
      const updatedEvents = formData.adverseEventsList.filter(event => event.id !== id);
      updateFormData({ adverseEventsList: updatedEvents });
    }
  };

  const handleSave = async () => {
    if (!caseId || !volunteerId || !studyNumber) {
      toast.error('Missing required information');
      return;
    }

    setLoading(true);
    
    try {
      const localKey = `repeatAssessment_${volunteerId}`;
      localStorage.setItem(localKey, JSON.stringify(formData));
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: 'Repeat Assessment',
          volunteer_id: volunteerId,
          status: "submitted",
          data: formData,
        });
        
        setIsSaved(true);
        toast.success('Repeat assessment saved successfully');
        setLoading(false);
        return;
      } catch (apiError) {
        console.warn('Python API submission failed, falling back to Supabase:', apiError);
      }

      const { error } = await supabase
        .from('patient_forms')
        .upsert({
          case_id: caseId,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          template_name: 'Repeat Assessment',
          answers: formData as any
        });

      if (error) throw error;

      setIsSaved(true);
      toast.success('Repeat assessment saved successfully');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save repeat assessment');
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
    navigate(`/employee/project/${pid}/post-study/dropout?${params.toString()}`);
  };

  const handleNext = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    if (volunteerId) params.set('volunteerId', volunteerId);
    if (studyNumber) params.set('studyNumber', studyNumber);
    navigate(`/employee/project/${pid}/post-study/telephone-notes?${params.toString()}`);
  };

  return (
    <PrintableForm templateName="Repeat Assessment">
      <CommonFormHeader
        formTitle="REPEAT POST STUDY ASSESSMENT FORM"
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
          {/* Follow up Date & Time + Clinical Examination */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>Follow up Date & Time: Clinical Examination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Follow up Date"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(value) => updateField('followUpDate', value)}
                />
                <FormField
                  label="Follow up Time"
                  type="time"
                  value={formData.followUpTime}
                  onChange={(value) => updateField('followUpTime', value)}
                />
              </div>
              <FormField
                label="Clinical Examination"
                type="textarea"
                value={formData.clinicalExamination}
                onChange={(value) => updateField('clinicalExamination', value)}
                placeholder="Enter clinical examination findings"
              />
            </CardContent>
          </Card>

          {/* Vitals */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>Vitals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Blood Pressure"
                  value={formData.vitals.bloodPressure}
                  onChange={(value) => updateVitals('bloodPressure', value)}
                  placeholder="e.g., 120/80"
                />
                <FormField
                  label="Temperature"
                  value={formData.vitals.temperature}
                  onChange={(value) => updateVitals('temperature', value)}
                  placeholder="e.g., 98.6°F"
                />
                <FormField
                  label="Pulse Rate"
                  value={formData.vitals.pulseRate}
                  onChange={(value) => updateVitals('pulseRate', value)}
                  placeholder="e.g., 72 bpm"
                />
              </div>
              <FormField
                label="Remarks"
                type="textarea"
                value={formData.vitalsRemarks}
                onChange={(value) => updateField('vitalsRemarks', value)}
                placeholder="Enter vitals remarks"
              />
              <div className="pt-4">
                <SignatureFields
                  label="Done By"
                  value={formData.doneBySignature}
                  onChange={(signatureData) => updateField('doneBySignature', signatureData)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sample Collection */}
          <Card className="clinical-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sample Collection</CardTitle>
              <Button 
                onClick={addSample} 
                variant="outline" 
                size="sm"
                className="no-print flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Sample</span>
              </Button>
            </CardHeader>
            <CardContent>
              {formData.samples.map((sample, index) => (
                <Card key={sample.id} className="mb-4 border-2">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Sample {index + 1}</h4>
                      {formData.samples.length > 1 && (
                        <Button
                          onClick={() => removeSample(sample.id)}
                          variant="outline"
                          size="sm"
                          className="no-print text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <FormField
                        label="Type of Sample"
                        value={sample.typeOfSample}
                        onChange={(value) => updateSample(sample.id, 'typeOfSample', value)}
                        placeholder="e.g., Blood, Urine"
                      />
                      <FormField
                        label="Volume in (mL)"
                        value={sample.volumeInMl}
                        onChange={(value) => updateSample(sample.id, 'volumeInMl', value)}
                        placeholder="Volume"
                      />
                      <FormField
                        label="Collection Time (Hrs.)"
                        value={sample.collectionTimeHrs}
                        onChange={(value) => updateSample(sample.id, 'collectionTimeHrs', value)}
                        placeholder="Time"
                      />
                      <FormField
                        label="Reason for Sample Collection"
                        value={sample.reasonForCollection}
                        onChange={(value) => updateSample(sample.id, 'reasonForCollection', value)}
                        placeholder="Specify lab parameter"
                      />
                      <FormField
                        label="Collected by"
                        value={sample.collectedBy}
                        onChange={(value) => updateSample(sample.id, 'collectedBy', value)}
                        placeholder="Sign & Date"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <FormField
                label="Others (if any)"
                value={formData.othersSpecify}
                onChange={(value) => updateField('othersSpecify', value)}
                placeholder="Specify other details"
              />
            </CardContent>
          </Card>

          {/* ECG Section */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>ECG</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="ECG performed (as per protocol)"
                type="radio"
                value={formData.ecgPerformed}
                onChange={(value) => updateField('ecgPerformed', value)}
                options={[
                  { label: 'Yes', value: 'Yes' },
                  { label: 'No', value: 'No' },
                  { label: 'NA', value: 'NA' }
                ]}
              />
              
              {formData.ecgPerformed === 'Yes' && (
                <>
                  <p className="text-sm font-medium">If Yes, document in below table:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <FormField
                      label="Time"
                      type="time"
                      value={formData.ecgDetails.time}
                      onChange={(value) => updateEcgDetails('time', value)}
                    />
                    <FormField
                      label="Taken by"
                      value={formData.ecgDetails.takenBy}
                      onChange={(value) => updateEcgDetails('takenBy', value)}
                      placeholder="Name"
                    />
                    <FormField
                      label="Normal"
                      value={formData.ecgDetails.normal}
                      onChange={(value) => updateEcgDetails('normal', value)}
                      placeholder="Normal findings"
                    />
                    <FormField
                      label="Abnormal"
                      value={formData.ecgDetails.abnormal}
                      onChange={(value) => updateEcgDetails('abnormal', value)}
                      placeholder="Abnormal findings"
                    />
                    <FormField
                      label="Remarks"
                      value={formData.ecgDetails.remarks}
                      onChange={(value) => updateEcgDetails('remarks', value)}
                      placeholder="Remarks"
                    />
                  </div>
                  <FormField
                    label="Evaluated by"
                    value={formData.ecgDetails.evaluatedBy}
                    onChange={(value) => updateEcgDetails('evaluatedBy', value)}
                    placeholder="Evaluated by (name and signature)"
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Lab Report Evaluation */}
          <Card className="clinical-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>LAB REPORT EVALUATION</CardTitle>
              <Button 
                onClick={addLabTest} 
                variant="outline" 
                size="sm"
                className="no-print flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Test</span>
              </Button>
            </CardHeader>
            <CardContent>
              {formData.labTests.map((test, index) => (
                <Card key={test.id} className="mb-4 border-2">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Test {index + 1}</h4>
                      {formData.labTests.length > 1 && (
                        <Button
                          onClick={() => removeLabTest(test.id)}
                          variant="outline"
                          size="sm"
                          className="no-print text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <FormField
                        label="Name of the Test"
                        value={test.testName}
                        onChange={(value) => updateLabTest(test.id, 'testName', value)}
                        placeholder="Test name"
                      />
                      <FormField
                        label="Normal"
                        value={test.normal}
                        onChange={(value) => updateLabTest(test.id, 'normal', value)}
                        placeholder="Normal result"
                      />
                      <FormField
                        label="Abnormal (CS)"
                        value={test.abnormalCS}
                        onChange={(value) => updateLabTest(test.id, 'abnormalCS', value)}
                        placeholder="CS result"
                      />
                      <FormField
                        label="Abnormal (NCS)"
                        value={test.abnormalNCS}
                        onChange={(value) => updateLabTest(test.id, 'abnormalNCS', value)}
                        placeholder="NCS result"
                      />
                      <FormField
                        label="Remarks"
                        value={test.remarks}
                        onChange={(value) => updateLabTest(test.id, 'remarks', value)}
                        placeholder="Remarks"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Adverse Events */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>Adverse Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Did the subject experience any Adverse Event?"
                type="radio"
                value={formData.adverseEventExperienced}
                onChange={(value) => updateField('adverseEventExperienced', value)}
                options={[
                  { label: 'Yes', value: 'Yes' },
                  { label: 'No', value: 'No' }
                ]}
              />
              
              {formData.adverseEventExperienced === 'Yes' && (
                <>
                  <FormField
                    label="If yes, please specify below:"
                    type="textarea"
                    value={formData.adverseEventDetails}
                    onChange={(value) => updateField('adverseEventDetails', value)}
                    placeholder="Specify adverse event details"
                  />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Lab Parameters for Repeat</h4>
                      <Button 
                        onClick={addAdverseEvent} 
                        variant="outline" 
                        size="sm"
                        className="no-print flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Parameter</span>
                      </Button>
                    </div>
                    
                    {formData.adverseEventsList.map((event, index) => (
                      <Card key={event.id} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h5 className="text-sm font-medium">Parameter {index + 1}</h5>
                            {formData.adverseEventsList.length > 1 && (
                              <Button
                                onClick={() => removeAdverseEvent(event.id)}
                                variant="outline"
                                size="sm"
                                className="no-print text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              label="Lab parameter"
                              value={event.labParameter}
                              onChange={(value) => updateAdverseEvent(event.id, 'labParameter', value)}
                              placeholder="Lab parameter"
                            />
                            <FormField
                              label="Repeat after (days)"
                              value={event.repeatAfterDays}
                              onChange={(value) => updateAdverseEvent(event.id, 'repeatAfterDays', value)}
                              placeholder="Number of days"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Comments and Signature */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>Comments and Evaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                label="Comments"
                type="textarea"
                value={formData.comments}
                onChange={(value) => updateField('comments', value)}
                placeholder="Enter comments"
              />
              
              <SignatureFields
                label="Evaluated by PI/CI/Physician"
                value={formData.physicianSignature}
                onChange={(signatureData) => updateField('physicianSignature', signatureData)}
              />
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

export default RepeatAssessmentPage;
