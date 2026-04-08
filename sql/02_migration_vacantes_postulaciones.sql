USE railway;

-- ============================================================
-- MIGRACIÓN 02: Campos faltantes en vacantes y perfiles_estudiantes
--               + tabla postulaciones
-- ============================================================

-- 1. Nuevos campos en perfiles_estudiantes
ALTER TABLE perfiles_estudiantes
  ADD COLUMN semestre SMALLINT DEFAULT NULL,
  ADD COLUMN promedio DECIMAL(3,1) DEFAULT NULL,
  ADD COLUMN calificacion_docente DECIMAL(3,1) DEFAULT NULL;

-- 2. Nuevos campos en vacantes
ALTER TABLE vacantes
  ADD COLUMN area VARCHAR(100) DEFAULT NULL,
  ADD COLUMN modalidad ENUM('presencial', 'remoto', 'hibrido') DEFAULT 'presencial',
  ADD COLUMN duracion VARCHAR(100) DEFAULT NULL,
  ADD COLUMN horario VARCHAR(150) DEFAULT NULL,
  ADD COLUMN remuneracion VARCHAR(100) DEFAULT NULL,
  ADD COLUMN direccion VARCHAR(200) DEFAULT NULL,
  ADD COLUMN beneficios TEXT DEFAULT NULL,
  ADD COLUMN fecha_limite DATE DEFAULT NULL;

-- 3. Tabla de postulaciones
CREATE TABLE postulaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vacante_id INT NOT NULL,
    estudiante_id INT NOT NULL,
    estado ENUM('pendiente', 'aceptado', 'rechazado') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_postulacion (vacante_id, estudiante_id),
    FOREIGN KEY (vacante_id) REFERENCES vacantes(id) ON DELETE CASCADE,
    FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE
);
