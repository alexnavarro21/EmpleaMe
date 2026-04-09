USE railway;

-- ============================================================
-- MIGRACIÓN 05: Soporte de archivos multimedia en publicaciones
-- ============================================================

-- 1. Agregar columna de URL multimedia a la tabla de publicaciones
ALTER TABLE publicaciones
    ADD COLUMN url_multimedia VARCHAR(255) NULL AFTER contenido;

-- 2. Eliminar la tabla de archivos adjuntos (reemplazada por url_multimedia)
DROP TABLE IF EXISTS archivos_publicacion;
