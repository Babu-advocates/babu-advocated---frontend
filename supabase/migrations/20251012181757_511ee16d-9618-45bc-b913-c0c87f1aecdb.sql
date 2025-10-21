-- Create employee salaries table
CREATE TABLE public.employee_salaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  fixed_salary NUMERIC NOT NULL DEFAULT 0,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  actual_salary NUMERIC,
  days_present INTEGER DEFAULT 0,
  days_absent INTEGER DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  bonus NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_date DATE,
  payment_method TEXT,
  transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, month, year)
);

-- Enable Row Level Security
ALTER TABLE public.employee_salaries ENABLE ROW LEVEL SECURITY;

-- Create policies for salary management
CREATE POLICY "Allow admin to view salaries" 
ON public.employee_salaries 
FOR SELECT 
USING (true);

CREATE POLICY "Allow admin to create salaries" 
ON public.employee_salaries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow admin to update salaries" 
ON public.employee_salaries 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow admin to delete salaries" 
ON public.employee_salaries 
FOR DELETE 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_employee_salaries_updated_at
BEFORE UPDATE ON public.employee_salaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add fixed_salary column to advocate_employees table for base salary
ALTER TABLE public.advocate_employees 
ADD COLUMN IF NOT EXISTS fixed_salary NUMERIC DEFAULT 0;

-- Create index for faster queries
CREATE INDEX idx_employee_salaries_employee_id ON public.employee_salaries(employee_id);
CREATE INDEX idx_employee_salaries_month_year ON public.employee_salaries(month, year);