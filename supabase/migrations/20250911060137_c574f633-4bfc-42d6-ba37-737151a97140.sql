-- Create storage bucket for opinion documents
INSERT INTO storage.buckets (id, name, public) VALUES ('opinion-documents', 'opinion-documents', true);

-- Create policies for opinion documents bucket
CREATE POLICY "Opinion documents are accessible by authenticated users" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'opinion-documents');

CREATE POLICY "Employees can upload opinion documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'opinion-documents');

CREATE POLICY "Employees can update opinion documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'opinion-documents');

-- Add opinion_files column to applications table
ALTER TABLE public.applications 
ADD COLUMN opinion_files JSONB DEFAULT '[]'::jsonb;