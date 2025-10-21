-- Drop the existing policy that requires authentication
DROP POLICY IF EXISTS "Authenticated users can insert excluded dates" ON public.attendance_excluded_dates;

-- Create a new policy that allows anyone to insert
CREATE POLICY "Allow public to insert excluded dates" ON public.attendance_excluded_dates
  FOR INSERT WITH CHECK (true);