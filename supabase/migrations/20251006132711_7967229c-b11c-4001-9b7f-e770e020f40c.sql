-- Add UPDATE policy for litigation accounts (allow public update)
CREATE POLICY "Allow public to update litigation accounts"
ON public.litigation_accounts
FOR UPDATE
USING (true);

-- Add DELETE policy for litigation accounts (allow public delete)
CREATE POLICY "Allow public to delete litigation accounts"
ON public.litigation_accounts
FOR DELETE
USING (true);