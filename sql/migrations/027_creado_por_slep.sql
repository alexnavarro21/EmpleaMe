-- Migration 027: campo creado_por en usuarios
-- Permite saber si una cuenta empresa/colegio fue creada por el SLEP
-- Ejecutar una sola vez. Ignorar si ya existe el campo.

ALTER TABLE usuarios
  ADD COLUMN creado_por INT DEFAULT NULL,
  ADD CONSTRAINT fk_usuarios_creado_por
    FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL;
