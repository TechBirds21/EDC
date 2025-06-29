
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

const AdminAuditLogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  const auditLogs = [
    {
      id: 'AUD001',
      user: 'John Doe',
      form: 'Demographics',
      field: 'date_of_birth',
      oldValue: '1990-01-01',
      newValue: '1990-01-15',
      reason: 'Correction requested by volunteer',
      timestamp: '2024-01-15 14:30:22'
    },
    {
      id: 'AUD002',
      user: 'Jane Smith',
      form: 'Medical History',
      field: 'allergies',
      oldValue: 'None',
      newValue: 'Penicillin allergy',
      reason: 'Additional information provided',
      timestamp: '2024-01-15 13:15:10'
    },
    {
      id: 'AUD003',
      user: 'Mike Johnson',
      form: 'ECG Evaluation',
      field: 'heart_rate',
      oldValue: '72',
      newValue: '75',
      reason: 'Data entry error correction',
      timestamp: '2024-01-15 11:45:33'
    }
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.form.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = userFilter === 'all' || log.user === userFilter;
    return matchesSearch && matchesUser;
  });

  const uniqueUsers = [...new Set(auditLogs.map(log => log.user))];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground">Track all form field changes and modifications</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search forms, fields, reasons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="user">User</Label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {uniqueUsers.map(user => (
                      <SelectItem key={user} value={user}>{user}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Log Entries ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Old Value</TableHead>
                  <TableHead>New Value</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.user}</TableCell>
                    <TableCell>{log.form}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.field}</Badge>
                    </TableCell>
                    <TableCell className="max-w-32 truncate">{log.oldValue}</TableCell>
                    <TableCell className="max-w-32 truncate">{log.newValue}</TableCell>
                    <TableCell className="max-w-48 truncate">{log.reason}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.timestamp}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminAuditLogPage;
