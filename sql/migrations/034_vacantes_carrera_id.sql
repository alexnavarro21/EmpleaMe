-- Migración 034: vacantes.area → vacantes.carrera_id (FK a carreras)

-- Insertar áreas únicas de vacantes como nuevas carreras
INSERT IGNORE INTO carreras (nombre)
SELECT DISTINCT area FROM vacantes WHERE area IS NOT NULL AND area != '';

-- Agregar columna carrera_id
ALTER TABLE vacantes ADD COLUMN carrera_id INT DEFAULT NULL AFTER empresa_id;

-- Migrar datos existentes
UPDATE vacantes v
JOIN carreras c ON c.nombre = v.area
SET v.carrera_id = c.id;

-- FK
ALTER TABLE vacantes ADD CONSTRAINT fk_vacante_carrera
  FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL;

-- Eliminar columna area
ALTER TABLE vacantes DROP COLUMN area;
