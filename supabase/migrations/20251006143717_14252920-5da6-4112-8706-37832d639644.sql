-- Create litigation_cases table
CREATE TABLE IF NOT EXISTS public.litigation_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('bank', 'private')),
  
  -- Bank-specific fields (for category = 'bank')
  bank_name TEXT,
  branch_name TEXT,
  account_no TEXT,
  borrower_name TEXT,
  co_borrower_name TEXT,
  loan_amount NUMERIC,
  
  -- Private case fields (for category = 'private')
  petitioner_name TEXT,
  petitioner_address TEXT,
  respondent_name TEXT,
  respondent_address TEXT,
  
  -- Common case details
  case_type TEXT NOT NULL,
  court_name TEXT NOT NULL,
  court_district TEXT NOT NULL,
  case_no TEXT NOT NULL,
  filing_date DATE NOT NULL,
  next_hearing_date DATE,
  present_status TEXT,
  
  -- Advocate fees
  total_advocate_fees NUMERIC,
  initial_fees NUMERIC,
  initial_fees_received_on DATE,
  final_fees NUMERIC,
  final_fees_received_on DATE,
  judgement_date DATE,
  
  -- Additional info
  details TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Closed', 'Completed', 'In Progress', 'Legal Notice Sent', 'Settlement Negotiation', 'Defaulted')),
  
  -- Tracking
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.litigation_cases ENABLE ROW LEVEL SECURITY;

-- Create policies for litigation cases
CREATE POLICY "Anyone can view litigation cases"
ON public.litigation_cases
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create litigation cases"
ON public.litigation_cases
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update litigation cases"
ON public.litigation_cases
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete litigation cases"
ON public.litigation_cases
FOR DELETE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_litigation_cases_updated_at
BEFORE UPDATE ON public.litigation_cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_litigation_cases_status ON public.litigation_cases(status);
CREATE INDEX idx_litigation_cases_category ON public.litigation_cases(category);
CREATE INDEX idx_litigation_cases_filing_date ON public.litigation_cases(filing_date);
CREATE INDEX idx_litigation_cases_bank_name ON public.litigation_cases(bank_name);
CREATE INDEX idx_litigation_cases_case_no ON public.litigation_cases(case_no);