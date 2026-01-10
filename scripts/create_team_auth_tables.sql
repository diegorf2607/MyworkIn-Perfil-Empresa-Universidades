-- Creating team_members table with proper auth.users reference
-- Drop existing tables if they exist to recreate with proper structure
DROP TABLE IF EXISTS public.team_member_countries CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;

-- Create team_members table that references auth.users
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'user')),
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create team_member_countries for user country assignments
CREATE TABLE IF NOT EXISTS public.team_member_countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country_code text NOT NULL REFERENCES public.countries(code),
  created_at timestamptz DEFAULT now(),
  UNIQUE(member_user_id, country_code)
);

-- Enable RLS on both tables
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_countries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
DROP POLICY IF EXISTS "team_members_admin_all" ON public.team_members;
CREATE POLICY "team_members_admin_all" 
  ON public.team_members FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin' AND tm.is_active = true
    )
  );

DROP POLICY IF EXISTS "team_members_user_read_own" ON public.team_members;
CREATE POLICY "team_members_user_read_own" 
  ON public.team_members FOR SELECT 
  USING (user_id = auth.uid());

-- RLS Policies for team_member_countries
DROP POLICY IF EXISTS "team_member_countries_admin_all" ON public.team_member_countries;
CREATE POLICY "team_member_countries_admin_all" 
  ON public.team_member_countries FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin' AND tm.is_active = true
    )
  );

DROP POLICY IF EXISTS "team_member_countries_user_read_own" ON public.team_member_countries;
CREATE POLICY "team_member_countries_user_read_own" 
  ON public.team_member_countries FOR SELECT 
  USING (member_user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON public.team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_member_countries_user_id ON public.team_member_countries(member_user_id);
CREATE INDEX IF NOT EXISTS idx_team_member_countries_country ON public.team_member_countries(country_code);

-- Example RLS policy for accounts table (restrict by country for non-admin users)
-- This is an example - apply similar pattern to other tables with country_code
DROP POLICY IF EXISTS "accounts_admin_all" ON public.accounts;
CREATE POLICY "accounts_admin_all" 
  ON public.accounts FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin' AND tm.is_active = true
    )
  );

DROP POLICY IF EXISTS "accounts_user_assigned_countries" ON public.accounts;
CREATE POLICY "accounts_user_assigned_countries" 
  ON public.accounts FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_member_countries tmc 
      WHERE tmc.member_user_id = auth.uid() AND tmc.country_code = accounts.country_code
    )
  );

-- Repeat similar policies for other tables with country_code
-- meetings, activities, scorecards, resources, sequences, tasks, opportunities
DROP POLICY IF EXISTS "meetings_admin_all" ON public.meetings;
CREATE POLICY "meetings_admin_all" 
  ON public.meetings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin' AND tm.is_active = true
    )
  );

DROP POLICY IF EXISTS "meetings_user_assigned_countries" ON public.meetings;
CREATE POLICY "meetings_user_assigned_countries" 
  ON public.meetings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_member_countries tmc 
      WHERE tmc.member_user_id = auth.uid() AND tmc.country_code = meetings.country_code
    )
  );

-- Continue pattern for other tables...
-- Note: Old policies with "Allow all access" should be replaced with these new ones
