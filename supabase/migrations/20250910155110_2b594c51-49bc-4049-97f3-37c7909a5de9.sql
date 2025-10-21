-- Create counters table for per-bank application ID sequences
CREATE TABLE IF NOT EXISTS public.bank_application_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text UNIQUE NOT NULL,
  last_sequence integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bank_application_counters ENABLE ROW LEVEL SECURITY;

-- Simple permissive policies (until auth is added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'bank_application_counters' AND policyname = 'Allow read access to counters'
  ) THEN
    CREATE POLICY "Allow read access to counters"
    ON public.bank_application_counters
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'bank_application_counters' AND policyname = 'Allow insert to counters'
  ) THEN
    CREATE POLICY "Allow insert to counters"
    ON public.bank_application_counters
    FOR INSERT
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'bank_application_counters' AND policyname = 'Allow update to counters'
  ) THEN
    CREATE POLICY "Allow update to counters"
    ON public.bank_application_counters
    FOR UPDATE
    USING (true);
  END IF;
END $$;

-- Trigger to maintain updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_bank_application_counters_updated_at'
  ) THEN
    CREATE TRIGGER update_bank_application_counters_updated_at
    BEFORE UPDATE ON public.bank_application_counters
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- RPC function to atomically get next application id like "sbi_1"
CREATE OR REPLACE FUNCTION public.next_application_id(bank text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  seq integer;
  normalized_bank text;
BEGIN
  -- normalize: lowercase, replace non-alphanumerics with underscores, collapse repeats
  normalized_bank := lower(regexp_replace(bank, '[^a-z0-9]+', '_', 'g'));
  normalized_bank := regexp_replace(normalized_bank, '_+', '_', 'g');
  normalized_bank := trim(both '_' from normalized_bank);

  IF normalized_bank IS NULL OR length(normalized_bank) = 0 THEN
    RAISE EXCEPTION 'Invalid bank name';
  END IF;

  -- ensure row exists
  INSERT INTO public.bank_application_counters (bank_name)
  VALUES (normalized_bank)
  ON CONFLICT (bank_name) DO NOTHING;

  -- atomically increment and return
  UPDATE public.bank_application_counters
  SET last_sequence = last_sequence + 1
  WHERE bank_name = normalized_bank
  RETURNING last_sequence INTO seq;

  RETURN normalized_bank || '_' || seq;
END;
$$;