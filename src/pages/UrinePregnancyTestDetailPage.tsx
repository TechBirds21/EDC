
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/FormField';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { db } from '@/lib/dexie';
import { useToast } from '@/hooks/use-toast';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { PrintableForm } from '@/components/PrintableForm';

interface UrinePregnancyTestData {
  // Header fields
  projectNo: string;
  periodNo: string;
  date: string;
  volunteerIdSubjectNo: string;
  
  // Serum β-HCG Pregnancy Test
  serumBetaHcgApplicable: string;
  serumBetaHcgNotApplicable: string;
  
  // Sample collection details
  sampleCollectionTime: string;
  volumeOfSampleCollection: string;
  collectedBy: string;
  collectedBySignDate: string;
  
  // Comments
  comments: string;
  
  // Test Result
  testResultPositive: string;
  testResultNegative: string;
  
  // Urine Sample Collection
  urineSampleApplicable: string;
  urineSampleNotApplicable: string;
  
  // Volume and received details
  volumeApproximately: string;
  receivedTime: string;
  receivedBy: string;
  receivedBySignDate: string;
  
  // Urine Pregnancy Test
  urinePregnancyTestApplicable: string;
  urinePregnancyTestNotApplicable: string;
  
  // Result details
  resultTime: string;
  testResultUrinePositive: string;
  testResultUrineNegative: string;
  doneBy: string;
  doneBySignDate: string;
  
  // Eligible for check-in
  eligibleYes: string;
  eligibleNo: string;
  
  // Remarks
  remarks: string;
  
  // Evaluated by
  evaluatedBy: string;
  evaluatedBySignDate: string;
}

const UrinePregnancyTestDetailPage: React.FC = () => {
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
  const [formData, setFormData] = useState<UrinePregnancyTestData>({
    projectNo: '',
    periodNo: '',
    date: '',
    volunteerIdSubjectNo: '',
    serumBetaHcgApplicable: '',
    serumBetaHcgNotApplicable: '',
    sampleCollectionTime: '',
    volumeOfSampleCollection: '',
    collectedBy: '',
    collectedBySignDate: '',
    comments: '',
    testResultPositive: '',
    testResultNegative: '',
    urineSampleApplicable: '',
    urineSampleNotApplicable: '',
    volumeApproximately: '',
    receivedTime: '',
    receivedBy: '',
    receivedBySignDate: '',
    urinePregnancyTestApplicable: '',
    urinePregnancyTestNotApplicable: '',
    resultTime: '',
    testResultUrinePositive: '',
    testResultUrineNegative: '',
    doneBy: '',
    doneBySignDate: '',
    eligibleYes: '',
    eligibleNo: '',
    remarks: '',
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
          .and(form => form.template_id === 'Urine Pregnancy Test')
          .first();
        if (data?.answers) {
          const d = data.answers as unknown as UrinePregnancyTestData;
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
          .eq('template_name', 'Urine Pregnancy Test')
          .maybeSingle();
        if (data?.answers) {
          const d = data.answers as unknown as UrinePregnancyTestData;
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
  const updateForm = (field: keyof UrinePregnancyTestData, value: string) => {
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
        .and(form => form.template_id === 'Urine Pregnancy Test')
        .first();

      if (existing) {
        await db.pending_forms.update(existing.id!, {
          answers: formData, volunteer_id: volunteerId, study_number: studyNumber, last_modified: new Date()
        });
      } else {
        await db.pending_forms.add({
          template_id: 'Urine Pregnancy Test',
          patient_id: caseId,
          answers: formData,
          volunteer_id: volunteerId,
          study_number: studyNumber,
          created_at: new Date(),
          last_modified: new Date()
        });
      }
      setIsSaved(false);
      toast({ title: "Saved Locally", description: "Urine pregnancy test saved locally." });
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
          template_id: 'Urine Pregnancy Test',
          volunteer_id: volunteerId,
          status: "submitted",
          data: formData,
        });
        
        setIsSaved(true);
        toast({ title: "Submitted", description: "Urine pregnancy test submitted successfully." });
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
          template_name: 'Urine Pregnancy Test',
          answers: formData as any
        });
      if (error) throw error;
      setIsSaved(true);
      toast({ title: "Submitted", description: "Urine pregnancy test submitted to server." });
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
    navigate(`/employee/project/${pid}/lab-report/biochemistry-1?${params.toString()}`);
  };
  const handlePrint = () => { window.print(); };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CommonFormHeader
        formTitle="Urine Pregnancy Test"
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

      <PrintableForm templateName="Urine Pregnancy Test">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Header Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr>
                    <th className="border border-border p-2 text-left">Project No.:</th>
                    <th className="border border-border p-2 text-left">Period No.:</th>
                    <th className="border border-border p-2 text-left">Date:</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-2">
                      <FormField
                        label=""
                        value={studyNumber || formData.projectNo}
                        onChange={(value) => updateForm('projectNo', value)}
                        disabled={isSaved}
                      />
                    </td>
                    <td className="border border-border p-2">
                      <FormField
                        label=""
                        value={formData.periodNo}
                        onChange={(value) => updateForm('periodNo', value)}
                        disabled={isSaved}
                      />
                    </td>
                    <td className="border border-border p-2">
                      <FormField
                        label=""
                        type="date"
                        value={formData.date}
                        onChange={(value) => updateForm('date', value)}
                        disabled={isSaved}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Volunteer ID/Subject No. */}
            <div className="border border-border p-4">
              <FormField
                label="Volunteer ID/Subject No.:"
                value={volunteerId || formData.volunteerIdSubjectNo}
                onChange={(value) => updateForm('volunteerIdSubjectNo', value)}
                disabled={isSaved}
              />
            </div>

            {/* Serum β-HCG Pregnancy Test */}
            <div className="border border-border p-4 space-y-4">
              <div className="font-medium">SERUM β-HCG PREGNANCY TEST:</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.serumBetaHcgApplicable === 'true'}
                    onChange={(e) => updateForm('serumBetaHcgApplicable', e.target.checked ? 'true' : '')}
                    disabled={isSaved}
                    className="form-checkbox"
                  />
                  <span>Applicable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.serumBetaHcgNotApplicable === 'true'}
                    onChange={(e) => updateForm('serumBetaHcgNotApplicable', e.target.checked ? 'true' : '')}
                    disabled={isSaved}
                    className="form-checkbox"
                  />
                  <span>Not Applicable</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  label="Sample collection Time (Hrs):"
                  value={formData.sampleCollectionTime}
                  onChange={(value) => updateForm('sampleCollectionTime', value)}
                  disabled={isSaved}
                />
                <FormField
                  label="Volume of sample collection (mL):"
                  value={formData.volumeOfSampleCollection}
                  onChange={(value) => updateForm('volumeOfSampleCollection', value)}
                  disabled={isSaved}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Collected by:"
                    value={formData.collectedBy}
                    onChange={(value) => updateForm('collectedBy', value)}
                    disabled={isSaved}
                  />
                  <FormField
                    label="(Sign & Date)"
                    type="date"
                    value={formData.collectedBySignDate}
                    onChange={(value) => updateForm('collectedBySignDate', value)}
                    disabled={isSaved}
                  />
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="border border-border p-4">
              <FormField
                label="Comments:"
                type="textarea"
                value={formData.comments}
                onChange={(value) => updateForm('comments', value)}
                disabled={isSaved}
              />
            </div>

            {/* Test Result */}
            <div className="border border-border p-4 space-y-4">
              <div className="font-medium">Test Result:</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.testResultPositive === 'true'}
                    onChange={(e) => updateForm('testResultPositive', e.target.checked ? 'true' : '')}
                    disabled={isSaved}
                    className="form-checkbox"
                  />
                  <span>Positive</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.testResultNegative === 'true'}
                    onChange={(e) => updateForm('testResultNegative', e.target.checked ? 'true' : '')}
                    disabled={isSaved}
                    className="form-checkbox"
                  />
                  <span>Negative</span>
                </div>
              </div>
            </div>

            {/* Urine Sample Collection */}
            <div className="border border-border p-4 space-y-4">
              <div className="font-medium">URINE SAMPLE COLLECTION:</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.urineSampleApplicable === 'true'}
                    onChange={(e) => updateForm('urineSampleApplicable', e.target.checked ? 'true' : '')}
                    disabled={isSaved}
                    className="form-checkbox"
                  />
                  <span>Applicable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.urineSampleNotApplicable === 'true'}
                    onChange={(e) => updateForm('urineSampleNotApplicable', e.target.checked ? 'true' : '')}
                    disabled={isSaved}
                    className="form-checkbox"
                  />
                  <span>Not Applicable</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  label="Volume (approximately 15 -20 mL)"
                  value={formData.volumeApproximately}
                  onChange={(value) => updateForm('volumeApproximately', value)}
                  disabled={isSaved}
                />
                <FormField
                  label="Received Time (Hrs):"
                  value={formData.receivedTime}
                  onChange={(value) => updateForm('receivedTime', value)}
                  disabled={isSaved}
                />
                <div className="grid grid-cols-1 gap-2">
                  <FormField
                    label="Received by:"
                    value={formData.receivedBy}
                    onChange={(value) => updateForm('receivedBy', value)}
                    disabled={isSaved}
                  />
                  <FormField
                    label="(Sign & Date)"
                    type="date"
                    value={formData.receivedBySignDate}
                    onChange={(value) => updateForm('receivedBySignDate', value)}
                    disabled={isSaved}
                  />
                </div>
              </div>
            </div>

            {/* Urine Pregnancy Test */}
            <div className="border border-border p-4 space-y-4">
              <div className="font-medium">URINE PREGNANCY TEST:</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.urinePregnancyTestApplicable === 'true'}
                    onChange={(e) => updateForm('urinePregnancyTestApplicable', e.target.checked ? 'true' : '')}
                    disabled={isSaved}
                    className="form-checkbox"
                  />
                  <span>Applicable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.urinePregnancyTestNotApplicable === 'true'}
                    onChange={(e) => updateForm('urinePregnancyTestNotApplicable', e.target.checked ? 'true' : '')}
                    disabled={isSaved}
                    className="form-checkbox"
                  />
                  <span>Not Applicable</span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  label="Result Time (Hrs):"
                  value={formData.resultTime}
                  onChange={(value) => updateForm('resultTime', value)}
                  disabled={isSaved}
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Test Result:</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.testResultUrinePositive === 'true'}
                        onChange={(e) => updateForm('testResultUrinePositive', e.target.checked ? 'true' : '')}
                        disabled={isSaved}
                        className="form-checkbox"
                      />
                      <span>Positive</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.testResultUrineNegative === 'true'}
                        onChange={(e) => updateForm('testResultUrineNegative', e.target.checked ? 'true' : '')}
                        disabled={isSaved}
                        className="form-checkbox"
                      />
                      <span>Negative</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <FormField
                    label="Done by:"
                    value={formData.doneBy}
                    onChange={(value) => updateForm('doneBy', value)}
                    disabled={isSaved}
                  />
                  <FormField
                    label="(Sign & Date)"
                    type="date"
                    value={formData.doneBySignDate}
                    onChange={(value) => updateForm('doneBySignDate', value)}
                    disabled={isSaved}
                  />
                </div>
              </div>
              
              <div className="text-sm">(Tick (✓) the appropriate)</div>
            </div>

            {/* Eligible for check-in */}
            <div className="border border-border p-4 space-y-4">
              <div className="font-medium">Eligible for check-in:</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.eligibleYes === 'true'}
                    onChange={(e) => updateForm('eligibleYes', e.target.checked ? 'true' : '')}
                    disabled={isSaved}
                    className="form-checkbox"
                  />
                  <span>Yes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.eligibleNo === 'true'}
                    onChange={(e) => updateForm('eligibleNo', e.target.checked ? 'true' : '')}
                    disabled={isSaved}
                    className="form-checkbox"
                  />
                  <span>No</span>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="border border-border p-4">
              <FormField
                label="Remarks:"
                type="textarea"
                value={formData.remarks}
                onChange={(value) => updateForm('remarks', value)}
                disabled={isSaved}
              />
            </div>

            {/* Evaluated By */}
            <div className="border border-border p-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Evaluated by:"
                  value={formData.evaluatedBy}
                  onChange={(value) => updateForm('evaluatedBy', value)}
                  disabled={isSaved}
                />
                <FormField
                  label="(Sign & Date)"
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

export default UrinePregnancyTestDetailPage;
