-- First, drop existing constraint
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_fit_comercial_check;

-- Normalize any existing values to lowercase
UPDATE accounts 
SET fit_comercial = LOWER(fit_comercial) 
WHERE fit_comercial IS NOT NULL;

-- Now update any values that don't match our expected values
UPDATE accounts 
SET fit_comercial = NULL 
WHERE fit_comercial IS NOT NULL 
  AND fit_comercial NOT IN ('alto', 'medio', 'bajo');

-- Add the new constraint with lowercase values
ALTER TABLE accounts ADD CONSTRAINT accounts_fit_comercial_check 
  CHECK (fit_comercial IS NULL OR fit_comercial IN ('alto', 'medio', 'bajo'));
