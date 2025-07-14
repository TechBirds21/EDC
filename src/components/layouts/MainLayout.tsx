
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
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className="flex-1 flex flex-col">
        <Header />
        {volunteerData && (
          <div className="px-6 pt-4">
            <VolunteerInfo 
              volunteerId={volunteerData.volunteerId}
              studyNumber={volunteerData.studyNumber}
            />
          </div>
        )}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
