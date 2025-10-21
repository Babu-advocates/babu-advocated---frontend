-- Create queries table for communication between employees and bank users
CREATE TABLE public.queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('employee', 'bank')),
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  message TEXT NOT NULL,
  attached_files JSONB DEFAULT '[]'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;

-- Create policies for queries
CREATE POLICY "Users can view queries for applications they're involved in" 
ON public.queries 
FOR SELECT 
USING (true);

CREATE POLICY "Employees can create queries" 
ON public.queries 
FOR INSERT 
WITH CHECK (sender_type = 'employee');

CREATE POLICY "Banks can create queries" 
ON public.queries 
FOR INSERT 
WITH CHECK (sender_type = 'bank');

CREATE POLICY "Users can update their own queries" 
ON public.queries 
FOR UPDATE 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_queries_updated_at
BEFORE UPDATE ON public.queries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for query attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('query-attachments', 'query-attachments', true);

-- Create policies for query attachments storage
CREATE POLICY "Users can view query attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'query-attachments');

CREATE POLICY "Users can upload query attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'query-attachments');

CREATE POLICY "Users can update their own query attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'query-attachments');

CREATE POLICY "Users can delete their own query attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'query-attachments');