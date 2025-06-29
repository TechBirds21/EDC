import React, { useState } from 'react';
import { useParams, useLocation, Outlet, Link } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  FileText, 
  Heart, 
  Activity, 
  TestTube, 
  Baby, 
  FileSpreadsheet, 
  Calendar, 
  ClipboardCheck,
  User,
  Hash,
  Plus
} from 'lucide-react';
import { useProjectMenu } from '@/hooks/useProjectMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/UserProfile';
import DynamicFormRenderer from '@/pages/DynamicFormRenderer';
import MedicalHistoryPage from '@/pages/MedicalHistoryPage';
import MedicalExaminationPage from '@/pages/MedicalExaminationPage';
import SystemicExaminationPage from '@/pages/SystemicExaminationPage';
import EcgEvaluationPage from '@/pages/EcgEvaluationPage';
import EcgPage from '@/pages/EcgPage';

import XrayEvaluationPage from '@/pages/XrayEvaluationPage';
import UrinePregnancyTestDetailPage from '@/pages/UrinePregnancyTestDetailPage';
import BhcgTestPage from '@/pages/BhcgTestPage';
import EligibilityCheckInTestPage from '@/pages/EligibilityCheckInTestPage';
import DepressionScalePage from '@/pages/DepressionScalePage';
import InclusionCriteriaPage from '@/pages/InclusionCriteriaPage';
import StudyCaseReportPage from '@/pages/StudyCaseReportPage';
import SubjectVitalSignsPage from '@/pages/SubjectVitalSignsPage';
import BloodSampleCollectionPage from '@/pages/BloodSampleCollectionPage';
import PrePostDoseRestrictionsPage from '@/pages/PrePostDoseRestrictionsPage';
import DrugAdministrationPage from '@/pages/DrugAdministrationPage';
import SubjectCheckOutPage from '@/pages/SubjectCheckOutPage';
import AnyOtherInformationPage from '@/pages/AnyOtherInformationPage';
import CovidScreeningPage from '@/pages/CovidScreeningPage';
import ClinicalBiochemistry1Page from '@/pages/ClinicalBiochemistry1Page';
import ClinicalBiochemistry2Page from '@/pages/ClinicalBiochemistry2Page';
import ClinicalPathologyPage from '@/pages/ClinicalPathologyPage';
import HematologyPage from '@/pages/HematologyPage';
import ImmunologyPage from '@/pages/ImmunologyPage';
import SubjectCheckInPage from '@/pages/SubjectCheckInPage';
import MealConsumptionPage from '@/pages/MealConsumptionPage';
import SafetyEvaluationPage from '@/pages/SafetyEvaluationPage';
import PostStudyDepressionScalePage from '@/pages/PostStudyDepressionScalePage';
import PostStudyCovidScreeningPage from '@/pages/PostStudyCovidScreeningPage';
import PostStudyClinicalBiochemistryPage from '@/pages/PostStudyClinicalBiochemistryPage';
import PostStudyHematologyPage from '@/pages/PostStudyHematologyPage';
import AdverseEventPage from '@/pages/AdverseEventPage';
import ConcomitantMedicationPage from '@/pages/ConcomitantMedicationPage';
import SubjectWithdrawalPage from '@/pages/SubjectWithdrawalPage';
import SubjectDropoutPage from '@/pages/SubjectDropoutPage';
import RepeatAssessmentPage from '@/pages/RepeatAssessmentPage';
import TelephoneNotesPage from '@/pages/TelephoneNotesPage';
import ScreeningPregnancyTestEvaluationPage from './ScreeningPregnancyTestEvaluationPage';

const iconMap = {
  Users, FileText, Heart, Activity, TestTube, Baby, FileSpreadsheet, 
  Calendar, ClipboardCheck
};

const ProjectDashboardLayout: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const location = useLocation();
  const { menu, loading } = useProjectMenu(pid!);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Extract participant info from URL params
  const searchParams = new URLSearchParams(location.search);
  const caseId = searchParams.get('case');
  const volunteerId = searchParams.get('volunteerId');
  const studyNumber = searchParams.get('studyNumber');

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(title => title !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  // Create routes from menu
  const allRoutes = menu?.flatMap(section => 
    section.subsections.map(subsection => ({
      path: subsection.path,
      title: subsection.title,
      section: section.title
    }))
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="w-80 bg-slate-900 border-r border-slate-700">
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Project Sidebar */}
      <div className="w-80 bg-slate-900 text-white border-r border-slate-700 flex flex-col no-print">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="space-y-3">
            <div>
              <h2 className="font-semibold text-lg text-white">Clinical Data Collection</h2>
              <p className="text-xs text-slate-400">Project Dashboard</p>
            </div>
            
            {/* Participant Information */}
            {(volunteerId || studyNumber || caseId) && (
              <div className="bg-slate-800 rounded-lg p-3 space-y-2">
                {volunteerId && (
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-400">Volunteer ID:</span>
                    <span className="font-medium text-white">{volunteerId}</span>
                  </div>
                )}
                {studyNumber && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Hash className="w-4 h-4 text-green-400" />
                    <span className="text-slate-400">Study Number:</span>
                    <span className="font-medium text-white">{studyNumber}</span>
                  </div>
                )}
                {caseId && (
                  <div className="flex items-center space-x-2 text-sm">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-400">Case ID:</span>
                    <span className="font-medium text-white">{caseId}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {menu?.map((section) => {
              const IconComponent = iconMap[section.icon as keyof typeof iconMap] || FileText;
              const isExpanded = expandedSections.includes(section.title);
              
              return (
                <div key={section.title}>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 text-white transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5 text-blue-400" />
                      <span className="font-medium text-sm">{section.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-2 ml-6 space-y-1">
                      {section.subsections.map((subsection) => {
                        const SubIconComponent = iconMap[subsection.icon as keyof typeof iconMap] || FileText;
                        const isActive = location.pathname.includes(subsection.path);
                        
                        const linkParams = new URLSearchParams();
                        if (caseId) linkParams.set('case', caseId);
                        if (volunteerId) linkParams.set('volunteerId', volunteerId);
                        if (studyNumber) linkParams.set('studyNumber', studyNumber);
                        
                        return (
                          <Link
                            key={subsection.path}
                            to={`/employee/project/${pid}/${subsection.path}?${linkParams.toString()}`}
                            className={`flex items-center space-x-3 p-2 rounded-md text-sm transition-colors ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <SubIconComponent className="w-4 h-4" />
                            <span>{subsection.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Profile - Compact */}
        <UserProfile compact />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Content Header */}
        <div className="bg-background border-b border-border p-6 no-print">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Clinical Forms</h1>
              <p className="text-muted-foreground">Complete required forms for data collection</p>
            </div>
            {!caseId && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link to={`/employee/project/${pid}/new-claim`}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Claim
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <Routes>
            {/* Specific form routes */}
            <Route path="screening/medical-history" element={<MedicalHistoryPage />} />
            <Route path="screening/medical-exam" element={<MedicalExaminationPage />} />
            <Route path="screening/systemic-exam" element={<SystemicExaminationPage />} />
            <Route path="screening/ecg-evaluation" element={<EcgEvaluationPage />} />
            <Route path="screening/ecg" element={<EcgPage />} />
            <Route path="screening/xray-evaluation" element={<XrayEvaluationPage />} />
            <Route path="screening/covid-screening" element={<CovidScreeningPage />} />
            <Route path="screening/pregnancy-test" element={<ScreeningPregnancyTestEvaluationPage />} />
            <Route path="screening/urine-pregnancy-test" element={<UrinePregnancyTestDetailPage />} />
            <Route path="screening/bhcg-test" element={<BhcgTestPage />} />
            
            {/* Laboratory Reports */}
            <Route path="lab-report/biochemistry-1" element={<ClinicalBiochemistry1Page />} />
            <Route path="lab-report/biochemistry-2" element={<ClinicalBiochemistry2Page />} />
            <Route path="lab-report/pathology" element={<ClinicalPathologyPage />} />
            <Route path="lab-report/hematology" element={<HematologyPage />} />
            <Route path="lab-report/immunology" element={<ImmunologyPage />} />
            
            {/* Study Period */}
            <Route path="study-period/eligibility-tests" element={<EligibilityCheckInTestPage />} />
            <Route path="study-period/depression-scale" element={<DepressionScalePage />} />
            <Route path="study-period/inclusion-criteria" element={<InclusionCriteriaPage />} />
            <Route path="study-period/case-report" element={<StudyCaseReportPage />} />
            <Route path="study-period/check-in" element={<SubjectCheckInPage />} />
            <Route path="study-period/meal" element={<MealConsumptionPage />} />
            <Route path="study-period/vital-signs" element={<SubjectVitalSignsPage />} />
            <Route path="study-period/blood-sample" element={<BloodSampleCollectionPage />} />
            <Route path="study-period/restrictions" element={<PrePostDoseRestrictionsPage />} />
            <Route path="study-period/drug-admin" element={<DrugAdministrationPage />} />
            <Route path="study-period/check-out" element={<SubjectCheckOutPage />} />
            <Route path="study-period/other-info" element={<AnyOtherInformationPage />} />
            
            {/* Post Study */}
            <Route path="post-study/safety-evaluation" element={<SafetyEvaluationPage />} />
            <Route path="post-study/depression-scale" element={<PostStudyDepressionScalePage />} />
            <Route path="post-study/covid-screening" element={<PostStudyCovidScreeningPage />} />
            <Route path="post-study/clinical-biochemistry" element={<PostStudyClinicalBiochemistryPage />} />
            <Route path="post-study/hematology" element={<PostStudyHematologyPage />} />
            <Route path="post-study/adverse-event" element={<AdverseEventPage />} />
            <Route path="post-study/concomitant-meds" element={<ConcomitantMedicationPage />} />
            <Route path="post-study/withdrawal" element={<SubjectWithdrawalPage />} />
            <Route path="post-study/dropout" element={<SubjectDropoutPage />} />
            <Route path="post-study/repeat-assessment" element={<RepeatAssessmentPage />} />
            <Route path="post-study/telephone-notes" element={<TelephoneNotesPage />} />
            
            {/* Dynamic routes from menu */}
            {allRoutes.map(route => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <DynamicFormRenderer 
                    formTitle={route.title}
                    sectionTitle={route.section}
                    formPath={route.path}
                  />
                }
              />
            ))}
            
            {/* Default dashboard route */}
            <Route
              path=""
              element={
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>Welcome to Clinical Data Collection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {volunteerId && studyNumber ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h3 className="font-medium text-green-800">Session Active</h3>
                          <p className="text-green-600">
                            Data collection session for Volunteer {volunteerId}, Study {studyNumber}
                          </p>
                          <p className="text-sm text-green-600 mt-2">
                            Select a form from the sidebar to begin data collection.
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          Create a new claim to begin data collection.
                        </p>
                      )}
                      
                      {!caseId && !volunteerId && (
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Link to={`/employee/project/${pid}/new-claim`}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Claim
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboardLayout;
