import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { PrintableForm } from '@/components/PrintableForm';
import { Button } from '@/components/ui/button';
import { BhcgTestForm } from '@/components/forms/BhcgTestForm';
import { useBhcgTest } from '@/hooks/useBhcgTest';
import { toast } from 'sonner';
import { ChevronLeft, Printer } from 'lucide-react';

const BhcgTestPage: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const {
    formData,
    loading,
    isSaved,
    updateHeaderForm,
    updateBhcgTest,
    updateEvaluatedBy,
    handleSave
  } = useBhcgTest(caseId, volunteerId, studyNumber);

  const handlePrint = () => {
    window.print();
  };

  const handlePrevious = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    if (volunteerId) params.set('volunteerId', volunteerId);
    if (studyNumber) params.set('studyNumber', studyNumber);
    
    navigate(`/employee/project/${pid}/screening/pregnancy-test?${params.toString()}`);
  };

  const handleContinue = () => {
    if (!isSaved) {
      toast.error('Please save the form before continuing');
      return;
    }

    // Navigate to next form or completion page
    toast.success('β-HCG Test completed successfully');
  };

  return (
    <PrintableForm templateName="β-HCG Test Report">
      <CommonFormHeader
        title="β-HCG Test Report"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
      />

      <BhcgTestForm
        headerData={formData.headerData}
        bhcgTest={formData.bhcgTest}
        evaluatedBy={formData.evaluatedBy}
        onHeaderChange={updateHeaderForm}
        onBhcgChange={updateBhcgTest}
        onEvaluatedByChange={updateEvaluatedBy}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 no-print">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </Button>
          
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className={`${isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
          </Button>
          
          <Button
            type="button"
            onClick={handleContinue}
            disabled={!isSaved}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            Continue
          </Button>
        </div>
      </div>
    </PrintableForm>
  );
};

export default BhcgTestPage;