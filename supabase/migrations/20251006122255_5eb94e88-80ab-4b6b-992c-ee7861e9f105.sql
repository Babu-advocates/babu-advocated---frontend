-- Create litigation_accounts table
CREATE TABLE public.litigation_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  litigation_name text NOT NULL,
  created_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.litigation_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for litigation_accounts
CREATE POLICY "Allow public to read litigation accounts for login"
ON public.litigation_accounts
FOR SELECT
USING (true);

CREATE POLICY "Allow public to insert litigation accounts"
ON public.litigation_accounts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can view litigation accounts"
ON public.litigation_accounts
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create litigation accounts"
ON public.litigation_accounts
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update litigation accounts"
ON public.litigation_accounts
FOR UPDATE
USING (auth.uid() = created_by);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_litigation_accounts_updated_at
BEFORE UPDATE ON public.litigation_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();