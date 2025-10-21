-- Create notifications for existing applications that have opinion files but no notifications
INSERT INTO public.notifications (
  type,
  employee_username,
  employee_email,
  application_id,
  message,
  is_read,
  created_at
)
SELECT 
  'legal_opinion_received',
  COALESCE(a.submitted_by, 'unknown'),
  '',
  a.application_id,
  'Legal opinion has been submitted for application ' || a.application_id,
  false,
  now()
FROM applications a
WHERE a.opinion_files IS NOT NULL 
  AND jsonb_array_length(a.opinion_files) > 0
  AND NOT EXISTS (
    SELECT 1 FROM notifications n 
    WHERE n.application_id = a.application_id 
    AND n.type = 'legal_opinion_received'
  );