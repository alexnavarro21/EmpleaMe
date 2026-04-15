USE railway;

-- ============================================================
-- SEED: Publicaciones con imágenes para los 5 estudiantes demo
-- 10 publicaciones anteriores + 5 recientes (últimos 15 min)
-- Imágenes: subidas al bucket Railway en uploads/
-- url_multimedia formato: /api/media/uploads/{filename}
--   → backend proxea desde S3 vía GET /api/media/uploads/:filename
-- Idempotente: borra por titulo+autor antes de insertar
-- ============================================================

DELETE FROM publicaciones
WHERE titulo IN (
  'Así se ve mi área de trabajo en práctica',
  'Certificado impreso en mis manos',
  'Así luce el motor que diagnostiqué hoy',
  'Mi kit de diagnóstico OBD-II',
  'Equipo ganador — proyecto semestral',
  'Así quedó nuestro sistema de inventario en SAP',
  'Competencia regional — detrás de cámaras',
  'Primera soldadura MIG que no quedó mal',
  'Cierre de mes en Constructora Andina',
  'Mi escritorio el día de la distinción académica',
  -- recientes
  'Reunión de equipo antes de la evaluación',
  'El taller a las 7 AM — así arrancamos',
  'Presentación bajo presión: lo que aprendí',
  'Desarmando el motor de un auto eléctrico',
  'Revisando los números del cierre con el equipo'
)
AND autor_id IN (
  SELECT id FROM usuarios WHERE correo IN (
    'camila.torres@demo.cl',
    'matias.sepulveda@demo.cl',
    'valentina.rojas@demo.cl',
    'diego.castillo@demo.cl',
    'fernanda.munoz@demo.cl'
  )
);

-- ── Camila Torres — Administración ──────────────────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  (
    (SELECT id FROM usuarios WHERE correo = 'camila.torres@demo.cl'),
    (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
    'Así se ve mi área de trabajo en práctica',
    'Pasar de la sala de clases a un escritorio real con expedientes físicos, carpetas y un computador con sistema de gestión fue un salto enorme. Cada carpeta tiene una historia detrás.',
    '/api/media/uploads/camila_escritorio.jpg',
    DATE_SUB(NOW(), INTERVAL 12 DAY)
  ),
  (
    (SELECT id FROM usuarios WHERE correo = 'camila.torres@demo.cl'),
    (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
    'Certificado impreso en mis manos',
    'Hoy recibí el certificado físico del curso de Excel Avanzado. Verlo impreso con mi nombre le da otro peso. No es solo un papel, es evidencia de horas de práctica y constancia.',
    '/api/media/uploads/camila_diploma.jpg',
    DATE_SUB(NOW(), INTERVAL 7 DAY)
  );

-- ── Matías Sepúlveda — Mecánica Automotriz ──────────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  (
    (SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'),
    (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
    'Así luce el motor que diagnostiqué hoy',
    'Motor 1.6 con falla intermitente en sensor MAP. Conecté el scanner, leí los parámetros en tiempo real y di con el problema en menos de 20 minutos. La práctica ya está dando frutos.',
    '/api/media/uploads/matias_motor.jpg',
    DATE_SUB(NOW(), INTERVAL 6 DAY)
  ),
  (
    (SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'),
    (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
    'Mi kit de diagnóstico OBD-II',
    'Junté durante meses para comprar mi propio scanner OBD-II. Ya no dependo del equipo del taller para practicar. Lo conecté en tres vehículos distintos el primer fin de semana y funcionó perfecto.',
    '/api/media/uploads/matias_obd.jpg',
    DATE_SUB(NOW(), INTERVAL 20 DAY)
  );

-- ── Valentina Rojas — Administración ────────────────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  (
    (SELECT id FROM usuarios WHERE correo = 'valentina.rojas@demo.cl'),
    (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
    'Equipo ganador — proyecto semestral',
    'Lideramos el proyecto de gestión empresarial más evaluado del semestre. Cuatro personas, tres semanas, un resultado que superó las expectativas del docente. Trabajo en equipo de verdad.',
    '/api/media/uploads/valentina_equipo.jpg',
    DATE_SUB(NOW(), INTERVAL 4 DAY)
  ),
  (
    (SELECT id FROM usuarios WHERE correo = 'valentina.rojas@demo.cl'),
    (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
    'Así quedó nuestro sistema de inventario en SAP',
    'Después de dos semanas configurando el módulo MM en SAP básico, finalmente el sistema de inventario simulado funciona de punta a punta. La integración entre compras y stock es lo más potente que he visto.',
    '/api/media/uploads/valentina_sap.jpg',
    DATE_SUB(NOW(), INTERVAL 22 DAY)
  );

-- ── Diego Castillo — Mecánica Automotriz ────────────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  (
    (SELECT id FROM usuarios WHERE correo = 'diego.castillo@demo.cl'),
    (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
    'Competencia regional — detrás de cámaras',
    'Antes de subir al podio hubo horas de preparación, cronómetros, fallas simuladas y mucha adrenalina. Esta foto es del momento justo antes de la prueba final. Tercer lugar fue justo.',
    '/api/media/uploads/diego_taller.jpg',
    DATE_SUB(NOW(), INTERVAL 14 DAY)
  ),
  (
    (SELECT id FROM usuarios WHERE correo = 'diego.castillo@demo.cl'),
    (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
    'Primera soldadura MIG que no quedó mal',
    'Tres intentos fallidos antes de este resultado. La soldadura MIG requiere una combinación de velocidad, ángulo y calor que solo se aprende equivocándose. Por fin el cordón quedó limpio y continuo.',
    '/api/media/uploads/diego_soldadura.jpg',
    DATE_SUB(NOW(), INTERVAL 48 DAY)
  );

-- ── Fernanda Muñoz — Administración ─────────────────────────
INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  (
    (SELECT id FROM usuarios WHERE correo = 'fernanda.munoz@demo.cl'),
    (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
    'Cierre de mes en Constructora Andina',
    'Primer cierre contable real de mi vida. Conciliación bancaria, cuadre de facturas y reporte para el contador senior. Cuatro horas de trabajo concentrado. Sin errores al primer intento.',
    '/api/media/uploads/fernanda_contabilidad.jpg',
    DATE_SUB(NOW(), INTERVAL 38 DAY)
  ),
  (
    (SELECT id FROM usuarios WHERE correo = 'fernanda.munoz@demo.cl'),
    (SELECT id FROM tipos_publicacion WHERE nombre = 'logro'),
    'Mi escritorio el día de la distinción académica',
    'Esta foto la tomé antes de ir a la ceremonia. El diploma todavía no llegaba pero ya sabía el resultado. Promedio 6.8, distinción académica y la certeza de que el esfuerzo tiene sentido.',
    '/api/media/uploads/fernanda_escritorio.jpg',
    DATE_SUB(NOW(), INTERVAL 2 DAY)
  );

-- ============================================================
-- PUBLICACIONES RECIENTES — últimos 15 minutos
-- ============================================================

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  (
    (SELECT id FROM usuarios WHERE correo = 'camila.torres@demo.cl'),
    (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
    'Reunión de equipo antes de la evaluación',
    'Hoy nos juntamos antes de la evaluación modular para repasar juntos. Tener un equipo comprometido hace toda la diferencia. Nerviosa pero lista.',
    '/api/media/uploads/camila_reunion.jpg',
    DATE_SUB(NOW(), INTERVAL 2 MINUTE)
  );

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  (
    (SELECT id FROM usuarios WHERE correo = 'matias.sepulveda@demo.cl'),
    (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
    'El taller a las 7 AM — así arrancamos',
    'Primera hora en el taller y ya hay tres autos en fila. Me gusta llegar temprano, da tiempo para revisar las órdenes de trabajo con calma antes de que todo se acelere.',
    '/api/media/uploads/matias_taller2.jpg',
    DATE_SUB(NOW(), INTERVAL 5 MINUTE)
  );

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  (
    (SELECT id FROM usuarios WHERE correo = 'valentina.rojas@demo.cl'),
    (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
    'Presentación bajo presión: lo que aprendí',
    'Exponer frente a 30 personas con 10 minutos de preparación no estaba en el plan. Lo hice igual. Cuando no tienes tiempo de pensar demasiado, sale lo que realmente sabes.',
    '/api/media/uploads/valentina_presion.jpg',
    DATE_SUB(NOW(), INTERVAL 8 MINUTE)
  );

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  (
    (SELECT id FROM usuarios WHERE correo = 'diego.castillo@demo.cl'),
    (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
    'Desarmando el motor de un auto eléctrico',
    'Hoy el profe trajo un motor eléctrico para que lo analizáramos. Nunca lo había visto por dentro. La cantidad de componentes que reemplazan todo el sistema de transmisión tradicional es impresionante.',
    '/api/media/uploads/diego_motor2.jpg',
    DATE_SUB(NOW(), INTERVAL 11 MINUTE)
  );

INSERT INTO publicaciones (autor_id, tipo_id, titulo, contenido, url_multimedia, publicado_en) VALUES
  (
    (SELECT id FROM usuarios WHERE correo = 'fernanda.munoz@demo.cl'),
    (SELECT id FROM tipos_publicacion WHERE nombre = 'general'),
    'Revisando los números del cierre con el equipo',
    'Última reunión antes de entregar el informe de cierre. Todos alineados, todo cuadrado. Cuando el trabajo previo está bien hecho, el cierre no da miedo.',
    '/api/media/uploads/fernanda_reunion.jpg',
    DATE_SUB(NOW(), INTERVAL 14 MINUTE)
  );
