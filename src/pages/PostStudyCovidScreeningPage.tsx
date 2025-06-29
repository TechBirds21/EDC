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

interface CovidScreeningFormData {
  safetyManualNo: string;
  volunteerName: string;
  projectNo: string; 
  subjectNo: string;
  screening: boolean;
  checkIn: boolean;
  checkOut: boolean;
  postStudySafety: boolean;
  others: string;
  temperature: string;
  temperatureStatus: 'Normal' | 'Abnormal' | null;
  history: {
    quarantined: boolean | null;
    fever: boolean | null;
    soreThroatCough: boolean | null;
    coldSneezingRunnyNose: boolean | null;
    respiratoryDistress: boolean | null;
    lossOfTasteAndSmell: boolean | null;
    familySymptoms: boolean | null;
  };
  abnormalityObserved: boolean | null;
  covidSymptoms: boolean | null;
  eligibleForActivity: boolean | null;
  comments: string;
  screenedBy: SignatureData;
}

const initialFormData: CovidScreeningFormData = {
  safetyManualNo: 'SM-001',
  volunteerName: '',
  projectNo: '',
  subjectNo: '',
  screening: false,
  checkIn: false,
  checkOut: false,
  postStudySafety: true,
  others: '',
  temperature: '',
  temperatureStatus: null,
  history: {
    quarantined: null,
    fever: null,
    soreThroatCough: null,
    coldSneezingRunnyNose: null,
    respiratoryDistress: null,
    lossOfTasteAndSmell: null,
    familySymptoms: null,
  },
  abnormalityObserved: null,
  covidSymptoms: null,
  eligibleForActivity: null,
  comments: '',
  screenedBy: { name: '', date: '', time: '' }
};

export default function PostStudyCovidScreening() {
  const { volunteerId } = useVolunteer();
  const { studyNo } = useGlobalForm();
  const navigate = useNavigate();

  const [periodNo, setPeriodNo] = useState<string>('1');
  const [periodData, setPeriodData] = useState({
    '1': { ...initialFormData },
    '2': { ...initialFormData }
  });

  // Load saved data from localStorage on component mount
  React.useEffect(() => {
    if (volunteerId) {
      const storedData = localStorage.getItem(`postStudyCovidScreening_${volunteerId}_period${periodNo}`);
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
  
  const formData = periodData[periodNo];

  const updateField = (field: keyof CovidScreeningFormData, value: any) => {
    setPeriodData(prev => ({
      ...prev,
      [periodNo]: { ...prev[periodNo], [field]: value }
    }));
  };

  const updateHistory = (field: keyof CovidScreeningFormData['history'], value: boolean) => {
    setPeriodData(prev => ({
      ...prev,
      [periodNo]: {
        ...prev[periodNo],
        history: {
          ...prev[periodNo].history,
          [field]: value
        }
      }
    }));
  };
  
  const handleContinue = () => {
    try {
      localStorage.setItem(`postStudyCovidScreening_${volunteerId || 'unknown'}_period${periodNo}`, JSON.stringify(formData || {}));
      console.log('Saved COVID screening data to localStorage');
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
    
    // Save to database if needed
    // This would use a function from VolunteerContext
    
    // Navigate to next page
    navigate('/post-study/clinical-biochemistry');
  };

  return (
    <div className="max-w-4xl mx-auto bg-background p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <Link 
          to="/post-study/depression-scale" 
          className="text-blue-500 hover:underline"
        >
          Previous
        </Link>
        
        <div className="flex gap-4">
          <div className="text-sm text-muted-foreground">
            Volunteer ID: <span className="font-medium">{volunteerId}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Study No: <span className="font-medium">{studyNo}</span>
          </div>
        </div>
      </div>
      
      <CommonFormHeader
        volunteerId={volunteerId || ''}
        subjectNo={formData.subjectNo}
        projectNo={studyNo || ''}
        updateCommon={(field, value) => {
          if (field === 'subjectNo') updateField('subjectNo', value);
        }}
        periodNo={periodNo}
        setPeriodNo={setPeriodNo}
        formDate=""
        setFormDate={() => {}}
        title="CORONAVIRUS DISEASE (COVID-19) SYMPTOMS SCREENING PROCEDURE FOR VOLUNTEERS/SUBJECTS"
        sopNumber="SM-001"
      />

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Name of the Volunteer"
            value={formData.volunteerName}
            onChange={val => updateField('volunteerName', val)}
          />
          <FormField
            label="Subject No."
            value={formData.subjectNo}
            onChange={val => updateField('subjectNo', val)}
          />
        </div>

        {/* Screening Type */}
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={formData.screening}
              onChange={e => updateField('screening', e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2">Screening</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={formData.checkIn}
              onChange={e => updateField('checkIn', e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2">Check in</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={formData.checkOut}
              onChange={e => updateField('checkOut', e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2">Check out</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={formData.postStudySafety}
              onChange={e => updateField('postStudySafety', e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2">Post study safety</span>
          </label>
          <div className="flex items-center gap-2">
            <span>Others:</span>
            <input
              type="text"
              value={formData.others}
              onChange={e => updateField('others', e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span>Temperature recorded by IR Thermometer is</span>
            <input
              type="text"
              value={formData.temperature}
              onChange={e => updateField('temperature', e.target.value)}
              className="border rounded px-2 py-1 w-20"
            />
            <span>°F</span>
          </div>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.temperatureStatus === 'Normal'}
                onChange={() => updateField('temperatureStatus', 'Normal')}
                className="form-radio"
              />
              <span className="ml-2">Normal</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.temperatureStatus === 'Abnormal'}
                onChange={() => updateField('temperatureStatus', 'Abnormal')}
                className="form-radio"
              />
              <span className="ml-2">Abnormal</span>
            </label>
          </div>
        </div>

        {/* History */}
        <div className="space-y-4">
          <h3 className="font-medium">HISTORY</h3>
          <table className="w-full border">
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2">Have you been quarantined by the public health authorities for COVID-19 in last 14 days?</td>
                <td className="px-4 py-2 w-32">
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={formData.history.quarantined === true}
                        onChange={() => updateHistory('quarantined', true)}
                        className="form-radio"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={formData.history.quarantined === false}
                        onChange={() => updateHistory('quarantined', false)}
                        className="form-radio"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">Any History of fever?</td>
                <td className="px-4 py-2">
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={formData.history.fever === true}
                        onChange={() => updateHistory('fever', true)}
                        className="form-radio"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={formData.history.fever === false}
                        onChange={() => updateHistory('fever', false)}
                        className="form-radio"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">Any history of sore throat and Cough?</td>
                <td className="px-4 py-2">
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={formData.history.soreThroatCough === true}
                        onChange={() => updateHistory('soreThroatCough', true)}
                        className="form-radio"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={formData.history.soreThroatCough === false}
                        onChange={() => updateHistory('soreThroatCough', false)}
                        className="form-radio"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">Any history of cold/Sneezing/Runny Nose?</td>
                <td className="px-4 py-2">
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={formData.history.coldSneezingRunnyNose === true}
                        onChange={() => updateHistory('coldSneezingRunnyNose', true)}
                        className="form-radio"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={formData.history.coldSneezingRunnyNose === false}
                        onChange={() => updateHistory('coldSneezingRunnyNose', false)}
                        className="form-radio"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">Any history of Respiratory Distress?</td>
                <td className="px-4 py-2">
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={formData.history.respiratoryDistress === true}
                        onChange={() => updateHistory('respiratoryDistress', true)}
                        className="form-radio"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={formData.history.respiratoryDistress === false}
                        onChange={() => updateHistory('respiratoryDistress', false)}
                        className="form-radio"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">Any history loss of taste and smell?</td>
                <td className="px-4 py-2">
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={formData.history.lossOfTasteAndSmell === true}
                        onChange={() => updateHistory('lossOfTasteAndSmell', true)}
                        className="form-radio"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={formData.history.lossOfTasteAndSmell === false}
                        onChange={() => updateHistory('lossOfTasteAndSmell', false)}
                        className="form-radio"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">Are your family members suffering from any of the symptoms like fever/Cough/cold/Sneezing/Runny Nose/sore throat/Respiratory Distress?</td>
                <td className="px-4 py-2">
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={formData.history.familySymptoms === true}
                        onChange={() => updateHistory('familySymptoms', true)}
                        className="form-radio"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={formData.history.familySymptoms === false}
                        onChange={() => updateHistory('familySymptoms', false)}
                        className="form-radio"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Final Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Any abnormality observed on examination:</span>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.abnormalityObserved === true}
                  onChange={() => updateField('abnormalityObserved', true)}
                  className="form-radio"
                />
                <span className="ml-2">YES</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.abnormalityObserved === false}
                  onChange={() => updateField('abnormalityObserved', false)}
                  className="form-radio"
                />
                <span className="ml-2">NO</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>Any symptoms/signs of COVID-19:</span>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.covidSymptoms === true}
                  onChange={() => updateField('covidSymptoms', true)}
                  className="form-radio"
                />
                <span className="ml-2">YES</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.covidSymptoms === false}
                  onChange={() => updateField('covidSymptoms', false)}
                  className="form-radio"
                />
                <span className="ml-2">NO</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>Volunteer is eligible for further activity:</span>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.eligibleForActivity === true}
                  onChange={() => updateField('eligibleForActivity', true)}
                  className="form-radio"
                />
                <span className="ml-2">YES</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.eligibleForActivity === false}
                  onChange={() => updateField('eligibleForActivity', false)}
                  className="form-radio"
                />
                <span className="ml-2">NO</span>
              </label>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block font-medium mb-2">Comments:</label>
          <textarea
            value={formData.comments}
            onChange={e => updateField('comments', e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        {/* Screened By */}
        <div>
          <SignatureFields
            label="COVID-19 Screening done by (Physician):"
            value={formData.screenedBy}
            onChange={val => updateField('screenedBy', val)}
            vertical
          />
        </div>

        <Navigation
          backUrl="/post-study/depression-scale"
          onContinue={handleContinue}
          backLabel="Previous"
          continueLabel="Continue"
          timestampLabel="Entry Date & Time"
        />
      </div>
    </div>
  );
}
