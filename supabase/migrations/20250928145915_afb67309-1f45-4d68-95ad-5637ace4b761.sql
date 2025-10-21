-- Add new status values for redirected applications
-- We need to track the redirect information in the applications table

-- Add columns to track the original assignee and redirect information
ALTER TABLE public.applications 
ADD COLUMN original_assigned_to uuid,
ADD COLUMN original_assigned_to_username text,
ADD COLUMN redirect_reason text;

-- Update existing applications to set original assignee
UPDATE public.applications 
SET original_assigned_to = assigned_to,
    original_assigned_to_username = assigned_to_username
WHERE assigned_to IS NOT NULL;