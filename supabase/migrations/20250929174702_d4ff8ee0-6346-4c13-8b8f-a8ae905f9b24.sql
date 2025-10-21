-- Create advocate_employees table
CREATE TABLE public.advocate_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  father_husband_name TEXT NOT NULL,
  phone_no TEXT NOT NULL,
  alternate_phone_no TEXT,
  mail_id TEXT NOT NULL,
  gender TEXT NOT NULL,
  dob DATE NOT NULL,
  qualification TEXT NOT NULL,
  address TEXT NOT NULL,
  account_no TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  branch TEXT NOT NULL,
  bank TEXT NOT NULL,
  date_of_joining DATE NOT NULL,
  photo TEXT,
  reference TEXT,
  details TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advocate_employees ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to advocate employees"
ON public.advocate_employees
FOR SELECT
USING (true);

CREATE POLICY "Allow admin to create advocate employees"
ON public.advocate_employees
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow admin to update advocate employees"
ON public.advocate_employees
FOR UPDATE
USING (true);

CREATE POLICY "Allow admin to delete advocate employees"
ON public.advocate_employees
FOR DELETE
USING (true);

-- Create employee counter table
CREATE TABLE public.advocate_employee_counters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  last_sequence INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advocate_employee_counters ENABLE ROW LEVEL SECURITY;

-- Create policies for counter
CREATE POLICY "Allow read access to employee counters"
ON public.advocate_employee_counters
FOR SELECT
USING (true);

CREATE POLICY "Allow insert to employee counters"
ON public.advocate_employee_counters
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update to employee counters"
ON public.advocate_employee_counters
FOR UPDATE
USING (true);

-- Create function to generate employee ID
CREATE OR REPLACE FUNCTION public.next_employee_id()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  seq INTEGER;
BEGIN
  -- Ensure counter exists
  INSERT INTO public.advocate_employee_counters (id)
  SELECT gen_random_uuid()
  WHERE NOT EXISTS (SELECT 1 FROM public.advocate_employee_counters)
  ON CONFLICT DO NOTHING;

  -- Increment counter
  UPDATE public.advocate_employee_counters
  SET last_sequence = last_sequence + 1
  RETURNING last_sequence INTO seq;

  -- Return formatted employee ID (e.g., EMP001, EMP002, etc.)
  RETURN 'EMP' || LPAD(seq::TEXT, 3, '0');
END;
$function$;

-- Create trigger for updated_at
CREATE TRIGGER update_advocate_employees_updated_at
BEFORE UPDATE ON public.advocate_employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();