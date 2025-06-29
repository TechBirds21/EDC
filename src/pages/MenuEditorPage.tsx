
import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MenuEditorPage: React.FC = () => {
  const [menuJson, setMenuJson] = useState('');
  const [isValidJson, setIsValidJson] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load current menu JSON - mock implementation
    const mockMenuJson = JSON.stringify([
      {
        "title": "Volunteer Medical Screening",
        "icon": "Users",
        "subsections": [
          { "title": "Demographic Details", "path": "screening/demographics", "icon": "FileText" },
          { "title": "Medical History", "path": "screening/medical-history", "icon": "FileText" }
        ]
      }
    ], null, 2);
    
    setMenuJson(mockMenuJson);
  }, []);

  const validateJson = (jsonString: string) => {
    try {
      JSON.parse(jsonString);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  };

  const handleJsonChange = (value: string) => {
    setMenuJson(value);
    validateJson(value);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!isValidJson) return;

    setSaving(true);
    try {
      // TODO: Implement Supabase update
      console.log('Saving menu JSON:', JSON.parse(menuJson));
      
      // Mock save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save menu:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu Editor</h1>
          <p className="text-muted-foreground">
            Edit the project menu structure. Changes will be reflected immediately for all employees.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* JSON Editor */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Menu JSON
                {!isValidJson && (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
                {saveSuccess && (
                  <CheckCircle className="w-5 h-5 text-accent" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={menuJson}
                onChange={(e) => handleJsonChange(e.target.value)}
                className={`font-mono text-sm min-h-96 ${
                  !isValidJson ? 'border-destructive' : ''
                }`}
                placeholder="Enter menu JSON structure..."
              />
              
              {!isValidJson && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Invalid JSON format. Please check your syntax.
                  </AlertDescription>
                </Alert>
              )}

              {saveSuccess && (
                <Alert className="border-accent">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <AlertDescription>
                    Menu updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSave}
                disabled={!isValidJson || saving}
                className="w-full clinical-gradient text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Menu'}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle>Menu Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                This shows how the menu will appear in the project dashboard:
              </div>
              
              {isValidJson ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {(() => {
                    try {
                      const parsed = JSON.parse(menuJson);
                      return parsed.map((section: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="font-medium text-sm mb-2">
                            📁 {section.title}
                          </div>
                          <div className="ml-4 space-y-1">
                            {section.subsections?.map((sub: any, subIndex: number) => (
                              <div key={subIndex} className="text-xs text-muted-foreground">
                                📄 {sub.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    } catch {
                      return <div className="text-destructive text-sm">Invalid JSON</div>;
                    }
                  })()}
                </div>
              ) : (
                <div className="text-destructive text-sm">
                  Fix JSON errors to see preview
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default MenuEditorPage;
