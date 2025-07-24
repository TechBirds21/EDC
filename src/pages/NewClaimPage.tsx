
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Hash, Plus, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormFlow } from '@/context/FormFlowContext';
import { toast } from 'sonner';

// Define the standard form sequence for clinical data collection
const CLINICAL_FORM_SEQUENCE = [
  'demographics',
  'medical_history', 
  'vital_signs',
  'lab_results',
  'adverse_events',
  'concomitant_medication',
  'final_assessment'
];

const NewClaimPage: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const navigate = useNavigate();
  const { initializeSession, loading, error } = useFormFlow();
  const [volunteerId, setVolunteerId] = useState('');
  const [studyNumber, setStudyNumber] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const handleCreateClaim = async () => {
    if (!volunteerId.trim() || !studyNumber.trim()) {
      toast.error('Please fill in both Volunteer ID and Study Number');
      return;
    }

    setLocalLoading(true);
    try {
      // Generate a unique case ID
      const caseId = `case-${Date.now()}`;
      
      // Initialize the form session with the clinical form sequence
      await initializeSession(
        caseId, 
        volunteerId.trim(), 
        studyNumber.trim(), 
        CLINICAL_FORM_SEQUENCE
      );

      toast.success('Claim created successfully!');

      // Navigate to the first form in the sequence (demographics)
      const searchParams = new URLSearchParams();
      searchParams.set('case', caseId);
      searchParams.set('volunteerId', volunteerId.trim());
      searchParams.set('studyNumber', studyNumber.trim());

      navigate(`/employee/project/${pid}/dashboard/screening/demographics?${searchParams.toString()}`);
    } catch (error) {
      console.error('Failed to create claim:', error);
      toast.error('Failed to create claim. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/employee/projects`);
  };

  const isLoading = loading || localLoading;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Navigation */}
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          disabled={isLoading}
          className="mb-4 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-6 h-6 text-blue-600" />
              <span>Create New Claim</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertDescription>
                Enter the Volunteer ID and Study Number to begin data collection. 
                This will initialize a complete clinical data collection session with {CLINICAL_FORM_SEQUENCE.length} forms.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="volunteer-id" className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Volunteer ID</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="volunteer-id"
                  value={volunteerId}
                  onChange={(e) => setVolunteerId(e.target.value)}
                  placeholder="Enter Volunteer ID (e.g., VOL-001)"
                  className="border-blue-300 focus:border-blue-500"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="study-number" className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-green-600" />
                  <span>Study Number</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="study-number"
                  value={studyNumber}
                  onChange={(e) => setStudyNumber(e.target.value)}
                  placeholder="Enter Study Number (e.g., STD-2024-001)"
                  className="border-blue-300 focus:border-blue-500"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Form Sequence Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm text-gray-700 mb-2">
                Clinical Data Collection Sequence ({CLINICAL_FORM_SEQUENCE.length} forms):
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                {CLINICAL_FORM_SEQUENCE.map((form, index) => (
                  <div key={form} className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="capitalize">{form.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={handleGoBack}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateClaim}
                disabled={isLoading || !volunteerId.trim() || !studyNumber.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Creating...' : 'Create Claim & Start Data Collection'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewClaimPage;
