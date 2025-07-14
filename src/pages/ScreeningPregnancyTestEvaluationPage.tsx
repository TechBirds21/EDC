
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/FormField';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import { db } from '@/lib/dexie';
import { useToast } from '@/hooks/use-toast';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { PrintableForm } from '@/components/PrintableForm';

interface PregnancyTestEvaluationData {
  // Applicable checkboxes
  serumBetaHcgApplicable: string;
  urinePregnancyTestApplicable: string;
  
  // Results
  results: string;
  
  // Comments
  comments: string;
  
  // Evaluated by
  evaluatedBy: string;
  evaluatedBySignDate: string;
}

const ScreeningPregnancyTestEvaluationPage: React.FC = () => {
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
  const [formData, setFormData] = useState<PregnancyTestEvaluationData>({
    serumBetaHcgApplicable: '',
    urinePregnancyTestApplicable: '',
    results: '',
    comments: '',
    evaluatedBy: '',
    evaluatedBySignDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
          .and(form => form.template_id === 'Screening Pregnancy Test Evaluation')
          .first();
        if (data?.answers) {
          const d = data.answers as unknown as PregnancyTestEvaluationData;
          setFormData(d);
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
          .eq('template_name', 'Screening Pregnancy Test Evaluation')
          .maybeSingle();
        if (data?.answers) {
          const d = data.answers as unknown as PregnancyTestEvaluationData;
          setFormData(d);
          setIsSaved(true); // Already synced
        }
      } catch (error) {
        // ignore
      }
    };
    loadDB();
  }, [caseId]);

  // Update handlers
  const updateForm = (field: keyof PregnancyTestEvaluationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsSaved(false);
  };

  // Save Locally (Dexie)
  const handleSaveLocal = async () => {
    try {
      const existing = await db.pending_forms
        .where('patient_id').equals(caseId)
        .and(form => form.template_id === 'Screening Pregnancy Test Evaluation')
        .first();

      if (existing) {
        await db.pending_forms.update(existing.id!, {
          answers: formData, volunteer_id: volunteerId, study_number: studyNumber, last_modified: new Date()
        });
      } else {
        await db.pending_forms.add({
          template_id: 'Screening Pregnancy Test Evaluation',
          patient_id: caseId,
          answers: formData,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          created_at: new Date(),
          last_modified: new Date()
        });
      }
      setIsSaved(false);
      toast({ title: "Saved Locally", description: "Pregnancy test evaluation saved locally." });
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
          template_id: 'Screening Pregnancy Test Evaluation',
          volunteer_id: volunteerId,
          status: "submitted",
          data: formData,
        });
        
        setIsSaved(true);
        toast({ title: "Submitted", description: "Pregnancy test evaluation submitted successfully." });
        setLoading(false);
        return;
      } catch (apiError) {
        console.warn('Python API submission failed, falling back to Supabase:', apiError);
      }
      
      // Insert or upsert into DB
      const { error } = await supabase
        .from('patient_forms')
        .upsert({
          case_id: caseId,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          template_name: 'Screening Pregnancy Test Evaluation',
          answers: formData as any
        });
      if (error) throw error;
      setIsSaved(true);
      toast({ title: "Submitted", description: "Pregnancy test evaluation submitted to server." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to submit.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Navigation
  const handlePrevious = () => {
    const params = new URLSearchParams({ case: caseId, volunteerId, studyNumber });
    navigate(`/employee/project/${pid}/screening/pregnancy-test?${params.toString()}`);
  };
  const handleContinue = () => {
    const params = new URLSearchParams({ case: caseId, volunteerId, studyNumber });
    navigate(`/employee/project/${pid}/screening/inclusion-criteria?${params.toString()}`);
  };
  const handlePrint = () => { window.print(); };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CommonFormHeader
        formTitle="Screening Pregnancy Test Evaluation"
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

      <PrintableForm templateName="Screening Pregnancy Test Evaluation">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Tick (✓) the appropriate */}
            <div className="space-y-4">
              <div className="font-medium">Tick (✓) the appropriate</div>
              
              <div>
                <div className="font-medium mb-2">Serum Beta HCG:</div>
                <FormField
                  label=""
                  type="radio"
                  value={formData.serumBetaHcgApplicable}
                  onChange={(value) => updateForm('serumBetaHcgApplicable', value)}
                  options={[
                    { label: 'Applicable', value: 'Applicable' },
                    { label: 'Not applicable', value: 'Not applicable' }
                  ]}
                  disabled={isSaved}
                  className="flex gap-6"
                />
              </div>

              <div>
                <div className="font-medium mb-2">Urine pregnancy test:</div>
                <FormField
                  label=""
                  type="radio"
                  value={formData.urinePregnancyTestApplicable}
                  onChange={(value) => updateForm('urinePregnancyTestApplicable', value)}
                  options={[
                    { label: 'Applicable', value: 'Applicable' },
                    { label: 'Not applicable', value: 'Not applicable' }
                  ]}
                  disabled={isSaved}
                  className="flex gap-6"
                />
              </div>
            </div>

            {/* Results */}
            <div>
              <div className="font-medium mb-2">Results:</div>
              <FormField
                label=""
                type="radio"
                value={formData.results}
                onChange={(value) => updateForm('results', value)}
                options={[
                  { label: 'Positive', value: 'Positive' },
                  { label: 'Negative', value: 'Negative' }
                ]}
                disabled={isSaved}
                className="flex gap-6"
              />
            </div>

            {/* Comments */}
            <div>
              <FormField
                label="Comments:"
                type="textarea"
                value={formData.comments}
                onChange={(value) => updateForm('comments', value)}
                disabled={isSaved}
              />
            </div>

            {/* Evaluated by */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Evaluated by"
                  value={formData.evaluatedBy}
                  onChange={(value) => updateForm('evaluatedBy', value)}
                  disabled={isSaved}
                />
                <FormField
                  label="(Physician sign & date)"
                  type="date"
                  value={formData.evaluatedBySignDate}
                  onChange={(value) => updateForm('evaluatedBySignDate', value)}
                  disabled={isSaved}
                />
              </div>
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
          <Button type="button" onClick={handleContinue} disabled={!isSaved} className="flex items-center space-x-2">
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScreeningPregnancyTestEvaluationPage;
