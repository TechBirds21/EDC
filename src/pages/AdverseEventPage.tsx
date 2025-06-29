import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVolunteer } from '../context/VolunteerContext';
import { useGlobalForm } from '../context/GlobalFormContext';
import { FormField } from '../components/FormField';
import { SignatureFields } from '../components/SignatureFields';
import type { SignatureData } from '../types/common';

interface VitalSigns {
  pulseRate: string;
  bloodPressure: string;
  temperature: string;
}

interface FollowUpRecord {
  date: string;
  time: string;
  complaints: string;
  vitals: VitalSigns;
  treatment: string;
  withdrawnFromStudy: 'Yes' | 'No' | 'NA' | null;
  remarks: string;
  signAndDate: string;
}

interface TreatmentAdvised {
  date: string;
  drugName: string;
  indication: string;
  routeOfAdmin: string;
  frequency: string;
}

export const AdverseEventRecording = () => {
  const { volunteerId } = useVolunteer();
  const { studyNo } = useGlobalForm();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sopNumber: 'CL-020',
    projectStudyNo: studyNo || '',
    date: '',
    subjectNo: '',
    periodNo: '',
    eventType: {
      inHouse: false,
      washoutPeriod: false,
      onDayOfCheckin: false,
      postStudyLabReports: false
    },
    others: '',
    adverseEventAttended: {
      date: '',
      time: ''
    },
    onsetOfEvent: {
      date: '',
      time: '',
      preDose: false,
      postDose: false
    },
    lastDoseReceived: {
      date: '',
      time: ''
    },
    lastTreatmentCode: '',
    complaintsOfSubject: '',
    relevantHistory: '',
    generalExamination: '',
    systemicExamination: '',
    vitals: {
      pulseRate: '',
      bloodPressure: '',
      bodyTemperature: '',
      respiratoryRate: ''
    },
    adverseEventTerm: '',
    investigationAdvised: '',
    actionTaken: {
      underObservation: false,
      referralForExpertOpinion: false,
      shiftToHospital: false
    },
    treatmentGiven: {
      reassurance: false,
      medicine: false,
      underFollowUp: false,
      notApplicable: false,
      others: ''
    },
    intensityOfEvent: {
      mild: false,
      moderate: false,
      severe: false
    },
    relationshipWithStudyDrug: {
      certain: false,
      probable: false,
      possible: false,
      unlikely: false,
      conditionalUnclassified: false,
      unassessableUnclassifiable: false
    },
    treatmentAdvised: [] as TreatmentAdvised[],
    subjectWithdrawn: null as boolean | null,
    discussedWithPI: null as boolean | null,
    postStudyAdverseEvent: null as boolean | null,
    postStudyRepeatInvestigation: '',
    comments: '',
    physicianSignature: {
      name: '',
      date: '',
      time: ''
    } as SignatureData,
    verifiedBy: {
      name: '',
      date: '',
      time: ''
    } as SignatureData,
    followUpRecords: [] as FollowUpRecord[],
    withdrawalDiscussedWithPI: null as boolean | null,
    isSeriousAdverseEvent: null as boolean | null,
    saeFormNo: '',
    followUpInvestigationAdvised: '',
    investigationInterpretation: '',
    outcome: {
      ongoing: null as boolean | null,
      resolved: null as boolean | null,
      lostToFollowUp: null as boolean | null,
      resolvedDate: '',
      resolvedTime: '',
      lostToFollowUpDate: ''
    },
    followUpComments: '',
    evaluatedBy: {
      name: '',
      date: '',
      time: ''
    } as SignatureData,
    verifiedByPhysician: {
      name: '',
      date: '',
      time: ''
    } as SignatureData
  });

  const addTreatmentAdvised = () => {
    setFormData(prev => ({
      ...prev,
      treatmentAdvised: [
        ...prev.treatmentAdvised,
        {
          date: '',
          drugName: '',
          indication: '',
          routeOfAdmin: '',
          frequency: ''
        }
      ]
    }));
  };

  const updateTreatmentAdvised = (index: number, field: keyof TreatmentAdvised, value: string) => {
    setFormData(prev => ({
      ...prev,
      treatmentAdvised: prev.treatmentAdvised.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addFollowUpRecord = () => {
    setFormData(prev => ({
      ...prev,
      followUpRecords: [
        ...prev.followUpRecords,
        {
          date: '',
          time: '',
          complaints: '',
          vitals: {
            pulseRate: '',
            bloodPressure: '',
            temperature: ''
          },
          treatment: '',
          withdrawnFromStudy: null,
          remarks: '',
          signAndDate: ''
        }
      ]
    }));
  };

  const updateFollowUpRecord = (index: number, field: keyof FollowUpRecord, value: any) => {
    setFormData(prev => ({
      ...prev,
      followUpRecords: prev.followUpRecords.map((record, i) =>
        i === index ? { ...record, [field]: value } : record
      )
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(`adverseEventRecording_${volunteerId || 'unknown'}`, JSON.stringify(formData));
      
      // Try Python API first
      try {
        pythonApi.createForm({
          template_id: 'Adverse Event Recording',
          volunteer_id: volunteerId || '',
          status: "submitted",
          data: formData,
        }).then(() => {
          console.log('Successfully submitted adverse event data via Python API');
        }).catch(err => {
          console.warn('Failed to submit via Python API:', err);
        });
      } catch (apiError) {
        console.warn('Python API submission failed:', apiError);
      }
      
      // Add to form data collector
      if (volunteerId) {
        formDataCollector.addFormData({
          templateId: 'Adverse Event Recording',
          templateName: 'Adverse Event Recording',
          volunteerId: volunteerId,
          studyNumber: studyNo || '',
          caseId: '',
          data: formData,
          status: 'submitted',
          lastModified: new Date()
        });
      }
      
      navigate('/post-study/concomitant-meds');
    } catch (err) {
      console.error('Error saving to localStorage:', err);
      alert('Error saving data. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b pb-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Clians</h1>
            <div className="mt-2">
              <span className="text-sm font-medium">SOP NUMBER: </span>
              <span className="text-sm">{formData.sopNumber}</span>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">ADVERSE EVENT RECORDING FORM</h2>
            <p className="text-sm text-gray-600">Page 1 of 3</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Project No./ Study No.:"
            value={formData.projectStudyNo}
            onChange={(value) => setFormData(prev => ({ ...prev, projectStudyNo: value }))}
          />
          <FormField
            label="Date:"
            type="date"
            value={formData.date}
            onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Subject No.:"
            value={formData.subjectNo}
            onChange={(value) => setFormData(prev => ({ ...prev, subjectNo: value }))}
          />
          <FormField
            label="Period No.:"
            value={formData.periodNo}
            onChange={(value) => setFormData(prev => ({ ...prev, periodNo: value }))}
          />
        </div>

        {/* Event Type Checkboxes */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.eventType.inHouse}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  eventType: { ...prev.eventType, inHouse: e.target.checked }
                }))}
                className="form-checkbox h-4 w-4"
              />
              <span className="ml-2">In House</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.eventType.washoutPeriod}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  eventType: { ...prev.eventType, washoutPeriod: e.target.checked }
                }))}
                className="form-checkbox h-4 w-4"
              />
              <span className="ml-2">Washout Period</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.eventType.onDayOfCheckin}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  eventType: { ...prev.eventType, onDayOfCheckin: e.target.checked }
                }))}
                className="form-checkbox h-4 w-4"
              />
              <span className="ml-2">On the Day of Check-in</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.eventType.postStudyLabReports}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  eventType: { ...prev.eventType, postStudyLabReports: e.target.checked }
                }))}
                className="form-checkbox h-4 w-4"
              />
              <span className="ml-2">Post Study Lab Reports</span>
            </label>
          </div>
          <FormField
            label="Others:"
            value={formData.others}
            onChange={(value) => setFormData(prev => ({ ...prev, others: value }))}
          />
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Adverse Event Attended</h3>
            <div className="space-y-2">
              <FormField
                label="Date:"
                type="date"
                value={formData.adverseEventAttended.date}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  adverseEventAttended: { ...prev.adverseEventAttended, date: value }
                }))}
              />
              <FormField
                label="Time:"
                type="time"
                value={formData.adverseEventAttended.time}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  adverseEventAttended: { ...prev.adverseEventAttended, time: value }
                }))}
              />
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Onset of the event:</h3>
            <div className="space-y-2">
              <FormField
                label="Date:"
                type="date"
                value={formData.onsetOfEvent.date}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  onsetOfEvent: { ...prev.onsetOfEvent, date: value }
                }))}
              />
              <FormField
                label="Time:"
                type="time"
                value={formData.onsetOfEvent.time}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  onsetOfEvent: { ...prev.onsetOfEvent, time: value }
                }))}
              />
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.onsetOfEvent.preDose}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      onsetOfEvent: { ...prev.onsetOfEvent, preDose: e.target.checked }
                    }))}
                    className="form-checkbox h-4 w-4"
                  />
                  <span className="ml-2">Pre-dose</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.onsetOfEvent.postDose}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      onsetOfEvent: { ...prev.onsetOfEvent, postDose: e.target.checked }
                    }))}
                    className="form-checkbox h-4 w-4"
                  />
                  <span className="ml-2">Post-dose</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Last Dose Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Last Dose Received</h3>
            <div className="space-y-2">
              <FormField
                label="Date:"
                type="date"
                value={formData.lastDoseReceived.date}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  lastDoseReceived: { ...prev.lastDoseReceived, date: value }
                }))}
              />
              <FormField
                label="Time:"
                type="time"
                value={formData.lastDoseReceived.time}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  lastDoseReceived: { ...prev.lastDoseReceived, time: value }
                }))}
              />
            </div>
          </div>
          <FormField
            label="Last Treatment Code:"
            value={formData.lastTreatmentCode}
            onChange={(value) => setFormData(prev => ({ ...prev, lastTreatmentCode: value }))}
          />
        </div>

        {/* Medical Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Complaints of the subject:</label>
            <textarea
              value={formData.complaintsOfSubject}
              onChange={(e) => setFormData(prev => ({ ...prev, complaintsOfSubject: e.target.value }))}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Relevant history:</label>
            <textarea
              value={formData.relevantHistory}
              onChange={(e) => setFormData(prev => ({ ...prev, relevantHistory: e.target.value }))}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">General examination:</label>
            <textarea
              value={formData.generalExamination}
              onChange={(e) => setFormData(prev => ({ ...prev, generalExamination: e.target.value }))}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Systemic examination:</label>
            <textarea
              value={formData.systemicExamination}
              onChange={(e) => setFormData(prev => ({ ...prev, systemicExamination: e.target.value }))}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
        </div>

        {/* Vitals */}
        <div>
          <h3 className="font-medium mb-2">Vitals:</h3>
          <div className="grid grid-cols-4 gap-4">
            <FormField
              label="Pulse Rate/min"
              value={formData.vitals.pulseRate}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                vitals: { ...prev.vitals, pulseRate: value }
              }))}
            />
            <FormField
              label="Blood Pressure (mm/Hg)"
              value={formData.vitals.bloodPressure}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                vitals: { ...prev.vitals, bloodPressure: value }
              }))}
            />
            <FormField
              label="Body Temperature (°F)"
              value={formData.vitals.bodyTemperature}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                vitals: { ...prev.vitals, bodyTemperature: value }
              }))}
            />
            <FormField
              label="Respiratory Rate/min"
              value={formData.vitals.respiratoryRate}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                vitals: { ...prev.vitals, respiratoryRate: value }
              }))}
            />
          </div>
        </div>

        <div className="text-sm text-gray-500">
          NAD: No abnormality detected, CVS: cardiovascular system, CNS: Central nervous system, RS: Respiratory System, P/A: Per Abdomen.
        </div>

        {/* Additional Details */}
        <FormField
          label="Adverse Event Term:"
          value={formData.adverseEventTerm}
          onChange={(value) => setFormData(prev => ({ ...prev, adverseEventTerm: value }))}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Investigation advised:</label>
          <textarea
            value={formData.investigationAdvised}
            onChange={(e) => setFormData(prev => ({ ...prev, investigationAdvised: e.target.value }))}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        {/* Action Taken */}
        <div>
          <h3 className="font-medium mb-2">Action taken:</h3>
          <div className="space-y-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.actionTaken.underObservation}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  actionTaken: { ...prev.actionTaken, underObservation: e.target.checked }
                }))}
                className="form-checkbox h-4 w-4"
              />
              <span className="ml-2">Under observation</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.actionTaken.referralForExpertOpinion}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  actionTaken: { ...prev.actionTaken, referralForExpertOpinion: e.target.checked }
                }))}
                className="form-checkbox h-4 w-4"
              />
              <span className="ml-2">Referral for expert opinion/consultation</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.actionTaken.shiftToHospital}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  actionTaken: { ...prev.actionTaken, shiftToHospital: e.target.checked }
                }))}
                className="form-checkbox h-4 w-4"
              />
              <span className="ml-2">Shift to hospital</span>
            </label>
          </div>
        </div>

        {/* Treatment Given */}
        <div>
          <h3 className="font-medium mb-2">Treatment given:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.treatmentGiven.reassurance}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    treatmentGiven: { ...prev.treatmentGiven, reassurance: e.target.checked }
                  }))}
                  className="form-checkbox h-4 w-4"
                />
                <span className="ml-2">Reassurance</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.treatmentGiven.medicine}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    treatmentGiven: { ...prev.treatmentGiven, medicine: e.target.checked }
                  }))}
                  className="form-checkbox h-4 w-4"
                />
                <span className="ml-2">Medicine</span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.treatmentGiven.underFollowUp}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    treatmentGiven: { ...prev.treatmentGiven, underFollowUp: e.target.checked }
                  }))}
                  className="form-checkbox h-4 w-4"
                />
                <span className="ml-2">Under follow up</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.treatmentGiven.notApplicable}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    treatmentGiven: { ...prev.treatmentGiven, notApplicable: e.target.checked }
                  }))}
                  className="form-checkbox h-4 w-4"
                />
                <span className="ml-2">Not applicable</span>
              </label>
            </div>
          </div>
          <FormField
            label="Others:"
            value={formData.treatmentGiven.others}
            onChange={(value) => setFormData(prev => ({
              ...prev,
              treatmentGiven: { ...prev.treatmentGiven, others: value }
            }))}
          />
        </div>

        {/* Intensity of Adverse Event */}
        <div>
          <h3 className="font-medium mb-2">Intensity of Adverse event:</h3>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.intensityOfEvent.mild}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  intensityOfEvent: { mild: true, moderate: false, severe: false }
                }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">Mild</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.intensityOfEvent.moderate}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  intensityOfEvent: { mild: false, moderate: true, severe: false }
                }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">Moderate</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.intensityOfEvent.severe}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  intensityOfEvent: { mild: false, moderate: false, severe: true }
                }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">Severe</span>
            </label>
          </div>
        </div>

        {/* Relationship with Study Drug */}
        <div>
          <h3 className="font-medium mb-2">Relationship with Study Drug (Tick the appropriate):</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.relationshipWithStudyDrug.certain}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  relationshipWithStudyDrug: {
                    certain: true,
                    probable: false,
                    possible: false,
                    unlikely: false,
                    conditionalUnclassified: false,
                    unassessableUnclassifiable: false
                  }
                }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">Certain</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.relationshipWithStudyDrug.probable}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  relationshipWithStudyDrug: {
                    certain: false,
                    probable: true,
                    possible: false,
                    unlikely: false,
                    conditionalUnclassified: false,
                    unassessableUnclassifiable: false
                  }
                }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">Probable/Likely</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.relationshipWithStudyDrug.possible}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  relationshipWithStudyDrug: {
                    certain: false,
                    probable: false,
                    possible: true,
                    unlikely: false,
                    conditionalUnclassified: false,
                    unassessableUnclassifiable: false
                  }
                }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">Possible</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.relationshipWithStudyDrug.unlikely}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  relationshipWithStudyDrug: {
                    certain: false,
                    probable: false,
                    possible: false,
                    unlikely: true,
                    conditionalUnclassified: false,
                    unassessableUnclassifiable: false
                  }
                }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">Unlikely</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.relationshipWithStudyDrug.conditionalUnclassified}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  relationshipWithStudyDrug: {
                    certain: false,
                    probable: false,
                    possible: false,
                    unlikely: false,
                    conditionalUnclassified: true,
                    unassessableUnclassifiable: false
                  }
                }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">Conditional/Unclassified</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.relationshipWithStudyDrug.unassessableUnclassifiable}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  relationshipWithStudyDrug: {
                    certain: false,
                    probable: false,
                    possible: false,
                    unlikely: false,
                    conditionalUnclassified: false,
                    unassessableUnclassifiable: true
                  }
                }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">Unassessable/Unclassifiable</span>
            </label>
          </div>
        </div>

        {/* Treatment Advised */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Treatment advised:</h3>
            <button
              type="button"
              onClick={addTreatmentAdvised}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Treatment
            </button>
          </div>
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left border-r">Date</th>
                <th className="px-4 py-2 text-left border-r">Name of the Drug Generic/Brand</th>
                <th className="px-4 py-2 text-left border-r">Indication</th>
                <th className="px-4 py-2 text-left border-r">Route of administration</th>
                <th className="px-4 py-2 text-left">Frequency</th>
              </tr>
            </thead>
            <tbody>
              {formData.treatmentAdvised.map((treatment, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2 border-r">
                    <input
                      type="date"
                      value={treatment.date}
                      onChange={(e) => updateTreatmentAdvised(index, 'date', e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="px-4 py-2 border-r">
                    <input
                      type="text"
                      value={treatment.drugName}
                      onChange={(e) => updateTreatmentAdvised(index, 'drugName', e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="px-4 py-2 border-r">
                    <input
                      type="text"
                      value={treatment.indication}
                      onChange={(e) => updateTreatmentAdvised(index, 'indication', e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="px-4 py-2 border-r">
                    <input
                      type="text"
                      value={treatment.routeOfAdmin}
                      onChange={(e) => updateTreatmentAdvised(index, 'routeOfAdmin', e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={treatment.frequency}
                      onChange={(e) => updateTreatmentAdvised(index, 'frequency', e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subject Withdrawn */}
        <div>
          <h3 className="font-medium mb-2">Subject withdrawn from the study:</h3>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.subjectWithdrawn === true}
                onChange={() => setFormData(prev => ({ ...prev, subjectWithdrawn: true }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.subjectWithdrawn === false}
                onChange={() => setFormData(prev => ({ ...prev, subjectWithdrawn: false }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>

        {/* Discussed with PI */}
        <div>
          <h3 className="font-medium mb-2">Discussed with PI:</h3>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.discussedWithPI === true}
                onChange={() => setFormData(prev => ({ ...prev, discussedWithPI: true }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.discussedWithPI === false}
                onChange={() => setFormData(prev => ({ ...prev, discussedWithPI: false }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Comments:</label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-4">
          <SignatureFields
            label="Physician"
            value={formData.physicianSignature}
            onChange={(value) => setFormData(prev => ({ ...prev, physicianSignature: value }))}
          />
          <SignatureFields
            label="Verified by"
            value={formData.verifiedBy}
            onChange={(value) => setFormData(prev => ({ ...prev, verifiedBy: value }))}
          />
        </div>

        {/* Follow Up Records */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Follow up records:</h3>
            <button
              type="button"
              onClick={addFollowUpRecord}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Follow Up Record
            </button>
          </div>
          {formData.followUpRecords.map((record, index) => (
            <div key={index} className="border p-4 rounded mb-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Date"
                  type="date"
                  value={record.date}
                  onChange={(value) => updateFollowUpRecord(index, 'date', value)}
                />
                <FormField
                  label="Time"
                  type="time"
                  value={record.time}
                  onChange={(value) => updateFollowUpRecord(index, 'time', value)}
                />
              </div>
              <div className="space-y-2 mt-2">
                <label className="block text-sm font-medium text-gray-700">Complaints:</label>
                <textarea
                  value={record.complaints}
                  onChange={(e) => updateFollowUpRecord(index, 'complaints', e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <FormField
                  label="Pulse Rate"
                  value={record.vitals.pulseRate}
                  onChange={(value) => updateFollowUpRecord(index, 'vitals', {
                    ...record.vitals,
                    pulseRate: value
                  })}
                />
                <FormField
                  label="Blood Pressure"
                  value={record.vitals.bloodPressure}
                  onChange={(value) => updateFollowUpRecord(index, 'vitals', {
                    ...record.vitals,
                    bloodPressure: value
                  })}
                />
                <FormField
                  label="Temperature"
                  value={record.vitals.temperature}
                  onChange={(value) => updateFollowUpRecord(index, 'vitals', {
                    ...record.vitals,
                    temperature: value
                  })}
                />
              </div>
              <div className="space-y-2 mt-2">
                <label className="block text-sm font-medium text-gray-700">Treatment:</label>
                <textarea
                  value={record.treatment}
                  onChange={(e) => updateFollowUpRecord(index, 'treatment', e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={2}
                />
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawn from study:</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={record.withdrawnFromStudy === 'Yes'}
                      onChange={() => updateFollowUpRecord(index, 'withdrawnFromStudy', 'Yes')}
                      className="form-radio h-4 w-4"
                    />
                    <span className="ml-2">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={record.withdrawnFromStudy === 'No'}
                      onChange={() => updateFollowUpRecord(index, 'withdrawnFromStudy', 'No')}
                      className="form-radio h-4 w-4"
                    />
                    <span className="ml-2">No</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={record.withdrawnFromStudy === 'NA'}
                      onChange={() => updateFollowUpRecord(index, 'withdrawnFromStudy', 'NA')}
                      className="form-radio h-4 w-4"
                    />
                    <span className="ml-2">NA</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                <label className="block text-sm font-medium text-gray-700">Remarks:</label>
                <textarea
                  value={record.remarks}
                  onChange={(e) => updateFollowUpRecord(index, 'remarks', e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={2}
                />
              </div>
              <FormField
                label="Sign and Date"
                value={record.signAndDate}
                onChange={(value) => updateFollowUpRecord(index, 'signAndDate', value)}
              />
            </div>
          ))}
        </div>

        {/* Post Study Adverse Event */}
        <div>
          <h3 className="font-medium mb-2">Post study adverse event:</h3>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.postStudyAdverseEvent === true}
                onChange={() => setFormData(prev => ({ ...prev, postStudyAdverseEvent: true }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.postStudyAdverseEvent === false}
                onChange={() => setFormData(prev => ({ ...prev, postStudyAdverseEvent: false }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>

        {/* Post Study Repeat Investigation */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Post study repeat investigation:</label>
          <textarea
            value={formData.postStudyRepeatInvestigation}
            onChange={(e) => setFormData(prev => ({ ...prev, postStudyRepeatInvestigation: e.target.value }))}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        {/* Serious Adverse Event */}
        <div>
          <h3 className="font-medium mb-2">Is it a serious adverse event?</h3>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.isSeriousAdverseEvent === true}
                onChange={() => setFormData(prev => ({ ...prev, isSeriousAdverseEvent: true }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.isSeriousAdverseEvent === false}
                onChange={() => setFormData(prev => ({ ...prev, isSeriousAdverseEvent: false }))}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>

        {formData.isSeriousAdverseEvent && (
          <FormField
            label="SAE Form No.:"
            value={formData.saeFormNo}
            onChange={(value) => setFormData(prev => ({ ...prev, saeFormNo: value }))}
          />
        )}

        {/* Follow Up Investigation */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Follow up investigation advised:</label>
          <textarea
            value={formData.followUpInvestigationAdvised}
            onChange={(e) => setFormData(prev => ({ ...prev, followUpInvestigationAdvised: e.target.value }))}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Investigation interpretation:</label>
          <textarea
            value={formData.investigationInterpretation}
            onChange={(e) => setFormData(prev => ({ ...prev, investigationInterpretation: e.target.value }))}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        {/* Outcome */}
        <div>
          <h3 className="font-medium mb-2">Outcome:</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.outcome.ongoing === true}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    outcome: {
                      ...prev.outcome,
                      ongoing: true,
                      resolved: false,
                      lostToFollowUp: false
                    }
                  }))}
                  className="form-radio h-4 w-4"
                />
                <span className="ml-2">Ongoing</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.outcome.resolved === true}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    outcome: {
                      ...prev.outcome,
                      ongoing: false,
                      resolved: true,
                      lostToFollowUp: false
                    }
                  }))}
                  className="form-radio h-4 w-4"
                />
                <span className="ml-2">Resolved</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.outcome.lostToFollowUp === true}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    outcome: {
                      ...prev.outcome,
                      ongoing: false,
                      resolved: false,
                      lostToFollowUp: true
                    }
                  }))}
                  className="form-radio h-4 w-4"
                />
                <span className="ml-2">Lost to follow up</span>
              </label>
            </div>

            {formData.outcome.resolved && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Date:"
                  type="date"
                  value={formData.outcome.resolvedDate}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    outcome: { ...prev.outcome, resolvedDate: value }
                  }))}
                />
                <FormField
                  label="Time:"
                  type="time"
                  value={formData.outcome.resolvedTime}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    outcome: { ...prev.outcome, resolvedTime: value }
                  }))}
                />
              </div>
            )}

            {formData.outcome.lostToFollowUp && (
              <FormField
                label="Date:"
                type="date"
                value={formData.outcome.lostToFollowUpDate}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  outcome: { ...prev.outcome, lostToFollowUpDate: value }
                }))}
              />
            )}
          </div>
        </div>

        {/* Follow Up Comments */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Follow up comments:</label>
          <textarea
            value={formData.followUpComments}
            onChange={(e) => setFormData(prev => ({ ...prev, followUpComments: e.target.value }))}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        {/* Final Signatures */}
        <div className="grid grid-cols-2 gap-4">
          <SignatureFields
            label="Evaluated by"
            value={formData.evaluatedBy}
            onChange={(value) => setFormData(prev => ({ ...prev, evaluatedBy: value }))}
          />
          <SignatureFields
            label="Verified by (Physician)"
            value={formData.verifiedByPhysician}
            onChange={(value) => setFormData(prev => ({ ...prev, verifiedByPhysician: value }))}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Adverse Event Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdverseEventRecording;