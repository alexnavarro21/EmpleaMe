CREATE TABLE IF NOT EXISTS notas_admin (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  conversacion_id INT NOT NULL,
  admin_id        INT NOT NULL,
  contenido       TEXT NOT NULL,
  actualizado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_conv_admin (conversacion_id, admin_id),
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id)        REFERENCES usuarios(id)       ON DELETE CASCADE
);
