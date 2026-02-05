-- ============================================
-- Fix: Update accounts type constraint to support MKN industries
-- ============================================
-- Issue: The type column only allowed 'privada' and 'pública' (MyWorkIn types)
-- But MKN workspace uses industry values: tecnologia, finanzas, salud, retail, etc.
-- This was causing: "violates check constraint 'accounts_type_check'" errors on CSV import

-- Step 1: Drop the existing restrictive constraint
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_type_check;

-- Step 2: Add a new constraint that allows both MyWorkIn types AND MKN industries
-- MyWorkIn values: privada, pública
-- MKN values: tecnologia, finanzas, salud, retail, manufactura, servicios, educacion, otro
ALTER TABLE accounts ADD CONSTRAINT accounts_type_check 
  CHECK (type IS NULL OR type IN (
    -- MyWorkIn (university types)
    'privada', 
    'pública',
    -- MKN (industry types)
    'tecnologia',
    'finanzas', 
    'salud',
    'retail',
    'manufactura',
    'servicios',
    'educacion',
    'otro'
  ));
