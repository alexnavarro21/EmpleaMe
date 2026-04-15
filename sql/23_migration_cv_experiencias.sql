-- Guarda los IDs de experiencias laborales seleccionadas para el CV (JSON array)
ALTER TABLE perfiles_estudiantes
  ADD COLUMN cv_experiencias TEXT NULL;
