
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center p-4 bg-red-50 border-l-4 border-red-500 ${className}`}>
      <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
      <div className="text-red-700 text-sm">{message}</div>
    </div>
  );
};
