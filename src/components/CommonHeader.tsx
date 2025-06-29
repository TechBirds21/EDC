
import React from 'react';

interface CommonHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const CommonHeader: React.FC<CommonHeaderProps> = ({
  title,
  subtitle,
  className = ""
}) => {
  return (
    <div className={`border-b pb-4 mb-6 ${className}`}>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && (
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      )}
    </div>
  );
};
