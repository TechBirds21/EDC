import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVolunteer } from '../context/VolunteerContext';
import { useGlobalForm } from '../context/GlobalFormContext';
import  CommonFormHeader  from '../components/CommonFormHeader';
import { SignatureFields } from '../components/SignatureFields';
import { Navigation } from '../components/Navigation';
import type { SignatureData } from '../types/common';
import useStudyPeriodForm from '../hooks/useStudyPeriodForm';

interface MealEntry {
  mealType: string;
  date: string;
  scheduledTime: string;
  startTime: string;
  endTime: string;
  mealConsumed: boolean | null;
  supervisedBy: SignatureData;
  remarks: string;
}

const initialFormData = {
  subjectNumber: '',
  dosingDate: '',
  dosingTime: '',
  meals: [
    // Day 0
    { mealType: 'Check-in Dinner', date: '', scheduledTime: 'NA', startTime: '', endTime: '', mealConsumed: null, supervisedBy: { name: '', date: '', time: '' }, remarks: '' },
    // Day 1 (Dosing Day)
    { mealType: 'High fat high calorie meal', date: '', scheduledTime: '', startTime: '', endTime: '', mealConsumed: null, supervisedBy: { name: '', date: '', time: '' }, remarks: '' },
    { mealType: 'Lunch (4.0 hours Post-dose)', date: '', scheduledTime: '', startTime: '', endTime: '', mealConsumed: null, supervisedBy: { name: '', date: '', time: '' }, remarks: '' },
    { mealType: 'Snacks (8.0 hours Post-dose)', date: '', scheduledTime: '', startTime: '', endTime: '', mealConsumed: null, supervisedBy: { name: '', date: '', time: '' }, remarks: '' },
    { mealType: 'Dinner (12.0 hours Post-dose)', date: '', scheduledTime: '', startTime: '', endTime: '', mealConsumed: null, supervisedBy: { name: '', date: '', time: '' }, remarks: '' },
    // Day 2
    { mealType: 'Breakfast (24.0 hours Post-dose)', date: '', scheduledTime: '', startTime: '', endTime: '', mealConsumed: null, supervisedBy: { name: '', date: '', time: '' }, remarks: '' },
    { mealType: 'Lunch (28.0 hours Post-dose)', date: '', scheduledTime: '', startTime: '', endTime: '', mealConsumed: null, supervisedBy: { name: '', date: '', time: '' }, remarks: '' },
    { mealType: 'Snacks (32.0 hours Post-dose)', date: '', scheduledTime: '', startTime: '', endTime: '', mealConsumed: null, supervisedBy: { name: '', date: '', time: '' }, remarks: '' },
    { mealType: 'Dinner (36.0 hours Post-dose)', date: '', scheduledTime: '', startTime: '', endTime: '', mealConsumed: null, supervisedBy: { name: '', date: '', time: '' }, remarks: '' }
  ] as MealEntry[],
  leftoverDetails: '',
  comments: '',
  reviewedBy: { name: '', date: '', time: '' } as SignatureData
};

export default function MealConsumption() {
  const { volunteerId, savePatientRecord } = useVolunteer();
  const navigate = useNavigate();
  
  // Use our custom hook for form state management
  const {
    activePeriod,
    formData,
    updateField,
    handlePeriodChange,
    handleContinue,
    studyNo
  } = useStudyPeriodForm('mealConsumption', initialFormData);

  const updateMeal = (index: number, field: keyof MealEntry, value: any) => {
    updateField('meals', formData.meals.map((meal, i) => 
      i === index ? { ...meal, [field]: value } : meal
    ));
  };

  // Navigation handler with database integration
  const handleNavigate = async () => {
    // Save to localStorage
    await handleContinue(true); 
    
    // Try Python API first
    try {
      await pythonApi.createForm({
        template_id: 'Meal Consumption',
        volunteer_id: volunteerId || '',
        status: "submitted",
        data: formData,
      });
      console.log('Successfully submitted meal consumption data via Python API');
    } catch (apiError) {
      console.warn('Failed to submit via Python API:', apiError);
    }
    
    // Add to form data collector
    if (volunteerId) {
      formDataCollector.addFormData({
        templateId: 'Meal Consumption',
        templateName: 'Meal Consumption',
        volunteerId: volunteerId,
        studyNumber: studyNo || '',
        caseId: '',
        data: formData,
        status: 'submitted',
        lastModified: new Date()
      });
    }
    
    // Navigate to next page
    navigate('/study-period/vital-signs');
  };

  const renderMealRow = (meal: MealEntry, index: number, dayLabel?: string) => (
    <tr className="border-b">
      {dayLabel && <td className="border px-2 py-1\" rowSpan={1}>{dayLabel}</td>}
      {!dayLabel && <td className="border px-2 py-1"></td>}
      <td className="border px-2 py-1">{meal.mealType}</td>
      <td className="border px-2 py-1">
        <input
          type="date"
          value={meal.date}
          onChange={(e) => updateMeal(index, 'date', e.target.value)}
          className="w-full px-1 py-0.5 border rounded text-sm"
        />
      </td>
      <td className="border px-2 py-1">
        <input
          type="time"
          value={meal.scheduledTime}
          onChange={(e) => updateMeal(index, 'scheduledTime', e.target.value)}
          className="w-full px-1 py-0.5 border rounded text-sm"
          disabled={meal.scheduledTime === 'NA'}
        />
      </td>
      <td className="border px-2 py-1">
        <input
          type="time"
          value={meal.startTime}
          onChange={(e) => updateMeal(index, 'startTime', e.target.value)}
          className="w-full px-1 py-0.5 border rounded text-sm"
        />
      </td>
      <td className="border px-2 py-1">
        <input
          type="time"
          value={meal.endTime}
          onChange={(e) => updateMeal(index, 'endTime', e.target.value)}
          className="w-full px-1 py-0.5 border rounded text-sm"
        />
      </td>
      <td className="border px-2 py-1 text-center">
        <div className="flex justify-center gap-2">
          <label className="inline-flex items-center">
            <input
              type="radio"
              checked={meal.mealConsumed === true}
              onChange={() => updateMeal(index, 'mealConsumed', true)}
              className="form-radio h-3 w-3"
            />
            <span className="ml-1 text-sm">Yes</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              checked={meal.mealConsumed === false}
              onChange={() => updateMeal(index, 'mealConsumed', false)}
              className="form-radio h-3 w-3"
            />
            <span className="ml-1 text-sm">No</span>
          </label>
        </div>
      </td>
      <td className="border px-2 py-1">
        <SignatureFields
          value={meal.supervisedBy}
          onChange={(value) => updateMeal(index, 'supervisedBy', value)}
          vertical
          className="min-w-[120px]"
        />
      </td>
      <td className="border px-2 py-1">
        <input
          type="text"
          value={meal.remarks}
          onChange={(e) => updateMeal(index, 'remarks', e.target.value)}
          className="w-full px-1 py-0.5 border rounded text-sm"
        />
      </td>
    </tr>
  );

  return (
    <div className="max-w-[95%] mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <Link 
          to="/study-period/check-in" 
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
        common={{
          volunteerId: volunteerId || '',
          subjectNo: formData.subjectNumber,
          projectNo: studyNo || ''
        }}
        updateCommon={() => {}}
        periodNo={activePeriod}
        setPeriodNo={handlePeriodChange}
        formDate={formData.dosingDate}
        setFormDate={val => updateField('dosingDate', val)}
        title="STUDY CASE REPORT FORM"
        sopNumber=""
      />

      <div className="border-t-2 border-b-2 border-gray-400 py-2 mb-4">
        <div className="font-semibold">Section-II: MEAL CONSUMPTION FORM</div>
      </div>

      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border px-2 py-1 text-left">Day</th>
                <th className="border px-2 py-1 text-left">Meal Type & Schedule (Hrs)</th>
                <th className="border px-2 py-1 text-left">Date</th>
                <th className="border px-2 py-1 text-left">Scheduled Time (Hrs)</th>
                <th className="border px-2 py-1 text-left">Start Time (Hrs)</th>
                <th className="border px-2 py-1 text-left">End Time (Hrs)</th>
                <th className="border px-2 py-1 text-center">Meal consumed (Yes/No)</th>
                <th className="border px-2 py-1 text-left">Supervised By (Sign & Date)</th>
                <th className="border px-2 py-1 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {/* Day 0 */}
              <tr className="border-b bg-gray-50">
                <td className="border px-2 py-1">Day-0</td>
                <td className="border px-2 py-1 font-medium" colSpan={8}>Check-in</td>
              </tr>
              {renderMealRow(formData.meals[0], 0)}

              {/* Day 1 */}
              <tr className="border-b bg-gray-50">
                <td className="border px-2 py-1">Day-1<br/>(Dosing Day)</td>
                <td className="border px-2 py-1 font-medium" colSpan={8}>Dosing Day</td>
              </tr>
              {formData.meals.slice(1, 5).map((meal, idx) => renderMealRow(meal, idx + 1))}

              {/* Day 2 */}
              <tr className="border-b bg-gray-50">
                <td className="border px-2 py-1">Day-2</td>
                <td className="border px-2 py-1 font-medium" colSpan={8}>Post-dose Day</td>
              </tr>
              {formData.meals.slice(5).map((meal, idx) => renderMealRow(meal, idx + 5))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 text-sm">
          <p>Note: Standard meal shall be provided as per protocol.</p>
          <div className="flex items-center gap-2">
            <span>Details of leftover food items (if any):</span>
            <input
              type="text"
              value={formData.leftoverDetails}
              onChange={(e) => updateField('leftoverDetails', e.target.value)}
              className="flex-1 px-2 py-1 border rounded"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Comments (if any):</label>
            <textarea
              value={formData.comments}
              onChange={(e) => updateField('comments', e.target.value)}
              className="w-full p-2 border rounded"
              rows={2}
            />
          </div>

          <div>
            <SignatureFields
              label="Reviewed By (Coordinator/Designee):"
              value={formData.reviewedBy}
              onChange={(value) => updateField('reviewedBy', value)}
              vertical
            />
          </div>
        </div>

        <Navigation
          backUrl="/study-period/check-in"
          onContinue={handleNavigate}
          backLabel="Previous"
          continueLabel="Continue"
          timestampLabel="Entry Date & Time"
        />
      </div>
    </div>
  );
}
