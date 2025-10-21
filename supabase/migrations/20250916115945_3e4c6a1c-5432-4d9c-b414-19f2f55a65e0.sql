-- Enable real-time updates for applications table
ALTER TABLE public.applications REPLICA IDENTITY FULL;

-- Add applications table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;