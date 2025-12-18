-- Add follow-up tracking fields to accounts table
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS first_contact_at TIMESTAMPTZ;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS next_follow_up_label TEXT;

-- Add result field to activities for email follow-up tracking
ALTER TABLE activities ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS requires_follow_up BOOLEAN DEFAULT false;

-- Update existing accounts with their first and last activity dates
UPDATE accounts a
SET 
  first_contact_at = COALESCE(
    (SELECT MIN(date_time) FROM activities WHERE account_id = a.id),
    (SELECT MIN(date_time) FROM meetings WHERE account_id = a.id)
  ),
  last_contact_at = COALESCE(
    (SELECT MAX(date_time) FROM activities WHERE account_id = a.id),
    (SELECT MAX(date_time) FROM meetings WHERE account_id = a.id)
  );
