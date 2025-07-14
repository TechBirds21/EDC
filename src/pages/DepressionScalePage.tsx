import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import  CommonFormHeader  from "@/components/CommonFormHeader";
import { FormField } from "@/components/FormField";
import { PrintableForm } from '@/components/PrintableForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronLeft, Printer } from 'lucide-react';

const depressionItemsList = [
  {
    title: "DEPRESSED MOOD",
    subtitle: "(Gloomy attitude, pessimism about the future, feeling of sadness, tendency to weep)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Sadness, etc." },
      { score: 2, text: "Occasional weeping" },
      { score: 3, text: "Frequent weeping" },
      { score: 4, text: "Extreme symptoms" },
    ]
  },
  {
    title: "FEELINGS OF GUILT",
    subtitle: "",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Self-reproach, feels he/she has let people down" },
      { score: 2, text: "Ideas of guilt" },
      { score: 3, text: "Present illness is a punishment, Delusions of guilt" },
      { score: 4, text: "Hallucinations of guilt" },
    ]
  },
  {
    title: "SUICIDE",
    subtitle: "",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Feels life is not worth living" },
      { score: 2, text: "Wishes he/she were dead" },
      { score: 3, text: "Suicidal ideas or gestures" },
      { score: 4, text: "Attempts at suicide" },
    ]
  },
  {
    title: "INSOMNIA: Initial",
    subtitle: "(Difficulty in falling asleep)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Occasional" },
      { score: 2, text: "Frequent" }
    ]
  },
  {
    title: "INSOMNIA: Middle",
    subtitle: "(Complains of being restless and disturbed during the night. Waking during the night)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Occasional" },
      { score: 2, text: "Frequent" }
    ]
  },
  {
    title: "INSOMNIA: Delayed",
    subtitle: "(Waking in early hours of the morning and unable to fall asleep again)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Occasional" },
      { score: 2, text: "Frequent" }
    ]
  },
  {
    title: "WORK AND INTERESTS",
    subtitle: "",
    options: [
      { score: 0, text: "No difficulty" },
      { score: 1, text: "Feelings of incapacity, listlessness, indecision and vacillation" },
      { score: 2, text: "Loss of interest in hobbies, decreased social activities" },
      { score: 3, text: "Productivity decreased" },
      { score: 4, text: "Unable to work. Stopped working because of present illness only." },
    ]
  },
  {
    title: "RETARDATION",
    subtitle: "(Slowness of thought, speech, and activity; apathy; stupor.)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Slight retardation at interview" },
      { score: 2, text: "Obvious retardation at interview" },
      { score: 3, text: "Interview difficult" },
      { score: 4, text: "Complete stupor" },
    ]
  },
  {
    title: "AGITATION",
    subtitle: "(Restlessness associated with anxiety)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Occasional" },
      { score: 2, text: "Frequent" }
    ]
  },
  {
    title: "ANXIETY PSYCHIC",
    subtitle: "",
    options: [
      { score: 0, text: "No difficulty" },
      { score: 1, text: "Tension and irritability" },
      { score: 2, text: "Worrying about minor matters" },
      { score: 3, text: "Apprehensive attitude" },
      { score: 4, text: "Fears" },
    ]
  },
  {
    title: "ANXIETY SOMATIC",
    subtitle: "(Gastrointestinal, indigestion Cardiovascular, palpitation, Headaches Respiratory, Genito-urinary, etc.)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Mild" },
      { score: 2, text: "Moderate" },
      { score: 3, text: "Severe" },
      { score: 4, text: "Incapacitating" },
    ]
  },
  {
    title: "SOMATIC SYMPTOMS GASTROINTESTINAL",
    subtitle: "(Loss of appetite, heavy feeling in abdomen; constipation)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Mild" },
      { score: 2, text: "Severe" },
    ]
  },
  {
    title: "SOMATIC SYMPTOMS – GENERAL",
    subtitle: "(Heaviness in limbs, back or head; diffuse backache; loss of energy and fatigability)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Mild" },
      { score: 2, text: "Severe" },
    ]
  },
  {
    title: "GENITAL SYMPTOMS",
    subtitle: "(Loss of libido, menstrual disturbances)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Mild" },
      { score: 2, text: "Severe" },
    ]
  },
  {
    title: "HYPOCHONDRIASIS",
    subtitle: "",
    options: [
      { score: 0, text: "Not present" },
      { score: 1, text: "Self-absorption (bodily)" },
      { score: 2, text: "Preoccupation with health" },
      { score: 3, text: "Frequent complaints" },
      { score: 4, text: "Hypochondriacal delusions" },
    ]
  },
  {
    title: "WEIGHT LOSS",
    subtitle: "",
    options: [
      { score: 0, text: "No weight loss" },
      { score: 1, text: "Slight" },
      { score: 2, text: "Obvious or severe" },
    ]
  },
  {
    title: "INSIGHT",
    subtitle: "(Insight must be interpreted in terms of volunteers understanding and background.)",
    options: [
      { score: 0, text: "No loss" },
      { score: 1, text: "Partial or doubt full loss" },
      { score: 2, text: "Loss of insight" },
    ]
  },
];

const initialFormData = {
  crbVersion: '',
  date: '',
  depressionItems: depressionItemsList.map((q) => ({
    ...q,
    selectedScore: null,
  })),
  totalScore: 0,
  depressionScreen: null,
  comments: '',
  evaluatedBy: '',
  evaluatedDate: '',
  evaluatedTime: '',
};

function DepressionScalePage() {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [activePeriod, setActivePeriod] = useState('1');
  const [formData, setFormData] = useState(initialFormData);
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
    const localKey = `depressionScale_${volunteerId}_period${activePeriod}`;
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
        .eq('template_name', `Depression Scale Period ${activePeriod}`)
        .maybeSingle(); 

      if (error) {
        console.error('Error loading data:', error);
        return;
      }

      if (data?.answers) {
        const answers = data.answers as any;
        setFormData(answers);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading depression scale:', error);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Save to localStorage
      if (volunteerId) {
        const localKey = `depressionScale_${volunteerId}_period${activePeriod}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const updateScore = (idx: number, score: number) => {
    const updatedItems = [...formData.depressionItems];
    updatedItems[idx].selectedScore = score;
    const totalScore = updatedItems.reduce((sum, item) => sum + (item.selectedScore ?? 0), 0);
    
    setFormData(prev => {
      const updated = {
        ...prev,
        depressionItems: updatedItems,
        totalScore,
        depressionScreen: totalScore > 7
      };

      // Save to localStorage
      if (volunteerId) {
        const localKey = `depressionScale_${volunteerId}_period${activePeriod}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const handlePeriodChange = (newPeriod: string) => {
    // Save current period data first
    if (volunteerId) {
      const localKey = `depressionScale_${volunteerId}_period${activePeriod}`;
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
      const localKey = `depressionScale_${volunteerId}_period${activePeriod}`;
      localStorage.setItem(localKey, JSON.stringify(formData));
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: `Depression Scale Period ${activePeriod}`,
          volunteer_id: volunteerId,
          status: "submitted",
          data: formData,
        });
        
        setIsSaved(true);
        toast.success(`Depression scale for Period ${activePeriod} saved successfully`);
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
          template_name: `Depression Scale Period ${activePeriod}`,
          answers: formData as any
        });

      if (error) throw error;

      setIsSaved(true);
      toast.success(`Depression scale for Period ${activePeriod} saved successfully`);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save depression scale');
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
    
    navigate(`/employee/project/${pid}/study-period/eligibility-tests?${params.toString()}`);
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
    
    navigate(`/employee/project/${pid}/study-period/inclusion-criteria?${params.toString()}`);
  };

  return (
    <PrintableForm templateName="Depression Scale">
      <CommonFormHeader
        formTitle="Annexure – 4 Depression Scale"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
      />

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Period Selection */}
          <div className="border-b pb-4">
            <FormField
              label="Study Period"
              type="select"
              value={activePeriod}
              onChange={handlePeriodChange}
              options={['1', '2']}
            />
          </div>

          <p className="text-sm border-b pb-2">
            Below is a list of ways that the volunteer might have felt or behaved recently. Please tick in the column that tells how often the volunteer has felt this way during the past week. Please tick (✓) in appropriate boxes.
          </p>
          
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 border text-left w-10">S. No.</th>
                <th className="px-2 py-2 border text-left">Title</th>
                <th className="px-2 py-2 border text-center">Score</th>
              </tr>
            </thead>
            <tbody>
              {formData.depressionItems.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-2 py-2 border align-top">{idx + 1}</td>
                  <td className="px-2 py-2 border align-top">
                    <div className="font-semibold">{item.title}</div>
                    {item.subtitle && <div className="italic text-xs mb-1">{item.subtitle}</div>}
                    <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-1">
                      {item.options.map((option, oidx) => (
                        <label key={oidx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`depression-${idx}`}
                            checked={item.selectedScore === option.score}
                            onChange={() => updateScore(idx, option.score)}
                            className="form-radio"
                          />
                          <span className="text-xs">{option.score}. {option.text}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-2 border align-top text-center font-bold">
                    {item.selectedScore !== null ? item.selectedScore : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center gap-4 mt-2">
            <span className="font-medium">Total Score:</span>
            <span className="px-4 py-2 border rounded bg-gray-50">{formData.totalScore}</span>
            <span className="text-xs text-gray-500">
              (If total score of 0-7 is a normal range and above this range is positive depression)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-medium">Depression Screen:</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.depressionScreen === true}
                  onChange={() => updateField('depressionScreen', true)}
                  className="form-radio"
                />
                <span>Positive</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.depressionScreen === false}
                  onChange={() => updateField('depressionScreen', false)}
                  className="form-radio"
                />
                <span>Negative</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-medium">Comments (If any):</label>
            <textarea
              value={formData.comments}
              onChange={e => updateField('comments', e.target.value)}
              className="w-full p-2 border rounded"
              rows={2}
            />
          </div>

          {/* Evaluation Signature */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Evaluated By (Sign & Date) - (PI/CI/Physician)</h3>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="Name"
                value={formData.evaluatedBy}
                onChange={v => updateField('evaluatedBy', v)}
              />
              <FormField
                label="Date"
                type="date"
                value={formData.evaluatedDate}
                onChange={v => updateField('evaluatedDate', v)}
              />
              <FormField
                label="Time"
                type="time"
                value={formData.evaluatedTime}
                onChange={v => updateField('evaluatedTime', v)}
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
}

export default DepressionScalePage;