-- Create attendance records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_username TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('check-in', 'check-out')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  photo TEXT NOT NULL,
  location TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies for attendance records
CREATE POLICY "Employees can view their own attendance records"
ON public.attendance_records
FOR SELECT
USING (true);

CREATE POLICY "Employees can create attendance records"
ON public.attendance_records
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Employees can update their own attendance records"
ON public.attendance_records
FOR UPDATE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_attendance_records_updated_at
BEFORE UPDATE ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_attendance_records_employee_username ON public.attendance_records(employee_username);
CREATE INDEX idx_attendance_records_date ON public.attendance_records(date);
CREATE INDEX idx_attendance_records_employee_date ON public.attendance_records(employee_username, date);