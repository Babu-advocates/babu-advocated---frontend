-- Add 'waiting_for_approval' to the valid status constraint
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE public.applications ADD CONSTRAINT valid_status 
CHECK (status = ANY (ARRAY['draft'::text, 'to_be_assigned'::text, 'in_review'::text, 'submitted'::text, 'approved'::text, 'rejected'::text, 'completed'::text, 'waiting_for_approval'::text]));