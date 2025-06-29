
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProjectMenu } from '@/hooks/useProjectMenu';
import DynamicFormRenderer from '@/pages/DynamicFormRenderer';
import UrinePregnancyTestDetailPage from '@/pages/UrinePregnancyTestDetailPage';

interface DynamicRouterProps {
  menu: ProjectMenu;
  projectId: string;
}

export const DynamicRouter: React.FC<DynamicRouterProps> = ({ menu, projectId }) => {
  // Flatten all subsections from menu to create routes
  const allRoutes = menu.flatMap(section => 
    section.subsections.map(subsection => ({
      path: subsection.path,
      title: subsection.title,
      section: section.title
    }))
  );

  return (
    <Routes>
      {/* Special route for the detailed urine pregnancy test */}
      <Route
        path="screening/urine-pregnancy-test"
        element={<UrinePregnancyTestDetailPage />}
      />
      {allRoutes
        .filter(route => route.path !== 'screening/urine-pregnancy-test') // Exclude to avoid duplicate routes
        .map(route => (
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
    </Routes>
  );
};
