-- 028: Separar nombre_completo en nombre + apellido_paterno + apellido_materno

ALTER TABLE perfiles_estudiantes
  ADD COLUMN nombre VARCHAR(100) NOT NULL DEFAULT '' AFTER usuario_id,
  ADD COLUMN apellido_paterno VARCHAR(100) NOT NULL DEFAULT '' AFTER nombre,
  ADD COLUMN apellido_materno VARCHAR(100) DEFAULT NULL AFTER apellido_paterno;

-- Migrar datos existentes: el nombre_completo completo pasa al campo nombre
UPDATE perfiles_estudiantes SET nombre = COALESCE(nombre_completo, '');

ALTER TABLE perfiles_estudiantes DROP COLUMN nombre_completo;

ALTER TABLE perfiles_estudiantes
  ADD COLUMN nombre_completo VARCHAR(255) GENERATED ALWAYS AS (
    TRIM(CONCAT_WS(' ', NULLIF(nombre, ''), NULLIF(apellido_paterno, ''), apellido_materno))
  ) STORED;
