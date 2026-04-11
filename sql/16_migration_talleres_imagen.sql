-- Migration 16: Añadir imagen a talleres
ALTER TABLE talleres
  ADD COLUMN imagen_url VARCHAR(500) DEFAULT NULL AFTER esta_activo;
