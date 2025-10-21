-- Create litigation_access_accounts table
CREATE TABLE public.litigation_access_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.litigation_access_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for litigation_access_accounts
CREATE POLICY "Allow public to read litigation access accounts for login"
ON public.litigation_access_accounts
FOR SELECT
USING (true);

CREATE POLICY "Allow public to insert litigation access accounts"
ON public.litigation_access_accounts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public to update litigation access accounts"
ON public.litigation_access_accounts
FOR UPDATE
USING (true);

CREATE POLICY "Allow public to delete litigation access accounts"
ON public.litigation_access_accounts
FOR DELETE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_litigation_access_accounts_updated_at
BEFORE UPDATE ON public.litigation_access_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();