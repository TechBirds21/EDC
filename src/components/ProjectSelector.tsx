
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderOpen, User, Hash } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: string;
  description: string;
}

interface ProjectSelectorProps {
  projects: Project[];
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [volunteerId, setVolunteerId] = useState<string>('');
  const [studyNumber, setStudyNumber] = useState<string>('');

  const canProceed = selectedProject && volunteerId && studyNumber;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Project Selection</h1>
        <p className="text-muted-foreground">Select a project and enter participant details to begin data collection.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Projects</h2>
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className={`cursor-pointer transition-all ${
                  selectedProject === project.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedProject(project.id)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <div className="status-active mt-1">
                        {project.status}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Participant Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Participant Details</h2>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="volunteer-id" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Volunteer ID</span>
                </Label>
                <Input
                  id="volunteer-id"
                  value={volunteerId}
                  onChange={(e) => setVolunteerId(e.target.value)}
                  placeholder="Enter volunteer ID"
                  disabled={!selectedProject}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="study-number" className="flex items-center space-x-2">
                  <Hash className="w-4 h-4" />
                  <span>Study Number</span>
                </Label>
                <Input
                  id="study-number"
                  value={studyNumber}
                  onChange={(e) => setStudyNumber(e.target.value)}
                  placeholder="Enter study number"
                  disabled={!selectedProject}
                />
              </div>

              {canProceed && (
                <div className="pt-4">
                  <Button asChild className="w-full clinical-gradient text-white">
                    <Link 
                      to={`/employee/project/${selectedProject}?volunteerId=${volunteerId}&studyNumber=${studyNumber}`}
                    >
                      Start Data Collection
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedProject && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              <p><strong>Selected Project:</strong> {projects.find(p => p.id === selectedProject)?.name}</p>
              {volunteerId && <p><strong>Volunteer ID:</strong> {volunteerId}</p>}
              {studyNumber && <p><strong>Study Number:</strong> {studyNumber}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
