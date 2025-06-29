
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVolunteer } from '../context/VolunteerContext';
import { useGlobalForm } from '../context/GlobalFormContext';
import  CommonFormHeader  from '../components/CommonFormHeader';
import { FormField } from '../components/FormField';
import { SignatureFields } from '../components/SignatureFields';
import { Navigation } from '../components/Navigation';
import type { SignatureData } from '../types/common';

const depressionItemsList = [
  {
    title: "DEPRESSED MOOD",
    subtitle: "(Gloomy attitude, pessimism about the future, feeling of sadness, tendency to weep)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Sadness, etc." },
      { score: 2, text: "Occasional weeping" },
      { score: 3, text: "Frequent weeping" },
      { score: 4, text: "Extreme symptoms" },
    ]
  },
  {
    title: "FEELINGS OF GUILT",
    subtitle: "",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Self-reproach, feels he/she has let people down" },
      { score: 2, text: "Ideas of guilt" },
      { score: 3, text: "Present illness is a punishment, Delusions of guilt" },
      { score: 4, text: "Hallucinations of guilt" },
    ]
  },
  {
    title: "SUICIDE",
    subtitle: "",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Feels life is not worth living" },
      { score: 2, text: "Wishes he/she were dead" },
      { score: 3, text: "Suicidal ideas or gestures" },
      { score: 4, text: "Attempts at suicide" },
    ]
  },
  {
    title: "INSOMNIA: Initial",
    subtitle: "(Difficulty in falling asleep)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Occasional" },
      { score: 2, text: "Frequent" }
    ]
  },
  {
    title: "INSOMNIA: Middle",
    subtitle: "(Complains of being restless and disturbed during the night. Waking during the night)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Occasional" },
      { score: 2, text: "Frequent" }
    ]
  },
  {
    title: "INSOMNIA: Delayed",
    subtitle: "(Waking in early hours of the morning and unable to fall asleep again)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Occasional" },
      { score: 2, text: "Frequent" }
    ]
  },
  {
    title: "WORK AND INTERESTS",
    subtitle: "",
    options: [
      { score: 0, text: "No difficulty" },
      { score: 1, text: "Feelings of incapacity, listlessness, indecision and vacillation" },
      { score: 2, text: "Loss of interest in hobbies, decreased social activities" },
      { score: 3, text: "Productivity decreased" },
      { score: 4, text: "Unable to work. Stopped working because of present illness only." },
    ]
  },
  {
    title: "RETARDATION",
    subtitle: "(Slowness of thought, speech, and activity; apathy; stupor.)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Slight retardation at interview" },
      { score: 2, text: "Obvious retardation at interview" },
      { score: 3, text: "Interview difficult" },
      { score: 4, text: "Complete stupor" },
    ]
  },
  {
    title: "AGITATION",
    subtitle: "(Restlessness associated with anxiety)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Occasional" },
      { score: 2, text: "Frequent" }
    ]
  },
  {
    title: "ANXIETY PSYCHIC",
    subtitle: "",
    options: [
      { score: 0, text: "No difficulty" },
      { score: 1, text: "Tension and irritability" },
      { score: 2, text: "Worrying about minor matters" },
      { score: 3, text: "Apprehensive attitude" },
      { score: 4, text: "Fears" },
    ]
  },
  {
    title: "ANXIETY SOMATIC",
    subtitle: "(Gastrointestinal, indigestion Cardiovascular, palpitation, Headaches Respiratory, Genito-urinary, etc.)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Mild" },
      { score: 2, text: "Moderate" },
      { score: 3, text: "Severe" },
      { score: 4, text: "Incapacitating" },
    ]
  },
  {
    title: "SOMATIC SYMPTOMS GASTROINTESTINAL",
    subtitle: "(Loss of appetite, heavy feeling in abdomen; constipation)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Mild" },
      { score: 2, text: "Severe" },
    ]
  },
  {
    title: "SOMATIC SYMPTOMS – GENERAL",
    subtitle: "(Heaviness in limbs, back or head; diffuse backache; loss of energy and fatigability)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Mild" },
      { score: 2, text: "Severe" },
    ]
  },
  {
    title: "GENITAL SYMPTOMS",
    subtitle: "(Loss of libido, menstrual disturbances)",
    options: [
      { score: 0, text: "Absent" },
      { score: 1, text: "Mild" },
      { score: 2, text: "Severe" },
    ]
  },
  {
    title: "HYPOCHONDRIASIS",
    subtitle: "",
    options: [
      { score: 0, text: "Not present" },
      { score: 1, text: "Self-absorption (bodily)" },
      { score: 2, text: "Preoccupation with health" },
      { score: 3, text: "Frequent complaints" },
      { score: 4, text: "Hypochondriacal delusions" },
    ]
  },
  {
    title: "WEIGHT LOSS",
    subtitle: "",
    options: [
      { score: 0, text: "No weight loss" },
      { score: 1, text: "Slight" },
      { score: 2, text: "Obvious or severe" },
    ]
  },
  {
    title: "INSIGHT",
    subtitle: "(Insight must be interpreted in terms of volunteers understanding and background.)",
    options: [
      { score: 0, text: "No loss" },
      { score: 1, text: "Partial or doubt full loss" },
      { score: 2, text: "Loss of insight" },
    ]
  },
];

interface DepressionScaleForm {
  depressionItems: (typeof depressionItemsList[0] & { selectedScore: number | null })[];
  totalScore: number;
  depressionScreen: boolean | null;
  comments: string;
  reviewedBy: SignatureData;
}

const PostStudyDepressionScalePage = () => {
  const { volunteerId } = useVolunteer();
  const { studyNo } = useGlobalForm();
  const navigate = useNavigate();

  const [periodNo, setPeriodNo] = useState<string>('1');
  const [formData, setFormData] = useState<DepressionScaleForm>({
    depressionItems: depressionItemsList.map(item => ({
      ...item,
      selectedScore: null
    })),
    totalScore: 0,
    depressionScreen: null,
    comments: '',
    reviewedBy: {
      name: '',
      date: '',
      time: '',
    },
  });

  useEffect(() => {
    if (volunteerId) {
      const storedData = localStorage.getItem(`depressionScale_${volunteerId}_period${periodNo}`);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setFormData(parsedData);
        } catch (err) {
          console.error('Error parsing stored data:', err);
        }
      }
    }
  }, [volunteerId, periodNo]);

  const updateScore = (itemIndex: number, score: number) => {
    setFormData((prev) => {
      const updatedItems = [...prev.depressionItems];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], selectedScore: score };
      
      const totalScore = updatedItems.reduce((sum, item) => sum + (item.selectedScore ?? 0), 0);
      const depressionScreen = totalScore > 7;
      
      return {
        ...prev,
        depressionItems: updatedItems,
        totalScore,
        depressionScreen,
      };
    });
  };

  const updateComments = (comments: string) => {
    setFormData((prev) => ({
      ...prev,
      comments,
    }));
  };

  const updateReviewedBy = (value: SignatureData) => {
    setFormData((prev) => ({
      ...prev,
      reviewedBy: value,
    }));
  };

  const handleContinue = () => {
    try {
      localStorage.setItem(`depressionScale_${volunteerId || 'unknown'}_period${periodNo}`, JSON.stringify(formData));
      console.log('Saved depression scale data to localStorage');
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }

    navigate('/post-study/telephone-notes');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <Link
          to="/post-study/adverse-event"
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
        title="Annexure – 4 Depression Scale"
        volunteerId={volunteerId || ''}
        studyNumber={studyNo || ''}
        caseId=""
      />

      <div className="space-y-6">
        <p className="text-sm border-b pb-2">
          Below is a list of ways that the volunteer might have felt or behaved recently. Please tick in the column that tells how often the volunteer has felt this way during the past week. Please tick (✓) in appropriate boxes.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 border text-left w-10">S. No.</th>
                <th className="px-2 py-2 border text-left">Title</th>
                <th className="px-2 py-2 border text-center">Score</th>
              </tr>
            </thead>
            <tbody>
              {formData.depressionItems.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-2 py-2 border align-top">{idx + 1}</td>
                  <td className="px-2 py-2 border align-top">
                    <div className="font-semibold">{item.title}</div>
                    {item.subtitle && <div className="italic text-xs mb-1">{item.subtitle}</div>}
                    <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-1">
                      {item.options.map((option, oidx) => (
                        <label key={oidx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`depression-${idx}`}
                            checked={item.selectedScore === option.score}
                            onChange={() => updateScore(idx, option.score)}
                            className="form-radio"
                          />
                          <span className="text-xs">{option.score}. {option.text}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-2 border align-top text-center font-bold">
                    {item.selectedScore !== null ? item.selectedScore : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <span className="font-medium">Total Score:</span>
          <span className="px-4 py-2 border rounded bg-gray-50">{formData.totalScore}</span>
          <span className="text-xs text-gray-500">
            (If total score of 0-7 is a normal range and above this range is positive depression)
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-medium">Depression Screen:</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={formData.depressionScreen === true}
                onChange={() => setFormData(prev => ({ ...prev, depressionScreen: true }))}
                className="form-radio"
              />
              <span>Positive</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={formData.depressionScreen === false}
                onChange={() => setFormData(prev => ({ ...prev, depressionScreen: false }))}
                className="form-radio"
              />
              <span>Negative</span>
            </label>
          </div>
        </div>

        <FormField
          label="Comments (If any)"
          type="textarea"
          value={formData.comments}
          onChange={updateComments}
        />

        <SignatureFields
          label="Evaluated By (Sign & Date) - (PI/CI/Physician)"
          value={formData.reviewedBy}
          onChange={updateReviewedBy}
        />

        <Navigation
          onBack={() => navigate('/post-study/adverse-event')}
          onContinue={handleContinue}
          backLabel="Previous"
          continueLabel="Next"
          timestampLabel="Entry Date & Time"
        />
      </div>
    </div>
  );
};

export default PostStudyDepressionScalePage;
