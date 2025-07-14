import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Circle } from 'lucide-react';

interface PeriodNavigationProps {
  currentPeriod: number;
  onPeriodChange: (period: number) => void;
  savedPeriods: number[];
  hasPeriodData: (period: number) => boolean;
  className?: string;
}

export const PeriodNavigation: React.FC<PeriodNavigationProps> = ({
  currentPeriod,
  onPeriodChange,
  savedPeriods,
  hasPeriodData,
  className = ""
}) => {
  const getPeriodStatus = (period: number) => {
    if (savedPeriods.includes(period)) {
      return 'saved';
    } else if (hasPeriodData(period)) {
      return 'draft';
    }
    return 'empty';
  };

  const getStatusIcon = (period: number) => {
    const status = getPeriodStatus(period);
    switch (status) {
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (period: number) => {
    const status = getPeriodStatus(period);
    switch (status) {
      case 'saved':
        return 'Saved';
      case 'draft':
        return 'Draft';
      default:
        return 'Empty';
    }
  };

  const getStatusColor = (period: number) => {
    const status = getPeriodStatus(period);
    switch (status) {
      case 'saved':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Card className={`bg-blue-50 border-blue-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium text-blue-900">Period:</span>
            <div className="flex space-x-2">
              {[1, 2].map((period) => (
                <Button
                  key={period}
                  variant={currentPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPeriodChange(period)}
                  className={`flex items-center space-x-2 ${
                    currentPeriod === period 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "border-blue-300 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  {getStatusIcon(period)}
                  <span>Period {period}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-700">Status:</span>
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(currentPeriod)} text-xs`}
            >
              {getStatusText(currentPeriod)}
            </Badge>
          </div>
        </div>
        
        {currentPeriod === 1 && (
          <div className="mt-2 text-xs text-blue-600">
            📅 Period 1: Baseline measurements and initial data collection
          </div>
        )}
        
        {currentPeriod === 2 && (
          <div className="mt-2 text-xs text-blue-600">
            📅 Period 2: Follow-up measurements and comparative data
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PeriodNavigation;