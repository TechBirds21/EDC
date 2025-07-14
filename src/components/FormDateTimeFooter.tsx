import React, { useState, useEffect } from 'react';

interface FormDateTimeFooterProps {
  className?: string;
}

const FormDateTimeFooter: React.FC<FormDateTimeFooterProps> = ({ 
  className = "text-center text-sm text-gray-500 py-4 border-t no-print" 
}) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    // Update every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
  };

  return (
    <div className={className}>
      <span>Current Date & Time: {formatDateTime(currentDateTime)}</span>
    </div>
  );
};

export default FormDateTimeFooter;