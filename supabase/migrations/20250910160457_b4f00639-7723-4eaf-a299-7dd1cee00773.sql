-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id TEXT NOT NULL UNIQUE,
  bank_name TEXT NOT NULL,
  application_type TEXT NOT NULL,
  submission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Borrower details
  borrower_name TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  loan_type TEXT NOT NULL,
  loan_amount DECIMAL(15,2) NOT NULL,
  sanction_date DATE,
  
  -- Recovery details (optional, only for recovery applications)
  outstanding_amount DECIMAL(15,2),
  due_since DATE,
  recovery_stage TEXT,
  
  -- Additional info
  additional_notes TEXT,
  uploaded_files JSONB DEFAULT '[]'::jsonb,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'draft', -- draft, submitted, in_review, approved, rejected
  submitted_by TEXT, -- bank employee username
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_application_type CHECK (application_type IN ('Loan Legal Opinion', 'Loan Recovery')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected'))
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policies for applications
CREATE POLICY "Banks can view their own applications" 
ON public.applications 
FOR SELECT 
USING (true);

CREATE POLICY "Banks can create applications" 
ON public.applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Banks can update their own applications" 
ON public.applications 
FOR UPDATE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_applications_bank_name ON public.applications(bank_name);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_application_id ON public.applications(application_id);