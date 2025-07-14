import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useVolunteer } from '@/context/VolunteerContext';

export interface AuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  reason: string;
  changedAt: string;
  changedBy: string;
  userEmail: string;
}

export interface AuditRecord {
  id: string;
  formId: string;
  formType: string;
  volunteerId: string;
  changes: AuditChange[];
  status: 'draft' | 'submitted' | 'edited';
  createdAt: string;
  updatedAt: string;
}

export function useAuditTrail(formType: string) {
  const { user } = useAuth();
  const { volunteerData } = useVolunteer();
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, { old: unknown; new: unknown }>>({});

  // Get audit trail key for localStorage
  const getAuditKey = useCallback((formId: string) => {
    return `audit_trail_${formId}`;
  }, []);

  // Compare two objects and find differences
  const findChanges = useCallback((oldData: Record<string, unknown>, newData: Record<string, unknown>): Record<string, { old: unknown; new: unknown }> => {
    const changes: Record<string, { old: unknown; new: unknown }> = {};
    
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    
    for (const key of allKeys) {
      const oldValue = oldData[key];
      const newValue = newData[key];
      
      // Deep comparison for nested objects
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    }
    
    return changes;
  }, []);

  // Check if a form has been previously saved (submitted status)
  const isFormSubmitted = useCallback((formId: string): boolean => {
    const auditKey = getAuditKey(formId);
    const auditData = localStorage.getItem(auditKey);
    
    if (auditData) {
      try {
        const audit: AuditRecord = JSON.parse(auditData);
        return audit.status === 'submitted';
      } catch (error) {
        console.error('Error parsing audit data:', error);
      }
    }
    return false;
  }, [getAuditKey]);

  // Validate password (in real implementation, this would call an API)
  const validatePassword = useCallback(async (password: string): Promise<boolean> => {
    // For demo users, accept any non-empty password
    if (user?.id.startsWith('demo-')) {
      return password.length > 0;
    }

    // For real users, you would validate against the backend
    // This is a placeholder - implement actual password validation
    try {
      // const response = await fetch('/api/auth/validate-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ password })
      // });
      // return response.ok;
      
      // For now, just check if password is not empty
      return password.length > 0;
    } catch (error) {
      console.error('Password validation error:', error);
      return false;
    }
  }, [user]);

  // Create or update audit record
  const createAuditRecord = useCallback((
    formId: string,
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
    reason: string
  ): AuditRecord => {
    const auditKey = getAuditKey(formId);
    const now = new Date().toISOString();
    
    // Get existing audit record or create new one
    let auditRecord: AuditRecord;
    const existingAudit = localStorage.getItem(auditKey);
    
    if (existingAudit) {
      try {
        auditRecord = JSON.parse(existingAudit);
      } catch (error) {
        console.error('Error parsing existing audit:', error);
        auditRecord = {
          id: formId,
          formId,
          formType,
          volunteerId: volunteerData?.volunteerId || '',
          changes: [],
          status: 'draft',
          createdAt: now,
          updatedAt: now
        };
      }
    } else {
      auditRecord = {
        id: formId,
        formId,
        formType,
        volunteerId: volunteerData?.volunteerId || '',
        changes: [],
        status: 'draft',
        createdAt: now,
        updatedAt: now
      };
    }

    // Find changes and add to audit record
    const changes = findChanges(oldData, newData);
    
    for (const [field, change] of Object.entries(changes)) {
      const auditChange: AuditChange = {
        field,
        oldValue: change.old,
        newValue: change.new,
        reason,
        changedAt: now,
        changedBy: user?.id || '',
        userEmail: user?.email || ''
      };
      
      auditRecord.changes.push(auditChange);
    }

    auditRecord.updatedAt = now;
    
    // Save to localStorage
    localStorage.setItem(auditKey, JSON.stringify(auditRecord));
    
    return auditRecord;
  }, [formType, volunteerData, user, getAuditKey, findChanges]);

  // Mark form as submitted
  const markFormAsSubmitted = useCallback((formId: string) => {
    const auditKey = getAuditKey(formId);
    const auditData = localStorage.getItem(auditKey);
    
    if (auditData) {
      try {
        const audit: AuditRecord = JSON.parse(auditData);
        audit.status = 'submitted';
        audit.updatedAt = new Date().toISOString();
        localStorage.setItem(auditKey, JSON.stringify(audit));
      } catch (error) {
        console.error('Error updating audit status:', error);
      }
    }
  }, [getAuditKey]);

  // Get audit history for a form
  const getAuditHistory = useCallback((formId: string): AuditRecord | null => {
    const auditKey = getAuditKey(formId);
    const auditData = localStorage.getItem(auditKey);
    
    if (auditData) {
      try {
        return JSON.parse(auditData);
      } catch (error) {
        console.error('Error parsing audit history:', error);
      }
    }
    return null;
  }, [getAuditKey]);

  // Handle edit confirmation
  const handleEditConfirmation = useCallback(async (
    password: string,
    reason: string,
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
    formId: string
  ) => {
    const isValidPassword = await validatePassword(password);
    
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Create audit record
    const auditRecord = createAuditRecord(formId, oldData, newData, reason);
    
    console.log('Audit record created:', auditRecord);
    
    return auditRecord;
  }, [validatePassword, createAuditRecord]);

  // Check if edit requires confirmation
  const requiresEditConfirmation = useCallback((formId: string, oldData: Record<string, unknown>, newData: Record<string, unknown>): boolean => {
    const isSubmitted = isFormSubmitted(formId);
    const hasChanges = Object.keys(findChanges(oldData, newData)).length > 0;
    
    return isSubmitted && hasChanges;
  }, [isFormSubmitted, findChanges]);

  return {
    isAuditDialogOpen,
    setIsAuditDialogOpen,
    pendingChanges,
    setPendingChanges,
    isFormSubmitted,
    handleEditConfirmation,
    requiresEditConfirmation,
    markFormAsSubmitted,
    getAuditHistory,
    createAuditRecord
  };
}

export default useAuditTrail;