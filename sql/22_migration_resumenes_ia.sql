-- Tabla para almacenar resúmenes IA de postulantes por vacante
-- perfil_hash permite detectar si el perfil cambió y regenerar el resumen
CREATE TABLE IF NOT EXISTS resumenes_ia (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id   INT NOT NULL,
  vacante_id      INT NOT NULL,
  resumen         TEXT NOT NULL,
  perfil_hash     VARCHAR(64) NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_estudiante_vacante (estudiante_id, vacante_id),
  FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (vacante_id)    REFERENCES vacantes(id) ON DELETE CASCADE
);
