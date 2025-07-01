import React from "react";
import { ChevronLeft, ChevronRight, Save, Eye, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface FormNavigationProps {
  hasPrevious: boolean;
  hasNext: boolean;
  isLastForm: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSaveLocal: () => Promise<void> | void;
  onPreview?: () => void;
  loading?: boolean;
  isSaved?: boolean;
  isSaved?: boolean;
}

const FormNavigation: React.FC<FormNavigationProps> = ({
  hasPrevious,
  hasNext,
  isLastForm,
  onPrevious,
  onNext,
  onSaveLocal,
  onPreview,
  loading = false,
  isSaved = false,
  isSaved = false,
}) => {
  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* ← Previous */}
          <Button
            variant={isSaved ? "default" : "outline"}
            onClick={onPrevious}
            className={`bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 ${!isSaved ? 'opacity-50 cursor-not-allowed' : ''}`}
            className={`flex items-center space-x-2 ${
              isSaved ? "bg-green-600 hover:bg-green-700 text-white" : ""
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isSaved ? "Saved" : "Save Local"}</span>
          </Button>

          {/* Centre Action Group */}
          <div className="flex items-center space-x-3">
            {/* 💾 Save Local */}
            <Button
              variant="outline"
              disabled={!hasNext || loading || !isSaved}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Local</span>
            </Button>

            {/* 🖨 Print */}
            {isSaved && (
              <Button
                variant="outline"
                onClick={() => window.print()}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </Button>
            )}

            {/* 👁 Preview or → Continue */}
            {isLastForm ? (
              onPreview && (
                <Button
                  variant="outline"
                  onClick={onPreview}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </Button>
              )
            ) : (
              <Button
                onClick={onNext}
                disabled={!hasNext || loading || !isSaved}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormNavigation;
