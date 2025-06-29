/* ─────────────────────────────────────────────────────
   DemographicDetailsPage.tsx
   ─ Created for Screening flow with shared navigation
   ─ Copy-paste this entire file into src/pages/
   ─ Routes must include   "screening/demographic-details"
   ───────────────────────────────────────────────────── */

import React, { useState, useEffect, useCallback } from "react";
import {
  useParams,
  useLocation,
} from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/dexie";
import { PrintableForm } from "./PrintableForm";
import CommonFormHeader from "./CommonFormHeader";
import FormNavigation from "./FormNavigation";
import { useToast } from "@/hooks/use-toast";
import { useFormStepper } from "@/hooks/useFormStepper";

/* ------------ 1. Ordered list of screening routes --------------- */
/* Re-use this array in every other screening page */
export const screeningOrder = [
  "screening/demographic-details",
  "screening/medical-history",
  "screening/medical-exam",
  "screening/systemic-exam",
  "screening/ecg-evaluation",
  "screening/ecg",
  "screening/xray-evaluation",
  "screening/covid-screening",
  "screening/pregnancy-test",
  "screening/urine-pregnancy-test",
  "screening/bhcg-test",
];

/* ------------ 2. Types & defaults --------------- */
interface DemographicData {
  screeningDate: string;
  gender: string;
  maritalStatus: string;
  dateOfBirth: string;
  age: { years: string; months: string; days: string };
  height: string;
  weight: string;
  bmi: string;
  ethnicOrigin: string;
  literacy: string;
  foodHabits: string;
  historyOfSmoking: { status: string; remarks: string };
  historyOfTobacco: { status: string; remarks: string };
  historyOfAlcohol: { status: string; remarks: string };
  historyOfBloodDonation: {
    status: string;
    lastDonationDate: string;
    amount: string;
  };
  historyOfClinicalStudy: {
    status: string;
    lastParticipationDate: string;
    organization: string;
    remarks: string;
  };
  recordedBy: { initials: string; date: string; time: string };
  [key: string]: any;
}

const today = new Date().toISOString().split("T")[0];

const defaultFormData: DemographicData = {
  screeningDate: today,
  gender: "",
  maritalStatus: "",
  dateOfBirth: "",
  age: { years: "", months: "", days: "" },
  height: "",
  weight: "",
  bmi: "",
  ethnicOrigin: "Asian",
  literacy: "",
  foodHabits: "",
  historyOfSmoking: { status: "", remarks: "" },
  historyOfTobacco: { status: "", remarks: "" },
  historyOfAlcohol: { status: "", remarks: "" },
  historyOfBloodDonation: { status: "", lastDonationDate: "", amount: "" },
  historyOfClinicalStudy: {
    status: "",
    lastParticipationDate: "",
    organization: "",
    remarks: "",
  },
  recordedBy: {
    initials: "",
    date: today,
    time: new Date().toTimeString().slice(0, 5),
  },
};

const selectOptions = {
  gender: ["Male", "Female"],
  maritalStatus: ["Unmarried", "Married", "Divorced", "Widowed"],
  ethnicOrigin: ["Asian"],
  literacy: ["Literate", "Illiterate"],
  foodHabits: ["Non-Veg", "Eggetarian", "Veg"],
  smokingStatus: ["Non Smoker", "Smoker"],
  yesNo: ["Yes", "No"],
  alcoholStatus: ["Non Alcoholic", "Alcoholic"],
};

/* ------------ 3. Component --------------- */
const DemographicDetailsPage: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const location = useLocation();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get("case") || "temp-case";

  /* Shared stepper */
  const {
    hasPrevious,
    hasNext,
    isLastForm,
    goPrevious,
    goNext,
  } = useFormStepper(screeningOrder);

  /* State */
  const [formData, setFormData] = useState<DemographicData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [volunteerId, setVolunteerId] = useState("");
  const [studyNumber, setStudyNumber] = useState("");

  /* -------- Load cached case info & answers -------- */
  useEffect(() => {
    (async () => {
      const caseRow = await db.pending_forms
        .where("patient_id")
        .equals(caseId)
        .first();
      if (caseRow) {
        setVolunteerId(caseRow.volunteer_id || "");
        setStudyNumber(caseRow.study_number || "");
      }

      const saved = await db.pending_forms
        .where("patient_id")
        .equals(caseId)
        .and((f) => f.template_id === "Demographic Details")
        .first();
      if (saved?.answers) setFormData((p) => ({ ...p, ...saved.answers }));
    })().catch(console.error);
  }, [caseId]);

  /* -------- Helpers -------- */
  const calcAge = (dob: string) => {
    if (!dob) return;
    const d = new Date(dob);
    const t = new Date();
    let y = t.getFullYear() - d.getFullYear();
    let m = t.getMonth() - d.getMonth();
    let dd = t.getDate() - d.getDate();
    if (dd < 0) {
      m--;
      dd += new Date(t.getFullYear(), t.getMonth(), 0).getDate();
    }
    if (m < 0) {
      y--;
      m += 12;
    }
    setFormData((p) => ({
      ...p,
      age: { years: `${y}`, months: `${m}`, days: `${dd}` },
    }));
  };

  const calcBMI = () => {
    const h = +formData.height;
    const w = +formData.weight;
    if (h && w)
      setFormData((p) => ({ ...p, bmi: (w / (h * 0.01) ** 2).toFixed(2) }));
  };
  useEffect(calcBMI, [formData.height, formData.weight]);

  /* -------- Update helpers -------- */
  const update = (field: keyof DemographicData, v: any) => {
    setFormData((p) => ({ ...p, [field]: v }));
    if (field === "dateOfBirth") calcAge(v);
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined! }));
  };
  const updateNested = (p: keyof DemographicData, f: string, v: any) =>
    setFormData((d) => ({ ...d, [p]: { ...(d[p] as any), [f]: v } }));

  /* -------- Validation -------- */
  const validate = () => {
    const e: Record<string, string> = {};
    ["screeningDate", "gender", "maritalStatus", "dateOfBirth", "height", "weight", "literacy", "foodHabits"].forEach(
      (k) => {
        if (!formData[k]) e[k] = "Required";
      }
    );
    const yr = +formData.age.years;
    if (isNaN(yr) || yr < 18 || yr > 45) e.age = "18-45";
    const bmi = +formData.bmi;
    if (isNaN(bmi) || bmi < 18.5 || bmi > 24.9) e.bmi = "18.50-24.90";
    setErrors(e);
    return !Object.keys(e).length;
  };

  /* -------- Save local -------- */
  const handleSaveLocal = useCallback(async () => {
    const existing = await db.pending_forms
      .where("patient_id")
      .equals(caseId)
      .and((f) => f.template_id === "Demographic Details")
      .first();

    if (existing) {
      await db.pending_forms.update(existing.id!, {
        answers: formData,
        volunteer_id: volunteerId,
        study_number: studyNumber,
        last_modified: new Date(),
      });
    } else {
      await db.pending_forms.add({
        template_id: "Demographic Details",
        patient_id: caseId,
        answers: formData,
        volunteer_id: volunteerId,
        study_number: studyNumber,
        created_at: new Date(),
        last_modified: new Date(),
      });
    }
    toast({ title: "Saved Locally" });
  }, [caseId, formData, volunteerId, studyNumber, toast]);

  /* -------- Print -------- */
  const printForm = () => window.print();

  /* ─────────────────────────────────────────── JSX ─────────────────────────────────────────── */
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CommonFormHeader
        formTitle="Demographic Details"
        volunteerId={volunteerId}
        studyNumber={studyNumber}
        caseId={caseId}
        readOnly
      />

      {/* Print button */}
      <div className="no-print flex justify-end mb-4">
        <Button variant="outline" onClick={printForm} className="flex items-center space-x-2">
          <Printer className="w-4 h-4" />
          <span>Print Form</span>
        </Button>
      </div>

      {/* Printable body */}
      <PrintableForm templateName="Demographic Details">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">DEMOGRAPHIC DETAILS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ---------- Basic Information ---------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Date of Screening *</Label>
                <Input
                  type="date"
                  value={formData.screeningDate}
                  max={today}
                  onChange={(e) => update("screeningDate", e.target.value)}
                />
                {errors.screeningDate && (
                  <p className="text-red-500 text-sm">{errors.screeningDate}</p>
                )}
              </div>
              <div>
                <Label>Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => update("gender", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectOptions.gender.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-red-500 text-sm">{errors.gender}</p>
                )}
              </div>
            </div>

            {/* ---------- Marital Status / DOB ---------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Marital Status *</Label>
                <Select
                  value={formData.maritalStatus}
                  onValueChange={(v) => update("maritalStatus", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Marital Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectOptions.maritalStatus.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.maritalStatus && (
                  <p className="text-red-500 text-sm">{errors.maritalStatus}</p>
                )}
              </div>
              <div>
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  max={today}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>
                )}
              </div>
            </div>

            {/* ---------- Age Input ---------- */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Age (Years)</Label>
                <Input
                  type="number"
                  value={formData.age.years}
                  onChange={(e) =>
                    updateNested("age", "years", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Months</Label>
                <Input
                  type="number"
                  value={formData.age.months}
                  onChange={(e) =>
                    updateNested("age", "months", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Days</Label>
                <Input
                  type="number"
                  value={formData.age.days}
                  onChange={(e) =>
                    updateNested("age", "days", e.target.value)
                  }
                />
              </div>
            </div>
            {errors.age && (
              <p className="text-red-500 text-sm">{errors.age}</p>
            )}

            {/* ---------- Height / Weight / BMI ---------- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Height (cm) *</Label>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => update("height", e.target.value)}
                />
                {errors.height && (
                  <p className="text-red-500 text-sm">{errors.height}</p>
                )}
              </div>
              <div>
                <Label>Weight (kg) *</Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => update("weight", e.target.value)}
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm">{errors.weight}</p>
                )}
              </div>
              <div>
                <Label>BMI</Label>
                <div className="px-3 py-2 border rounded-md bg-gray-50">
                  {formData.bmi || "Not calculated"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Valid range: 18.50-24.90
                </p>
                {errors.bmi && (
                  <p className="text-red-500 text-sm">{errors.bmi}</p>
                )}
              </div>
            </div>

            {/* ---------- Ethnic Origin & Literacy ---------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Ethnic Origin</Label>
                <Select
                  value={formData.ethnicOrigin}
                  onValueChange={(v) => update("ethnicOrigin", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectOptions.ethnicOrigin.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Literacy *</Label>
                <Select
                  value={formData.literacy}
                  onValueChange={(v) => update("literacy", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Literacy" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectOptions.literacy.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.literacy && (
                  <p className="text-red-500 text-sm">{errors.literacy}</p>
                )}
              </div>
            </div>

            {/* ---------- Food Habits ---------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Food Habits *</Label>
                <Select
                  value={formData.foodHabits}
                  onValueChange={(v) => update("foodHabits", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Food Habits" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectOptions.foodHabits.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.foodHabits && (
                  <p className="text-red-500 text-sm">{errors.foodHabits}</p>
                )}
              </div>
            </div>

            {/* ---------- History: Smoking ---------- */}
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">GENERAL INFORMATION</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>History of Smoking</Label>
                  <Select
                    value={formData.historyOfSmoking.status}
                    onValueChange={(v) =>
                      updateNested("historyOfSmoking", "status", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectOptions.smokingStatus.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Remarks</Label>
                  <Input
                    value={formData.historyOfSmoking.remarks}
                    onChange={(e) =>
                      updateNested(
                        "historyOfSmoking",
                        "remarks",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* ---------- History of Tobacco ---------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>History of Tobacco Consumption</Label>
                <Select
                  value={formData.historyOfTobacco.status}
                  onValueChange={(v) =>
                    updateNested("historyOfTobacco", "status", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectOptions.yesNo.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Remarks</Label>
                <Input
                  value={formData.historyOfTobacco.remarks}
                  onChange={(e) =>
                    updateNested("historyOfTobacco", "remarks", e.target.value)
                  }
                />
              </div>
            </div>

            {/* ---------- History of Alcohol ---------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>History of Alcohol Consumption</Label>
                <Select
                  value={formData.historyOfAlcohol.status}
                  onValueChange={(v) =>
                    updateNested("historyOfAlcohol", "status", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectOptions.alcoholStatus.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Remarks</Label>
                <Input
                  value={formData.historyOfAlcohol.remarks}
                  onChange={(e) =>
                    updateNested("historyOfAlcohol", "remarks", e.target.value)
                  }
                />
              </div>
            </div>

            {/* ---------- History of Blood Donation ---------- */}
            <div className="space-y-2">
              <Label>History of Blood Donation</Label>
              <Select
                value={formData.historyOfBloodDonation.status}
                onValueChange={(v) =>
                  updateNested("historyOfBloodDonation", "status", v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.yesNo.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {formData.historyOfBloodDonation.status === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label>Date of Last Blood Donation</Label>
                    <Input
                      type="date"
                      max={formData.screeningDate || today}
                      value={formData.historyOfBloodDonation.lastDonationDate}
                      onChange={(e) =>
                        updateNested(
                          "historyOfBloodDonation",
                          "lastDonationDate",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Amount of Blood (ml)</Label>
                    <Input
                      type="number"
                      value={formData.historyOfBloodDonation.amount}
                      onChange={(e) =>
                        updateNested(
                          "historyOfBloodDonation",
                          "amount",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ---------- History of Clinical Study ---------- */}
            <div className="space-y-2">
              <Label>History of Clinical Research Study Participation</Label>
              <Select
                value={formData.historyOfClinicalStudy.status}
                onValueChange={(v) =>
                  updateNested("historyOfClinicalStudy", "status", v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.yesNo.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {formData.historyOfClinicalStudy.status === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label>Date of Last Participation</Label>
                    <Input
                      type="date"
                      max={formData.screeningDate || today}
                      value={
                        formData.historyOfClinicalStudy.lastParticipationDate
                      }
                      onChange={(e) =>
                        updateNested(
                          "historyOfClinicalStudy",
                          "lastParticipationDate",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Participated Organization</Label>
                    <Input
                      value={formData.historyOfClinicalStudy.organization}
                      onChange={(e) =>
                        updateNested(
                          "historyOfClinicalStudy",
                          "organization",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Remarks</Label>
                    <Input
                      value={formData.historyOfClinicalStudy.remarks}
                      onChange={(e) =>
                        updateNested(
                          "historyOfClinicalStudy",
                          "remarks",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ---------- Recorded By ---------- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Recorded by (Initials) *</Label>
                <Input
                  value={formData.recordedBy.initials}
                  onChange={(e) =>
                    updateNested("recordedBy", "initials", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  max={today}
                  value={formData.recordedBy.date}
                  onChange={(e) =>
                    updateNested("recordedBy", "date", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={formData.recordedBy.time}
                  onChange={(e) =>
                    updateNested("recordedBy", "time", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </PrintableForm>

      {/* Navigation bar */}
      <div className="no-print">
        <FormNavigation
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          isLastForm={isLastForm}
          onPrevious={goPrevious}
          onNext={goNext}
          onSaveLocal={handleSaveLocal}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default DemographicDetailsPage;
