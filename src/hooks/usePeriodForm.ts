import { useVolunteer } from '@/context/VolunteerContext';
import { useState, useEffect, useCallback } from 'react';
import { useAuditTrail } from './useAuditTrail';

export interface PeriodFormData {
  period: number;
  formType: string;
  data: Record<string, unknown>;
  lastSaved?: string;
  status?: 'draft' | 'submitted';
}

export interface PeriodFormHookOptions {
  formType: string;
  initialData: Record<string, unknown>;
  period?: number;
}

export function usePeriodForm({
  formType,
  initialData,
  period = 1
}: PeriodFormHookOptions) {
  const { volunteerData, saveLabReport, savePatientRecord } = useVolunteer();
  const [formData, setFormData] = useState(initialData);
  const [currentPeriod, setCurrentPeriod] = useState(period);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [originalData, setOriginalData] = useState(initialData);

  // Audit trail functionality
  const {
    isAuditDialogOpen,
    setIsAuditDialogOpen,
    isFormSubmitted,
    handleEditConfirmation,
    requiresEditConfirmation,
    markFormAsSubmitted,
    getAuditHistory
  } = useAuditTrail(formType);

  // Generate storage key for period-based data
  const getStorageKey = useCallback((formType: string, period: number) => {
    if (!volunteerData) return null;
    return `period_${period}_${formType}_${volunteerData.volunteerId}`;
  }, [volunteerData]);

  // Load saved data for current period
  const loadPeriodData = useCallback((targetPeriod: number) => {
    const storageKey = getStorageKey(formType, targetPeriod);
    if (!storageKey) return;

    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsed: PeriodFormData = JSON.parse(savedData);
        setFormData(parsed.data as typeof initialData);
        setOriginalData(parsed.data as typeof initialData);
        setIsSaved(true);
        console.log(`Loaded ${formType} data for period ${targetPeriod}`);
      } catch (error) {
        console.error('Error loading period data:', error);
        setFormData(initialData);
        setOriginalData(initialData);
      }
    } else {
      setFormData(initialData);
      setOriginalData(initialData);
      setIsSaved(false);
    }
  }, [formType, initialData, getStorageKey]);

  // Save data for current period with audit trail support
  const savePeriodData = useCallback(async (dataToSave?: Record<string, unknown>, isSubmit = false) => {
    if (!volunteerData) {
      throw new Error('No volunteer data available');
    }

    const storageKey = getStorageKey(formType, currentPeriod);
    if (!storageKey) return;

    const dataToStore = dataToSave || formData;
    const formId = `${formType}_period_${currentPeriod}_${volunteerData.volunteerId}`;

    // Check if this requires audit confirmation
    if (requiresEditConfirmation(formId, originalData, dataToStore)) {
      setIsAuditDialogOpen(true);
      return new Promise<void>((resolve, reject) => {
        // Store the resolve/reject for later use
        (window as any).auditPromiseResolve = resolve;
        (window as any).auditPromiseReject = reject;
        (window as any).pendingAuditData = { dataToStore, isSubmit, formId };
      });
    }

    // Proceed with normal save
    return await performSave(dataToStore, isSubmit, formId);
  }, [volunteerData, formType, currentPeriod, formData, originalData, getStorageKey, requiresEditConfirmation]);

  // Perform the actual save operation
  const performSave = useCallback(async (
    dataToStore: Record<string, unknown>,
    isSubmit: boolean,
    formId: string
  ) => {
    setIsLoading(true);
    try {
      const periodData: PeriodFormData = {
        period: currentPeriod,
        formType,
        data: dataToStore,
        lastSaved: new Date().toISOString(),
        status: isSubmit ? 'submitted' : 'draft'
      };

      const storageKey = getStorageKey(formType, currentPeriod);
      if (storageKey) {
        // Save to localStorage as draft
        localStorage.setItem(storageKey, JSON.stringify(periodData));
      }

      // Also save using the volunteer context method for API integration
      if (formType.includes('lab') || formType.includes('biochemistry')) {
        await saveLabReport(`${formType}_period_${currentPeriod}`, dataToStore);
      } else {
        await savePatientRecord(`${formType}_period_${currentPeriod}`, dataToStore);
      }

      if (isSubmit) {
        markFormAsSubmitted(formId);
      }

      setIsSaved(true);
      setOriginalData(dataToStore);
      console.log(`Saved ${formType} data for period ${currentPeriod}`);
    } catch (error) {
      console.error('Error saving period data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentPeriod, formType, getStorageKey, saveLabReport, savePatientRecord, markFormAsSubmitted]);

  // Handle audit confirmation
  const handleAuditConfirmation = useCallback(async (password: string, reason: string) => {
    const pendingData = (window as any).pendingAuditData;
    const resolve = (window as any).auditPromiseResolve;
    const reject = (window as any).auditPromiseReject;

    if (!pendingData || !resolve || !reject) {
      throw new Error('No pending audit data found');
    }

    try {
      // Create audit trail
      await handleEditConfirmation(
        password,
        reason,
        originalData,
        pendingData.dataToStore,
        pendingData.formId
      );

      // Perform the save
      await performSave(pendingData.dataToStore, pendingData.isSubmit, pendingData.formId);

      // Clean up
      delete (window as any).auditPromiseResolve;
      delete (window as any).auditPromiseReject;
      delete (window as any).pendingAuditData;

      resolve();
    } catch (error) {
      reject(error);
      throw error;
    }
  }, [originalData, handleEditConfirmation, performSave]);

  // Switch period and load its data
  const switchPeriod = useCallback((newPeriod: number) => {
    if (newPeriod === currentPeriod) return;
    
    console.log(`Switching from period ${currentPeriod} to period ${newPeriod}`);
    setCurrentPeriod(newPeriod);
    loadPeriodData(newPeriod);
  }, [currentPeriod, loadPeriodData]);

  // Get saved periods for this form type
  const getSavedPeriods = useCallback(() => {
    if (!volunteerData) return [];
    
    const savedPeriods: number[] = [];
    for (let p = 1; p <= 2; p++) {
      const storageKey = getStorageKey(formType, p);
      if (storageKey && localStorage.getItem(storageKey)) {
        savedPeriods.push(p);
      }
    }
    return savedPeriods;
  }, [volunteerData, formType, getStorageKey]);

  // Check if specific period has data
  const hasPeriodData = useCallback((period: number) => {
    const storageKey = getStorageKey(formType, period);
    return storageKey && localStorage.getItem(storageKey) !== null;
  }, [formType, getStorageKey]);

  // Initialize data loading
  useEffect(() => {
    if (volunteerData) {
      loadPeriodData(currentPeriod);
    }
  }, [volunteerData, currentPeriod, loadPeriodData]);

  return {
    formData,
    setFormData,
    currentPeriod,
    savePeriodData,
    switchPeriod,
    getSavedPeriods,
    hasPeriodData,
    isLoading,
    isSaved,
    loadPeriodData,
    // Audit trail related
    isAuditDialogOpen,
    setIsAuditDialogOpen,
    handleAuditConfirmation,
    getAuditHistory,
    isFormSubmitted: (formId?: string) => {
      const id = formId || `${formType}_period_${currentPeriod}_${volunteerData?.volunteerId}`;
      return isFormSubmitted(id);
    }
  };
}

export default usePeriodForm;