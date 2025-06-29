
import { useState, useEffect } from 'react';

interface UseStudyPeriodFormProps<T> {
  formKey: string;
  initialData: T;
}

const useStudyPeriodForm = <T extends Record<string, any>>(
  formKey: string,
  initialData: T
) => {
  const [activePeriod, setActivePeriod] = useState('1');
  const [studyNo, setStudyNo] = useState('');
  const [periodData, setPeriodData] = useState<Record<string, T>>({
    '1': { ...initialData },
    '2': { ...initialData }
  });

  const formData = periodData[activePeriod] || initialData;

  const updateField = (field: keyof T, value: any) => {
    setPeriodData(prev => ({
      ...prev,
      [activePeriod]: { ...prev[activePeriod], [field]: value }
    }));
  };

  const handlePeriodChange = (period: string) => {
    setActivePeriod(period);
  };

  const handleContinue = async (navigate: boolean = false) => {
    try {
      const key = `${formKey}_period${activePeriod}`;
      localStorage.setItem(key, JSON.stringify(formData));
      console.log(`Saved ${formKey} data for period ${activePeriod}`);
      return true;
    } catch (error) {
      console.error('Error saving form data:', error);
      return false;
    }
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const key = `${formKey}_period${activePeriod}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setPeriodData(prev => ({
          ...prev,
          [activePeriod]: parsedData
        }));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, [formKey, activePeriod]);

  return {
    activePeriod,
    formData,
    updateField,
    handlePeriodChange,
    handleContinue,
    studyNo
  };
};

export default useStudyPeriodForm;
