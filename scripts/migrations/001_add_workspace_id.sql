-- ============================================
-- MIGRATION: Add workspace_id to all core tables
-- Purpose: Enable multi-workspace (MyWorkIn + MKN)
-- ============================================

-- 1. Create workspace_app enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workspace_app') THEN
    CREATE TYPE workspace_app AS ENUM ('myworkin', 'mkn');
  END IF;
END$$;

-- 2. Create workspaces metadata table (optional, for reference)
CREATE TABLE IF NOT EXISTS public.workspaces (
  id workspace_app PRIMARY KEY,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.workspaces (id, display_name)
VALUES ('myworkin', 'MyWorkIn CRM'), ('mkn', 'MKN Technologies')
ON CONFLICT (id) DO NOTHING;

-- 3. Create workspace_memberships table for RLS
CREATE TABLE IF NOT EXISTS public.workspace_memberships (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id workspace_app NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, workspace_id)
);

-- Grant existing users access to both workspaces (for initial migration)
INSERT INTO public.workspace_memberships (user_id, workspace_id, role)
SELECT id, 'myworkin'::workspace_app, 'admin' FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO public.workspace_memberships (user_id, workspace_id, role)
SELECT id, 'mkn'::workspace_app, 'admin' FROM auth.users
ON CONFLICT DO NOTHING;

-- 4. Add workspace_id column to all core tables
-- ACCOUNTS table
ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS workspace_id workspace_app NOT NULL DEFAULT 'myworkin';

UPDATE public.accounts SET workspace_id = 'myworkin' WHERE workspace_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_accounts_workspace_id ON public.accounts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_accounts_ws_country ON public.accounts(workspace_id, country_code);
CREATE INDEX IF NOT EXISTS idx_accounts_ws_stage ON public.accounts(workspace_id, stage);

-- CONTACTS table
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS workspace_id workspace_app NOT NULL DEFAULT 'myworkin';

UPDATE public.contacts SET workspace_id = 'myworkin' WHERE workspace_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_workspace_id ON public.contacts(workspace_id);

-- OPPORTUNITIES table
ALTER TABLE public.opportunities
ADD COLUMN IF NOT EXISTS workspace_id workspace_app NOT NULL DEFAULT 'myworkin';

UPDATE public.opportunities SET workspace_id = 'myworkin' WHERE workspace_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_opportunities_workspace_id ON public.opportunities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_ws_stage ON public.opportunities(workspace_id, stage);

-- MEETINGS table
ALTER TABLE public.meetings
ADD COLUMN IF NOT EXISTS workspace_id workspace_app NOT NULL DEFAULT 'myworkin';

UPDATE public.meetings SET workspace_id = 'myworkin' WHERE workspace_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_meetings_workspace_id ON public.meetings(workspace_id);

-- ACTIVITIES table
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS workspace_id workspace_app NOT NULL DEFAULT 'myworkin';

UPDATE public.activities SET workspace_id = 'myworkin' WHERE workspace_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_activities_workspace_id ON public.activities(workspace_id);

-- TASKS table
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS workspace_id workspace_app NOT NULL DEFAULT 'myworkin';

UPDATE public.tasks SET workspace_id = 'myworkin' WHERE workspace_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_workspace_id ON public.tasks(workspace_id);

-- SCORECARDS table
ALTER TABLE public.scorecards
ADD COLUMN IF NOT EXISTS workspace_id workspace_app NOT NULL DEFAULT 'myworkin';

UPDATE public.scorecards SET workspace_id = 'myworkin' WHERE workspace_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_scorecards_workspace_id ON public.scorecards(workspace_id);

-- KDM_CONTACTS table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kdm_contacts') THEN
    ALTER TABLE public.kdm_contacts
    ADD COLUMN IF NOT EXISTS workspace_id workspace_app NOT NULL DEFAULT 'myworkin';
    
    UPDATE public.kdm_contacts SET workspace_id = 'myworkin' WHERE workspace_id IS NULL;
    
    CREATE INDEX IF NOT EXISTS idx_kdm_contacts_workspace_id ON public.kdm_contacts(workspace_id);
  END IF;
END$$;

-- SEQUENCES table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sequences') THEN
    ALTER TABLE public.sequences
    ADD COLUMN IF NOT EXISTS workspace_id workspace_app NOT NULL DEFAULT 'myworkin';
    
    UPDATE public.sequences SET workspace_id = 'myworkin' WHERE workspace_id IS NULL;
    
    CREATE INDEX IF NOT EXISTS idx_sequences_workspace_id ON public.sequences(workspace_id);
  END IF;
END$$;

-- RESOURCES table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resources') THEN
    ALTER TABLE public.resources
    ADD COLUMN IF NOT EXISTS workspace_id workspace_app NOT NULL DEFAULT 'myworkin';
    
    UPDATE public.resources SET workspace_id = 'myworkin' WHERE workspace_id IS NULL;
    
    CREATE INDEX IF NOT EXISTS idx_resources_workspace_id ON public.resources(workspace_id);
  END IF;
END$$;

-- GLOSSARY_TERMS table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'glossary_terms') THEN
    ALTER TABLE public.glossary_terms
    ADD COLUMN IF NOT EXISTS workspace_id workspace_app NOT NULL DEFAULT 'myworkin';
    
    UPDATE public.glossary_terms SET workspace_id = 'myworkin' WHERE workspace_id IS NULL;
    
    CREATE INDEX IF NOT EXISTS idx_glossary_terms_workspace_id ON public.glossary_terms(workspace_id);
  END IF;
END$$;

-- QUICK_LINKS table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quick_links') THEN
    ALTER TABLE public.quick_links
    ADD COLUMN IF NOT EXISTS workspace_id workspace_app NOT NULL DEFAULT 'myworkin';
    
    UPDATE public.quick_links SET workspace_id = 'myworkin' WHERE workspace_id IS NULL;
    
    CREATE INDEX IF NOT EXISTS idx_quick_links_workspace_id ON public.quick_links(workspace_id);
  END IF;
END$$;

-- COUNTRIES table - shared across workspaces, no workspace_id needed
-- (countries are the same for both workspaces)

-- TEAM_MEMBERS table - shared across workspaces with membership
-- Add workspace access via workspace_memberships instead

-- 5. Create helper function for RLS
CREATE OR REPLACE FUNCTION public.has_workspace_access(ws workspace_app)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_memberships wm
    WHERE wm.user_id = auth.uid()
      AND wm.workspace_id = ws
  );
$$;

-- 6. Note: RLS policies should be added separately after testing
-- Run 002_add_workspace_rls.sql after verifying this migration works

-- ============================================
-- END OF MIGRATION
-- ============================================
