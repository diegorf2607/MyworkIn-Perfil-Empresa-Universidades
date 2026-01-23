-- Mejoras en tabla meetings para post-reunión y seguimiento estructurado

-- 1. Datos de contacto
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS contact_email text;

-- 2. Tracking de resultado como evento
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS outcome_changed_at timestamptz;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS post_meeting_sent_at timestamptz;

-- 3. Avance / Respondió
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS had_progress boolean DEFAULT false;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS progress_at timestamptz;

-- 4. Próximo paso estructurado
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS next_step_type text;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS next_step_date date;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS next_step_responsible text DEFAULT 'myworkin';

-- Add check constraint for next_step_type
ALTER TABLE meetings DROP CONSTRAINT IF EXISTS meetings_next_step_type_check;
ALTER TABLE meetings ADD CONSTRAINT meetings_next_step_type_check 
  CHECK (next_step_type IS NULL OR next_step_type IN ('waiting_response', 'new_meeting', 'send_proposal', 'internal_review', 'general_follow_up'));

-- Add check constraint for next_step_responsible
ALTER TABLE meetings DROP CONSTRAINT IF EXISTS meetings_next_step_responsible_check;
ALTER TABLE meetings ADD CONSTRAINT meetings_next_step_responsible_check 
  CHECK (next_step_responsible IS NULL OR next_step_responsible IN ('myworkin', 'university'));

-- 5. Estado de seguimiento interno
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS follow_up_status text DEFAULT 'active';

-- Add check constraint for follow_up_status
ALTER TABLE meetings DROP CONSTRAINT IF EXISTS meetings_follow_up_status_check;
ALTER TABLE meetings ADD CONSTRAINT meetings_follow_up_status_check 
  CHECK (follow_up_status IN ('active', 'cancelled', 'alert_sent', 'resolved'));

-- Create index for follow_up_status filtering
CREATE INDEX IF NOT EXISTS idx_meetings_follow_up_status ON meetings(follow_up_status);
CREATE INDEX IF NOT EXISTS idx_meetings_outcome ON meetings(outcome);
