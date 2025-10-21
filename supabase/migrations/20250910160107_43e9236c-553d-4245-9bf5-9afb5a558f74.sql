-- Fix the application ID generation function to handle uppercase letters correctly
CREATE OR REPLACE FUNCTION public.next_application_id(bank text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  seq integer;
  normalized_bank text;
BEGIN
  -- Convert to lowercase first, then normalize
  normalized_bank := lower(bank);
  normalized_bank := regexp_replace(normalized_bank, '[^a-z0-9]+', '_', 'g');
  normalized_bank := regexp_replace(normalized_bank, '_+', '_', 'g');
  normalized_bank := trim(both '_' from normalized_bank);

  IF normalized_bank IS NULL OR length(normalized_bank) = 0 THEN
    RAISE EXCEPTION 'Invalid bank name';
  END IF;

  INSERT INTO public.bank_application_counters (bank_name)
  VALUES (normalized_bank)
  ON CONFLICT (bank_name) DO NOTHING;

  UPDATE public.bank_application_counters
  SET last_sequence = last_sequence + 1
  WHERE bank_name = normalized_bank
  RETURNING last_sequence INTO seq;

  RETURN normalized_bank || '_' || seq;
END;
$$;