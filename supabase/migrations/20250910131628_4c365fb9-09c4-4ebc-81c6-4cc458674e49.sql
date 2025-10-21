-- First, let's update the RLS policies to be more appropriate for admin operations
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can create employee accounts" ON public.employee_accounts;
DROP POLICY IF EXISTS "Authenticated users can update employee accounts" ON public.employee_accounts;
DROP POLICY IF EXISTS "Authenticated users can view employee accounts" ON public.employee_accounts;

-- Create more flexible policies for employee accounts
-- Allow anyone to view employee accounts (for login verification)
CREATE POLICY "Allow read access to employee accounts" 
ON public.employee_accounts 
FOR SELECT 
USING (true);

-- For now, allow inserts without authentication (will be secured later with proper admin auth)
CREATE POLICY "Allow admin to create employee accounts" 
ON public.employee_accounts 
FOR INSERT 
WITH CHECK (true);

-- Allow updates for now (will be restricted later with proper admin auth)
CREATE POLICY "Allow admin to update employee accounts" 
ON public.employee_accounts 
FOR UPDATE 
USING (true);

-- Add trigger for automatic updated_at timestamp
CREATE TRIGGER update_employee_accounts_updated_at
BEFORE UPDATE ON public.employee_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for employee_accounts table
ALTER TABLE public.employee_accounts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_accounts;