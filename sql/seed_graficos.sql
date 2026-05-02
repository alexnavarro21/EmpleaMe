-- ============================================================
-- EmpleaMe — Seed completo para gráficos del panel de colegio
-- Colegio objetivo: colegio@empleame.cl (id=3)
-- Marcador: correos terminan en @seed-graficos.cl
--
-- REVERTIR (ejecutar en orden):
--   DELETE FROM postulaciones
--     WHERE estudiante_id IN (
--       SELECT id FROM usuarios WHERE correo LIKE '%@seed-graficos.cl'
--     );
--   DELETE FROM vacantes
--     WHERE empresa_id IN (
--       SELECT id FROM usuarios WHERE correo LIKE '%@seed-graficos.cl'
--     );
--   DELETE FROM perfiles_estudiantes
--     WHERE usuario_id IN (
--       SELECT id FROM usuarios WHERE correo LIKE '%@seed-graficos.cl'
--     );
--   DELETE FROM perfiles_empresas
--     WHERE usuario_id IN (
--       SELECT id FROM usuarios WHERE correo LIKE '%@seed-graficos.cl'
--     );
--   DELETE FROM usuarios WHERE correo LIKE '%@seed-graficos.cl';
-- ============================================================

-- ── 0. IDs de referencia ──────────────────────────────────────
SET @colegio_id  = (SELECT id FROM usuarios WHERE correo = 'colegio@empleame.cl' LIMIT 1);
SET @carrera_mec = (SELECT id FROM carreras WHERE nombre = 'Mecanica Automotriz' LIMIT 1);
SET @carrera_adm = (SELECT id FROM carreras WHERE nombre = 'Administracion'      LIMIT 1);

-- ── 1. Limpieza idempotente ───────────────────────────────────
DELETE FROM postulaciones
  WHERE estudiante_id IN (SELECT id FROM usuarios WHERE correo LIKE '%@seed-graficos.cl');

DELETE FROM vacantes
  WHERE empresa_id IN (SELECT id FROM usuarios WHERE correo LIKE '%@seed-graficos.cl');

DELETE FROM perfiles_estudiantes
  WHERE usuario_id IN (SELECT id FROM usuarios WHERE correo LIKE '%@seed-graficos.cl');

DELETE FROM perfiles_empresas
  WHERE usuario_id IN (SELECT id FROM usuarios WHERE correo LIKE '%@seed-graficos.cl');

DELETE FROM usuarios WHERE correo LIKE '%@seed-graficos.cl';

-- ================================================================
-- 2. EMPRESAS
-- ================================================================

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

-- ================================================================
-- 3. VACANTES ACTIVAS (distintas áreas y tipos)
-- ================================================================

INSERT INTO vacantes (empresa_id, titulo, descripcion, requisitos, esta_activa, tipo, area, modalidad, duracion, remuneracion, fecha_limite) VALUES
  -- AutoParts Chile — Automotriz + Mantenimiento
  (@e1, 'Practicante Mecánica Automotriz',      'Apoyo en diagnóstico y mantención de vehículos.',         'Estudiante mecánica 3°-4° medio.',    TRUE, 'practica',       'Automotriz',          'presencial', '6 meses',   '$250.000', DATE_ADD(CURDATE(), INTERVAL 60 DAY)),
  (@e1, 'Técnico Automotriz Junior',            'Reparación de vehículos livianos y pesados.',             'Egresado o estudiante avanzado.',     TRUE, 'puesto_laboral', 'Automotriz',          'presencial', 'Indefinido','$550.000', DATE_ADD(CURDATE(), INTERVAL 90 DAY)),
  (@e1, 'Practicante Mantenimiento Industrial', 'Mantención de equipos y maquinaria del taller.',          'Estudiante mecánica o similar.',      TRUE, 'practica',       'Mantenimiento',       'presencial', '3 meses',   '$200.000', DATE_ADD(CURDATE(), INTERVAL 45 DAY)),
  (@e1, 'Operario Mantenimiento',               'Mantención preventiva de planta y equipos.',              'Experiencia básica en herramientas.', TRUE, 'puesto_laboral', 'Mantenimiento',       'presencial', 'Indefinido','$480.000', DATE_ADD(CURDATE(), INTERVAL 75 DAY)),
  -- LogistiCargo — Logística + Operaciones
  (@e2, 'Practicante Logística y Bodega',       'Control de stock, recepción y despacho.',                 'Estudiante 3°-4° medio.',             TRUE, 'practica',       'Logística',           'presencial', '6 meses',   '$220.000', DATE_ADD(CURDATE(), INTERVAL 60 DAY)),
  (@e2, 'Operador de Bodega',                   'Gestión de inventario y picking automatizado.',           'Experiencia en bodega deseable.',     TRUE, 'puesto_laboral', 'Logística',           'presencial', 'Indefinido','$500.000', DATE_ADD(CURDATE(), INTERVAL 80 DAY)),
  (@e2, 'Practicante Operaciones',              'Apoyo en planificación de rutas y control de flota.',    'Estudiante administración o logística.',TRUE,'practica',       'Operaciones',         'presencial', '4 meses',   '$210.000', DATE_ADD(CURDATE(), INTERVAL 50 DAY)),
  (@e2, 'Coordinador Operacional Junior',       'Seguimiento de pedidos y coordinación de despachos.',    'Manejo básico de Excel.',             TRUE, 'puesto_laboral', 'Operaciones',         'hibrido',    'Indefinido','$520.000', DATE_ADD(CURDATE(), INTERVAL 70 DAY)),
  -- Gestión 360 — Administración + Contabilidad
  (@e3, 'Practicante Administración',           'Gestión documental, facturación y atención clientes.',   'Estudiante administración.',          TRUE, 'practica',       'Administración',      'hibrido',    '6 meses',   '$230.000', DATE_ADD(CURDATE(), INTERVAL 55 DAY)),
  (@e3, 'Asistente Administrativo',             'Control de agenda, archivo y soporte a gerencia.',       'Experiencia en administración.',      TRUE, 'puesto_laboral', 'Administración',      'presencial', 'Indefinido','$560.000', DATE_ADD(CURDATE(), INTERVAL 65 DAY)),
  (@e3, 'Practicante Contabilidad',             'Registro de operaciones contables y conciliaciones.',    'Estudiante administración/contabilidad.',TRUE,'practica',      'Contabilidad',        'presencial', '5 meses',   '$240.000', DATE_ADD(CURDATE(), INTERVAL 50 DAY)),
  (@e3, 'Analista Contable Junior',             'Preparación de estados financieros y tributarios.',      'Manejo de software contable (SII).',  TRUE, 'puesto_laboral', 'Contabilidad',        'presencial', 'Indefinido','$600.000', DATE_ADD(CURDATE(), INTERVAL 90 DAY)),
  -- VentasPro — Ventas + Atención al Cliente
  (@e4, 'Practicante Ventas',                   'Apoyo en prospección, cotizaciones y cierre de ventas.', 'Estudiante administración.',          TRUE, 'practica',       'Ventas',              'hibrido',    '4 meses',   '$220.000', DATE_ADD(CURDATE(), INTERVAL 40 DAY)),
  (@e4, 'Ejecutivo Comercial Junior',           'Gestión de cartera de clientes y metas.',                'Habilidades de comunicación.',        TRUE, 'puesto_laboral', 'Ventas',              'presencial', 'Indefinido','$580.000', DATE_ADD(CURDATE(), INTERVAL 60 DAY)),
  (@e4, 'Practicante Atención al Cliente',      'Recepción, soporte y seguimiento post-venta.',           'Estudiante cualquier carrera.',       TRUE, 'practica',       'Atención al Cliente', 'presencial', '3 meses',   '$200.000', DATE_ADD(CURDATE(), INTERVAL 35 DAY)),
  (@e4, 'Agente de Servicio al Cliente',        'Resolución de incidencias y fidelización.',              'Experiencia en servicio al cliente.', TRUE, 'puesto_laboral', 'Atención al Cliente', 'remoto',     'Indefinido','$490.000', DATE_ADD(CURDATE(), INTERVAL 55 DAY)),
  -- TalentCorp — RRHH
  (@e5, 'Practicante Recursos Humanos',         'Apoyo en reclutamiento, onboarding y gestión.',          'Estudiante administración.',          TRUE, 'practica',       'RRHH',                'hibrido',    '6 meses',   '$240.000', DATE_ADD(CURDATE(), INTERVAL 60 DAY)),
  (@e5, 'Analista RRHH Junior',                 'Selección de personal, entrevistas y KPIs.',             'Conocimientos en RRHH.',              TRUE, 'puesto_laboral', 'RRHH',                'hibrido',    'Indefinido','$620.000', DATE_ADD(CURDATE(), INTERVAL 70 DAY)),
  (@e5, 'Practicante Gestión de Personas',      'Bienestar, capacitación y soporte administrativo.',      'Estudiante administración.',          TRUE, 'practica',       'RRHH',                'presencial', '4 meses',   '$220.000', DATE_ADD(CURDATE(), INTERVAL 45 DAY));

SET @v_autoparts_prac = (SELECT id FROM vacantes WHERE empresa_id = @e1 AND tipo = 'practica'       AND area = 'Automotriz'          LIMIT 1);
SET @v_autoparts_plab = (SELECT id FROM vacantes WHERE empresa_id = @e1 AND tipo = 'puesto_laboral' AND area = 'Automotriz'          LIMIT 1);
SET @v_logisti_prac   = (SELECT id FROM vacantes WHERE empresa_id = @e2 AND tipo = 'practica'       AND area = 'Logística'           LIMIT 1);
SET @v_logisti_plab   = (SELECT id FROM vacantes WHERE empresa_id = @e2 AND tipo = 'puesto_laboral' AND area = 'Logística'           LIMIT 1);
SET @v_gestion_prac   = (SELECT id FROM vacantes WHERE empresa_id = @e3 AND tipo = 'practica'       AND area = 'Administración'      LIMIT 1);
SET @v_gestion_plab   = (SELECT id FROM vacantes WHERE empresa_id = @e3 AND tipo = 'puesto_laboral' AND area = 'Administración'      LIMIT 1);
SET @v_ventas_prac    = (SELECT id FROM vacantes WHERE empresa_id = @e4 AND tipo = 'practica'       AND area = 'Ventas'              LIMIT 1);
SET @v_ventas_plab    = (SELECT id FROM vacantes WHERE empresa_id = @e4 AND tipo = 'puesto_laboral' AND area = 'Ventas'              LIMIT 1);
SET @v_talent_prac    = (SELECT id FROM vacantes WHERE empresa_id = @e5 AND tipo = 'practica'       AND area = 'RRHH'                LIMIT 1);
SET @v_talent_plab    = (SELECT id FROM vacantes WHERE empresa_id = @e5 AND tipo = 'puesto_laboral' AND area = 'RRHH'                LIMIT 1);

-- ================================================================
-- 4. ESTUDIANTES  (columnas reales: nombre, apellido_paterno,
--    apellido_materno — nombre_completo es STORED GENERATED)
-- ================================================================

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
  -- Mecánica Automotriz — 1° y 2° Medio
  (@s01, 'Tomás',     'Araya',     'Ríos',     @carrera_mec, '1° Medio', 'masculino',     @colegio_id, 5.8, 6.0),
  (@s02, 'Sofía',     'Molina',    'Vera',      @carrera_mec, '1° Medio', 'femenino',      @colegio_id, 6.1, 6.2),
  (@s03, 'Felipe',    'Contreras', 'Soto',      @carrera_mec, '2° Medio', 'masculino',     @colegio_id, 5.5, 5.7),
  (@s04, 'Valentina', 'Díaz',      'Pérez',     @carrera_mec, '2° Medio', 'femenino',      @colegio_id, 6.3, 6.4),
  -- Mecánica Automotriz — 3° y 4° Medio
  (@s05, 'Rodrigo',   'Muñoz',     'Lagos',     @carrera_mec, '3° Medio', 'masculino',     @colegio_id, 5.9, 6.1),
  (@s06, 'Ignacio',   'Pinto',     'Baeza',     @carrera_mec, '4° Medio', 'masculino',     @colegio_id, 6.4, 6.5),
  -- Administración — 1° y 2° Medio
  (@s07, 'Camila',    'Reyes',     'Torres',    @carrera_adm, '1° Medio', 'femenino',      @colegio_id, 6.0, 6.1),
  (@s08, 'Martina',   'Flores',    'Vega',      @carrera_adm, '2° Medio', 'femenino',      @colegio_id, 6.2, 6.3),
  (@s09, 'Diego',     'Salazar',   'Núñez',     @carrera_adm, '2° Medio', 'masculino',     @colegio_id, 5.6, 5.8),
  -- Administración — 3° y 4° Medio
  (@s10, 'Javiera',   'Castro',    'Herrera',   @carrera_adm, '3° Medio', 'femenino',      @colegio_id, 6.5, 6.6),
  (@s11, 'Sebastián', 'Rojas',     'Ibáñez',    @carrera_adm, '3° Medio', 'masculino',     @colegio_id, 5.7, 5.9),
  (@s12, 'Alex',      'Morales',   'Fuentes',   @carrera_adm, '4° Medio', 'no_especifica', @colegio_id, 6.7, 6.8);

-- ================================================================
-- 5. POSTULACIONES (10 meses, distintos estados)
-- ================================================================

INSERT INTO postulaciones (vacante_id, estudiante_id, estado, fecha_creacion) VALUES
  -- Hace 10 meses
  (@v_autoparts_prac, @s01, 'completado', DATE_SUB(NOW(), INTERVAL 10 MONTH)),
  (@v_logisti_prac,   @s07, 'completado', DATE_SUB(NOW(), INTERVAL 10 MONTH)),
  (@v_gestion_prac,   @s09, 'rechazado',  DATE_SUB(NOW(), INTERVAL 10 MONTH)),
  -- Hace 9 meses
  (@v_autoparts_plab, @s03, 'aceptado',   DATE_SUB(NOW(), INTERVAL 9 MONTH)),
  (@v_gestion_prac,   @s07, 'completado', DATE_SUB(NOW(), INTERVAL 9 MONTH)),
  (@v_logisti_plab,   @s09, 'rechazado',  DATE_SUB(NOW(), INTERVAL 9 MONTH)),
  (@v_ventas_prac,    @s10, 'completado', DATE_SUB(NOW(), INTERVAL 9 MONTH)),
  -- Hace 8 meses
  (@v_autoparts_prac, @s05, 'completado', DATE_SUB(NOW(), INTERVAL 8 MONTH)),
  (@v_talent_prac,    @s08, 'aceptado',   DATE_SUB(NOW(), INTERVAL 8 MONTH)),
  (@v_gestion_plab,   @s12, 'rechazado',  DATE_SUB(NOW(), INTERVAL 8 MONTH)),
  (@v_ventas_plab,    @s10, 'aceptado',   DATE_SUB(NOW(), INTERVAL 8 MONTH)),
  (@v_logisti_prac,   @s06, 'completado', DATE_SUB(NOW(), INTERVAL 8 MONTH)),
  -- Hace 7 meses
  (@v_gestion_prac,   @s11, 'completado', DATE_SUB(NOW(), INTERVAL 7 MONTH)),
  (@v_talent_plab,    @s10, 'rechazado',  DATE_SUB(NOW(), INTERVAL 7 MONTH)),
  (@v_autoparts_plab, @s06, 'aceptado',   DATE_SUB(NOW(), INTERVAL 7 MONTH)),
  (@v_ventas_prac,    @s07, 'completado', DATE_SUB(NOW(), INTERVAL 7 MONTH)),
  (@v_logisti_plab,   @s04, 'completado', DATE_SUB(NOW(), INTERVAL 7 MONTH)),
  -- Hace 6 meses
  (@v_talent_prac,    @s11, 'completado', DATE_SUB(NOW(), INTERVAL 6 MONTH)),
  (@v_autoparts_prac, @s02, 'aceptado',   DATE_SUB(NOW(), INTERVAL 6 MONTH)),
  (@v_gestion_plab,   @s08, 'completado', DATE_SUB(NOW(), INTERVAL 6 MONTH)),
  (@v_ventas_plab,    @s12, 'rechazado',  DATE_SUB(NOW(), INTERVAL 6 MONTH)),
  (@v_logisti_prac,   @s01, 'completado', DATE_SUB(NOW(), INTERVAL 6 MONTH)),
  -- Hace 5 meses
  (@v_ventas_prac,    @s09, 'aceptado',   DATE_SUB(NOW(), INTERVAL 5 MONTH)),
  (@v_talent_plab,    @s12, 'completado', DATE_SUB(NOW(), INTERVAL 5 MONTH)),
  (@v_autoparts_plab, @s05, 'completado', DATE_SUB(NOW(), INTERVAL 5 MONTH)),
  (@v_gestion_prac,   @s04, 'pendiente',  DATE_SUB(NOW(), INTERVAL 5 MONTH)),
  (@v_logisti_plab,   @s11, 'completado', DATE_SUB(NOW(), INTERVAL 5 MONTH)),
  (@v_ventas_plab,    @s03, 'rechazado',  DATE_SUB(NOW(), INTERVAL 5 MONTH)),
  -- Hace 4 meses
  (@v_autoparts_prac, @s04, 'completado', DATE_SUB(NOW(), INTERVAL 4 MONTH)),
  (@v_gestion_plab,   @s10, 'aceptado',   DATE_SUB(NOW(), INTERVAL 4 MONTH)),
  (@v_talent_prac,    @s09, 'completado', DATE_SUB(NOW(), INTERVAL 4 MONTH)),
  (@v_logisti_prac,   @s12, 'pendiente',  DATE_SUB(NOW(), INTERVAL 4 MONTH)),
  (@v_ventas_prac,    @s06, 'completado', DATE_SUB(NOW(), INTERVAL 4 MONTH)),
  (@v_autoparts_plab, @s07, 'rechazado',  DATE_SUB(NOW(), INTERVAL 4 MONTH)),
  (@v_talent_plab,    @s02, 'completado', DATE_SUB(NOW(), INTERVAL 4 MONTH)),
  -- Hace 3 meses
  (@v_gestion_prac,   @s02, 'aceptado',   DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  (@v_logisti_plab,   @s05, 'completado', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  (@v_ventas_plab,    @s08, 'aceptado',   DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  (@v_autoparts_prac, @s11, 'pendiente',  DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  (@v_talent_prac,    @s03, 'completado', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  (@v_gestion_plab,   @s06, 'rechazado',  DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  (@v_logisti_prac,   @s10, 'completado', DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  (@v_ventas_prac,    @s01, 'pendiente',  DATE_SUB(NOW(), INTERVAL 3 MONTH)),
  -- Hace 2 meses
  (@v_talent_plab,    @s04, 'pendiente',  DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_autoparts_plab, @s08, 'aceptado',   DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_gestion_prac,   @s05, 'completado', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_ventas_plab,    @s11, 'pendiente',  DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_logisti_plab,   @s02, 'aceptado',   DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_talent_prac,    @s06, 'completado', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_autoparts_prac, @s09, 'rechazado',  DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_gestion_plab,   @s03, 'completado', DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  (@v_ventas_prac,    @s12, 'pendiente',  DATE_SUB(NOW(), INTERVAL 2 MONTH)),
  -- Mes pasado
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
  -- Este mes
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
