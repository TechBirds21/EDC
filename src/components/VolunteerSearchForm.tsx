import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVolunteer } from '@/context/VolunteerContext';
import { Search, UserPlus } from 'lucide-react';

interface VolunteerSearchFormProps {
  onSuccess: () => void;
}

export const VolunteerSearchForm: React.FC<VolunteerSearchFormProps> = ({ onSuccess }) => {
  const [volunteerId, setVolunteerId] = useState('');
  const [studyNumber, setStudyNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  
  // Registration form fields
  const [regData, setRegData] = useState({
    volunteerId: '',
    studyNumber: '',
    screeningDate: '',
    dob: '',
    gender: '',
    bmi: '',
  });

  const { searchVolunteer, registerVolunteer, setVolunteerData } = useVolunteer();
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const volunteer = await searchVolunteer(volunteerId, studyNumber);
      
      if (volunteer) {
        setVolunteerData(volunteer);
        onSuccess();
      } else {
        setError('Volunteer not found. Please register the volunteer first.');
        setRegData(prev => ({
          ...prev,
          volunteerId,
          studyNumber,
        }));
        setShowRegistration(true);
      }
    } catch (err) {
      setError('Failed to search for volunteer. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerVolunteer({
        volunteerId: regData.volunteerId,
        studyNumber: regData.studyNumber,
        screeningDate: regData.screeningDate,
        dob: regData.dob,
        gender: regData.gender,
        bmi: regData.bmi ? parseFloat(regData.bmi) : undefined,
      });
      
      setVolunteerData({
        volunteerId: regData.volunteerId,
        studyNumber: regData.studyNumber,
        screeningDate: regData.screeningDate,
        dob: regData.dob,
        gender: regData.gender,
        bmi: regData.bmi ? parseFloat(regData.bmi) : undefined,
      });
      
      onSuccess();
    } catch (err) {
      setError('Failed to register volunteer. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (showRegistration) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Register New Volunteer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegistration} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reg-volunteer-id">Volunteer ID</Label>
                <Input
                  id="reg-volunteer-id"
                  type="text"
                  value={regData.volunteerId}
                  onChange={(e) => setRegData(prev => ({ ...prev, volunteerId: e.target.value }))}
                  placeholder="Enter volunteer ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-study-number">Study Number</Label>
                <Input
                  id="reg-study-number"
                  type="text"
                  value={regData.studyNumber}
                  onChange={(e) => setRegData(prev => ({ ...prev, studyNumber: e.target.value }))}
                  placeholder="Enter study number"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="screening-date">Screening Date</Label>
                <Input
                  id="screening-date"
                  type="date"
                  value={regData.screeningDate}
                  onChange={(e) => setRegData(prev => ({ ...prev, screeningDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={regData.dob}
                  onChange={(e) => setRegData(prev => ({ ...prev, dob: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={regData.gender}
                  onChange={(e) => setRegData(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bmi">BMI</Label>
                <Input
                  id="bmi"
                  type="number"
                  step="0.1"
                  value={regData.bmi}
                  onChange={(e) => setRegData(prev => ({ ...prev, bmi: e.target.value }))}
                  placeholder="Enter BMI"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRegistration(false)}
                disabled={loading}
              >
                Back to Search
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register Volunteer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Find Volunteer</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="volunteer-id">Volunteer ID</Label>
            <Input
              id="volunteer-id"
              type="text"
              value={volunteerId}
              onChange={(e) => setVolunteerId(e.target.value)}
              placeholder="Enter volunteer ID"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="study-number">Study Number</Label>
            <Input
              id="study-number"
              type="text"
              value={studyNumber}
              onChange={(e) => setStudyNumber(e.target.value)}
              placeholder="Enter study number"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Searching...' : 'Search Volunteer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default VolunteerSearchForm;