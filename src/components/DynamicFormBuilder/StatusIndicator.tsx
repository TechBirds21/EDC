import React from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'idle' | 'saving' | 'success' | 'error';
  message?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  message 
}) => {
  if (status === 'idle') return null;
  
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" />,
          defaultMessage: 'Saving changes...'
        };
      case 'success':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: <Check className="mr-2 h-4 w-4" />,
          defaultMessage: 'Changes saved successfully'
        };
      case 'error':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: <AlertCircle className="mr-2 h-4 w-4" />,
          defaultMessage: 'Failed to save changes'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: null,
          defaultMessage: ''
        };
    }
  };
  
  const { bgColor, textColor, icon, defaultMessage } = getStatusConfig();
  const displayMessage = message || defaultMessage;
  
  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} ${textColor} px-4 py-2 rounded-md shadow-md flex items-center`}>
      {icon}
      {displayMessage}
    </div>
  );
};