-- Migración: agregar campo tipo a vacantes
-- Permite distinguir entre práctica profesional y puesto laboral

ALTER TABLE vacantes
  ADD COLUMN tipo ENUM('practica', 'puesto_laboral') NOT NULL DEFAULT 'practica'
  AFTER empresa_id;
