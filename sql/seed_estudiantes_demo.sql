USE railway;

-- ============================================================
-- SEED: 5 estudiantes demo — perfiles 100% completos
-- Sin IDs hardcodeados; usa LAST_INSERT_ID() y variables.
-- Contraseña de todos: Demo1234
-- Idempotente: borra registros anteriores antes de insertar.
-- ============================================================

DELETE FROM usuarios WHERE correo IN (
  'camila.torres@demo.cl',
  'matias.sepulveda@demo.cl',
  'valentina.rojas@demo.cl',
  'diego.castillo@demo.cl',
  'fernanda.munoz@demo.cl'
);

-- ── Estudiante 1: Camila Torres ──────────────────────────────
INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('camila.torres@demo.cl', 'Demo1234', 'estudiante');
SET @u1 = LAST_INSERT_ID();

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre_completo, rut, carrera, semestre, promedio, calificacion_docente, telefono, biografia, estado_civil, region, comuna)
VALUES (@u1, 'Camila Torres Ríos', '20.111.222-3', 'Administracion', 6, 6.2, 6.5,
  '+56 9 1234 5001',
  'Estudiante de Administración con enfoque en gestión documental y contabilidad. Proactiva, organizada y con experiencia en atención al cliente durante prácticas voluntarias.',
  'soltero', 'Región Metropolitana de Santiago', 'Santiago');

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

-- ── Estudiante 2: Matías Sepúlveda ───────────────────────────
INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('matias.sepulveda@demo.cl', 'Demo1234', 'estudiante');
SET @u2 = LAST_INSERT_ID();

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre_completo, rut, carrera, semestre, promedio, calificacion_docente, telefono, biografia, estado_civil, region, comuna)
VALUES (@u2, 'Matías Sepúlveda Vera', '20.222.333-4', 'Mecanica Automotriz', 5, 5.8, 6.1,
  '+56 9 1234 5002',
  'Apasionado por la mecánica moderna y los sistemas eléctricos vehiculares. Experiencia en diagnóstico OBD-II y mantenimiento preventivo en taller escolar.',
  'soltero', 'Región de Valparaíso', 'Viña del Mar');

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

-- ── Estudiante 3: Valentina Rojas ────────────────────────────
INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('valentina.rojas@demo.cl', 'Demo1234', 'estudiante');
SET @u3 = LAST_INSERT_ID();

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre_completo, rut, carrera, semestre, promedio, calificacion_docente, telefono, biografia, estado_civil, region, comuna)
VALUES (@u3, 'Valentina Rojas Mena', '20.333.444-5', 'Administracion', 4, 6.5, 6.7,
  '+56 9 1234 5003',
  'Estudiante con sólido manejo de herramientas contables y ERP. Orientada al detalle y con habilidades de liderazgo demostradas en proyectos de aula.',
  'soltero', 'Región del Biobío', 'Concepción');

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

-- ── Estudiante 4: Diego Castillo ─────────────────────────────
INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('diego.castillo@demo.cl', 'Demo1234', 'estudiante');
SET @u4 = LAST_INSERT_ID();

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre_completo, rut, carrera, semestre, promedio, calificacion_docente, telefono, biografia, estado_civil, region, comuna)
VALUES (@u4, 'Diego Castillo Parra', '20.444.555-6', 'Mecanica Automotriz', 6, 5.5, 5.9,
  '+56 9 1234 5004',
  'Técnico en formación con especialización en sistemas de frenos y suspensión. Participó en competencia regional de diagnóstico automotriz 2023.',
  'soltero', 'Región de La Araucanía', 'Temuco');

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

-- ── Estudiante 5: Fernanda Muñoz ─────────────────────────────
INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('fernanda.munoz@demo.cl', 'Demo1234', 'estudiante');
SET @u5 = LAST_INSERT_ID();

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre_completo, rut, carrera, semestre, promedio, calificacion_docente, telefono, biografia, estado_civil, region, comuna)
VALUES (@u5, 'Fernanda Muñoz Lagos', '20.555.666-7', 'Administracion', 5, 6.8, 6.9,
  '+56 9 1234 5005',
  'Top de su generación en Administración. Maneja software contable Conta+, Excel avanzado y tiene certificación SII en facturación electrónica.',
  'soltero', 'Región de Los Lagos', 'Puerto Montt');

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
