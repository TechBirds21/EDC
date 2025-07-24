import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Play, ArrowRight, CheckCircle, Database, Upload } from 'lucide-react';
import { useFormFlow } from '@/context/FormFlowContext';
import { toast } from 'sonner';

const FormFlowDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const { initializeSession, currentSession, loading } = useFormFlow();

  const handleStartDemo = async () => {
    try {
      // Initialize a demo session
      const demoFormSequence = [
        'demographics',
        'medical_history',
        'vital_signs',
        'lab_results',
        'final_assessment'
      ];

      const demoCaseId = `demo-${Date.now()}`;
      await initializeSession(
        demoCaseId,
        'DEMO-VOL-001',
        'DEMO-STUDY-2024',
        demoFormSequence
      );

      toast.success('Demo session initialized!');
      
      // Navigate to the demographics form
      const searchParams = new URLSearchParams();
      searchParams.set('case', demoCaseId);
      searchParams.set('volunteerId', 'DEMO-VOL-001');
      searchParams.set('studyNumber', 'DEMO-STUDY-2024');

      navigate(`/demo/demographics?${searchParams.toString()}`);
    } catch (error) {
      console.error('Failed to start demo:', error);
      toast.error('Failed to initialize demo session');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="w-6 h-6 text-blue-600" />
              <span>Enhanced Form Flow Demo</span>
            </CardTitle>
            <p className="text-gray-600">
              Experience the new progressive form saving, navigation, and bulk submission features
            </p>
          </CardHeader>
        </Card>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-semibold">Local Storage</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Form data is automatically saved locally using IndexedDB as you progress through each form page.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ArrowRight className="w-8 h-8 text-green-600" />
                <h3 className="text-lg font-semibold">Smart Navigation</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Previous/Continue/Submit buttons with validation. Forms must be saved and valid before proceeding.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Upload className="w-8 h-8 text-purple-600" />
                <h3 className="text-lg font-semibold">Bulk Submission</h3>
              </div>
              <p className="text-gray-600 text-sm">
                All form data is collated and submitted as a single batch to the backend API for database persistence.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Flow */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Clinical Data Collection Flow</CardTitle>
            <p className="text-gray-600">
              This demo will take you through a complete clinical data collection session with 5 forms:
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Demographics', icon: FileText, description: 'Patient personal and contact information' },
                { name: 'Medical History', icon: FileText, description: 'Previous medical conditions and medications' },
                { name: 'Vital Signs', icon: FileText, description: 'Blood pressure, heart rate, temperature' },
                { name: 'Lab Results', icon: FileText, description: 'Laboratory test results and values' },
                { name: 'Final Assessment', icon: CheckCircle, description: 'Summary and clinical assessment' }
              ].map((form, index) => (
                <div key={form.name} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <span className="text-blue-800 font-medium text-sm">{index + 1}</span>
                  </div>
                  <form.icon className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">{form.name}</div>
                    <div className="text-sm text-gray-600">{form.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">What you'll experience:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Automatic local saving of form data as you type</li>
                <li>• Form validation before navigation</li>
                <li>• Progress indicator showing current step</li>
                <li>• Previous/Continue navigation between forms</li>
                <li>• Final bulk submission of all data</li>
                <li>• Error handling and user feedback</li>
              </ul>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
              
              <Button
                onClick={handleStartDemo}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>{loading ? 'Initializing...' : 'Start Demo'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Session Info */}
        {currentSession && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Active Demo Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Case ID:</span>
                  <div className="text-gray-600">{currentSession.case_id}</div>
                </div>
                <div>
                  <span className="font-medium">Current Form:</span>
                  <div className="text-gray-600 capitalize">{currentSession.current_form.replace('_', ' ')}</div>
                </div>
                <div>
                  <span className="font-medium">Progress:</span>
                  <div className="text-gray-600">
                    {currentSession.navigation_state.current_step + 1} of {currentSession.navigation_state.total_steps}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => {
                  const searchParams = new URLSearchParams();
                  searchParams.set('case', currentSession.case_id);
                  searchParams.set('volunteerId', currentSession.volunteer_id);
                  searchParams.set('studyNumber', currentSession.study_number);
                  navigate(`/demo/${currentSession.current_form}?${searchParams.toString()}`);
                }}
                className="mt-4"
              >
                Continue Demo Session
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FormFlowDemoPage;