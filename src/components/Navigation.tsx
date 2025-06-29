
import React from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationProps {
  backUrl?: string;
  onContinue?: () => void;
  onBack?: () => void;
  backLabel?: string;
  continueLabel?: string;
  timestampLabel?: string;
  disabled?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  backUrl,
  onContinue,
  onBack,
  backLabel = "Previous",
  continueLabel = "Continue",
  timestampLabel,
  disabled = false
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      window.location.href = backUrl;
    }
  };

  return (
    <div className="flex justify-between items-center pt-6 border-t border-border">
      <Button
        type="button"
        variant="outline"
        onClick={handleBack}
        className="flex items-center space-x-2"
        disabled={disabled}
      >
        <ChevronLeft className="w-4 h-4" />
        <span>{backLabel}</span>
      </Button>
      
      {timestampLabel && (
        <div className="text-sm text-muted-foreground">
          {timestampLabel}: {new Date().toLocaleString()}
        </div>
      )}
      
      {onContinue && (
        <Button
          type="button"
          onClick={onContinue}
          className="flex items-center space-x-2"
          disabled={disabled}
        >
          <span>{continueLabel}</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
