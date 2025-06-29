import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVolunteer } from '../context/VolunteerContext';
import { useGlobalForm } from '../context/GlobalFormContext';
import  CommonFormHeader  from '../components/CommonFormHeader';
import { FormField } from '../components/FormField';
import { SignatureFields } from '../components/SignatureFields';
import { Navigation } from '../components/Navigation';
import { useNavigate } from 'react-router-dom';
import type { SignatureData } from '../types/common';

interface CompleteBloodCountTest {
  result: string;
  unit: string;
  referenceRange: string;
}

interface HematologyForm {
  headerData: {
    age: string;
    studyNo: string;
    subjectId: string;
    sampleAndSid: string;
    sex: string;
    collectionCentre: string;
    sampleCollectionDate: string;
    registrationDate: string;
    reportDate: string;
  };
  completeBloodCount: {
    hemoglobin: CompleteBloodCountTest;
    rbcCount: CompleteBloodCountTest;
    wbcCount: CompleteBloodCountTest;
    plateletCount: CompleteBloodCountTest;
    neutrophils: CompleteBloodCountTest;
    lymphocytes: CompleteBloodCountTest;
    eosinophils: CompleteBloodCountTest;
    monocytes: CompleteBloodCountTest;
    basophils: CompleteBloodCountTest;
  };
  pathologist1: {
    name: string;
    specialty: string;
  };
  pathologist2: {
    name: string;
    specialty: string;
  };
}

export default function PostStudyHematology() {
  const { volunteerId } = useVolunteer();
  const { studyNo } = useGlobalForm();
  const navigate = useNavigate();

  const [periodNo, setPeriodNo] = useState<string>('1');
  
  // Load saved data from localStorage on component mount
  React.useEffect(() => {
    if (volunteerId) {
      const storedData = localStorage.getItem(`postStudyHematology_${volunteerId}_period${periodNo}`);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setPeriodData(prev => ({
            ...prev,
            [periodNo]: parsedData
          }));
        } catch (err) {
          console.error('Error parsing stored data:', err);
        }
      }
    }
  }, [volunteerId, periodNo]);
  
  const [periodData, setPeriodData] = useState({
    '1': {
      headerData: {
        age: '',
        studyNo: studyNo || '',
        subjectId: '',
        sampleAndSid: '',
        sex: 'Male',
        collectionCentre: '',
        sampleCollectionDate: '',
        registrationDate: '',
        reportDate: '',
      },
      completeBloodCount: {
        hemoglobin: { result: '', unit: 'g/dL', referenceRange: '11.5 - 16.0' },
        rbcCount: { result: '', unit: 'mil/µL', referenceRange: '3.8 - 4.8' },
        wbcCount: { result: '', unit: 'cells/Cumm', referenceRange: '4000 - 11000' },
        plateletCount: { result: '', unit: 'lakhs/cumm', referenceRange: '1.5 - 4.0' },
        neutrophils: { result: '', unit: '%', referenceRange: '40 - 75' },
        lymphocytes: { result: '', unit: '%', referenceRange: '20 - 40' },
        eosinophils: { result: '', unit: '%', referenceRange: '1 - 6' },
        monocytes: { result: '', unit: '%', referenceRange: '2 - 10' },
        basophils: { result: '', unit: '%', referenceRange: '0 - 1' },
      },
      pathologist1: {
        name: '',
        specialty: '',
      },
      pathologist2: {
        name: '',
        specialty: '',
      },
    } as HematologyForm,
    '2': {
      headerData: {
        age: '',
        studyNo: studyNo || '',
        subjectId: '',
        sampleAndSid: '',
        sex: 'Male',
        collectionCentre: '',
        sampleCollectionDate: '',
        registrationDate: '',
        reportDate: '',
      },
      completeBloodCount: {
        hemoglobin: { result: '', unit: 'g/dL', referenceRange: '11.5 - 16.0' },
        rbcCount: { result: '', unit: 'mil/µL', referenceRange: '3.8 - 4.8' },
        wbcCount: { result: '', unit: 'cells/Cumm', referenceRange: '4000 - 11000' },
        plateletCount: { result: '', unit: 'lakhs/cumm', referenceRange: '1.5 - 4.0' },
        neutrophils: { result: '', unit: '%', referenceRange: '40 - 75' },
        lymphocytes: { result: '', unit: '%', referenceRange: '20 - 40' },
        eosinophils: { result: '', unit: '%', referenceRange: '1 - 6' },
        monocytes: { result: '', unit: '%', referenceRange: '2 - 10' },
        basophils: { result: '', unit: '%', referenceRange: '0 - 1' },
      },
      pathologist1: {
        name: '',
        specialty: '',
      },
      pathologist2: {
        name: '',
        specialty: '',
      },
    } as HematologyForm
  });

  const formData = periodData[periodNo];

  const updateHeaderForm = (field: string, value: string) => {
    setPeriodData(prev => ({
      ...prev,
      [periodNo]: {
        ...prev[periodNo],
        headerData: {
          ...prev[periodNo].headerData,
          [field]: value
        }
      }
    }));
  };

  const updateCompleteBloodCount = (test: keyof HematologyForm['completeBloodCount'], field: keyof CompleteBloodCountTest, value: string) => {
    setPeriodData(prev => ({
      ...prev,
      [periodNo]: {
        ...prev[periodNo],
        completeBloodCount: {
          ...prev[periodNo].completeBloodCount,
          [test]: {
            ...prev[periodNo].completeBloodCount[test],
            [field]: value
          }
        }
      }
    }));
  };

  const updatePathologist = (pathologist: 'pathologist1' | 'pathologist2', field: 'name' | 'specialty', value: string) => {
    setPeriodData(prev => ({
      ...prev,
      [periodNo]: {
        ...prev[periodNo],
        [pathologist]: {
          ...prev[periodNo][pathologist],
          [field]: value
        }
      }
    }));
  };

  const handleContinue = () => {
    try {
      localStorage.setItem(`postStudyHematology_${volunteerId || 'unknown'}_period${periodNo}`, JSON.stringify(formData || {}));
      
      // Try Python API first
      try {
        pythonApi.createForm({
          template_id: `Post Study Hematology Period ${periodNo}`,
          volunteer_id: volunteerId || '',
          status: "submitted",
          data: formData,
        }).then(() => {
          console.log('Successfully submitted hematology data via Python API');
        }).catch(err => {
          console.warn('Failed to submit via Python API:', err);
        });
      } catch (apiError) {
        console.warn('Python API submission failed:', apiError);
      }
      
      // Add to form data collector
      if (volunteerId && formData) {
        formDataCollector.addFormData({
          templateId: `Post Study Hematology Period ${periodNo}`,
          templateName: `Post Study Hematology`,
          volunteerId: volunteerId,
          studyNumber: studyNo || '',
          caseId: '',
          data: formData,
          status: 'submitted',
          lastModified: new Date()
        });
      }
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
    
    // Save to database if needed
    // This would use a function from VolunteerContext
    
    // Navigate to next page
    navigate('/post-study/adverse-event');
  };

  // Display names for the table
  const displayNames: Record<string, string> = {
    hemoglobin: 'Hemoglobin (Hb)*',
    rbcCount: 'RBC count*',
    wbcCount: 'WBC count*',
    plateletCount: 'Platelet Count*',
    neutrophils: 'Neutrophils*',
    lymphocytes: 'Lymphocytes*',
    eosinophils: 'Eosinophils*',
    monocytes: 'Monocytes*',
    basophils: 'Basophils*',
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      
      
      <div className="flex justify-between items-center mb-4">
        <Link 
          to="/post-study/clinical-biochemistry" 
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
      
      <CommonFormHeader
        title="POST STUDY HEMATOLOGY"
        volunteerId={volunteerId || ''}
        studyNumber={studyNo || ''}
        caseId=""
      />

      

      <div className="space-y-6">
        {/* Header Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormField
              label="Age"
              value={formData.headerData.age}
              onChange={val => updateHeaderForm('age', val)}
            />
            <FormField
              label="Study No"
              value={formData.headerData.studyNo}
              onChange={val => updateHeaderForm('studyNo', val)}
            />
            <FormField
              label="Subject Id"
              value={formData.headerData.subjectId}
              onChange={val => updateHeaderForm('subjectId', val)}
            />
            <FormField
              label="Sample & SID"
              value={formData.headerData.sampleAndSid}
              onChange={val => updateHeaderForm('sampleAndSid', val)}
            />
          </div>
          <div className="space-y-4">
            <FormField
              label="Sex"
              type="select"
              options={['Male', 'Female']}
              value={formData.headerData.sex}
              onChange={val => updateHeaderForm('sex', val)}
            />
            <FormField
              label="Collection Centre"
              value={formData.headerData.collectionCentre}
              onChange={val => updateHeaderForm('collectionCentre', val)}
            />
            <FormField
              label="Sample Coll. Date"
              type="date"
              value={formData.headerData.sampleCollectionDate}
              onChange={val => updateHeaderForm('sampleCollectionDate', val)}
            />
            <FormField
              label="Registration Date"
              type="date"
              value={formData.headerData.registrationDate}
              onChange={val => updateHeaderForm('registrationDate', val)}
            />
            <FormField
              label="Report Date"
              type="date"
              value={formData.headerData.reportDate}
              onChange={val => updateHeaderForm('reportDate', val)}
            />
          </div>
        </div>

        {/* Complete Blood Count Table */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-center">HEMATOLOGY</h3>
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left border">TEST DESCRIPTION</th>
                  <th className="px-4 py-2 text-left border">RESULT</th>
                  <th className="px-4 py-2 text-left border">UNITS</th>
                  <th className="px-4 py-2 text-left border">REFERENCE RANGES</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2 border font-semibold" colSpan={4}>
                    COMPLETE BLOOD COUNT
                    <div className="text-xs text-gray-500">(Method: Electrical Impedance)</div>
                  </td>
                </tr>
                {Object.entries(formData.completeBloodCount).map(([key, test]) => {
                  const typedTest = test as CompleteBloodCountTest;
                  return (
                    <tr key={key} className="border-b">
                      <td className="px-4 py-2 border">{displayNames[key]}</td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          value={typedTest.result}
                          onChange={(e) => updateCompleteBloodCount(key as keyof HematologyForm['completeBloodCount'], 'result', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          value={typedTest.unit}
                          disabled
                          className="w-full px-2 py-1 border rounded bg-gray-50 text-gray-600"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          value={typedTest.referenceRange}
                          disabled
                          className="w-full px-2 py-1 border rounded bg-gray-50 text-gray-600"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pathologists */}
        <div className="mt-8 grid grid-cols-2 gap-8">
          <div className="border-t pt-4 flex flex-col items-center">
            <FormField
              label="Pathologist 1 Name"
              value={formData.pathologist1.name}
              onChange={val => updatePathologist('pathologist1', 'name', val)}
            />
            <FormField
              label="Pathologist 1 Specialty"
              value={formData.pathologist1.specialty}
              onChange={val => updatePathologist('pathologist1', 'specialty', val)}
            />
          </div>
          <div className="border-t pt-4 flex flex-col items-center">
            <FormField
              label="Pathologist 2 Name"
              value={formData.pathologist2.name}
              onChange={val => updatePathologist('pathologist2', 'name', val)}
            />
            <FormField
              label="Pathologist 2 Specialty"
              value={formData.pathologist2.specialty}
              onChange={val => updatePathologist('pathologist2', 'specialty', val)}
            />
          </div>
        </div>

        <Navigation
          onBack={() => navigate('/post-study/clinical-biochemistry')}
          onContinue={handleContinue}
          backLabel="Previous"
          continueLabel="Complete"
          timestampLabel="Entry Date & Time"
        />
      </div>
    </div>
  );
}
