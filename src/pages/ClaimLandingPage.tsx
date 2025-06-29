
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, FolderOpen } from 'lucide-react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ClaimLandingPage: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Claim Management</h1>
          <p className="text-muted-foreground">Choose how you'd like to proceed with claim data collection.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <Card className="clinical-card hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                <Plus className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-xl">New Claim</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Start a new claim by entering volunteer and study information.
              </p>
              <Button asChild className="w-full clinical-gradient text-white">
                <Link to={`/employee/project/${pid}/new-claim`}>
                  Create New Claim
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="clinical-card hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <FolderOpen className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Existing Claim</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Continue working on existing claims or review completed forms.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to={`/employee/project/${pid}/dashboard`}>
                  Open Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ClaimLandingPage;
