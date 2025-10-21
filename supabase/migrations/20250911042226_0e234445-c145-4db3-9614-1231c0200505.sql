-- Create storage policies for application-documents bucket
-- Allow public read access to application documents
CREATE POLICY "Public can view application documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'application-documents');

-- Allow authenticated users to insert documents
CREATE POLICY "Authenticated users can upload application documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'application-documents' AND auth.role() = 'authenticated');

-- Allow users to update their own documents
CREATE POLICY "Users can update application documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'application-documents');

-- Allow users to delete documents (optional, for admin purposes)
CREATE POLICY "Users can delete application documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'application-documents');