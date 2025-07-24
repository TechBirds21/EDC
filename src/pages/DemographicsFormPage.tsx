import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Calendar, MapPin, Phone } from 'lucide-react';
import { useFormFlow } from '@/context/FormFlowContext';
import EnhancedFormNavigation from '@/components/EnhancedFormNavigation';
import formSubmissionService from '@/services/formSubmissionService';
import { toast } from 'sonner';

interface DemographicsFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  ethnicity: string;
  race: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string;
}

const DemographicsFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    currentSession, 
    loadSession, 
    getCurrentFormData, 
    getAllFormData,
    loading: contextLoading,
    error: contextError 
  } = useFormFlow();

  const [formData, setFormData] = useState<DemographicsFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    ethnicity: '',
    race: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form session and load existing data
  useEffect(() => {
    const initializeForm = async () => {
      const caseId = searchParams.get('case');
      if (!caseId) {
        toast.error('No case ID provided');
        navigate('/employee/projects');
        return;
      }

      try {
        await loadSession(caseId);
        
        // Load existing form data if available
        const existingData = await getCurrentFormData('demographics');
        if (existingData && Object.keys(existingData).length > 0) {
          setFormData(prev => ({ ...prev, ...existingData }));
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize form:', error);
        toast.error('Failed to load form session');
      }
    };

    initializeForm();
  }, [searchParams, loadSession, getCurrentFormData, navigate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {};

    // Required field validation
    if (!formData.firstName.trim()) {
      errors.firstName = ['First name is required'];
    }
    if (!formData.lastName.trim()) {
      errors.lastName = ['Last name is required'];
    }
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = ['Date of birth is required'];
    }
    if (!formData.gender) {
      errors.gender = ['Gender is required'];
    }
    if (!formData.phone.trim()) {
      errors.phone = ['Phone number is required'];
    }

    // Format validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = ['Please enter a valid email address'];
    }
    
    if (formData.phone && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone)) {
      errors.phone = ['Please enter a valid phone number'];
    }

    // Age validation (must be 18 or older)
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        errors.dateOfBirth = ['Participant must be 18 years or older'];
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof DemographicsFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: []
      }));
    }
  };

  const handleSubmitAllForms = async () => {
    if (!currentSession) {
      toast.error('No active session found');
      return;
    }

    try {
      const result = await formSubmissionService.submitFormData(currentSession);
      
      if (result.success) {
        toast.success('All forms submitted successfully!');
        navigate('/employee/projects');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Failed to submit forms:', error);
      toast.error('Failed to submit forms');
    }
  };

  const isFormValid = Object.keys(validationErrors).length === 0 && 
                     formData.firstName.trim() !== '' && 
                     formData.lastName.trim() !== '' &&
                     formData.dateOfBirth !== '' &&
                     formData.gender !== '';

  if (!isInitialized || contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-6 h-6 text-blue-600" />
              <span>Demographics Information</span>
            </CardTitle>
            {currentSession && (
              <div className="text-sm text-gray-600">
                Case: {currentSession.case_id} | Volunteer: {currentSession.volunteer_id} | Study: {currentSession.study_number}
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Form Content */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {contextError && (
              <Alert variant="destructive">
                <AlertDescription>{contextError}</AlertDescription>
              </Alert>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={validationErrors.firstName ? 'border-red-500' : ''}
                  />
                  {validationErrors.firstName && (
                    <div className="text-red-500 text-sm">{validationErrors.firstName[0]}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={validationErrors.lastName ? 'border-red-500' : ''}
                  />
                  {validationErrors.lastName && (
                    <div className="text-red-500 text-sm">{validationErrors.lastName[0]}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Date of Birth <span className="text-red-500">*</span></span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className={validationErrors.dateOfBirth ? 'border-red-500' : ''}
                  />
                  {validationErrors.dateOfBirth && (
                    <div className="text-red-500 text-sm">{validationErrors.dateOfBirth[0]}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className={validationErrors.gender ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.gender && (
                    <div className="text-red-500 text-sm">{validationErrors.gender[0]}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ethnicity">Ethnicity</Label>
                  <Select value={formData.ethnicity} onValueChange={(value) => handleInputChange('ethnicity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ethnicity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hispanic_latino">Hispanic or Latino</SelectItem>
                      <SelectItem value="not_hispanic_latino">Not Hispanic or Latino</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="race">Race</Label>
                  <Select value={formData.race} onValueChange={(value) => handleInputChange('race', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select race" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="american_indian">American Indian or Alaska Native</SelectItem>
                      <SelectItem value="asian">Asian</SelectItem>
                      <SelectItem value="black">Black or African American</SelectItem>
                      <SelectItem value="native_hawaiian">Native Hawaiian or Other Pacific Islander</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Contact Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className={validationErrors.phone ? 'border-red-500' : ''}
                  />
                  {validationErrors.phone && (
                    <div className="text-red-500 text-sm">{validationErrors.phone[0]}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@example.com"
                    className={validationErrors.email ? 'border-red-500' : ''}
                  />
                  {validationErrors.email && (
                    <div className="text-red-500 text-sm">{validationErrors.email[0]}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Address Information</span>
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Emergency Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Medical History Summary</h3>
              <div className="space-y-2">
                <Label htmlFor="medicalHistory">
                  Please provide a brief summary of any significant medical history
                </Label>
                <Textarea
                  id="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  placeholder="Enter any relevant medical history, allergies, or conditions..."
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Navigation */}
        <EnhancedFormNavigation
          formName="demographics"
          formData={formData}
          isFormValid={isFormValid}
          validationErrors={validationErrors}
          onValidateForm={validateForm}
          onSubmitAllForms={handleSubmitAllForms}
        />
      </div>
    </div>
  );
};

export default DemographicsFormPage;