USE railway;

-- MIGRACIÓN 20: Permitir nivel_dominio NULL en habilidades_estudiantes
-- Las habilidades blandas usan porcentaje, no nivel_dominio — la columna debe ser nullable.
ALTER TABLE habilidades_estudiantes
  MODIFY COLUMN nivel_dominio ENUM('Basico', 'Intermedio', 'Avanzado') NULL DEFAULT NULL;
