-- Migration: Add one_time_payment field for MKN mixed revenue model
-- MKN has both recurring (MRR) and one-time payment model

-- Add one_time_payment column to accounts
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS one_time_payment DECIMAL(12, 2) DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.accounts.one_time_payment IS 'One-time payment amount (for MKN mixed revenue model)';

-- Add one_time_payment column to opportunities
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS one_time_payment DECIMAL(12, 2) DEFAULT NULL;

COMMENT ON COLUMN public.opportunities.one_time_payment IS 'One-time payment amount for this opportunity';
