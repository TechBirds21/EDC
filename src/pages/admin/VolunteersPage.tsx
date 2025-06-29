
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, Users, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Volunteer {
  id: string;
  volunteer_id: string;
  study_number: string;
  case_id: string;
  demographic_data: any;
  created_at: string;
  updated_at: string;
}

interface DemographicData {
  screeningDate?: string;
  dateOfBirth?: string;
  gender?: string;
  bmi?: string | number;
  [key: string]: any;
}

const VolunteersPage: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patient_forms')
        .select('*')
        .eq('template_name', 'Demographic Details')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const volunteerData: Volunteer[] = (data || []).map(form => ({
        id: form.id,
        volunteer_id: form.volunteer_id,
        study_number: form.study_number,
        case_id: form.case_id,
        demographic_data: form.answers,
        created_at: form.created_at,
        updated_at: form.updated_at
      }));

      setVolunteers(volunteerData);
    } catch (error) {
      console.error('Error loading volunteers:', error);
      toast.error('Failed to load volunteers');
    } finally {
      setLoading(false);
    }
  };

  const getDemographicValue = (data: any, key: string): string => {
    if (!data || typeof data !== 'object') return 'N/A';
    
    try {
      const demographicData = data as DemographicData;
      const value = demographicData[key];
      
      if (value === null || value === undefined) return 'N/A';
      return String(value);
    } catch (error) {
      console.error('Error parsing demographic data:', error);
      return 'N/A';
    }
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      volunteer.volunteer_id.toLowerCase().includes(searchLower) ||
      volunteer.study_number.toLowerCase().includes(searchLower) ||
      volunteer.case_id.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Volunteers</h1>
          <p className="text-muted-foreground">Manage volunteer information and data</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Volunteer
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search volunteers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Volunteers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            All Volunteers ({filteredVolunteers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVolunteers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-muted-foreground">No volunteers found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Volunteer ID</TableHead>
                  <TableHead>Study Number</TableHead>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Screening Date</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>BMI</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVolunteers.map((volunteer) => (
                  <TableRow key={volunteer.id}>
                    <TableCell className="font-medium">{volunteer.volunteer_id}</TableCell>
                    <TableCell>{volunteer.study_number}</TableCell>
                    <TableCell>{volunteer.case_id}</TableCell>
                    <TableCell>{getDemographicValue(volunteer.demographic_data, 'screeningDate')}</TableCell>
                    <TableCell>{getDemographicValue(volunteer.demographic_data, 'dateOfBirth')}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getDemographicValue(volunteer.demographic_data, 'gender')}
                      </Badge>
                    </TableCell>
                    <TableCell>{getDemographicValue(volunteer.demographic_data, 'bmi')}</TableCell>
                    <TableCell>{new Date(volunteer.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VolunteersPage;
