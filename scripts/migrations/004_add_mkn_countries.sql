-- ============================================
-- MIGRATION 004: Add all existing countries to MKN workspace
-- Purpose: Allow MKN to use any existing country
-- ============================================

-- Insert all existing countries into workspace_countries for MKN
-- This enables MKN to create accounts for any country that exists
INSERT INTO public.workspace_countries (workspace_id, country_code, active)
SELECT 'mkn'::workspace_app, code, true
FROM public.countries
ON CONFLICT (workspace_id, country_code) DO UPDATE SET active = true;

-- Verify the insertion
SELECT 
  workspace_id, 
  COUNT(*) as country_count 
FROM public.workspace_countries 
GROUP BY workspace_id;

-- ============================================
-- END OF MIGRATION
-- ============================================
