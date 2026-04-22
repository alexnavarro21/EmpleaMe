-- ============================================================
-- EmpleaMe — Datos iniciales (seed)
-- Consolida todos los INSERT de migraciones y seeds anteriores.
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

-- ── 3. Catálogo de habilidades ────────────────────────────────

-- Técnicas — Mecánica Automotriz
INSERT INTO habilidades (nombre, categoria) VALUES
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

-- Técnicas — Administración
INSERT INTO habilidades (nombre, categoria) VALUES
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

-- Blandas / socioemocionales (compartidas)
INSERT INTO habilidades (nombre, categoria) VALUES
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

-- ── 4. Palabras prohibidas ────────────────────────────────────
INSERT IGNORE INTO palabras_prohibidas (palabra) VALUES
-- === ESPAÑOL GENERAL ===
('mierda'), ('mierd'), ('mrd'),
('puta'), ('put4'), ('perra'), ('zorra'),
('puto'), ('put0'),
('culo'), ('cul0'),
('coño'), ('con0'),
('idiota'), ('idiot4'),
('imbécil'), ('imbecil'),
('estúpido'), ('estupido'),
('gilipollas'),
('cabrón'), ('cabron'),
('hijueputa'),
('hijo de puta'), ('hp'),
('maricón'), ('maricon'), ('marica'),
('prostituta'),
-- === CHILENISMOS Y ABREVIACIONES ===
('huevón'), ('huevon'), ('weon'), ('weón'), ('wn'),
('concha'), ('conch4'),
('culiao'), ('culi4o'), ('culiado'),
('ctm'), ('conchatumadre'), ('concha de tu madre'),
('chucha'), ('chuch4'),
('aweonao'), ('aweoná'), ('aweonado'),
('saco de wea'), ('sacowea'), ('scw'), ('saco wea'),
('weá'), ('hueá'),
('maraco'), ('maracón'),
('conchetumare'), ('conchetumadre'),
('conchadesumadre'),
('qlia'), ('qliado'), ('qliao'), ('ql'),
('pichula'),
('raja'),
('mamahuevo'), ('mama huevo'),
('come mierda'), ('comemierda'),
('andate a la chucha'),
('cagón'), ('cagon'),
('cagada'),
('pechoño'), ('pechono'),
('flaite'),
('choro de mierda'),
('pico'), ('pico pal'),
('chupa'), ('chupalo'), ('chúpalo'),
('ándate a la chucha'), ('andate ala chucha'),
('la chucha de tu madre'), ('chuchatu madre'), ('chuchatumare'),
('hueón'), ('hue0n'),
-- === INSULTOS Y DISCRIMINACIÓN ===
('retrasado'), ('mongólico'), ('mongoloide'),
('subnormal'), ('inútil'),
('travesti'),
('gordo de mierda'), ('gordo inútil'),
-- === RACISMO ===
('nigger'), ('nigga'), ('n-word'),
('negro de mierda'),
('indio culiao'),
-- === AMENAZAS ===
('te voy a matar'), ('te mato'), ('voy a matarte'),
('te voy a cagar'), ('te cago'),
('te voy a romper'), ('te rompo la cara'),
-- === INGLÉS ===
('fuck'), ('f*ck'), ('fck'), ('fuk'),
('shit'), ('sh1t'),
('bitch'), ('b1tch'),
('asshole'), ('ass hole'),
('bastard'),
('cunt'),
('dick'),
('pussy'),
('faggot'), ('fag'),
('motherfucker'), ('mf');

-- ── 5. Usuarios base de prueba ────────────────────────────────
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES
  ('estudiante@empleame.cl', 'estudiante123', 'estudiante'),
  ('empresa@empleame.cl',    'empresa123',    'empresa'),
  ('colegio@empleame.cl',    'colegio123',    'colegio'),
  ('slep@empleame.cl',       'slep123',       'slep');

INSERT INTO perfiles_colegios (usuario_id, nombre_institucion, telefono_contacto, descripcion) VALUES
  (3, 'C.E. Cardenal J.M. Caro', '+56222334455', 'Centro educacional técnico profesional.');

INSERT INTO perfiles_estudiantes (usuario_id, nombre_completo, carrera_id, telefono, biografia) VALUES
  (1, 'Juan Pérez', (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
   '+56912345678', 'Estudiante de tercer año apasionado por la mecánica moderna y los vehículos eléctricos.');

INSERT INTO perfiles_empresas (usuario_id, nombre_empresa, telefono_contacto, descripcion) VALUES
  (2, 'Taller Automotriz del Sur', '+56922334455', 'Empresa dedicada al mantenimiento y reparación de vehículos livianos y pesados.');

-- ── 6. Estudiantes demo ───────────────────────────────────────
-- Contraseña de todos: Demo1234
-- Idempotente: borra registros anteriores antes de insertar.

DELETE FROM usuarios WHERE correo IN (
  'camila.torres@demo.cl',
  'matias.sepulveda@demo.cl',
  'valentina.rojas@demo.cl',
  'diego.castillo@demo.cl',
  'fernanda.munoz@demo.cl'
);

-- ── Estudiante 1: Camila Torres (Administración) ─────────────
INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('camila.torres@demo.cl', 'Demo1234', 'estudiante');
SET @u1 = LAST_INSERT_ID();

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre_completo, rut, carrera_id, semestre, promedio, calificacion_docente,
   telefono, biografia, estado_civil, region, comuna)
VALUES (@u1, 'Camila Torres Ríos', '20.111.222-3',
  (SELECT id FROM carreras WHERE nombre = 'Administracion'),
  6, 6.2, 6.5, '+56 9 1234 5001',
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

-- ── Estudiante 2: Matías Sepúlveda (Mecánica Automotriz) ─────
INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('matias.sepulveda@demo.cl', 'Demo1234', 'estudiante');
SET @u2 = LAST_INSERT_ID();

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre_completo, rut, carrera_id, semestre, promedio, calificacion_docente,
   telefono, biografia, estado_civil, region, comuna)
VALUES (@u2, 'Matías Sepúlveda Vera', '20.222.333-4',
  (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
  5, 5.8, 6.1, '+56 9 1234 5002',
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

-- ── Estudiante 3: Valentina Rojas (Administración) ───────────
INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('valentina.rojas@demo.cl', 'Demo1234', 'estudiante');
SET @u3 = LAST_INSERT_ID();

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre_completo, rut, carrera_id, semestre, promedio, calificacion_docente,
   telefono, biografia, estado_civil, region, comuna)
VALUES (@u3, 'Valentina Rojas Mena', '20.333.444-5',
  (SELECT id FROM carreras WHERE nombre = 'Administracion'),
  4, 6.5, 6.7, '+56 9 1234 5003',
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

-- ── Estudiante 4: Diego Castillo (Mecánica Automotriz) ───────
INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('diego.castillo@demo.cl', 'Demo1234', 'estudiante');
SET @u4 = LAST_INSERT_ID();

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre_completo, rut, carrera_id, semestre, promedio, calificacion_docente,
   telefono, biografia, estado_civil, region, comuna)
VALUES (@u4, 'Diego Castillo Parra', '20.444.555-6',
  (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz'),
  6, 5.5, 5.9, '+56 9 1234 5004',
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

-- ── Estudiante 5: Fernanda Muñoz (Administración) ────────────
INSERT INTO usuarios (correo, contrasena_hash, rol)
  VALUES ('fernanda.munoz@demo.cl', 'Demo1234', 'estudiante');
SET @u5 = LAST_INSERT_ID();

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre_completo, rut, carrera_id, semestre, promedio, calificacion_docente,
   telefono, biografia, estado_civil, region, comuna)
VALUES (@u5, 'Fernanda Muñoz Lagos', '20.555.666-7',
  (SELECT id FROM carreras WHERE nombre = 'Administracion'),
  5, 6.8, 6.9, '+56 9 1234 5005',
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

-- ── 7. Publicaciones con imágenes ─────────────────────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  ((SELECT id FROM usuarios WHERE correo = 'camila.torres@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Así se ve mi área de trabajo en práctica',
   'Pasar de la sala de clases a un escritorio real con expedientes físicos, carpetas y un computador con sistema de gestión fue un salto enorme. Cada carpeta tiene una historia detrás.',
   '/api/media/uploads/camila_escritorio.jpg',
   DATE_SUB(NOW(), INTERVAL 12 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'camila.torres@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Certificado impreso en mis manos',
   'Hoy recibí el certificado físico del curso de Excel Avanzado. Verlo impreso con mi nombre le da otro peso. No es solo un papel, es evidencia de horas de práctica y constancia.',
   '/api/media/uploads/camila_diploma.jpg',
   DATE_SUB(NOW(), INTERVAL 7 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Así luce el motor que diagnostiqué hoy',
   'Motor 1.6 con falla intermitente en sensor MAP. Conecté el scanner, leí los parámetros en tiempo real y di con el problema en menos de 20 minutos. La práctica ya está dando frutos.',
   '/api/media/uploads/matias_motor.jpg',
   DATE_SUB(NOW(), INTERVAL 6 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Mi kit de diagnóstico OBD-II',
   'Junté durante meses para comprar mi propio scanner OBD-II. Ya no dependo del equipo del taller para practicar. Lo conecté en tres vehículos distintos el primer fin de semana y funcionó perfecto.',
   '/api/media/uploads/matias_obd.jpg',
   DATE_SUB(NOW(), INTERVAL 20 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'valentina.rojas@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Equipo ganador — proyecto semestral',
   'Lideramos el proyecto de gestión empresarial más evaluado del semestre. Cuatro personas, tres semanas, un resultado que superó las expectativas del docente. Trabajo en equipo de verdad.',
   '/api/media/uploads/valentina_equipo.jpg',
   DATE_SUB(NOW(), INTERVAL 4 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'valentina.rojas@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Así quedó nuestro sistema de inventario en SAP',
   'Después de dos semanas configurando el módulo MM en SAP básico, finalmente el sistema de inventario simulado funciona de punta a punta. La integración entre compras y stock es lo más potente que he visto.',
   '/api/media/uploads/valentina_sap.jpg',
   DATE_SUB(NOW(), INTERVAL 22 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'diego.castillo@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Competencia regional — detrás de cámaras',
   'Antes de subir al podio hubo horas de preparación, cronómetros, fallas simuladas y mucha adrenalina. Esta foto es del momento justo antes de la prueba final. Tercer lugar fue justo.',
   '/api/media/uploads/diego_taller.jpg',
   DATE_SUB(NOW(), INTERVAL 14 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'diego.castillo@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Primera soldadura MIG que no quedó mal',
   'Tres intentos fallidos antes de este resultado. La soldadura MIG requiere una combinación de velocidad, ángulo y calor que solo se aprende equivocándose. Por fin el cordón quedó limpio y continuo.',
   '/api/media/uploads/diego_soldadura.jpg',
   DATE_SUB(NOW(), INTERVAL 48 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'fernanda.munoz@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Cierre de mes en Constructora Andina',
   'Primer cierre contable real de mi vida. Conciliación bancaria, cuadre de facturas y reporte para el contador senior. Cuatro horas de trabajo concentrado. Sin errores al primer intento.',
   '/api/media/uploads/fernanda_contabilidad.jpg',
   DATE_SUB(NOW(), INTERVAL 38 DAY)),
  ((SELECT id FROM usuarios WHERE correo = 'fernanda.munoz@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Mi escritorio el día de la distinción académica',
   'Esta foto la tomé antes de ir a la ceremonia. El diploma todavía no llegaba pero ya sabía el resultado. Promedio 6.8, distinción académica y la certeza de que el esfuerzo tiene sentido.',
   '/api/media/uploads/fernanda_escritorio.jpg',
   DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ── 8. Publicaciones recientes (últimas 24 horas) ─────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en) VALUES
  ((SELECT id FROM usuarios WHERE correo = 'camila.torres@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Primer día buscando práctica profesional',
   'Hoy empecé a revisar ofertas de práctica en serio. Tenía el perfil a medias, lo completé todo: historial, habilidades, presentación. Sorprende cuánto cambia la perspectiva cuando te ves desde afuera como candidata. Nerviosa pero lista.',
   DATE_SUB(NOW(), INTERVAL 22 MINUTE)),
  ((SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Escaneé mi primer vehículo con falla real',
   'Hoy en el taller escolar llegó un Hyundai con luz de check engine encendida. Me dejaron hacer el diagnóstico completo con el escáner OBD-II. Código P0301: falla de encendido en cilindro 1. Lo identificamos, propusimos la solución, el profe validó. Primera vez que siento que sé lo que hago.',
   DATE_SUB(NOW(), INTERVAL 1 HOUR)),
  ((SELECT id FROM usuarios WHERE correo = 'valentina.rojas@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Terminé mi módulo de contabilidad de costos',
   'Módulo terminado con nota 6.7. Costeo por absorción, costeo variable, punto de equilibrio y análisis de márgenes. Lo más difícil fue entender cuándo usar cada método según el contexto del negocio. Ahora lo entiendo. A por el siguiente.',
   DATE_SUB(NOW(), INTERVAL 2 HOUR)),
  ((SELECT id FROM usuarios WHERE correo = 'diego.castillo@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Motor desmontado y vuelto a armar — lo logramos',
   'Práctica de taller: desmontaje y montaje completo de motor a gasolina 1.6L. Cuatro compañeros, cuatro horas, cero piezas sobrando al final. El profe revisó la compresión después del montaje y quedó en especificación. Una de las mejores sensaciones que he tenido en el colegio.',
   DATE_SUB(NOW(), INTERVAL 3 HOUR)),
  ((SELECT id FROM usuarios WHERE correo = 'fernanda.munoz@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Hoy aprendí a hacer una conciliación bancaria de verdad',
   'En la práctica me pasaron un extracto bancario con 47 movimientos y el libro mayor para cruzar. Tarde dos horas. Encontré tres diferencias, dos eran errores de registro y una era un cargo bancario no contabilizado. Pequeño logro, gran aprendizaje.',
   DATE_SUB(NOW(), INTERVAL 5 HOUR)),
  ((SELECT id FROM usuarios WHERE correo = 'camila.torres@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
   'Conseguí mi primera entrevista de práctica',
   'Me llamaron de una empresa de servicios para una entrevista la próxima semana. Es la primera vez que mi CV llega tan lejos. Preparé respuestas, revisé la empresa, tengo todo listo. Sea cual sea el resultado, ya es un avance enorme.',
   DATE_SUB(NOW(), INTERVAL 8 HOUR)),
  ((SELECT id FROM usuarios WHERE correo = 'valentina.rojas@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Presentamos proyecto final de ERP en clases',
   'Hoy expusimos el proyecto de gestión con SAP básico frente a toda la generación. Nuestro equipo modeló el ciclo completo de una empresa distribuidora: compras, ventas, inventario y finanzas. El profe dijo que fue la presentación más completa del año. Orgullosa del equipo.',
   DATE_SUB(NOW(), INTERVAL 12 HOUR)),
  ((SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Por qué elegí Mecánica Automotriz y no me arrepiento',
   'Mucha gente me pregunta por qué elegí mecánica. La respuesta es simple: me gusta resolver problemas que tienen una causa real y una solución concreta. Un vehículo falla, tú lo diagnosticas, lo reparas, arranca. No hay ambigüedad. Cada día que entro al taller confirmo que tomé la decisión correcta.',
   DATE_SUB(NOW(), INTERVAL 18 HOUR));

-- ── 9. Publicaciones recientes con imagen (últimos 15 min) ────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  ((SELECT id FROM usuarios WHERE correo = 'camila.torres@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Reunión de equipo antes de la evaluación',
   'Hoy nos juntamos antes de la evaluación modular para repasar juntos. Tener un equipo comprometido hace toda la diferencia. Nerviosa pero lista.',
   '/api/media/uploads/camila_reunion.jpg',
   DATE_SUB(NOW(), INTERVAL 2 MINUTE)),
  ((SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'El taller a las 7 AM — así arrancamos',
   'Primera hora en el taller y ya hay tres autos en fila. Me gusta llegar temprano, da tiempo para revisar las órdenes de trabajo con calma antes de que todo se acelere.',
   '/api/media/uploads/matias_taller2.jpg',
   DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
  ((SELECT id FROM usuarios WHERE correo = 'valentina.rojas@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Presentación bajo presión: lo que aprendí',
   'Exponer frente a 30 personas con 10 minutos de preparación no estaba en el plan. Lo hice igual. Cuando no tienes tiempo de pensar demasiado, sale lo que realmente sabes.',
   '/api/media/uploads/valentina_presion.jpg',
   DATE_SUB(NOW(), INTERVAL 8 MINUTE)),
  ((SELECT id FROM usuarios WHERE correo = 'diego.castillo@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Desarmando el motor de un auto eléctrico',
   'Hoy el profe trajo un motor eléctrico para que lo analizáramos. Nunca lo había visto por dentro. La cantidad de componentes que reemplazan todo el sistema de transmisión tradicional es impresionante.',
   '/api/media/uploads/diego_motor2.jpg',
   DATE_SUB(NOW(), INTERVAL 11 MINUTE)),
  ((SELECT id FROM usuarios WHERE correo = 'fernanda.munoz@demo.cl'),
   (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
   'Revisando los números del cierre con el equipo',
   'Última reunión antes de entregar el informe de cierre. Todos alineados, todo cuadrado. Cuando el trabajo previo está bien hecho, el cierre no da miedo.',
   '/api/media/uploads/fernanda_reunion.jpg',
   DATE_SUB(NOW(), INTERVAL 14 MINUTE));
