import { useState, useCallback, useMemo } from 'react';

/**
 * Hook to validate dates against a screening date
 * @param screeningDate The screening date to validate against
 * @returns Object with validation functions and min date
 */
export const useValidatedDate = (screeningDate?: string) => {
  // Format the screening date as YYYY-MM-DD for HTML date input
  const minDate = useMemo(() => {
    if (!screeningDate) return '';
    
    try {
      const date = new Date(screeningDate);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Invalid screening date:', error);
      return '';
    }
  }, [screeningDate]);
  
  /**
   * Validate if a date is greater than or equal to the screening date
   * @param dateString The date to validate in YYYY-MM-DD format
   * @returns True if the date is valid, false otherwise
   */
  const isValid = useCallback((dateString: string): boolean => {
    if (!screeningDate || !dateString) return true;
    
    try {
      const date = new Date(dateString);
      const screeningDateObj = new Date(screeningDate);
      
      // Reset time components for accurate date comparison
      date.setHours(0, 0, 0, 0);
      screeningDateObj.setHours(0, 0, 0, 0);
      
      return date >= screeningDateObj;
    } catch (error) {
      console.error('Date validation error:', error);
      return false;
    }
  }, [screeningDate]);
  
  /**
   * Format a date for display
   * @param dateString The date to format in YYYY-MM-DD format
   * @returns Formatted date string
   */
  const formatDate = useCallback((dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  }, []);
  
  return {
    minDate,
    isValid,
    formatDate
  };
};