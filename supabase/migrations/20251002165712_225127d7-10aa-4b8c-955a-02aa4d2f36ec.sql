-- Create files table to store file metadata
CREATE TABLE IF NOT EXISTS public.files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  size bigint NOT NULL,
  type text NOT NULL,
  b2_file_id text NOT NULL,
  b2_file_name text NOT NULL,
  download_url text NOT NULL,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Create policies for file access
CREATE POLICY "Anyone can view files" 
ON public.files 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can upload files" 
ON public.files 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own files" 
ON public.files 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_files_updated_at
BEFORE UPDATE ON public.files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();