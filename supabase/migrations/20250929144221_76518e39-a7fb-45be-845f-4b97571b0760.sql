-- Allow new application types used by the UI and keep backward-compatibility
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS valid_application_type;

ALTER TABLE public.applications ADD CONSTRAINT valid_application_type 
CHECK (
  application_type = ANY (
    ARRAY[
      'legal opinion'::text,
      'vetting report'::text,
      'supplementary opinion'::text,
      'MODT'::text,
      -- Backward-compatible values from earlier schema
      'Loan Legal Opinion'::text,
      'Loan Recovery'::text
    ]
  )
);
