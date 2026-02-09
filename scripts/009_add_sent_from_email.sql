-- Agregar campo para registrar desde qué correo se envía el seguimiento
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS sent_from_email TEXT;

-- Comentario descriptivo del campo
COMMENT ON COLUMN accounts.sent_from_email IS 'Correo electrónico desde el cual se está enviando el seguimiento a esta cuenta';
