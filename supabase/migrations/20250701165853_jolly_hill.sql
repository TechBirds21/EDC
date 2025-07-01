/*
  # Improve Audit Logs Display

  1. New Views
    - `audit_logs_view` - A view that joins audit logs with user profiles for better display
  
  2. Functions
    - `format_audit_log_details` - Function to format JSON details into readable text
*/

-- Create a view for better audit log display
CREATE OR REPLACE VIEW audit_logs_view AS
SELECT 
  a.id,
  a.action,
  a.resource_type,
  a.resource_id,
  a.details,
  a.created_at,
  p.email as user_email,
  CONCAT(p.first_name, ' ', p.last_name) as user_name,
  p.id as user_id
FROM 
  activity_logs a
LEFT JOIN 
  profiles p ON a.user_id = p.id
ORDER BY 
  a.created_at DESC;

-- Create a function to format audit log details
CREATE OR REPLACE FUNCTION format_audit_log_details(details jsonb)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  result text := '';
  key text;
  value jsonb;
BEGIN
  IF details IS NULL THEN
    RETURN 'No details available';
  END IF;
  
  FOR key, value IN SELECT * FROM jsonb_each(details)
  LOOP
    result := result || key || ': ' || value::text || E'\n';
  END LOOP;
  
  RETURN result;
END;
$$;

-- Create a function to get formatted audit logs
CREATE OR REPLACE FUNCTION get_formatted_audit_logs(
  action_filter text DEFAULT NULL,
  resource_type_filter text DEFAULT NULL,
  limit_count integer DEFAULT 100
)
RETURNS TABLE (
  id text,
  action text,
  resource_type text,
  resource_id text,
  formatted_details text,
  created_at timestamptz,
  user_email text,
  user_name text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id::text,
    action,
    resource_type,
    resource_id,
    format_audit_log_details(details) as formatted_details,
    created_at,
    user_email,
    user_name
  FROM 
    audit_logs_view
  WHERE 
    (action_filter IS NULL OR action = action_filter) AND
    (resource_type_filter IS NULL OR resource_type = resource_type_filter)
  ORDER BY 
    created_at DESC
  LIMIT 
    limit_count;
$$;