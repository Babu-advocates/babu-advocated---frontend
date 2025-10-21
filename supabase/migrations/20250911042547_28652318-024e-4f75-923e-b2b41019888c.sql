-- Make the application-documents bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'application-documents';

-- Drop the existing policy since it may not be working with private bucket
DROP POLICY IF EXISTS "Public can view application documents" ON storage.objects;

-- Create a new policy for public bucket access
CREATE POLICY "Allow public access to application documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'application-documents');