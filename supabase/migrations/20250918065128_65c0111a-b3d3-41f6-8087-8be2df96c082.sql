-- Enable replica identity for queries table to capture complete row data during updates
ALTER TABLE public.queries REPLICA IDENTITY FULL;

-- Add queries table to the realtime publication to activate real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.queries;