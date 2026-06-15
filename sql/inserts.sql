-- ============================================================
-- EmpleaMe — Datos iniciales (inserts consolidados)
-- Consolida seed.sql + seed_graficos.sql + seed_vacantes_graficos.sql
-- Adaptado al esquema 5FN:
--   - habilidades usa categoria_id en lugar de ENUM
--   - perfiles_estudiantes usa nombre/apellidos/nivel/genero
-- Ejecutar DESPUÉS de schema.sql con la base vacía.
-- ============================================================

-- ── 1. Catálogo de carreras ───────────────────────────────────
INSERT INTO carreras (nombre) VALUES
  ('Mecanica Automotriz'),
  ('Administracion');

-- ── 2. Tipos de publicación ───────────────────────────────────
INSERT INTO tipos_publicacion (nombre, descripcion) VALUES
  ('vacante',    'Publicación de una vacante o práctica profesional'),
  ('logro',      'Logro o insignia desbloqueada por un estudiante'),
  ('evaluacion', 'Resultado de evaluación docente'),
  ('match',      'Match entre estudiante y empresa'),
  ('general',    'Publicación general del centro o estudiante');

-- ── 3. Categorías de habilidades ─────────────────────────────
INSERT INTO categorias_habilidades (nombre) VALUES
  ('tecnica'),
  ('blanda');

SET @cat_tecnica = (SELECT id FROM categorias_habilidades WHERE nombre = 'tecnica');
SET @cat_blanda  = (SELECT id FROM categorias_habilidades WHERE nombre = 'blanda');

-- ── 4. Catálogo de habilidades ────────────────────────────────

-- Técnicas — Mecánica Automotriz
INSERT INTO habilidades (nombre, categoria_id) VALUES
  ('Diagnóstico electrónico OBD-II',         @cat_tecnica),
  ('Reparación de motor a gasolina',          @cat_tecnica),
  ('Reparación de motor diesel',              @cat_tecnica),
  ('Sistemas de frenos ABS y convencionales', @cat_tecnica),
  ('Suspensión y dirección',                  @cat_tecnica),
  ('Sistemas eléctricos y electrónicos',      @cat_tecnica),
  ('Cambio de aceite y filtros',              @cat_tecnica),
  ('Mantenimiento preventivo',                @cat_tecnica),
  ('Soldadura automotriz',                    @cat_tecnica),
  ('Sistemas de climatización automotriz',    @cat_tecnica),
  ('Lectura de planos y manuales técnicos',   @cat_tecnica),
  ('Uso de equipos de diagnóstico escáner',   @cat_tecnica);

-- Técnicas — Administración
INSERT INTO habilidades (nombre, categoria_id) VALUES
  ('Contabilidad general',                    @cat_tecnica),
  ('Manejo de software contable (Conta+)',    @cat_tecnica),
  ('Planillas Excel avanzadas',               @cat_tecnica),
  ('Gestión documental y archivo',            @cat_tecnica),
  ('Atención al cliente',                     @cat_tecnica),
  ('Facturación electrónica SII',             @cat_tecnica),
  ('Redacción de informes y actas',           @cat_tecnica),
  ('Gestión de recursos humanos básica',      @cat_tecnica),
  ('Manejo de ERP (SAP básico)',              @cat_tecnica),
  ('Control de inventario',                   @cat_tecnica),
  ('Manejo de caja y fondos',                 @cat_tecnica),
  ('Elaboración de presupuestos',             @cat_tecnica);

-- Blandas / socioemocionales (compartidas)
INSERT INTO habilidades (nombre, categoria_id) VALUES
  ('Trabajo en equipo',                       @cat_blanda),
  ('Comunicación efectiva',                   @cat_blanda),
  ('Responsabilidad y puntualidad',           @cat_blanda),
  ('Resolución de problemas',                 @cat_blanda),
  ('Adaptabilidad al cambio',                 @cat_blanda),
  ('Orientación al detalle',                  @cat_blanda),
  ('Iniciativa y proactividad',               @cat_blanda),
  ('Manejo del estrés',                       @cat_blanda),
  ('Empatía y relaciones interpersonales',    @cat_blanda),
  ('Liderazgo básico',                        @cat_blanda),
  ('Organización y planificación',            @cat_blanda),
  ('Pensamiento crítico',                     @cat_blanda);

-- ── 6. Usuarios base de prueba ────────────────────────────────
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES
  ('estudiante@empleame.cl', 'estudiante123', 'estudiante'),
  ('empresa@empleame.cl',    'empresa123',    'empresa'),
  ('colegio@empleame.cl',    'colegio123',    'colegio'),
  ('slep@empleame.cl',       'slep123',       'slep');

INSERT INTO perfiles_slep (usuario_id, nombre_organismo, telefono_contacto, descripcion, region)
  VALUES (4, 'SLEP Santiago Centro', '+56222001122',
    'Servicio Local de Educación Pública del sector centro de Santiago. Administra establecimientos técnico-profesionales con foco en mecánica automotriz y administración de empresas.',
    'Región Metropolitana de Santiago');

INSERT INTO perfiles_colegios (usuario_id, slep_id, nombre_institucion, telefono_contacto, descripcion, region, comuna)
  VALUES (3, 4, 'C.E. Cardenal J.M. Caro', '+56222334455',
    'Centro educacional técnico profesional con especialidades en Mecánica Automotriz y Administración. Más de 30 años formando técnicos para el mercado laboral de la Región Metropolitana.',
    'Región Metropolitana de Santiago', 'Santiago');
INSERT INTO colegio_carreras (colegio_id, carrera_id) SELECT 3, id FROM carreras WHERE nombre IN ('Mecanica Automotriz', 'Administracion');

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio,
   calificacion_docente, telefono, biografia, estado_civil, genero, region, comuna, colegio_id)
VALUES
  (1, 'Juan', 'Pérez', 'González', '20.987.654-3',
   (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
   '3° Medio', 5.9, 6.1, '+56 9 1234 5678',
   'Técnico en formación en Mecánica Automotriz con especial interés en diagnóstico electrónico y vehículos eléctricos. He participado en talleres de OBD-II, mantenimiento preventivo y reparación de motor en el taller escolar. Busco una práctica profesional donde pueda aplicar mis conocimientos junto a técnicos experimentados.',
   'soltero', 'masculino', 'Región Metropolitana de Santiago', 'Santiago', 3);

INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES
  (1, 'Español', 'Nativo'),
  (1, 'Inglés',  'Básico');

INSERT INTO historial_academico (estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin) VALUES
  (1, 'C.E. Cardenal J.M. Caro',   'Técnico en Mecánica Automotriz', 'Automotriz',  2022, NULL),
  (1, 'INACAP Santiago Centro',     'Taller OBD-II y Diagnóstico Electrónico', 'Diagnóstico', 2023, 2023),
  (1, 'Autozone Academy (online)',  'Certificación Mantenimiento Preventivo',  'Automotriz',  2024, 2024);

INSERT INTO historial_laboral (estudiante_id, empresa_nombre, cargo, fecha_inicio, fecha_fin, descripcion, tipo) VALUES
  (1, 'Taller Mecánico Pérez e Hijo', 'Ayudante mecánico', '2023-07-01', '2023-12-31',
   'Apoyo en cambios de aceite, filtros, revisión de frenos y diagnóstico básico en vehículos livianos del taller familiar.', 'verificado'),
  (1, 'Taller Automotriz del Sur',    'Practicante técnico', '2024-03-01', '2024-06-30',
   'Práctica voluntaria en área de diagnóstico electrónico y mantención preventiva. Uso de scanner OBD-II en vehículos reales.', 'verificado');

INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT 1, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Diagnóstico electrónico OBD-II'          UNION ALL
  SELECT 1, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Cambio de aceite y filtros'              UNION ALL
  SELECT 1, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Mantenimiento preventivo'                UNION ALL
  SELECT 1, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Reparación de motor a gasolina'          UNION ALL
  SELECT 1, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Sistemas de frenos ABS y convencionales' UNION ALL
  SELECT 1, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Sistemas eléctricos y electrónicos'      UNION ALL
  SELECT 1, id, 'Basico',     NULL, FALSE FROM habilidades WHERE nombre = 'Suspensión y dirección'                  UNION ALL
  SELECT 1, id, 'Basico',      91,  TRUE  FROM habilidades WHERE nombre = 'Trabajo en equipo'                       UNION ALL
  SELECT 1, id, 'Basico',      88,  TRUE  FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad'           UNION ALL
  SELECT 1, id, 'Basico',      85,  TRUE  FROM habilidades WHERE nombre = 'Resolución de problemas'                 UNION ALL
  SELECT 1, id, 'Basico',      82,  FALSE FROM habilidades WHERE nombre = 'Adaptabilidad al cambio';

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (1, (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Completé mi certificación en diagnóstico OBD-II',
   'Después de semanas de práctica en el taller escolar, completé el taller de diagnóstico electrónico en INACAP. Aprendí a leer códigos de falla, analizar parámetros en tiempo real y descartar fallas intermitentes. Un paso importante para mi carrera.',
   DATE_SUB(NOW(), INTERVAL 55 DAY)),
  (1, (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Primera semana de práctica en Taller Automotriz del Sur',
   'Esta semana arranqué mi práctica voluntaria. El primer día me pusieron a hacer cambios de aceite y revisión de frenos, y al tercer día ya estaba con el scanner en mano. El equipo es increíble y aprendo algo nuevo cada hora.',
   DATE_SUB(NOW(), INTERVAL 38 DAY)),
  (1, (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Por qué me apasionan los vehículos eléctricos',
   'Desde que vimos el módulo de sistemas eléctricos me enganché. La idea de que un motor sin combustión pueda generar ese torque es fascinante. Mi meta es especializarme en diagnóstico de EVs una vez que egrese.',
   DATE_SUB(NOW(), INTERVAL 15 DAY)),
  (1, (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Diagnostiqué mi primera falla real sin ayuda',
   'Un Toyota Yaris entró al taller con la luz de check engine encendida. Conecté el scanner, leí el código P0420 (catalizador ineficiente), verifiqué los sensores de O2 y confirmé el diagnóstico. El técnico a cargo me felicitó. Ese momento valió todo el esfuerzo.',
   DATE_SUB(NOW(), INTERVAL 4 DAY));

INSERT INTO perfiles_empresas (usuario_id, nombre_empresa, telefono_contacto, descripcion, region, comuna)
  VALUES (2, 'Taller Automotriz del Sur', '+56922334455',
    'Empresa dedicada al mantenimiento y reparación de vehículos livianos y pesados. Contamos con taller equipado para diagnóstico electrónico, mecánica general y servicio de neumáticos. Ofrecemos prácticas profesionales supervisadas.',
    'Región Metropolitana de Santiago', 'San Miguel');

-- ── 7. Estudiantes demo ───────────────────────────────────────
DELETE FROM usuarios WHERE correo IN (
  'camila.torres@demo.cl', 'matias.sepulveda@demo.cl', 'valentina.rojas@demo.cl',
  'diego.castillo@demo.cl', 'fernanda.munoz@demo.cl'
);

-- ── Estudiante 1: Camila Torres (Administración) ─────────────
INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('camila.torres@demo.cl', 'Demo1234', 'estudiante');
SET @u1 = LAST_INSERT_ID();

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio,
   calificacion_docente, telefono, biografia, estado_civil, genero, region, comuna, colegio_id)
VALUES
  (@u1, 'Camila', 'Torres', 'Ríos', '20.111.222-3',
   (SELECT id FROM carreras WHERE nombre = 'Administracion'),
   '4° Medio', 6.2, 6.5, '+56 9 1234 5001',
   'Estudiante de Administración con enfoque en gestión documental y contabilidad. Proactiva, organizada y con experiencia en atención al cliente durante prácticas voluntarias.',
   'soltero', 'femenino', 'Región Metropolitana de Santiago', 'Santiago', 3);

INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES
  (@u1, 'Español', 'Nativo'), (@u1, 'Inglés', 'Intermedio');

INSERT INTO historial_academico (estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin) VALUES
  (@u1, 'C.E. Cardenal J.M. Caro', 'Técnico en Administración', 'Administración de Empresas', 2022, NULL),
  (@u1, 'Instituto AIEP', 'Curso Excel Avanzado', 'Ofimática', 2023, 2023);

INSERT INTO historial_laboral (estudiante_id, empresa_nombre, cargo, fecha_inicio, fecha_fin, descripcion, tipo) VALUES
  (@u1, 'Librería Universitaria Ltda.', 'Auxiliar administrativo', '2023-01-10', '2023-03-31',
   'Apoyo en gestión documental, archivo físico y atención de público.', 'verificado');

INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT @u1, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Gestión documental y archivo'   UNION ALL
SELECT @u1, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Atención al cliente'            UNION ALL
SELECT @u1, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Planillas Excel avanzadas'      UNION ALL
SELECT @u1, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Facturación electrónica SII'    UNION ALL
SELECT @u1, id, 'Basico',     NULL, FALSE FROM habilidades WHERE nombre = 'Contabilidad general'           UNION ALL
SELECT @u1, id, 'Basico',      88,  TRUE  FROM habilidades WHERE nombre = 'Trabajo en equipo'              UNION ALL
SELECT @u1, id, 'Basico',      85,  TRUE  FROM habilidades WHERE nombre = 'Comunicación efectiva'          UNION ALL
SELECT @u1, id, 'Basico',      90,  TRUE  FROM habilidades WHERE nombre = 'Organización y planificación'   UNION ALL
SELECT @u1, id, 'Basico',      78,  TRUE  FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad';

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (@u1, (SELECT id FROM tipos_publicacion WHERE nombre='logro'),
   'Certificada en Excel Avanzado',
   'Terminé el curso de Excel Avanzado en AIEP con nota 6.8. Aprendí tablas dinámicas, VLOOKUP, macros básicas y análisis de datos. Lista para aplicarlo en contexto laboral real.',
   DATE_SUB(NOW(), INTERVAL 10 DAY)),
  (@u1, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Primera semana de práctica voluntaria',
   'Esta semana comencé en Librería Universitaria apoyando el área administrativa. Gestión de archivo, atención de clientes y emisión de documentos. Mucho por aprender pero el equipo es increíble.',
   DATE_SUB(NOW(), INTERVAL 25 DAY)),
  (@u1, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Reflexión sobre atención al cliente',
   'Después de tres meses atendiendo público aprendí que escuchar activamente es la habilidad más subestimada del área administrativa. Sin ella, ningún proceso funciona bien.',
   DATE_SUB(NOW(), INTERVAL 45 DAY));

-- ── Estudiante 2: Matías Sepúlveda (Mecánica Automotriz) ─────
INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('matias.sepulveda@demo.cl', 'Demo1234', 'estudiante');
SET @u2 = LAST_INSERT_ID();

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio,
   calificacion_docente, telefono, biografia, estado_civil, genero, region, comuna, colegio_id)
VALUES
  (@u2, 'Matías', 'Sepúlveda', 'Vera', '20.222.333-4',
   (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
   '3° Medio', 5.8, 6.1, '+56 9 1234 5002',
   'Apasionado por la mecánica moderna y los sistemas eléctricos vehiculares. Experiencia en diagnóstico OBD-II y mantenimiento preventivo en taller escolar.',
   'soltero', 'masculino', 'Región de Valparaíso', 'Viña del Mar', 3);

INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES
  (@u2, 'Español', 'Nativo'), (@u2, 'Inglés', 'Básico');

INSERT INTO historial_academico (estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin) VALUES
  (@u2, 'C.E. Cardenal J.M. Caro', 'Técnico en Mecánica Automotriz', 'Automotriz', 2022, NULL),
  (@u2, 'Autozone Academy', 'Certificación OBD-II Básico', 'Diagnóstico', 2023, 2023);

INSERT INTO historial_laboral (estudiante_id, empresa_nombre, cargo, fecha_inicio, fecha_fin, descripcion, tipo) VALUES
  (@u2, 'Taller Mecánico El Fierrito', 'Ayudante mecánico', '2023-07-01', '2023-09-30',
   'Mantenimiento preventivo, cambio de aceite y rotación de neumáticos.', 'verificado');

INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT @u2, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Diagnóstico electrónico OBD-II'          UNION ALL
SELECT @u2, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Cambio de aceite y filtros'              UNION ALL
SELECT @u2, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Sistemas eléctricos y electrónicos'      UNION ALL
SELECT @u2, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Mantenimiento preventivo'                UNION ALL
SELECT @u2, id, 'Basico',     NULL, FALSE FROM habilidades WHERE nombre = 'Sistemas de frenos ABS y convencionales' UNION ALL
SELECT @u2, id, 'Basico',      80,  TRUE  FROM habilidades WHERE nombre = 'Resolución de problemas'                 UNION ALL
SELECT @u2, id, 'Basico',      75,  TRUE  FROM habilidades WHERE nombre = 'Adaptabilidad al cambio'                 UNION ALL
SELECT @u2, id, 'Basico',      70,  TRUE  FROM habilidades WHERE nombre = 'Orientación al detalle'                  UNION ALL
SELECT @u2, id, 'Basico',      82,  TRUE  FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad';

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (@u2, (SELECT id FROM tipos_publicacion WHERE nombre='logro'),
   'Certificación OBD-II aprobada',
   'Aprobé la certificación de diagnóstico OBD-II con Autozone Academy. Ahora puedo interpretar códigos de falla, analizar parámetros en tiempo real y generar informes de diagnóstico.',
   DATE_SUB(NOW(), INTERVAL 8 DAY)),
  (@u2, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Práctica en Taller El Fierrito',
   'Tres meses trabajando en un taller real fueron la mejor clase que pude tener. Desde el primer día metí las manos. Mantenimientos, diagnósticos y mucha paciencia con los clientes.',
   DATE_SUB(NOW(), INTERVAL 30 DAY)),
  (@u2, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Los vehículos híbridos son el futuro',
   'Estoy estudiando por mi cuenta los sistemas de propulsión híbrida. La diferencia entre mecánica tradicional y electrónica avanzada es enorme. Quien no se actualice va a quedar atrás.',
   DATE_SUB(NOW(), INTERVAL 60 DAY));

-- ── Estudiante 3: Valentina Rojas (Administración) ───────────
INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('valentina.rojas@demo.cl', 'Demo1234', 'estudiante');
SET @u3 = LAST_INSERT_ID();

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio,
   calificacion_docente, telefono, biografia, estado_civil, genero, region, comuna, colegio_id)
VALUES
  (@u3, 'Valentina', 'Rojas', 'Mena', '20.333.444-5',
   (SELECT id FROM carreras WHERE nombre = 'Administracion'),
   '2° Medio', 6.5, 6.7, '+56 9 1234 5003',
   'Estudiante con sólido manejo de herramientas contables y ERP. Orientada al detalle y con habilidades de liderazgo demostradas en proyectos de aula.',
   'soltero', 'femenino', 'Región del Biobío', 'Concepción', 3);

INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES
  (@u3, 'Español', 'Nativo'), (@u3, 'Inglés', 'Avanzado'), (@u3, 'Portugués', 'Básico');

INSERT INTO historial_academico (estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin) VALUES
  (@u3, 'C.E. Cardenal J.M. Caro', 'Técnico en Administración', 'Administración de Empresas', 2023, NULL),
  (@u3, 'SENCE', 'Curso de Liderazgo Joven', 'Habilidades directivas', 2023, 2023);

INSERT INTO historial_laboral (estudiante_id, empresa_nombre, cargo, fecha_inicio, fecha_fin, descripcion, tipo) VALUES
  (@u3, 'Multitienda Central S.A.', 'Cajera y facturación', '2024-01-15', '2024-03-31',
   'Operación de caja, emisión de boletas y facturas electrónicas vía SII.', 'verificado');

INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT @u3, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Planillas Excel avanzadas'           UNION ALL
SELECT @u3, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Manejo de software contable (Conta+)' UNION ALL
SELECT @u3, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Facturación electrónica SII'         UNION ALL
SELECT @u3, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Contabilidad general'                UNION ALL
SELECT @u3, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Manejo de ERP (SAP básico)'          UNION ALL
SELECT @u3, id, 'Basico',      92,  TRUE  FROM habilidades WHERE nombre = 'Liderazgo básico'                    UNION ALL
SELECT @u3, id, 'Basico',      95,  TRUE  FROM habilidades WHERE nombre = 'Organización y planificación'        UNION ALL
SELECT @u3, id, 'Basico',      89,  TRUE  FROM habilidades WHERE nombre = 'Pensamiento crítico'                 UNION ALL
SELECT @u3, id, 'Basico',      91,  TRUE  FROM habilidades WHERE nombre = 'Comunicación efectiva';

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (@u3, (SELECT id FROM tipos_publicacion WHERE nombre='logro'),
   'Mejor promedio de mi generación — 6.5',
   'Cerramos el año con promedio 6.5 y primer lugar en el ranking de mi carrera. Esto es el resultado de constancia, buenos hábitos de estudio y un equipo docente comprometido.',
   DATE_SUB(NOW(), INTERVAL 5 DAY)),
  (@u3, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Proyecto de inventario con SAP básico',
   'En el módulo de ERP desarrollamos un sistema de inventario simulado con SAP básico. Fue desafiante pero aprendí que los sistemas integrados cambian completamente la eficiencia de una empresa.',
   DATE_SUB(NOW(), INTERVAL 20 DAY)),
  (@u3, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Liderazgo en el aula: lo que aprendí',
   'Fui delegada de curso durante todo el año. Coordinar reuniones, mediar conflictos y representar a mis compañeros me enseñó más de liderazgo que cualquier libro de texto.',
   DATE_SUB(NOW(), INTERVAL 50 DAY));

-- ── Estudiante 4: Diego Castillo (Mecánica Automotriz) ───────
INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('diego.castillo@demo.cl', 'Demo1234', 'estudiante');
SET @u4 = LAST_INSERT_ID();

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio,
   calificacion_docente, telefono, biografia, estado_civil, genero, region, comuna, colegio_id)
VALUES
  (@u4, 'Diego', 'Castillo', 'Parra', '20.444.555-6',
   (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
   '4° Medio', 5.5, 5.9, '+56 9 1234 5004',
   'Técnico en formación con especialización en sistemas de frenos y suspensión. Participó en competencia regional de diagnóstico automotriz 2023.',
   'soltero', 'masculino', 'Región de La Araucanía', 'Temuco', 3);

INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES
  (@u4, 'Español', 'Nativo'), (@u4, 'Inglés', 'Básico');

INSERT INTO historial_academico (estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin) VALUES
  (@u4, 'C.E. Cardenal J.M. Caro', 'Técnico en Mecánica Automotriz', 'Automotriz', 2022, NULL),
  (@u4, 'CECAP Temuco', 'Taller de Soldadura Básica', 'Metalmecánica', 2023, 2023);

INSERT INTO historial_laboral (estudiante_id, empresa_nombre, cargo, fecha_inicio, fecha_fin, descripcion, tipo) VALUES
  (@u4, 'Automotriz San Martín', 'Practicante mecánica', '2023-07-10', '2023-09-10',
   'Diagnóstico electrónico de vehículos livianos y reemplazo de pastillas de freno.', 'practica_completada');

INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT @u4, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Sistemas de frenos ABS y convencionales' UNION ALL
SELECT @u4, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Suspensión y dirección'                  UNION ALL
SELECT @u4, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Diagnóstico electrónico OBD-II'          UNION ALL
SELECT @u4, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Reparación de motor a gasolina'          UNION ALL
SELECT @u4, id, 'Basico',     NULL, FALSE FROM habilidades WHERE nombre = 'Soldadura automotriz'                    UNION ALL
SELECT @u4, id, 'Basico',      76,  TRUE  FROM habilidades WHERE nombre = 'Trabajo en equipo'                       UNION ALL
SELECT @u4, id, 'Basico',      72,  TRUE  FROM habilidades WHERE nombre = 'Manejo del estrés'                       UNION ALL
SELECT @u4, id, 'Basico',      80,  TRUE  FROM habilidades WHERE nombre = 'Iniciativa y proactividad'               UNION ALL
SELECT @u4, id, 'Basico',      77,  TRUE  FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad';

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (@u4, (SELECT id FROM tipos_publicacion WHERE nombre='logro'),
   'Top 3 — Competencia Regional de Diagnóstico 2023',
   'Tercer lugar en la competencia regional de diagnóstico automotriz organizada por SENCE Araucanía. Cuatro equipos, seis pruebas cronometradas. Fue una experiencia increíble.',
   DATE_SUB(NOW(), INTERVAL 15 DAY)),
  (@u4, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Práctica completada en Automotriz San Martín',
   'Dos meses de práctica real. Diagnóstico de fallas, cambio de pastillas, revisión de suspensión y mucha coordinación con el equipo. Me llevo experiencia que no se aprende en sala.',
   DATE_SUB(NOW(), INTERVAL 35 DAY)),
  (@u4, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'La soldadura automotriz es un arte',
   'Tomé un taller de soldadura en CECAP Temuco y quedé impactado. Soldar correctamente una carrocería requiere precisión, paciencia y práctica constante. Comenzando a dominar MIG.',
   DATE_SUB(NOW(), INTERVAL 55 DAY));

-- ── Estudiante 5: Fernanda Muñoz (Administración) ────────────
INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('fernanda.munoz@demo.cl', 'Demo1234', 'estudiante');
SET @u5 = LAST_INSERT_ID();

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio,
   calificacion_docente, telefono, biografia, estado_civil, genero, region, comuna, colegio_id)
VALUES
  (@u5, 'Fernanda', 'Muñoz', 'Lagos', '20.555.666-7',
   (SELECT id FROM carreras WHERE nombre = 'Administracion'),
   '3° Medio', 6.8, 6.9, '+56 9 1234 5005',
   'Top de su generación en Administración. Maneja software contable Conta+, Excel avanzado y tiene certificación SII en facturación electrónica.',
   'soltero', 'femenino', 'Región de Los Lagos', 'Puerto Montt', 3);

INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES
  (@u5, 'Español', 'Nativo'), (@u5, 'Inglés', 'Intermedio');

INSERT INTO historial_academico (estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin) VALUES
  (@u5, 'C.E. Cardenal J.M. Caro', 'Técnico en Administración', 'Administración de Empresas', 2023, NULL),
  (@u5, 'SII Chile', 'Facturación Electrónica', 'Tributación', 2024, 2024);

INSERT INTO historial_laboral (estudiante_id, empresa_nombre, cargo, fecha_inicio, fecha_fin, descripcion, tipo) VALUES
  (@u5, 'Constructora Andina SpA', 'Asistente contable', '2024-01-08', '2024-03-29',
   'Registro de facturas en Conta+, conciliación bancaria y control de inventario de materiales.', 'verificado');

INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT @u5, id, 'Avanzado',   NULL, TRUE FROM habilidades WHERE nombre = 'Contabilidad general'                  UNION ALL
SELECT @u5, id, 'Avanzado',   NULL, TRUE FROM habilidades WHERE nombre = 'Manejo de software contable (Conta+)'  UNION ALL
SELECT @u5, id, 'Avanzado',   NULL, TRUE FROM habilidades WHERE nombre = 'Planillas Excel avanzadas'             UNION ALL
SELECT @u5, id, 'Avanzado',   NULL, TRUE FROM habilidades WHERE nombre = 'Facturación electrónica SII'           UNION ALL
SELECT @u5, id, 'Intermedio', NULL, TRUE FROM habilidades WHERE nombre = 'Elaboración de presupuestos'           UNION ALL
SELECT @u5, id, 'Intermedio', NULL, TRUE FROM habilidades WHERE nombre = 'Manejo de caja y fondos'               UNION ALL
SELECT @u5, id, 'Basico',      96,  TRUE FROM habilidades WHERE nombre = 'Organización y planificación'          UNION ALL
SELECT @u5, id, 'Basico',      94,  TRUE FROM habilidades WHERE nombre = 'Pensamiento crítico'                   UNION ALL
SELECT @u5, id, 'Basico',      93,  TRUE FROM habilidades WHERE nombre = 'Orientación al detalle'                UNION ALL
SELECT @u5, id, 'Basico',      90,  TRUE FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad';

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (@u5, (SELECT id FROM tipos_publicacion WHERE nombre='logro'),
   'Promedio 6.8 y distinción académica',
   'Terminé el semestre con promedio 6.8, distinción académica y reconocimiento del centro. Fue un semestre exigente pero cada evaluación valió la pena.',
   DATE_SUB(NOW(), INTERVAL 3 DAY)),
  (@u5, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Certificación SII — Facturación Electrónica',
   'Completé la capacitación oficial del SII en facturación electrónica. Ahora manejo con confianza el proceso completo: emisión, anulación, cesión y consulta de documentos tributarios.',
   DATE_SUB(NOW(), INTERVAL 18 DAY)),
  (@u5, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Tres meses como asistente contable',
   'En Constructora Andina trabajé con Conta+, hice conciliaciones bancarias y controlé inventario de materiales. La contabilidad real es mucho más dinámica que la del aula.',
   DATE_SUB(NOW(), INTERVAL 40 DAY));

-- ── 8. Vacantes y postulaciones de la empresa base (id=2) ──────
INSERT INTO vacantes (empresa_id, titulo, descripcion, requisitos, esta_activa, tipo, area, modalidad, duracion, remuneracion, fecha_limite, fecha_creacion) VALUES
  (2, 'Practicante en Mecánica Automotriz',
   'Buscamos practicante para apoyar en mantención preventiva, diagnóstico electrónico y reparación de vehículos livianos. Trabajará junto a mecánicos certificados en un taller moderno y equipado.',
   'Estudiante de Mecánica Automotriz en 3° o 4° Medio. Conocimientos básicos en diagnóstico OBD-II y mantenimiento preventivo.',
   TRUE, 'practica', 'Automotriz', 'presencial', '6 meses', '$250.000',
   DATE_ADD(CURDATE(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
  (2, 'Técnico Automotriz Junior',
   'Posición permanente para técnico junior en área de diagnóstico y reparación de vehículos livianos y semipesados. Incluye capacitación continua y posibilidad de crecimiento interno.',
   'Egresado o estudiante en último año de Mecánica Automotriz. Deseable experiencia en taller.',
   TRUE, 'puesto_laboral', 'Automotriz', 'presencial', 'Indefinido', '$480.000',
   DATE_ADD(CURDATE(), INTERVAL 90 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY));

SET @v_taller_prac = (SELECT id FROM vacantes WHERE empresa_id = 2 AND tipo = 'practica'       LIMIT 1);
SET @v_taller_plab = (SELECT id FROM vacantes WHERE empresa_id = 2 AND tipo = 'puesto_laboral' LIMIT 1);

INSERT INTO postulaciones (vacante_id, estudiante_id, estado, fecha_creacion) VALUES
  (@v_taller_prac, (SELECT id FROM usuarios WHERE correo = 'estudiante@empleame.cl'),   'pendiente', DATE_SUB(NOW(), INTERVAL 10 DAY)),
  (@v_taller_prac, (SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'), 'pendiente', DATE_SUB(NOW(), INTERVAL 8  DAY)),
  (@v_taller_prac, (SELECT id FROM usuarios WHERE correo = 'diego.castillo@demo.cl'),   'pendiente', DATE_SUB(NOW(), INTERVAL 6  DAY)),
  (@v_taller_plab, (SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'), 'pendiente', DATE_SUB(NOW(), INTERVAL 7  DAY)),
  (@v_taller_plab, (SELECT id FROM usuarios WHERE correo = 'diego.castillo@demo.cl'),   'pendiente', DATE_SUB(NOW(), INTERVAL 5  DAY)),
  (@v_taller_plab, (SELECT id FROM usuarios WHERE correo = 'estudiante@empleame.cl'),   'pendiente', DATE_SUB(NOW(), INTERVAL 14 DAY));

-- ── 8. Publicaciones con imágenes ─────────────────────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  ((SELECT id FROM usuarios WHERE correo = 'camila.torres@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Así se ve mi área de trabajo en práctica',
   'Pasar de la sala de clases a un escritorio real con expedientes físicos, carpetas y un computador con sistema de gestión fue un salto enorme.',
   '/api/media/uploads/camila_escritorio.jpg', DATE_SUB(NOW(), INTERVAL 12 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'camila.torres@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Certificado impreso en mis manos',
   'Hoy recibí el certificado físico del curso de Excel Avanzado. Verlo impreso con mi nombre le da otro peso.',
   '/api/media/uploads/camila_diploma.jpg', DATE_SUB(NOW(), INTERVAL 7 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Así luce el motor que diagnostiqué hoy',
   'Motor 1.6 con falla intermitente en sensor MAP. Conecté el scanner, leí los parámetros en tiempo real y di con el problema en menos de 20 minutos.',
   '/api/media/uploads/matias_motor.jpg', DATE_SUB(NOW(), INTERVAL 6 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Mi kit de diagnóstico OBD-II',
   'Junté durante meses para comprar mi propio scanner OBD-II. Ya no dependo del equipo del taller para practicar.',
   '/api/media/uploads/matias_obd.jpg', DATE_SUB(NOW(), INTERVAL 20 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'valentina.rojas@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Equipo ganador — proyecto semestral',
   'Lideramos el proyecto de gestión empresarial más evaluado del semestre. Cuatro personas, tres semanas, un resultado que superó las expectativas del docente.',
   '/api/media/uploads/valentina_equipo.jpg', DATE_SUB(NOW(), INTERVAL 4 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'valentina.rojas@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Así quedó nuestro sistema de inventario en SAP',
   'Después de dos semanas configurando el módulo MM en SAP básico, finalmente el sistema de inventario simulado funciona de punta a punta.',
   '/api/media/uploads/valentina_sap.jpg', DATE_SUB(NOW(), INTERVAL 22 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'diego.castillo@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Competencia regional — detrás de cámaras',
   'Antes de subir al podio hubo horas de preparación, cronómetros, fallas simuladas y mucha adrenalina.',
   '/api/media/uploads/diego_taller.jpg', DATE_SUB(NOW(), INTERVAL 14 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'diego.castillo@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Primera soldadura MIG que no quedó mal',
   'Tres intentos fallidos antes de este resultado. La soldadura MIG requiere una combinación de velocidad, ángulo y calor que solo se aprende equivocándose.',
   '/api/media/uploads/diego_soldadura.jpg', DATE_SUB(NOW(), INTERVAL 48 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'fernanda.munoz@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Cierre de mes en Constructora Andina',
   'Primer cierre contable real de mi vida. Conciliación bancaria, cuadre de facturas y reporte para el contador senior.',
   '/api/media/uploads/fernanda_contabilidad.jpg', DATE_SUB(NOW(), INTERVAL 38 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'fernanda.munoz@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Mi escritorio el día de la distinción académica',
   'Esta foto la tomé antes de ir a la ceremonia. Promedio 6.8, distinción académica y la certeza de que el esfuerzo tiene sentido.',
   '/api/media/uploads/fernanda_escritorio.jpg', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ── 9. Publicaciones distribuidas en el semestre ──────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  ((SELECT id FROM usuarios WHERE correo = 'camila.torres@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Primer día buscando práctica profesional',
   'Hoy empecé a revisar ofertas de práctica en serio. Tenía el perfil a medias, lo completé todo. Nerviosa pero lista.',
   DATE_SUB(NOW(), INTERVAL 3 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Escaneé mi primer vehículo con falla real',
   'Hoy en el taller escolar llegó un Hyundai con luz de check engine. Código P0301: falla de encendido en cilindro 1. Primera vez que siento que sé lo que hago.',
   DATE_SUB(NOW(), INTERVAL 8 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'valentina.rojas@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Terminé mi módulo de contabilidad de costos',
   'Módulo terminado con nota 6.7. Costeo por absorción, costeo variable, punto de equilibrio y análisis de márgenes.',
   DATE_SUB(NOW(), INTERVAL 18 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'diego.castillo@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Motor desmontado y vuelto a armar — lo logramos',
   'Desmontaje y montaje completo de motor a gasolina 1.6L. Cuatro compañeros, cuatro horas, cero piezas sobrando al final.',
   DATE_SUB(NOW(), INTERVAL 33 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'fernanda.munoz@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Aprendí a hacer una conciliación bancaria de verdad',
   'Extracto bancario con 47 movimientos y el libro mayor para cruzar. Encontré tres diferencias. Pequeño logro, gran aprendizaje.',
   DATE_SUB(NOW(), INTERVAL 50 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'camila.torres@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Conseguí mi primera entrevista de práctica',
   'Me llamaron de una empresa de servicios para una entrevista la próxima semana. Sea cual sea el resultado, ya es un avance enorme.',
   DATE_SUB(NOW(), INTERVAL 67 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'valentina.rojas@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Presentamos proyecto final de ERP en clases',
   'Hoy expusimos el proyecto de gestión con SAP básico frente a toda la generación. El profe dijo que fue la presentación más completa del año.',
   DATE_SUB(NOW(), INTERVAL 82 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Por qué elegí Mecánica Automotriz y no me arrepiento',
   'Me gusta resolver problemas que tienen una causa real y una solución concreta. Cada día que entro al taller confirmo que tomé la decisión correcta.',
   DATE_SUB(NOW(), INTERVAL 105 DAY));

-- ── 10. Publicaciones con imagen distribuidas en el semestre ───
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  ((SELECT id FROM usuarios WHERE correo = 'camila.torres@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Reunión de equipo antes de la evaluación',
   'Hoy nos juntamos antes de la evaluación modular para repasar juntos. Nerviosa pero lista.',
   '/api/media/uploads/camila_reunion.jpg', DATE_SUB(NOW(), INTERVAL 5 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'El taller a las 7 AM — así arrancamos',
   'Primera hora en el taller y ya hay tres autos en fila. Me gusta llegar temprano.',
   '/api/media/uploads/matias_taller2.jpg', DATE_SUB(NOW(), INTERVAL 22 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'valentina.rojas@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Presentación bajo presión: lo que aprendí',
   'Exponer frente a 30 personas con 10 minutos de preparación. Cuando no tienes tiempo de pensar demasiado, sale lo que realmente sabes.',
   '/api/media/uploads/valentina_presion.jpg', DATE_SUB(NOW(), INTERVAL 41 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'diego.castillo@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Desarmando el motor de un auto eléctrico',
   'Hoy el profe trajo un motor eléctrico para que lo analizáramos. La cantidad de componentes que reemplazan el sistema de transmisión tradicional es impresionante.',
   '/api/media/uploads/diego_motor2.jpg', DATE_SUB(NOW(), INTERVAL 60 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'fernanda.munoz@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Revisando los números del cierre con el equipo',
   'Última reunión antes de entregar el informe de cierre. Todos alineados, todo cuadrado.',
   '/api/media/uploads/fernanda_reunion.jpg', DATE_SUB(NOW(), INTERVAL 78 DAY));

-- ── 11. Colegios adicionales y sus estudiantes ────────────────
DELETE FROM usuarios WHERE correo IN (
  'colegio2@empleame.cl', 'colegio3@empleame.cl',
  'andres.fuentes@demo.cl', 'catalina.medina@demo.cl', 'nicolas.vargas@demo.cl',
  'isidora.lagos@demo.cl', 'benjamin.soto@demo.cl', 'renata.espinoza@demo.cl'
);

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('colegio2@empleame.cl', 'Demo1234', 'colegio');
SET @c2 = LAST_INSERT_ID();
INSERT INTO perfiles_colegios (usuario_id, slep_id, nombre_institucion, telefono_contacto, descripcion, region, comuna)
VALUES (@c2, 4, 'Liceo Técnico Arturo Prat', '+56332201890',
  'Liceo técnico profesional con especialidades en administración y mecánica automotriz.',
  'Región de Valparaíso', 'Valparaíso');
INSERT INTO colegio_carreras (colegio_id, carrera_id) SELECT @c2, id FROM carreras WHERE nombre IN ('Mecanica Automotriz', 'Administracion');

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('colegio3@empleame.cl', 'Demo1234', 'colegio');
SET @c3 = LAST_INSERT_ID();
INSERT INTO perfiles_colegios (usuario_id, slep_id, nombre_institucion, telefono_contacto, descripcion, region, comuna)
VALUES (@c3, 4, 'C.E. Gabriela Mistral', '+56412345678',
  'Centro educacional con fuerte énfasis en formación técnica y vinculación con el mundo laboral regional.',
  'Región del Biobío', 'Concepción');
INSERT INTO colegio_carreras (colegio_id, carrera_id) SELECT @c3, id FROM carreras WHERE nombre IN ('Mecanica Automotriz', 'Administracion');

-- Estudiante 6: Andrés Fuentes — Mecánica (Liceo Arturo Prat)
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('andres.fuentes@demo.cl', 'Demo1234', 'estudiante');
SET @u6 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes
  (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio,
   calificacion_docente, telefono, biografia, estado_civil, genero, region, comuna, colegio_id)
VALUES (@u6, 'Andrés', 'Fuentes', 'Tapia', '21.111.222-3',
  (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
  '2° Medio', 5.6, 5.8, '+56 9 1234 5006',
  'Técnico en formación con interés en sistemas de climatización y diagnóstico electrónico.',
  'soltero', 'masculino', 'Región de Valparaíso', 'Valparaíso', @c2);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@u6, 'Español', 'Nativo'), (@u6, 'Inglés', 'Básico');
INSERT INTO historial_academico (estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin) VALUES
  (@u6, 'Liceo Técnico Arturo Prat',   'Técnico en Mecánica Automotriz',            'Automotriz',  2023, NULL),
  (@u6, 'INACAP Valparaíso',            'Taller OBD-II y Diagnóstico Electrónico',   'Diagnóstico', 2024, 2024),
  (@u6, 'Autozone Academy (online)',    'Certificación en Mantenimiento Preventivo', 'Automotriz',  2024, 2024);
INSERT INTO historial_laboral (estudiante_id, empresa_nombre, cargo, fecha_inicio, fecha_fin, descripcion, tipo) VALUES
  (@u6, 'Taller Mecánico Fuentes e Hijos', 'Asistente de mecánico', '2024-01-01', '2024-03-31',
   'Apoyo en mantención preventiva, cambio de aceite, revisión de frenos y atención al cliente en taller familiar.', 'verificado'),
  (@u6, 'Taller Automotriz Prat', 'Ayudante diagnóstico', '2024-07-01', '2024-09-30',
   'Apoyo en diagnóstico electrónico y mantenimiento preventivo de vehículos livianos.', 'practica_completada');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT @u6, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Diagnóstico electrónico OBD-II'       UNION ALL
SELECT @u6, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Sistemas de climatización automotriz'  UNION ALL
SELECT @u6, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Cambio de aceite y filtros'            UNION ALL
SELECT @u6, id, 'Basico',     NULL, FALSE FROM habilidades WHERE nombre = 'Mantenimiento preventivo'              UNION ALL
SELECT @u6, id, 'Basico',      74,  TRUE  FROM habilidades WHERE nombre = 'Resolución de problemas'               UNION ALL
SELECT @u6, id, 'Basico',      70,  TRUE  FROM habilidades WHERE nombre = 'Trabajo en equipo'                     UNION ALL
SELECT @u6, id, 'Basico',      78,  TRUE  FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad';
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (@u6, (SELECT id FROM tipos_publicacion WHERE nombre='logro'), 'Práctica completada en Taller Prat',
   'Tres meses trabajando en diagnóstico real. Gran experiencia para mi primer año en terreno.', DATE_SUB(NOW(), INTERVAL 9 DAY)),
  (@u6, (SELECT id FROM tipos_publicacion WHERE nombre='general'), 'Feria técnica regional 2024',
   'Representé al Liceo Arturo Prat en la feria técnica regional. Expusimos el proyecto de diagnóstico de fallas en vehículos eléctricos.', DATE_SUB(NOW(), INTERVAL 28 DAY));

-- Estudiante 7: Catalina Medina — Administración (Liceo Arturo Prat)
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('catalina.medina@demo.cl', 'Demo1234', 'estudiante');
SET @u7 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes
  (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio,
   calificacion_docente, telefono, biografia, estado_civil, genero, region, comuna, colegio_id)
VALUES (@u7, 'Catalina', 'Medina', 'Reyes', '21.222.333-4',
  (SELECT id FROM carreras WHERE nombre = 'Administracion'),
  '3° Medio', 6.3, 6.4, '+56 9 1234 5007',
  'Estudiante de Administración con sólido manejo de contabilidad y atención al cliente.',
  'soltero', 'femenino', 'Región de Valparaíso', 'Viña del Mar', @c2);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@u7, 'Español', 'Nativo'), (@u7, 'Inglés', 'Intermedio');
INSERT INTO historial_academico (estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin) VALUES
  (@u7, 'Liceo Técnico Arturo Prat', 'Técnico en Administración', 'Administración de Empresas', 2022, NULL),
  (@u7, 'SENCE', 'Atención al Cliente y Ventas', 'Comercial', 2024, 2024);
INSERT INTO historial_laboral (estudiante_id, empresa_nombre, cargo, fecha_inicio, fecha_fin, descripcion, tipo) VALUES
  (@u7, 'Ripley Viña del Mar', 'Asistente administrativa', '2024-01-15', '2024-04-15',
   'Gestión de caja, facturación y atención al cliente en temporada alta.', 'verificado');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT @u7, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Atención al cliente'             UNION ALL
SELECT @u7, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Gestión documental y archivo'    UNION ALL
SELECT @u7, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Facturación electrónica SII'     UNION ALL
SELECT @u7, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Planillas Excel avanzadas'       UNION ALL
SELECT @u7, id, 'Basico',     NULL, FALSE FROM habilidades WHERE nombre = 'Contabilidad general'            UNION ALL
SELECT @u7, id, 'Basico',      86,  TRUE  FROM habilidades WHERE nombre = 'Comunicación efectiva'           UNION ALL
SELECT @u7, id, 'Basico',      83,  TRUE  FROM habilidades WHERE nombre = 'Organización y planificación'    UNION ALL
SELECT @u7, id, 'Basico',      88,  TRUE  FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad';
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (@u7, (SELECT id FROM tipos_publicacion WHERE nombre='logro'), 'Promedio 6.3 — mejor semestre hasta ahora',
   'Cerré el semestre con 6.3. Fue el más exigente hasta ahora pero también el más completo.', DATE_SUB(NOW(), INTERVAL 6 DAY)),
  (@u7, (SELECT id FROM tipos_publicacion WHERE nombre='general'), 'Temporada alta en Ripley: lo que aprendí',
   'Tres meses en caja durante temporada alta son un máster acelerado en atención al cliente.', DATE_SUB(NOW(), INTERVAL 32 DAY));

-- Estudiante 8: Nicolás Vargas — Mecánica (C.E. Gabriela Mistral)
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nicolas.vargas@demo.cl', 'Demo1234', 'estudiante');
SET @u8 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes
  (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio,
   calificacion_docente, telefono, biografia, estado_civil, genero, region, comuna, colegio_id)
VALUES (@u8, 'Nicolás', 'Vargas', 'Ojeda', '21.333.444-5',
  (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
  '4° Medio', 6.0, 6.2, '+56 9 1234 5008',
  'Técnico en formación especializado en reparación de motores diesel y sistemas eléctricos.',
  'soltero', 'masculino', 'Región del Biobío', 'Concepción', @c3);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@u8, 'Español', 'Nativo'), (@u8, 'Inglés', 'Básico');
INSERT INTO historial_academico (estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin) VALUES
  (@u8, 'C.E. Gabriela Mistral', 'Técnico en Mecánica Automotriz', 'Automotriz', 2022, NULL),
  (@u8, 'CECAP Concepción', 'Motores Diesel Avanzado', 'Automotriz', 2024, 2024);
INSERT INTO historial_laboral (estudiante_id, empresa_nombre, cargo, fecha_inicio, fecha_fin, descripcion, tipo) VALUES
  (@u8, 'Transportes del Biobío Ltda.', 'Practicante mecánica diesel', '2024-07-10', '2024-09-10',
   'Mantenimiento preventivo y correctivo de camiones y buses. Diagnóstico de motores diesel Cummins e Isuzu.', 'practica_completada');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT @u8, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Reparación de motor diesel'               UNION ALL
SELECT @u8, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Sistemas eléctricos y electrónicos'       UNION ALL
SELECT @u8, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Diagnóstico electrónico OBD-II'           UNION ALL
SELECT @u8, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Mantenimiento preventivo'                 UNION ALL
SELECT @u8, id, 'Basico',     NULL, FALSE FROM habilidades WHERE nombre = 'Lectura de planos y manuales técnicos'    UNION ALL
SELECT @u8, id, 'Basico',      85,  TRUE  FROM habilidades WHERE nombre = 'Resolución de problemas'                  UNION ALL
SELECT @u8, id, 'Basico',      79,  TRUE  FROM habilidades WHERE nombre = 'Iniciativa y proactividad'                UNION ALL
SELECT @u8, id, 'Basico',      82,  TRUE  FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad';
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (@u8, (SELECT id FROM tipos_publicacion WHERE nombre='logro'), 'Certificación en motores diesel completada',
   'Aprobé el curso de Motores Diesel Avanzado en CECAP Concepción. Ahora manejo diagnóstico y reparación de sistemas de inyección common rail.', DATE_SUB(NOW(), INTERVAL 11 DAY)),
  (@u8, (SELECT id FROM tipos_publicacion WHERE nombre='general'), 'Monitor de taller escolar — lo que nadie te dice',
   'Ser monitor de pares implica saber explicar lo que sabes de formas distintas hasta que el otro entienda.', DATE_SUB(NOW(), INTERVAL 42 DAY));

-- Estudiante 9: Isidora Lagos — Administración (C.E. Gabriela Mistral)
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('isidora.lagos@demo.cl', 'Demo1234', 'estudiante');
SET @u9 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes
  (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio,
   calificacion_docente, telefono, biografia, estado_civil, genero, region, comuna, colegio_id)
VALUES (@u9, 'Isidora', 'Lagos', 'Bravo', '21.444.555-6',
  (SELECT id FROM carreras WHERE nombre = 'Administracion'),
  '2° Medio', 6.1, 6.3, '+56 9 1234 5009',
  'Estudiante con enfoque en recursos humanos y gestión documental.',
  'soltero', 'femenino', 'Región del Biobío', 'Concepción', @c3);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES
  (@u9, 'Español', 'Nativo'), (@u9, 'Inglés', 'Intermedio'), (@u9, 'Portugués', 'Básico');
INSERT INTO historial_academico (estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin) VALUES
  (@u9, 'C.E. Gabriela Mistral', 'Técnico en Administración', 'Administración de Empresas', 2023, NULL),
  (@u9, 'SENCE', 'Gestión de Recursos Humanos', 'RRHH', 2024, 2024);
INSERT INTO historial_laboral (estudiante_id, empresa_nombre, cargo, fecha_inicio, fecha_fin, descripcion, tipo) VALUES
  (@u9, 'Municipalidad de Concepción', 'Asistente RRHH voluntaria', '2024-03-01', '2024-05-31',
   'Digitalización de expedientes de personal, actualización de registros y apoyo en proceso de selección interna.', 'verificado');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT @u9, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Gestión documental y archivo'        UNION ALL
SELECT @u9, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Gestión de recursos humanos básica'  UNION ALL
SELECT @u9, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Redacción de informes y actas'       UNION ALL
SELECT @u9, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Planillas Excel avanzadas'           UNION ALL
SELECT @u9, id, 'Basico',     NULL, FALSE FROM habilidades WHERE nombre = 'Manejo de ERP (SAP básico)'          UNION ALL
SELECT @u9, id, 'Basico',      87,  TRUE  FROM habilidades WHERE nombre = 'Empatía y relaciones interpersonales' UNION ALL
SELECT @u9, id, 'Basico',      84,  TRUE  FROM habilidades WHERE nombre = 'Comunicación efectiva'               UNION ALL
SELECT @u9, id, 'Basico',      80,  TRUE  FROM habilidades WHERE nombre = 'Organización y planificación';
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (@u9, (SELECT id FROM tipos_publicacion WHERE nombre='logro'), 'Proyecto de digitalización completado',
   'Terminamos la digitalización de 1.200 expedientes físicos de personal en la Municipalidad de Concepción.', DATE_SUB(NOW(), INTERVAL 7 DAY)),
  (@u9, (SELECT id FROM tipos_publicacion WHERE nombre='general'), 'Por qué elegí recursos humanos',
   'RRHH me permite combinar administración con un propósito real: que las personas trabajen bien y en buenos ambientes.', DATE_SUB(NOW(), INTERVAL 38 DAY));

-- Estudiante 10: Benjamín Soto — Mecánica (C.E. Cardenal J.M. Caro)
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('benjamin.soto@demo.cl', 'Demo1234', 'estudiante');
SET @u10 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes
  (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio,
   calificacion_docente, telefono, biografia, estado_civil, genero, region, comuna, colegio_id)
VALUES (@u10, 'Benjamín', 'Soto', 'Araya', '21.555.666-7',
  (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
  '2° Medio', 5.4, 5.7, '+56 9 1234 5010',
  'Primer año en el taller escolar del C.E. Cardenal J.M. Caro. Aprendiendo rápido.',
  'soltero', 'masculino', 'Región Metropolitana de Santiago', 'San Bernardo', 3);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@u10, 'Español', 'Nativo');
INSERT INTO historial_academico (estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin) VALUES
  (@u10, 'C.E. Cardenal J.M. Caro', 'Técnico en Mecánica Automotriz', 'Automotriz', 2024, NULL);
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT @u10, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Cambio de aceite y filtros'          UNION ALL
SELECT @u10, id, 'Basico',     NULL, FALSE FROM habilidades WHERE nombre = 'Mantenimiento preventivo'            UNION ALL
SELECT @u10, id, 'Basico',     NULL, FALSE FROM habilidades WHERE nombre = 'Sistemas eléctricos y electrónicos'  UNION ALL
SELECT @u10, id, 'Basico',      68,  TRUE  FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad'       UNION ALL
SELECT @u10, id, 'Basico',      65,  TRUE  FROM habilidades WHERE nombre = 'Trabajo en equipo';
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (@u10, (SELECT id FROM tipos_publicacion WHERE nombre='general'), 'Mi primer cambio de aceite en taller escolar',
   'Suena básico pero hacerlo por primera vez en un vehículo real es otra cosa. Torque, tipo de aceite correcto, revisión del filtro. Pequeño logro, gran comienzo.', DATE_SUB(NOW(), INTERVAL 16 DAY));

-- Estudiante 11: Renata Espinoza — Administración (C.E. Gabriela Mistral)
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('renata.espinoza@demo.cl', 'Demo1234', 'estudiante');
SET @u11 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes
  (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio,
   calificacion_docente, telefono, biografia, estado_civil, genero, region, comuna, colegio_id)
VALUES (@u11, 'Renata', 'Espinoza', 'Cid', '21.666.777-8',
  (SELECT id FROM carreras WHERE nombre = 'Administracion'),
  '4° Medio', 6.6, 6.8, '+56 9 1234 5011',
  'Estudiante destacada con manejo avanzado de herramientas contables y tributarias.',
  'casado', 'femenino', 'Región del Biobío', 'Talcahuano', @c3);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@u11, 'Español', 'Nativo'), (@u11, 'Inglés', 'Avanzado');
INSERT INTO historial_academico (estudiante_id, institucion, titulo, area, fecha_inicio, fecha_fin) VALUES
  (@u11, 'C.E. Gabriela Mistral', 'Técnico en Administración', 'Administración de Empresas', 2022, NULL),
  (@u11, 'AIEP', 'Finanzas para no financieros', 'Finanzas', 2024, 2024);
INSERT INTO historial_laboral (estudiante_id, empresa_nombre, cargo, fecha_inicio, fecha_fin, descripcion, tipo) VALUES
  (@u11, 'Contadores Asociados del Sur', 'Asistente contable', '2024-03-10', '2024-06-10',
   'Registro de operaciones diarias, conciliaciones y preparación de declaraciones de IVA mensual.', 'verificado');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
SELECT @u11, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Contabilidad general'                   UNION ALL
SELECT @u11, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Manejo de software contable (Conta+)'   UNION ALL
SELECT @u11, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Facturación electrónica SII'            UNION ALL
SELECT @u11, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Elaboración de presupuestos'            UNION ALL
SELECT @u11, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Manejo de ERP (SAP básico)'             UNION ALL
SELECT @u11, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Control de inventario'                  UNION ALL
SELECT @u11, id, 'Basico',      94,  TRUE  FROM habilidades WHERE nombre = 'Pensamiento crítico'                    UNION ALL
SELECT @u11, id, 'Basico',      91,  TRUE  FROM habilidades WHERE nombre = 'Orientación al detalle'                 UNION ALL
SELECT @u11, id, 'Basico',      89,  TRUE  FROM habilidades WHERE nombre = 'Organización y planificación';
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  (@u11, (SELECT id FROM tipos_publicacion WHERE nombre='logro'), 'Promedio 6.6 y lista para titularme',
   'Último semestre antes de la titulación. Promedio 6.6 acumulado y con experiencia real en contabilidad.', DATE_SUB(NOW(), INTERVAL 4 DAY)),
  (@u11, (SELECT id FROM tipos_publicacion WHERE nombre='general'), 'Declaración de IVA: mi primera vez sola',
   'En Contadores Asociados me dejaron preparar la declaración de IVA de un cliente de forma independiente. La confianza que te da eso no tiene precio.', DATE_SUB(NOW(), INTERVAL 22 DAY));

-- Postulaciones de andres/nicolas/benjamin a vacantes del taller base (deben ir aquí, después de crear esos usuarios)
INSERT INTO postulaciones (vacante_id, estudiante_id, estado, fecha_creacion) VALUES
  (@v_taller_prac, (SELECT id FROM usuarios WHERE correo = 'andres.fuentes@demo.cl'),   'pendiente', DATE_SUB(NOW(), INTERVAL 12 DAY)),
  (@v_taller_prac, (SELECT id FROM usuarios WHERE correo = 'nicolas.vargas@demo.cl'),   'pendiente', DATE_SUB(NOW(), INTERVAL 4  DAY)),
  (@v_taller_prac, (SELECT id FROM usuarios WHERE correo = 'benjamin.soto@demo.cl'),    'pendiente', DATE_SUB(NOW(), INTERVAL 3  DAY)),
  (@v_taller_plab, (SELECT id FROM usuarios WHERE correo = 'andres.fuentes@demo.cl'),   'pendiente', DATE_SUB(NOW(), INTERVAL 9  DAY));

-- ============================================================
-- SEED GRÁFICOS — Datos para panel de colegio
-- ============================================================

SET @colegio_id  = (SELECT id FROM usuarios WHERE correo = 'colegio@empleame.cl' LIMIT 1);
SET @carrera_mec = (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz' LIMIT 1);
SET @carrera_adm = (SELECT id FROM carreras WHERE nombre = 'Administracion'      LIMIT 1);

DELETE FROM postulaciones
  WHERE estudiante_id IN (SELECT id FROM usuarios WHERE correo LIKE '%@seed-graficos.cl');
DELETE FROM vacantes
  WHERE empresa_id IN (SELECT id FROM usuarios WHERE correo LIKE '%@seed-graficos.cl');
DELETE FROM perfiles_estudiantes
  WHERE usuario_id IN (SELECT id FROM usuarios WHERE correo LIKE '%@seed-graficos.cl');
DELETE FROM perfiles_empresas
  WHERE usuario_id IN (SELECT id FROM usuarios WHERE correo LIKE '%@seed-graficos.cl');
DELETE FROM usuarios WHERE correo LIKE '%@seed-graficos.cl';

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES
  ('autoparts@seed-graficos.cl',    '$2b$10$seed', 'empresa'),
  ('logisticargo@seed-graficos.cl', '$2b$10$seed', 'empresa'),
  ('gestion360@seed-graficos.cl',   '$2b$10$seed', 'empresa'),
  ('ventaspro@seed-graficos.cl',    '$2b$10$seed', 'empresa'),
  ('talentcorp@seed-graficos.cl',   '$2b$10$seed', 'empresa');

SET @e1 = (SELECT id FROM usuarios WHERE correo = 'autoparts@seed-graficos.cl');
SET @e2 = (SELECT id FROM usuarios WHERE correo = 'logisticargo@seed-graficos.cl');
SET @e3 = (SELECT id FROM usuarios WHERE correo = 'gestion360@seed-graficos.cl');
SET @e4 = (SELECT id FROM usuarios WHERE correo = 'ventaspro@seed-graficos.cl');
SET @e5 = (SELECT id FROM usuarios WHERE correo = 'talentcorp@seed-graficos.cl');

INSERT INTO perfiles_empresas (usuario_id, nombre_empresa, telefono_contacto, descripcion, region, comuna) VALUES
  (@e1, 'AutoParts Chile',   '+56221001001', 'Distribuidor de repuestos automotrices.',     'Región Metropolitana', 'Santiago'),
  (@e2, 'LogistiCargo S.A.', '+56221002002', 'Empresa de logística y bodegaje nacional.',   'Región Metropolitana', 'Pudahuel'),
  (@e3, 'Gestión 360 SpA',   '+56221003003', 'Consultoría en administración y finanzas.',   'Región Metropolitana', 'Providencia'),
  (@e4, 'VentasPro Ltda.',   '+56221004004', 'Agencia de ventas y comercialización B2B.',   'Región de Valparaíso', 'Viña del Mar'),
  (@e5, 'TalentCorp Chile',  '+56221005005', 'Servicios de RRHH y selección de personal.',  'Región Metropolitana', 'Las Condes');

INSERT INTO vacantes (empresa_id, titulo, descripcion, requisitos, esta_activa, tipo, area, modalidad, duracion, remuneracion, fecha_limite, fecha_creacion) VALUES
  (@e1, 'Practicante Mecánica Automotriz',      'Apoyo en diagnóstico y mantención de vehículos.',         'Estudiante mecánica 3°-4° medio.',    TRUE, 'practica',       'Automotriz',          'presencial', '6 meses',   '$250.000', DATE_ADD(CURDATE(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 45 DAY)),
  (@e1, 'Técnico Automotriz Junior',            'Reparación de vehículos livianos y pesados.',             'Egresado o estudiante avanzado.',     TRUE, 'puesto_laboral', 'Automotriz',          'presencial', 'Indefinido','$550.000', DATE_ADD(CURDATE(), INTERVAL 90 DAY), DATE_SUB(NOW(), INTERVAL 62 DAY)),
  (@e1, 'Practicante Mantenimiento Industrial', 'Mantención de equipos y maquinaria del taller.',          'Estudiante mecánica o similar.',      TRUE, 'practica',       'Mantenimiento',       'presencial', '3 meses',   '$200.000', DATE_ADD(CURDATE(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY)),
  (@e1, 'Operario Mantenimiento',               'Mantención preventiva de planta y equipos.',              'Experiencia básica en herramientas.', TRUE, 'puesto_laboral', 'Mantenimiento',       'presencial', 'Indefinido','$480.000', DATE_ADD(CURDATE(), INTERVAL 75 DAY), DATE_SUB(NOW(), INTERVAL 55 DAY)),
  (@e2, 'Practicante Logística y Bodega',       'Control de stock, recepción y despacho.',                 'Estudiante 3°-4° medio.',             TRUE, 'practica',       'Logística',           'presencial', '6 meses',   '$220.000', DATE_ADD(CURDATE(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 40 DAY)),
  (@e2, 'Operador de Bodega',                   'Gestión de inventario y picking automatizado.',           'Experiencia en bodega deseable.',     TRUE, 'puesto_laboral', 'Logística',           'presencial', 'Indefinido','$500.000', DATE_ADD(CURDATE(), INTERVAL 80 DAY), DATE_SUB(NOW(), INTERVAL 72 DAY)),
  (@e2, 'Practicante Operaciones',              'Apoyo en planificación de rutas y control de flota.',    'Estudiante administración o logística.',TRUE,'practica',       'Operaciones',         'presencial', '4 meses',   '$210.000', DATE_ADD(CURDATE(), INTERVAL 50 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
  (@e2, 'Coordinador Operacional Junior',       'Seguimiento de pedidos y coordinación de despachos.',    'Manejo básico de Excel.',             TRUE, 'puesto_laboral', 'Operaciones',         'hibrido',    'Indefinido','$520.000', DATE_ADD(CURDATE(), INTERVAL 70 DAY), DATE_SUB(NOW(), INTERVAL 50 DAY)),
  (@e3, 'Practicante Administración',           'Gestión documental, facturación y atención clientes.',   'Estudiante administración.',          TRUE, 'practica',       'Administración',      'hibrido',    '6 meses',   '$230.000', DATE_ADD(CURDATE(), INTERVAL 55 DAY), DATE_SUB(NOW(), INTERVAL 35 DAY)),
  (@e3, 'Asistente Administrativo',             'Control de agenda, archivo y soporte a gerencia.',       'Experiencia en administración.',      TRUE, 'puesto_laboral', 'Administración',      'presencial', 'Indefinido','$560.000', DATE_ADD(CURDATE(), INTERVAL 65 DAY), DATE_SUB(NOW(), INTERVAL 67 DAY)),
  (@e3, 'Practicante Contabilidad',             'Registro de operaciones contables y conciliaciones.',    'Estudiante administración/contabilidad.',TRUE,'practica',      'Contabilidad',        'presencial', '5 meses',   '$240.000', DATE_ADD(CURDATE(), INTERVAL 50 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
  (@e3, 'Analista Contable Junior',             'Preparación de estados financieros y tributarios.',      'Manejo de software contable (SII).',  TRUE, 'puesto_laboral', 'Contabilidad',        'presencial', 'Indefinido','$600.000', DATE_ADD(CURDATE(), INTERVAL 90 DAY), DATE_SUB(NOW(), INTERVAL 78 DAY)),
  (@e4, 'Practicante Ventas',                   'Apoyo en prospección, cotizaciones y cierre de ventas.', 'Estudiante administración.',          TRUE, 'practica',       'Ventas',              'hibrido',    '4 meses',   '$220.000', DATE_ADD(CURDATE(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 38 DAY)),
  (@e4, 'Ejecutivo Comercial Junior',           'Gestión de cartera de clientes y metas.',                'Habilidades de comunicación.',        TRUE, 'puesto_laboral', 'Ventas',              'presencial', 'Indefinido','$580.000', DATE_ADD(CURDATE(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 48 DAY)),
  (@e4, 'Practicante Atención al Cliente',      'Recepción, soporte y seguimiento post-venta.',           'Estudiante cualquier carrera.',       TRUE, 'practica',       'Atención al Cliente', 'presencial', '3 meses',   '$200.000', DATE_ADD(CURDATE(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
  (@e4, 'Agente de Servicio al Cliente',        'Resolución de incidencias y fidelización.',              'Experiencia en servicio al cliente.', TRUE, 'puesto_laboral', 'Atención al Cliente', 'remoto',     'Indefinido','$490.000', DATE_ADD(CURDATE(), INTERVAL 55 DAY), DATE_SUB(NOW(), INTERVAL 58 DAY)),
  (@e5, 'Practicante Recursos Humanos',         'Apoyo en reclutamiento, onboarding y gestión.',          'Estudiante administración.',          TRUE, 'practica',       'RRHH',                'hibrido',    '6 meses',   '$240.000', DATE_ADD(CURDATE(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 42 DAY)),
  (@e5, 'Analista RRHH Junior',                 'Selección de personal, entrevistas y KPIs.',             'Conocimientos en RRHH.',              TRUE, 'puesto_laboral', 'RRHH',                'hibrido',    'Indefinido','$620.000', DATE_ADD(CURDATE(), INTERVAL 70 DAY), DATE_SUB(NOW(), INTERVAL 68 DAY)),
  (@e5, 'Practicante Gestión de Personas',      'Bienestar, capacitación y soporte administrativo.',      'Estudiante administración.',          TRUE, 'practica',       'RRHH',                'presencial', '4 meses',   '$220.000', DATE_ADD(CURDATE(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY));

SET @v_autoparts_prac = (SELECT id FROM vacantes WHERE empresa_id = @e1 AND tipo = 'practica'       AND area = 'Automotriz'     LIMIT 1);
SET @v_autoparts_plab = (SELECT id FROM vacantes WHERE empresa_id = @e1 AND tipo = 'puesto_laboral' AND area = 'Automotriz'     LIMIT 1);
SET @v_logisti_prac   = (SELECT id FROM vacantes WHERE empresa_id = @e2 AND tipo = 'practica'       AND area = 'Logística'      LIMIT 1);
SET @v_logisti_plab   = (SELECT id FROM vacantes WHERE empresa_id = @e2 AND tipo = 'puesto_laboral' AND area = 'Logística'      LIMIT 1);
SET @v_gestion_prac   = (SELECT id FROM vacantes WHERE empresa_id = @e3 AND tipo = 'practica'       AND area = 'Administración' LIMIT 1);
SET @v_gestion_plab   = (SELECT id FROM vacantes WHERE empresa_id = @e3 AND tipo = 'puesto_laboral' AND area = 'Administración' LIMIT 1);
SET @v_ventas_prac    = (SELECT id FROM vacantes WHERE empresa_id = @e4 AND tipo = 'practica'       AND area = 'Ventas'         LIMIT 1);
SET @v_ventas_plab    = (SELECT id FROM vacantes WHERE empresa_id = @e4 AND tipo = 'puesto_laboral' AND area = 'Ventas'         LIMIT 1);
SET @v_talent_prac    = (SELECT id FROM vacantes WHERE empresa_id = @e5 AND tipo = 'practica'       AND area = 'RRHH'           LIMIT 1);
SET @v_talent_plab    = (SELECT id FROM vacantes WHERE empresa_id = @e5 AND tipo = 'puesto_laboral' AND area = 'RRHH'           LIMIT 1);

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES
  ('est01@seed-graficos.cl', '$2b$10$seed', 'estudiante'),
  ('est02@seed-graficos.cl', '$2b$10$seed', 'estudiante'),
  ('est03@seed-graficos.cl', '$2b$10$seed', 'estudiante'),
  ('est04@seed-graficos.cl', '$2b$10$seed', 'estudiante'),
  ('est05@seed-graficos.cl', '$2b$10$seed', 'estudiante'),
  ('est06@seed-graficos.cl', '$2b$10$seed', 'estudiante'),
  ('est07@seed-graficos.cl', '$2b$10$seed', 'estudiante'),
  ('est08@seed-graficos.cl', '$2b$10$seed', 'estudiante'),
  ('est09@seed-graficos.cl', '$2b$10$seed', 'estudiante'),
  ('est10@seed-graficos.cl', '$2b$10$seed', 'estudiante'),
  ('est11@seed-graficos.cl', '$2b$10$seed', 'estudiante'),
  ('est12@seed-graficos.cl', '$2b$10$seed', 'estudiante');

SET @s01 = (SELECT id FROM usuarios WHERE correo = 'est01@seed-graficos.cl');
SET @s02 = (SELECT id FROM usuarios WHERE correo = 'est02@seed-graficos.cl');
SET @s03 = (SELECT id FROM usuarios WHERE correo = 'est03@seed-graficos.cl');
SET @s04 = (SELECT id FROM usuarios WHERE correo = 'est04@seed-graficos.cl');
SET @s05 = (SELECT id FROM usuarios WHERE correo = 'est05@seed-graficos.cl');
SET @s06 = (SELECT id FROM usuarios WHERE correo = 'est06@seed-graficos.cl');
SET @s07 = (SELECT id FROM usuarios WHERE correo = 'est07@seed-graficos.cl');
SET @s08 = (SELECT id FROM usuarios WHERE correo = 'est08@seed-graficos.cl');
SET @s09 = (SELECT id FROM usuarios WHERE correo = 'est09@seed-graficos.cl');
SET @s10 = (SELECT id FROM usuarios WHERE correo = 'est10@seed-graficos.cl');
SET @s11 = (SELECT id FROM usuarios WHERE correo = 'est11@seed-graficos.cl');
SET @s12 = (SELECT id FROM usuarios WHERE correo = 'est12@seed-graficos.cl');

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre, apellido_paterno, apellido_materno, carrera_id, nivel, genero, colegio_id, promedio, calificacion_docente)
VALUES
  (@s01, 'Tomás',     'Araya',     'Ríos',     @carrera_mec, '1° Medio', 'masculino',     @colegio_id, 5.8, 6.0),
  (@s02, 'Sofía',     'Molina',    'Vera',      @carrera_mec, '1° Medio', 'femenino',      @colegio_id, 6.1, 6.2),
  (@s03, 'Felipe',    'Contreras', 'Soto',      @carrera_mec, '2° Medio', 'masculino',     @colegio_id, 5.5, 5.7),
  (@s04, 'Valentina', 'Díaz',      'Pérez',     @carrera_mec, '2° Medio', 'femenino',      @colegio_id, 6.3, 6.4),
  (@s05, 'Rodrigo',   'Muñoz',     'Lagos',     @carrera_mec, '3° Medio', 'masculino',     @c2,        5.9, 6.1),
  (@s06, 'Ignacio',   'Pinto',     'Baeza',     @carrera_mec, '4° Medio', 'masculino',     @c2,        6.4, 6.5),
  (@s07, 'Camila',    'Reyes',     'Torres',    @carrera_adm, '1° Medio', 'femenino',      @c2,        6.0, 6.1),
  (@s08, 'Martina',   'Flores',    'Vega',      @carrera_adm, '2° Medio', 'femenino',      @c2,        6.2, 6.3),
  (@s09, 'Diego',     'Salazar',   'Núñez',     @carrera_adm, '2° Medio', 'masculino',     @c3,        5.6, 5.8),
  (@s10, 'Javiera',   'Castro',    'Herrera',   @carrera_adm, '3° Medio', 'femenino',      @c3,        6.5, 6.6),
  (@s11, 'Sebastián', 'Rojas',     'Ibáñez',    @carrera_adm, '3° Medio', 'masculino',     @c3,        5.7, 5.9),
  (@s12, 'Alex',      'Morales',   'Fuentes',   @carrera_adm, '4° Medio', 'no_especifica', @c3,        6.7, 6.8);

INSERT INTO postulaciones (vacante_id, estudiante_id, estado, fecha_creacion) VALUES
  (@v_autoparts_prac, @s01, 'completado', DATE_SUB(NOW(), INTERVAL 10 MONTH)),
  (@v_logisti_prac,   @s07, 'completado', DATE_SUB(NOW(), INTERVAL 10 MONTH)),
  (@v_gestion_prac,   @s09, 'rechazado',  DATE_SUB(NOW(), INTERVAL 10 MONTH)),
  (@v_autoparts_plab, @s03, 'aceptado',   DATE_SUB(NOW(), INTERVAL 9 MONTH)),
  (@v_gestion_prac,   @s07, 'completado', DATE_SUB(NOW(), INTERVAL 9 MONTH)),
  (@v_logisti_plab,   @s09, 'rechazado',  DATE_SUB(NOW(), INTERVAL 9 MONTH)),
  (@v_ventas_prac,    @s10, 'completado', DATE_SUB(NOW(), INTERVAL 9 MONTH)),
  (@v_autoparts_prac, @s05, 'completado', DATE_SUB(NOW(), INTERVAL 8 MONTH)),
  (@v_talent_prac,    @s08, 'aceptado',   DATE_SUB(NOW(), INTERVAL 8 MONTH)),
  (@v_gestion_plab,   @s12, 'rechazado',  DATE_SUB(NOW(), INTERVAL 8 MONTH)),
  (@v_ventas_plab,    @s10, 'aceptado',   DATE_SUB(NOW(), INTERVAL 8 MONTH)),
  (@v_logisti_prac,   @s06, 'completado', DATE_SUB(NOW(), INTERVAL 8 MONTH)),
  (@v_gestion_prac,   @s11, 'completado', DATE_SUB(NOW(), INTERVAL 7 MONTH)),
  (@v_talent_plab,    @s10, 'rechazado',  DATE_SUB(NOW(), INTERVAL 7 MONTH)),
  (@v_autoparts_plab, @s06, 'aceptado',   DATE_SUB(NOW(), INTERVAL 7 MONTH)),
  (@v_ventas_prac,    @s07, 'completado', DATE_SUB(NOW(), INTERVAL 7 MONTH)),
  (@v_logisti_plab,   @s04, 'completado', DATE_SUB(NOW(), INTERVAL 7 MONTH)),
  (@v_talent_prac,    @s11, 'completado', DATE_SUB(NOW(), INTERVAL 6 MONTH)),
  (@v_autoparts_prac, @s02, 'aceptado',   DATE_SUB(NOW(), INTERVAL 6 MONTH)),
  (@v_gestion_plab,   @s08, 'completado', DATE_SUB(NOW(), INTERVAL 6 MONTH)),
  (@v_ventas_plab,    @s12, 'rechazado',  DATE_SUB(NOW(), INTERVAL 6 MONTH)),
  (@v_logisti_prac,   @s01, 'completado', DATE_SUB(NOW(), INTERVAL 6 MONTH)),
  (@v_ventas_prac,    @s09, 'aceptado',   DATE_SUB(NOW(), INTERVAL 5 MONTH)),
  (@v_talent_plab,    @s12, 'completado', DATE_SUB(NOW(), INTERVAL 5 MONTH)),
  (@v_autoparts_plab, @s05, 'completado', DATE_SUB(NOW(), INTERVAL 5 MONTH)),
  (@v_gestion_prac,   @s04, 'pendiente',  DATE_SUB(NOW(), INTERVAL 5 MONTH)),
  (@v_logisti_plab,   @s11, 'completado', DATE_SUB(NOW(), INTERVAL 5 MONTH)),
  (@v_ventas_plab,    @s03, 'rechazado',  DATE_SUB(NOW(), INTERVAL 5 MONTH)),
  (@v_autoparts_prac, @s04, 'completado', DATE_SUB(NOW(), INTERVAL 4 MONTH)),
  (@v_gestion_plab,   @s10, 'aceptado',   DATE_SUB(NOW(), INTERVAL 4 MONTH)),
  (@v_talent_prac,    @s09, 'completado', DATE_SUB(NOW(), INTERVAL 4 MONTH)),
  (@v_logisti_prac,   @s12, 'pendiente',  DATE_SUB(NOW(), INTERVAL 4 MONTH)),
  (@v_ventas_prac,    @s06, 'completado', DATE_SUB(NOW(), INTERVAL 4 MONTH)),
  (@v_autoparts_plab, @s07, 'rechazado',  DATE_SUB(NOW(), INTERVAL 4 MONTH)),
  (@v_talent_plab,    @s02, 'completado', DATE_SUB(NOW(), INTERVAL 4 MONTH)),
  (@v_gestion_prac,   @s02, 'aceptado',   DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  (@v_logisti_plab,   @s05, 'completado', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  (@v_ventas_plab,    @s08, 'aceptado',   DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  (@v_autoparts_prac, @s11, 'pendiente',  DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  (@v_talent_prac,    @s03, 'completado', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  (@v_gestion_plab,   @s06, 'rechazado',  DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  (@v_logisti_prac,   @s10, 'completado', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  (@v_ventas_prac,    @s01, 'pendiente',  DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  (@v_talent_plab,    @s04, 'pendiente',  DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_autoparts_plab, @s08, 'aceptado',   DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_gestion_prac,   @s05, 'completado', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_ventas_plab,    @s11, 'pendiente',  DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_logisti_plab,   @s02, 'aceptado',   DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_talent_prac,    @s06, 'completado', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_autoparts_prac, @s09, 'rechazado',  DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_gestion_plab,   @s03, 'completado', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_ventas_prac,    @s12, 'pendiente',  DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_autoparts_prac, @s06, 'pendiente',  DATE_SUB(NOW(), INTERVAL 1 MONTH)),
  (@v_logisti_prac,   @s08, 'aceptado',   DATE_SUB(NOW(), INTERVAL 1 MONTH)),
  (@v_gestion_prac,   @s01, 'pendiente',  DATE_SUB(NOW(), INTERVAL 1 MONTH)),
  (@v_talent_prac,    @s04, 'aceptado',   DATE_SUB(NOW(), INTERVAL 1 MONTH)),
  (@v_ventas_prac,    @s02, 'pendiente',  DATE_SUB(NOW(), INTERVAL 1 MONTH)),
  (@v_autoparts_plab, @s10, 'pendiente',  DATE_SUB(NOW(), INTERVAL 1 MONTH)),
  (@v_gestion_plab,   @s11, 'pendiente',  DATE_SUB(NOW(), INTERVAL 1 MONTH)),
  (@v_logisti_plab,   @s07, 'pendiente',  DATE_SUB(NOW(), INTERVAL 1 MONTH)),
  (@v_talent_plab,    @s09, 'pendiente',  DATE_SUB(NOW(), INTERVAL 1 MONTH)),
  (@v_ventas_plab,    @s05, 'pendiente',  DATE_SUB(NOW(), INTERVAL 1 MONTH)),
  (@v_autoparts_prac, @s07, 'pendiente',  NOW()),
  (@v_logisti_prac,   @s11, 'pendiente',  NOW()),
  (@v_gestion_prac,   @s06, 'pendiente',  NOW()),
  (@v_talent_prac,    @s12, 'pendiente',  NOW()),
  (@v_ventas_prac,    @s04, 'pendiente',  NOW()),
  (@v_autoparts_plab, @s02, 'pendiente',  NOW()),
  (@v_logisti_plab,   @s03, 'pendiente',  NOW()),
  (@v_gestion_plab,   @s09, 'pendiente',  NOW()),
  (@v_ventas_plab,    @s01, 'pendiente',  NOW()),
  (@v_talent_plab,    @s08, 'pendiente',  NOW());

-- ============================================================
-- SEED VACANTES GRÁFICOS — 3 vacantes por empresa (todas las empresas)
-- Marcador: descripcion LIKE '%[seed-graficos]%'
-- ============================================================

INSERT INTO vacantes (
  empresa_id, titulo, descripcion, requisitos,
  esta_activa, tipo, area, modalidad,
  duracion, horario, remuneracion, direccion,
  beneficios, fecha_limite, fecha_creacion
)
SELECT
  pe.usuario_id,
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN 'Practicante Mecánico Automotriz'
    WHEN 12 THEN 'Operario/a Logística y Bodega'
    WHEN 13 THEN 'Asistente Administrativo/a y Contable'
    WHEN 21 THEN 'Ejecutivo/a de Ventas y Comercialización'
    WHEN 22 THEN 'Practicante Recursos Humanos'
    WHEN 23 THEN 'Practicante Contabilidad y Finanzas'
    WHEN  1 THEN 'Desarrollador/a Junior Sistemas Internos'
    WHEN  2 THEN 'Técnico/a de Mantenimiento Industrial'
    WHEN  3 THEN 'Recepcionista y Atención al Cliente'
  END,
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN 'Apoyo en diagnóstico electrónico OBD-II, mantenimiento preventivo y reparación de vehículos livianos. [seed-graficos]'
    WHEN 12 THEN 'Recepción, despacho y control de stock en bodega. Manejo de sistema de inventario digital. [seed-graficos]'
    WHEN 13 THEN 'Gestión documental, facturación electrónica SII, control de inventario y atención a clientes. [seed-graficos]'
    WHEN 21 THEN 'Gestión de cartera de clientes, prospección y seguimiento post-venta. [seed-graficos]'
    WHEN 22 THEN 'Apoyo en procesos de selección, control de asistencia y digitalización de expedientes. [seed-graficos]'
    WHEN 23 THEN 'Registro de operaciones contables, conciliaciones bancarias y apoyo en cierre mensual. [seed-graficos]'
    WHEN  1 THEN 'Desarrollo y mantención de sistemas web internos e integración con APIs externas. [seed-graficos]'
    WHEN  2 THEN 'Mantenimiento preventivo y correctivo de maquinaria e instalaciones eléctricas. [seed-graficos]'
    WHEN  3 THEN 'Recepción de clientes, gestión de agenda y coordinación con áreas internas. [seed-graficos]'
  END,
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN 'Cursando últimos semestres de Técnico en Mecánica Automotriz. Disponibilidad full-time.'
    WHEN 12 THEN 'Enseñanza media completa o técnico en logística. Conocimientos básicos de inventario.'
    WHEN 13 THEN 'Título técnico en Administración. Manejo de Excel intermedio.'
    WHEN 21 THEN 'Título técnico en Administración o afín. Experiencia mínima 6 meses en ventas.'
    WHEN 22 THEN 'Cursando Técnico en Administración o RRHH. Buenas habilidades interpersonales.'
    WHEN 23 THEN 'Cursando Técnico en Contabilidad. Manejo de Conta+ deseable.'
    WHEN  1 THEN 'Estudiante o egresado de Informática. Conocimientos en HTML, CSS, JavaScript.'
    WHEN  2 THEN 'Título técnico en Mecánica Industrial. Experiencia mínima 1 año.'
    WHEN  3 THEN 'Técnico en Administración. Habilidades comunicacionales sobresalientes.'
  END,
  CASE (pe.usuario_id % 3) * 10 + n.n WHEN 2 THEN 0 ELSE 1 END,
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN 'practica' WHEN 12 THEN 'puesto_laboral' WHEN 13 THEN 'puesto_laboral'
    WHEN 21 THEN 'puesto_laboral' WHEN 22 THEN 'practica' WHEN 23 THEN 'practica'
    WHEN  1 THEN 'practica' WHEN  2 THEN 'puesto_laboral' WHEN  3 THEN 'puesto_laboral'
  END,
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN 'Automotriz' WHEN 12 THEN 'Logística y Bodega' WHEN 13 THEN 'Administración'
    WHEN 21 THEN 'Ventas y Comercial' WHEN 22 THEN 'Recursos Humanos' WHEN 23 THEN 'Contabilidad'
    WHEN  1 THEN 'Tecnología e Informática' WHEN  2 THEN 'Mantenimiento Industrial' WHEN  3 THEN 'Atención al Cliente'
  END,
  CASE (pe.usuario_id % 3) * 10 + n.n WHEN 21 THEN 'hibrido' WHEN 1 THEN 'remoto' ELSE 'presencial' END,
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN '3 meses' WHEN 12 THEN 'Indefinido' WHEN 13 THEN 'Indefinido'
    WHEN 21 THEN 'Indefinido' WHEN 22 THEN '3 meses' WHEN 23 THEN '3 meses'
    WHEN  1 THEN '4 meses' WHEN  2 THEN 'Indefinido' WHEN  3 THEN 'Indefinido'
  END,
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN 'Lunes a viernes 08:00 – 17:00'
    WHEN 12 THEN 'Lunes a sábado 07:30 – 16:30 (turnos rotativos)'
    WHEN 13 THEN 'Lunes a viernes 09:00 – 18:00'
    WHEN 21 THEN 'Lunes a viernes 09:00 – 18:00, con flexibilidad remota 2 días/semana'
    WHEN 22 THEN 'Lunes a viernes 09:00 – 17:00'
    WHEN 23 THEN 'Lunes a viernes 09:00 – 18:00'
    WHEN  1 THEN 'Flexible, con daily sync 09:30 AM'
    WHEN  2 THEN 'Turnos rotativos 08:00–17:00 / 14:00–23:00, lunes a sábado'
    WHEN  3 THEN 'Lunes a viernes 08:30 – 17:30'
  END,
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN '$250.000 mensual' WHEN 12 THEN '$420.000 mensual' WHEN 13 THEN '$460.000 mensual'
    WHEN 21 THEN '$550.000 + comisiones' WHEN 22 THEN '$180.000 mensual' WHEN 23 THEN '$200.000 mensual'
    WHEN  1 THEN '$300.000 mensual' WHEN  2 THEN '$580.000 mensual' WHEN  3 THEN '$420.000 mensual'
  END,
  CONCAT('Av. Principal 100, ', COALESCE(pe.comuna, 'Santiago'), ', ', COALESCE(pe.region, 'Región Metropolitana')),
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN 'Colación incluida. Uniforme y EPP provistos. Posibilidad de contratación al término de práctica.'
    WHEN 12 THEN 'Seguro de accidente laboral. Uniforme completo provisto. Bono de asistencia mensual.'
    WHEN 13 THEN 'Seguro complementario de salud. Bono de desempeño semestral.'
    WHEN 21 THEN 'Comisiones sobre ventas. Seguro complementario de salud. Bono anual por metas.'
    WHEN 22 THEN 'Colación incluida. Certificado de práctica detallado. Supervisión cercana.'
    WHEN 23 THEN 'Colación incluida. Mentoría de contador senior. Posibilidad de extensión.'
    WHEN  1 THEN 'Trabajo 100% remoto. Equipo provisto si necesario. Mentoría técnica incluida.'
    WHEN  2 THEN 'Seguro complementario. EPP completo. Bono por turno nocturno.'
    WHEN  3 THEN 'Seguro de salud complementario. Uniforme provisto. Bono de asistencia.'
  END,
  DATE_ADD(CURDATE(), INTERVAL CASE n.n WHEN 1 THEN 30 WHEN 2 THEN 15 ELSE 21 END DAY),
  DATE_SUB(NOW(), INTERVAL
    CASE (pe.usuario_id % 3) * 10 + n.n
      WHEN 11 THEN 12 WHEN 12 THEN 25 WHEN 13 THEN 5
      WHEN 21 THEN  8 WHEN 22 THEN 18 WHEN 23 THEN 3
      WHEN  1 THEN 20 WHEN  2 THEN 35 WHEN  3 THEN 45
    END DAY)
FROM perfiles_empresas pe
CROSS JOIN (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3) n;


-- ============================================================
-- BLOQUE DEMO EXTENDIDO: 3 SLEPs · 9 colegios · 18 talleres
--   · 18 estudiantes · 3 empresas · 6 vacantes · publicaciones
-- ============================================================

-- ── Limpieza idempotente ─────────────────────────────────────
DELETE FROM usuarios WHERE correo IN (
  'slep_atacama@demo.cl', 'slep_barrancas@demo.cl', 'slep_gm@demo.cl',
  'colegio_lgp@demo.cl',  'colegio_da@demo.cl',     'colegio_ta@demo.cl',
  'colegio_lcn@demo.cl',  'colegio_lp@demo.cl',     'colegio_lip@demo.cl',
  'colegio_plf@demo.cl',  'colegio_sj@demo.cl',     'colegio_tm@demo.cl',
  'nd01@demo.cl', 'nd02@demo.cl', 'nd03@demo.cl', 'nd04@demo.cl',
  'nd05@demo.cl', 'nd06@demo.cl', 'nd07@demo.cl', 'nd08@demo.cl',
  'nd09@demo.cl', 'nd10@demo.cl', 'nd11@demo.cl', 'nd12@demo.cl',
  'nd13@demo.cl', 'nd14@demo.cl', 'nd15@demo.cl', 'nd16@demo.cl',
  'nd17@demo.cl', 'nd18@demo.cl',
  'emp_norte@demo.cl', 'emp_barr@demo.cl', 'emp_fl@demo.cl'
);

-- ── A. Tres SLEPs ────────────────────────────────────────────

INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('slep_atacama@demo.cl', 'Demo1234', 'slep');
SET @slep_a = LAST_INSERT_ID();
INSERT INTO perfiles_slep (usuario_id, nombre_organismo, telefono_contacto, descripcion, region)
  VALUES (@slep_a, 'SLEP Atacama', '+56521234567',
    'Servicio Local de Educación Pública de la Provincia de Copiapó. Gestiona establecimientos técnico-profesionales en la Región de Atacama.',
    'Región de Atacama');

INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('slep_barrancas@demo.cl', 'Demo1234', 'slep');
SET @slep_b = LAST_INSERT_ID();
INSERT INTO perfiles_slep (usuario_id, nombre_organismo, telefono_contacto, descripcion, region)
  VALUES (@slep_b, 'SLEP Barrancas', '+56222345678',
    'Servicio Local de Educación Pública del sector poniente de Santiago. Administra colegios en Cerro Navia, Lo Prado y Pudahuel.',
    'Región Metropolitana de Santiago');

INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('slep_gm@demo.cl', 'Demo1234', 'slep');
SET @slep_g = LAST_INSERT_ID();
INSERT INTO perfiles_slep (usuario_id, nombre_organismo, telefono_contacto, descripcion, region)
  VALUES (@slep_g, 'SLEP Gabriela Mistral', '+56223456789',
    'Servicio Local de Educación Pública del sector suroriente de Santiago. Cobertura en La Florida, San Joaquín y Macul.',
    'Región Metropolitana de Santiago');

-- ── B. Colegios — SLEP Atacama (3) ──────────────────────────

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('colegio_lgp@demo.cl', 'Demo1234', 'colegio');
SET @ca1 = LAST_INSERT_ID();
INSERT INTO perfiles_colegios (usuario_id, slep_id, nombre_institucion, telefono_contacto, descripcion, region, comuna)
  VALUES (@ca1, @slep_a, 'Liceo Técnico Pedro León Gallo', '+56521112233',
    'Liceo técnico-profesional con especialidades en Mecánica Automotriz y Administración de Empresas.',
    'Región de Atacama', 'Copiapó');
INSERT INTO colegio_carreras (colegio_id, carrera_id) SELECT @ca1, id FROM carreras WHERE nombre IN ('Mecanica Automotriz', 'Administracion');

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('colegio_da@demo.cl', 'Demo1234', 'colegio');
SET @ca2 = LAST_INSERT_ID();
INSERT INTO perfiles_colegios (usuario_id, slep_id, nombre_institucion, telefono_contacto, descripcion, region, comuna)
  VALUES (@ca2, @slep_a, 'Liceo Polivalente Diego de Almagro', '+56522223344',
    'Establecimiento con fuerte énfasis en la formación técnica para la minería y la mecánica industrial.',
    'Región de Atacama', 'Diego de Almagro');
INSERT INTO colegio_carreras (colegio_id, carrera_id) SELECT @ca2, id FROM carreras WHERE nombre IN ('Mecanica Automotriz', 'Administracion');

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('colegio_ta@demo.cl', 'Demo1234', 'colegio');
SET @ca3 = LAST_INSERT_ID();
INSERT INTO perfiles_colegios (usuario_id, slep_id, nombre_institucion, telefono_contacto, descripcion, region, comuna)
  VALUES (@ca3, @slep_a, 'C.E. Tierra Amarilla', '+56523334455',
    'Centro educacional rural con especialidad en administración y servicios para la comunidad minera.',
    'Región de Atacama', 'Tierra Amarilla');
INSERT INTO colegio_carreras (colegio_id, carrera_id) SELECT @ca3, id FROM carreras WHERE nombre IN ('Mecanica Automotriz', 'Administracion');

-- ── C. Colegios — SLEP Barrancas (3) ────────────────────────

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('colegio_lcn@demo.cl', 'Demo1234', 'colegio');
SET @cb1 = LAST_INSERT_ID();
INSERT INTO perfiles_colegios (usuario_id, slep_id, nombre_institucion, telefono_contacto, descripcion, region, comuna)
  VALUES (@cb1, @slep_b, 'Liceo Comercial Cerro Navia', '+56222111222',
    'Liceo con especialidad en Administración y Contabilidad, enfocado en la empleabilidad local.',
    'Región Metropolitana de Santiago', 'Cerro Navia');
INSERT INTO colegio_carreras (colegio_id, carrera_id) SELECT @cb1, id FROM carreras WHERE nombre IN ('Mecanica Automotriz', 'Administracion');

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('colegio_lp@demo.cl', 'Demo1234', 'colegio');
SET @cb2 = LAST_INSERT_ID();
INSERT INTO perfiles_colegios (usuario_id, slep_id, nombre_institucion, telefono_contacto, descripcion, region, comuna)
  VALUES (@cb2, @slep_b, 'Complejo Educacional Lo Prado', '+56222333444',
    'Complejo educacional con modalidad técnico-profesional bimodal: mecánica y administración.',
    'Región Metropolitana de Santiago', 'Lo Prado');
INSERT INTO colegio_carreras (colegio_id, carrera_id) SELECT @cb2, id FROM carreras WHERE nombre IN ('Mecanica Automotriz', 'Administracion');

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('colegio_lip@demo.cl', 'Demo1234', 'colegio');
SET @cb3 = LAST_INSERT_ID();
INSERT INTO perfiles_colegios (usuario_id, slep_id, nombre_institucion, telefono_contacto, descripcion, region, comuna)
  VALUES (@cb3, @slep_b, 'Liceo Industrial Pudahuel', '+56222444555',
    'Liceo con especialidad industrial que incluye mecánica automotriz y gestión industrial básica.',
    'Región Metropolitana de Santiago', 'Pudahuel');
INSERT INTO colegio_carreras (colegio_id, carrera_id) SELECT @cb3, id FROM carreras WHERE nombre IN ('Mecanica Automotriz', 'Administracion');

-- ── D. Colegios — SLEP Gabriela Mistral (3) ─────────────────

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('colegio_plf@demo.cl', 'Demo1234', 'colegio');
SET @cg1 = LAST_INSERT_ID();
INSERT INTO perfiles_colegios (usuario_id, slep_id, nombre_institucion, telefono_contacto, descripcion, region, comuna)
  VALUES (@cg1, @slep_g, 'Liceo Polivalente La Florida', '+56225551122',
    'Liceo con formación técnico-profesional orientada al sector automotriz y administrativo de la zona sur.',
    'Región Metropolitana de Santiago', 'La Florida');
INSERT INTO colegio_carreras (colegio_id, carrera_id) SELECT @cg1, id FROM carreras WHERE nombre IN ('Mecanica Automotriz', 'Administracion');

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('colegio_sj@demo.cl', 'Demo1234', 'colegio');
SET @cg2 = LAST_INSERT_ID();
INSERT INTO perfiles_colegios (usuario_id, slep_id, nombre_institucion, telefono_contacto, descripcion, region, comuna)
  VALUES (@cg2, @slep_g, 'C.E. San Joaquín', '+56226662233',
    'Centro educacional con vocación técnica y conexión activa con empresas de la Región Metropolitana.',
    'Región Metropolitana de Santiago', 'San Joaquín');
INSERT INTO colegio_carreras (colegio_id, carrera_id) SELECT @cg2, id FROM carreras WHERE nombre IN ('Mecanica Automotriz', 'Administracion');

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('colegio_tm@demo.cl', 'Demo1234', 'colegio');
SET @cg3 = LAST_INSERT_ID();
INSERT INTO perfiles_colegios (usuario_id, slep_id, nombre_institucion, telefono_contacto, descripcion, region, comuna)
  VALUES (@cg3, @slep_g, 'Liceo Técnico Macul', '+56227773344',
    'Liceo técnico con programas de articulación con universidades e institutos de educación superior.',
    'Región Metropolitana de Santiago', 'Macul');
INSERT INTO colegio_carreras (colegio_id, carrera_id) SELECT @cg3, id FROM carreras WHERE nombre IN ('Mecanica Automotriz', 'Administracion');

-- ── E. Talleres (2 por colegio, 18 en total) ─────────────────

INSERT INTO talleres (colegio_id, titulo, descripcion, requisitos, area, modalidad, duracion, horario, costo, cupos, fecha_inicio, fecha_limite, creado_en) VALUES
  (@ca1, 'Diagnóstico Electrónico OBD-II Avanzado',
   'Taller práctico intensivo sobre diagnóstico con scanner. Los participantes trabajarán sobre vehículos reales del taller escolar.',
   'Haber cursado 2° Medio. Nociones básicas de mecánica.',
   'Mecánica Automotriz', 'presencial', '40 horas', 'Sábados 9:00–14:00',
   0.00, 20, DATE_ADD(CURDATE(), INTERVAL 15 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 45 DAY)),
  (@ca1, 'Emprendimiento y Plan de Negocios',
   'Taller orientado a desarrollar habilidades de emprendimiento, diseño de modelo canvas y presentación de ideas de negocio.',
   'Estudiantes de 3° o 4° Medio.',
   'Administración', 'hibrido', '24 horas', 'Miércoles 15:00–18:00',
   0.00, 25, DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 38 DAY)),
  (@ca2, 'Sistemas de Suspensión y Dirección',
   'Taller especializado en diagnóstico y reparación de sistemas de suspensión delantera y trasera en vehículos livianos.',
   'Segundo ciclo de Mecánica Automotriz.',
   'Mecánica Automotriz', 'presencial', '32 horas', 'Viernes 14:00–18:00 y Sábado 9:00–13:00',
   0.00, 18, DATE_ADD(CURDATE(), INTERVAL 12 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 52 DAY)),
  (@ca2, 'Contabilidad y Tributación Básica',
   'Aprende los fundamentos contables, el ciclo tributario chileno y el uso del portal del SII para contribuyentes.',
   'Interés en el área contable. Manejo básico de Excel.',
   'Administración', 'presencial', '30 horas', 'Lunes y Miércoles 16:00–18:30',
   0.00, 22, DATE_ADD(CURDATE(), INTERVAL 18 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY)),
  (@ca3, 'Mantenimiento Preventivo Vehicular',
   'Taller centrado en revisiones técnicas periódicas: aceites, filtros, frenos, neumáticos y sistemas de iluminación.',
   'Estudiantes de 2° Medio en adelante.',
   'Mecánica Automotriz', 'presencial', '20 horas', 'Sábados 9:00–13:00',
   0.00, 15, DATE_ADD(CURDATE(), INTERVAL 8 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 60 DAY)),
  (@ca3, 'Habilidades Comunicacionales para el Trabajo',
   'Desarrollo de comunicación efectiva, redacción laboral y manejo de reuniones presenciales y virtuales.',
   'Abierto a todos los estudiantes del establecimiento.',
   'Administración', 'hibrido', '16 horas', 'Jueves 15:30–18:00',
   0.00, 30, DATE_ADD(CURDATE(), INTERVAL 22 DAY), DATE_ADD(CURDATE(), INTERVAL 16 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
  (@cb1, 'Reparación de Sistemas Eléctricos Automotrices',
   'Taller intensivo sobre circuitos eléctricos vehiculares, diagnóstico de fallas y reemplazo de componentes.',
   'Haber aprobado el módulo de electricidad básica.',
   'Mecánica Automotriz', 'presencial', '36 horas', 'Martes y Jueves 15:00–18:00',
   0.00, 20, DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 50 DAY)),
  (@cb1, 'Gestión Documental y Archivística Digital',
   'Organización y gestión de documentos físicos y digitales, uso de herramientas de nube y normativa archivística.',
   'Estudiantes de Administración de 3° o 4° Medio.',
   'Administración', 'presencial', '20 horas', 'Viernes 14:00–17:00',
   0.00, 25, DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 35 DAY)),
  (@cb2, 'Soldadura MIG/TIG Aplicada al Automóvil',
   'Técnicas de soldadura aplicadas a carrocería y escape automotriz. Incluye manejo seguro de equipos y EPP.',
   'Estudiantes de Mecánica Automotriz de 3° Medio en adelante.',
   'Mecánica Automotriz', 'presencial', '40 horas', 'Sábados 8:30–13:30',
   0.00, 16, DATE_ADD(CURDATE(), INTERVAL 25 DAY), DATE_ADD(CURDATE(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 42 DAY)),
  (@cb2, 'Excel para Administración y Finanzas',
   'Domina tablas dinámicas, funciones VLOOKUP, IF anidado y gráficos para reportes financieros y administrativos.',
   'Manejo básico de computadora.',
   'Administración', 'remoto', '24 horas', 'Miércoles 15:00–18:00',
   0.00, 35, DATE_ADD(CURDATE(), INTERVAL 17 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
  (@cb3, 'Climatización Automotriz y Refrigeración',
   'Taller sobre sistemas de aire acondicionado vehicular: diagnóstico, carga de gas refrigerante y reparación de componentes.',
   'Conocimientos previos en mecánica automotriz.',
   'Mecánica Automotriz', 'presencial', '28 horas', 'Viernes y Sábado 9:00–12:30',
   0.00, 14, DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 55 DAY)),
  (@cb3, 'Servicio al Cliente y Protocolo Empresarial',
   'Técnicas de atención al cliente, manejo de reclamos y protocolo en contextos comerciales e institucionales.',
   'Abierto a estudiantes de 2° a 4° Medio.',
   'Administración', 'presencial', '18 horas', 'Lunes 15:00–18:00',
   0.00, 28, DATE_ADD(CURDATE(), INTERVAL 11 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
  (@cg1, 'Frenos ABS y Sistemas de Seguridad Activa',
   'Taller avanzado sobre sistemas de frenos ABS, EBD y asistencia de frenado en vehículos modernos.',
   '3° o 4° Medio Mecánica Automotriz.',
   'Mecánica Automotriz', 'presencial', '32 horas', 'Sábados 8:00–13:00',
   0.00, 18, DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_ADD(CURDATE(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 48 DAY)),
  (@cg1, 'Recursos Humanos y Legislación Laboral',
   'Introducción al ciclo de RRHH: selección, contratación, remuneraciones y finiquito según la legislación chilena.',
   'Estudiantes de Administración.',
   'Administración', 'hibrido', '26 horas', 'Martes 15:30–18:00',
   0.00, 24, DATE_ADD(CURDATE(), INTERVAL 19 DAY), DATE_ADD(CURDATE(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 32 DAY)),
  (@cg2, 'Mecánica de Transmisión y Caja de Cambios',
   'Diagnóstico y reparación de sistemas de transmisión manual y automática en vehículos de pasajeros.',
   'Haber completado el módulo de motor.',
   'Mecánica Automotriz', 'presencial', '38 horas', 'Lunes y Miércoles 15:00–18:30',
   0.00, 16, DATE_ADD(CURDATE(), INTERVAL 9 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 58 DAY)),
  (@cg2, 'Marketing Digital para Pymes',
   'Estrategias de marketing en redes sociales, email marketing y posicionamiento web para pequeñas empresas.',
   'Estudiantes de Administración de 4° Medio.',
   'Administración', 'remoto', '20 horas', 'Jueves 15:00–17:30',
   0.00, 40, DATE_ADD(CURDATE(), INTERVAL 21 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
  (@cg3, 'Introducción a Vehículos Eléctricos e Híbridos',
   'Fundamentos de la movilidad eléctrica, sistemas de alta tensión, baterías y diagnóstico básico en EVs.',
   'Estudiantes de 4° Medio Mecánica Automotriz. Obligatorio EPP.',
   'Mecánica Automotriz', 'presencial', '40 horas', 'Sábados 9:00–14:00',
   0.00, 14, DATE_ADD(CURDATE(), INTERVAL 28 DAY), DATE_ADD(CURDATE(), INTERVAL 21 DAY), DATE_SUB(NOW(), INTERVAL 65 DAY)),
  (@cg3, 'Control de Gestión y Presupuesto Empresarial',
   'Elaboración de presupuestos, análisis de variaciones, KPIs y cuadro de mando integral para administradores.',
   'Estudiantes de Administración de 3° o 4° Medio.',
   'Administración', 'hibrido', '22 horas', 'Viernes 15:30–18:00',
   0.00, 20, DATE_ADD(CURDATE(), INTERVAL 16 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY));

-- ── F. Estudiantes nuevos (2 por colegio, 18 en total) ───────

-- @ca1 – Liceo Técnico Pedro León Gallo
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd01@demo.cl', 'Demo1234', 'estudiante');
SET @nd01 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd01, 'Rodrigo', 'Astudillo', 'Figueroa', '21.001.001-1',
    (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
    '4° Medio', 6.1, 6.3, '+56 9 5001 0001',
    'Apasionado por los motores desde los doce años. Mi meta es especializarme en vehículos eléctricos e híbridos.',
    'masculino', 'Región de Atacama', 'Copiapó', @ca1);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd01, 'Español', 'Nativo'), (@nd01, 'Inglés', 'Básico');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd01, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Diagnóstico electrónico OBD-II'          UNION ALL
  SELECT @nd01, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Reparación de motor a gasolina'          UNION ALL
  SELECT @nd01, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Sistemas de frenos ABS y convencionales' UNION ALL
  SELECT @nd01, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Soldadura automotriz'                    UNION ALL
  SELECT @nd01, id, 'Basico',      92, TRUE   FROM habilidades WHERE nombre = 'Trabajo en equipo'                      UNION ALL
  SELECT @nd01, id, 'Basico',      88, TRUE   FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad';

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd02@demo.cl', 'Demo1234', 'estudiante');
SET @nd02 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd02, 'Catalina', 'Valenzuela', 'Pino', '21.002.002-2',
    (SELECT id FROM carreras WHERE nombre = 'Administracion'),
    '3° Medio', 6.4, 6.7, '+56 9 5001 0002',
    'Me apasiona la gestión empresarial y el análisis de datos. Busco una práctica donde pueda aplicar mis conocimientos contables.',
    'femenino', 'Región de Atacama', 'Copiapó', @ca1);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd02, 'Español', 'Nativo'), (@nd02, 'Inglés', 'Intermedio');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd02, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Contabilidad general'                   UNION ALL
  SELECT @nd02, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Gestión documental y archivo'           UNION ALL
  SELECT @nd02, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Planillas Excel avanzadas'              UNION ALL
  SELECT @nd02, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Manejo de software contable (Conta+)'   UNION ALL
  SELECT @nd02, id, 'Basico',      91, TRUE   FROM habilidades WHERE nombre = 'Comunicación efectiva'                 UNION ALL
  SELECT @nd02, id, 'Basico',      89, TRUE   FROM habilidades WHERE nombre = 'Organización y planificación';

-- @ca2 – Liceo Polivalente Diego de Almagro
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd03@demo.cl', 'Demo1234', 'estudiante');
SET @nd03 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd03, 'Ignacio', 'Herrera', 'Bravo', '21.003.003-3',
    (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
    '4° Medio', 5.9, 6.2, '+56 9 5001 0003',
    'Técnico en formación con fuerte interés en la mecánica industrial. Experiencia en taller de la minería artesanal local.',
    'masculino', 'Región de Atacama', 'Diego de Almagro', @ca2);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd03, 'Español', 'Nativo');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd03, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Mantenimiento preventivo'              UNION ALL
  SELECT @nd03, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Soldadura automotriz'                  UNION ALL
  SELECT @nd03, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Reparación de motor diesel'            UNION ALL
  SELECT @nd03, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Suspensión y dirección'                UNION ALL
  SELECT @nd03, id, 'Basico',      87, TRUE   FROM habilidades WHERE nombre = 'Trabajo en equipo'                    UNION ALL
  SELECT @nd03, id, 'Basico',      82, TRUE   FROM habilidades WHERE nombre = 'Adaptabilidad al cambio';

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd04@demo.cl', 'Demo1234', 'estudiante');
SET @nd04 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd04, 'Alejandra', 'Saavedra', 'Molina', '21.004.004-4',
    (SELECT id FROM carreras WHERE nombre = 'Administracion'),
    '4° Medio', 6.6, 6.8, '+56 9 5001 0004',
    'Estudiante destacada con vocación por la administración pública. Voluntaria en la municipalidad local en tareas de gestión comunitaria.',
    'femenino', 'Región de Atacama', 'Diego de Almagro', @ca2);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd04, 'Español', 'Nativo'), (@nd04, 'Inglés', 'Básico');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd04, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Redacción de informes y actas'         UNION ALL
  SELECT @nd04, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Atención al cliente'                   UNION ALL
  SELECT @nd04, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Gestión de recursos humanos básica'    UNION ALL
  SELECT @nd04, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Facturación electrónica SII'           UNION ALL
  SELECT @nd04, id, 'Basico',      94, TRUE   FROM habilidades WHERE nombre = 'Liderazgo básico'                     UNION ALL
  SELECT @nd04, id, 'Basico',      90, TRUE   FROM habilidades WHERE nombre = 'Empatía y relaciones interpersonales';

-- @ca3 – C.E. Tierra Amarilla
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd05@demo.cl', 'Demo1234', 'estudiante');
SET @nd05 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd05, 'Sebastián', 'Cortés', 'Tapia', '21.005.005-5',
    (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
    '3° Medio', 5.7, 5.9, '+56 9 5001 0005',
    'Joven mecánico con ganas de aprender. Mi familia tiene un pequeño taller en Tierra Amarilla, quiero formalizarlo y crecer.',
    'masculino', 'Región de Atacama', 'Tierra Amarilla', @ca3);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd05, 'Español', 'Nativo');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd05, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Cambio de aceite y filtros'             UNION ALL
  SELECT @nd05, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Mantenimiento preventivo'               UNION ALL
  SELECT @nd05, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Sistemas de frenos ABS y convencionales' UNION ALL
  SELECT @nd05, id, 'Basico',      85, TRUE   FROM habilidades WHERE nombre = 'Resolución de problemas'               UNION ALL
  SELECT @nd05, id, 'Basico',      80, TRUE   FROM habilidades WHERE nombre = 'Iniciativa y proactividad';

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd06@demo.cl', 'Demo1234', 'estudiante');
SET @nd06 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd06, 'Sofía', 'Vásquez', 'Reyes', '21.006.006-6',
    (SELECT id FROM carreras WHERE nombre = 'Administracion'),
    '4° Medio', 6.3, 6.5, '+56 9 5001 0006',
    'Interesada en la administración de empresas locales en zonas rurales. He apoyado la contabilidad del pequeño negocio familiar.',
    'femenino', 'Región de Atacama', 'Tierra Amarilla', @ca3);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd06, 'Español', 'Nativo');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd06, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Manejo de caja y fondos'                UNION ALL
  SELECT @nd06, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Contabilidad general'                   UNION ALL
  SELECT @nd06, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Control de inventario'                  UNION ALL
  SELECT @nd06, id, 'Basico',      88, TRUE   FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad'         UNION ALL
  SELECT @nd06, id, 'Basico',      83, TRUE   FROM habilidades WHERE nombre = 'Orientación al detalle';

-- @cb1 – Liceo Comercial Cerro Navia
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd07@demo.cl', 'Demo1234', 'estudiante');
SET @nd07 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd07, 'Felipe', 'Contreras', 'Mora', '21.007.007-7',
    (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
    '4° Medio', 6.0, 6.1, '+56 9 5001 0007',
    'Estudiante de mecánica con especialidad en eléctrico automotriz. Certificado en primeros auxilios y seguridad industrial.',
    'masculino', 'Región Metropolitana de Santiago', 'Cerro Navia', @cb1);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd07, 'Español', 'Nativo'), (@nd07, 'Inglés', 'Básico');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd07, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Sistemas eléctricos y electrónicos'    UNION ALL
  SELECT @nd07, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Diagnóstico electrónico OBD-II'        UNION ALL
  SELECT @nd07, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Mantenimiento preventivo'              UNION ALL
  SELECT @nd07, id, 'Basico',      90, TRUE   FROM habilidades WHERE nombre = 'Trabajo en equipo'                    UNION ALL
  SELECT @nd07, id, 'Basico',      86, TRUE   FROM habilidades WHERE nombre = 'Manejo del estrés';

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd08@demo.cl', 'Demo1234', 'estudiante');
SET @nd08 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd08, 'Javiera', 'Espinoza', 'Lazo', '21.008.008-8',
    (SELECT id FROM carreras WHERE nombre = 'Administracion'),
    '3° Medio', 6.5, 6.9, '+56 9 5001 0008',
    'Apasionada por los números y la organización empresarial. Representante de curso y líder del club de finanzas del liceo.',
    'femenino', 'Región Metropolitana de Santiago', 'Cerro Navia', @cb1);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd08, 'Español', 'Nativo'), (@nd08, 'Inglés', 'Intermedio');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd08, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Planillas Excel avanzadas'             UNION ALL
  SELECT @nd08, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Contabilidad general'                  UNION ALL
  SELECT @nd08, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Elaboración de presupuestos'           UNION ALL
  SELECT @nd08, id, 'Basico',      93, TRUE   FROM habilidades WHERE nombre = 'Liderazgo básico'                     UNION ALL
  SELECT @nd08, id, 'Basico',      89, TRUE   FROM habilidades WHERE nombre = 'Pensamiento crítico';

-- @cb2 – Complejo Educacional Lo Prado
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd09@demo.cl', 'Demo1234', 'estudiante');
SET @nd09 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd09, 'Cristóbal', 'Muñoz', 'Gallardo', '21.009.009-9',
    (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
    '4° Medio', 5.8, 6.0, '+56 9 5001 0009',
    'Mecánico en formación con énfasis en soldadura y carrocería. Participé en la Olimpiada Técnica Regional 2024.',
    'masculino', 'Región Metropolitana de Santiago', 'Lo Prado', @cb2);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd09, 'Español', 'Nativo');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd09, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Soldadura automotriz'                  UNION ALL
  SELECT @nd09, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Reparación de motor a gasolina'        UNION ALL
  SELECT @nd09, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Sistemas eléctricos y electrónicos'    UNION ALL
  SELECT @nd09, id, 'Basico',      85, TRUE   FROM habilidades WHERE nombre = 'Resolución de problemas'              UNION ALL
  SELECT @nd09, id, 'Basico',      81, TRUE   FROM habilidades WHERE nombre = 'Trabajo en equipo';

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd10@demo.cl', 'Demo1234', 'estudiante');
SET @nd10 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd10, 'Valentina', 'Poblete', 'Cárdenas', '21.010.010-0',
    (SELECT id FROM carreras WHERE nombre = 'Administracion'),
    '4° Medio', 6.2, 6.4, '+56 9 5001 0010',
    'Entusiasta de la gestión de proyectos y recursos humanos. He organizado eventos culturales del colegio por dos años consecutivos.',
    'femenino', 'Región Metropolitana de Santiago', 'Lo Prado', @cb2);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd10, 'Español', 'Nativo'), (@nd10, 'Inglés', 'Intermedio');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd10, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Gestión de recursos humanos básica'    UNION ALL
  SELECT @nd10, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Redacción de informes y actas'         UNION ALL
  SELECT @nd10, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Planillas Excel avanzadas'             UNION ALL
  SELECT @nd10, id, 'Basico',      91, TRUE   FROM habilidades WHERE nombre = 'Organización y planificación'         UNION ALL
  SELECT @nd10, id, 'Basico',      88, TRUE   FROM habilidades WHERE nombre = 'Comunicación efectiva';

-- @cb3 – Liceo Industrial Pudahuel
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd11@demo.cl', 'Demo1234', 'estudiante');
SET @nd11 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd11, 'Nicolás', 'Flores', 'Santander', '21.011.011-1',
    (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
    '3° Medio', 6.1, 6.3, '+56 9 5001 0011',
    'Me especializo en climatización automotriz. Mi sueño es montar mi propio taller de aire acondicionado vehicular en Pudahuel.',
    'masculino', 'Región Metropolitana de Santiago', 'Pudahuel', @cb3);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd11, 'Español', 'Nativo');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd11, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Sistemas de climatización automotriz'  UNION ALL
  SELECT @nd11, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Sistemas eléctricos y electrónicos'    UNION ALL
  SELECT @nd11, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Diagnóstico electrónico OBD-II'        UNION ALL
  SELECT @nd11, id, 'Basico',      87, TRUE   FROM habilidades WHERE nombre = 'Adaptabilidad al cambio'              UNION ALL
  SELECT @nd11, id, 'Basico',      83, TRUE   FROM habilidades WHERE nombre = 'Iniciativa y proactividad';

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd12@demo.cl', 'Demo1234', 'estudiante');
SET @nd12 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd12, 'Antonia', 'Gutiérrez', 'Díaz', '21.012.012-2',
    (SELECT id FROM carreras WHERE nombre = 'Administracion'),
    '4° Medio', 6.7, 6.9, '+56 9 5001 0012',
    'Estudiante con excelentes notas y habilidades interpersonales destacadas. Realicé práctica voluntaria en OTEC local como apoyo administrativo.',
    'femenino', 'Región Metropolitana de Santiago', 'Pudahuel', @cb3);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd12, 'Español', 'Nativo'), (@nd12, 'Inglés', 'Avanzado');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd12, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Atención al cliente'                   UNION ALL
  SELECT @nd12, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Manejo de software contable (Conta+)'  UNION ALL
  SELECT @nd12, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Facturación electrónica SII'           UNION ALL
  SELECT @nd12, id, 'Basico',      95, TRUE   FROM habilidades WHERE nombre = 'Comunicación efectiva'                UNION ALL
  SELECT @nd12, id, 'Basico',      93, TRUE   FROM habilidades WHERE nombre = 'Empatía y relaciones interpersonales';

-- @cg1 – Liceo Polivalente La Florida
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd13@demo.cl', 'Demo1234', 'estudiante');
SET @nd13 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd13, 'Andrés', 'Paredes', 'Medina', '21.013.013-3',
    (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
    '4° Medio', 6.3, 6.4, '+56 9 5001 0013',
    'Técnico en formación con manejo avanzado de sistemas de frenos y suspensión. Participé como monitor en talleres de mecánica básica.',
    'masculino', 'Región Metropolitana de Santiago', 'La Florida', @cg1);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd13, 'Español', 'Nativo'), (@nd13, 'Inglés', 'Básico');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd13, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Sistemas de frenos ABS y convencionales' UNION ALL
  SELECT @nd13, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Suspensión y dirección'                  UNION ALL
  SELECT @nd13, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Mantenimiento preventivo'                UNION ALL
  SELECT @nd13, id, 'Basico',      89, TRUE   FROM habilidades WHERE nombre = 'Trabajo en equipo'                      UNION ALL
  SELECT @nd13, id, 'Basico',      85, TRUE   FROM habilidades WHERE nombre = 'Responsabilidad y puntualidad';

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd14@demo.cl', 'Demo1234', 'estudiante');
SET @nd14 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd14, 'Isidora', 'Castro', 'Fuentes', '21.014.014-4',
    (SELECT id FROM carreras WHERE nombre = 'Administracion'),
    '3° Medio', 6.5, 6.7, '+56 9 5001 0014',
    'Me interesa la dirección de empresas y la gestión de RRHH. Cursé un taller de marketing digital que me abrió nuevas perspectivas.',
    'femenino', 'Región Metropolitana de Santiago', 'La Florida', @cg1);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd14, 'Español', 'Nativo'), (@nd14, 'Inglés', 'Intermedio');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd14, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Gestión de recursos humanos básica'    UNION ALL
  SELECT @nd14, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Contabilidad general'                  UNION ALL
  SELECT @nd14, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Elaboración de presupuestos'           UNION ALL
  SELECT @nd14, id, 'Basico',      92, TRUE   FROM habilidades WHERE nombre = 'Liderazgo básico'                     UNION ALL
  SELECT @nd14, id, 'Basico',      88, TRUE   FROM habilidades WHERE nombre = 'Pensamiento crítico';

-- @cg2 – C.E. San Joaquín
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd15@demo.cl', 'Demo1234', 'estudiante');
SET @nd15 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd15, 'Tomás', 'Alarcón', 'Navarro', '21.015.015-5',
    (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
    '4° Medio', 5.9, 6.1, '+56 9 5001 0015',
    'Especializado en transmisiones y cajas de cambio. He realizado prácticas voluntarias en taller de la zona sur de Santiago.',
    'masculino', 'Región Metropolitana de Santiago', 'San Joaquín', @cg2);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd15, 'Español', 'Nativo');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd15, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Reparación de motor a gasolina'        UNION ALL
  SELECT @nd15, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Reparación de motor diesel'            UNION ALL
  SELECT @nd15, id, 'Intermedio', NULL, FALSE FROM habilidades WHERE nombre = 'Diagnóstico electrónico OBD-II'        UNION ALL
  SELECT @nd15, id, 'Basico',      86, TRUE   FROM habilidades WHERE nombre = 'Resolución de problemas'              UNION ALL
  SELECT @nd15, id, 'Basico',      82, TRUE   FROM habilidades WHERE nombre = 'Adaptabilidad al cambio';

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd16@demo.cl', 'Demo1234', 'estudiante');
SET @nd16 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd16, 'Camila', 'Robles', 'Aguilera', '21.016.016-6',
    (SELECT id FROM carreras WHERE nombre = 'Administracion'),
    '4° Medio', 6.4, 6.6, '+56 9 5001 0016',
    'Especialidad en marketing y ventas. Realicé taller de redes sociales y actualmente administro las redes del colegio.',
    'femenino', 'Región Metropolitana de Santiago', 'San Joaquín', @cg2);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd16, 'Español', 'Nativo'), (@nd16, 'Inglés', 'Intermedio');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd16, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Atención al cliente'                   UNION ALL
  SELECT @nd16, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Redacción de informes y actas'         UNION ALL
  SELECT @nd16, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Planillas Excel avanzadas'             UNION ALL
  SELECT @nd16, id, 'Basico',      90, TRUE   FROM habilidades WHERE nombre = 'Comunicación efectiva'                UNION ALL
  SELECT @nd16, id, 'Basico',      87, TRUE   FROM habilidades WHERE nombre = 'Iniciativa y proactividad';

-- @cg3 – Liceo Técnico Macul
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd17@demo.cl', 'Demo1234', 'estudiante');
SET @nd17 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd17, 'Diego', 'Morales', 'Ríos', '21.017.017-7',
    (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
    '4° Medio', 6.4, 6.6, '+56 9 5001 0017',
    'Pionero en mi curso en el módulo de vehículos eléctricos. Asistí a la ExpoTech 2024 como representante del liceo.',
    'masculino', 'Región Metropolitana de Santiago', 'Macul', @cg3);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd17, 'Español', 'Nativo'), (@nd17, 'Inglés', 'Intermedio');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd17, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Diagnóstico electrónico OBD-II'         UNION ALL
  SELECT @nd17, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Sistemas eléctricos y electrónicos'     UNION ALL
  SELECT @nd17, id, 'Intermedio', NULL, TRUE  FROM habilidades WHERE nombre = 'Lectura de planos y manuales técnicos'  UNION ALL
  SELECT @nd17, id, 'Basico',      91, TRUE   FROM habilidades WHERE nombre = 'Pensamiento crítico'                   UNION ALL
  SELECT @nd17, id, 'Basico',      88, TRUE   FROM habilidades WHERE nombre = 'Iniciativa y proactividad';

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('nd18@demo.cl', 'Demo1234', 'estudiante');
SET @nd18 = LAST_INSERT_ID();
INSERT INTO perfiles_estudiantes (usuario_id, nombre, apellido_paterno, apellido_materno, rut, carrera_id, nivel, promedio, calificacion_docente, telefono, biografia, genero, region, comuna, colegio_id)
  VALUES (@nd18, 'Renata', 'Silva', 'Espinoza', '21.018.018-8',
    (SELECT id FROM carreras WHERE nombre = 'Administracion'),
    '3° Medio', 6.6, 6.8, '+56 9 5001 0018',
    'Con vocación por las finanzas corporativas. Participé en el programa "Jóvenes al Mercado" de la Bolsa de Santiago como estudiante observadora.',
    'femenino', 'Región Metropolitana de Santiago', 'Macul', @cg3);
INSERT INTO idiomas_estudiantes (estudiante_id, idioma, nivel) VALUES (@nd18, 'Español', 'Nativo'), (@nd18, 'Inglés', 'Avanzado'), (@nd18, 'Portugués', 'Básico');
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, porcentaje, esta_validada)
  SELECT @nd18, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Elaboración de presupuestos'           UNION ALL
  SELECT @nd18, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Contabilidad general'                  UNION ALL
  SELECT @nd18, id, 'Avanzado',   NULL, TRUE  FROM habilidades WHERE nombre = 'Planillas Excel avanzadas'             UNION ALL
  SELECT @nd18, id, 'Basico',      96, TRUE   FROM habilidades WHERE nombre = 'Pensamiento crítico'                  UNION ALL
  SELECT @nd18, id, 'Basico',      93, TRUE   FROM habilidades WHERE nombre = 'Organización y planificación';

-- ── G. Nuevas empresas ───────────────────────────────────────

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('emp_norte@demo.cl', 'Demo1234', 'empresa');
SET @emp_norte = LAST_INSERT_ID();
INSERT INTO perfiles_empresas (usuario_id, nombre_empresa, telefono_contacto, descripcion, region, comuna)
  VALUES (@emp_norte, 'Automotores del Norte SpA', '+56521887766',
    'Concesionario y taller de servicio técnico autorizado con presencia en la Región de Atacama. Más de 20 años de experiencia en mantención de flotas mineras.',
    'Región de Atacama', 'Copiapó');

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('emp_barr@demo.cl', 'Demo1234', 'empresa');
SET @emp_barr = LAST_INSERT_ID();
INSERT INTO perfiles_empresas (usuario_id, nombre_empresa, telefono_contacto, descripcion, region, comuna)
  VALUES (@emp_barr, 'Servicios Contables Barrancas Ltda.', '+56222998877',
    'Empresa de outsourcing contable y tributario orientada a pymes del sector poniente de Santiago. Ofrecemos prácticas supervisadas con posibilidad de contratación.',
    'Región Metropolitana de Santiago', 'Cerro Navia');

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('emp_fl@demo.cl', 'Demo1234', 'empresa');
SET @emp_fl = LAST_INSERT_ID();
INSERT INTO perfiles_empresas (usuario_id, nombre_empresa, telefono_contacto, descripcion, region, comuna)
  VALUES (@emp_fl, 'Constructora La Florida S.A.', '+56225667788',
    'Empresa constructora con división de administración de proyectos y gestión de contratos. Actualizamos nuestra planta de técnicos junior cada año.',
    'Región Metropolitana de Santiago', 'La Florida');

-- ── H. Vacantes nuevas (2 por empresa) ──────────────────────

INSERT INTO vacantes (empresa_id, titulo, descripcion, requisitos, tipo, area, modalidad, remuneracion, direccion, beneficios, fecha_limite, esta_activa, fecha_creacion)
  VALUES (@emp_norte, 'Práctica Técnico en Mecánica Automotriz',
    'Buscamos practicante para área de taller de mantención preventiva de vehículos livianos y de carga. Trabajará junto a mecánicos certificados con más de 10 años de experiencia.',
    'Estudiante de 4° Medio o egresado de Mecánica Automotriz. Disponibilidad de lunes a viernes.',
    'practica', 'Automotriz',
    'presencial', '$250.000 mensual',
    'Av. Los Mineros 450, Copiapó',
    'Colación provista. EPP completo. Uniforme. Certificado de práctica detallado.',
    DATE_ADD(CURDATE(), INTERVAL 30 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY));
SET @v_norte1 = LAST_INSERT_ID();

INSERT INTO vacantes (empresa_id, titulo, descripcion, requisitos, tipo, area, modalidad, remuneracion, direccion, beneficios, fecha_limite, esta_activa, fecha_creacion)
  VALUES (@emp_norte, 'Técnico Automotriz Junior',
    'Posición permanente para técnico junior en área de diagnóstico electrónico y mantención correctiva. Trabajo en flota de vehículos mineros.',
    'Egresado de Mecánica Automotriz con manejo de OBD-II. Licencia de conducir clase B.',
    'puesto_laboral', 'Automotriz',
    'presencial', '$550.000 + bono',
    'Av. Los Mineros 450, Copiapó',
    'Seguro complementario de salud. Bono de productividad mensual. Uniforme y EPP.',
    DATE_ADD(CURDATE(), INTERVAL 45 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY));
SET @v_norte2 = LAST_INSERT_ID();

INSERT INTO vacantes (empresa_id, titulo, descripcion, requisitos, tipo, area, modalidad, remuneracion, direccion, beneficios, fecha_limite, esta_activa, fecha_creacion)
  VALUES (@emp_barr, 'Práctica en Contabilidad y Tributación',
    'Practicante para apoyar en registro contable, cuadraturas, emisión de documentos tributarios y atención de clientes empresariales.',
    'Estudiante o egresado de Administración con conocimientos de contabilidad general y SII. Manejo de Excel.',
    'practica', 'Contabilidad',
    'presencial', '$200.000 mensual',
    'Teniente Cruz 890, Cerro Navia',
    'Colación incluida. Mentoría de contador senior. Evaluación para contratación al término.',
    DATE_ADD(CURDATE(), INTERVAL 25 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 7 DAY));
SET @v_barr1 = LAST_INSERT_ID();

INSERT INTO vacantes (empresa_id, titulo, descripcion, requisitos, tipo, area, modalidad, remuneracion, direccion, beneficios, fecha_limite, esta_activa, fecha_creacion)
  VALUES (@emp_barr, 'Auxiliar Contable',
    'Posición part-time para apoyo en área contable. Responsable de conciliaciones bancarias, libro de compras/ventas y emisión de facturas.',
    'Egresado de Administración con conocimiento de Conta+ o SoftLand. Proactividad y orientación al detalle.',
    'puesto_laboral', 'Contabilidad',
    'presencial', '$380.000 mensual',
    'Teniente Cruz 890, Cerro Navia',
    'Horario flexible. Posibilidad de contrato indefinido. Capacitación continua.',
    DATE_ADD(CURDATE(), INTERVAL 35 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY));
SET @v_barr2 = LAST_INSERT_ID();

INSERT INTO vacantes (empresa_id, titulo, descripcion, requisitos, tipo, area, modalidad, remuneracion, direccion, beneficios, fecha_limite, esta_activa, fecha_creacion)
  VALUES (@emp_fl, 'Asistente Administrativo de Proyectos',
    'Apoyo en gestión de contratos, coordinación de proveedores y control documental de proyectos de construcción en la zona sur de Santiago.',
    'Egresado o estudiante de Administración. Manejo de Excel y Word. Buena redacción.',
    'puesto_laboral', 'Administración',
    'presencial', '$420.000 mensual',
    'Av. Vicuña Mackenna Sur 1200, La Florida',
    'Seguro de salud complementario. Bono de desempeño semestral. Estacionamiento.',
    DATE_ADD(CURDATE(), INTERVAL 40 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY));
SET @v_fl1 = LAST_INSERT_ID();

INSERT INTO vacantes (empresa_id, titulo, descripcion, requisitos, tipo, area, modalidad, remuneracion, direccion, beneficios, fecha_limite, esta_activa, fecha_creacion)
  VALUES (@emp_fl, 'Técnico en Gestión de Contratos',
    'Revisión y control de contratos con subcontratistas, seguimiento de cumplimiento y archivo documental del área legal-administrativa.',
    'Egresado de Administración con interés en el sector construcción. Capacidad analítica y atención al detalle.',
    'puesto_laboral', 'Administración',
    'presencial', '$480.000 mensual',
    'Av. Vicuña Mackenna Sur 1200, La Florida',
    'Bono por cumplimiento de hitos. Capacitación en gestión de proyectos BIM.',
    DATE_ADD(CURDATE(), INTERVAL 50 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY));
SET @v_fl2 = LAST_INSERT_ID();

-- ── I. Publicaciones de vacantes con imágenes ────────────────

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en)
  VALUES (@emp_norte, (SELECT id FROM tipos_publicacion WHERE nombre='vacante'),
    'Práctica Técnico en Mecánica Automotriz – Copiapó',
    'Automotores del Norte SpA está en búsqueda de practicantes de Mecánica Automotriz para integrarse a nuestro equipo de taller. Trabajarás junto a mecánicos certificados en mantención preventiva y diagnóstico de vehículos. Postula antes del cierre.',
    'https://picsum.photos/seed/automotores/800/600',
    DATE_SUB(NOW(), INTERVAL 5 DAY));
SET @pub_v_norte1 = LAST_INSERT_ID();
INSERT INTO publicaciones_vacantes (publicacion_id, vacante_id) VALUES (@pub_v_norte1, @v_norte1);

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en)
  VALUES (@emp_norte, (SELECT id FROM tipos_publicacion WHERE nombre='vacante'),
    'Técnico Automotriz Junior – Posición Permanente en Copiapó',
    '¡Abrimos vacante permanente! Si eres egresado de Mecánica Automotriz con manejo de OBD-II y licencia clase B, esta oportunidad es para ti. Ofrecemos bono de productividad y seguro complementario.',
    'https://picsum.photos/seed/tallernorte/800/600',
    DATE_SUB(NOW(), INTERVAL 3 DAY));
SET @pub_v_norte2 = LAST_INSERT_ID();
INSERT INTO publicaciones_vacantes (publicacion_id, vacante_id) VALUES (@pub_v_norte2, @v_norte2);

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en)
  VALUES (@emp_barr, (SELECT id FROM tipos_publicacion WHERE nombre='vacante'),
    'Práctica en Contabilidad – Cerro Navia',
    'Servicios Contables Barrancas ofrece práctica profesional supervisada en contabilidad y tributación. Colación incluida y mentoría personalizada. Evaluamos contratación al término del período.',
    'https://picsum.photos/seed/contabilidad/800/600',
    DATE_SUB(NOW(), INTERVAL 7 DAY));
SET @pub_v_barr1 = LAST_INSERT_ID();
INSERT INTO publicaciones_vacantes (publicacion_id, vacante_id) VALUES (@pub_v_barr1, @v_barr1);

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en)
  VALUES (@emp_barr, (SELECT id FROM tipos_publicacion WHERE nombre='vacante'),
    'Auxiliar Contable Part-Time – Horario Flexible',
    'Buscamos técnico en Administración para rol de auxiliar contable. Horario flexible, capacitación continua y posibilidad de contrato indefinido. Ideal para egresados recientes.',
    'https://picsum.photos/seed/oficina/800/600',
    DATE_SUB(NOW(), INTERVAL 2 DAY));
SET @pub_v_barr2 = LAST_INSERT_ID();
INSERT INTO publicaciones_vacantes (publicacion_id, vacante_id) VALUES (@pub_v_barr2, @v_barr2);

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en)
  VALUES (@emp_fl, (SELECT id FROM tipos_publicacion WHERE nombre='vacante'),
    'Asistente Administrativo de Proyectos – La Florida',
    'Constructora La Florida incorpora asistente administrativo para apoyar gestión de contratos y proveedores. Excelente ambiente laboral y beneficios. Envía tu CV actualizado.',
    'https://picsum.photos/seed/construccion/800/600',
    DATE_SUB(NOW(), INTERVAL 4 DAY));
SET @pub_v_fl1 = LAST_INSERT_ID();
INSERT INTO publicaciones_vacantes (publicacion_id, vacante_id) VALUES (@pub_v_fl1, @v_fl1);

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en)
  VALUES (@emp_fl, (SELECT id FROM tipos_publicacion WHERE nombre='vacante'),
    'Técnico en Gestión de Contratos – Sector Construcción',
    'Incorporamos técnico para control y seguimiento de contratos con subcontratistas. Capacitación en BIM incluida. Bono por cumplimiento de hitos.',
    'https://picsum.photos/seed/gestion/800/600',
    DATE_SUB(NOW(), INTERVAL 1 DAY));
SET @pub_v_fl2 = LAST_INSERT_ID();
INSERT INTO publicaciones_vacantes (publicacion_id, vacante_id) VALUES (@pub_v_fl2, @v_fl2);

-- ── J. Postulaciones ─────────────────────────────────────────

INSERT INTO postulaciones (estudiante_id, vacante_id, estado, fecha_creacion) VALUES
  (@nd01, @v_norte1, 'pendiente', DATE_SUB(NOW(), INTERVAL 4 DAY)),
  (@nd03, @v_norte1, 'pendiente', DATE_SUB(NOW(), INTERVAL 3 DAY)),
  (@nd05, @v_norte1, 'pendiente', DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (@nd07, @v_norte1, 'pendiente', DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (@nd02, @v_barr1,  'pendiente', DATE_SUB(NOW(), INTERVAL 6 DAY)),
  (@nd06, @v_barr1,  'pendiente', DATE_SUB(NOW(), INTERVAL 5 DAY)),
  (@nd08, @v_barr2,  'pendiente', DATE_SUB(NOW(), INTERVAL 1 DAY)),
  (@nd12, @v_barr2,  'pendiente', DATE_SUB(NOW(), INTERVAL 1 DAY)),
  (@nd14, @v_fl1,    'pendiente', DATE_SUB(NOW(), INTERVAL 3 DAY)),
  (@nd16, @v_fl1,    'pendiente', DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (@nd18, @v_fl2,    'pendiente', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ── K. Publicaciones institucionales con imágenes ────────────

-- SLEP Atacama
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  (@slep_a, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Bienvenidos al nuevo año académico 2025 – SLEP Atacama',
   'El equipo del SLEP Atacama da la bienvenida a todos los estudiantes, docentes y familias que forman parte de nuestra red educativa en la Región de Atacama. Este año apostamos por la educación técnica como motor del desarrollo regional.',
   'https://picsum.photos/seed/atacama/800/600',
   DATE_SUB(NOW(), INTERVAL 60 DAY)),
  (@slep_a, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Firma de convenio con empresas mineras de la región',
   'El SLEP Atacama firmó convenios de práctica profesional con tres empresas del sector minero de Copiapó y Diego de Almagro. Estos acuerdos beneficiarán a más de 80 estudiantes de Mecánica Automotriz de nuestros liceos.',
   'https://picsum.photos/seed/convenio/800/600',
   DATE_SUB(NOW(), INTERVAL 30 DAY));

-- SLEP Barrancas
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  (@slep_b, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'SLEP Barrancas presenta nueva plataforma de empleabilidad',
   'Lanzamos EmpleaMe en toda nuestra red de colegios del sector poniente. Esta plataforma conecta a nuestros estudiantes con empresas locales para prácticas y empleos técnicos. Los invitamos a explorarla y a completar sus perfiles.',
   'https://picsum.photos/seed/plataforma/800/600',
   DATE_SUB(NOW(), INTERVAL 15 DAY)),
  (@slep_b, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Feria de Empleabilidad Barrancas 2025',
   'El próximo mes realizaremos la Feria de Empleabilidad de nuestra red. Más de 20 empresas de los rubros automotriz, contable y servicios estarán presentes. ¡Prepara tu CV y postula a las vacantes disponibles!',
   'https://picsum.photos/seed/feria/800/600',
   DATE_SUB(NOW(), INTERVAL 5 DAY));

-- SLEP Gabriela Mistral
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  (@slep_g, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Lanzamiento del Programa de Prácticas SLEP Gabriela Mistral',
   'Estamos emocionados de anunciar el Programa de Prácticas 2025, que conecta a más de 150 estudiantes de nuestra red con empresas del suroriente de Santiago. Inscripciones abiertas hasta el 30 de mayo.',
   'https://picsum.photos/seed/programa/800/600',
   DATE_SUB(NOW(), INTERVAL 10 DAY)),
  (@slep_g, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Resultados Evaluación Diagnóstica 2025 – Red GM',
   'Con satisfacción informamos que el 78% de nuestros estudiantes de 4° Medio obtuvo calificaciones sobre 6.0 en la evaluación diagnóstica. Reconocemos el esfuerzo de docentes, familias y alumnos por este resultado.',
   'https://picsum.photos/seed/resultados/800/600',
   DATE_SUB(NOW(), INTERVAL 20 DAY));

-- Colegios
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  (@ca1, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Taller de Diagnóstico OBD-II: cupos disponibles',
   'El Liceo Técnico Pedro León Gallo abre inscripciones para el Taller de Diagnóstico Electrónico OBD-II Avanzado. Cupos limitados a 20 participantes. Los interesados deben acercarse a secretaría antes del viernes.',
   'https://picsum.photos/seed/obd2/800/600',
   DATE_SUB(NOW(), INTERVAL 8 DAY)),
  (@cb1, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Nuestros alumnos en la Feria Tecnológica Metropolitana',
   'Cinco estudiantes del Liceo Comercial Cerro Navia participaron en la Feria Tecnológica Metropolitana, presentando su proyecto de gestión documental digital. Felicitaciones por representar a nuestro liceo con excelencia.',
   'https://picsum.photos/seed/feria_tec/800/600',
   DATE_SUB(NOW(), INTERVAL 18 DAY)),
  (@cg1, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Convenio con Automotora para prácticas en La Florida',
   'Firmamos convenio de práctica profesional con una empresa automotriz de La Florida. Los estudiantes de 4° Medio de Mecánica Automotriz tendrán prioridad en las postulaciones.',
   'https://picsum.photos/seed/convenio_auto/800/600',
   DATE_SUB(NOW(), INTERVAL 12 DAY)),
  (@cg3, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Inauguración del Laboratorio de Vehículos Eléctricos',
   'Con gran orgullo inauguramos el primer laboratorio escolar de vehículos eléctricos e híbridos de la Región Metropolitana. Equipado con un EV de prueba y simuladores de diagnóstico de alta tensión.',
   'https://picsum.photos/seed/ev_lab/800/600',
   DATE_SUB(NOW(), INTERVAL 25 DAY)),
  (@cb2, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Resultados Olimpiada Técnica 2024 – ¡Medalla de oro!',
   'Nuestro estudiante Cristóbal Muñoz obtuvo medalla de oro en la categoría Soldadura de la Olimpiada Técnica Regional 2024. ¡Todo el establecimiento está orgulloso de este logro!',
   'https://picsum.photos/seed/olimpiada/800/600',
   DATE_SUB(NOW(), INTERVAL 45 DAY));

-- Estudiantes nuevos
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  (@nd01, (SELECT id FROM tipos_publicacion WHERE nombre='logro'),
   'Certifiqué en diagnóstico OBD-II avanzado',
   'Acabo de completar el taller de Diagnóstico Electrónico OBD-II en mi liceo. Aprendí a identificar fallas en módulos ECU, sensores de O2 y sistemas de inyección. Un paso más hacia ser técnico automotriz certificado.',
   'https://picsum.photos/seed/certificado_obd/800/600',
   DATE_SUB(NOW(), INTERVAL 7 DAY)),
  (@nd08, (SELECT id FROM tipos_publicacion WHERE nombre='logro'),
   '¡Primera Feria de Emprendimiento y quedo en 2° lugar!',
   'Presenté mi proyecto de finanzas personales para jóvenes en la feria de emprendimiento del liceo y quedé en segundo lugar. Aprendí muchísimo sobre comunicar ideas con claridad y confianza.',
   'https://picsum.photos/seed/emprendimiento/800/600',
   DATE_SUB(NOW(), INTERVAL 14 DAY)),
  (@nd12, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Reflexión: lo que aprendí en mi práctica en OTEC',
   'Tres semanas de práctica voluntaria en un OTEC me enseñaron más que un semestre de clases. La gestión real, las urgencias tributarias y la atención a clientes son cosas que no se aprenden solo en libros.',
   'https://picsum.photos/seed/practica_otec/800/600',
   DATE_SUB(NOW(), INTERVAL 21 DAY)),
  (@nd17, (SELECT id FROM tipos_publicacion WHERE nombre='logro'),
   'Representé al liceo en ExpoTech 2024',
   'Fui seleccionado para representar al Liceo Técnico Macul en la ExpoTech 2024. Presentamos el proyecto de adaptación de un vehículo convencional a sistema híbrido básico. Una experiencia que marcó mi vocación.',
   'https://picsum.photos/seed/expotech/800/600',
   DATE_SUB(NOW(), INTERVAL 35 DAY)),
  (@nd04, (SELECT id FROM tipos_publicacion WHERE nombre='general'),
   'Voluntariado en la Municipalidad de Diego de Almagro',
   'Llevo dos meses apoyando el área de gestión documental en la municipalidad de mi ciudad. Un desafío enorme que me dio una visión real de la administración pública.',
   'https://picsum.photos/seed/municipio/800/600',
   DATE_SUB(NOW(), INTERVAL 28 DAY)),
  (@nd18, (SELECT id FROM tipos_publicacion WHERE nombre='logro'),
   'Jóvenes al Mercado – Bolsa de Santiago',
   'Participé como estudiante observadora en el programa Jóvenes al Mercado de la Bolsa de Santiago. Ver cómo funcionan los mercados financieros en tiempo real fue inspirador. ¡Mi camino está en las finanzas!',
   'https://picsum.photos/seed/bolsa/800/600',
   DATE_SUB(NOW(), INTERVAL 42 DAY));

-- ── Conversación Juan Pérez (id=1) ↔ Taller Automotriz del Sur (id=2) ────────
INSERT INTO conversaciones (empresa_id, estudiante_id) VALUES (2, 1);
INSERT INTO mensajes (conversacion_id, remitente_id, contenido, enviado_en) VALUES
  (1, 2, 'Hola Juan, vimos tu perfil en EmpleaMe y nos interesa tu postulación para la práctica. ¿Tienes disponibilidad para conversar esta semana?',    DATE_SUB(NOW(), INTERVAL 143 HOUR)),
  (1, 1, 'Hola, muchas gracias por contactarme. Sí, tengo disponibilidad de lunes a viernes desde las 14:00 en adelante.',                              DATE_SUB(NOW(), INTERVAL 142 HOUR)),
  (1, 2, 'Perfecto. La práctica es en el área de diagnóstico electrónico, turno de 08:00 a 17:00. ¿Te acomoda ese horario?',                             DATE_SUB(NOW(), INTERVAL 141 HOUR)),
  (1, 1, 'Sí, me acomoda. Tengo experiencia con scanner OBD-II y diagnóstico de fallas eléctricas básicas. Me interesa mucho esa área.',                  DATE_SUB(NOW(), INTERVAL 140 HOUR)),
  (1, 2, 'Buenas Juan. Necesitamos que traigas carta de presentación del colegio, tu currículum y el convenio de práctica firmado. ¿Los tienes listos?',  DATE_SUB(NOW(), INTERVAL 95 HOUR)),
  (1, 1, 'Buenos días. La carta y el convenio los pido hoy en la secretaría. El CV ya lo tengo actualizado. ¿Se los puedo enviar por aquí o los llevo?', DATE_SUB(NOW(), INTERVAL 94 HOUR)),
  (1, 2, 'Tráelos en persona el día de la entrevista, así también te mostramos el taller. Tiene equipos nuevos de diagnóstico que te van a gustar.',      DATE_SUB(NOW(), INTERVAL 93 HOUR)),
  (1, 1, '¿Qué día me citarían para la entrevista?',                                                                                                     DATE_SUB(NOW(), INTERVAL 92 HOUR)),
  (1, 2, 'Quedamos para el próximo lunes a las 10:00. ¿Te parece bien?',                                                                                  DATE_SUB(NOW(), INTERVAL 47 HOUR)),
  (1, 1, 'Perfecto, estaré ahí. ¿La dirección es la misma que aparece en su perfil, en San Miguel?',                                                      DATE_SUB(NOW(), INTERVAL 46 HOUR)),
  (1, 2, 'Exacto. Preguntas por don Rodrigo en recepción, él te atenderá.',                                                                               DATE_SUB(NOW(), INTERVAL 45 HOUR)),
  (1, 1, 'Anotado, muchas gracias. Ahí estaré puntual con todos los documentos.',                                                                         DATE_SUB(NOW(), INTERVAL 44 HOUR)),
  (1, 2, 'Hola Juan, fue un gusto conocerte hoy. Quedamos muy conformes. Quedaste seleccionado para la práctica, comienzas el próximo lunes.',            DATE_SUB(NOW(), INTERVAL 22 HOUR)),
  (1, 1, '¡Muchas gracias! Estoy muy contento. El lunes estaré puntual con todo listo.',                                                                  DATE_SUB(NOW(), INTERVAL 21 HOUR)),
  (1, 2, 'Excelente actitud Juan. Bienvenido al equipo. Cualquier duda antes del lunes, escríbenos aquí.',                                                DATE_SUB(NOW(), INTERVAL 20 HOUR));
