import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Printer, Download, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  formatted_details: string;
  created_at: string | null;
  user_email: string;
  user_name: string;
}

const AdminAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const { toast } = useToast();

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      
      // Use the new formatted audit logs function
      const { data, error } = await supabase
        .rpc('get_formatted_audit_logs', {
          action_filter: actionFilter !== 'all' ? actionFilter : null,
          resource_type_filter: resourceFilter !== 'all' ? resourceFilter : null,
          limit_count: 100
        });

      if (error) throw error;

      // Transform data to match AuditLog interface
      const transformedLogs: AuditLog[] = (data || []).map(log => {
        return {
          id: log.id,
          action: log.action,
          resource_type: log.resource_type,
          resource_id: log.resource_id,
          formatted_details: log.formatted_details,
          created_at: log.created_at,
          user_email: log.user_email || 'Unknown User',
          user_name: log.user_name || 'Unknown User'
        };
      });

      setLogs(transformedLogs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
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
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Action', 'Resource Type', 'Resource ID', 'User', 'Date & Time', 'Details'];
    const rows = filteredLogs.map(log => [
      log.action,
      log.resource_type,
      log.resource_id || '',
      log.user_name || log.user_email || 'System',
      formatDateTime(log.created_at),
      log.formatted_details?.replace(/\n/g, ' ') || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground">Track all form field changes and modifications</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={loadAuditLogs}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-2">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by action" />
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
                <Label htmlFor="resource">Resource</Label>
                <Select value={resourceFilter} onValueChange={setResourceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by resource" />
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
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>
              Audit Log Entries ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === 'card' ? renderCardView() : renderTableView()}
          </CardContent>
        </Card>
        
        {/* Print-only view */}
        <div className="hidden print:block mt-8">
          <h1 className="text-2xl font-bold mb-4">Audit Log Report</h1>
          <p className="mb-4">Generated: {new Date().toLocaleString()}</p>
          
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Resource</th>
                <th className="border border-gray-300 px-4 py-2 text-left">User</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Date & Time</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="border border-gray-300 px-4 py-2">{log.action}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {log.resource_type}
                    {log.resource_id && <div className="text-xs">ID: {log.resource_id}</div>}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {log.user_name || log.user_email || 'System'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 whitespace-pre-wrap text-xs">
                    {log.formatted_details || 'No details available'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminAuditLogPage;