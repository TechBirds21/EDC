
import React from 'react';
import { usePrintSettings } from '@/hooks/usePrintSettings';

interface PrintableFormProps {
  children: React.ReactNode;
  templateName: string;
  className?: string;
}

export const PrintableForm: React.FC<PrintableFormProps> = ({
  children,
  templateName,
  className = ''
}) => {
  const { settings } = usePrintSettings(templateName);

  // Ensure we always have default styles even if settings is null
  const printStyles = {
    fontSize: settings.font_size,
    lineHeight: settings.line_height,
    fontFamily: 'Arial, sans-serif'
  };

  return (
    <>
      <style>{`
        @media print {
          /* Hide navigation, sidebars, and other non-printable elements */
          .no-print,
          nav,
          .sidebar,
          header,
          footer,
          .main-layout-sidebar,
          .bg-sidebar,
          [data-sidebar],
          .sidebar-trigger,
          .bg-slate-900,
          .sidebar-wrapper {
            display: none !important;
          }
          
          /* Ensure form content is visible */
          .printable-form,
          .printable-form * {
            visibility: visible !important;
          }
          
          /* Reset body and page margins for printing */
          body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: Arial, sans-serif !important;
          }
          
          .printable-form {
            font-size: ${settings?.font_size || '12px'} !important;
            line-height: ${settings?.line_height || '1.4'} !important;
            color: black !important;
            background: white !important;
            margin: 0 !important;
            padding: ${settings?.margins?.top || '1cm'} ${settings?.margins?.right || '1cm'} ${settings?.margins?.bottom || '1cm'} ${settings?.margins?.left || '1cm'} !important;
            max-width: none !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            position: static !important;
            display: block !important;
          }
          
          /* Ensure tables print correctly */
          .printable-form table {
            border-collapse: collapse !important;
            width: 100% !important;
            page-break-inside: auto !important;
          }
          
          .printable-form table, 
          .printable-form th, 
          .printable-form td {
            border: 1px solid black !important;
            padding: 8px !important;
            font-size: inherit !important;
          }
          
          .printable-form thead {
            display: table-header-group !important;
          }
          
          .printable-form tbody {
            display: table-row-group !important;
          }
          
          .printable-form tr {
            page-break-inside: avoid !important;
          }
          
          /* Form input styling for print */
          .printable-form input[type="text"],
          .printable-form input[type="number"],
          .printable-form input[type="date"],
          .printable-form select,
          .printable-form textarea {
            border: none !important;
            border-bottom: 1px solid black !important;
            background: transparent !important;
            padding: 2px 4px !important;
            font-size: inherit !important;
            color: black !important;
          }
          
          /* Radio buttons and checkboxes */
          .printable-form input[type="radio"],
          .printable-form input[type="checkbox"] {
            transform: scale(1.2) !important;
            margin: 0 4px !important;
          }
          
          /* Page settings */
          @page {
            size: ${settings?.page_size || 'A4'};
            margin: ${settings?.margins?.top || '1cm'} ${settings?.margins?.right || '1cm'} ${settings?.margins?.bottom || '1cm'} ${settings?.margins?.left || '1cm'};
          }
          
          /* Ensure form header prints */
          .form-header,
          .common-form-header {
            display: block !important;
            margin-bottom: 20px !important;
          }
        }
      `}</style>
      <div className={`printable-form ${className}`} style={printStyles}>
        {children}
      </div>
    </>
  );
};
