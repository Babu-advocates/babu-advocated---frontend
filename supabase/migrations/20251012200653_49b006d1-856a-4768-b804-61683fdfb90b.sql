-- Drop the existing policy that requires authentication for deletion
DROP POLICY IF EXISTS "Authenticated users can delete excluded dates" ON public.attendance_excluded_dates;

-- Create a new policy that allows anyone to delete
CREATE POLICY "Allow public to delete excluded dates" ON public.attendance_excluded_dates
  FOR DELETE USING (true);