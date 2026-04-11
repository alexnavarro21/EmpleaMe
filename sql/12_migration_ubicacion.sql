-- Migration 12: Agrega RUT (estudiantes) y región/comuna (estudiantes y empresas)

ALTER TABLE perfiles_estudiantes
  ADD COLUMN rut        VARCHAR(12) NULL AFTER nombre_completo,
  ADD COLUMN region     VARCHAR(80) NULL,
  ADD COLUMN comuna     VARCHAR(80) NULL;

ALTER TABLE perfiles_empresas
  ADD COLUMN region     VARCHAR(80) NULL,
  ADD COLUMN comuna     VARCHAR(80) NULL;
