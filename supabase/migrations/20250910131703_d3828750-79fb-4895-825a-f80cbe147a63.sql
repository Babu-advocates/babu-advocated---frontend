-- Update RLS policies for employee accounts to allow admin operations
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

-- Allow inserts for admin operations (will be secured later with proper admin auth)
CREATE POLICY "Allow admin to create employee accounts" 
ON public.employee_accounts 
FOR INSERT 
WITH CHECK (true);

-- Allow updates for admin operations (will be restricted later with proper admin auth)
CREATE POLICY "Allow admin to update employee accounts" 
ON public.employee_accounts 
FOR UPDATE 
USING (true);

-- Enable realtime for employee_accounts table
ALTER TABLE public.employee_accounts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_accounts;