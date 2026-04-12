-- Migration 17: Inscripciones a talleres
-- Los estudiantes pueden inscribirse a talleres igual que postulan a vacantes

CREATE TABLE IF NOT EXISTS inscripciones_talleres (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  taller_id     INT NOT NULL,
  estudiante_id INT NOT NULL,
  estado        ENUM('pendiente', 'aceptado', 'rechazado') NOT NULL DEFAULT 'pendiente',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_inscripcion (taller_id, estudiante_id),
  FOREIGN KEY (taller_id)     REFERENCES talleres(id)  ON DELETE CASCADE,
  FOREIGN KEY (estudiante_id) REFERENCES usuarios(id)  ON DELETE CASCADE
);
