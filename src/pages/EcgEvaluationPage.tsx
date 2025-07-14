
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { PrintableForm } from '@/components/PrintableForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ChevronLeft, Printer } from 'lucide-react';

interface EcgEvaluationData {
  takenBy: { name: string; date: string; time: string };
  normal: boolean;
  abnormal: boolean;
  remarks: string;
  evaluatedBy: { name: string; date: string; time: string };
}

interface XrayEvaluationData {
  takenBy: { name: string; date: string; time: string };
  normal: boolean;
  abnormal: boolean;
  remarks: string;
  evaluatedBy: { name: string; date: string; time: string };
}

interface SampleCollectionData {
  sample: string;
  sampleType: string;
  volume: string;
  collectionTime: string;
  collectionDate: string;
  doneBy: { name: string; date: string; time: string };
}

interface LabReportData {
  test: string;
  doneBy: { name: string; date: string; time: string };
  normal: boolean;
  abnormal: boolean;
  cns: boolean;
  cs: boolean;
  remarks: string;
}

interface FormData {
  ecgEvaluation: EcgEvaluationData;
  xrayEvaluation: XrayEvaluationData;
  sampleCollections: SampleCollectionData[];
  labReports: LabReportData[];
  isParticipationFit: boolean;
  specification: string;
  comments: string;
  completedBy: string;
}

const initialLabReports: LabReportData[] = [
  { test: 'Haematology', doneBy: { name: '', date: '', time: '' }, normal: false, abnormal: false, cns: false, cs: false, remarks: '' },
  { test: 'Biochemistry', doneBy: { name: '', date: '', time: '' }, normal: false, abnormal: false, cns: false, cs: false, remarks: '' },
  { test: 'Urine Analysis', doneBy: { name: '', date: '', time: '' }, normal: false, abnormal: false, cns: false, cs: false, remarks: '' },
  { test: 'Serology', doneBy: { name: '', date: '', time: '' }, normal: false, abnormal: false, cns: false, cs: false, remarks: '' },
];

const EcgEvaluationPage: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  // State management
  const [ecgEvaluation, setEcgEvaluation] = useState<EcgEvaluationData>({
    takenBy: { name: '', date: '', time: '' },
    normal: false,
    abnormal: false,
    remarks: '',
    evaluatedBy: { name: '', date: '', time: '' },
  });

  const [xrayEvaluation, setXrayEvaluation] = useState<XrayEvaluationData>({
    takenBy: { name: '', date: '', time: '' },
    normal: false,
    abnormal: false,
    remarks: '',
    evaluatedBy: { name: '', date: '', time: '' },
  });

  const [sampleCollections, setSampleCollections] = useState<SampleCollectionData[]>([{
    sample: '',
    sampleType: '',
    volume: '',
    collectionTime: '',
    collectionDate: '',
    doneBy: { name: '', date: '', time: '' },
  }]);

  const [labReports, setLabReports] = useState<LabReportData[]>(initialLabReports);
  const [isParticipationFit, setIsParticipationFit] = useState(true);
  const [specification, setSpecification] = useState('');
  const [comments, setComments] = useState('');
  const [completedBy, setCompletedBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (caseId) {
      loadExistingData();
    }
  }, [caseId]);

  // Load existing data from localStorage
  useEffect(() => {
    const storedEcgData = localStorage.getItem(`ecgEvaluation_${volunteerId}`);
    if (storedEcgData) {
      try {
        const parsedData = JSON.parse(storedEcgData);
        if (parsedData.ecgEvaluation) setEcgEvaluation(parsedData.ecgEvaluation);
        if (parsedData.xrayEvaluation) setXrayEvaluation(parsedData.xrayEvaluation);
        if (parsedData.sampleCollections) setSampleCollections(parsedData.sampleCollections);
        if (parsedData.labReports) setLabReports(parsedData.labReports);
        if (parsedData.isParticipationFit !== undefined) setIsParticipationFit(parsedData.isParticipationFit);
        if (parsedData.specification) setSpecification(parsedData.specification);
        if (parsedData.comments) setComments(parsedData.comments);
        if (parsedData.completedBy) setCompletedBy(parsedData.completedBy);
      } catch (err) {
        console.error('Error parsing localStorage data:', err);
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
        .eq('template_name', 'ECG Evaluation')
        .maybeSingle();

      if (error) {
        console.error('Error loading data:', error);
        return;
      }

      if (data?.answers) {
        const answers = data.answers as unknown as FormData;
        if (answers.ecgEvaluation) setEcgEvaluation(answers.ecgEvaluation);
        if (answers.xrayEvaluation) setXrayEvaluation(answers.xrayEvaluation);
        if (answers.sampleCollections) setSampleCollections(answers.sampleCollections);
        if (answers.labReports) setLabReports(answers.labReports);
        if (answers.isParticipationFit !== undefined) setIsParticipationFit(answers.isParticipationFit);
        if (answers.specification) setSpecification(answers.specification);
        if (answers.comments) setComments(answers.comments);
        if (answers.completedBy) setCompletedBy(answers.completedBy);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading ECG evaluation:', error);
    }
  };

  // Sample Collection Handlers
  const addSampleCollection = () => {
    setSampleCollections(prev => [...prev, {
      sample: '',
      sampleType: '',
      volume: '',
      collectionTime: '',
      collectionDate: '',
      doneBy: { name: '', date: '', time: '' },
    }]);
    setIsSaved(false);
  };

  const removeSampleCollection = (idx: number) => {
    setSampleCollections(prev => prev.filter((_, i) => i !== idx));
    setIsSaved(false);
  };

  const updateSampleCollection = (index: number, field: keyof SampleCollectionData, value: string) => {
    setSampleCollections(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
    setIsSaved(false);
  };

  const updateSampleCollectionSignature = (index: number, field: keyof SampleCollectionData['doneBy'], value: string) => {
    setSampleCollections(prev => prev.map((item, i) =>
      i === index ? { ...item, doneBy: { ...item.doneBy, [field]: value } } : item
    ));
    setIsSaved(false);
  };

  // Lab Reports
  const updateLabReport = (
    index: number,
    field: keyof LabReportData,
    value: boolean | string | LabReportData['doneBy']
  ) => {
    setLabReports(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!caseId || !volunteerId || !studyNumber) {
      toast.error('Missing required information');
      return;
    }

    setLoading(true);
    
    try {
      const formData: FormData = {
        ecgEvaluation,
        xrayEvaluation,
        sampleCollections,
        labReports,
        isParticipationFit,
        specification,
        comments,
        completedBy,
      };

      // Save to localStorage
      localStorage.setItem(`ecgEvaluation_${volunteerId}`, JSON.stringify(formData));

      // Save to database
      const { error } = await supabase
        .from('patient_forms')
        .upsert({
          case_id: caseId,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          template_name: 'ECG Evaluation',
          answers: formData as any
        });

      if (error) throw error;
      const answers = {
        ecgEvaluation,
        xrayEvaluation,
        sampleCollections,
        labReports,
        isParticipationFit,
        specification,
        comments,
        completedBy,
      };
      
      await saveLocalAnswers(answers);
      setIsSaved(true);
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: 'ECG Evaluation',
          volunteer_id: volunteerId || '',
          status: "submitted",
          data: answers,
        });
        toast.success('ECG evaluation saved successfully');
      } catch (apiError) {
        console.warn('Python API submission failed:', apiError);
        toast.success('ECG evaluation saved locally');
      }
    } catch (error) {
      toast.error('Failed to save ECG evaluation locally');
      toast.error('Failed to save evaluation');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Navigation
  const handlePrevious = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    if (volunteerId) params.set('volunteerId', volunteerId);
    if (studyNumber) params.set('studyNumber', studyNumber);
    
    navigate(`/employee/project/${pid}/screening/systemic-exam?${params.toString()}`);
  };

  const handleContinue = () => {
    if (!isSaved) {
      toast.error('Please save the form before continuing');
      return;
    }

    // Navigate to next form or completion page
    toast.success('ECG Evaluation completed successfully');
  };

  return (
    <PrintableForm templateName="ECG & X-ray Evaluation">
      <CommonFormHeader
        title="ECG & X-ray Evaluation Report"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
      />

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* ECG Evaluation Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ECG Evaluation</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Test</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Taken by (Sign & Date)</th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium" colSpan={2}>Evaluation Status</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Remarks</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Evaluated by (Sign & Date)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm">ECG</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="space-y-2">
                        <FormField
                          label=""
                          value={ecgEvaluation.takenBy.name}
                          onChange={(value) => setEcgEvaluation(prev => ({
                            ...prev, takenBy: { ...prev.takenBy, name: value }
                          }))}
                          placeholder="Name"
                        />
                        <Input
                          type="date"
                          value={ecgEvaluation.takenBy.date}
                          onChange={(e) => setEcgEvaluation(prev => ({
                            ...prev, takenBy: { ...prev.takenBy, date: e.target.value }
                          }))}
                        />
                        <FormField
                          label=""
                          type="text"
                          value={ecgEvaluation.takenBy.time}
                          onChange={(value) => setEcgEvaluation(prev => ({
                            ...prev, takenBy: { ...prev.takenBy, time: value }
                          }))}
                          placeholder="HH:MM"
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={ecgEvaluation.normal}
                          onChange={(e) => setEcgEvaluation(prev => ({
                            ...prev, normal: e.target.checked, abnormal: e.target.checked ? false : prev.abnormal
                          }))}
                          className="form-checkbox h-5 w-5"
                        />
                        <span className="ml-2">Normal</span>
                      </label>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={ecgEvaluation.abnormal}
                          onChange={(e) => setEcgEvaluation(prev => ({
                            ...prev, abnormal: e.target.checked, normal: e.target.checked ? false : prev.normal
                          }))}
                          className="form-checkbox h-5 w-5"
                        />
                        <span className="ml-2">Abnormal</span>
                      </label>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <FormField
                        label=""
                        value={ecgEvaluation.remarks}
                        onChange={(value) => setEcgEvaluation(prev => ({
                          ...prev, remarks: value
                        }))}
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="space-y-2">
                        <FormField
                          label=""
                          value={ecgEvaluation.evaluatedBy.name}
                          onChange={(value) => setEcgEvaluation(prev => ({
                            ...prev, evaluatedBy: { ...prev.evaluatedBy, name: value }
                          }))}
                          placeholder="Name"
                        />
                        <Input
                          type="date"
                          value={ecgEvaluation.evaluatedBy.date}
                          onChange={(e) => setEcgEvaluation(prev => ({
                            ...prev, evaluatedBy: { ...prev.evaluatedBy, date: e.target.value }
                          }))}
                        />
                        <FormField
                          label=""
                          type="text"
                          value={ecgEvaluation.evaluatedBy.time}
                          onChange={(value) => setEcgEvaluation(prev => ({
                            ...prev, evaluatedBy: { ...prev.evaluatedBy, time: value }
                          }))}
                          placeholder="HH:MM"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* X-ray Evaluation Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">X-ray Evaluation</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Test</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Taken by (Sign & Date)</th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium" colSpan={2}>Evaluation Status</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Remarks</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Evaluated by (Sign & Date)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm">X-ray</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="space-y-2">
                        <FormField
                          label=""
                          value={xrayEvaluation.takenBy.name}
                          onChange={(value) => setXrayEvaluation(prev => ({
                            ...prev, takenBy: { ...prev.takenBy, name: value }
                          }))}
                          placeholder="Name"
                        />
                        <Input
                          type="date"
                          value={xrayEvaluation.takenBy.date}
                          onChange={(e) => setXrayEvaluation(prev => ({
                            ...prev, takenBy: { ...prev.takenBy, date: e.target.value }
                          }))}
                        />
                        <FormField
                          label=""
                          type="text"
                          value={xrayEvaluation.takenBy.time}
                          onChange={(value) => setXrayEvaluation(prev => ({
                            ...prev, takenBy: { ...prev.takenBy, time: value }
                          }))}
                          placeholder="HH:MM"
                        />
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={xrayEvaluation.normal}
                          onChange={(e) => setXrayEvaluation(prev => ({
                            ...prev, normal: e.target.checked, abnormal: e.target.checked ? false : prev.abnormal
                          }))}
                          className="form-checkbox h-5 w-5"
                        />
                        <span className="ml-2">Normal</span>
                      </label>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={xrayEvaluation.abnormal}
                          onChange={(e) => setXrayEvaluation(prev => ({
                            ...prev, abnormal: e.target.checked, normal: e.target.checked ? false : prev.normal
                          }))}
                          className="form-checkbox h-5 w-5"
                        />
                        <span className="ml-2">Abnormal</span>
                      </label>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <FormField
                        label=""
                        value={xrayEvaluation.remarks}
                        onChange={(value) => setXrayEvaluation(prev => ({
                          ...prev, remarks: value
                        }))}
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="space-y-2">
                        <FormField
                          label=""
                          value={xrayEvaluation.evaluatedBy.name}
                          onChange={(value) => setXrayEvaluation(prev => ({
                            ...prev, evaluatedBy: { ...prev.evaluatedBy, name: value }
                          }))}
                          placeholder="Name"
                        />
                        <Input
                          type="date"
                          value={xrayEvaluation.evaluatedBy.date}
                          onChange={(e) => setXrayEvaluation(prev => ({
                            ...prev, evaluatedBy: { ...prev.evaluatedBy, date: e.target.value }
                          }))}
                        />
                        <FormField
                          label=""
                          type="text"
                          value={xrayEvaluation.evaluatedBy.time}
                          onChange={(value) => setXrayEvaluation(prev => ({
                            ...prev, evaluatedBy: { ...prev.evaluatedBy, time: value }
                          }))}
                          placeholder="HH:MM"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Collection Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sample Collection</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Sample</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Sample Type</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Volume (ml)</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Collection Time</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Collection Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Done by (Sign & Date)</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium no-print"></th>
                  </tr>
                </thead>
                <tbody>
                  {sampleCollections.map((sample, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">
                        <FormField
                          label=""
                          value={sample.sample}
                          onChange={(value) => updateSampleCollection(index, 'sample', value)}
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <FormField
                          label=""
                          value={sample.sampleType}
                          onChange={(value) => updateSampleCollection(index, 'sampleType', value)}
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <FormField
                          label=""
                          value={sample.volume}
                          onChange={(value) => updateSampleCollection(index, 'volume', value)}
                          type="number"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <FormField
                          label=""
                          type="text"
                          value={sample.collectionTime}
                          onChange={(value) => updateSampleCollection(index, 'collectionTime', value)}
                          placeholder="HH:MM"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Input
                          type="date"
                          value={sample.collectionDate}
                          onChange={(e) => updateSampleCollection(index, 'collectionDate', e.target.value)}
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="space-y-2">
                          <FormField
                            label=""
                            value={sample.doneBy.name}
                            onChange={(value) => updateSampleCollectionSignature(index, 'name', value)}
                            placeholder="Name"
                          />
                          <Input
                            type="date"
                            value={sample.doneBy.date}
                            onChange={(e) => updateSampleCollectionSignature(index, 'date', e.target.value)}
                          />
                          <FormField
                            label=""
                            type="text"
                            value={sample.doneBy.time}
                            onChange={(value) => updateSampleCollectionSignature(index, 'time', value)}
                            placeholder="HH:MM"
                          />
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 no-print">
                        {sampleCollections.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeSampleCollection(index)}
                            className="bg-red-500 hover:bg-red-600 px-2 py-1 text-white text-xs"
                          >
                            Remove
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button
                type="button"
                onClick={addSampleCollection}
                className="mt-4 bg-blue-600 hover:bg-blue-700 no-print flex items-center gap-2"
              >
                + Add Sample
              </Button>
            </div>
          </div>

          {/* Lab Reports Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Screening Lab Reports Evaluation</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Srl No.</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Test</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Done by (Sign & Date)</th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium">Normal</th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium">Ab Normal</th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium">CNS</th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium">CS</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {labReports.map((report, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">{report.test}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="space-y-2">
                          <FormField
                            label=""
                            value={report.doneBy.name}
                            onChange={(value) => updateLabReport(index, 'doneBy', { ...report.doneBy, name: value })}
                            placeholder="Name"
                          />
                          <Input
                            type="date"
                            value={report.doneBy.date}
                            onChange={(e) => updateLabReport(index, 'doneBy', { ...report.doneBy, date: e.target.value })}
                          />
                          <FormField
                            label=""
                            type="text"
                            value={report.doneBy.time}
                            onChange={(value) => updateLabReport(index, 'doneBy', { ...report.doneBy, time: value })}
                            placeholder="HH:MM"
                          />
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={report.normal}
                          onChange={(e) => {
                            updateLabReport(index, 'normal', e.target.checked);
                            if (e.target.checked) updateLabReport(index, 'abnormal', false);
                          }}
                          className="form-checkbox h-5 w-5"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={report.abnormal}
                          onChange={(e) => {
                            updateLabReport(index, 'abnormal', e.target.checked);
                            if (e.target.checked) updateLabReport(index, 'normal', false);
                          }}
                          className="form-checkbox h-5 w-5"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={report.cns}
                          onChange={(e) => updateLabReport(index, 'cns', e.target.checked)}
                          className="form-checkbox h-5 w-5"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={report.cs}
                          onChange={(e) => updateLabReport(index, 'cs', e.target.checked)}
                          className="form-checkbox h-5 w-5"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <FormField
                          label=""
                          value={report.remarks}
                          onChange={(value) => updateLabReport(index, 'remarks', value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Final Evaluation Section */}
          <div className="border-t pt-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                After review of the volunteer medical screening record and screening investigations, the volunteer is
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="fit"
                    checked={isParticipationFit}
                    onChange={() => {
                      setIsParticipationFit(true);
                      setIsSaved(false);
                    }}
                    className="form-radio h-4 w-4"
                  />
                  <label htmlFor="fit" className="text-sm">fit for study participation</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="not-fit"
                    checked={!isParticipationFit}
                    onChange={() => {
                      setIsParticipationFit(false);
                      setIsSaved(false);
                    }}
                    className="form-radio h-4 w-4"
                  />
                  <label htmlFor="not-fit" className="text-sm">not fit for study participation</label>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">If No, Specify:</h3>
              <FormField
                label=""
                value={specification}
                onChange={(value) => {
                  setSpecification(value);
                  setIsSaved(false);
                }}
              />
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Comments:</h3>
              <FormField
                label=""
                value={comments}
                onChange={(value) => {
                  setComments(value);
                  setIsSaved(false);
                }}
              />
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Completed by:</h3>
              <FormField
                label=""
                value={completedBy}
                onChange={(value) => {
                  setCompletedBy(value);
                  setIsSaved(false);
                }}
              />
            </div>
          </div>

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
                variant="outline"
                onClick={handlePrint}
                className="flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </Button>
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
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                Continue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PrintableForm>
  );
};

export default EcgEvaluationPage;
