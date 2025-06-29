import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Save, 
  RefreshCw, 
  Database, 
  Mail, 
  Bell, 
  Lock, 
  FileText 
} from 'lucide-react';
import { toast } from 'sonner';
import RequireRole from '@/components/RequireRole';

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Clinical Capture',
    siteDescription: 'Clinical data collection platform',
    contactEmail: 'admin@clinicalcapture.com',
    defaultLanguage: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  });
  
  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: 'notifications@clinicalcapture.com',
    smtpPassword: '••••••••••••',
    senderName: 'Clinical Capture',
    senderEmail: 'notifications@clinicalcapture.com',
    enableEmailNotifications: true
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    newFormSubmission: true,
    formReviewRequired: true,
    systemUpdates: true,
    userRegistration: true,
    dailySummary: false,
    weeklySummary: true
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '60',
    maxLoginAttempts: '5',
    passwordMinLength: '8',
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    mfaEnabled: false,
    ipRestriction: false,
    allowedIPs: ''
  });
  
  // Backup settings
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionPeriod: '30',
    backupLocation: 'cloud',
    includeAttachments: true
  });
  
  // Form settings
  const [formSettings, setFormSettings] = useState({
    autosaveInterval: '60',
    defaultPaginationSize: '20',
    enableDraftSaving: true,
    requireChangeReason: true,
    trackFieldChanges: true,
    allowFormExport: true,
    defaultFormView: 'card'
  });
  
  const handleSaveSettings = (settingType: string) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success(`${settingType} settings saved successfully`);
    }, 1000);
  };
  
  const handleResetSettings = (settingType: string, defaultSettings: any) => {
    switch (settingType) {
      case 'General':
        setGeneralSettings(defaultSettings);
        break;
      case 'Email':
        setEmailSettings(defaultSettings);
        break;
      case 'Notifications':
        setNotificationSettings(defaultSettings);
        break;
      case 'Security':
        setSecuritySettings(defaultSettings);
        break;
      case 'Backup':
        setBackupSettings(defaultSettings);
        break;
      case 'Forms':
        setFormSettings(defaultSettings);
        break;
    }
    
    toast.info(`${settingType} settings reset to defaults`);
  };
  
  return (
    <RequireRole role="super_admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">Configure global system settings</p>
        </div>
        
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto">
            <TabsTrigger value="general" className="py-2">General</TabsTrigger>
            <TabsTrigger value="email" className="py-2">Email</TabsTrigger>
            <TabsTrigger value="notifications" className="py-2">Notifications</TabsTrigger>
            <TabsTrigger value="security" className="py-2">Security</TabsTrigger>
            <TabsTrigger value="backup" className="py-2">Backup</TabsTrigger>
            <TabsTrigger value="forms" className="py-2">Forms</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic system settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input
                      id="site-name"
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={generalSettings.contactEmail}
                      onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea
                    id="site-description"
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-language">Default Language</Label>
                    <Select 
                      value={generalSettings.defaultLanguage} 
                      onValueChange={(value) => setGeneralSettings({...generalSettings, defaultLanguage: value})}
                    >
                      <SelectTrigger id="default-language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={generalSettings.timezone} 
                      onValueChange={(value) => setGeneralSettings({...generalSettings, timezone: value})}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select 
                      value={generalSettings.dateFormat} 
                      onValueChange={(value) => setGeneralSettings({...generalSettings, dateFormat: value})}
                    >
                      <SelectTrigger id="date-format">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleResetSettings('General', {
                      siteName: 'Clinical Capture',
                      siteDescription: 'Clinical data collection platform',
                      contactEmail: 'admin@clinicalcapture.com',
                      defaultLanguage: 'en',
                      timezone: 'UTC',
                      dateFormat: 'MM/DD/YYYY'
                    })}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('General')}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Configure email server and notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-server">SMTP Server</Label>
                    <Input
                      id="smtp-server"
                      value={emailSettings.smtpServer}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpServer: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input
                      id="smtp-port"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-username">SMTP Username</Label>
                    <Input
                      id="smtp-username"
                      value={emailSettings.smtpUsername}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpUsername: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">SMTP Password</Label>
                    <Input
                      id="smtp-password"
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sender-name">Sender Name</Label>
                    <Input
                      id="sender-name"
                      value={emailSettings.senderName}
                      onChange={(e) => setEmailSettings({...emailSettings, senderName: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sender-email">Sender Email</Label>
                    <Input
                      id="sender-email"
                      type="email"
                      value={emailSettings.senderEmail}
                      onChange={(e) => setEmailSettings({...emailSettings, senderEmail: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-email-notifications"
                    checked={emailSettings.enableEmailNotifications}
                    onCheckedChange={(checked) => setEmailSettings({...emailSettings, enableEmailNotifications: checked})}
                  />
                  <Label htmlFor="enable-email-notifications">Enable Email Notifications</Label>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleResetSettings('Email', {
                      smtpServer: 'smtp.example.com',
                      smtpPort: '587',
                      smtpUsername: 'notifications@clinicalcapture.com',
                      smtpPassword: '••••••••••••',
                      senderName: 'Clinical Capture',
                      senderEmail: 'notifications@clinicalcapture.com',
                      enableEmailNotifications: true
                    })}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('Email')}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure system notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-form-submission">New Form Submission</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when a new form is submitted
                      </p>
                    </div>
                    <Switch
                      id="new-form-submission"
                      checked={notificationSettings.newFormSubmission}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newFormSubmission: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="form-review-required">Form Review Required</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when a form needs review
                      </p>
                    </div>
                    <Switch
                      id="form-review-required"
                      checked={notificationSettings.formReviewRequired}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, formReviewRequired: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="system-updates">System Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify about system updates and maintenance
                      </p>
                    </div>
                    <Switch
                      id="system-updates"
                      checked={notificationSettings.systemUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemUpdates: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="user-registration">User Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when a new user registers
                      </p>
                    </div>
                    <Switch
                      id="user-registration"
                      checked={notificationSettings.userRegistration}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, userRegistration: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="daily-summary">Daily Summary</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a daily summary of activities
                      </p>
                    </div>
                    <Switch
                      id="daily-summary"
                      checked={notificationSettings.dailySummary}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, dailySummary: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-summary">Weekly Summary</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a weekly summary of activities
                      </p>
                    </div>
                    <Switch
                      id="weekly-summary"
                      checked={notificationSettings.weeklySummary}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklySummary: checked})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleResetSettings('Notifications', {
                      newFormSubmission: true,
                      formReviewRequired: true,
                      systemUpdates: true,
                      userRegistration: true,
                      dailySummary: false,
                      weeklySummary: true
                    })}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('Notifications')}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                    <Input
                      id="max-login-attempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password-min-length">Password Min Length</Label>
                    <Input
                      id="password-min-length"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-special-chars"
                      checked={securitySettings.requireSpecialChars}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requireSpecialChars: checked})}
                    />
                    <Label htmlFor="require-special-chars">Require Special Characters</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-numbers"
                      checked={securitySettings.requireNumbers}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requireNumbers: checked})}
                    />
                    <Label htmlFor="require-numbers">Require Numbers</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-uppercase"
                      checked={securitySettings.requireUppercase}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requireUppercase: checked})}
                    />
                    <Label htmlFor="require-uppercase">Require Uppercase Letters</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="mfa-enabled"
                      checked={securitySettings.mfaEnabled}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, mfaEnabled: checked})}
                    />
                    <Label htmlFor="mfa-enabled">Enable Multi-Factor Authentication</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ip-restriction"
                      checked={securitySettings.ipRestriction}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, ipRestriction: checked})}
                    />
                    <Label htmlFor="ip-restriction">Enable IP Restriction</Label>
                  </div>
                </div>
                
                {securitySettings.ipRestriction && (
                  <div className="space-y-2">
                    <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                    <Textarea
                      id="allowed-ips"
                      value={securitySettings.allowedIPs}
                      onChange={(e) => setSecuritySettings({...securitySettings, allowedIPs: e.target.value})}
                      placeholder="Enter IP addresses, one per line"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter IP addresses or CIDR ranges, one per line (e.g., 192.168.1.1 or 192.168.1.0/24)
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleResetSettings('Security', {
                      sessionTimeout: '60',
                      maxLoginAttempts: '5',
                      passwordMinLength: '8',
                      requireSpecialChars: true,
                      requireNumbers: true,
                      requireUppercase: true,
                      mfaEnabled: false,
                      ipRestriction: false,
                      allowedIPs: ''
                    })}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('Security')}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Backup Settings */}
          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle>Backup Settings</CardTitle>
                <CardDescription>
                  Configure database backup settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-backup"
                    checked={backupSettings.autoBackup}
                    onCheckedChange={(checked) => setBackupSettings({...backupSettings, autoBackup: checked})}
                  />
                  <Label htmlFor="auto-backup">Enable Automatic Backups</Label>
                </div>
                
                {backupSettings.autoBackup && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="backup-frequency">Backup Frequency</Label>
                        <Select 
                          value={backupSettings.backupFrequency} 
                          onValueChange={(value) => setBackupSettings({...backupSettings, backupFrequency: value})}
                        >
                          <SelectTrigger id="backup-frequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="backup-time">Backup Time</Label>
                        <Input
                          id="backup-time"
                          type="time"
                          value={backupSettings.backupTime}
                          onChange={(e) => setBackupSettings({...backupSettings, backupTime: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="retention-period">Retention Period (days)</Label>
                        <Input
                          id="retention-period"
                          type="number"
                          value={backupSettings.retentionPeriod}
                          onChange={(e) => setBackupSettings({...backupSettings, retentionPeriod: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="backup-location">Backup Location</Label>
                      <Select 
                        value={backupSettings.backupLocation} 
                        onValueChange={(value) => setBackupSettings({...backupSettings, backupLocation: value})}
                      >
                        <SelectTrigger id="backup-location">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local Storage</SelectItem>
                          <SelectItem value="cloud">Cloud Storage</SelectItem>
                          <SelectItem value="both">Both Local and Cloud</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-attachments"
                        checked={backupSettings.includeAttachments}
                        onCheckedChange={(checked) => setBackupSettings({...backupSettings, includeAttachments: checked})}
                      />
                      <Label htmlFor="include-attachments">Include Attachments in Backup</Label>
                    </div>
                  </div>
                )}
                
                <div className="pt-4">
                  <Button variant="secondary" className="w-full md:w-auto">
                    <Database className="w-4 h-4 mr-2" />
                    Run Manual Backup Now
                  </Button>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleResetSettings('Backup', {
                      autoBackup: true,
                      backupFrequency: 'daily',
                      backupTime: '02:00',
                      retentionPeriod: '30',
                      backupLocation: 'cloud',
                      includeAttachments: true
                    })}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('Backup')}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Form Settings */}
          <TabsContent value="forms">
            <Card>
              <CardHeader>
                <CardTitle>Form Settings</CardTitle>
                <CardDescription>
                  Configure form behavior and display settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="autosave-interval">Autosave Interval (seconds)</Label>
                    <Input
                      id="autosave-interval"
                      type="number"
                      value={formSettings.autosaveInterval}
                      onChange={(e) => setFormSettings({...formSettings, autosaveInterval: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="default-pagination">Default Pagination Size</Label>
                    <Input
                      id="default-pagination"
                      type="number"
                      value={formSettings.defaultPaginationSize}
                      onChange={(e) => setFormSettings({...formSettings, defaultPaginationSize: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-form-view">Default Form View</Label>
                  <Select 
                    value={formSettings.defaultFormView} 
                    onValueChange={(value) => setFormSettings({...formSettings, defaultFormView: value})}
                  >
                    <SelectTrigger id="default-form-view">
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Card View</SelectItem>
                      <SelectItem value="table">Table View</SelectItem>
                      <SelectItem value="list">List View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-draft-saving"
                      checked={formSettings.enableDraftSaving}
                      onCheckedChange={(checked) => setFormSettings({...formSettings, enableDraftSaving: checked})}
                    />
                    <Label htmlFor="enable-draft-saving">Enable Draft Saving</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-change-reason"
                      checked={formSettings.requireChangeReason}
                      onCheckedChange={(checked) => setFormSettings({...formSettings, requireChangeReason: checked})}
                    />
                    <Label htmlFor="require-change-reason">Require Reason for Changes</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="track-field-changes"
                      checked={formSettings.trackFieldChanges}
                      onCheckedChange={(checked) => setFormSettings({...formSettings, trackFieldChanges: checked})}
                    />
                    <Label htmlFor="track-field-changes">Track Field Changes</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allow-form-export"
                      checked={formSettings.allowFormExport}
                      onCheckedChange={(checked) => setFormSettings({...formSettings, allowFormExport: checked})}
                    />
                    <Label htmlFor="allow-form-export">Allow Form Export</Label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleResetSettings('Forms', {
                      autosaveInterval: '60',
                      defaultPaginationSize: '20',
                      enableDraftSaving: true,
                      requireChangeReason: true,
                      trackFieldChanges: true,
                      allowFormExport: true,
                      defaultFormView: 'card'
                    })}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('Forms')}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RequireRole>
  );
};

export default SettingsPage;