-- Migración 25: Sistema de seguidores
-- Permite a estudiantes y empresas seguirse entre sí

CREATE TABLE IF NOT EXISTS seguidores (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  seguido_id  INT NOT NULL,   -- usuario que es seguido
  seguidor_id INT NOT NULL,   -- usuario que sigue
  creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (seguido_id)  REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (seguidor_id) REFERENCES usuarios(id) ON DELETE CASCADE,

  -- Evita duplicados: un usuario solo puede seguir a otro una vez
  UNIQUE KEY uk_seguidor_seguido (seguidor_id, seguido_id),

  INDEX idx_seguido  (seguido_id),
  INDEX idx_seguidor (seguidor_id)
);
