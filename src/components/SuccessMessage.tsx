
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ 
  message, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center p-4 bg-green-50 border-l-4 border-green-500 ${className}`}>
      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
      <div className="text-green-700 text-sm">{message}</div>
    </div>
  );
};
