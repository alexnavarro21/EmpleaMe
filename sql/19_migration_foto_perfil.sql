-- Migración 19: agregar columna foto_perfil a perfiles de estudiantes y empresas

ALTER TABLE perfiles_estudiantes
  ADD COLUMN foto_perfil VARCHAR(500) NULL;

ALTER TABLE perfiles_empresas
  ADD COLUMN foto_perfil VARCHAR(500) NULL;
