-- MyWorkIn CRM Database Schema
-- Run this script to create all necessary tables

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('SDR', 'AE')) NOT NULL,
  country_code TEXT REFERENCES countries(code) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- University accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT,
  type TEXT CHECK (type IN ('privada', 'pública')),
  website TEXT,
  size TEXT CHECK (size IN ('pequeña', 'mediana', 'grande')),
  owner_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  icp_fit INTEGER DEFAULT 50 CHECK (icp_fit >= 0 AND icp_fit <= 100),
  stage TEXT CHECK (stage IN ('lead', 'sql', 'opp', 'won', 'lost')) DEFAULT 'lead',
  source TEXT CHECK (source IN ('inbound', 'outbound', 'referral', 'evento')),
  last_touch TIMESTAMPTZ,
  next_action TEXT,
  next_action_date DATE,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  mrr DECIMAL(10,2) DEFAULT 0,
  status TEXT CHECK (status IN ('activo', 'pausado', 'archivado')) DEFAULT 'activo',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('KDM', 'influencer', 'procurement')),
  title TEXT,
  email TEXT,
  whatsapp TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  product TEXT DEFAULT 'MyWorkIn (integral)',
  stage TEXT CHECK (stage IN ('discovery', 'demo', 'propuesta', 'negociacion', 'won', 'lost')) DEFAULT 'discovery',
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  mrr DECIMAL(10,2) DEFAULT 0,
  next_step TEXT,
  next_step_date DATE,
  lost_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('email', 'llamada', 'reunión', 'nota', 'linkedin', 'whatsapp')) NOT NULL,
  date_time TIMESTAMPTZ DEFAULT now(),
  owner_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  date_time TIMESTAMPTZ NOT NULL,
  kind TEXT CHECK (kind IN ('Discovery', 'Demo', 'Propuesta', 'Kickoff')) NOT NULL,
  owner_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  outcome TEXT CHECK (outcome IN ('pending', 'no-show', 'done', 'next-step')) DEFAULT 'pending',
  notes TEXT,
  next_step TEXT,
  next_meeting_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sequences table
CREATE TABLE IF NOT EXISTS sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  channel TEXT CHECK (channel IN ('email', 'linkedin', 'whatsapp')) NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sequence steps table
CREATE TABLE IF NOT EXISTS sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  content TEXT NOT NULL,
  delay TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('decks', 'casos', 'objeciones', 'pricing', 'looms', 'legal', 'implementacion')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  owner_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Scorecards table
CREATE TABLE IF NOT EXISTS scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  date DATE NOT NULL,
  cash_collected DECIMAL(10,2) DEFAULT 0,
  mrr_generated DECIMAL(10,2) DEFAULT 0,
  universities_won INTEGER DEFAULT 0,
  new_sqls INTEGER DEFAULT 0,
  meetings_done INTEGER DEFAULT 0,
  new_icp_accounts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(country_code, date)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  title TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Glossary terms table
CREATE TABLE IF NOT EXISTS glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quick links table
CREATE TABLE IF NOT EXISTS quick_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- App settings table (for setup wizard data)
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  mrr_target DECIMAL(10,2) DEFAULT 0,
  universities_target INTEGER DEFAULT 0,
  sqls_target INTEGER DEFAULT 0,
  meetings_target INTEGER DEFAULT 0,
  initialized BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_country ON accounts(country_code);
CREATE INDEX IF NOT EXISTS idx_accounts_stage ON accounts(stage);
CREATE INDEX IF NOT EXISTS idx_contacts_account ON contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_account ON opportunities(account_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_country ON opportunities(country_code);
CREATE INDEX IF NOT EXISTS idx_activities_account ON activities(account_id);
CREATE INDEX IF NOT EXISTS idx_meetings_account ON meetings(account_id);
CREATE INDEX IF NOT EXISTS idx_meetings_country ON meetings(country_code);
CREATE INDEX IF NOT EXISTS idx_scorecards_country_date ON scorecards(country_code, date);
CREATE INDEX IF NOT EXISTS idx_tasks_country ON tasks(country_code);

-- Enable RLS on all tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for internal CRM (all authenticated users can access all data)
-- Countries
CREATE POLICY "Allow all access to countries" ON countries FOR ALL USING (true) WITH CHECK (true);

-- Team members
CREATE POLICY "Allow all access to team_members" ON team_members FOR ALL USING (true) WITH CHECK (true);

-- Accounts
CREATE POLICY "Allow all access to accounts" ON accounts FOR ALL USING (true) WITH CHECK (true);

-- Contacts
CREATE POLICY "Allow all access to contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);

-- Opportunities
CREATE POLICY "Allow all access to opportunities" ON opportunities FOR ALL USING (true) WITH CHECK (true);

-- Activities
CREATE POLICY "Allow all access to activities" ON activities FOR ALL USING (true) WITH CHECK (true);

-- Meetings
CREATE POLICY "Allow all access to meetings" ON meetings FOR ALL USING (true) WITH CHECK (true);

-- Sequences
CREATE POLICY "Allow all access to sequences" ON sequences FOR ALL USING (true) WITH CHECK (true);

-- Sequence steps
CREATE POLICY "Allow all access to sequence_steps" ON sequence_steps FOR ALL USING (true) WITH CHECK (true);

-- Resources
CREATE POLICY "Allow all access to resources" ON resources FOR ALL USING (true) WITH CHECK (true);

-- Scorecards
CREATE POLICY "Allow all access to scorecards" ON scorecards FOR ALL USING (true) WITH CHECK (true);

-- Tasks
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);

-- Glossary terms
CREATE POLICY "Allow all access to glossary_terms" ON glossary_terms FOR ALL USING (true) WITH CHECK (true);

-- Quick links
CREATE POLICY "Allow all access to quick_links" ON quick_links FOR ALL USING (true) WITH CHECK (true);

-- App settings
CREATE POLICY "Allow all access to app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);

-- Insert default app settings
INSERT INTO app_settings (id, initialized) VALUES ('main', false) ON CONFLICT (id) DO NOTHING;
