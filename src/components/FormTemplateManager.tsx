import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Edit, Trash2, Plus, Save, X, Eye } from 'lucide-react';
import { formTemplateService, FormTemplate } from '@/services/formTemplateService';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  name: string;
}

export const FormTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<FormTemplate>>({
    name: '',
    description: '',
    project_id: 'default',
    client_id: '',
    version: 1,
    json_schema: {},
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    Promise.all([loadTemplates(), loadClients()]);
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await formTemplateService.getTemplates();
      setTemplates(data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading templates:', err);
      setError('Failed to load templates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (err: any) {
      console.error('Error loading clients:', err);
    }
  };

  const saveTemplate = async (template: FormTemplate) => {
    try {
      await formTemplateService.updateTemplate(template.id, {
        name: template.name,
        description: template.description,
        project_id: template.project_id,
        client_id: template.client_id,
        version: template.version,
        json_schema: template.json_schema,
        is_active: template.is_active
      });

      setSuccess('Template saved successfully!');
      setEditingTemplate(null);
      await loadTemplates();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving template:', err);
      setError('Failed to save template: ' + err.message);
    }
  };

  const createTemplate = async () => {
    try {
      if (!newTemplate.name?.trim()) {
        setError('Template name is required');
        return;
      }

      if (!newTemplate.project_id?.trim()) {
        setError('Project ID is required');
        return;
      }

      // Ensure we have all required fields with proper types
      const templateData = {
        name: newTemplate.name,
        description: newTemplate.description || '',
        project_id: newTemplate.project_id,
        client_id: newTemplate.client_id || null,
        version: newTemplate.version || 1,
        json_schema: newTemplate.json_schema || {},
        is_active: newTemplate.is_active !== undefined ? newTemplate.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await formTemplateService.createTemplate(templateData);

      setSuccess('Template created successfully!');
      setNewTemplate({
        name: '',
        description: '',
        project_id: 'default',
        client_id: '',
        version: 1,
        json_schema: {},
        is_active: true
      });
      setIsCreating(false);
      await loadTemplates();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating template:', err);
      setError('Failed to create template: ' + err.message);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template? This will also delete all associated form fields.')) return;

    try {
      await formTemplateService.deleteTemplate(templateId);
      setSuccess('Template deleted successfully!');
      await loadTemplates();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting template:', err);
      setError('Failed to delete template: ' + err.message);
    }
  };

  const viewTemplateFields = async (templateId: string) => {
    try {
      const { template, fields } = await formTemplateService.getTemplateWithFields(templateId);
      console.log('Template:', template);
      console.log('Fields:', fields);
      setSuccess(`Template has ${fields.length} fields. Check console for details.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error loading template fields:', err);
      setError('Failed to load template fields: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Form Templates</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-name">Template Name *</Label>
              <Input
                id="new-name"
                value={newTemplate.name || ''}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                value={newTemplate.description || ''}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                placeholder="Enter template description"
              />
            </div>
            <div>
              <Label htmlFor="new-client">Client</Label>
              <Select 
                value={newTemplate.client_id || ''} 
                onValueChange={(value) => setNewTemplate({...newTemplate, client_id: value === "no-client" ? "" : value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-client">No specific client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-project">Project ID *</Label>
              <Input
                id="new-project"
                value={newTemplate.project_id || ''}
                onChange={(e) => setNewTemplate({...newTemplate, project_id: e.target.value})}
                placeholder="Enter project ID"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={createTemplate}>
                <Save className="w-4 h-4 mr-2" />
                Create
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="p-4">
              {editingTemplate?.id === template.id ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Template Name</Label>
                    <Input
                      id="edit-name"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editingTemplate.description || ''}
                      onChange={(e) => setEditingTemplate({...editingTemplate, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-client">Client</Label>
                    <Select 
                      value={editingTemplate.client_id || ''} 
                      onValueChange={(value) => setEditingTemplate({...editingTemplate, client_id: value === "no-client" ? "" : value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-client">No specific client</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-project">Project ID</Label>
                    <Input
                      id="edit-project"
                      value={editingTemplate.project_id}
                      onChange={(e) => setEditingTemplate({...editingTemplate, project_id: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-version">Version</Label>
                    <Input
                      id="edit-version"
                      type="number"
                      value={editingTemplate.version}
                      onChange={(e) => setEditingTemplate({...editingTemplate, version: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-active"
                      checked={editingTemplate.is_active}
                      onChange={(e) => setEditingTemplate({...editingTemplate, is_active: e.target.checked})}
                    />
                    <Label htmlFor="edit-active">Active</Label>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => saveTemplate(editingTemplate)}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {template.description && `${template.description} • `}
                      Project: {template.project_id} • Version: {template.version}
                      {template.client_id && ` • Client: ${clients.find(c => c.id === template.client_id)?.name || 'Unknown'}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(template.created_at).toLocaleDateString()} • 
                      Status: {template.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => viewTemplateFields(template.id)}
                      title="View template fields"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Fields
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingTemplate(template)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {templates.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No templates found. Create your first template to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};