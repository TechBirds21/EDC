
import { useState } from 'react';
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

  const submitForm = async (submitFn: () => Promise<any>): Promise<FormSubmissionResult> => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await submitFn();
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
