
import { useState, useEffect } from 'react';
import { pythonApi } from '@/services/api';

interface Margins {
  top: string;
  bottom: string;
  left: string;
  right: string;
}

interface PrintSettings {
  id: string;
  template_name: string;
  page_size: string;
  margins: Margins;
  font_size: string;
  line_height: string;
}

export const usePrintSettings = (templateName: string) => {
  const [settings, setSettings] = useState<PrintSettings>({
    id: '',
    template_name: templateName,
    page_size: 'A4',
    margins: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
    font_size: '12px',
    line_height: '1.4'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrintSettings();
  }, [templateName]);

  const loadPrintSettings = async () => {
    try {
      // Load from Python API
      const result = await pythonApi.fetchWithAuth(`/print-settings?template_name=${templateName}`);

      if (result && result.data) {
        const data = result.data;
        // Ensure margins is properly parsed
        let margins: Margins = { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' };
        
        if (data.margins) {
          try {
            if (typeof data.margins === 'string') {
              margins = JSON.parse(data.margins);
            } else if (typeof data.margins === 'object' && data.margins !== null && !Array.isArray(data.margins)) {
              margins = data.margins as Margins;
            }
          } catch (e) {
            console.error('Error parsing margins:', e);
          }
        }
        
        setSettings({
          id: data.id,
          template_name: data.template_name,
          page_size: data.page_size || 'A4',
          margins,
          font_size: data.font_size || '12px',
          line_height: data.line_height || '1.4'
        });
      } else {
        // Use default settings if none found
        setSettings({
          id: '',
          template_name: templateName,
          page_size: 'A4',
          margins: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
          font_size: '12px',
          line_height: '1.4'
        });
        console.log('Using default print settings for', templateName);
      }
    } catch (error) {
      console.error('Failed to load print settings:', error);
      // Use default settings on error
      setSettings({
        id: '',
        template_name: templateName,
        page_size: 'A4',
        margins: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
        font_size: '12px',
        line_height: '1.4'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePrintSettings = async (updates: Partial<PrintSettings>) => {
    if (!settings.id) {
      // Create new settings if they don't exist
      try {
        const result = await pythonApi.fetchWithAuth('/print-settings', {
          method: 'POST',
          body: JSON.stringify({
            template_name: templateName,
            page_size: updates.page_size,
            margins: updates.margins ? JSON.stringify(updates.margins) : undefined,
            font_size: updates.font_size,
            line_height: updates.line_height
          })
        });
          
        if (result && result.data) {
          const data = result.data;
          // Parse margins from the returned data
          let margins: Margins = { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' };
          if (data.margins) {
            try {
              margins = typeof data.margins === 'string' ? JSON.parse(data.margins) : data.margins as Margins;
            } catch (e) {
              console.error('Error parsing returned margins:', e);
            }
          }
          
          setSettings({
            id: data.id,
            template_name: data.template_name,
            page_size: data.page_size || 'A4',
            margins,
            font_size: data.font_size || '12px',
            line_height: data.line_height || '1.4'
          });
        }
        
        return { error: null };
      } catch (error) {
        console.error('Failed to create print settings:', error);
        return { error };
      }
    }
    
    // Update existing settings
    const updateData: any = {};
    if (updates.page_size) updateData.page_size = updates.page_size;
    if (updates.margins) updateData.margins = JSON.stringify(updates.margins);
    if (updates.font_size) updateData.font_size = updates.font_size;
    if (updates.line_height) updateData.line_height = updates.line_height;

    try {
      await pythonApi.fetchWithAuth(`/print-settings/${settings.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      setSettings(prev => ({ ...prev, ...updates }));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return { settings, loading, updatePrintSettings };
};
