-- ============================================================
-- EmpleaMe — Seed de vacantes para datos de gráficos
-- 3 vacantes por empresa, sin stored procedure (compatible con drivers).
-- Áreas: Automotriz, Logística, Administración, Ventas, RRHH,
--        Contabilidad, TI, Mantenimiento, Atención al Cliente
-- Para revertir: DELETE FROM vacantes WHERE descripcion LIKE '%[seed-graficos]%';
-- ============================================================

INSERT INTO vacantes (
  empresa_id, titulo, descripcion, requisitos,
  esta_activa, tipo, area, modalidad,
  duracion, horario, remuneracion, direccion,
  beneficios, fecha_limite, fecha_creacion
)
SELECT
  pe.usuario_id,

  -- ── título ────────────────────────────────────────────────────
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

  -- ── descripción ───────────────────────────────────────────────
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN 'Apoyo en diagnóstico electrónico OBD-II, mantenimiento preventivo y reparación de vehículos livianos junto a mecánicos senior. Ambiente de aprendizaje activo con equipos modernos. [seed-graficos]'
    WHEN 12 THEN 'Recepción, despacho y control de stock en bodega. Manejo de sistema de inventario digital. Trabajo en equipo dentro de bodega ordenada y categorizada por SKU. [seed-graficos]'
    WHEN 13 THEN 'Gestión documental, facturación electrónica SII, control de inventario y atención a clientes y proveedores. Reporta al área de administración y finanzas. [seed-graficos]'
    WHEN 21 THEN 'Gestión de cartera de clientes, prospección de nuevos negocios, elaboración de cotizaciones y seguimiento post-venta. Reporte directo al gerente comercial. [seed-graficos]'
    WHEN 22 THEN 'Apoyo en procesos de selección, control de asistencia, gestión de contratos y digitalización de expedientes de personal. Participación en actividades de clima laboral. [seed-graficos]'
    WHEN 23 THEN 'Registro de operaciones contables, conciliaciones bancarias, preparación de declaraciones de IVA y apoyo en cierre mensual. Trabajo directo con contador senior. [seed-graficos]'
    WHEN  1 THEN 'Desarrollo y mantención de sistemas web internos, integración con APIs externas y soporte técnico a usuarios. Trabajo en equipo ágil con sprints semanales. [seed-graficos]'
    WHEN  2 THEN 'Mantenimiento preventivo y correctivo de maquinaria, instalaciones eléctricas y sistemas hidráulicos. Registro en bitácora digital. Respuesta a emergencias técnicas. [seed-graficos]'
    WHEN  3 THEN 'Recepción de clientes, gestión de agenda, coordinación con áreas internas y manejo de consultas por teléfono y correo. Primera imagen de la empresa ante los clientes. [seed-graficos]'
  END,

  -- ── requisitos ────────────────────────────────────────────────
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN 'Cursando últimos semestres de Técnico en Mecánica Automotriz. Conocimientos básicos en diagnóstico OBD-II. Disponibilidad full-time. No se requiere experiencia previa.'
    WHEN 12 THEN 'Enseñanza media completa o técnico en logística/bodega. Conocimientos de control de inventario básico. Licencia de conducir clase B deseable. Disposición física para trabajo en bodega.'
    WHEN 13 THEN 'Título técnico en Administración o Contabilidad. Manejo de Excel intermedio. Experiencia en facturación electrónica SII deseable. Organizado/a y con buena redacción.'
    WHEN 21 THEN 'Título técnico en Administración, Ventas o afín. Experiencia mínima 6 meses en ventas o atención al cliente. Habilidades de negociación y comunicación. Manejo de Office.'
    WHEN 22 THEN 'Cursando Técnico o Licenciatura en Administración, RRHH o afín. Manejo de Excel básico. Buenas habilidades interpersonales y confidencialidad. Disponibilidad mínima 30 h/semana.'
    WHEN 23 THEN 'Cursando Técnico en Contabilidad o Administración con mención contable. Manejo de Conta+ o software contable similar deseable. Orientación al detalle y precisión numérica.'
    WHEN  1 THEN 'Estudiante o egresado de Ingeniería en Informática o afín. Conocimientos en HTML, CSS, JavaScript y algún framework backend. Git básico.'
    WHEN  2 THEN 'Título técnico en Mecánica Industrial, Electricidad o afín. Experiencia mínima 1 año en mantenimiento. Lectura de planos eléctricos. Disponibilidad para turnos.'
    WHEN  3 THEN 'Técnico en Administración o carrera afín. Habilidades comunicacionales sobresalientes. Manejo básico de Office. Experiencia en atención al público deseable.'
  END,

  -- ── esta_activa ───────────────────────────────────────────────
  -- vacante 2 del bundle 3 (mantenimiento) queda inactiva para datos de gráficos
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 2 THEN 0
    ELSE        1
  END,

  -- ── tipo ──────────────────────────────────────────────────────
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN 'practica'
    WHEN 12 THEN 'puesto_laboral'
    WHEN 13 THEN 'puesto_laboral'
    WHEN 21 THEN 'puesto_laboral'
    WHEN 22 THEN 'practica'
    WHEN 23 THEN 'practica'
    WHEN  1 THEN 'practica'
    WHEN  2 THEN 'puesto_laboral'
    WHEN  3 THEN 'puesto_laboral'
  END,

  -- ── area ──────────────────────────────────────────────────────
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN 'Automotriz'
    WHEN 12 THEN 'Logística y Bodega'
    WHEN 13 THEN 'Administración'
    WHEN 21 THEN 'Ventas y Comercial'
    WHEN 22 THEN 'Recursos Humanos'
    WHEN 23 THEN 'Contabilidad'
    WHEN  1 THEN 'Tecnología e Informática'
    WHEN  2 THEN 'Mantenimiento Industrial'
    WHEN  3 THEN 'Atención al Cliente'
  END,

  -- ── modalidad ─────────────────────────────────────────────────
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 21 THEN 'hibrido'
    WHEN  1 THEN 'remoto'
    ELSE        'presencial'
  END,

  -- ── duracion ──────────────────────────────────────────────────
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN '3 meses'
    WHEN 12 THEN 'Indefinido'
    WHEN 13 THEN 'Indefinido'
    WHEN 21 THEN 'Indefinido'
    WHEN 22 THEN '3 meses'
    WHEN 23 THEN '3 meses'
    WHEN  1 THEN '4 meses'
    WHEN  2 THEN 'Indefinido'
    WHEN  3 THEN 'Indefinido'
  END,

  -- ── horario ───────────────────────────────────────────────────
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

  -- ── remuneracion ──────────────────────────────────────────────
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN '$250.000 mensual'
    WHEN 12 THEN '$420.000 mensual'
    WHEN 13 THEN '$460.000 mensual'
    WHEN 21 THEN '$550.000 + comisiones'
    WHEN 22 THEN '$180.000 mensual'
    WHEN 23 THEN '$200.000 mensual'
    WHEN  1 THEN '$300.000 mensual'
    WHEN  2 THEN '$580.000 mensual'
    WHEN  3 THEN '$420.000 mensual'
  END,

  -- ── dirección (usa región/comuna de la empresa si existen) ────
  CONCAT('Av. Principal 100, ',
         COALESCE(pe.comuna, 'Santiago'), ', ',
         COALESCE(pe.region, 'Región Metropolitana de Santiago')),

  -- ── beneficios ────────────────────────────────────────────────
  CASE (pe.usuario_id % 3) * 10 + n.n
    WHEN 11 THEN 'Colación incluida. Uniforme y EPP provistos. Posibilidad de contratación al término de práctica.'
    WHEN 12 THEN 'Seguro de accidente laboral. Uniforme completo provisto. Bono de asistencia mensual. Alimentación subsidiada.'
    WHEN 13 THEN 'Seguro complementario de salud. Bono de desempeño semestral. Capacitación en herramientas administrativas.'
    WHEN 21 THEN 'Comisiones sobre ventas. Seguro complementario de salud. Bono anual por cumplimiento de metas.'
    WHEN 22 THEN 'Colación incluida. Certificado de práctica detallado. Supervisión cercana del área de RRHH.'
    WHEN 23 THEN 'Colación incluida. Mentoría de contador senior. Certificado de práctica detallado. Posibilidad de extensión.'
    WHEN  1 THEN 'Trabajo 100% remoto. Equipo provisto si necesario. Mentoría técnica incluida. Posibilidad de contratación.'
    WHEN  2 THEN 'Seguro complementario. EPP completo. Bono por turno nocturno. Capacitación técnica anual.'
    WHEN  3 THEN 'Seguro de salud complementario. Uniforme provisto. Bono de asistencia. Excelente ambiente laboral.'
  END,

  -- ── fecha_limite ──────────────────────────────────────────────
  DATE_ADD(CURDATE(), INTERVAL
    CASE n.n WHEN 1 THEN 30 WHEN 2 THEN 15 ELSE 21 END
  DAY),

  -- ── fecha_creacion (distribuida en los últimos 45 días) ───────
  DATE_SUB(NOW(), INTERVAL
    CASE (pe.usuario_id % 3) * 10 + n.n
      WHEN 11 THEN 12  WHEN 12 THEN 25  WHEN 13 THEN 5
      WHEN 21 THEN  8  WHEN 22 THEN 18  WHEN 23 THEN 3
      WHEN  1 THEN 20  WHEN  2 THEN 35  WHEN  3 THEN 45
    END
  DAY)

FROM perfiles_empresas pe
CROSS JOIN (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3) n;

-- ── Resumen ───────────────────────────────────────────────────────
SELECT
  COUNT(*)                                                       AS vacantes_insertadas,
  SUM(CASE WHEN tipo       = 'practica'       THEN 1 ELSE 0 END) AS practicas,
  SUM(CASE WHEN tipo       = 'puesto_laboral' THEN 1 ELSE 0 END) AS puestos_laborales,
  SUM(CASE WHEN modalidad  = 'presencial'     THEN 1 ELSE 0 END) AS presenciales,
  SUM(CASE WHEN modalidad  = 'remoto'         THEN 1 ELSE 0 END) AS remotas,
  SUM(CASE WHEN modalidad  = 'hibrido'        THEN 1 ELSE 0 END) AS hibridas,
  SUM(CASE WHEN esta_activa = 1               THEN 1 ELSE 0 END) AS activas,
  SUM(CASE WHEN esta_activa = 0               THEN 1 ELSE 0 END) AS inactivas
FROM vacantes
WHERE descripcion LIKE '%[seed-graficos]%';
