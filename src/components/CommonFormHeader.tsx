import React from "react";
import { FormField } from "./FormField";
import { useGlobalForm } from "@/context/GlobalFormContext";

/* ——— Types ——— */

interface PeriodOption {
  label: string;
  value: string;
}

interface CommonFormHeaderProps {
  title?: string;
  formTitle?: string;

  volunteerId?: string;
  subjectNo?: string;
  projectNo?: string;
  studyNumber?: string;
  caseId?: string;

  updateCommon?: (field: string, value: string) => void;

  periodNo?: string;
  setPeriodNo?: (period: string) => void;
  periodOptions?: PeriodOption[];

  formDate?: string;
  setFormDate?: (val: string) => void;

  sopNumber?: string;
  readOnly?: boolean;
  showPeriod?: boolean;

  common?: {
    volunteerId: string;
    subjectNo: string;
    projectNo: string;
  };
}

/* ——— Component ——— */

const CommonFormHeader: React.FC<CommonFormHeaderProps> = ({
  title,
  formTitle,
  volunteerId: propVolunteerId,
  subjectNo: propSubjectNo,
  projectNo,
  studyNumber: propStudyNumber,
  caseId,
  updateCommon,
  periodNo,
  setPeriodNo,
  periodOptions,
  formDate,
  setFormDate,
  sopNumber,
  readOnly = false,
  showPeriod = true,
  common,
}) => {
  /* Global fall-backs */
  const globalForm = useGlobalForm();

  const volunteerId =
    propVolunteerId || globalForm.volunteerId || common?.volunteerId || "";

  const subjectNo =
    propSubjectNo || globalForm.subjectNo || common?.subjectNo || "";

  const studyNumber =
    propStudyNumber ||
    globalForm.studyNo ||
    projectNo ||
    common?.projectNo ||
    "";

  const effectiveTitle = title || formTitle || "Clinical Research Form";

  /* Handlers */
  const makeHandler =
    (field: string) => (val: string) => updateCommon?.(field, val);

  /* JSX */
  return (
    <div className="space-y-4">
      <HeaderTitle title={effectiveTitle} sopNumber={sopNumber} />

      <div className="grid grid-cols-2 gap-4 p-4 border border-border rounded-lg bg-muted/50">
        {/* Volunteer & Study IDs */}
        <FormField
          label="Volunteer ID"
          value={volunteerId}
          onChange={makeHandler("volunteerId")}
          disabled
        />
        <FormField
          label="Study No"
          value={studyNumber}
          onChange={makeHandler("studyNumber")}
          disabled
        />

        {/* Optional Subject No */}
        {subjectNo && (
          <FormField
            label="Subject No"
            value={subjectNo}
            onChange={makeHandler("subjectNo")}
            disabled
          />
        )}

        {/* Optional Case ID */}
        {caseId && (
          <FormField
            label="Case ID"
            value={caseId}
            onChange={() => {}}
            disabled
          />
        )}

        {/* Period selector */}
        {showPeriod && setPeriodNo && (
          <div className="col-span-2">
            <FormField
              label="Period"
              type="select"
              options={
                periodOptions?.length
                  ? periodOptions
                  : [
                      { label: "Period 1", value: "1" },
                      { label: "Period 2", value: "2" },
                    ]
              }
              value={periodNo ?? ""}
              onChange={setPeriodNo}
              disabled={readOnly}
            />
          </div>
        )}

        {/* Form date */}
        {formDate !== undefined && setFormDate && (
          <div className="col-span-2">
            <FormField
              label="Form Date"
              type="date"
              value={formDate}
              onChange={setFormDate}
              disabled={readOnly}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/* ——— Sub-component ——— */

interface HeaderTitleProps {
  title: string;
  sopNumber?: string;
}

const HeaderTitle: React.FC<HeaderTitleProps> = ({ title, sopNumber }) => (
  <div className="text-center border-b border-border pb-4 mb-6">
    <h1 className="text-2xl font-bold">Clians</h1>
    <p className="text-sm text-muted-foreground">
      Clinical Research Organization
    </p>
    <p className="text-lg font-semibold mt-2">{title}</p>
    {sopNumber && <p className="text-sm">SOP No: {sopNumber}</p>}
  </div>
);

/* ——— Default export per your guideline ——— */
export default CommonFormHeader;
