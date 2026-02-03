-- Migration: Sync existing MyWorkIn accounts to MKN
-- Only copies accounts that don't already exist in MKN
-- All synced accounts will have stage='lead'

-- Insert MyWorkIn accounts into MKN (only those that don't exist yet)
INSERT INTO public.accounts (
  country_code,
  name,
  city,
  type,
  size,
  website,
  stage,
  fit_comercial,
  workspace_id,
  last_touch,
  created_at
)
SELECT 
  a.country_code,
  a.name,
  a.city,
  a.type,
  a.size,
  a.website,
  'lead'::text as stage,  -- Always lead in MKN
  'medio'::text as fit_comercial,
  'mkn'::workspace_app as workspace_id,
  NOW() as last_touch,
  NOW() as created_at
FROM public.accounts a
WHERE 
  -- Only from MyWorkIn (workspace_id is null or 'myworkin')
  (a.workspace_id IS NULL OR a.workspace_id = 'myworkin')
  -- Don't duplicate if already exists in MKN
  AND NOT EXISTS (
    SELECT 1 FROM public.accounts mkn 
    WHERE mkn.workspace_id = 'mkn' 
    AND mkn.country_code = a.country_code 
    AND LOWER(TRIM(mkn.name)) = LOWER(TRIM(a.name))
  );

-- Show count of synced accounts
DO $$
DECLARE
  synced_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO synced_count 
  FROM public.accounts 
  WHERE workspace_id = 'mkn';
  
  RAISE NOTICE 'Total MKN accounts after sync: %', synced_count;
END $$;
