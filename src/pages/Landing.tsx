
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Database, Wifi, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Landing: React.FC = () => {
  const features = [
    {
      icon: FileText,
      title: 'Dynamic Forms',
      description: 'Create and deploy custom data collection forms instantly'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with audit trails and role-based access'
    },
    {
      icon: Database,
      title: 'Real-time Sync',
      description: 'Automatic data synchronization with comprehensive backup'
    },
    {
      icon: Wifi,
      title: 'Offline Capable',
      description: 'Continue data collection even without internet connectivity'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Multi-role access with admin oversight and review capabilities'
    },
    {
      icon: BarChart3,
      title: 'Analytics Ready',
      description: 'Export and analyze your clinical data with built-in reporting'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">Clinical Capture</span>
            </div>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Professional Clinical
            <span className="clinical-gradient bg-clip-text text-transparent"> Data Capture</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Streamline your clinical research and data collection with our secure, 
            offline-capable platform designed for healthcare professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="clinical-gradient text-white px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need for clinical data collection
            </h2>
            <p className="text-muted-foreground text-lg">
              Built specifically for healthcare environments with enterprise-grade features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="clinical-card">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="clinical-card p-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to modernize your data collection?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join healthcare professionals who trust Clinical Capture for their research needs.
            </p>
            <Link to="/login">
              <Button size="lg" className="clinical-gradient text-white px-8 py-3">
                Start Collecting Data
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Clinical Capture</span>
          </div>
          <p className="text-sm">
            © 2024 Clinical Capture. Secure healthcare data collection platform.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
