import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Printer } from 'lucide-react';
import { db } from '@/lib/dexie';
import { useToast } from '@/hooks/use-toast';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { PrintableForm } from '@/components/PrintableForm';
import  CommonFormNavigation  from '@/components/CommonFormNavigation';
import { useEmployeeFormFlow } from '@/hooks/useEmployeeFormFlow';

interface MedicalHistoryItem { particulars: string; yesNo: string; remarks: string; }
interface FamilyHistoryItem { disease: string; yesNo: string; remarks: string; }
interface AllergyItem { type: string; yesNo: string; remarks: string; }

interface FormData {
  medicalHistory: MedicalHistoryItem[];
  familyHistory: FamilyHistoryItem[];
  allergies: AllergyItem[];
  generalRemarks: string;
}

const yesNoOptions = ['Yes', 'No'];
const initialMedicalHistory: MedicalHistoryItem[] = [
  { particulars: 'Any present History', yesNo: '', remarks: '' },
  { particulars: 'Any relevant / past medical History', yesNo: '', remarks: '' },
  { particulars: 'Surgical History', yesNo: '', remarks: '' },
  { particulars: 'Past Medication', yesNo: '', remarks: '' },
];
const initialFamilyHistory: FamilyHistoryItem[] = [
  { disease: 'Hypertension', yesNo: '', remarks: '' },
  { disease: 'Diabetes Mellitus', yesNo: '', remarks: '' },
  { disease: 'Bleeding Disorder', yesNo: '', remarks: '' },
  { disease: 'Epilepsy', yesNo: '', remarks: '' },
  { disease: 'Bronchial Asthma', yesNo: '', remarks: '' },
  { disease: 'Jaundice', yesNo: '', remarks: '' },
  { disease: 'Renal Disease', yesNo: '', remarks: '' },
  { disease: 'Neurological Disease', yesNo: '', remarks: '' },
  { disease: 'Tuberculosis', yesNo: '', remarks: '' },
  { disease: 'Thyroid Disease', yesNo: '', remarks: '' },
  { disease: 'Other (Specify)', yesNo: '', remarks: '' },
];
const initialAllergies: AllergyItem[] = [
  { type: 'Food Allergy', yesNo: '', remarks: '' },
  { type: 'Drug Allergy', yesNo: '', remarks: '' },
  { type: 'Allergy to animal', yesNo: '', remarks: '' },
];

const MedicalHistoryPage: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Params
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case') || 'temp-case';
  const [volunteerId, setVolunteerId] = useState('');
  const [studyNumber, setStudyNumber] = useState('');

  // State
  const [medicalHistoryItems, setMedicalHistoryItems] = useState<MedicalHistoryItem[]>(initialMedicalHistory);
  const [familyHistoryItems, setFamilyHistoryItems] = useState<FamilyHistoryItem[]>(initialFamilyHistory);
  const [allergyItems, setAllergyItems] = useState<AllergyItem[]>(initialAllergies);
  const [generalRemarks, setGeneralRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    saveLocalAnswers,
    goToForm,
    isFirst,
    isLast,
    sectionIndex,
  } = useEmployeeFormFlow("Medical History");

  // Load case info for volunteer id, study number
  useEffect(() => {
    const loadCaseInfo = async () => {
      try {
        const caseData = await db.pending_forms
          .where('patient_id')
          .equals(caseId)
          .first();
        if (caseData) {
          setVolunteerId(caseData.volunteer_id || '');
          setStudyNumber(caseData.study_number || '');
        }
      } catch (err) {
        console.error('Failed to load case info:', err);
      }
    };
    loadCaseInfo();
  }, [caseId]);

  // Load local saved data if exists
  useEffect(() => {
    const loadLocal = async () => {
      try {
        const data = await db.pending_forms
          .where('patient_id').equals(caseId)
          .and(form => form.template_id === 'Medical History')
          .first();
        if (data?.answers) {
          const d = data.answers as unknown as FormData;
          setMedicalHistoryItems(d.medicalHistory || initialMedicalHistory);
          setFamilyHistoryItems(d.familyHistory || initialFamilyHistory);
          setAllergyItems(d.allergies || initialAllergies);
          setGeneralRemarks(d.generalRemarks || '');
          setIsSaved(false);
        }
      } catch (err) {
        // ignore
      }
    };
    loadLocal();
  }, [caseId]);

  // Load from DB if exists (for cloud sync, not editable)
  useEffect(() => {
    const loadDB = async () => {
      try {
        const { data } = await supabase
          .from('patient_forms')
          .select('answers')
          .eq('case_id', caseId)
          .eq('template_name', 'Medical History')
          .maybeSingle();
        if (data?.answers) {
          const d = data.answers as unknown as FormData;
          setMedicalHistoryItems(d.medicalHistory || initialMedicalHistory);
          setFamilyHistoryItems(d.familyHistory || initialFamilyHistory);
          setAllergyItems(d.allergies || initialAllergies);
          setGeneralRemarks(d.generalRemarks || '');
          setIsSaved(true); // Already synced
        }
      } catch (error) {
        // ignore
      }
    };
    loadDB();
  }, [caseId]);

  // Update handlers
  const updateMedicalHistoryItem = (index: number, field: keyof MedicalHistoryItem, value: string) => {
    setMedicalHistoryItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
    setIsSaved(false);
  };
  const updateFamilyHistoryItem = (index: number, field: keyof FamilyHistoryItem, value: string) => {
    setFamilyHistoryItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
    setIsSaved(false);
  };
  const updateAllergyItem = (index: number, field: keyof AllergyItem, value: string) => {
    setAllergyItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
    setIsSaved(false);
  };

  // Save Locally (Dexie)
  const handleSaveLocal = async () => {
    const answers: FormData = {
      medicalHistory: medicalHistoryItems,
      familyHistory: familyHistoryItems, 
      allergies: allergyItems,
      generalRemarks
    };
    setLoading(true);
    try {
      await saveLocalAnswers(answers);
      setIsSaved(true);
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: 'Medical History',
          volunteer_id: volunteerId || '',
          status: "submitted",
          data: answers,
        });
        toast({ title: "Saved", description: "Medical history saved successfully." });
      } catch (apiError) {
        console.warn('Python API submission failed:', apiError);
        toast({ title: "Saved Locally", description: "Medical history saved locally." });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save locally.", variant: "destructive" });
      setIsSaved(false);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    const answers: FormData = {
      medicalHistory: medicalHistoryItems,
      familyHistory: familyHistoryItems,
      allergies: allergyItems,
      generalRemarks
    };
    await saveLocalAnswers(answers);
    setIsSaved(true);
    goToForm(answers, "next");
  };

  const handlePrevious = async () => {
  await handleSaveLocal();        // keep user data
  goToForm(undefined, "previous"); // <- same util you already use for Continue
};


  // Radio group
  const renderYesNoRadio = (
    name: string, selectedValue: string, onChange: (value: string) => void, disabled = false
  ) => (
    <div className="flex gap-6 justify-center">
      {yesNoOptions.map(opt => (
        <label key={opt} className="flex flex-col items-center cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={selectedValue === opt}
            onChange={() => onChange(opt)}
            className="w-5 h-5 accent-blue-600"
            disabled={disabled}
          />
          <span className="text-sm mt-1">{opt}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CommonFormHeader
        title="Medical History"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
      />

      <PrintableForm templateName="Medical History">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Medical History Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Medical History</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Sl.No.</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Particulars</th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium">Yes / No</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalHistoryItems.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{item.particulars}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {isSaved
                            ? <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-center">{item.yesNo || 'Not specified'}</div>
                            : renderYesNoRadio(`medicalHistory-yesNo-${index}`, item.yesNo, (val) => updateMedicalHistoryItem(index, 'yesNo', val))
                          }
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {isSaved
                            ? <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">{item.remarks || 'Not specified'}</div>
                            : (
                              <Input
                                value={item.remarks}
                                onChange={e => updateMedicalHistoryItem(index, 'remarks', e.target.value)}
                                placeholder="Enter remarks"
                              />
                            )
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Family History Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Family History</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Sl.No.</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Type of diseases</th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium">Yes / No</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {familyHistoryItems.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{item.disease}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {isSaved
                            ? <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-center">{item.yesNo || 'Not specified'}</div>
                            : renderYesNoRadio(`familyHistory-yesNo-${index}`, item.yesNo, (val) => updateFamilyHistoryItem(index, 'yesNo', val))
                          }
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {isSaved
                            ? <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">{item.remarks || 'Not specified'}</div>
                            : (
                              <Input
                                value={item.remarks}
                                onChange={e => updateFamilyHistoryItem(index, 'remarks', e.target.value)}
                                placeholder="Enter remarks"
                              />
                            )
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Allergies Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">History of Allergies</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Sl.No.</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Type of allergy</th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium">Yes / No</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allergyItems.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{item.type}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {isSaved
                            ? <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-center">{item.yesNo || 'Not specified'}</div>
                            : renderYesNoRadio(`allergy-yesNo-${index}`, item.yesNo, (val) => updateAllergyItem(index, 'yesNo', val))
                          }
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {isSaved
                            ? <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">{item.remarks || 'Not specified'}</div>
                            : (
                              <Input
                                value={item.remarks}
                                onChange={e => updateAllergyItem(index, 'remarks', e.target.value)}
                                placeholder="Enter remarks"
                              />
                            )
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* General Remarks */}
            <div>
              <Label htmlFor="generalRemarks">General Remarks</Label>
              <Input
                id="generalRemarks"
                value={generalRemarks}
                onChange={e => { setGeneralRemarks(e.target.value); setIsSaved(false); }}
                placeholder="Any general remarks"
                disabled={isSaved}
              />
            </div>

            <CommonFormNavigation
              onPrevious={handlePrevious}
              onSaveLocal={handleSaveLocal}
              onContinue={handleContinue}
              loading={loading}
              isSaved={isSaved}
              showPrint={true}
            />
          </CardContent>
        </Card>
      </PrintableForm>
    </div>
  );
};

export default MedicalHistoryPage;
