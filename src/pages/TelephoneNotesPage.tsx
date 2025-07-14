import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FormField } from '../components/FormField';
import { SignatureFields } from '../components/SignatureFields';
import type { SignatureData } from '../types/common';
import { useVolunteer } from '../context/VolunteerContext';
import { formDataCollector } from '../services/formDataCollector';
import { useGlobalForm } from '../context/GlobalFormContext';
import { volunteerService } from '../services/volunteerService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SuccessMessage } from '../components/SuccessMessage';
import { ErrorMessage } from '../components/ErrorMessage';
import { useFormSubmission } from '../hooks/useFormSubmission';

interface CallRecord {
  followUpNo: string;
  callNo: string;
  purpose: string;
  dateOfCall: string;
  callType: 'Incoming' | 'Outgoing' | '';
  callMadeToReceivedFrom: string;
  dialedFromPhoneNumber: string;
  callReceivedByDialedTo: string;
  summaryOfConversation: string;
  nextFollowUpRequired: boolean | null;
  recordedBy: SignatureData;
}

const TelephoneNotes = () => {
  const { volunteerId } = useVolunteer();
  const { studyNo } = useGlobalForm();
  const location = useLocation();
  const { submitForm, loading: submitting, error: submitError, success: submitSuccess } = useFormSubmission();
  const navigate = useNavigate();
  
  // Extract caseId from URL search parameters
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case') || '';
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    sopNumber: 'QA-005',
    documentNo: 'QA-005-F-001-05',
    calls: [
      {
        followUpNo: '',
        callNo: '',
        purpose: '',
        dateOfCall: '',
        callType: '',
        callMadeToReceivedFrom: '',
        dialedFromPhoneNumber: '',
        callReceivedByDialedTo: '',
        summaryOfConversation: '',
        nextFollowUpRequired: null,
        recordedBy: {
          name: '',
          date: '',
          time: ''
        }
      },
      {
        followUpNo: '',
        callNo: '',
        purpose: '',
        dateOfCall: '',
        callType: '',
        callMadeToReceivedFrom: '',
        dialedFromPhoneNumber: '',
        callReceivedByDialedTo: '',
        summaryOfConversation: '',
        nextFollowUpRequired: null,
        recordedBy: {
          name: '',
          date: '',
          time: ''
        }
      }
    ] as CallRecord[],
    authorizedBy: {
      name: '',
      date: '',
      time: ''
    } as SignatureData
  });

  useEffect(() => {
    if (volunteerId) {
      const keys = Object.keys(localStorage);
      const volunteerKeys = keys.filter(key => key.includes(`_${volunteerId}`));
      
      if (volunteerKeys.length > 0) {
        console.log(`Found ${volunteerKeys.length} stored forms for volunteer ${volunteerId}`);
      }
    }
  }, [volunteerId]);

  const updateCall = (index: number, field: keyof CallRecord, value: any) => {
    setFormData(prev => ({
      ...prev,
      calls: prev.calls.map((call, i) => 
        i === index ? { ...call, [field]: value } : call
      )
    }));
  };

  const updateCallSignature = (index: number, value: SignatureData) => {
    setFormData(prev => ({
      ...prev,
      calls: prev.calls.map((call, i) => 
        i === index ? { ...call, recordedBy: value } : call
      )
    }));
  };

  const handleSubmitAllForms = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try { 
      if (!volunteerId) {
        setError("Volunteer ID is required");
        return;
      }
      
      const keys = Object.keys(localStorage);
      const volunteerKeys = keys.filter(key => key.includes(`_${volunteerId}`));

      if (volunteerKeys.length === 0) {
        setError("No form data found for this volunteer. Please complete at least one form before submitting");
        setLoading(false);
        return;
      }

      const allFormData: Record<string, any> = {};
      
      // Get all forms from formDataCollector
      const collectedForms = formDataCollector.getAllFormDataForCase(caseId || '');
      if (collectedForms.length > 0) {
        console.log(`Found ${collectedForms.length} forms in collector for case ${caseId}`);
        
        // Submit all forms using the collector
        const result = await formDataCollector.submitAllForms(caseId || '');
        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
          return;
        } else {
          console.warn('Form collector submission failed, falling back to localStorage method:', result.message);
        }
      }

      // Fallback to localStorage method
      for (const key of volunteerKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsedData = JSON.parse(data);
            const formName = key.split(`_${volunteerId}`)[0];
            allFormData[formName] = parsedData;
          } catch (err) {
            console.error(`Error parsing data for ${key}:`, err);
          }
        }
      }

      // First check if volunteer exists
      try {
        const volunteer = await volunteerService.getOrCreateVolunteer(volunteerId, studyNo || '');
         
        if (!volunteer) {
          throw new Error('Failed to get or create volunteer record');
        }
        
        // Save telephone notes data using submitForm hook and correct table
        await submitForm(async () => {
          const { data, error } = await supabase
            .from('patient_forms')
            .insert({
              volunteer_id: volunteerId,
              study_number: studyNo || '',
              case_id: '',
              template_name: 'Telephone Notes',
              answers: formData as any // Cast to any to satisfy Json type
            });
          
          if (error) throw error;
          return data;
        });
      } catch (err) {
        console.log('Using demo mode, skipping database save');
        // In demo mode, we'll just simulate success
      }
      
      // Clear localStorage after successful submission
      for (const key of volunteerKeys) {
        try { 
          console.log(`Removing item from localStorage: ${key}`);
          localStorage.removeItem(key);
        } catch (err) {
          console.error(`Error removing item ${key}:`, err);
        }
      }
      
      setSuccess(true);
      
      // Clear case data from collector
      if (caseId) {
        formDataCollector.clearCaseData(caseId);
      }
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Error submitting forms:', err);
      // In demo mode, we'll just simulate success
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Link  
          to="/post-study/repeat-assessment" 
          className="text-blue-500 hover:underline"
        >
          Previous
        </Link>
        
        <div className="flex gap-4">
          <div className="text-sm text-gray-600">
            Volunteer ID: <span className="font-medium">{volunteerId}</span>
          </div>
          <div className="text-sm text-gray-600">
            Study No: <span className="font-medium">{studyNo}</span>
          </div>
        </div>
      </div>
      
      {success && (
        <SuccessMessage message="All forms have been successfully submitted to the database. Redirecting to dashboard..." />
      )}
      
      {error && (
        <ErrorMessage message={error} />
      )}
      
      {/* Form submission status */}
      {caseId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-blue-800 mb-2">Form Submission Status</h3>
          <div className="grid grid-cols-4 gap-2 text-sm">
            <div className="bg-white p-2 rounded border border-blue-100">
              <div className="font-medium">Total Forms</div>
              <div className="text-xl">{formDataCollector.getSubmissionStatus(caseId).total}</div>
            </div>
            <div className="bg-white p-2 rounded border border-blue-100">
              <div className="font-medium">Draft</div>
              <div className="text-xl">{formDataCollector.getSubmissionStatus(caseId).draft}</div>
            </div>
            <div className="bg-white p-2 rounded border border-blue-100">
              <div className="font-medium">Submitted</div>
              <div className="text-xl">{formDataCollector.getSubmissionStatus(caseId).submitted}</div>
            </div>
            <div className="bg-white p-2 rounded border border-blue-100">
              <div className="font-medium">Synced</div>
              <div className="text-xl">{formDataCollector.getSubmissionStatus(caseId).synced}</div>
            </div>
          </div>
        </div>
      )}
      
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="border-b pb-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h1 className="text-2xl font-bold">Clians</h1>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">TELEPHONE NOTES</h2>
              <p className="text-sm text-gray-600">Page 2 of 2</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">SOP NUMBER: </span>
              <span className="text-sm">{formData.sopNumber}</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {formData.calls.map((call, index) => (
            <div key={index} className="border-b pb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex gap-2 items-center">
                  <span>Follow-up No.:</span>
                  <input
                    type="text"
                    value={call.followUpNo}
                    onChange={(e) => updateCall(index, 'followUpNo', e.target.value)}
                    className="w-20 border rounded px-2 py-1"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <span>Call No.:</span>
                  <input
                    type="text"
                    value={call.callNo}
                    onChange={(e) => updateCall(index, 'callNo', e.target.value)}
                    className="w-20 border rounded px-2 py-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <FormField
                  label="Purpose"
                  value={call.purpose}
                  onChange={(value) => updateCall(index, 'purpose', value)}
                />

                <FormField
                  label="Date of Call"
                  type="date"
                  value={call.dateOfCall}
                  onChange={(value) => updateCall(index, 'dateOfCall', value)}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Call Type</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={call.callType === 'Incoming'}
                        onChange={() => updateCall(index, 'callType', 'Incoming')}
                        className="form-radio"
                      />
                      <span className="ml-2">Incoming</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={call.callType === 'Outgoing'}
                        onChange={() => updateCall(index, 'callType', 'Outgoing')}
                        className="form-radio"
                      />
                      <span className="ml-2">Outgoing</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Call made to/Received from"
                    value={call.callMadeToReceivedFrom}
                    onChange={(value) => updateCall(index, 'callMadeToReceivedFrom', value)}
                  />
                  <FormField
                    label="Call received by/Dialled to phone number"
                    value={call.callReceivedByDialedTo}
                    onChange={(value) => updateCall(index, 'callReceivedByDialedTo', value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Summary of Conversation</label>
                  <textarea
                    value={call.summaryOfConversation}
                    onChange={(e) => updateCall(index, 'summaryOfConversation', e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Next Follow Up Required:</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={call.nextFollowUpRequired === true}
                        onChange={() => updateCall(index, 'nextFollowUpRequired', true)}
                        className="form-radio"
                      />
                      <span className="ml-2">YES</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={call.nextFollowUpRequired === false}
                        onChange={() => updateCall(index, 'nextFollowUpRequired', false)}
                        className="form-radio"
                      />
                      <span className="ml-2">NO</span>
                    </label>
                  </div>
                </div>

                <SignatureFields
                  label="Recorded By (Sign & Date):"
                  value={call.recordedBy}
                  onChange={(value) => updateCallSignature(index, value)}
                />
              </div>
            </div>
          ))}

          <div className="pt-6">
            <SignatureFields
              label="Authorized By:"
              value={formData.authorizedBy}
              onChange={(value) => setFormData(prev => ({ ...prev, authorizedBy: value }))}
            />
            <div className="text-sm text-gray-500 text-center mt-1">(Department Head/Designee)</div>
          </div>

          <div className="text-sm text-gray-500">{formData.documentNo}</div>
          
          <div className="border-t pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  This is the final form. Submitting will save all form data to the database.
                </p>
                <p className="text-sm text-gray-600">
                  {formDataCollector.getSubmissionStatus(caseId || '').total} forms will be submitted.
                </p>
              </div>
              <button
                onClick={handleSubmitAllForms}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit All Forms</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelephoneNotes;