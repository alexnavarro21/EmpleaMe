USE railway;

-- ============================================================
-- MIGRACIÓN 10: Porcentaje en habilidades_estudiantes +
--               catálogo ampliado de habilidades
-- ============================================================

-- 1. Agregar columna porcentaje (para habilidades blandas de tests)
ALTER TABLE habilidades_estudiantes
  ADD COLUMN porcentaje TINYINT DEFAULT NULL;

-- 2. Evitar duplicados al hacer upserts
--    (primero eliminar duplicados si existieran)
DELETE he1 FROM habilidades_estudiantes he1
INNER JOIN habilidades_estudiantes he2
  ON he1.estudiante_id = he2.estudiante_id
  AND he1.habilidad_id = he2.habilidad_id
  AND he1.id > he2.id;

ALTER TABLE habilidades_estudiantes
  ADD UNIQUE KEY uq_estudiante_habilidad (estudiante_id, habilidad_id);

-- ============================================================
-- 3. Catálogo ampliado de habilidades
-- ============================================================

-- Habilidades técnicas — Mecánica Automotriz
INSERT IGNORE INTO habilidades (nombre, categoria) VALUES
  ('Diagnóstico electrónico OBD-II',         'tecnica'),
  ('Reparación de motor a gasolina',          'tecnica'),
  ('Reparación de motor diesel',              'tecnica'),
  ('Sistemas de frenos ABS y convencionales', 'tecnica'),
  ('Suspensión y dirección',                  'tecnica'),
  ('Sistemas eléctricos y electrónicos',      'tecnica'),
  ('Cambio de aceite y filtros',              'tecnica'),
  ('Mantenimiento preventivo',                'tecnica'),
  ('Soldadura automotriz',                    'tecnica'),
  ('Sistemas de climatización automotriz',    'tecnica'),
  ('Lectura de planos y manuales técnicos',   'tecnica'),
  ('Uso de equipos de diagnóstico escáner',   'tecnica');

-- Habilidades técnicas — Administración
INSERT IGNORE INTO habilidades (nombre, categoria) VALUES
  ('Contabilidad general',                    'tecnica'),
  ('Manejo de software contable (Conta+)',    'tecnica'),
  ('Planillas Excel avanzadas',               'tecnica'),
  ('Gestión documental y archivo',            'tecnica'),
  ('Atención al cliente',                     'tecnica'),
  ('Facturación electrónica SII',             'tecnica'),
  ('Redacción de informes y actas',           'tecnica'),
  ('Gestión de recursos humanos básica',      'tecnica'),
  ('Manejo de ERP (SAP básico)',              'tecnica'),
  ('Control de inventario',                   'tecnica'),
  ('Manejo de caja y fondos',                 'tecnica'),
  ('Elaboración de presupuestos',             'tecnica');

-- Habilidades blandas / socioemocionales (compartidas por ambas carreras)
INSERT IGNORE INTO habilidades (nombre, categoria) VALUES
  ('Trabajo en equipo',                       'blanda'),
  ('Comunicación efectiva',                   'blanda'),
  ('Responsabilidad y puntualidad',           'blanda'),
  ('Resolución de problemas',                 'blanda'),
  ('Adaptabilidad al cambio',                 'blanda'),
  ('Orientación al detalle',                  'blanda'),
  ('Iniciativa y proactividad',               'blanda'),
  ('Manejo del estrés',                       'blanda'),
  ('Empatía y relaciones interpersonales',    'blanda'),
  ('Liderazgo básico',                        'blanda'),
  ('Organización y planificación',            'blanda'),
  ('Pensamiento crítico',                     'blanda');
