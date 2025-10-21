-- Fix the next_employee_id function to include WHERE clause
CREATE OR REPLACE FUNCTION public.next_employee_id()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  seq INTEGER;
  counter_id UUID;
BEGIN
  -- Ensure counter exists and get its ID
  INSERT INTO public.advocate_employee_counters (id)
  SELECT gen_random_uuid()
  WHERE NOT EXISTS (SELECT 1 FROM public.advocate_employee_counters)
  ON CONFLICT DO NOTHING
  RETURNING id INTO counter_id;
  
  -- If no ID was returned from INSERT, get the existing one
  IF counter_id IS NULL THEN
    SELECT id INTO counter_id 
    FROM public.advocate_employee_counters 
    LIMIT 1;
  END IF;

  -- Increment counter with WHERE clause
  UPDATE public.advocate_employee_counters
  SET last_sequence = last_sequence + 1
  WHERE id = counter_id
  RETURNING last_sequence INTO seq;

  -- Return formatted employee ID (e.g., EMP001, EMP002, etc.)
  RETURN 'EMP' || LPAD(seq::TEXT, 3, '0');
END;
$function$;