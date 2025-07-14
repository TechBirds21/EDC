
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { PrintableForm } from '@/components/PrintableForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/FormField';
import { toast } from 'sonner';
import { ChevronLeft, Printer } from 'lucide-react';

interface ECGData {
  ecgDate: string;
  heartRate: string;
  prInterval: string;
  qrsInterval: string;
  qtInterval: string;
  qtcInterval: string;
  pAxis: string;
  rAxis: string;
  tAxis: string;
  interpretation: string;
  conclusion: string;
  performedBy: string;
  reviewedBy: string;
}

const initialForm: ECGData = {
  ecgDate: '',
  heartRate: '',
  prInterval: '',
  qrsInterval: '',
  qtInterval: '',
  qtcInterval: '',
  pAxis: '',
  rAxis: '',
  tAxis: '',
  interpretation: '',
  conclusion: 'Normal',
  performedBy: '',
  reviewedBy: ''
};

const EcgPage: React.FC = () => {
  const { pid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [formData, setFormData] = useState<ECGData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the same unique key structure as your other forms!
  const localKey = `ecg_${volunteerId || ''}_${studyNumber || ''}_${caseId || ''}`;

  // Load from localStorage, else fetch from DB if present
  useEffect(() => {
    if (!volunteerId) return;
    const stored = localStorage.getItem(localKey);
    if (stored) {
      try {
        setFormData(JSON.parse(stored));
        setIsSaved(true);
      } catch {
        setFormData(initialForm);
      }
    } else {
      fetchECGData();
    }
  }, [volunteerId, studyNumber, caseId, localKey]);

  // Fetch from DB (only if no local data)
  const fetchECGData = async () => {
    if (!volunteerId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patient_forms')
        .select('answers')
        .eq('case_id', caseId)
        .eq('template_name', 'ECG')
        .maybeSingle();
      if (error) {
        setError('Error fetching ECG data. Please try again.');
        return;
      }
      if (data && data.answers) {
        const answers = data.answers as any;
        setFormData(answers);
        setIsSaved(true);
        localStorage.setItem(localKey, JSON.stringify(answers));
      }
    } catch (err) {
      setError('Failed to fetch ECG data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update field and save to localStorage immediately
  const updateForm = (field: keyof ECGData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem(localKey, JSON.stringify(updated));
      setIsSaved(false);
      return updated;
    });
  };

  // Save handler
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try { 
      if (caseId && volunteerId && studyNumber) {
        // Try Python API first
        try {
          await pythonApi.createForm({
            template_id: 'ECG',
            volunteer_id: volunteerId,
            status: "submitted",
            data: formData,
          });
          
          localStorage.setItem(localKey, JSON.stringify(formData));
          setIsSaved(true);
          setSuccess(true);
          toast.success('ECG data saved successfully');
          setTimeout(() => setSuccess(false), 2000);
          setLoading(false);
          return;
        } catch (apiError) {
          console.warn('Python API submission failed, falling back to Supabase:', apiError);
        }
        
        // Fall back to Supabase
        const { error } = await supabase
          .from('patient_forms')
          .upsert({
            case_id: caseId,
            volunteer_id: volunteerId,
            study_number: studyNumber,
            template_name: 'ECG',
            answers: formData as any
          });

        if (error) throw error;
      }
      
      localStorage.setItem(localKey, JSON.stringify(formData));
      setIsSaved(true);
      setSuccess(true);
      toast.success('ECG data saved successfully');
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError('Failed to save ECG data. Please try again.');
      toast.error('Failed to save ECG data');
    } finally {
      setLoading(false);
    }
  };

  // Continue: Go to X-ray, pass all query params
  const handleContinue = () => {
    if (!isSaved) {
      toast.error('Please save the form before continuing');
      return;
    }
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    if (volunteerId) params.set('volunteerId', volunteerId);
    if (studyNumber) params.set('studyNumber', studyNumber);
    navigate(`/employee/project/${pid}/screening/xray-evaluation?${params.toString()}`);
  };

  // Previous: Go to ECG Evaluation
  const handlePrevious = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    if (volunteerId) params.set('volunteerId', volunteerId);
    if (studyNumber) params.set('studyNumber', studyNumber);
    navigate(`/employee/project/${pid}/screening/ecg-evaluation?${params.toString()}`);
  };

  return (
    <PrintableForm templateName="ECG Report">
      <CommonFormHeader
        formTitle="ECG Report"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
      />

      <Card>
        <CardContent className="p-6 space-y-6">
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <div className="text-green-700 text-sm">ECG data saved successfully!</div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Volunteer ID:</span>
              <span>{volunteerId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Study No:</span>
              <span>{studyNumber}</span>
            </div>
          </div>

          <FormField
            label="ECG Date"
            type="date"
            value={formData.ecgDate}
            onChange={(value) => updateForm('ecgDate', value)}
            disabled={loading}
          />
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">ECG Measurements</h3>
              <FormField label="Heart Rate (bpm)" type="number" value={formData.heartRate} onChange={v => updateForm('heartRate', v)} disabled={loading} />
              <FormField label="PR Interval (ms)" type="number" value={formData.prInterval} onChange={v => updateForm('prInterval', v)} disabled={loading} />
              <FormField label="QRS Interval (ms)" type="number" value={formData.qrsInterval} onChange={v => updateForm('qrsInterval', v)} disabled={loading} />
              <FormField label="QT Interval (ms)" type="number" value={formData.qtInterval} onChange={v => updateForm('qtInterval', v)} disabled={loading} />
              <FormField label="QTc Interval (ms)" type="number" value={formData.qtcInterval} onChange={v => updateForm('qtcInterval', v)} disabled={loading} />
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Axis Measurements</h3>
              <FormField label="P Axis (°)" type="text" value={formData.pAxis} onChange={v => updateForm('pAxis', v)} disabled={loading} />
              <FormField label="R/QRS Axis (°)" type="text" value={formData.rAxis} onChange={v => updateForm('rAxis', v)} disabled={loading} />
              <FormField label="T Axis (°)" type="text" value={formData.tAxis} onChange={v => updateForm('tAxis', v)} disabled={loading} />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium text-lg border-b pb-2">Interpretation</h3>
            <FormField
              label="ECG Interpretation"
              type="textarea"
              value={formData.interpretation}
              onChange={v => updateForm('interpretation', v)}
              disabled={loading}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium">Conclusion:</label>
              <div className="flex gap-6">
                {['Normal', 'Abnormal - Not Clinically Significant', 'Abnormal - Clinically Significant'].map(option => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      value={option}
                      checked={formData.conclusion === option}
                      onChange={() => updateForm('conclusion', option)}
                      className="form-radio h-4 w-4 text-blue-600"
                      disabled={loading}
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <FormField
              label="Performed By (Name & Date)"
              type="text"
              value={formData.performedBy}
              onChange={v => updateForm('performedBy', v)}
              disabled={loading}
            />
            <FormField
              label="Reviewed By (Physician)"
              type="text"
              value={formData.reviewedBy}
              onChange={v => updateForm('reviewedBy', v)}
              disabled={loading}
            />
          </div>
          <div className="border-t pt-4 text-sm text-gray-500">
            <p>
              Note: Normal ranges may vary by age, gender, and other factors.
              Interpretation should be done by a qualified healthcare professional.
            </p>
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
                onClick={() => window.print()}
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

export default EcgPage;
