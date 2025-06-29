import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Printer, Save } from "lucide-react";

interface CommonFormNavigationProps {
  /* Navigation */
  onPrevious: () => void;
  onSaveLocal: () => void | Promise<void>;
  onContinue: () => void;
  /* State flags */
  hasPrevious?: boolean;   // ← NEW
  hasNext?: boolean;       // ← NEW (for completeness; you can omit if always true)
  isSaved?: boolean;
  loading?: boolean;
  /* UI options */
  showPrint?: boolean;
  previousLabel?: string;
  continueLabel?: string;
  onPrint?: () => void;
}

const CommonFormNavigation: React.FC<CommonFormNavigationProps> = ({
  onPrevious,
  onSaveLocal,
  onContinue,
  onPrint = () => window.print(),
  hasPrevious = true,
  hasNext = true,
  isSaved = false,
  loading = false,
  showPrint = true,
  previousLabel = "Previous",
  continueLabel = "Continue",
}) => {
  return (
    <div className="flex justify-between items-center pt-6 no-print border-t">
      {/* ← Previous */}
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={!hasPrevious || loading}
        className="flex items-center space-x-2"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>{previousLabel}</span>
      </Button>

      <div className="flex items-center gap-4">
        {/* 💾 Save Local */}
        <Button
          type="button"
          onClick={onSaveLocal}
          disabled={loading}
          className={`flex items-center gap-2 ${
            isSaved ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <Save className="w-4 h-4" />
          {loading ? "Saving…" : isSaved ? "Saved" : "Save Local"}
        </Button>

        {/* 🖨 Print (after save) */}
        {showPrint && isSaved && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrint}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </Button>
        )}

        {/* → Continue */}
        <Button
          type="button"
          onClick={onContinue}
          disabled={!isSaved || !hasNext || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 disabled:opacity-50"
        >
          <span>{continueLabel}</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CommonFormNavigation;
