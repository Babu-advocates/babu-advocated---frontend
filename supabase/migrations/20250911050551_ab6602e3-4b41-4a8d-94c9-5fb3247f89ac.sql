-- Add assignment tracking columns to applications table
ALTER TABLE public.applications 
ADD COLUMN assigned_to uuid REFERENCES public.employee_accounts(id),
ADD COLUMN assigned_to_username text,
ADD COLUMN assigned_at timestamp with time zone;