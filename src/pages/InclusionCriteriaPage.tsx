import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import  CommonFormHeader  from "@/components/CommonFormHeader";
import { FormField } from "@/components/FormField";
import { PrintableForm } from '@/components/PrintableForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Printer } from 'lucide-react';
import CommonFormNavigation from '@/components/CommonFormNavigation';
import FormDateTimeFooter from '@/components/FormDateTimeFooter';

const INCLUSION_CRITERIA = [
  "Healthy adult human subjects within the age range of 18 to 45 years (both inclusive)",
  "A body mass index within 18.50-24.90 Kg/m².",
  "Given written informed consent to participate in the study",
  "Able to communicate effectively with study personnel",
  "Absence of disease markers of HIV 1 & 2, hepatitis B & C and RPR.",
  "Absence of significant disease or clinically significant abnormal laboratory values on laboratory evaluation, medical history, physical examination and systemic examination during the screening.",
  "A normal 12-lead ECG",
  "A normal chest X-ray (PA view).",
  "Compliance with the requirements of the entire protocol.",
];

const FEMALE_INCLUSION_CRITERION = "Female of childbearing potential practicing an acceptable method of birth control for the duration of the study as judged by the investigator(s), such as condoms, foams, jellies, diaphragm, intrauterine device (IUD), or abstinence; or Postmenopausal for at least 1 year, or Surgically sterile (bilateral tubal ligation, bilateral oophorectomy, or hysterectomy has been performed on the subject).";

const EXCLUSION_CRITERIA = [
  "History of hypersensitivity or idiosyncratic reaction or allergic response to Gabapentin enacarbil or to any of the excipients.",
  "The presence of clinically significant abnormal laboratory values during screening.",
  "Systolic Blood pressure <90 mmHg and >140 mmHg. Diastolic Blood pressure <60 mmHg and >90 mm Hg.",
  "Body temperature below 96.5° F or above 98.6° F and Pulse rate below 60/min or above 100/min and respiration rate below 12 breaths/minute and/or above 20 breaths/minute.",
  "History of significant systemic diseases, seizures, psychiatric disorders, neurological disorder and/or allergic rash.",
  "Any evidence of impairment of cardiovascular, respiratory, pulmonary, hepatic, renal, gastrointestinal, endocrine, immunological, dermatological, neurological, metabolic, psychiatric and hematological disorder.",
  "Habit of consuming high caffeine (more than 5 cups of coffee or tea/day) or tobacco (more than 9 cigarettes/ beedies/cigars per day).",
  "History of alcohol consumption for more than two units/ day (1 unit = 30 mL of spirit or 1 pint of beer) or consumption of alcohol for at least 48.00 hours prior to check-in.",
  "History of difficulty with donating blood or difficulty in accessibility of veins.",
  "History of addiction to any recreational drug or drug dependence.",
  "History of dehydration from diarrhoea, vomiting or any other reason within a period of 24.00 hours prior to study check-in.",
  "Donation of blood and participation in any clinical study within 90 days prior to study check-in.",
  "Any general illness from last 7 days prior to study check-in.",
  "Consumption of xanthine containing food and beverages (chocolates, tea, coffee or cola drinks) for at least 48.0 hours prior to study check-in.",
  "Consumption of alcoholic products, grapefruit juice within the 48.0 hours prior to study check-in.",
  "Positive results for drugs of abuse (benzodiazepines, cocaine, opioids, amphetamines, cannabinoids and barbiturates) in urine scan during check-in.",
  "Positive results for alcohol breathe analysis or for Urine alcohol test during check-in.",
  "Received any prescription drugs or over the counter drugs (OTC) (e.g.: Cold preparations, antacid preparations, vitamins and natural products used for therapeutic benefits), within 14 days prior to check–in.",
  "If the depression assessment scale score is positive.",
  "For Female Volunteers: Female volunteer having demonstrated a positive pregnancy test.",
  "Female volunteers who are pregnant, currently breast-feeding or who are likely to become pregnant during the study.",
  "Female volunteers who have used implanted or injected hormonal contraceptives anytime during the 6 months prior to study or used hormonal contraceptives within 14 days before dosing.",
];

const initialFormData = {
  sopNumber: 'PB-003',
  version: '02',
  date: '',
  studyTitle: 'Gabapentin enacarbil extended-release tablets 600 mg Fed BE Study',
  inclusionResponses: Array(INCLUSION_CRITERIA.length).fill(null),
  femaleInclusionResponse: [null],
  exclusionResponses: Array(EXCLUSION_CRITERIA.length - 3).fill(null), // Excluding last 3 female-specific
  femaleExclusionResponse: [null],
  isEligible: null,
  specifyReasons: '',
  evaluatedBy: '',
  evaluatedDate: '',
  evaluatedTime: '',
  verifiedBy: '',
  verifiedDate: '',
  verifiedTime: ''
};

function InclusionCriteriaPage() {
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
    const localKey = `inclusionCriteria_${volunteerId}_period${activePeriod}`;
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
        .eq('template_name', `Inclusion Exclusion Criteria Period ${activePeriod}`)
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
      console.error('Error loading inclusion criteria:', error);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Save to localStorage
      if (volunteerId) {
        const localKey = `inclusionCriteria_${volunteerId}_period${activePeriod}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      
      return updated;
    });
    setIsSaved(false);
  };

  const handlePeriodChange = (newPeriod: string) => {
    // Save current period data first
    if (volunteerId) {
      const localKey = `inclusionCriteria_${volunteerId}_period${activePeriod}`;
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
      const localKey = `inclusionCriteria_${volunteerId}_period${activePeriod}`;
      localStorage.setItem(localKey, JSON.stringify(formData));
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: `Inclusion Exclusion Criteria Period ${activePeriod}`,
          volunteer_id: volunteerId,
          status: "submitted",
          data: formData,
        });
        
        setIsSaved(true);
        toast.success(`Inclusion/Exclusion criteria for Period ${activePeriod} saved successfully`);
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
          template_name: `Inclusion Exclusion Criteria Period ${activePeriod}`,
          answers: formData as any
        });

      if (error) throw error;

      setIsSaved(true);
      toast.success(`Inclusion/Exclusion criteria for Period ${activePeriod} saved successfully`);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save inclusion/exclusion criteria');
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
    
    navigate(`/employee/project/${pid}/study-period/depression-scale?${params.toString()}`);
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
    
    navigate(`/employee/project/${pid}/study-period/case-report?${params.toString()}`);
  };

  const CriteriaTable = ({ 
    criteria, 
    responses, 
    setResponses, 
    groupName, 
    femaleCriteria = null, 
    femaleResponse = null, 
    setFemaleResponse = null 
  }: {
    criteria: string[];
    responses: (string | null)[];
    setResponses: (responses: (string | null)[]) => void;
    groupName: string;
    femaleCriteria?: string[] | null;
    femaleResponse?: (string | null)[] | null;
    setFemaleResponse?: ((response: (string | null)[]) => void) | null;
  }) => {
    const handleRadioChange = (idx: number, val: string) => {
      const newResponses = [...responses];
      newResponses[idx] = val;
      setResponses(newResponses);
    };

    return (
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 w-8 text-left">S. No.</th>
              <th className="border px-2 py-1 text-left">{groupName === 'inclusion' ? 'Inclusion Criteria' : 'Exclusion Criteria'}</th>
              <th className="border px-2 py-1">Yes</th>
              <th className="border px-2 py-1">No</th>
              <th className="border px-2 py-1">NA</th>
            </tr>
          </thead>
          <tbody>
            {criteria.map((text, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{i + 1}</td>
                <td className="border px-2 py-1">{text}</td>
                {['Yes', 'No', 'NA'].map(val => (
                  <td className="border px-2 py-1 text-center" key={val}>
                    <input
                      type="radio"
                      name={`${groupName}-${i}`}
                      checked={responses[i] === val}
                      onChange={() => handleRadioChange(i, val)}
                    />
                  </td>
                ))}
              </tr>
            ))}
            {femaleCriteria && femaleResponse && setFemaleResponse && (
              <>
                <tr>
                  <td className="border px-2 py-1" colSpan={5}><b>For Female Volunteers:</b></td>
                </tr>
                <tr>
                  <td className="border px-2 py-1">{criteria.length + 1}</td>
                  <td className="border px-2 py-1">{femaleCriteria[0]}</td>
                  {['Yes', 'No', 'NA'].map(val => (
                    <td className="border px-2 py-1 text-center" key={val}>
                      <input
                        type="radio"
                        name={`${groupName}-female`}
                        checked={femaleResponse[0] === val}
                        onChange={() => setFemaleResponse([val])}
                      />
                    </td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <PrintableForm templateName="Inclusion and Exclusion Criteria">
      <CommonFormHeader
        formTitle="Inclusion and Exclusion Criteria"
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

          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="SOP Number"
              value={formData.sopNumber}
              onChange={val => updateField('sopNumber', val)}
            />
            <FormField
              label="Version No."
              value={formData.version}
              onChange={val => updateField('version', val)}
            />
            <FormField
              label="Date"
              type="date"
              value={formData.date}
              onChange={val => updateField('date', val)}
            />
          </div>

          <FormField
            label="Study Title"
            value={formData.studyTitle}
            onChange={val => updateField('studyTitle', val)}
          />

          <h2 className="text-lg font-bold mt-4 mb-1">Inclusion Criteria</h2>
          <CriteriaTable
            criteria={INCLUSION_CRITERIA}
            responses={formData.inclusionResponses}
            setResponses={newResponses => updateField('inclusionResponses', newResponses)}
            groupName="inclusion"
            femaleCriteria={[FEMALE_INCLUSION_CRITERION]}
            femaleResponse={formData.femaleInclusionResponse}
            setFemaleResponse={newResponse => updateField('femaleInclusionResponse', newResponse)}
          />

          <h2 className="text-lg font-bold mt-6 mb-1">Exclusion Criteria</h2>
          <CriteriaTable
            criteria={EXCLUSION_CRITERIA.slice(0, -3)}
            responses={formData.exclusionResponses}
            setResponses={newResponses => updateField('exclusionResponses', newResponses)}
            groupName="exclusion"
            femaleCriteria={EXCLUSION_CRITERIA.slice(-3)}
            femaleResponse={formData.femaleExclusionResponse}
            setFemaleResponse={newResponse => updateField('femaleExclusionResponse', newResponse)}
          />

          <div className="pt-6 space-y-4 border-t mt-8">
            <div className="flex flex-wrap items-center gap-8">
              <span className="font-medium">Volunteer is eligible for check-in:</span>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  checked={formData.isEligible === true} 
                  onChange={() => updateField('isEligible', true)} 
                  className="form-radio" 
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  checked={formData.isEligible === false} 
                  onChange={() => updateField('isEligible', false)} 
                  className="form-radio" 
                />
                <span className="ml-2">No</span>
              </label>
            </div>
            <FormField
              label="If No, specify the reasons"
              type="textarea"
              value={formData.specifyReasons}
              onChange={val => updateField('specifyReasons', val)}
              placeholder="Specify the reasons if not eligible..."
            />

            {/* Evaluation Signatures */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Evaluated By (PI/CI/Physician)</h3>
                <div className="grid grid-cols-1 gap-4">
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
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Verified By (Investigator/Designee)</h3>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    label="Name"
                    value={formData.verifiedBy}
                    onChange={v => updateField('verifiedBy', v)}
                  />
                  <FormField
                    label="Date"
                    type="date"
                    value={formData.verifiedDate}
                    onChange={v => updateField('verifiedDate', v)}
                  />
                  <FormField
                    label="Time"
                    type="time"
                    value={formData.verifiedTime}
                    onChange={v => updateField('verifiedTime', v)}
                  />
                </div>
              </div>
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

            <CommonFormNavigation
              onPrevious={handlePrevious}
              onSaveLocal={handleSave}
              onContinue={handleContinue}
              loading={loading}
              isSaved={isSaved}
              showPrint={true}
            />
          </div>
        </CardContent>
      </Card>
      
      <FormDateTimeFooter />
    </PrintableForm>
  );
}

export default InclusionCriteriaPage;