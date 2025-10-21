-- Drop the trigger first, then the function, then recreate both with the correct search path
DROP TRIGGER IF EXISTS trigger_legal_opinion_notification ON public.applications;
DROP FUNCTION IF EXISTS public.notify_legal_opinion_received() CASCADE;

-- Create function with secure search path
CREATE OR REPLACE FUNCTION public.notify_legal_opinion_received()
RETURNS TRIGGER AS $$
DECLARE
  bank_username text;
BEGIN
  -- Check if opinion_files were added (not empty)
  IF NEW.opinion_files IS NOT NULL AND jsonb_array_length(NEW.opinion_files) > 0 
     AND (OLD.opinion_files IS NULL OR jsonb_array_length(OLD.opinion_files) = 0) THEN
    
    -- Get the bank username who submitted the application
    SELECT submitted_by INTO bank_username FROM applications WHERE id = NEW.id;
    
    -- Insert notification for legal opinion received
    INSERT INTO public.notifications (
      type,
      employee_username,
      employee_email,
      application_id,
      message,
      is_read,
      created_at
    ) VALUES (
      'legal_opinion_received',
      COALESCE(bank_username, 'unknown'),
      '',
      NEW.application_id,
      'Legal opinion has been submitted for application ' || NEW.application_id,
      false,
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER trigger_legal_opinion_notification
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_legal_opinion_received();