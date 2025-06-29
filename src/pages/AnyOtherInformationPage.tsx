
import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import  CommonFormHeader  from '@/components/CommonFormHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/FormField';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SignatureData {
  name: string;
  date: string;
  time: string;
}

interface AnyOtherInfoFormData {
  information: string;
  reviewedBy: SignatureData;
}

const initialFormData: AnyOtherInfoFormData = {
  information: '',
  reviewedBy: { name: '', date: '', time: '' }
};

const AnyOtherInformationPage: React.FC = () => {
  const { pid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const [formData, setFormData] = useState<AnyOtherInfoFormData>(initialFormData);

  const updateField = (field: keyof AnyOtherInfoFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateSignature = (field: keyof SignatureData, value: string) => {
    setFormData(prev => ({
      ...prev,
      reviewedBy: {
        ...prev.reviewedBy,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(`anyOtherInfo_${volunteerId}`, JSON.stringify(formData));
      console.log('Saved any other info data to localStorage');
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handlePrevious = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    if (volunteerId) params.set('volunteerId', volunteerId);
    if (studyNumber) params.set('studyNumber', studyNumber);
    navigate(`/employee/project/${pid}/study-period/check-out?${params.toString()}`);
  };

  const handleNext = () => {
    handleSave();
    const params = new URLSearchParams();
    if (caseId) params.set('case', caseId);
    if (volunteerId) params.set('volunteerId', volunteerId);
    if (studyNumber) params.set('studyNumber', studyNumber);
    navigate(`/employee/project/${pid}/post-study/safety-evaluation?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CommonFormHeader
        formTitle="Any Other Information"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
      />

      <Card className="clinical-card">
        <CardHeader>
          <CardTitle>ANY OTHER INFORMATION</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Information</label>
            <Textarea
              value={formData.information}
              onChange={(e) => updateField('information', e.target.value)}
              placeholder="Enter any additional information here..."
              rows={6}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Reviewed By (Coordinator/Designee)</h3>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="Name"
                value={formData.reviewedBy.name}
                onChange={(val) => updateSignature('name', val)}
              />
              <FormField
                label="Date"
                type="date"
                value={formData.reviewedBy.date}
                onChange={(val) => updateSignature('date', val)}
              />
              <FormField
                label="Time"
                type="time"
                value={formData.reviewedBy.time}
                onChange={(val) => updateSignature('time', val)}
              />
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="space-x-4">
              <Button variant="outline" onClick={handleSave}>
                Save
              </Button>
              <Button onClick={handleNext}>
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnyOtherInformationPage;
