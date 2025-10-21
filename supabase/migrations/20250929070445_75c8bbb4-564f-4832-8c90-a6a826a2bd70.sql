-- Add missing columns to applications table for better data structure
ALTER TABLE public.applications 
ADD COLUMN district text,
ADD COLUMN taluk text,
ADD COLUMN village text,
ADD COLUMN nature_of_property text,
ADD COLUMN location_of_property text,
ADD COLUMN survey_number text,
ADD COLUMN extent_of_property text,
ADD COLUMN plot_no text,
ADD COLUMN layout_name text,
ADD COLUMN bank_application_no text,
ADD COLUMN salesman_name text,
ADD COLUMN salesman_contact text,
ADD COLUMN salesman_email text,
ADD COLUMN account_number text;