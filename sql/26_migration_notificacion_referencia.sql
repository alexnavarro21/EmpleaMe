-- Migración 26: Agrega referencia_id a notificaciones
-- Permite almacenar el ID del recurso relacionado (ej: usuario que te siguió, publicación comentada)

ALTER TABLE notificaciones
  ADD COLUMN referencia_id INT NULL DEFAULT NULL AFTER contenido;
