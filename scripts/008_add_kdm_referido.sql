-- Add referred_by field to kdm_contacts
ALTER TABLE kdm_contacts ADD COLUMN IF NOT EXISTS referred_by text;

-- Add comment
COMMENT ON COLUMN kdm_contacts.referred_by IS 'Quien refirió/pasó este contacto KDM';
