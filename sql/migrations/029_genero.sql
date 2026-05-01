-- 029: Agregar campo genero a perfiles_estudiantes
ALTER TABLE perfiles_estudiantes
  ADD COLUMN genero ENUM('masculino', 'femenino', 'otro', 'no_especifica') NOT NULL DEFAULT 'no_especifica';
