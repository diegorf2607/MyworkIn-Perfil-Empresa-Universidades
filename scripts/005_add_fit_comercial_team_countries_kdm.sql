-- 005: Add fit_comercial, team_member_countries, kdm_contacts tables
-- Run this script to add new columns and tables for CRM improvements

-- 1. Add fit_comercial to accounts (replacing icp_fit percentage)
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS fit_comercial text DEFAULT 'Medio' 
CHECK (fit_comercial IN ('Alto', 'Medio', 'Bajo'));

-- 2. Add is_active to team_members
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 3. Create team_member_countries pivot table for multi-country assignment
CREATE TABLE IF NOT EXISTS team_member_countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  country_code text NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(member_id, country_code)
);

-- Enable RLS
ALTER TABLE team_member_countries ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Allow all access to team_member_countries" ON team_member_countries
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Create kdm_contacts table for key decision makers
CREATE TABLE IF NOT EXISTS kdm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  role_title text,
  linkedin_url text,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE kdm_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Allow all access to kdm_contacts" ON kdm_contacts
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Create account_kdm_contacts pivot table
CREATE TABLE IF NOT EXISTS account_kdm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  kdm_contact_id uuid NOT NULL REFERENCES kdm_contacts(id) ON DELETE CASCADE,
  country_code text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(account_id, kdm_contact_id)
);

-- Enable RLS
ALTER TABLE account_kdm_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Allow all access to account_kdm_contacts" ON account_kdm_contacts
  FOR ALL USING (true) WITH CHECK (true);

-- 6. Update activities table to support more event types
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS details jsonb DEFAULT '{}';

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_member_countries_member ON team_member_countries(member_id);
CREATE INDEX IF NOT EXISTS idx_team_member_countries_country ON team_member_countries(country_code);
CREATE INDEX IF NOT EXISTS idx_account_kdm_contacts_account ON account_kdm_contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_account_kdm_contacts_kdm ON account_kdm_contacts(kdm_contact_id);
CREATE INDEX IF NOT EXISTS idx_accounts_fit_comercial ON accounts(fit_comercial);
