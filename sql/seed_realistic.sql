-- =============================================================================
-- SEED: Datos realistas para EmpleaMe
-- Contraseña de todos los usuarios seed: Empleame2024
-- 4 empresas + 10 estudiantes con perfiles completos
-- =============================================================================
USE railway;
-- Hash bcrypt para "Empleame2024" (rounds=10)
SET @pwd = '$2b$10$xCOV/ILX/MhBMbGTzOXUCeSfN79BUFeNyWzAlHopcx16/1w7fjBJ2';

-- -----------------------------------------------------------------------------
-- EMPRESAS (4)
-- -----------------------------------------------------------------------------
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES
  ('contacto@tallerperezhijos.cl',   @pwd, 'empresa'),
  ('rrhh@nordiklogistica.cl',        @pwd, 'empresa'),
  ('practicas@autoservicionorte.cl', @pwd, 'empresa'),
  ('administracion@cgestion.cl',     @pwd, 'empresa');

SET @e1 = LAST_INSERT_ID();
SET @e2 = @e1 + 1;
SET @e3 = @e1 + 2;
SET @e4 = @e1 + 3;

INSERT INTO perfiles_empresas (usuario_id, nombre_empresa, telefono_contacto, descripcion) VALUES
  (@e1, 'Taller Automotriz Pérez e Hijos',
        '+56 9 7823 4401',
        'Taller mecánico con más de 20 años de experiencia en reparación y mantenimiento de vehículos livianos y camionetas. Contamos con diagnóstico computarizado, equipos de última generación y técnicos certificados. Ubicados en Maipú, Santiago.'),
  (@e2, 'Nordik Logística SpA',
        '+56 2 2934 7700',
        'Empresa de logística y distribución con presencia en la Región Metropolitana y V Región. Gestionamos más de 500 despachos diarios y operamos una flota propia de 40 vehículos. Buscamos incorporar jóvenes talentosos a nuestra área administrativa y de operaciones.'),
  (@e3, 'AutoServicio Norte Ltda.',
        '+56 9 6512 3380',
        'Centro de mantención y revisión técnica en Quilicura. Especialistas en sistemas de frenos, suspensión y electricidad automotriz. Empresa familiar con ambiente de trabajo colaborativo y oportunidades de aprendizaje práctico.'),
  (@e4, 'Contabilidad & Gestión Limitada',
        '+56 2 2201 5588',
        'Estudio contable y asesoría tributaria que apoya a más de 150 Pymes en su gestión financiera. Ofrecemos servicios de contabilidad, remuneraciones, declaración de impuestos y consultoría empresarial. Ubicados en Providencia.');

-- -----------------------------------------------------------------------------
-- ESTUDIANTES (10)
-- -----------------------------------------------------------------------------
INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES
  ('sebastian.morales@alumnos.cft.cl',  @pwd, 'estudiante'),
  ('valentina.torres@alumnos.cft.cl',   @pwd, 'estudiante'),
  ('nicolas.fuentes@alumnos.cft.cl',    @pwd, 'estudiante'),
  ('camila.vargas@alumnos.cft.cl',      @pwd, 'estudiante'),
  ('felipe.contreras@alumnos.cft.cl',   @pwd, 'estudiante'),
  ('daniela.espinoza@alumnos.cft.cl',   @pwd, 'estudiante'),
  ('rodrigo.nunez@alumnos.cft.cl',      @pwd, 'estudiante'),
  ('javiera.saavedra@alumnos.cft.cl',   @pwd, 'estudiante'),
  ('matias.gonzalez@alumnos.cft.cl',    @pwd, 'estudiante'),
  ('isabella.reyes@alumnos.cft.cl',     @pwd, 'estudiante');

SET @s1  = LAST_INSERT_ID();   -- Sebastián  (Mecánica)
SET @s2  = @s1 + 1;            -- Valentina  (Mecánica)
SET @s3  = @s1 + 2;            -- Nicolás    (Mecánica)
SET @s4  = @s1 + 3;            -- Camila     (Mecánica)
SET @s5  = @s1 + 4;            -- Felipe     (Mecánica)
SET @s6  = @s1 + 5;            -- Daniela    (Administración)
SET @s7  = @s1 + 6;            -- Rodrigo    (Administración)
SET @s8  = @s1 + 7;            -- Javiera    (Administración)
SET @s9  = @s1 + 8;            -- Matías     (Administración)
SET @s10 = @s1 + 9;            -- Isabella   (Administración)

INSERT INTO perfiles_estudiantes
  (usuario_id, nombre_completo, carrera, telefono, biografia, semestre, promedio, calificacion_docente)
VALUES
  (@s1,  'Sebastián Morales Araya',
         'Mecanica Automotriz', '+56 9 8821 4432',
         'Apasionado por los motores desde los 15 años. He trabajado en el taller de mi padre los fines de semana y tengo experiencia práctica en mantenimiento preventivo y diagnóstico básico. Busco una práctica donde pueda seguir aprendiendo y aportar mis conocimientos.',
         5, 5.8, 6.2),
  (@s2,  'Valentina Torres Soto',
         'Mecanica Automotriz', '+56 9 9134 7701',
         'Primera mujer de mi generación en matricularse en Mecánica Automotriz. Me especializo en sistemas eléctricos y electrónicos vehiculares. Tengo certificación en uso de equipos OBD-II y me interesa el área de diagnóstico computarizado.',
         6, 6.1, 5.9),
  (@s3,  'Nicolás Fuentes López',
         'Mecanica Automotriz', '+56 9 7723 0015',
         'Estudiante en último semestre con buen manejo de herramientas y equipos. Me destaco en soldadura automotriz y reparación de carrocería liviana. Disponibilidad inmediata para práctica, con posibilidad de jornada completa.',
         6, 5.4, NULL),
  (@s4,  'Camila Vargas Rojas',
         'Mecanica Automotriz', '+56 9 6641 2293',
         'Me especializo en sistemas de frenos y suspensión. Participé en el campeonato regional de diagnóstico automotriz representando a mi CFT y obtuve el segundo lugar. Tengo excelente disposición para el trabajo en equipo y el aprendizaje continuo.',
         5, 5.9, 6.0),
  (@s5,  'Felipe Contreras Muñoz',
         'Mecanica Automotriz', '+56 9 5503 8847',
         'Técnico en formación con experiencia en sistemas de climatización y mantención de motores a gasolina y diesel. He realizado ayudantías en el taller del CFT y cuento con buenas referencias de mis docentes.',
         4, 5.2, 5.5),
  (@s6,  'Daniela Espinoza Castro',
         'Administracion', '+56 9 8812 6630',
         'Egresada de administración con fuerte orientación a la contabilidad y gestión tributaria. Manejo Conta+ y tengo experiencia en elaboración de declaraciones F29. Busco una práctica en empresa del rubro financiero o contable.',
         6, 6.5, 6.7),
  (@s7,  'Rodrigo Núñez Herrera',
         'Administracion', '+56 9 7701 3394',
         'Tengo experiencia previa como auxiliar administrativo en empresa familiar. Manejo Office avanzado, especialmente Excel para análisis de datos y elaboración de informes. Me interesa el área de recursos humanos y gestión de personal.',
         5, 5.6, 5.8),
  (@s8,  'Javiera Saavedra Ojeda',
         'Administracion', '+56 9 9023 1187',
         'Organizada y detallista, con habilidades en gestión documental y atención al cliente. He participado en proyectos de digitalización de archivos en el CFT y domino el sistema SII para facturación electrónica. Disponible de lunes a viernes.',
         5, 5.7, NULL),
  (@s9,  'Matías González Vera',
         'Administracion', '+56 9 6634 9920',
         'Estudiante con interés en logística y control de inventario. He desarrollado proyectos de gestión de stock usando Excel y nociones de SAP Business One. Buenas habilidades comunicacionales y experiencia trabajando con equipos multidisciplinarios.',
         4, 5.3, 5.4),
  (@s10, 'Isabella Reyes Pizarro',
         'Administracion', '+56 9 8890 4413',
         'Me destaco en la elaboración de presupuestos y análisis financiero básico. Completé un curso externo de Gestión de Recursos Humanos y tengo certificación en manejo de nóminas. Busco empresa donde pueda crecer profesionalmente.',
         6, 6.3, 6.5);

-- -----------------------------------------------------------------------------
-- VACANTES (7 total: 2+2+1+2 por empresa)
-- Guardamos @v1 INMEDIATAMENTE tras este INSERT
-- -----------------------------------------------------------------------------
INSERT INTO vacantes
  (empresa_id, tipo, titulo, descripcion, requisitos, esta_activa,
   area, modalidad, duracion, horario, remuneracion, direccion, beneficios, fecha_limite)
VALUES
  -- Taller Pérez e Hijos
  (@e1, 'practica',
   'Práctica en Diagnóstico Automotriz',
   'Buscamos estudiante en práctica para apoyar a nuestros técnicos en diagnóstico electrónico de vehículos. Utilizarás escáneres OBD-II de última generación y aprenderás el flujo completo de recepción y entrega de vehículos.',
   'Cursando último año de Mecánica Automotriz. Conocimientos básicos de OBD-II. Proactivo y con ganas de aprender.',
   1, 'Mecánica Automotriz', 'presencial', '3 meses',
   'Lunes a viernes 08:30-17:30, sábado 09:00-13:00',
   '$250.000 mensual + colación',
   'Maipú, Santiago (Av. Américo Vespucio 1234)',
   'Colación incluida, uniforme proporcionado, posibilidad de contratación al finalizar práctica',
   '2026-06-30'),
  (@e1, 'puesto_laboral',
   'Técnico Automotriz Junior',
   'Contratación directa para técnico recién titulado o egresado. Trabajarás junto a técnicos senior en mantención general, cambios de aceite, revisión de frenos y suspensión.',
   'Título o egreso en Mecánica Automotriz. Experiencia mínima de 6 meses en taller (incluye práctica profesional). Licencia clase B deseable.',
   1, 'Mecánica Automotriz', 'presencial', 'Indefinido',
   'Lunes a viernes 08:00-18:00',
   '$550.000-$700.000 líquido según experiencia',
   'Maipú, Santiago',
   'Seguro complementario, herramientas proporcionadas, bonos por metas mensuales',
   '2026-05-31'),
  -- Nordik Logística
  (@e2, 'practica',
   'Práctica Administrativa - Área de Operaciones',
   'Apoyarás al equipo de operaciones en el control de guías de despacho, coordinación con conductores y actualización de planillas de seguimiento de flota. Ambiente dinámico con exposición real al mundo logístico.',
   'Estudiante de Administración, semestre 4 en adelante. Manejo de Excel nivel intermedio. Orden y responsabilidad.',
   1, 'Logística y Operaciones', 'presencial', '4 meses',
   'Lunes a viernes 08:00-17:00',
   '$280.000 mensual',
   'Quilicura, Santiago (Av. El Salto 5560)',
   'Colación en casino de empresa, transporte desde metro Quilicura',
   '2026-07-15'),
  (@e2, 'practica',
   'Práctica en Recursos Humanos',
   'Colaborarás en los procesos de selección, onboarding y gestión de documentación de personal. Participarás en la digitalización del área y en la preparación de informes de dotación.',
   'Estudiante de Administración con interés en RRHH. Manejo de Office. Discreción y manejo de información confidencial.',
   1, 'Recursos Humanos', 'hibrido', '3 meses',
   'Lunes a viernes 09:00-18:00',
   '$260.000 mensual',
   'Providencia, Santiago (Av. Providencia 1650)',
   'Modalidad híbrida (2 días remoto), colación los días presenciales',
   '2026-06-30'),
  -- AutoServicio Norte
  (@e3, 'practica',
   'Práctica Mecánica - Frenos y Suspensión',
   'Práctica profesional en taller especializado en sistemas de frenos y suspensión. Trabajarás directamente con técnicos senior y tendrás responsabilidades reales desde la primera semana.',
   'Estudiante de Mecánica Automotriz último año. Conocimientos en sistemas de frenos ABS y convencionales. Disponibilidad para trabajar en taller.',
   1, 'Mecánica Automotriz', 'presencial', '3 meses',
   'Lunes a viernes 08:00-17:30',
   '$230.000 mensual + bono asistencia',
   'Quilicura, Santiago (Av. Independencia 8200)',
   'Uniforme y EPP proporcionados, certificado de práctica con evaluación detallada',
   '2026-07-31'),
  -- Contabilidad & Gestión
  (@e4, 'practica',
   'Práctica en Contabilidad y Tributaria',
   'Apoyarás a nuestros contadores en la preparación de declaraciones mensuales, registro de asientos contables y conciliaciones bancarias. Excelente instancia para aplicar lo aprendido en un entorno profesional real.',
   'Estudiante de Administración con conocimiento de contabilidad general y manejo del SII. Uso de Conta+ o similar es un plus.',
   1, 'Contabilidad', 'presencial', '3 meses',
   'Lunes a jueves 09:00-18:00, viernes 09:00-14:00',
   '$270.000 mensual',
   'Providencia, Santiago (Av. Andrés Bello 2299)',
   'Horario reducido los viernes, capacitación en software tributario, carta de recomendación al egreso',
   '2026-05-30'),
  (@e4, 'puesto_laboral',
   'Asistente Contable',
   'Buscamos profesional recién titulado para incorporarse a nuestro equipo contable. Responsable de registro de facturas, conciliaciones, declaraciones F29 y apoyo en auditorías internas.',
   'Título en Administración o carrera afín. Conocimiento de Conta+, Excel avanzado y SII. Orientación al detalle y trabajo bajo presión.',
   1, 'Contabilidad', 'presencial', 'Contrato plazo fijo 6 meses + posibilidad de indefinido',
   'Lunes a viernes 09:00-18:00',
   '$600.000-$750.000 bruto',
   'Providencia, Santiago',
   'Seguro de salud complementario, capacitaciones, buen ambiente laboral',
   '2026-05-15');

-- Guardar IDs de vacantes INMEDIATAMENTE (LAST_INSERT_ID = primera vacante del batch)
SET @v1 = LAST_INSERT_ID();  -- Taller Pérez: práctica diagnóstico
SET @v2 = @v1 + 1;           -- Taller Pérez: técnico junior
SET @v3 = @v1 + 2;           -- Nordik: operaciones
SET @v4 = @v1 + 3;           -- Nordik: RRHH
SET @v5 = @v1 + 4;           -- AutoServicio: frenos
SET @v6 = @v1 + 5;           -- C&G: práctica contable
SET @v7 = @v1 + 6;           -- C&G: asistente contable

-- -----------------------------------------------------------------------------
-- HABILIDADES DE ESTUDIANTES (técnicas)
-- IDs automotriz: 5-16  |  administración: 17-28  |  blandas: 29-40
-- -----------------------------------------------------------------------------

-- Sebastián Morales (Mecánica) — diagnóstico y motor
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio) VALUES
  (@s1, 5,  'Intermedio'),
  (@s1, 6,  'Intermedio'),
  (@s1, 7,  'Basico'),
  (@s1, 12, 'Avanzado'),
  (@s1, 16, 'Intermedio');

-- Valentina Torres (Mecánica) — eléctrica y escáner
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio) VALUES
  (@s2, 5,  'Avanzado'),
  (@s2, 10, 'Avanzado'),
  (@s2, 15, 'Intermedio'),
  (@s2, 16, 'Avanzado'),
  (@s2, 12, 'Intermedio');

-- Nicolás Fuentes (Mecánica) — soldadura y motores
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio) VALUES
  (@s3, 6,  'Intermedio'),
  (@s3, 7,  'Intermedio'),
  (@s3, 13, 'Avanzado'),
  (@s3, 9,  'Intermedio'),
  (@s3, 8,  'Intermedio');

-- Camila Vargas (Mecánica) — frenos y suspensión
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio) VALUES
  (@s4, 8,  'Avanzado'),
  (@s4, 9,  'Avanzado'),
  (@s4, 5,  'Intermedio'),
  (@s4, 12, 'Intermedio'),
  (@s4, 16, 'Intermedio');

-- Felipe Contreras (Mecánica) — climatización y mantención
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio) VALUES
  (@s5, 14, 'Avanzado'),
  (@s5, 6,  'Intermedio'),
  (@s5, 7,  'Basico'),
  (@s5, 12, 'Avanzado'),
  (@s5, 11, 'Avanzado');

-- Daniela Espinoza (Admin) — contabilidad y SII
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio) VALUES
  (@s6, 17, 'Avanzado'),
  (@s6, 18, 'Avanzado'),
  (@s6, 19, 'Avanzado'),
  (@s6, 22, 'Avanzado'),
  (@s6, 28, 'Intermedio');

-- Rodrigo Núñez (Admin) — RRHH y Excel
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio) VALUES
  (@s7, 19, 'Avanzado'),
  (@s7, 24, 'Intermedio'),
  (@s7, 23, 'Intermedio'),
  (@s7, 20, 'Intermedio'),
  (@s7, 21, 'Avanzado');

-- Javiera Saavedra (Admin) — documental y SII
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio) VALUES
  (@s8, 20, 'Avanzado'),
  (@s8, 22, 'Avanzado'),
  (@s8, 21, 'Avanzado'),
  (@s8, 23, 'Intermedio'),
  (@s8, 17, 'Basico');

-- Matías González (Admin) — logística e inventario
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio) VALUES
  (@s9, 26, 'Avanzado'),
  (@s9, 19, 'Avanzado'),
  (@s9, 25, 'Basico'),
  (@s9, 20, 'Intermedio'),
  (@s9, 28, 'Intermedio');

-- Isabella Reyes (Admin) — finanzas y RRHH
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio) VALUES
  (@s10, 28, 'Avanzado'),
  (@s10, 17, 'Avanzado'),
  (@s10, 24, 'Avanzado'),
  (@s10, 27, 'Intermedio'),
  (@s10, 22, 'Intermedio');

-- Habilidades blandas con porcentaje (desde tests socioemocionales)
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, porcentaje) VALUES
  (@s1, 29, 82), (@s1, 31, 90), (@s1, 32, 75), (@s1, 34, 88), (@s1, 35, 70),
  (@s2, 29, 91), (@s2, 30, 88), (@s2, 31, 95), (@s2, 34, 92), (@s2, 40, 85),
  (@s3, 29, 78), (@s3, 31, 80), (@s3, 33, 72), (@s3, 36, 65), (@s3, 39, 70),
  (@s4, 29, 93), (@s4, 30, 89), (@s4, 32, 87), (@s4, 35, 91), (@s4, 38, 76),
  (@s5, 31, 85), (@s5, 33, 80), (@s5, 34, 74), (@s5, 36, 68), (@s5, 39, 82),
  (@s6, 30, 94), (@s6, 31, 96), (@s6, 34, 97), (@s6, 39, 93), (@s6, 40, 90),
  (@s7, 29, 88), (@s7, 30, 85), (@s7, 35, 82), (@s7, 37, 79), (@s7, 38, 71),
  (@s8, 30, 90), (@s8, 31, 92), (@s8, 34, 91), (@s8, 37, 86), (@s8, 39, 88),
  (@s9, 29, 83), (@s9, 32, 80), (@s9, 33, 77), (@s9, 36, 72), (@s9, 40, 84),
  (@s10, 30, 95), (@s10, 31, 94), (@s10, 35, 90), (@s10, 38, 83), (@s10, 40, 92);

-- -----------------------------------------------------------------------------
-- POSTULACIONES
-- -----------------------------------------------------------------------------
INSERT INTO postulaciones (vacante_id, estudiante_id, estado) VALUES
  -- Taller Pérez (práctica diagnóstico)
  (@v1, @s1, 'en_revision'),
  (@v1, @s4, 'pendiente'),
  -- Taller Pérez (técnico junior)
  (@v2, @s1, 'pendiente'),
  -- AutoServicio Norte (frenos)
  (@v5, @s2, 'aceptado'),
  (@v5, @s3, 'en_revision'),
  -- Contabilidad & Gestión (práctica)
  (@v6, @s6, 'en_revision'),
  -- Contabilidad & Gestión (asistente)
  (@v7, @s10, 'pendiente'),
  (@v7, @s6, 'aceptado'),
  -- Nordik Logística (operaciones)
  (@v3, @s9, 'pendiente'),
  -- Nordik Logística (RRHH)
  (@v4, @s7, 'en_revision'),
  (@v4, @s8, 'pendiente');
