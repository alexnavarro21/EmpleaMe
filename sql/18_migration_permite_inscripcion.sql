-- Migration 18: permite_inscripcion en talleres
-- Algunos talleres son externos/recomendados; en esos casos no se acepta inscripción directa.
ALTER TABLE talleres
  ADD COLUMN permite_inscripcion BOOLEAN NOT NULL DEFAULT TRUE;
