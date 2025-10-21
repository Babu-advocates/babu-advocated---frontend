-- Allow public read access to bank_accounts for login validation
CREATE POLICY "Allow public to read bank accounts for login" 
ON public.bank_accounts 
FOR SELECT 
USING (true);