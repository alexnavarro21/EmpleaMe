-- Migration 14: Me gusta en publicaciones
CREATE TABLE IF NOT EXISTS publicacion_likes (
  publicacion_id INT NOT NULL,
  usuario_id     INT NOT NULL,
  creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (publicacion_id, usuario_id),
  FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id)     REFERENCES usuarios(id)      ON DELETE CASCADE
);
