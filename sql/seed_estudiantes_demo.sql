USE railway;

-- ============================================================
-- SEED: 5 estudiantes demo — perfiles 100% completos
-- IDs de usuario: 100-104 (evita conflicto con datos reales)
-- ============================================================

-- ── Usuarios ─────────────────────────────────────────────────
-- Contraseña para todos: Demo1234 (hash bcrypt rounds=10)
INSERT INTO usuarios (id, correo, contrasena_hash, rol) VALUES
  (100, 'camila.torres@demo.cl',   'Demo1234', 'estudiante'),
  (101, 'matias.sepulveda@demo.cl', 'Demo1234', 'estudiante'),
  (102, 'valentina.rojas@demo.cl',  'Demo1234', 'estudiante'),
  (103, 'diego.castillo@demo.cl',   'Demo1234', 'estudiante'),
  (104, 'fernanda.munoz@demo.cl',   'Demo1234', 'estudiante');

-- ── Perfiles estudiantes ──────────────────────────────────────
INSERT INTO perfiles_estudiantes
  (usuario_id, nombre_completo, rut, carrera, semestre, promedio, calificacion_docente,
   telefono, biografia, estado_civil, region, comuna)
VALUES
  (100, 'Camila Torres Ríos',      '20.111.222-3', 'Administracion',     6, 6.2, 6.5,
   '+56 9 1234 5001',
   'Estudiante de Administración con enfoque en gestión documental y contabilidad. Proactiva, organizada y con experiencia en atención al cliente durante prácticas voluntarias.',
   'soltero', 'Región Metropolitana de Santiago', 'Santiago'),

  (101, 'Matías Sepúlveda Vera',   '20.222.333-4', 'Mecanica Automotriz', 5, 5.8, 6.1,
   '+56 9 1234 5002',
   'Apasionado por la mecánica moderna y los sistemas eléctricos vehiculares. Experiencia en diagnóstico OBD-II y mantenimiento preventivo en taller escolar.',
   'soltero', 'Región de Valparaíso', 'Viña del Mar'),

  (102, 'Valentina Rojas Mena',    '20.333.444-5', 'Administracion',     4, 6.5, 6.7,
   '+56 9 1234 5003',
   'Estudiante con sólido manejo de herramientas contables y ERP. Orientada al detalle y con habilidades de liderazgo demostradas en proyectos de aula.',
   'soltero', 'Región del Biobío', 'Concepción'),

  (103, 'Diego Castillo Parra',    '20.444.555-6', 'Mecanica Automotriz', 6, 5.5, 5.9,
   '+56 9 1234 5004',
   'Técnico en formación con especialización en sistemas de frenos y suspensión. Participó en competencia regional de diagnóstico automotriz 2023.',
   'soltero', 'Región de La Araucanía', 'Temuco'),

  (104, 'Fernanda Muñoz Lagos',    '20.555.666-7', 'Administracion',     5, 6.8, 6.9,
   '+56 9 1234 5005',
   'Top de su generación en Administración. Maneja software contable Conta+, Excel avanzado y tiene certificación SII en facturación electrónica.',
   'soltero', 'Región de Los Lagos', 'Puerto Montt');

-- ── Idiomas ───────────────────────────────────────────────────
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES
  (100, 'Español', 'Nativo'),
  (100, 'Inglés',  'Intermedio'),
  (101, 'Español', 'Nativo'),
  (101, 'Inglés',  'Básico'),
  (102, 'Español', 'Nativo'),
  (102, 'Inglés',  'Avanzado'),
  (102, 'Portugués', 'Básico'),
  (103, 'Español', 'Nativo'),
  (103, 'Inglés',  'Básico'),
  (104, 'Español', 'Nativo'),
  (104, 'Inglés',  'Intermedio');

-- ── Historial académico ───────────────────────────────────────
INSERT INTO historial_academico (estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin) VALUES
  (100, 'C.E. Cardenal J.M. Caro', 'Técnico en Administración', 'Administración de Empresas', 2022, NULL),
  (100, 'Instituto AIEP',          'Curso Excel Avanzado',      'Ofimática',                  2023, 2023),

  (101, 'C.E. Cardenal J.M. Caro', 'Técnico en Mecánica Automotriz', 'Automotriz',             2022, NULL),
  (101, 'Autozone Academy',        'Certificación OBD-II Básico',    'Diagnóstico',             2023, 2023),

  (102, 'C.E. Cardenal J.M. Caro', 'Técnico en Administración', 'Administración de Empresas', 2023, NULL),
  (102, 'SENCE',                   'Curso de Liderazgo Joven',  'Habilidades directivas',     2023, 2023),

  (103, 'C.E. Cardenal J.M. Caro', 'Técnico en Mecánica Automotriz', 'Automotriz',             2022, NULL),
  (103, 'CECAP Temuco',            'Taller de Soldadura Básica',     'Metalmecánica',           2023, 2023),

  (104, 'C.E. Cardenal J.M. Caro', 'Técnico en Administración', 'Administración de Empresas', 2023, NULL),
  (104, 'SII Chile',               'Facturación Electrónica',   'Tributación',                 2024, 2024);

-- ── Historial laboral ─────────────────────────────────────────
INSERT INTO historial_laboral (estudiante_id, empresa_nombre, cargo, fecha_inicio, fecha_fin, descripcion, tipo) VALUES
  (100, 'Librería Universitaria Ltda.', 'Auxiliar administrativo', '2023-01-10', '2023-03-31',
   'Apoyo en gestión documental, archivo físico y atención de público.', 'verificado'),

  (101, 'Taller Mecánico El Fierrito',  'Ayudante mecánico',       '2023-07-01', '2023-09-30',
   'Mantenimiento preventivo, cambio de aceite y rotación de neumáticos.', 'verificado'),

  (102, 'Multitienda Central S.A.',     'Cajera y facturación',    '2024-01-15', '2024-03-31',
   'Operación de caja, emisión de boletas y facturas electrónicas vía SII.', 'verificado'),

  (103, 'Automotriz San Martín',        'Practicante mecánica',    '2023-07-10', '2023-09-10',
   'Diagnóstico electrónico de vehículos livianos y reemplazo de pastillas.', 'practica_completada'),

  (104, 'Constructora Andina SpA',      'Asistente contable',      '2024-01-08', '2024-03-29',
   'Registro de facturas en Conta+, conciliación bancaria y control de inventario.', 'verificado');

-- ── Habilidades ───────────────────────────────────────────────
-- Técnicas: usa IDs del catálogo estándar (migration 10).
-- Mecánica: IDs ~1-12 según orden de inserción; Administración: ~13-24; Blandas: ~25-36.
-- Se usan nombres exactos con INSERT SELECT para no depender de IDs hardcodeados.

-- Camila Torres — Administración
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT 100, id, 'Avanzado', NULL, TRUE  FROM habilidades WHERE nombre = 'Gestión documental y archivo'
UNION ALL
SELECT 100, id, 'Avanzado', NULL, TRUE  FROM habilidades WHERE nombre = 'Atención al cliente'
UNION ALL
SELECT 100, id, 'Intermedio', NULL, TRUE FROM habilidades WHERE nombre = 'Planillas Excel avanzadas'
UNION ALL
SELECT 100, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Facturación electrónica SII'
UNION ALL
SELECT 100, id, 'Basico', NULL, FALSE  FROM habilidades WHERE nombre = 'Contabilidad general'
-- blandas
UNION ALL
SELECT 100, id, 'Basico', 88, TRUE FROM habilidades WHERE nombre = 'Trabajo en equipo'
UNION ALL
SELECT 100, id, 'Basico', 85, TRUE FROM habilidades WHERE nombre = 'Comunicación efectiva'
UNION ALL
SELECT 100, id, 'Basico', 90, TRUE FROM habilidades WHERE nombre = 'Organización y planificación'
UNION ALL
SELECT 100, id, 'Basico', 78, TRUE FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad';

-- Matías Sepúlveda — Mecánica
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT 101, id, 'Avanzado', NULL, TRUE  FROM habilidades WHERE nombre = 'Diagnóstico electrónico OBD-II'
UNION ALL
SELECT 101, id, 'Avanzado', NULL, TRUE  FROM habilidades WHERE nombre = 'Cambio de aceite y filtros'
UNION ALL
SELECT 101, id, 'Intermedio', NULL, TRUE FROM habilidades WHERE nombre = 'Sistemas eléctricos y electrónicos'
UNION ALL
SELECT 101, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Mantenimiento preventivo'
UNION ALL
SELECT 101, id, 'Basico', NULL, FALSE  FROM habilidades WHERE nombre = 'Sistemas de frenos ABS y convencionales'
-- blandas
UNION ALL
SELECT 101, id, 'Basico', 80, TRUE FROM habilidades WHERE nombre = 'Resolución de problemas'
UNION ALL
SELECT 101, id, 'Basico', 75, TRUE FROM habilidades WHERE nombre = 'Adaptabilidad al cambio'
UNION ALL
SELECT 101, id, 'Basico', 70, TRUE FROM habilidades WHERE nombre = 'Orientación al detalle'
UNION ALL
SELECT 101, id, 'Basico', 82, TRUE FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad';

-- Valentina Rojas — Administración
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT 102, id, 'Avanzado', NULL, TRUE  FROM habilidades WHERE nombre = 'Planillas Excel avanzadas'
UNION ALL
SELECT 102, id, 'Avanzado', NULL, TRUE  FROM habilidades WHERE nombre = 'Manejo de software contable (Conta+)'
UNION ALL
SELECT 102, id, 'Avanzado', NULL, TRUE  FROM habilidades WHERE nombre = 'Facturación electrónica SII'
UNION ALL
SELECT 102, id, 'Intermedio', NULL, TRUE FROM habilidades WHERE nombre = 'Contabilidad general'
UNION ALL
SELECT 102, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Manejo de ERP (SAP básico)'
-- blandas
UNION ALL
SELECT 102, id, 'Basico', 92, TRUE FROM habilidades WHERE nombre = 'Liderazgo básico'
UNION ALL
SELECT 102, id, 'Basico', 95, TRUE FROM habilidades WHERE nombre = 'Organización y planificación'
UNION ALL
SELECT 102, id, 'Basico', 89, TRUE FROM habilidades WHERE nombre = 'Pensamiento crítico'
UNION ALL
SELECT 102, id, 'Basico', 91, TRUE FROM habilidades WHERE nombre = 'Comunicación efectiva';

-- Diego Castillo — Mecánica
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT 103, id, 'Avanzado', NULL, TRUE  FROM habilidades WHERE nombre = 'Sistemas de frenos ABS y convencionales'
UNION ALL
SELECT 103, id, 'Avanzado', NULL, TRUE  FROM habilidades WHERE nombre = 'Suspensión y dirección'
UNION ALL
SELECT 103, id, 'Intermedio', NULL, TRUE FROM habilidades WHERE nombre = 'Diagnóstico electrónico OBD-II'
UNION ALL
SELECT 103, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Reparación de motor a gasolina'
UNION ALL
SELECT 103, id, 'Basico', NULL, FALSE  FROM habilidades WHERE nombre = 'Soldadura automotriz'
-- blandas
UNION ALL
SELECT 103, id, 'Basico', 76, TRUE FROM habilidades WHERE nombre = 'Trabajo en equipo'
UNION ALL
SELECT 103, id, 'Basico', 72, TRUE FROM habilidades WHERE nombre = 'Manejo del estrés'
UNION ALL
SELECT 103, id, 'Basico', 80, TRUE FROM habilidades WHERE nombre = 'Iniciativa y proactividad'
UNION ALL
SELECT 103, id, 'Basico', 77, TRUE FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad';

-- Fernanda Muñoz — Administración
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT 104, id, 'Avanzado', NULL, TRUE  FROM habilidades WHERE nombre = 'Contabilidad general'
UNION ALL
SELECT 104, id, 'Avanzado', NULL, TRUE  FROM habilidades WHERE nombre = 'Manejo de software contable (Conta+)'
UNION ALL
SELECT 104, id, 'Avanzado', NULL, TRUE  FROM habilidades WHERE nombre = 'Planillas Excel avanzadas'
UNION ALL
SELECT 104, id, 'Avanzado', NULL, TRUE  FROM habilidades WHERE nombre = 'Facturación electrónica SII'
UNION ALL
SELECT 104, id, 'Intermedio', NULL, TRUE FROM habilidades WHERE nombre = 'Elaboración de presupuestos'
UNION ALL
SELECT 104, id, 'Intermedio', NULL, TRUE FROM habilidades WHERE nombre = 'Manejo de caja y fondos'
-- blandas
UNION ALL
SELECT 104, id, 'Basico', 96, TRUE FROM habilidades WHERE nombre = 'Organización y planificación'
UNION ALL
SELECT 104, id, 'Basico', 94, TRUE FROM habilidades WHERE nombre = 'Pensamiento crítico'
UNION ALL
SELECT 104, id, 'Basico', 93, TRUE FROM habilidades WHERE nombre = 'Orientación al detalle'
UNION ALL
SELECT 104, id, 'Basico', 90, TRUE FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad';

-- ── Publicaciones (3 por estudiante) ─────────────────────────
-- tipo_id: 1=general, 2=logro, 3=evaluacion, 4=match, 5=vacante
-- Asume tipos_publicacion insertados en migración 03.

-- Camila Torres
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (100, (SELECT id FROM tipos_publicacion WHERE nombre='logro'),
   'Certificada en Excel Avanzado',
   'Terminé el curso de Excel Avanzado en AIEP con nota 6.8. Aprendí tablas dinámicas, VLOOKUP, macros básicas y análisis de datos. Lista para aplicarlo en contexto laboral real.',
   DATE_SUB(NOW(), INTERVAL 10 DAY)),

  (100, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Primera semana de práctica voluntaria',
   'Esta semana comencé en Librería Universitaria apoyando el área administrativa. Gestión de archivo, atención de clientes y emisión de documentos. Mucho por aprender pero el equipo es increíble.',
   DATE_SUB(NOW(), INTERVAL 25 DAY)),

  (100, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Reflexión sobre atención al cliente',
   'Después de tres meses atendiendo público aprendí que escuchar activamente es la habilidad más subestimada del área administrativa. Sin ella, ningún proceso funciona bien.',
   DATE_SUB(NOW(), INTERVAL 45 DAY));

-- Matías Sepúlveda
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (101, (SELECT id FROM tipos_publicacion WHERE nombre='logro'),
   'Certificación OBD-II aprobada',
   'Aprobé la certificación de diagnóstico OBD-II con Autozone Academy. Ahora puedo interpretar códigos de falla, analizar parámetros en tiempo real y generar informes de diagnóstico.',
   DATE_SUB(NOW(), INTERVAL 8 DAY)),

  (101, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Práctica en Taller El Fierrito',
   'Tres meses trabajando en un taller real fueron la mejor clase que pude tener. Desde el primer día metí las manos. Mantenimientos, diagnósticos y mucha paciencia con los clientes.',
   DATE_SUB(NOW(), INTERVAL 30 DAY)),

  (101, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Los vehículos híbridos son el futuro',
   'Estoy estudiando por mi cuenta los sistemas de propulsión híbrida. La diferencia entre mecánica tradicional y electrónica avanzada es enorme. Quien no se actualice va a quedar atrás.',
   DATE_SUB(NOW(), INTERVAL 60 DAY));

-- Valentina Rojas
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (102, (SELECT id FROM tipos_publicacion WHERE nombre='logro'),
   'Mejor promedio de mi generación — 6.5',
   'Cerramos el año con promedio 6.5 y primer lugar en el ranking de mi carrera. Esto es el resultado de constancia, buenos hábitos de estudio y un equipo docente comprometido.',
   DATE_SUB(NOW(), INTERVAL 5 DAY)),

  (102, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Proyecto de inventario con SAP básico',
   'En el módulo de ERP desarrollamos un sistema de inventario simulado con SAP básico. Fue desafiante pero aprendí que los sistemas integrados cambian completamente la eficiencia de una empresa.',
   DATE_SUB(NOW(), INTERVAL 20 DAY)),

  (102, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Liderazgo en el aula: lo que aprendí',
   'Fui delegada de curso durante todo el año. Coordinar reuniones, mediar conflictos y representar a mis compañeros me enseñó más de liderazgo que cualquier libro de texto.',
   DATE_SUB(NOW(), INTERVAL 50 DAY));

-- Diego Castillo
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (103, (SELECT id FROM tipos_publicacion WHERE nombre='logro'),
   'Top 3 — Competencia Regional de Diagnóstico 2023',
   'Tercer lugar en la competencia regional de diagnóstico automotriz organizada por SENCE Araucanía. Cuatro equipos, seis pruebas cronometradas. Fue una experiencia increíble.',
   DATE_SUB(NOW(), INTERVAL 15 DAY)),

  (103, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Práctica completada en Automotriz San Martín',
   'Dos meses de práctica real. Diagnóstico de fallas, cambio de pastillas, revisión de suspensión y mucha coordinación con el equipo. Me llevo experiencia que no se aprende en sala.',
   DATE_SUB(NOW(), INTERVAL 35 DAY)),

  (103, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'La soldadura automotriz es un arte',
   'Tomé un taller de soldadura en CECAP Temuco y quedé impactado. Soldar correctamente una carrocería requiere precisión, paciencia y práctica constante. Comenzando a dominar MIG.',
   DATE_SUB(NOW(), INTERVAL 55 DAY));

-- Fernanda Muñoz
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (104, (SELECT id FROM tipos_publicacion WHERE nombre='logro'),
   'Promedio 6.8 y distinción académica',
   'Terminé el semestre con promedio 6.8, distinción académica y reconocimiento del centro. Fue un semestre exigente pero cada evaluación valió la pena. Gracias a mi familia y docentes.',
   DATE_SUB(NOW(), INTERVAL 3 DAY)),

  (104, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Certificación SII — Facturación Electrónica',
   'Completé la capacitación oficial del SII en facturación electrónica. Ahora manejo con confianza el proceso completo: emisión, anulación, cesión y consulta de documentos tributarios.',
   DATE_SUB(NOW(), INTERVAL 18 DAY)),

  (104, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Tres meses como asistente contable',
   'En Constructora Andina trabajé con Conta+, hice conciliaciones bancarias y controlé inventario de materiales. Confirmo que la contabilidad real es mucho más dinámica que la del aula.',
   DATE_SUB(NOW(), INTERVAL 40 DAY));
