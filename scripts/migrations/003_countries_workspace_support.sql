-- ============================================
-- MIGRATION: Add workspace support for countries via intermediate table
-- Purpose: Allow same country code to be used in different workspaces
-- WITHOUT breaking existing foreign key constraints
-- ============================================

-- 1. Create workspace_countries table to track which countries are enabled per workspace
CREATE TABLE IF NOT EXISTS public.workspace_countries (
  workspace_id workspace_app NOT NULL,
  country_code text NOT NULL REFERENCES public.countries(code) ON DELETE CASCADE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, country_code)
);

-- 2. Migrate existing countries to workspace_countries for 'myworkin' workspace
-- This preserves all existing country activations
INSERT INTO public.workspace_countries (workspace_id, country_code, active)
SELECT 'myworkin'::workspace_app, code, COALESCE(active, true)
FROM public.countries
ON CONFLICT (workspace_id, country_code) DO NOTHING;

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workspace_countries_workspace 
ON public.workspace_countries(workspace_id);

CREATE INDEX IF NOT EXISTS idx_workspace_countries_active 
ON public.workspace_countries(workspace_id, active) WHERE active = true;

-- 4. Grant permissions
GRANT ALL ON public.workspace_countries TO authenticated;
GRANT ALL ON public.workspace_countries TO service_role;

-- ============================================
-- END OF MIGRATION
-- ============================================
