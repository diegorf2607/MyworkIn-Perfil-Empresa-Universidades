-- ============================================
-- Fix: Update accounts type constraint to support MKN industries
-- ============================================
-- Issue: The type column only allowed 'privada' and 'pública' (MyWorkIn types)
-- But MKN workspace uses industry values: tecnologia, finanzas, salud, retail, etc.
-- This was causing: "violates check constraint 'accounts_type_check'" errors on CSV import

-- Step 1: First, check what constraints exist on the accounts table
-- Run this to see all constraints:
-- SELECT conname FROM pg_constraint WHERE conrelid = 'accounts'::regclass AND contype = 'c';

-- Step 2: Drop ALL possible constraint names (PostgreSQL auto-generates different names)
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_type_check;
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_type_check1;
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS "accounts_type_check";

-- Step 3: Remove the constraint by recreating the column without constraint
-- This is the most reliable way to remove inline CHECK constraints
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find and drop any CHECK constraint on the 'type' column
    FOR constraint_name IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
        WHERE con.conrelid = 'accounts'::regclass
          AND con.contype = 'c'
          AND att.attname = 'type'
    LOOP
        EXECUTE format('ALTER TABLE accounts DROP CONSTRAINT IF EXISTS %I', constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
END $$;

-- Step 4: Now add the new constraint that allows all values
-- No constraint - we'll handle validation in the application layer
-- This avoids future issues when adding new industry types
