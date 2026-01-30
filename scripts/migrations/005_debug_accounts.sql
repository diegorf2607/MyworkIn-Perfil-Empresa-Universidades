-- ============================================
-- DEBUG: Check accounts data
-- ============================================

-- Check total accounts and their workspace_id distribution
SELECT 
  workspace_id, 
  COUNT(*) as total,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as created_last_hour
FROM public.accounts
GROUP BY workspace_id;

-- Check recent accounts (last 10 created)
SELECT id, name, country_code, workspace_id, stage, created_at
FROM public.accounts
ORDER BY created_at DESC
LIMIT 10;

-- Check if there are accounts with NULL workspace_id
SELECT COUNT(*) as null_workspace_count
FROM public.accounts
WHERE workspace_id IS NULL;

-- Check the column type of workspace_id
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'accounts' AND column_name = 'workspace_id';
