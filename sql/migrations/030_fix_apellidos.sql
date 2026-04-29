-- 030: Repartir correctamente el nombre completo en nombre / apellido_paterno / apellido_materno
-- El campo nombre contiene actualmente el nombre_completo heredado (ej: "Juan Pérez Torres")

-- Asegurar que apellido_paterno no sea nullable
ALTER TABLE perfiles_estudiantes
  MODIFY COLUMN apellido_paterno VARCHAR(100) NOT NULL DEFAULT '';

-- Separar: palabra 1 → nombre, palabra 2 → apellido_paterno, palabra 3+ → apellido_materno
UPDATE perfiles_estudiantes
SET
  apellido_materno = CASE
    WHEN nombre LIKE '% % %'
    THEN TRIM(SUBSTRING(nombre, CHAR_LENGTH(SUBSTRING_INDEX(nombre, ' ', 2)) + 2))
    ELSE NULL
  END,
  apellido_paterno = CASE
    WHEN nombre LIKE '% %'
    THEN TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(nombre, ' ', 2), ' ', -1))
    ELSE ''
  END,
  nombre = TRIM(SUBSTRING_INDEX(nombre, ' ', 1));
