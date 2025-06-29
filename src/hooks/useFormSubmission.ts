import { useState } from 'react';
import { pythonApi } from '@/services/api';
import { formDataCollector } from '@/services/formDataCollector';
import type { FormSubmissionResult } from '../types/common';

interface UseFormSubmissionOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useFormSubmission = (options?: UseFormSubmissionOptions) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null); 
  const [success, setSuccess] = useState(false);
  const [lastResult, setLastResult] = useState<FormSubmissionResult | null>(null);

  const submitForm = async (
    submitFn: () => Promise<any>, 
    formMetadata?: {
      templateId?: string;
      templateName?: string;
      volunteerId?: string;
      studyNumber?: string;
      caseId?: string;
      data?: any;
    }
  ): Promise<FormSubmissionResult> => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // First try to use the Python API
      let result;
      try {
        if (formMetadata && formMetadata.templateId && formMetadata.volunteerId && formMetadata.data) {
          // Use Python API
          result = await pythonApi.createForm({
            template_id: formMetadata.templateId,
            volunteer_id: formMetadata.volunteerId,
            status: 'submitted',
            data: formMetadata.data
          });
        } else {
          // Fall back to the provided function
          result = await submitFn();
        }
      } catch (apiError) {
        console.warn('Python API submission failed, falling back to provided function:', apiError);
        result = await submitFn();
      }
      
      // Store in form data collector if metadata is provided
      if (formMetadata && formMetadata.caseId && formMetadata.templateName) {
        formDataCollector.addFormData({
          templateId: formMetadata.templateId || '',
          templateName: formMetadata.templateName,
          volunteerId: formMetadata.volunteerId || '',
          studyNumber: formMetadata.studyNumber || '',
          caseId: formMetadata.caseId,
          data: formMetadata.data || {},
          status: 'submitted',
          lastModified: new Date()
        });
      }
      
      const successResult = { success: true, message: 'Form submitted successfully', data: result };
      setLastResult(successResult);
      setSuccess(true);
      options?.onSuccess?.(result);
      return successResult;
    } catch (err) {
      const failure = { 
        success: false, 
        message: err instanceof Error ? err.message : 'Submission failed' 
      };
      setLastResult(failure);
      setError(failure.message);
      options?.onError?.(failure.message);
      return failure;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitForm,
    isSubmitting,
    loading: isSubmitting,
    error, 
    success,
    setError,
    setSuccess,
    lastResult
  };
};