/*
  # Improve Audit Logs Display

  1. New Views
    - Create a more user-friendly view for audit logs
    - Include user information, formatted timestamps, and readable data
  2. Functions
    - Add functions to format audit log data for display
*/

-- Create a more user-friendly view for audit logs
CREATE OR REPLACE VIEW audit_logs_view AS
SELECT
  al.id,
  al.action,
  al.resource_type,
  al.resource_id,
  al.details,
  al.created_at,
  p.email as user_email,
  CONCAT(p.first_name, ' ', p.last_name) as user_name,
  al.user_id
FROM
  activity_logs al
LEFT JOIN
  profiles p ON al.user_id = p.id
ORDER BY
  al.created_at DESC;

-- Create function to get formatted audit logs
CREATE OR REPLACE FUNCTION get_formatted_audit_logs(
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0,
  p_action text DEFAULT NULL,
  p_resource_type text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_start_date timestamp with time zone DEFAULT NULL,
  p_end_date timestamp with time zone DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  action text,
  resource_type text,
  resource_id text,
  details jsonb,
  created_at timestamp with time zone,
  user_email text,
  user_name text,
  user_id uuid,
  old_value text,
  new_value text,
  formatted_date text,
  formatted_time text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.action,
    al.resource_type,
    al.resource_id,
    al.details,
    al.created_at,
    al.user_email,
    al.user_name,
    al.user_id,
    CASE 
      WHEN al.details->>'old_value' IS NOT NULL THEN al.details->>'old_value'
      ELSE ''
    END as old_value,
    CASE 
      WHEN al.details->>'new_value' IS NOT NULL THEN al.details->>'new_value'
      ELSE ''
    END as new_value,
    to_char(al.created_at, 'YYYY-MM-DD') as formatted_date,
    to_char(al.created_at, 'HH24:MI:SS') as formatted_time
  FROM
    audit_logs_view al
  WHERE
    (p_action IS NULL OR al.action = p_action) AND
    (p_resource_type IS NULL OR al.resource_type = p_resource_type) AND
    (p_user_id IS NULL OR al.user_id = p_user_id) AND
    (p_start_date IS NULL OR al.created_at >= p_start_date) AND
    (p_end_date IS NULL OR al.created_at <= p_end_date)
  ORDER BY
    al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create function to log audit with better details
CREATE OR REPLACE FUNCTION log_audit_with_details(
  p_action text,
  p_resource_type text,
  p_resource_id text,
  p_old_value jsonb DEFAULT NULL,
  p_new_value jsonb DEFAULT NULL,
  p_reason text DEFAULT NULL,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_details jsonb;
  v_log_id uuid;
BEGIN
  -- Build details JSON
  v_details = jsonb_build_object(
    'timestamp', now(),
    'reason', p_reason
  );
  
  -- Add old and new values if provided
  IF p_old_value IS NOT NULL THEN
    v_details = v_details || jsonb_build_object('old_value', p_old_value);
  END IF;
  
  IF p_new_value IS NOT NULL THEN
    v_details = v_details || jsonb_build_object('new_value', p_new_value);
  END IF;
  
  -- Insert audit log
  INSERT INTO activity_logs (
    action, 
    resource_type, 
    resource_id, 
    details, 
    user_id
  )
  VALUES (
    p_action,
    p_resource_type,
    p_resource_id,
    v_details,
    p_user_id
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;