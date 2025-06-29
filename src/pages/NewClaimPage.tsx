
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Hash, Plus, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { db } from '@/lib/dexie';

const NewClaimPage: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const navigate = useNavigate();
  const [volunteerId, setVolunteerId] = useState('');
  const [studyNumber, setStudyNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateClaim = async () => {
    if (!volunteerId.trim() || !studyNumber.trim()) {
      alert('Please fill in both Volunteer ID and Study Number');
      return;
    }

    setLoading(true);
    try {
      // Generate a unique case ID
      const caseId = `case-${Date.now()}`;
      
      // Create initial entry in IndexedDB
      await db.pending_forms.add({
        template_id: 'new-claim',
        patient_id: caseId,
        volunteer_id: volunteerId.trim(),
        study_number: studyNumber.trim(),
        answers: {},
        created_at: new Date(),
        last_modified: new Date()
      });

      // Navigate to the demographics form with all required parameters
      const searchParams = new URLSearchParams();
      searchParams.set('case', caseId);
      searchParams.set('volunteerId', volunteerId.trim());
      searchParams.set('studyNumber', studyNumber.trim());

      navigate(`/employee/project/${pid}/dashboard/screening/demographics?${searchParams.toString()}`);
    } catch (error) {
      console.error('Failed to create claim:', error);
      alert('Failed to create claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/employee/projects`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Navigation */}
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
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
            <Alert>
              <AlertDescription>
                Enter the Volunteer ID and Study Number to begin data collection. 
                These values will be used throughout all forms in this case.
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
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={handleGoBack}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateClaim}
                disabled={loading || !volunteerId.trim() || !studyNumber.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Creating...' : 'Create Claim & Start Demographics'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewClaimPage;
