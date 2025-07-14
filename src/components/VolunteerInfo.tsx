import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar } from 'lucide-react';

interface VolunteerInfoProps {
  volunteerId: string;
  studyNumber: string;
  className?: string;
}

export const VolunteerInfo: React.FC<VolunteerInfoProps> = ({
  volunteerId,
  studyNumber,
  className = ""
}) => {
  if (!volunteerId || !studyNumber) {
    return null;
  }

  return (
    <Card className={`bg-blue-50 border-blue-200 ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-blue-600" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <span className="text-sm font-medium text-blue-900">Volunteer ID:</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {volunteerId}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <span className="text-sm font-medium text-blue-900">Study:</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {studyNumber}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VolunteerInfo;