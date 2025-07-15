import { pythonApi } from './api';

// Interface for form data
export interface FormData {
  templateId: string;
  templateName: string;
  volunteerId: string;
  studyNumber: string;
  caseId: string;
  data: any;
  status: 'draft' | 'submitted' | 'synced';
  lastModified: Date;
}

// Class to collect and manage form data
class FormDataCollector {
  private formDataMap: Map<string, FormData> = new Map();
  
  // Add or update form data
  addFormData(formData: FormData): void {
    const key = `${formData.caseId}_${formData.templateName}`;
    this.formDataMap.set(key, formData);
    
    // Save to localStorage for persistence
    this.saveToLocalStorage();
  }
  
  // Get form data by case ID and template name
  getFormData(caseId: string, templateName: string): FormData | undefined {
    const key = `${caseId}_${templateName}`;
    return this.formDataMap.get(key);
  }
  
  // Get all form data for a case
  getAllFormDataForCase(caseId: string): FormData[] {
    const result: FormData[] = [];
    this.formDataMap.forEach((data) => {
      if (data.caseId === caseId) {
        result.push(data);
      }
    });
    return result;
  }
  
  // Save all form data to localStorage
  private saveToLocalStorage(): void {
    const dataArray = Array.from(this.formDataMap.values());
    localStorage.setItem('formDataCollection', JSON.stringify(dataArray));
  }
  
  // Load form data from localStorage
  loadFromLocalStorage(): void {
    const storedData = localStorage.getItem('formDataCollection');
    if (storedData) {
      try {
        const dataArray = JSON.parse(storedData) as FormData[];
        this.formDataMap.clear();
        dataArray.forEach((data) => {
          const key = `${data.caseId}_${data.templateName}`;
          this.formDataMap.set(key, {
            ...data,
            lastModified: new Date(data.lastModified)
          });
        });
      } catch (error) {
        console.error('Error loading form data from localStorage:', error);
      }
    }
  }
  
  // Submit all forms for a case to the server
  async submitAllForms(caseId: string): Promise<{ success: boolean; message: string }> {
    try {
      const formsToSubmit = this.getAllFormDataForCase(caseId);
      
      if (formsToSubmit.length === 0) {
        return { success: false, message: 'No forms found for this case' };
      }
      
      // First, try to use Python API
      try {
        const results = await Promise.all(
          formsToSubmit.map(async (form) => {
            const response = await pythonApi.createForm({
              template_id: form.templateId,
              volunteer_id: form.volunteerId,
              status: 'submitted',
              data: form.data
            });
            
            return { 
              formName: form.templateName, 
              success: true, 
              response 
            };
          })
        );
        
        // Update local status
        formsToSubmit.forEach((form) => {
          const key = `${form.caseId}_${form.templateName}`;
          const updatedForm = { ...form, status: 'synced' as const };
          this.formDataMap.set(key, updatedForm);
        });
        
        this.saveToLocalStorage();
        
        return { 
          success: true, 
          message: `Successfully submitted ${results.length} forms using Python API` 
        };
      } catch (pythonApiError) {
        console.error('Python API submission failed:', pythonApiError);
        throw new Error('Failed to submit forms to Python API. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting forms:', error);
      return { 
        success: false, 
        message: `Error submitting forms: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
  
  // Clear all form data for a case after successful submission
  clearCaseData(caseId: string): void {
    const keysToRemove: string[] = [];
    
    this.formDataMap.forEach((data, key) => {
      if (data.caseId === caseId) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach((key) => {
      this.formDataMap.delete(key);
    });
    
    this.saveToLocalStorage();
  }
  
  // Get submission status summary
  getSubmissionStatus(caseId: string): { 
    total: number; 
    draft: number; 
    submitted: number; 
    synced: number; 
  } {
    const forms = this.getAllFormDataForCase(caseId);
    
    return {
      total: forms.length,
      draft: forms.filter(f => f.status === 'draft').length,
      submitted: forms.filter(f => f.status === 'submitted').length,
      synced: forms.filter(f => f.status === 'synced').length
    };
  }
}

// Create and export a singleton instance
export const formDataCollector = new FormDataCollector();

// Initialize from localStorage
formDataCollector.loadFromLocalStorage();