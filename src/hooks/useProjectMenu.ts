import { useState, useEffect } from 'react';
import { pythonApi } from '@/services/api';

export interface MenuSubsection {
  title: string;
  path: string;
  icon: string;
}

export interface MenuSection {
  title: string;
  icon: string;
  subsections: MenuSubsection[];
}

export type ProjectMenu = MenuSection[];

export const useProjectMenu = (pid: string) => {
  const [menu, setMenu] = useState<ProjectMenu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectMenu();
  }, [pid]);

  const loadProjectMenu = async () => {
    try {
      // Try to load from database first using Python API
      const result = await pythonApi.fetchWithAuth(`/project-menus/${pid}`);
      
      if (result && result.menu_structure) {
        setMenu(result.menu_structure as ProjectMenu);
      } else {
        // Fallback to default menu structure
        setMenu(getDefaultMenu());
      }
    } catch (error) {
      console.error('Failed to load project menu:', error);
      setMenu(getDefaultMenu());
    } finally {
      setLoading(false);
    }
  };

  const updateProjectMenu = async (newMenu: ProjectMenu) => {
    try {
      await pythonApi.fetchWithAuth(`/project-menus/${pid}`, {
        method: 'PUT',
        body: JSON.stringify({
          menu_structure: newMenu,
          updated_at: new Date().toISOString()
        })
      });

      setMenu(newMenu);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const getDefaultMenu = (): ProjectMenu => [
    {
      title: "Volunteer Medical Screening",
      icon: "Users",
      subsections: [
        { title: "Demographic Details", path: "screening/demographics", icon: "FileText" },
        { title: "Medical History", path: "screening/medical-history", icon: "FileText" },
        { title: "Medical Examination", path: "screening/medical-exam", icon: "FileText" },
        { title: "Systemic Examination", path: "screening/systemic-exam", icon: "FileText" },
        { title: "ECG Evaluation", path: "screening/ecg-evaluation", icon: "Heart" },
        { title: "ECG", path: "screening/ecg", icon: "Heart" },
        { title: "X-Ray Evaluation", path: "screening/xray-evaluation", icon: "Activity" },
        { title: "COVID-19 Screening", path: "screening/covid-screening", icon: "Activity" }
      ]
    },
    {
      title: "Pregnancy Tests",
      icon: "Baby",
      subsections: [
        { title: "Screening Pregnancy Test Evaluation", path: "screening/pregnancy-test", icon: "FileSpreadsheet" },
        { title: "Urine Pregnancy Test", path: "screening/urine-pregnancy-test", icon: "FileSpreadsheet" }
      ]
    },
    {
      title: "Laboratory Reports",
      icon: "TestTube",
      subsections: [
        { title: "Clinical Biochemistry 1", path: "lab-report/biochemistry-1", icon: "FileSpreadsheet" },
        { title: "Clinical Biochemistry 2", path: "lab-report/biochemistry-2", icon: "FileSpreadsheet" },
        { title: "Clinical Pathology", path: "lab-report/pathology", icon: "FileSpreadsheet" },
        { title: "Hematology", path: "lab-report/hematology", icon: "FileSpreadsheet" },
        { title: "Immunology/Serology", path: "lab-report/immunology", icon: "FileSpreadsheet" }
      ]
    },
    {
      title: "Study Period",
      icon: "Calendar",
      subsections: [
        { title: "Eligibility Tests for Check-In", path: "study-period/eligibility-tests", icon: "ClipboardCheck" },
        { title: "Depression Scale", path: "study-period/depression-scale", icon: "ClipboardCheck" },
        { title: "Inclusion and Exclusion Criteria", path: "study-period/inclusion-criteria", icon: "ClipboardCheck" },
        { title: "Study Case Report Form", path: "study-period/case-report", icon: "ClipboardCheck" },
        { title: "Subject Check-In Form", path: "study-period/check-in", icon: "ClipboardCheck" },
        { title: "Meal Consumption Form", path: "study-period/meal", icon: "ClipboardCheck" },
        { title: "Subject Vital Signs Form", path: "study-period/vital-signs", icon: "Activity" },
        { title: "Blood Sample Collection Form", path: "study-period/blood-sample", icon: "TestTube" },
        { title: "Pre-dose and Post-dose Restrictions", path: "study-period/restrictions", icon: "ClipboardCheck" },
        { title: "Drug Administration Form", path: "study-period/drug-admin", icon: "ClipboardCheck" },
        { title: "Subject Check-Out Form", path: "study-period/check-out", icon: "ClipboardCheck" },
        { title: "Any Other Information", path: "study-period/other-info", icon: "FileText" }
      ]
    },
    {
      title: "Post Study",
      icon: "FileText",
      subsections: [
        { title: "Safety Evaluation", path: "post-study/safety-evaluation", icon: "ClipboardCheck" },
        { title: "Depression Scale", path: "post-study/depression-scale", icon: "ClipboardCheck" },
        { title: "COVID-19 Screening", path: "post-study/covid-screening", icon: "Activity" },
        { title: "Clinical Biochemistry", path: "post-study/clinical-biochemistry", icon: "TestTube" },
        { title: "Hematology", path: "post-study/hematology", icon: "TestTube" },
        { title: "Adverse Event Recording", path: "post-study/adverse-event", icon: "FileText" },
        { title: "Concomitant Medication", path: "post-study/concomitant-meds", icon: "FileText" },
        { title: "Subject Withdrawal Form", path: "post-study/withdrawal", icon: "FileText" },
        { title: "Subject Dropout Form", path: "post-study/dropout", icon: "FileText" },
        { title: "Repeat Assessment Form", path: "post-study/repeat-assessment", icon: "FileText" },
        { title: "Telephone Notes", path: "post-study/telephone-notes", icon: "FileText" }
      ]
    }
  ];

  return { menu, loading, updateProjectMenu };
};
