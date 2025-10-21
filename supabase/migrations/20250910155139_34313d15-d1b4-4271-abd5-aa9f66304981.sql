-- Fix linter warning: set immutable search_path for the function
CREATE OR REPLACE FUNCTION public.next_application_id(bank text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  seq integer;
  normalized_bank text;
BEGIN
  normalized_bank := lower(regexp_replace(bank, '[^a-z0-9]+', '_', 'g'));
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