
import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ProjectSelector } from '@/components/ProjectSelector';

const EmployeeProjectsPage: React.FC = () => {
  // Mock data - replace with real Supabase query
  const projects = [
    { 
      id: 'clains-project-1', 
      name: 'Clains Clinical Study', 
      status: 'active', 
      description: 'Multi-phase clinical trial for new pharmaceutical research'
    },
    { 
      id: 'project-2', 
      name: 'Cardiology Research Study', 
      status: 'active', 
      description: 'Heart disease prevention and treatment analysis'
    }
  ];

  return (
    <MainLayout>
      <ProjectSelector projects={projects} />
    </MainLayout>
  );
};

export default EmployeeProjectsPage;
