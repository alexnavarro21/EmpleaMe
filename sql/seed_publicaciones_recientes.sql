USE railway;

-- ============================================================
-- SEED: 8 publicaciones recientes de estudiantes demo
-- Todas dentro de las últimas 24 horas.
-- Idempotente: borra por título exacto antes de insertar.
-- Requiere que seed_estudiantes_demo.sql ya esté aplicado.
-- ============================================================

DELETE FROM publicaciones WHERE titulo IN (
  'Primer día buscando práctica profesional',
  'Terminé mi módulo de contabilidad de costos',
  'Escaneé mi primer vehículo con falla real',
  'Presentamos proyecto final de ERP en clases',
  'Hoy aprendí a hacer una conciliación bancaria de verdad',
  'Conseguí mi primera entrevista de práctica',
  'Motor desmontado y vuelto a armar — lo logramos',
  'Por qué elegí Administración y no me arrepiento'
);

-- ── Camila Torres (@u1) ──────────────────────────────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en)
VALUES (
  (SELECT id FROM usuarios WHERE correo = 'camila.torres@demo.cl'),
  (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
  'Primer día buscando práctica profesional',
  'Hoy empecé a revisar ofertas de práctica en serio. Tenía el perfil a medias, lo completé todo: historial, habilidades, presentación. Sorprende cuánto cambia la perspectiva cuando te ves desde afuera como candidata. Nerviosa pero lista.',
  DATE_SUB(NOW(), INTERVAL 22 MINUTE)
);

-- ── Matías Sepúlveda (@u2) ───────────────────────────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en)
VALUES (
  (SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'),
  (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
  'Escaneé mi primer vehículo con falla real',
  'Hoy en el taller escolar llegó un Hyundai con luz de check engine encendida. Me dejaron hacer el diagnóstico completo con el escáner OBD-II. Código P0301: falla de encendido en cilindro 1. Lo identificamos, propusimos la solución, el profe validó. Primera vez que siento que sé lo que hago.',
  DATE_SUB(NOW(), INTERVAL 1 HOUR)
);

-- ── Valentina Rojas (@u3) ────────────────────────────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en)
VALUES (
  (SELECT id FROM usuarios WHERE correo = 'valentina.rojas@demo.cl'),
  (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
  'Terminé mi módulo de contabilidad de costos',
  'Módulo terminado con nota 6.7. Costeo por absorción, costeo variable, punto de equilibrio y análisis de márgenes. Lo más difícil fue entender cuándo usar cada método según el contexto del negocio. Ahora lo entiendo. A por el siguiente.',
  DATE_SUB(NOW(), INTERVAL 2 HOUR)
);

-- ── Diego Castillo (@u4) ─────────────────────────────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en)
VALUES (
  (SELECT id FROM usuarios WHERE correo = 'diego.castillo@demo.cl'),
  (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
  'Motor desmontado y vuelto a armar — lo logramos',
  'Práctica de taller: desmontaje y montaje completo de motor a gasolina 1.6L. Cuatro compañeros, cuatro horas, cero piezas sobrando al final. El profe revisó la compresión después del montaje y quedó en especificación. Una de las mejores sensaciones que he tenido en el colegio.',
  DATE_SUB(NOW(), INTERVAL 3 HOUR)
);

-- ── Fernanda Muñoz (@u5) ─────────────────────────────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en)
VALUES (
  (SELECT id FROM usuarios WHERE correo = 'fernanda.munoz@demo.cl'),
  (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
  'Hoy aprendí a hacer una conciliación bancaria de verdad',
  'En la práctica me pasaron un extracto bancario con 47 movimientos y el libro mayor para cruzar. Tarde dos horas. Encontré tres diferencias, dos eran errores de registro y una era un cargo bancario no contabilizado. Pequeño logro, gran aprendizaje.',
  DATE_SUB(NOW(), INTERVAL 5 HOUR)
);

-- ── Camila Torres (segunda del día) ─────────────────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en)
VALUES (
  (SELECT id FROM usuarios WHERE correo = 'camila.torres@demo.cl'),
  (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
  'Conseguí mi primera entrevista de práctica',
  'Me llamaron de una empresa de servicios para una entrevista la próxima semana. Es la primera vez que mi CV llega tan lejos. Preparé respuestas, revisé la empresa, tengo todo listo. Sea cual sea el resultado, ya es un avance enorme.',
  DATE_SUB(NOW(), INTERVAL 8 HOUR)
);

-- ── Valentina Rojas (segunda del día) ───────────────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en)
VALUES (
  (SELECT id FROM usuarios WHERE correo = 'valentina.rojas@demo.cl'),
  (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
  'Presentamos proyecto final de ERP en clases',
  'Hoy expusimos el proyecto de gestión con SAP básico frente a toda la generación. Nuestro equipo modeló el ciclo completo de una empresa distribuidora: compras, ventas, inventario y finanzas. El profe dijo que fue la presentación más completa del año. Orgullosa del equipo.',
  DATE_SUB(NOW(), INTERVAL 12 HOUR)
);

-- ── Matías Sepúlveda (segunda del día) ──────────────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, publicado_en)
VALUES (
  (SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'),
  (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
  'Por qué elegí Mecánica Automotriz y no me arrepiento',
  'Mucha gente me pregunta por qué elegí mecánica. La respuesta es simple: me gusta resolver problemas que tienen una causa real y una solución concreta. Un vehículo falla, tú lo diagnosticas, lo reparas, arranca. No hay ambigüedad. Cada día que entro al taller confirmo que tomé la decisión correcta.',
  DATE_SUB(NOW(), INTERVAL 18 HOUR)
);
