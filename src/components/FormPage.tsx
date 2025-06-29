import React, { PropsWithChildren, useCallback } from "react";
import FormNavigation from "@/components/FormNavigation";
import CommonFormHeader from "@/components/CommonFormHeader";
import { useFormStepper } from "@/hooks/useFormStepper";

export interface FormPageProps {
  /** Ordered route list for the section (e.g. screening flow) */
  routeOrder: string[];
  /** Heading shown by CommonFormHeader */
  title: string;
  /** Async/local save handler */
  onSaveLocal: () => Promise<void> | void;
  /** Optional preview on final screen */
  onPreview?: () => void;
}

const FormPage: React.FC<PropsWithChildren<FormPageProps>> = ({
  children,
  routeOrder,
  title,
  onSaveLocal,
  onPreview,
}) => {
  const {
    hasPrevious,
    hasNext,
    isLastForm,
    goPrevious,
    goNext,
  } = useFormStepper(routeOrder);

  /* Uncomment to auto-save on unmount, if desired
  useEffect(() => {
    return () => { onSaveLocal?.(); };
  }, [onSaveLocal]);
  */

  const saveHandler = useCallback(async () => {
    await onSaveLocal?.();
  }, [onSaveLocal]);

  return (
    <div className="space-y-8">
      <CommonFormHeader title={title} />

      {/* ---------- Your actual form body ---------- */}
      {children}

      <FormNavigation
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        isLastForm={isLastForm}
        onPrevious={goPrevious}
        onNext={goNext}
        onSaveLocal={saveHandler}
        onPreview={onPreview}
      />
    </div>
  );
};

export default FormPage;
