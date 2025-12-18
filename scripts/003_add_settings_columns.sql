-- Add north_star_text and hero_text columns to app_settings
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS north_star_text TEXT;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS hero_text TEXT;

-- Insert default settings if not exists
INSERT INTO app_settings (id, initialized, north_star_text, hero_text)
VALUES (
  'main',
  true,
  'Ser la plataforma líder de empleabilidad universitaria en LATAM, conectando a 200+ universidades y alcanzando 1M+ estudiantes y egresados para transformar su futuro profesional.',
  'Impulsamos la empleabilidad universitaria en LATAM conectando estudiantes con oportunidades reales.'
)
ON CONFLICT (id) DO UPDATE SET
  north_star_text = COALESCE(app_settings.north_star_text, EXCLUDED.north_star_text),
  hero_text = COALESCE(app_settings.hero_text, EXCLUDED.hero_text);
