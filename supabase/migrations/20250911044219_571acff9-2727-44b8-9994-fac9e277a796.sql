-- Create RLS policies for application-documents storage bucket
-- Allow public read access to all files in application-documents bucket
CREATE POLICY "Public Access for Application Documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'application-documents');

-- Allow authenticated users to insert files
CREATE POLICY "Allow file uploads to application-documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'application-documents');