-- Update the status check constraint to include the new 'to_be_assigned' status
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS valid_status;

-- Add the updated constraint with all valid status values
ALTER TABLE public.applications 
ADD CONSTRAINT valid_status 
CHECK (status IN ('draft', 'to_be_assigned', 'in_review', 'submitted', 'approved', 'rejected', 'completed'));