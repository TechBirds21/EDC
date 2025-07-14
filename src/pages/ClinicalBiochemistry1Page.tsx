import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import CommonFormHeader from '@/components/CommonFormHeader';
import { LabReportHeader } from '@/components/LabReportHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/FormField';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PeriodNavigation } from '@/components/PeriodNavigation';
import { AuditConfirmationDialog } from '@/components/AuditConfirmationDialog';
import { AuditHistory } from '@/components/AuditHistory';
import { usePeriodForm } from '@/hooks/usePeriodForm';
import { useVolunteer } from '@/context/VolunteerContext';

interface BiochemistryTest {
  result: string;
  unit: string;
  referenceRange: string;
}

interface ClinicalBiochemistry1Form {
  tests: {
    glucose: BiochemistryTest;
    hba1c: BiochemistryTest;
    ldl: BiochemistryTest;
    hdl: BiochemistryTest;
    triglycerides: BiochemistryTest;
    calcium: BiochemistryTest;
    phosphorus: BiochemistryTest;
    magnesium: BiochemistryTest;
    iron: BiochemistryTest;
    tibc: BiochemistryTest;
    ferritin: BiochemistryTest;
    b12: BiochemistryTest;
    folate: BiochemistryTest;
  };
}

const initialFormData: ClinicalBiochemistry1Form = {
  tests: {
    glucose: { result: '', unit: 'mg/dL', referenceRange: '70 - 100' },
    hba1c: { result: '', unit: '%', referenceRange: '< 5.7' },
    ldl: { result: '', unit: 'mg/dL', referenceRange: '< 100' },
    hdl: { result: '', unit: 'mg/dL', referenceRange: '> 40 (M), > 50 (F)' },
    triglycerides: { result: '', unit: 'mg/dL', referenceRange: '< 150' },
    calcium: { result: '', unit: 'mg/dL', referenceRange: '8.4 - 10.2' },
    phosphorus: { result: '', unit: 'mg/dL', referenceRange: '2.5 - 4.5' },
    magnesium: { result: '', unit: 'mg/dL', referenceRange: '1.7 - 2.2' },
    iron: { result: '', unit: 'μg/dL', referenceRange: '60 - 170' },
    tibc: { result: '', unit: 'μg/dL', referenceRange: '250 - 400' },
    ferritin: { result: '', unit: 'ng/mL', referenceRange: '15 - 150 (F), 15 - 200 (M)' },
    b12: { result: '', unit: 'pg/mL', referenceRange: '200 - 900' },
    folate: { result: '', unit: 'ng/mL', referenceRange: '2.7 - 17.0' },
  }
};

const ClinicalBiochemistry1Page: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { volunteerData } = useVolunteer();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const period = parseInt(searchParams.get('period') || '1');

  // Use period-based form management
  const {
    formData,
    setFormData,
    currentPeriod,
    savePeriodData,
    switchPeriod,
    getSavedPeriods,
    hasPeriodData,
    isLoading,
    isSaved,
    isAuditDialogOpen,
    setIsAuditDialogOpen,
    handleAuditConfirmation,
    getAuditHistory,
    isFormSubmitted
  } = usePeriodForm({
    formType: 'clinical_biochemistry_1',
    initialData: initialFormData,
    period
  });

  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const formId = `clinical_biochemistry_1_period_${currentPeriod}_${volunteerData?.volunteerId}`;

  const [labHeaderData, setLabHeaderData] = useState({
    age: '',
    studyNo: volunteerData?.studyNumber || '',
    subjectId: '',
    sampleAndSid: '',
    sex: '',
    collectionCentre: '',
    sampleCollectionDate: '',
    registrationDate: '',
    reportDate: ''
  });

  // Update study number when volunteer data changes
  useEffect(() => {
    if (volunteerData?.studyNumber) {
      setLabHeaderData(prev => ({
        ...prev,
        studyNo: volunteerData.studyNumber
      }));
    }
  }, [volunteerData]);

  const updateLabHeader = (field: string, value: string) => {
    setLabHeaderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateTest = (testName: keyof ClinicalBiochemistry1Form['tests'], field: keyof BiochemistryTest, value: string) => {
    setFormData(prev => ({
      ...prev,
      tests: {
        ...prev.tests,
        [testName]: {
          ...prev.tests[testName],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      await savePeriodData({
        ...formData,
        labHeader: labHeaderData,
        period: currentPeriod
      });
      console.log(`Saved Clinical Biochemistry 1 data for period ${currentPeriod}`);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      await savePeriodData({
        ...formData,
        labHeader: labHeaderData,
        period: currentPeriod
      }, true); // true indicates this is a submit, not just a save
      console.log(`Submitted Clinical Biochemistry 1 data for period ${currentPeriod}`);
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  const handlePeriodChange = (newPeriod: number) => {
    switchPeriod(newPeriod);
    // Update URL to reflect the new period
    const params = new URLSearchParams(location.search);
    params.set('period', newPeriod.toString());
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handlePrevious = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    params.set('period', currentPeriod.toString());
    navigate(`/employee/project/${pid}/screening/hematology?${params.toString()}`);
  };

  const handleNext = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    params.set('period', currentPeriod.toString());
    navigate(`/employee/project/${pid}/screening/clinical-biochemistry-2?${params.toString()}`);
  };

  const displayNames: Record<string, string> = {
    glucose: 'Glucose (Fasting)',
    hba1c: 'HbA1c',
    ldl: 'LDL Cholesterol',
    hdl: 'HDL Cholesterol',
    triglycerides: 'Triglycerides',
    calcium: 'Calcium',
    phosphorus: 'Phosphorus',
    magnesium: 'Magnesium',
    iron: 'Iron',
    tibc: 'TIBC',
    ferritin: 'Ferritin',
    b12: 'Vitamin B12',
    folate: 'Folate',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CommonFormHeader
        formTitle="Clinical Biochemistry 1"
        volunteerId={volunteerData?.volunteerId}
        studyNumber={volunteerData?.studyNumber}
        caseId={caseId}
        readOnly={true}
      />

      <PeriodNavigation
        currentPeriod={currentPeriod}
        onPeriodChange={handlePeriodChange}
        savedPeriods={getSavedPeriods()}
        hasPeriodData={hasPeriodData}
      />

      <LabReportHeader
        volunteerId={volunteerData?.volunteerId || ''}
        formData={labHeaderData}
        onUpdateForm={updateLabHeader}
        disabled={false}
      />

      <Card className="clinical-card">
        <CardHeader>
          <CardTitle>CLINICAL BIOCHEMISTRY (Part 1)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left border-r">Parameter</th>
                  <th className="px-4 py-2 text-left border-r">Result</th>
                  <th className="px-4 py-2 text-left border-r">Unit</th>
                  <th className="px-4 py-2 text-left">Reference Range</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(formData.tests).map(([testName, test], index) => (
                  <tr key={testName} className="border-t">
                    <td className="px-4 py-2 border-r font-medium">
                      {displayNames[testName]}
                    </td>
                    <td className="px-4 py-2 border-r">
                      <FormField
                        label=""
                        value={test.result}
                        onChange={(val) => updateTest(testName as keyof ClinicalBiochemistry1Form['tests'], 'result', val)}
                        placeholder="Enter result"
                      />
                    </td>
                    <td className="px-4 py-2 border-r">
                      {test.unit}
                    </td>
                    <td className="px-4 py-2">
                      {test.referenceRange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="space-x-4">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
              </Button>
              {isFormSubmitted(formId) && (
                <Button 
                  variant="outline"
                  onClick={() => setShowAuditHistory(!showAuditHistory)}
                >
                  {showAuditHistory ? 'Hide' : 'View'} Audit Trail
                </Button>
              )}
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit
              </Button>
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail Section */}
      {showAuditHistory && (
        <AuditHistory auditRecord={getAuditHistory(formId)} />
      )}

      {/* Audit Confirmation Dialog */}
      <AuditConfirmationDialog
        isOpen={isAuditDialogOpen}
        onClose={() => setIsAuditDialogOpen(false)}
        onConfirm={handleAuditConfirmation}
        title="Confirm Form Edit"
        description="This form has been previously submitted. To make changes, please provide your password and a reason for the modification."
      />
    </div>
  );
};

export default ClinicalBiochemistry1Page;