-- Migration 13: Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  tipo        VARCHAR(40) NOT NULL,
  titulo      VARCHAR(200) NOT NULL,
  contenido   TEXT,
  leida       BOOLEAN DEFAULT FALSE,
  creada_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_notif_usuario ON notificaciones (usuario_id, leida, creada_en DESC);
