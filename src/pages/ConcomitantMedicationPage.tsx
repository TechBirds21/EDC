
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

interface MedicationEntry {
  id: string;
  srNo: string;
  brandName: string;
  drugName: string;
  batchLotNo: string;
  expiryDate: string;
  dosageFormStrength: string;
  routeOfAdministration: string;
  medicationGivenDate: string;
  medicationGivenTime: string;
  givenBySignDate: string;
}

interface WithdrawalData {
  date: string;
  time: string;
  reason: string;
  signature: SignatureData;
}

interface ConcomitantMedicationForm {
  projectNo: string;
  studyNo: string;
  subjectNo: string;
  periodNo: string;
  washOutPeriod: boolean;
  postStudy: boolean;
  ifOtherSpecify: string;
  medications: MedicationEntry[];
  subjectWithdrawalInfo: string;
  checkedByPI: string;
  piSignDate: string;
  withdrawal: WithdrawalData;
}

const initialMedication: Omit<MedicationEntry, 'id'> = {
  srNo: '',
  brandName: '',
  drugName: '',
  batchLotNo: '',
  expiryDate: '',
  dosageFormStrength: '',
  routeOfAdministration: '',
  medicationGivenDate: '',
  medicationGivenTime: '',
  givenBySignDate: ''
};

const initialFormData: ConcomitantMedicationForm = {
  projectNo: '',
  studyNo: '',
  subjectNo: '',
  periodNo: '01',
  washOutPeriod: false,
  postStudy: false,
  ifOtherSpecify: '',
  medications: [],
  subjectWithdrawalInfo: '',
  checkedByPI: '',
  piSignDate: '',
  withdrawal: {
    date: '',
    time: '',
    reason: '',
    signature: {
      name: '',
      date: '',
      time: '',
    },
  }
};

const ConcomitantMedicationPage: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [formData, setFormData] = useState<ConcomitantMedicationForm>(initialFormData);
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
    const localKey = `concomitantMedication_${volunteerId}`;
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
        .eq('template_name', 'Concomitant Medication')
        .maybeSingle();

      if (error) {
        console.error('Error loading data:', error);
        return;
      }

      if (data?.answers) {
        const answers = data.answers as unknown as ConcomitantMedicationForm;
        setFormData(answers);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading concomitant medication data:', error);
    }
  };

  const updateFormData = (updates: Partial<ConcomitantMedicationForm>) => {
    setFormData(prev => {
      const updated = { ...prev, ...updates };
      
      // Save to localStorage
      if (volunteerId) {
        const localKey = `concomitantMedication_${volunteerId}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const updateWithdrawalField = (field: keyof WithdrawalData, value: string | SignatureData) => {
    updateFormData({
      withdrawal: {
        ...formData.withdrawal,
        [field]: value
      }
    });
  };

  const addMedication = () => {
    const newMedication: MedicationEntry = {
      ...initialMedication,
      id: Date.now().toString(),
      srNo: (formData.medications.length + 1).toString()
    };
    
    updateFormData({
      medications: [...formData.medications, newMedication]
    });
  };

  const updateMedication = (id: string, field: keyof MedicationEntry, value: string) => {
    const updatedMedications = formData.medications.map(med =>
      med.id === id ? { ...med, [field]: value } : med
    );
    
    updateFormData({ medications: updatedMedications });
  };

  const removeMedication = (id: string) => {
    const updatedMedications = formData.medications.filter(med => med.id !== id);
    updateFormData({ medications: updatedMedications });
  };

  const handleSave = async () => {
    if (!caseId || !volunteerId || !studyNumber) {
      toast.error('Missing required information');
      return; 
    }

    setLoading(true);
    
    try {
      // Save to localStorage
      const localKey = `concomitantMedication_${volunteerId}`;
      localStorage.setItem(localKey, JSON.stringify(formData));
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: 'Concomitant Medication',
          volunteer_id: volunteerId,
          status: "submitted",
          data: formData,
        });
        
        setIsSaved(true);
        toast.success('Concomitant medication saved successfully');
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
          template_name: 'Concomitant Medication',
          answers: formData as any
        });

      if (error) throw error;

      setIsSaved(true);
      toast.success('Concomitant medication saved successfully');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save concomitant medication');
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
    navigate(`/employee/project/${pid}/post-study/adverse-event?${params.toString()}`);
  };

  const handleNext = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    if (volunteerId) params.set('volunteerId', volunteerId);
    if (studyNumber) params.set('studyNumber', studyNumber);
    navigate(`/employee/project/${pid}/post-study/withdrawal?${params.toString()}`);
  };

  return (
    <PrintableForm templateName="Concomitant Medication">
      <CommonFormHeader
        formTitle="CONCOMITANT MEDICATION & SUBJECT WITHDRAWAL"
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
          {/* Header Information */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>Form Header</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <FormField
                  label="Project No./Study No."
                  value={formData.projectNo}
                  onChange={(val) => updateFormData({ projectNo: val })}
                  placeholder="Enter project/study number"
                />
                <FormField
                  label="Subject No."
                  value={formData.subjectNo}
                  onChange={(val) => updateFormData({ subjectNo: val })}
                  placeholder="Enter subject number"
                />
                <FormField
                  label="Period No."
                  type="select"
                  value={formData.periodNo}
                  onChange={(val) => updateFormData({ periodNo: val })}
                  options={[
                    { label: '01', value: '01' },
                    { label: '02', value: '02' },
                    { label: '03', value: '03' },
                    { label: '04', value: '04' }
                  ]}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="washout"
                    checked={formData.washOutPeriod}
                    onChange={(e) => updateFormData({ washOutPeriod: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="washout" className="text-sm">Wash out Period</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="poststudy"
                    checked={formData.postStudy}
                    onChange={(e) => updateFormData({ postStudy: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="poststudy" className="text-sm">Post study</label>
                </div>
              </div>
              
              <FormField
                label="If Other (Specify):"
                value={formData.ifOtherSpecify}
                onChange={(val) => updateFormData({ ifOtherSpecify: val })}
                placeholder="Specify if other"
              />
            </CardContent>
          </Card>

          {/* Concomitant Medications Table */}
          <Card className="clinical-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Concomitant Medications</CardTitle>
              <Button 
                onClick={addMedication} 
                variant="outline" 
                size="sm"
                className="no-print flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medication</span>
              </Button>
            </CardHeader>
            <CardContent>
              {formData.medications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No medications recorded. Click "Add Medication" to start.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-2 py-2 text-left border-r text-xs">Sr. No.</th>
                        <th className="px-2 py-2 text-left border-r text-xs">Brand Name</th>
                        <th className="px-2 py-2 text-left border-r text-xs">Drug name</th>
                        <th className="px-2 py-2 text-left border-r text-xs">Batch/ Lot No.</th>
                        <th className="px-2 py-2 text-left border-r text-xs">Expiry date</th>
                        <th className="px-2 py-2 text-left border-r text-xs">Dosage form & Strength</th>
                        <th className="px-2 py-2 text-left border-r text-xs">Route of administration</th>
                        <th className="px-2 py-2 text-left border-r text-xs">Medication given Date</th>
                        <th className="px-2 py-2 text-left border-r text-xs">Time</th>
                        <th className="px-2 py-2 text-left border-r text-xs">Given by (Sign & Date)</th>
                        <th className="px-2 py-2 text-left text-xs no-print">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.medications.map((medication) => (
                        <tr key={medication.id} className="border-b">
                          <td className="px-2 py-2 border-r">
                            <input
                              type="text"
                              value={medication.srNo}
                              onChange={(e) => updateMedication(medication.id, 'srNo', e.target.value)}
                              className="w-full px-1 py-1 text-xs border-none focus:outline-none"
                              placeholder="Sr."
                            />
                          </td>
                          <td className="px-2 py-2 border-r">
                            <input
                              type="text"
                              value={medication.brandName}
                              onChange={(e) => updateMedication(medication.id, 'brandName', e.target.value)}
                              className="w-full px-1 py-1 text-xs border-none focus:outline-none"
                              placeholder="Brand name"
                            />
                          </td>
                          <td className="px-2 py-2 border-r">
                            <input
                              type="text"
                              value={medication.drugName}
                              onChange={(e) => updateMedication(medication.id, 'drugName', e.target.value)}
                              className="w-full px-1 py-1 text-xs border-none focus:outline-none"
                              placeholder="Drug name"
                            />
                          </td>
                          <td className="px-2 py-2 border-r">
                            <input
                              type="text"
                              value={medication.batchLotNo}
                              onChange={(e) => updateMedication(medication.id, 'batchLotNo', e.target.value)}
                              className="w-full px-1 py-1 text-xs border-none focus:outline-none"
                              placeholder="Batch/Lot"
                            />
                          </td>
                          <td className="px-2 py-2 border-r">
                            <input
                              type="date"
                              value={medication.expiryDate}
                              onChange={(e) => updateMedication(medication.id, 'expiryDate', e.target.value)}
                              className="w-full px-1 py-1 text-xs border-none focus:outline-none"
                            />
                          </td>
                          <td className="px-2 py-2 border-r">
                            <input
                              type="text"
                              value={medication.dosageFormStrength}
                              onChange={(e) => updateMedication(medication.id, 'dosageFormStrength', e.target.value)}
                              className="w-full px-1 py-1 text-xs border-none focus:outline-none"
                              placeholder="Dosage & strength"
                            />
                          </td>
                          <td className="px-2 py-2 border-r">
                            <input
                              type="text"
                              value={medication.routeOfAdministration}
                              onChange={(e) => updateMedication(medication.id, 'routeOfAdministration', e.target.value)}
                              className="w-full px-1 py-1 text-xs border-none focus:outline-none"
                              placeholder="Route"
                            />
                          </td>
                          <td className="px-2 py-2 border-r">
                            <input
                              type="date"
                              value={medication.medicationGivenDate}
                              onChange={(e) => updateMedication(medication.id, 'medicationGivenDate', e.target.value)}
                              className="w-full px-1 py-1 text-xs border-none focus:outline-none"
                            />
                          </td>
                          <td className="px-2 py-2 border-r">
                            <input
                              type="time"
                              value={medication.medicationGivenTime}
                              onChange={(e) => updateMedication(medication.id, 'medicationGivenTime', e.target.value)}
                              className="w-full px-1 py-1 text-xs border-none focus:outline-none"
                            />
                          </td>
                          <td className="px-2 py-2 border-r">
                            <input
                              type="text"
                              value={medication.givenBySignDate}
                              onChange={(e) => updateMedication(medication.id, 'givenBySignDate', e.target.value)}
                              className="w-full px-1 py-1 text-xs border-none focus:outline-none"
                              placeholder="Sign & date"
                            />
                          </td>
                          <td className="px-2 py-2 no-print">
                            <Button
                              onClick={() => removeMedication(medication.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subject Withdrawal Section */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>Subject Withdrawal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                label="If subject withdraws from the study, mentioned the last blood sample collection time point:"
                type="textarea"
                value={formData.subjectWithdrawalInfo}
                onChange={(val) => updateFormData({ subjectWithdrawalInfo: val })}
                placeholder="Enter withdrawal information and last blood sample collection time point"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6">
                <FormField
                  label="Date"
                  type="date"
                  value={formData.withdrawal.date}
                  onChange={(value) => updateWithdrawalField('date', value)}
                />
                <FormField
                  label="Time"
                  type="time"
                  value={formData.withdrawal.time}
                  onChange={(value) => updateWithdrawalField('time', value)}
                />
              </div>
              
              <div className="mb-6">
                <FormField
                  label="Reason for Withdrawal"
                  type="textarea"
                  value={formData.withdrawal.reason}
                  onChange={(value) => updateWithdrawalField('reason', value)}
                  placeholder="Enter reason for withdrawal"
                />
              </div>

              <SignatureFields
                label="Subject Signature"
                value={formData.withdrawal.signature}
                onChange={(signatureData) => updateWithdrawalField('signature', signatureData)}
              />
            </CardContent>
          </Card>

          {/* PI Signature */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>Principal Investigator Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Checked by PI/CI/Physician:"
                  value={formData.checkedByPI}
                  onChange={(val) => updateFormData({ checkedByPI: val })}
                  placeholder="Enter name"
                />
                <FormField
                  label="Sign & Date"
                  value={formData.piSignDate}
                  onChange={(val) => updateFormData({ piSignDate: val })}
                  placeholder="Signature and date"
                />
              </div>
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

export default ConcomitantMedicationPage;
