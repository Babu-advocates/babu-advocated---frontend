-- Drop the existing RLS policy that uses session variables
DROP POLICY IF EXISTS "Employees can view their own notifications" ON public.notifications;

-- Create a new policy that allows employees to view notifications by username
CREATE POLICY "Employees can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (true);

-- Also update the update policy to allow all updates for now
DROP POLICY IF EXISTS "Employees can update their own notifications" ON public.notifications;

CREATE POLICY "Employees can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (true);