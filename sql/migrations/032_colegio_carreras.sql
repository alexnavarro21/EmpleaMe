-- 032: Tabla de relación colegio ↔ carreras impartidas
CREATE TABLE IF NOT EXISTS colegio_carreras (
  colegio_id INT NOT NULL,
  carrera_id INT NOT NULL,
  PRIMARY KEY (colegio_id, carrera_id),
  FOREIGN KEY (colegio_id) REFERENCES perfiles_colegios(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE CASCADE
);
