import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsItem, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { adminApiService } from '@/services/adminApiService';
import { AuditHistory } from '@/components/AuditHistory';

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: any; 
  formatted_details?: string;
  created_at: string | null;
  user_email?: string;
  user_name?: string;
  old_value?: string;
  new_value?: string;
  formatted_date?: string;
  formatted_time?: string;
  profiles?: {
    email: string | null;
  };
}

const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7days');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const { toast } = useToast();

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      
      // Use real API service to get audit logs
      const auditData = await adminApiService.getAuditLogs({
        page: 1,
        size: 100
      });
      
      // Transform API data to match expected format
      const transformedLogs: AuditLog[] = auditData.items?.map(log => ({
        id: log.id,
        action: 'update', // Audit logs are primarily updates
        resource_type: 'form',
        resource_id: log.form_id,
        user_id: log.changed_by,
        ip_address: null,
        user_agent: null,
        details: {
          field: log.field,
          old_value: log.old,
          new_value: log.new,
          reason: log.reason
        },
        formatted_details: `Field: ${log.field} | Reason: ${log.reason}`,
        created_at: log.changed_at,
        user_email: log.changed_by, // In real implementation, this would be resolved from user ID
        user_name: log.changed_by,
        old_value: typeof log.old === 'string' ? log.old : JSON.stringify(log.old),
        new_value: typeof log.new === 'string' ? log.new : JSON.stringify(log.new),
        formatted_date: new Date(log.changed_at).toLocaleDateString(),
        formatted_time: new Date(log.changed_at).toLocaleTimeString(),
        profiles: {
          email: log.changed_by
        }
      })) || [];
      
      setLogs(transformedLogs);
      
    } catch (error) {
      console.error('Error loading audit logs:', error);
      
      // Fallback to mock data if API fails
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          action: 'update',
          resource_type: 'form',
          resource_id: 'form_1',
          user_id: 'user_1',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0...',
          details: {
            field: 'glucose_result',
            old_value: '95',
            new_value: '98',
            reason: 'Correction based on lab review'
          },
          formatted_details: 'Field: glucose_result | Reason: Correction based on lab review',
          created_at: new Date().toISOString(),
          user_email: 'admin@demo.com',
          user_name: 'Admin User',
          old_value: '95',
          new_value: '98',
          formatted_date: new Date().toLocaleDateString(),
          formatted_time: new Date().toLocaleTimeString(),
          profiles: {
            email: 'admin@demo.com'
          }
        }
      ];
      
      setLogs(mockLogs);
      
      toast({
        title: "Warning",
        description: "Using demo audit data - API connection failed",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.old_value?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.new_value?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesResource = resourceFilter === 'all' || log.resource_type === resourceFilter;
    
    return matchesSearch && matchesAction && matchesResource;
  });

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      case 'login':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return 'Unknown';
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  const renderCardView = () => (
    <div className="space-y-4">
      {filteredLogs.map((log) => (
        <div key={log.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <div>
              <Badge variant={getActionBadgeVariant(log.action)}>
                {log.action}
              </Badge>
              <span className="ml-2 font-medium">{log.resource_type}</span>
              {log.resource_id && (
                <span className="text-sm text-muted-foreground ml-2">
                  ID: {log.resource_id}
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDateTime(log.created_at)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <h4 className="text-sm font-semibold mb-1">User Information</h4>
              <p className="text-sm">{log.user_name || log.user_email || 'System'}</p>
              {log.user_email && log.user_email !== log.user_name && (
                <p className="text-xs text-muted-foreground">{log.user_email}</p>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-1">Resource Information</h4>
              <p className="text-sm">Type: {log.resource_type}</p>
              {log.resource_id && (
                <p className="text-sm">ID: {log.resource_id}</p>
              )}
            </div>
          </div>
          
          {log.formatted_details && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Details</h4>
              <pre className="text-xs bg-gray-50 p-3 rounded whitespace-pre-wrap border border-gray-200">
                {log.formatted_details}
              </pre>
            </div>
          )}
        </div>
      ))}
      
      {filteredLogs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No audit logs found matching your criteria.
        </div>
      )}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredLogs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap">
                <Badge variant={getActionBadgeVariant(log.action)}>
                  {log.action}
                </Badge>
              </td>
              <td className="px-4 py-2">
                <div className="text-sm font-medium">{log.resource_type}</div>
                {log.resource_id && (
                  <div className="text-xs text-gray-500">ID: {log.resource_id}</div>
                )}
              </td>
              <td className="px-4 py-2">
                <div className="text-sm">{log.user_name || 'Unknown'}</div>
                <div className="text-xs text-gray-500">{log.user_email}</div>
              </td>
              <td className="px-4 py-2 text-sm">
                {formatDateTime(log.created_at)}
              </td>
              <td className="px-4 py-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Show details in a modal or expand in-place
                    alert(log.formatted_details || 'No details available');
                  }}
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
          
          {filteredLogs.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                No audit logs found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <Button onClick={loadAuditLogs} variant="outline">
          Refresh Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Filters</span>
            <div className="flex items-center space-x-2">
              <Button 
                variant={viewMode === 'card' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('card')}
              >
                Card View
              </Button>
              <Button 
                variant={viewMode === 'table' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table View
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Resource</label>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="form">Form</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Activity Logs ({filteredLogs.length})</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.print()}
              className="print:hidden"
            >
              Print Logs
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium border">Action</th>
                  <th className="px-4 py-2 text-left text-sm font-medium border">Resource</th>
                  <th className="px-4 py-2 text-left text-sm font-medium border">User</th>
                  <th className="px-4 py-2 text-left text-sm font-medium border">Date & Time</th>
                  <th className="px-4 py-2 text-left text-sm font-medium border">Old Value</th>
                  <th className="px-4 py-2 text-left text-sm font-medium border">New Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-2 border">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="font-medium">{log.resource_type}</div>
                      {log.resource_id && (
                        <div className="text-xs text-muted-foreground">
                          ID: {log.resource_id}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 border">
                      {log.user_email || 'System'}
                    </td>
                    <td className="px-4 py-2 border">
                      <div>{log.formatted_date}</div>
                      <div className="text-xs text-muted-foreground">{log.formatted_time}</div>
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="max-w-xs truncate">{log.old_value || '-'}</div>
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="max-w-xs truncate">{log.new_value || '-'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Legacy card view - can be removed if table view is preferred */}
          <div className="space-y-4 hidden">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                    <span className="font-medium">{log.resource_type}</span>
                    {log.resource_id && (
                      <span className="text-sm text-muted-foreground">
                        ID: {log.resource_id}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {log.formatted_date} {log.formatted_time}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">User:</span> {log.user_email || 'System'}
                  </div>
                  
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div>
                      <span className="font-medium">Details:</span>
                      <div className="mt-1 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-medium">Old Value:</span>
                          <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                            {log.old_value || 'N/A'}
                          </pre>
                        </div>
                        <div>
                          <span className="text-xs font-medium">New Value:</span>
                          <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                            {log.new_value || 'N/A'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No audit logs found matching your criteria. Try adjusting your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Print-friendly version */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold mb-4">Audit Logs Report</h1>
        <p className="mb-4">Generated on: {new Date().toLocaleString()}</p>
        
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2 text-left">Action</th>
              <th className="border p-2 text-left">Resource</th>
              <th className="border p-2 text-left">User</th>
              <th className="border p-2 text-left">Date & Time</th>
              <th className="border p-2 text-left">Old Value</th>
              <th className="border p-2 text-left">New Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td className="border p-2">{log.action}</td>
                <td className="border p-2">{log.resource_type} {log.resource_id ? `(${log.resource_id})` : ''}</td>
                <td className="border p-2">{log.user_email || 'System'}</td>
                <td className="border p-2">{log.formatted_date} {log.formatted_time}</td>
                <td className="border p-2">{log.old_value || '-'}</td>
                <td className="border p-2">{log.new_value || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsPage;