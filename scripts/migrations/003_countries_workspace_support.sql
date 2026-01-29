-- ============================================
-- MIGRATION: Add workspace_id support to countries table
-- Purpose: Allow same country code in different workspaces
-- ============================================

-- 1. Add workspace_id column to countries table (if not exists)
ALTER TABLE public.countries
ADD COLUMN IF NOT EXISTS workspace_id workspace_app;

-- 2. Set default workspace_id for existing countries without one
UPDATE public.countries 
SET workspace_id = 'myworkin' 
WHERE workspace_id IS NULL;

-- 3. Drop the existing primary key constraint on code (if it's the only PK)
-- First, we need to check if there's a composite key or just code
DO $$
DECLARE
  constraint_name text;
BEGIN
  -- Find the primary key constraint name
  SELECT tc.constraint_name INTO constraint_name
  FROM information_schema.table_constraints tc
  WHERE tc.table_name = 'countries' 
    AND tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public';
  
  IF constraint_name IS NOT NULL THEN
    -- Drop the old primary key
    EXECUTE format('ALTER TABLE public.countries DROP CONSTRAINT %I', constraint_name);
  END IF;
END$$;

-- 4. Add the new composite primary key (code + workspace_id)
ALTER TABLE public.countries
ADD CONSTRAINT countries_pkey PRIMARY KEY (code, workspace_id);

-- 5. Create index for workspace filtering
CREATE INDEX IF NOT EXISTS idx_countries_workspace_id ON public.countries(workspace_id);

-- 6. Create unique index for country code per workspace
CREATE UNIQUE INDEX IF NOT EXISTS idx_countries_code_workspace 
ON public.countries(code, workspace_id);

-- ============================================
-- END OF MIGRATION
-- ============================================
