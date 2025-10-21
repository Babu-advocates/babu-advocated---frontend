-- Create storage policies for application-documents bucket (only missing ones)
-- Allow public read access to application documents
CREATE POLICY "Public can view application documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'application-documents');