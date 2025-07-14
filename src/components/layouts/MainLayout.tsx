
import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { VolunteerInfo } from '@/components/VolunteerInfo';
import { useVolunteer } from '@/context/VolunteerContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { volunteerData } = useVolunteer();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex w-full">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className="flex-1 flex flex-col">
        <Header />
        {volunteerData && (
          <div className="px-6 pt-4">
            <div className="medical-gradient rounded-lg">
              <VolunteerInfo 
                volunteerId={volunteerData.volunteerId}
                studyNumber={volunteerData.studyNumber}
              />
            </div>
          </div>
        )}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
