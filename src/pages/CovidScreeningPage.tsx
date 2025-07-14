
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, Printer } from 'lucide-react';
import { db } from '@/lib/dexie';
import { useToast } from '@/hooks/use-toast';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { PrintableForm } from '@/components/PrintableForm';

interface CovidSymptomItem {
  symptom: string;
  yesNo: string;
  remarks: string;
}

interface ExposureItem {
  exposure: string;
  yesNo: string;
  details: string;
}

interface FormData {
  symptoms: CovidSymptomItem[];
  exposures: ExposureItem[];
  temperature: string;
  oxygenSaturation: string;
  vaccinationStatus: string;
  vaccinationDate: string;
  vaccineDose: string;
  testResult: string;
  testDate: string;
  additionalRemarks: string;
}

const yesNoOptions = ['Yes', 'No'];

const initialSymptoms: CovidSymptomItem[] = [
  { symptom: 'Fever (> 37.5°C)', yesNo: '', remarks: '' },
  { symptom: 'Cough', yesNo: '', remarks: '' },
  { symptom: 'Shortness of breath', yesNo: '', remarks: '' },
  { symptom: 'Sore throat', yesNo: '', remarks: '' },
  { symptom: 'Loss of taste or smell', yesNo: '', remarks: '' },
  { symptom: 'Fatigue', yesNo: '', remarks: '' },
  { symptom: 'Body aches', yesNo: '', remarks: '' },
  { symptom: 'Headache', yesNo: '', remarks: '' },
  { symptom: 'Nausea or vomiting', yesNo: '', remarks: '' },
  { symptom: 'Diarrhea', yesNo: '', remarks: '' },
];

const initialExposures: ExposureItem[] = [
  { exposure: 'Close contact with confirmed COVID-19 case', yesNo: '', details: '' },
  { exposure: 'Travel to high-risk area in last 14 days', yesNo: '', details: '' },
  { exposure: 'Attended large gathering in last 14 days', yesNo: '', details: '' },
  { exposure: 'Healthcare worker exposure', yesNo: '', details: '' },
];

const CovidScreeningPage: React.FC = () => {
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
  const [symptoms, setSymptoms] = useState<CovidSymptomItem[]>(initialSymptoms);
  const [exposures, setExposures] = useState<ExposureItem[]>(initialExposures);
  const [temperature, setTemperature] = useState('');
  const [oxygenSaturation, setOxygenSaturation] = useState('');
  const [vaccinationStatus, setVaccinationStatus] = useState('');
  const [vaccinationDate, setVaccinationDate] = useState('');
  const [vaccineDose, setVaccineDose] = useState('');
  const [testResult, setTestResult] = useState('');
  const [testDate, setTestDate] = useState('');
  const [additionalRemarks, setAdditionalRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          .and(form => form.template_id === 'COVID-19 Screening')
          .first();
        if (data?.answers) {
          const d = data.answers as unknown as FormData;
          setSymptoms(d.symptoms || initialSymptoms);
          setExposures(d.exposures || initialExposures);
          setTemperature(d.temperature || '');
          setOxygenSaturation(d.oxygenSaturation || '');
          setVaccinationStatus(d.vaccinationStatus || '');
          setVaccinationDate(d.vaccinationDate || '');
          setVaccineDose(d.vaccineDose || '');
          setTestResult(d.testResult || '');
          setTestDate(d.testDate || '');
          setAdditionalRemarks(d.additionalRemarks || '');
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
          .eq('template_name', 'COVID-19 Screening')
          .maybeSingle();
        if (data?.answers) {
          const d = data.answers as unknown as FormData;
          setSymptoms(d.symptoms || initialSymptoms);
          setExposures(d.exposures || initialExposures);
          setTemperature(d.temperature || '');
          setOxygenSaturation(d.oxygenSaturation || '');
          setVaccinationStatus(d.vaccinationStatus || '');
          setVaccinationDate(d.vaccinationDate || '');
          setVaccineDose(d.vaccineDose || '');
          setTestResult(d.testResult || '');
          setTestDate(d.testDate || '');
          setAdditionalRemarks(d.additionalRemarks || '');
          setIsSaved(true); // Already synced
        }
      } catch (error) {
        // ignore
      }
    };
    loadDB();
  }, [caseId]);

  // Update handlers
  const updateSymptomItem = (index: number, field: keyof CovidSymptomItem, value: string) => {
    setSymptoms(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
    setIsSaved(false);
  };

  const updateExposureItem = (index: number, field: keyof ExposureItem, value: string) => {
    setExposures(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
    setIsSaved(false);
  };

  // Save Locally (Dexie)
  const handleSaveLocal = async () => {
    try {
      const answers: FormData = {
        symptoms,
        exposures,
        temperature,
        oxygenSaturation,
        vaccinationStatus,
        vaccinationDate,
        vaccineDose,
        testResult,
        testDate,
        additionalRemarks
      };

      const existing = await db.pending_forms
        .where('patient_id').equals(caseId)
        .and(form => form.template_id === 'COVID-19 Screening')
        .first();

      if (existing) {
        await db.pending_forms.update(existing.id!, {
          answers, volunteer_id: volunteerId, study_number: studyNumber, last_modified: new Date()
        });
      } else {
        await db.pending_forms.add({
          template_id: 'COVID-19 Screening',
          patient_id: caseId,
          answers,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          created_at: new Date(),
          last_modified: new Date()
        });
      }
      setIsSaved(false);
      toast({ title: "Saved Locally", description: "COVID-19 screening saved locally." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to save locally.", variant: "destructive" });
    }
  };

  // Save to DB (Supabase)
  const handleSubmit = async () => {
    if (!volunteerId || !studyNumber || !caseId) {
      toast({ title: "Error", description: "Missing volunteer/study/case information", variant: "destructive" }); 
      return;
    }
    setLoading(true);
    try {
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: 'COVID-19 Screening',
          volunteer_id: volunteerId,
          status: "submitted",
          data: {
            medicalHistoryItems,
            familyHistoryItems,
            allergyItems,
            generalRemarks
          },
        });
        
        setIsSaved(true);
        toast({ title: "Submitted", description: "COVID-19 screening submitted successfully." });
        setLoading(false);
        return;
      } catch (apiError) {
        console.warn('Python API submission failed, falling back to Supabase:', apiError);
      }
      
      const answers: FormData = {
        symptoms,
        exposures,
        temperature,
        oxygenSaturation,
        vaccinationStatus,
        vaccinationDate,
        vaccineDose,
        testResult,
        testDate,
        additionalRemarks
      };
      // Insert or upsert into DB
      const { error } = await supabase
        .from('patient_forms')
        .upsert({
          case_id: caseId,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          template_name: 'COVID-19 Screening',
          answers: answers as any
        });
      if (error) throw error;
      setIsSaved(true);
      toast({ title: "Submitted", description: "COVID-19 screening submitted to server." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to submit.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Navigation
  const handlePrevious = () => {
    const params = new URLSearchParams({ case: caseId, volunteerId, studyNumber });
    navigate(`/employee/project/${pid}/screening/xray-evaluation?${params.toString()}`);
  };
  const handleContinue = () => {
    const params = new URLSearchParams({ case: caseId, volunteerId, studyNumber });
    navigate(`/employee/project/${pid}/screening/pregnancy-test?${params.toString()}`);
  };
  const handlePrint = () => { window.print(); };

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
        formTitle="COVID-19 Screening"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
        readOnly={isSaved}
      />

      <div className="no-print flex justify-end mb-4">
        <Button onClick={handlePrint} variant="outline" className="flex items-center space-x-2">
          <Printer className="w-4 h-4" />
          <span>Print Form</span>
        </Button>
      </div>

      <PrintableForm templateName="COVID-19 Screening">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Symptoms Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">COVID-19 Related Symptoms</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Sl.No.</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Symptoms</th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium">Yes / No</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {symptoms.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{item.symptom}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {isSaved
                            ? <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-center">{item.yesNo || 'Not specified'}</div>
                            : renderYesNoRadio(`symptom-yesNo-${index}`, item.yesNo, (val) => updateSymptomItem(index, 'yesNo', val))
                          }
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {isSaved
                            ? <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">{item.remarks || 'Not specified'}</div>
                            : (
                              <Input
                                value={item.remarks}
                                onChange={e => updateSymptomItem(index, 'remarks', e.target.value)}
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

            {/* Exposure History Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Exposure History</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Sl.No.</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Exposure Type</th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium">Yes / No</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exposures.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{item.exposure}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {isSaved
                            ? <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-center">{item.yesNo || 'Not specified'}</div>
                            : renderYesNoRadio(`exposure-yesNo-${index}`, item.yesNo, (val) => updateExposureItem(index, 'yesNo', val))
                          }
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {isSaved
                            ? <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">{item.details || 'Not specified'}</div>
                            : (
                              <Input
                                value={item.details}
                                onChange={e => updateExposureItem(index, 'details', e.target.value)}
                                placeholder="Enter details"
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

            {/* Vital Signs */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Vital Signs</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={e => { setTemperature(e.target.value); setIsSaved(false); }}
                    placeholder="37.0"
                    disabled={isSaved}
                  />
                </div>
                <div>
                  <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
                  <Input
                    id="oxygenSaturation"
                    type="number"
                    value={oxygenSaturation}
                    onChange={e => { setOxygenSaturation(e.target.value); setIsSaved(false); }}
                    placeholder="98"
                    disabled={isSaved}
                  />
                </div>
              </div>
            </div>

            {/* Vaccination Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Vaccination Status</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="vaccinationStatus">Vaccination Status</Label>
                  <select
                    id="vaccinationStatus"
                    value={vaccinationStatus}
                    onChange={e => { setVaccinationStatus(e.target.value); setIsSaved(false); }}
                    disabled={isSaved}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select status</option>
                    <option value="Unvaccinated">Unvaccinated</option>
                    <option value="Partially Vaccinated">Partially Vaccinated</option>
                    <option value="Fully Vaccinated">Fully Vaccinated</option>
                    <option value="Booster Received">Booster Received</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vaccinationDate">Last Vaccination Date</Label>
                    <Input
                      id="vaccinationDate"
                      type="date"
                      value={vaccinationDate}
                      onChange={e => { setVaccinationDate(e.target.value); setIsSaved(false); }}
                      disabled={isSaved}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vaccineDose">Total Doses Received</Label>
                    <Input
                      id="vaccineDose"
                      type="number"
                      value={vaccineDose}
                      onChange={e => { setVaccineDose(e.target.value); setIsSaved(false); }}
                      placeholder="0"
                      disabled={isSaved}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div>
              <h3 className="text-lg font-semibold mb-4">COVID-19 Test Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testResult">Latest Test Result</Label>
                  <select
                    id="testResult"
                    value={testResult}
                    onChange={e => { setTestResult(e.target.value); setIsSaved(false); }}
                    disabled={isSaved}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select result</option>
                    <option value="Negative">Negative</option>
                    <option value="Positive">Positive</option>
                    <option value="Pending">Pending</option>
                    <option value="Not Tested">Not Tested</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="testDate">Test Date</Label>
                  <Input
                    id="testDate"
                    type="date"
                    value={testDate}
                    onChange={e => { setTestDate(e.target.value); setIsSaved(false); }}
                    disabled={isSaved}
                  />
                </div>
              </div>
            </div>

            {/* Additional Remarks */}
            <div>
              <Label htmlFor="additionalRemarks">Additional Remarks</Label>
              <Input
                id="additionalRemarks"
                value={additionalRemarks}
                onChange={e => { setAdditionalRemarks(e.target.value); setIsSaved(false); }}
                placeholder="Any additional remarks or observations"
                disabled={isSaved}
              />
            </div>
          </CardContent>
        </Card>
      </PrintableForm>

      <div className="no-print flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={handlePrevious} className="flex items-center space-x-2">
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>
        <div className="flex gap-4">
          <Button type="button" onClick={handleSaveLocal} disabled={loading}>
            Save Locally
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading || isSaved}>
            {loading ? 'Saving...' : (isSaved ? 'Saved' : 'Submit')}
          </Button>
          <Button type="button" onClick={handleContinue} disabled={!isSaved}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CovidScreeningPage;
