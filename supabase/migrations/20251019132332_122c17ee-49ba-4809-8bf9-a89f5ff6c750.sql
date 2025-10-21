-- Create table for password reset OTPs
CREATE TABLE IF NOT EXISTS public.password_reset_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_used BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow insert for password reset OTPs"
  ON public.password_reset_otps
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow read for password reset OTPs"
  ON public.password_reset_otps
  FOR SELECT
  USING (true);

CREATE POLICY "Allow update for password reset OTPs"
  ON public.password_reset_otps
  FOR UPDATE
  USING (true);

-- Add index for faster lookups
CREATE INDEX idx_password_reset_otps_email ON public.password_reset_otps(email);
CREATE INDEX idx_password_reset_otps_expires_at ON public.password_reset_otps(expires_at);