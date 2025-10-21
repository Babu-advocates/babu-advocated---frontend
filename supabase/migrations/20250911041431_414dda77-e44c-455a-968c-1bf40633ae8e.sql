-- Create storage bucket for application documents
INSERT INTO storage.buckets (id, name, public) VALUES ('application-documents', 'application-documents', false);

-- Create RLS policies for application documents
CREATE POLICY "Users can view application documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'application-documents');

CREATE POLICY "Users can upload application documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'application-documents');

CREATE POLICY "Users can update application documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'application-documents');

CREATE POLICY "Users can delete application documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'application-documents');