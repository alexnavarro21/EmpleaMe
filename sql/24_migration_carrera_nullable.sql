-- Permite crear alumnos sin carrera asignada (la completan ellos al entrar)
ALTER TABLE perfiles_estudiantes
  MODIFY COLUMN carrera ENUM('Mecanica Automotriz', 'Administracion') NULL DEFAULT NULL;
