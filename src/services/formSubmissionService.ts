import { getCompletedFormsData, getAllPendingForms, deletePendingForm, FormSession } from '@/lib/dexie';

export interface FormSubmissionData {
  case_id: string;
  volunteer_id: string;
  study_number: string;
  forms_data: Record<string, any>;
  metadata: {
    submitted_at: string;
    user_agent: string;
    form_sequence: string[];
    completed_forms: string[];
  };
}

export interface FormSubmissionResponse {
  success: boolean;
  case_id: string;
  submission_id?: string;
  message: string;
  errors?: Record<string, string[]>;
}

class FormSubmissionService {
  private baseUrl: string;

  constructor() {
    // Get API base URL from environment or default
    this.baseUrl = import.meta.env.VITE_API_URL || '/api/v1';
  }

  /**
   * Submit all form data for a case to the backend
   */
  async submitFormData(session: FormSession): Promise<FormSubmissionResponse> {
    try {
      // Collect all form data
      const formsData = await getCompletedFormsData(session.case_id);
      
      if (Object.keys(formsData).length === 0) {
        throw new Error('No form data found to submit');
      }

      // Prepare submission payload
      const submissionData: FormSubmissionData = {
        case_id: session.case_id,
        volunteer_id: session.volunteer_id,
        study_number: session.study_number,
        forms_data: formsData,
        metadata: {
          submitted_at: new Date().toISOString(),
          user_agent: navigator.userAgent,
          form_sequence: session.navigation_state.form_sequence,
          completed_forms: session.completed_forms
        }
      };

      // Make API call
      const response = await fetch(`${this.baseUrl}/forms/bulk-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        let errorMessage = 'Unknown error occurred';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result: FormSubmissionResponse = await response.json();
      
      // If successful, clean up local storage for this case
      if (result.success) {
        await this.cleanupLocalData(session.case_id);
      }

      return result;
    } catch (error) {
      console.error('Form submission failed:', error);
      return {
        success: false,
        case_id: session.case_id,
        message: error instanceof Error ? error.message : 'Failed to submit forms',
        errors: error instanceof Error ? { general: [error.message] } : undefined
      };
    }
  }

  /**
   * Submit individual form data (partial submission)
   */
  async submitPartialFormData(
    caseId: string, 
    formName: string, 
    formData: Record<string, any>
  ): Promise<FormSubmissionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/forms/partial-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          case_id: caseId,
          form_name: formName,
          form_data: formData,
          submitted_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        let errorMessage = 'Unknown error occurred';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Partial form submission failed:', error);
      return {
        success: false,
        case_id: caseId,
        message: error instanceof Error ? error.message : 'Failed to submit form',
        errors: error instanceof Error ? { general: [error.message] } : undefined
      };
    }
  }

  /**
   * Sync all pending forms to the backend
   */
  async syncPendingForms(): Promise<{ 
    total: number; 
    successful: number; 
    failed: number; 
    errors: Array<{ id: number; error: string }> 
  }> {
    const pendingForms = await getAllPendingForms();
    const results = {
      total: pendingForms.length,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ id: number; error: string }>
    };

    for (const form of pendingForms) {
      try {
        const response = await fetch(`${this.baseUrl}/forms/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({
            template_id: form.template_id,
            patient_id: form.patient_id,
            volunteer_id: form.volunteer_id,
            study_number: form.study_number,
            answers: form.answers,
            created_at: form.created_at.toISOString(),
            last_modified: form.last_modified.toISOString()
          })
        });

        if (response.ok) {
          // Delete successfully synced form from local storage
          if (form.id) {
            await deletePendingForm(form.id);
          }
          results.successful++;
        } else {
          const errorData = await response.json();
          results.failed++;
          results.errors.push({
            id: form.id || 0,
            error: errorData.detail || errorData.message || 'Unknown error'
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          id: form.id || 0,
          error: error instanceof Error ? error.message : 'Network error'
        });
      }
    }

    return results;
  }

  /**
   * Check backend connectivity
   */
  async checkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get current auth token
   */
  private getAuthToken(): string {
    // Implementation depends on how auth is handled in the app
    // This could be from localStorage, context, or cookie
    return localStorage.getItem('auth_token') || '';
  }

  /**
   * Clean up local data after successful submission
   */
  private async cleanupLocalData(caseId: string): Promise<void> {
    try {
      // Import at runtime to avoid circular dependencies
      const { clearFormSession } = await import('@/lib/dexie');
      await clearFormSession(caseId);
    } catch (error) {
      console.warn('Failed to cleanup local data:', error);
      // Don't throw here as the main submission was successful
    }
  }

  /**
   * Retry failed submissions
   */
  async retryFailedSubmissions(): Promise<{
    attempted: number;
    successful: number;
    stillFailed: number;
  }> {
    const pendingForms = await getAllPendingForms();
    const failedForms = pendingForms.filter(form => !form.synced);
    
    const syncResult = await this.syncPendingForms();
    
    return {
      attempted: failedForms.length,
      successful: syncResult.successful,
      stillFailed: syncResult.failed
    };
  }

  /**
   * Get submission status for a case
   */
  async getSubmissionStatus(caseId: string): Promise<{
    submitted: boolean;
    submission_id?: string;
    submitted_at?: string;
    status?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/forms/submission-status/${caseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        return { submitted: false };
      }
    } catch (error) {
      console.error('Failed to get submission status:', error);
      return { submitted: false };
    }
  }
}

// Export singleton instance
export const formSubmissionService = new FormSubmissionService();
export default formSubmissionService;