import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Save, Eye, Printer, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFormFlow } from "@/context/FormFlowContext";
import { toast } from "sonner";

export interface EnhancedFormNavigationProps {
  formName: string;
  formData: Record<string, any>;
  isFormValid: boolean;
  validationErrors?: Record<string, string[]>;
  onValidateForm?: () => Promise<boolean> | boolean;
  onSubmitAllForms?: () => Promise<void>;
  onPreview?: () => void;
  className?: string;
}

const EnhancedFormNavigation: React.FC<EnhancedFormNavigationProps> = ({
  formName,
  formData,
  isFormValid,
  validationErrors,
  onValidateForm,
  onSubmitAllForms,
  onPreview,
  className = "",
}) => {
  const {
    currentSession,
    saveCurrentFormData,
    goToPrevious,
    goToNext,
    completeCurrentForm,
    canNavigateNext,
    canNavigatePrevious,
    loading: contextLoading,
    error: contextError,
    clearError
  } = useFormFlow();

  const [localLoading, setLocalLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const isLastForm = currentSession ? 
    currentSession.navigation_state.current_step === currentSession.navigation_state.total_steps - 1 : 
    false;

  const loading = contextLoading || localLoading;

  const handleSaveLocal = async () => {
    try {
      setLocalLoading(true);
      clearError();

      // Validate form if validation function is provided
      let formIsValid = isFormValid;
      if (onValidateForm) {
        formIsValid = await onValidateForm();
      }

      // Save form data
      await saveCurrentFormData(formName, formData, formIsValid, validationErrors);
      setIsSaved(true);
      
      toast.success("Form data saved locally");
    } catch (error) {
      console.error('Failed to save form data:', error);
      toast.error("Failed to save form data");
    } finally {
      setLocalLoading(false);
    }
  };

  const handlePrevious = async () => {
    try {
      setLocalLoading(true);
      clearError();

      const success = await goToPrevious();
      if (success) {
        toast.success("Navigated to previous form");
      } else {
        toast.error("Cannot navigate to previous form");
      }
    } catch (error) {
      console.error('Failed to navigate to previous form:', error);
      toast.error("Failed to navigate to previous form");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleContinue = async () => {
    try {
      setLocalLoading(true);
      clearError();

      // Ensure form is saved and valid before continuing
      if (!isSaved) {
        await handleSaveLocal();
      }

      // Validate form if validation function is provided
      let formIsValid = isFormValid;
      if (onValidateForm) {
        formIsValid = await onValidateForm();
      }

      if (!formIsValid) {
        toast.error("Please fix validation errors before continuing");
        return;
      }

      // Complete current form and navigate to next
      await completeCurrentForm();
      const success = await goToNext();
      
      if (success) {
        toast.success("Navigated to next form");
        setIsSaved(false); // Reset saved state for new form
      } else {
        toast.error("Cannot navigate to next form");
      }
    } catch (error) {
      console.error('Failed to continue to next form:', error);
      toast.error("Failed to continue to next form");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSubmitAll = async () => {
    try {
      setLocalLoading(true);
      clearError();

      // Save current form first
      if (!isSaved) {
        await handleSaveLocal();
      }

      // Validate final form
      let formIsValid = isFormValid;
      if (onValidateForm) {
        formIsValid = await onValidateForm();
      }

      if (!formIsValid) {
        toast.error("Please fix validation errors before submitting");
        return;
      }

      // Complete current form
      await completeCurrentForm();

      // Submit all forms
      if (onSubmitAllForms) {
        await onSubmitAllForms();
        toast.success("All forms submitted successfully!");
      } else {
        toast.error("Submit function not provided");
      }
    } catch (error) {
      console.error('Failed to submit all forms:', error);
      toast.error("Failed to submit forms");
    } finally {
      setLocalLoading(false);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview();
    } else {
      // Default preview action - could open a modal or navigate to preview page
      toast.info("Preview functionality not implemented for this form");
    }
  };

  const handlePrint = () => {
    try {
      window.print();
      toast.success("Print dialog opened");
    } catch (error) {
      toast.error("Failed to open print dialog");
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Display */}
      {contextError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{contextError}</AlertDescription>
        </Alert>
      )}

      {/* Validation Errors */}
      {validationErrors && Object.keys(validationErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Please fix the following errors:</div>
              {Object.entries(validationErrors).map(([field, errors]) => (
                <div key={field} className="text-sm">
                  <strong>{field}:</strong> {errors.join(', ')}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation Controls */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Previous Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={!canNavigatePrevious() || loading}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {/* Center Action Group */}
            <div className="flex items-center space-x-3">
              {/* Save Local Button */}
              <Button
                type="button"
                variant={isSaved ? "default" : "outline"}
                onClick={handleSaveLocal}
                disabled={loading}
                className={`flex items-center space-x-2 ${
                  isSaved ? "bg-green-600 hover:bg-green-700 text-white" : ""
                }`}
              >
                <Save className="w-4 h-4" />
                <span>
                  {loading && localLoading ? "Saving..." : isSaved ? "Saved" : "Save Local"}
                </span>
              </Button>

              {/* Print Button (only show after save) */}
              {isSaved && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrint}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </Button>
              )}

              {/* Preview Button (only on last form) */}
              {isLastForm && onPreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </Button>
              )}
            </div>

            {/* Right Action: Continue or Submit */}
            {isLastForm ? (
              <Button
                type="button"
                onClick={handleSubmitAll}
                disabled={!isSaved || !isFormValid || loading}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>
                  {loading && localLoading ? "Submitting..." : "Submit All"}
                </span>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!isSaved || !isFormValid || !canNavigateNext() || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          {currentSession && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Step {currentSession.navigation_state.current_step + 1} of{" "}
                  {currentSession.navigation_state.total_steps}
                </span>
                <span className="font-medium">{formName}</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((currentSession.navigation_state.current_step + 1) /
                        currentSession.navigation_state.total_steps) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedFormNavigation;