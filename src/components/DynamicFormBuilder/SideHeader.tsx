import React from 'react';

interface SideHeaderProps {
  title: string;
  isActive?: boolean;
}

export const SideHeader: React.FC<SideHeaderProps> = ({ 
  title, 
  isActive = false 
}) => {
  return (
    <div 
      className={`
        px-4 py-2 text-sm border-l-2 
        ${isActive 
          ? 'border-primary text-primary font-medium bg-primary/5' 
          : 'border-transparent text-gray-600'
        }
        transition-colors
      `}
    >
      {title}
    </div>
  );
};