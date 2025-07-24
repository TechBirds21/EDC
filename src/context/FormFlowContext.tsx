import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { 
  createFormSession, 
  getFormSession, 
  saveFormPageData, 
  getFormPageData,
  markFormAsCompleted,
  navigateToForm,
  getCompletedFormsData,
  FormSession
} from '@/lib/dexie';

interface FormFlowContextType {
  // Session management
  currentSession: FormSession | null;
  initializeSession: (caseId: string, volunteerId: string, studyNumber: string, formSequence: string[]) => Promise<void>;
  loadSession: (caseId: string) => Promise<void>;
  
  // Form data management
  saveCurrentFormData: (pageName: string, data: Record<string, any>, isValid?: boolean, errors?: Record<string, string[]>) => Promise<void>;
  getCurrentFormData: (pageName: string) => Promise<Record<string, any>>;
  getAllFormData: () => Promise<Record<string, any>>;
  
  // Navigation
  goToPrevious: () => Promise<boolean>;
  goToNext: () => Promise<boolean>;
  goToForm: (formName: string) => Promise<boolean>;
  canNavigateNext: () => boolean;
  canNavigatePrevious: () => boolean;
  
  // Form completion
  completeCurrentForm: () => Promise<void>;
  isFormCompleted: (formName: string) => boolean;
  getAllCompletedForms: () => string[];
  
  // Validation and errors
  hasValidationErrors: () => boolean;
  getValidationErrors: () => Record<string, string[]> | undefined;
  
  // State
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const FormFlowContext = createContext<FormFlowContextType | undefined>(undefined);

export const useFormFlow = () => {
  const context = useContext(FormFlowContext);
  if (context === undefined) {
    throw new Error('useFormFlow must be used within a FormFlowProvider');
  }
  return context;
};

interface FormFlowProviderProps {
  children: ReactNode;
}

export const FormFlowProvider: React.FC<FormFlowProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<FormSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const initializeSession = useCallback(async (
    caseId: string, 
    volunteerId: string, 
    studyNumber: string, 
    formSequence: string[]
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      await createFormSession(caseId, volunteerId, studyNumber, formSequence);
      const session = await getFormSession(caseId);
      setCurrentSession(session || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize session');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSession = useCallback(async (caseId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const session = await getFormSession(caseId);
      setCurrentSession(session || null);
      
      if (!session) {
        setError('Session not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveCurrentFormData = useCallback(async (
    pageName: string, 
    data: Record<string, any>, 
    isValid: boolean = true,
    validationErrors?: Record<string, string[]>
  ) => {
    if (!currentSession) {
      setError('No active session');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await saveFormPageData(currentSession.case_id, pageName, data, isValid, validationErrors);
      
      // Reload session to get updated data
      const updatedSession = await getFormSession(currentSession.case_id);
      setCurrentSession(updatedSession || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save form data');
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const getCurrentFormData = useCallback(async (pageName: string): Promise<Record<string, any>> => {
    if (!currentSession) {
      return {};
    }

    try {
      const pageData = await getFormPageData(currentSession.case_id, pageName);
      return pageData?.data || {};
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get form data');
      return {};
    }
  }, [currentSession]);

  const getAllFormData = useCallback(async (): Promise<Record<string, any>> => {
    if (!currentSession) {
      return {};
    }

    try {
      return await getCompletedFormsData(currentSession.case_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get all form data');
      return {};
    }
  }, [currentSession]);

  const goToPrevious = useCallback(async (): Promise<boolean> => {
    if (!currentSession || !canNavigatePrevious()) {
      return false;
    }

    try {
      const prevIndex = currentSession.navigation_state.current_step - 1;
      const prevForm = currentSession.navigation_state.form_sequence[prevIndex];
      
      if (prevForm) {
        await navigateToForm(currentSession.case_id, prevForm);
        const updatedSession = await getFormSession(currentSession.case_id);
        setCurrentSession(updatedSession || null);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to navigate to previous form');
      return false;
    }
  }, [currentSession]);

  const goToNext = useCallback(async (): Promise<boolean> => {
    if (!currentSession || !canNavigateNext()) {
      return false;
    }

    try {
      const nextIndex = currentSession.navigation_state.current_step + 1;
      const nextForm = currentSession.navigation_state.form_sequence[nextIndex];
      
      if (nextForm) {
        await navigateToForm(currentSession.case_id, nextForm);
        const updatedSession = await getFormSession(currentSession.case_id);
        setCurrentSession(updatedSession || null);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to navigate to next form');
      return false;
    }
  }, [currentSession]);

  const goToForm = useCallback(async (formName: string): Promise<boolean> => {
    if (!currentSession) {
      return false;
    }

    try {
      await navigateToForm(currentSession.case_id, formName);
      const updatedSession = await getFormSession(currentSession.case_id);
      setCurrentSession(updatedSession || null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to navigate to form');
      return false;
    }
  }, [currentSession]);

  const canNavigateNext = useCallback((): boolean => {
    if (!currentSession) return false;
    
    const { current_step, total_steps } = currentSession.navigation_state;
    return current_step < total_steps - 1;
  }, [currentSession]);

  const canNavigatePrevious = useCallback((): boolean => {
    if (!currentSession) return false;
    
    const { current_step } = currentSession.navigation_state;
    return current_step > 0;
  }, [currentSession]);

  const completeCurrentForm = useCallback(async () => {
    if (!currentSession) {
      setError('No active session');
      return;
    }

    try {
      await markFormAsCompleted(currentSession.case_id, currentSession.current_form);
      const updatedSession = await getFormSession(currentSession.case_id);
      setCurrentSession(updatedSession || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete form');
    }
  }, [currentSession]);

  const isFormCompleted = useCallback((formName: string): boolean => {
    return currentSession?.completed_forms.includes(formName) || false;
  }, [currentSession]);

  const getAllCompletedForms = useCallback((): string[] => {
    return currentSession?.completed_forms || [];
  }, [currentSession]);

  const hasValidationErrors = useCallback((): boolean => {
    return currentSession?.validation_errors !== undefined && 
           Object.keys(currentSession.validation_errors).length > 0;
  }, [currentSession]);

  const getValidationErrors = useCallback((): Record<string, string[]> | undefined => {
    return currentSession?.validation_errors;
  }, [currentSession]);

  const value: FormFlowContextType = {
    currentSession,
    initializeSession,
    loadSession,
    saveCurrentFormData,
    getCurrentFormData,
    getAllFormData,
    goToPrevious,
    goToNext,
    goToForm,
    canNavigateNext,
    canNavigatePrevious,
    completeCurrentForm,
    isFormCompleted,
    getAllCompletedForms,
    hasValidationErrors,
    getValidationErrors,
    loading,
    error,
    clearError
  };

  return (
    <FormFlowContext.Provider value={value}>
      {children}
    </FormFlowContext.Provider>
  );
};