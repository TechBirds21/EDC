@@ .. @@
         .from('patient_forms')
         .select('answers')
         .eq('case_id', caseId)
         .eq('template_name', `Post Study Safety Evaluation Period ${activePeriod}`)
-        .maybeSingle();
+        .maybeSingle();
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: `Post Study Safety Evaluation Period ${activePeriod}`,
          volunteer_id: volunteerId,
          status: "submitted",
          data: formData,
        });
        
        setIsSaved(true);
        toast.success(`Post study safety evaluation for Period ${activePeriod} saved successfully`);
        setLoading(false);
        return;
      } catch (apiError) {
        console.warn('Python API submission failed, falling back to Supabase:', apiError);
      }
      
      // Try Python API first
      try {
        await pythonApi.createForm({
          template_id: `Post Study Safety Evaluation Period ${activePeriod}`,
          volunteer_id: volunteerId,
          status: "submitted",
          data: formData,
        });
        
        setIsSaved(true);
        toast.success(`Post study safety evaluation for Period ${activePeriod} saved successfully`);
        setLoading(false);
        return;
      } catch (apiError) {
        console.warn('Python API submission failed, falling back to Supabase:', apiError);
      }

       if (error) {
         console.error('Error loading data:', error);
         return;
       }