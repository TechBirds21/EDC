
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { pythonApi } from '@/services/api';

interface HeaderData {
  age: string;
  studyNo: string;
  subjectId: string;
  sampleAndSid: string;
  sex: string;
  collectionCentre: string;
  sampleCollectionDate: string;
  registrationDate: string;
  reportDate: string;
}

interface BhcgTest {
  result: string;
  unit: string;
  referenceRange: string;
}

interface SignatureData {
  name: string;
  date: string;
  time: string;
}

interface FormData {
  mcNumber: string;
  headerData: HeaderData;
  bhcgTest: BhcgTest;
  evaluatedBy: SignatureData;
}

export const useBhcgTest = (caseId: string | null, volunteerId: string | null, studyNumber: string | null) => {
  const [formData, setFormData] = useState<FormData>({
    mcNumber: 'MC - 6241',
    headerData: {
      age: '',
      studyNo: studyNumber || '',
      subjectId: '',
      sampleAndSid: '',
      sex: 'Female',
      collectionCentre: '',
      sampleCollectionDate: '',
      registrationDate: '',
      reportDate: '',
    },
    bhcgTest: {
      result: '',
      unit: 'mIU/mL',
      referenceRange: '< 5.3',
    },
    evaluatedBy: {
      name: '',
      date: '',
      time: ''
    },
  });

  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (caseId) {
      loadExistingData();
    }
  }, [caseId]);

  // Load existing data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem(`bhcgTest_${volunteerId}`);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setFormData(parsedData);
      } catch (err) {
        console.error('Error parsing stored data:', err);
      }
    }
  }, [volunteerId]);

  const loadExistingData = async () => {
    if (!caseId) return;
    
    try {
      // Load from Python API
      const response = await pythonApi.getForms(1, 100, {
        template_id: 'bhcg_test',
        volunteer_id: caseId
      });

      if (response && response.items.length > 0) {
        const formData = response.items[0].data as FormData;
        setFormData(formData);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading β-HCG test:', error);
    }
  };

  const updateHeaderForm = (field: keyof HeaderData, value: string) => {
    setFormData(prev => ({
      ...prev,
      headerData: {
        ...prev.headerData,
        [field]: value
      }
    }));
    setIsSaved(false);
  };

  const updateBhcgTest = (field: keyof BhcgTest, value: string) => {
    setFormData(prev => ({
      ...prev,
      bhcgTest: {
        ...prev.bhcgTest,
        [field]: value
      }
    }));
    setIsSaved(false);
  };

  const updateEvaluatedBy = (field: keyof SignatureData, value: string) => {
    setFormData(prev => ({
      ...prev,
      evaluatedBy: {
        ...prev.evaluatedBy,
        [field]: value
      }
    }));
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!caseId || !volunteerId || !studyNumber) {
      toast.error('Missing required information');
      return;
    }

    setLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem(`bhcgTest_${volunteerId}`, JSON.stringify(formData));

      // Save to Python API
      await pythonApi.createForm({
        template_id: 'bhcg_test',
        volunteer_id: volunteerId,
        study_number: studyNumber,
        data: formData,
        status: 'submitted'
      });

      setIsSaved(true);
      toast.success('β-HCG test saved successfully');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save β-HCG test');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    isSaved,
    updateHeaderForm,
    updateBhcgTest,
    updateEvaluatedBy,
    handleSave
  };
};
