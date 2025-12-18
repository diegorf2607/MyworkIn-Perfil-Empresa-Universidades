-- Seed data for MyWorkIn CRM

-- Insert countries
INSERT INTO countries (code, name, active) VALUES
  ('PE', 'Perú', true),
  ('MX', 'México', true),
  ('CO', 'Colombia', true),
  ('CL', 'Chile', false),
  ('AR', 'Argentina', false),
  ('BR', 'Brasil', false)
ON CONFLICT (code) DO NOTHING;

-- Insert team members
INSERT INTO team_members (id, name, email, role, country_code) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Carlos Mendoza', 'carlos@myworkin.com', 'AE', 'PE'),
  ('22222222-2222-2222-2222-222222222222', 'Ana García', 'ana@myworkin.com', 'SDR', 'PE'),
  ('33333333-3333-3333-3333-333333333333', 'Luis Rodríguez', 'luis@myworkin.com', 'AE', 'MX'),
  ('44444444-4444-4444-4444-444444444444', 'María López', 'maria@myworkin.com', 'SDR', 'CO')
ON CONFLICT (id) DO NOTHING;

-- Insert accounts for Peru
INSERT INTO accounts (id, country_code, name, city, type, website, size, owner_id, icp_fit, stage, source, probability, mrr, status, next_action, notes) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'PE', 'Universidad de Lima', 'Lima', 'privada', 'https://ulima.edu.pe', 'grande', '11111111-1111-1111-1111-111111111111', 85, 'opp', 'outbound', 60, 8500, 'activo', 'Enviar propuesta comercial', 'Muy interesados en módulo de empleabilidad'),
  ('aaaa2222-2222-2222-2222-222222222222', 'PE', 'PUCP', 'Lima', 'privada', 'https://pucp.edu.pe', 'grande', '11111111-1111-1111-1111-111111111111', 90, 'sql', 'inbound', 40, 12000, 'activo', 'Agendar demo', 'Contactaron por formulario web'),
  ('aaaa3333-3333-3333-3333-333333333333', 'PE', 'Universidad del Pacífico', 'Lima', 'privada', 'https://up.edu.pe', 'mediana', '22222222-2222-2222-2222-222222222222', 80, 'lead', 'outbound', 20, 6000, 'activo', 'Primer contacto', 'Enfocada en negocios'),
  ('aaaa4444-4444-4444-4444-444444444444', 'PE', 'Universidad San Martín de Porres', 'Lima', 'privada', 'https://usmp.edu.pe', 'grande', '22222222-2222-2222-2222-222222222222', 75, 'lead', 'evento', 20, 9000, 'activo', 'Seguimiento post-evento', 'Conocimos en feria educativa'),
  ('aaaa5555-5555-5555-5555-555555555555', 'PE', 'Universidad de Piura', 'Piura', 'privada', 'https://udep.edu.pe', 'mediana', '11111111-1111-1111-1111-111111111111', 70, 'won', 'referral', 100, 5500, 'activo', 'Kickoff meeting', 'Referido por UP'),
  ('aaaa6666-6666-6666-6666-666666666666', 'PE', 'Universidad Nacional Mayor de San Marcos', 'Lima', 'pública', 'https://unmsm.edu.pe', 'grande', '22222222-2222-2222-2222-222222222222', 60, 'lead', 'outbound', 15, 4000, 'activo', 'Investigar proceso de compra', 'Universidad pública - proceso largo')
ON CONFLICT (id) DO NOTHING;

-- Insert accounts for Mexico
INSERT INTO accounts (id, country_code, name, city, type, website, size, owner_id, icp_fit, stage, source, probability, mrr, status, next_action, notes) VALUES
  ('bbbb1111-1111-1111-1111-111111111111', 'MX', 'Tec de Monterrey', 'Monterrey', 'privada', 'https://tec.mx', 'grande', '33333333-3333-3333-3333-333333333333', 95, 'opp', 'inbound', 70, 25000, 'activo', 'Presentar propuesta final', 'Campus múltiples - alto potencial'),
  ('bbbb2222-2222-2222-2222-222222222222', 'MX', 'Universidad Iberoamericana', 'Ciudad de México', 'privada', 'https://ibero.mx', 'grande', '33333333-3333-3333-3333-333333333333', 85, 'sql', 'outbound', 35, 15000, 'activo', 'Demo con área de vinculación', 'Enfoque en responsabilidad social'),
  ('bbbb3333-3333-3333-3333-333333333333', 'MX', 'Universidad Anáhuac', 'Ciudad de México', 'privada', 'https://anahuac.mx', 'grande', '33333333-3333-3333-3333-333333333333', 80, 'lead', 'referral', 25, 12000, 'activo', 'Primera llamada', 'Referido por Ibero'),
  ('bbbb4444-4444-4444-4444-444444444444', 'MX', 'UNAM', 'Ciudad de México', 'pública', 'https://unam.mx', 'grande', '33333333-3333-3333-3333-333333333333', 65, 'lead', 'evento', 10, 8000, 'activo', 'Mapear stakeholders', 'Universidad más grande de LATAM'),
  ('bbbb5555-5555-5555-5555-555555555555', 'MX', 'Universidad Panamericana', 'Ciudad de México', 'privada', 'https://up.edu.mx', 'mediana', '33333333-3333-3333-3333-333333333333', 75, 'won', 'outbound', 100, 7000, 'activo', 'Implementación en curso', 'Contrato firmado hace 2 meses')
ON CONFLICT (id) DO NOTHING;

-- Insert accounts for Colombia
INSERT INTO accounts (id, country_code, name, city, type, website, size, owner_id, icp_fit, stage, source, probability, mrr, status, next_action, notes) VALUES
  ('cccc1111-1111-1111-1111-111111111111', 'CO', 'Universidad de los Andes', 'Bogotá', 'privada', 'https://uniandes.edu.co', 'grande', '44444444-4444-4444-4444-444444444444', 90, 'opp', 'inbound', 65, 18000, 'activo', 'Negociación de precio', 'Universidad top en Colombia'),
  ('cccc2222-2222-2222-2222-222222222222', 'CO', 'Universidad Javeriana', 'Bogotá', 'privada', 'https://javeriana.edu.co', 'grande', '44444444-4444-4444-4444-444444444444', 85, 'sql', 'outbound', 40, 14000, 'activo', 'Preparar demo personalizada', 'Red de universidades jesuitas'),
  ('cccc3333-3333-3333-3333-333333333333', 'CO', 'Universidad del Rosario', 'Bogotá', 'privada', 'https://urosario.edu.co', 'mediana', '44444444-4444-4444-4444-444444444444', 80, 'lead', 'referral', 25, 9000, 'activo', 'Contactar director de egresados', 'Referido por Andes'),
  ('cccc4444-4444-4444-4444-444444444444', 'CO', 'Universidad EAFIT', 'Medellín', 'privada', 'https://eafit.edu.co', 'mediana', '44444444-4444-4444-4444-444444444444', 75, 'lead', 'evento', 20, 8000, 'activo', 'Seguimiento LinkedIn', 'Muy innovadores'),
  ('cccc5555-5555-5555-5555-555555555555', 'CO', 'Universidad Nacional de Colombia', 'Bogotá', 'pública', 'https://unal.edu.co', 'grande', '44444444-4444-4444-4444-444444444444', 55, 'lost', 'outbound', 0, 5000, 'archivado', 'Archivar', 'Presupuesto insuficiente')
ON CONFLICT (id) DO NOTHING;

-- Insert contacts
INSERT INTO contacts (id, account_id, name, role, title, email, whatsapp) VALUES
  ('cont1111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'Roberto Sánchez', 'KDM', 'Director de Empleabilidad', 'rsanchez@ulima.edu.pe', '+51999111222'),
  ('cont2222-2222-2222-2222-222222222222', 'aaaa1111-1111-1111-1111-111111111111', 'Patricia Vega', 'influencer', 'Coordinadora de Prácticas', 'pvega@ulima.edu.pe', '+51999333444'),
  ('cont3333-3333-3333-3333-333333333333', 'aaaa2222-2222-2222-2222-222222222222', 'Juan Carlos Mora', 'KDM', 'Vicerrector Académico', 'jcmora@pucp.edu.pe', '+51999555666'),
  ('cont4444-4444-4444-4444-444444444444', 'bbbb1111-1111-1111-1111-111111111111', 'Alejandra Torres', 'KDM', 'Directora de Vinculación', 'atorres@tec.mx', '+52551234567'),
  ('cont5555-5555-5555-5555-555555555555', 'bbbb1111-1111-1111-1111-111111111111', 'Fernando Gutiérrez', 'procurement', 'Jefe de Compras', 'fgutierrez@tec.mx', '+52559876543'),
  ('cont6666-6666-6666-6666-666666666666', 'cccc1111-1111-1111-1111-111111111111', 'Camila Restrepo', 'KDM', 'Directora Centro de Carrera', 'crestrepo@uniandes.edu.co', '+573001234567')
ON CONFLICT (id) DO NOTHING;

-- Insert opportunities
INSERT INTO opportunities (id, account_id, country_code, product, stage, probability, mrr, next_step, next_step_date) VALUES
  ('opp11111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'PE', 'MyWorkIn (integral)', 'propuesta', 60, 8500, 'Revisar propuesta con legal', '2025-01-15'),
  ('opp22222-2222-2222-2222-222222222222', 'aaaa5555-5555-5555-5555-555555555555', 'PE', 'MyWorkIn (integral)', 'won', 100, 5500, 'Implementación', '2024-12-20'),
  ('opp33333-3333-3333-3333-333333333333', 'bbbb1111-1111-1111-1111-111111111111', 'MX', 'MyWorkIn (integral)', 'negociacion', 70, 25000, 'Llamada de cierre', '2025-01-10'),
  ('opp44444-4444-4444-4444-444444444444', 'bbbb5555-5555-5555-5555-555555555555', 'MX', 'MyWorkIn (integral)', 'won', 100, 7000, 'Implementación', '2024-11-15'),
  ('opp55555-5555-5555-5555-555555555555', 'cccc1111-1111-1111-1111-111111111111', 'CO', 'MyWorkIn (integral)', 'negociacion', 65, 18000, 'Presentar descuento', '2025-01-08'),
  ('opp66666-6666-6666-6666-666666666666', 'cccc5555-5555-5555-5555-555555555555', 'CO', 'MyWorkIn (integral)', 'lost', 0, 5000, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert meetings
INSERT INTO meetings (id, country_code, account_id, date_time, kind, owner_id, outcome, notes, next_step) VALUES
  ('meet1111-1111-1111-1111-111111111111', 'PE', 'aaaa1111-1111-1111-1111-111111111111', '2025-01-08 10:00:00-05', 'Propuesta', '11111111-1111-1111-1111-111111111111', 'pending', '', 'Presentar propuesta comercial'),
  ('meet2222-2222-2222-2222-222222222222', 'PE', 'aaaa2222-2222-2222-2222-222222222222', '2025-01-10 15:00:00-05', 'Demo', '11111111-1111-1111-1111-111111111111', 'pending', '', 'Demo de plataforma'),
  ('meet3333-3333-3333-3333-333333333333', 'MX', 'bbbb1111-1111-1111-1111-111111111111', '2025-01-06 11:00:00-06', 'Propuesta', '33333333-3333-3333-3333-333333333333', 'done', 'Muy positiva la reunión', 'Enviar contrato'),
  ('meet4444-4444-4444-4444-444444444444', 'MX', 'bbbb2222-2222-2222-2222-222222222222', '2025-01-12 14:00:00-06', 'Demo', '33333333-3333-3333-3333-333333333333', 'pending', '', 'Demo con todo el equipo'),
  ('meet5555-5555-5555-5555-555555555555', 'CO', 'cccc1111-1111-1111-1111-111111111111', '2025-01-07 09:00:00-05', 'Propuesta', '44444444-4444-4444-4444-444444444444', 'next-step', 'Pidieron ajustar precios', 'Segunda reunión de negociación')
ON CONFLICT (id) DO NOTHING;

-- Insert activities
INSERT INTO activities (id, country_code, account_id, type, date_time, owner_id, summary) VALUES
  ('act11111-1111-1111-1111-111111111111', 'PE', 'aaaa1111-1111-1111-1111-111111111111', 'email', '2024-12-28 09:00:00-05', '11111111-1111-1111-1111-111111111111', 'Enviado follow-up de propuesta'),
  ('act22222-2222-2222-2222-222222222222', 'PE', 'aaaa1111-1111-1111-1111-111111111111', 'llamada', '2024-12-20 11:00:00-05', '11111111-1111-1111-1111-111111111111', 'Llamada con Roberto - muy interesado'),
  ('act33333-3333-3333-3333-333333333333', 'PE', 'aaaa2222-2222-2222-2222-222222222222', 'linkedin', '2024-12-26 14:00:00-05', '22222222-2222-2222-2222-222222222222', 'Conectamos en LinkedIn con JC Mora'),
  ('act44444-4444-4444-4444-444444444444', 'MX', 'bbbb1111-1111-1111-1111-111111111111', 'reunión', '2024-12-18 10:00:00-06', '33333333-3333-3333-3333-333333333333', 'Discovery call excelente - 3 campus interesados'),
  ('act55555-5555-5555-5555-555555555555', 'MX', 'bbbb1111-1111-1111-1111-111111111111', 'email', '2024-12-22 08:00:00-06', '33333333-3333-3333-3333-333333333333', 'Enviada información de pricing'),
  ('act66666-6666-6666-6666-666666666666', 'CO', 'cccc1111-1111-1111-1111-111111111111', 'whatsapp', '2024-12-27 16:00:00-05', '44444444-4444-4444-4444-444444444444', 'Camila confirmó reunión para enero')
ON CONFLICT (id) DO NOTHING;

-- Insert resources
INSERT INTO resources (id, country_code, category, title, description, url, owner_id) VALUES
  ('res11111-1111-1111-1111-111111111111', 'PE', 'decks', 'Deck Comercial 2025', 'Presentación principal de ventas actualizada', 'https://drive.google.com/deck-comercial-2025', '11111111-1111-1111-1111-111111111111'),
  ('res22222-2222-2222-2222-222222222222', 'PE', 'casos', 'Caso de Éxito UDEP', 'Resultados del primer año con UDEP', 'https://notion.so/caso-udep', '11111111-1111-1111-1111-111111111111'),
  ('res33333-3333-3333-3333-333333333333', 'PE', 'objeciones', 'Guía de Objeciones', 'Respuestas a objeciones comunes', 'https://notion.so/objeciones', '22222222-2222-2222-2222-222222222222'),
  ('res44444-4444-4444-4444-444444444444', 'MX', 'decks', 'Deck Comercial México', 'Versión localizada para México', 'https://drive.google.com/deck-mx', '33333333-3333-3333-3333-333333333333'),
  ('res55555-5555-5555-5555-555555555555', 'MX', 'pricing', 'Tabla de Precios MX', 'Precios en MXN actualizados', 'https://sheets.google.com/pricing-mx', '33333333-3333-3333-3333-333333333333'),
  ('res66666-6666-6666-6666-666666666666', 'CO', 'looms', 'Demo Grabada', 'Demo completa de la plataforma', 'https://loom.com/demo-myworkin', '44444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO NOTHING;

-- Insert sequences
INSERT INTO sequences (id, country_code, channel, name) VALUES
  ('seq11111-1111-1111-1111-111111111111', 'PE', 'email', 'Outbound Universidades'),
  ('seq22222-2222-2222-2222-222222222222', 'PE', 'linkedin', 'LinkedIn Decisores'),
  ('seq33333-3333-3333-3333-333333333333', 'MX', 'email', 'Secuencia Inbound MX'),
  ('seq44444-4444-4444-4444-444444444444', 'CO', 'whatsapp', 'Follow-up WhatsApp')
ON CONFLICT (id) DO NOTHING;

-- Insert sequence steps
INSERT INTO sequence_steps (id, sequence_id, step_order, content, delay) VALUES
  ('step1111-1111-1111-1111-111111111111', 'seq11111-1111-1111-1111-111111111111', 1, 'Email de introducción personalizado', 'Día 0'),
  ('step2222-2222-2222-2222-222222222222', 'seq11111-1111-1111-1111-111111111111', 2, 'Follow-up con caso de éxito', 'Día 3'),
  ('step3333-3333-3333-3333-333333333333', 'seq11111-1111-1111-1111-111111111111', 3, 'Propuesta de llamada', 'Día 7'),
  ('step4444-4444-4444-4444-444444444444', 'seq22222-2222-2222-2222-222222222222', 1, 'Solicitud de conexión', 'Día 0'),
  ('step5555-5555-5555-5555-555555555555', 'seq22222-2222-2222-2222-222222222222', 2, 'Mensaje de valor', 'Día 2')
ON CONFLICT (id) DO NOTHING;

-- Insert tasks
INSERT INTO tasks (id, country_code, title, account_id, due_date, status) VALUES
  ('task1111-1111-1111-1111-111111111111', 'PE', 'Enviar propuesta a U. Lima', 'aaaa1111-1111-1111-1111-111111111111', '2025-01-08', 'pending'),
  ('task2222-2222-2222-2222-222222222222', 'PE', 'Preparar demo PUCP', 'aaaa2222-2222-2222-2222-222222222222', '2025-01-09', 'pending'),
  ('task3333-3333-3333-3333-333333333333', 'MX', 'Llamar a Tec de Monterrey', 'bbbb1111-1111-1111-1111-111111111111', '2025-01-06', 'completed'),
  ('task4444-4444-4444-4444-444444444444', 'MX', 'Actualizar CRM con notas', NULL, '2025-01-05', 'pending'),
  ('task5555-5555-5555-5555-555555555555', 'CO', 'Revisar contrato Uniandes', 'cccc1111-1111-1111-1111-111111111111', '2025-01-07', 'pending')
ON CONFLICT (id) DO NOTHING;

-- Insert glossary terms
INSERT INTO glossary_terms (id, term, definition, category) VALUES
  ('glos1111-1111-1111-1111-111111111111', 'KDM', 'Key Decision Maker - Persona con autoridad para aprobar la compra', 'Ventas'),
  ('glos2222-2222-2222-2222-222222222222', 'ICP', 'Ideal Customer Profile - Perfil de cliente ideal', 'Ventas'),
  ('glos3333-3333-3333-3333-333333333333', 'SQL', 'Sales Qualified Lead - Lead calificado para ventas', 'Pipeline'),
  ('glos4444-4444-4444-4444-444444444444', 'MRR', 'Monthly Recurring Revenue - Ingreso mensual recurrente', 'Métricas'),
  ('glos5555-5555-5555-5555-555555555555', 'AE', 'Account Executive - Ejecutivo de cuenta', 'Equipo'),
  ('glos6666-6666-6666-6666-666666666666', 'SDR', 'Sales Development Representative - Representante de desarrollo de ventas', 'Equipo')
ON CONFLICT (id) DO NOTHING;

-- Insert quick links
INSERT INTO quick_links (id, title, url, category) VALUES
  ('ql111111-1111-1111-1111-111111111111', 'Notion Sales', 'https://notion.so/myworkin-sales', 'Documentación'),
  ('ql222222-2222-2222-2222-222222222222', 'Slack Ventas', 'https://myworkin.slack.com/ventas', 'Comunicación'),
  ('ql333333-3333-3333-3333-333333333333', 'Google Drive', 'https://drive.google.com/myworkin', 'Recursos'),
  ('ql444444-4444-4444-4444-444444444444', 'HubSpot CRM', 'https://app.hubspot.com', 'Herramientas'),
  ('ql555555-5555-5555-5555-555555555555', 'Calendly', 'https://calendly.com/myworkin', 'Herramientas')
ON CONFLICT (id) DO NOTHING;

-- Insert scorecards for current week
INSERT INTO scorecards (id, country_code, date, cash_collected, mrr_generated, universities_won, new_sqls, meetings_done, new_icp_accounts) VALUES
  ('sc111111-1111-1111-1111-111111111111', 'PE', '2025-01-06', 0, 0, 0, 1, 2, 3),
  ('sc222222-2222-2222-2222-222222222222', 'PE', '2025-01-05', 5500, 5500, 1, 0, 1, 1),
  ('sc333333-3333-3333-3333-333333333333', 'MX', '2025-01-06', 0, 0, 0, 2, 1, 2),
  ('sc444444-4444-4444-4444-444444444444', 'MX', '2025-01-05', 7000, 7000, 1, 1, 2, 0),
  ('sc555555-5555-5555-5555-555555555555', 'CO', '2025-01-06', 0, 0, 0, 1, 1, 1)
ON CONFLICT (country_code, date) DO NOTHING;

-- Update app settings
UPDATE app_settings SET 
  mrr_target = 50000,
  universities_target = 10,
  sqls_target = 20,
  meetings_target = 40,
  initialized = true,
  updated_at = now()
WHERE id = 'main';
