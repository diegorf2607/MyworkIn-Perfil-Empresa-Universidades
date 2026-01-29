-- ============================================
-- MIGRATION: Add RLS policies for workspace isolation
-- Run AFTER 001_add_workspace_id.sql
-- ============================================

-- Enable RLS on all core tables if not already enabled

-- ACCOUNTS RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "accounts_select_workspace" ON public.accounts;
CREATE POLICY "accounts_select_workspace"
ON public.accounts FOR SELECT
USING (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "accounts_insert_workspace" ON public.accounts;
CREATE POLICY "accounts_insert_workspace"
ON public.accounts FOR INSERT
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "accounts_update_workspace" ON public.accounts;
CREATE POLICY "accounts_update_workspace"
ON public.accounts FOR UPDATE
USING (public.has_workspace_access(workspace_id))
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "accounts_delete_workspace" ON public.accounts;
CREATE POLICY "accounts_delete_workspace"
ON public.accounts FOR DELETE
USING (public.has_workspace_access(workspace_id));

-- CONTACTS RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_select_workspace" ON public.contacts;
CREATE POLICY "contacts_select_workspace"
ON public.contacts FOR SELECT
USING (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "contacts_insert_workspace" ON public.contacts;
CREATE POLICY "contacts_insert_workspace"
ON public.contacts FOR INSERT
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "contacts_update_workspace" ON public.contacts;
CREATE POLICY "contacts_update_workspace"
ON public.contacts FOR UPDATE
USING (public.has_workspace_access(workspace_id))
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "contacts_delete_workspace" ON public.contacts;
CREATE POLICY "contacts_delete_workspace"
ON public.contacts FOR DELETE
USING (public.has_workspace_access(workspace_id));

-- OPPORTUNITIES RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "opportunities_select_workspace" ON public.opportunities;
CREATE POLICY "opportunities_select_workspace"
ON public.opportunities FOR SELECT
USING (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "opportunities_insert_workspace" ON public.opportunities;
CREATE POLICY "opportunities_insert_workspace"
ON public.opportunities FOR INSERT
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "opportunities_update_workspace" ON public.opportunities;
CREATE POLICY "opportunities_update_workspace"
ON public.opportunities FOR UPDATE
USING (public.has_workspace_access(workspace_id))
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "opportunities_delete_workspace" ON public.opportunities;
CREATE POLICY "opportunities_delete_workspace"
ON public.opportunities FOR DELETE
USING (public.has_workspace_access(workspace_id));

-- MEETINGS RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meetings_select_workspace" ON public.meetings;
CREATE POLICY "meetings_select_workspace"
ON public.meetings FOR SELECT
USING (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "meetings_insert_workspace" ON public.meetings;
CREATE POLICY "meetings_insert_workspace"
ON public.meetings FOR INSERT
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "meetings_update_workspace" ON public.meetings;
CREATE POLICY "meetings_update_workspace"
ON public.meetings FOR UPDATE
USING (public.has_workspace_access(workspace_id))
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "meetings_delete_workspace" ON public.meetings;
CREATE POLICY "meetings_delete_workspace"
ON public.meetings FOR DELETE
USING (public.has_workspace_access(workspace_id));

-- ACTIVITIES RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activities_select_workspace" ON public.activities;
CREATE POLICY "activities_select_workspace"
ON public.activities FOR SELECT
USING (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "activities_insert_workspace" ON public.activities;
CREATE POLICY "activities_insert_workspace"
ON public.activities FOR INSERT
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "activities_update_workspace" ON public.activities;
CREATE POLICY "activities_update_workspace"
ON public.activities FOR UPDATE
USING (public.has_workspace_access(workspace_id))
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "activities_delete_workspace" ON public.activities;
CREATE POLICY "activities_delete_workspace"
ON public.activities FOR DELETE
USING (public.has_workspace_access(workspace_id));

-- TASKS RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select_workspace" ON public.tasks;
CREATE POLICY "tasks_select_workspace"
ON public.tasks FOR SELECT
USING (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "tasks_insert_workspace" ON public.tasks;
CREATE POLICY "tasks_insert_workspace"
ON public.tasks FOR INSERT
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "tasks_update_workspace" ON public.tasks;
CREATE POLICY "tasks_update_workspace"
ON public.tasks FOR UPDATE
USING (public.has_workspace_access(workspace_id))
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "tasks_delete_workspace" ON public.tasks;
CREATE POLICY "tasks_delete_workspace"
ON public.tasks FOR DELETE
USING (public.has_workspace_access(workspace_id));

-- SCORECARDS RLS
ALTER TABLE public.scorecards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scorecards_select_workspace" ON public.scorecards;
CREATE POLICY "scorecards_select_workspace"
ON public.scorecards FOR SELECT
USING (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "scorecards_insert_workspace" ON public.scorecards;
CREATE POLICY "scorecards_insert_workspace"
ON public.scorecards FOR INSERT
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "scorecards_update_workspace" ON public.scorecards;
CREATE POLICY "scorecards_update_workspace"
ON public.scorecards FOR UPDATE
USING (public.has_workspace_access(workspace_id))
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "scorecards_delete_workspace" ON public.scorecards;
CREATE POLICY "scorecards_delete_workspace"
ON public.scorecards FOR DELETE
USING (public.has_workspace_access(workspace_id));

-- WORKSPACE_MEMBERSHIPS RLS (users can only see their own memberships)
ALTER TABLE public.workspace_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "memberships_select_own" ON public.workspace_memberships;
CREATE POLICY "memberships_select_own"
ON public.workspace_memberships FOR SELECT
USING (user_id = auth.uid());

-- Note: Insert/Update/Delete of memberships should only be done by admins
-- via service role or specific admin policies

-- ============================================
-- END OF RLS MIGRATION
-- ============================================
