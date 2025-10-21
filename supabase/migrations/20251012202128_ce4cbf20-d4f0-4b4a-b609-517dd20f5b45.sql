-- Add qr_code column to advocate_employees table
ALTER TABLE public.advocate_employees 
ADD COLUMN qr_code text;