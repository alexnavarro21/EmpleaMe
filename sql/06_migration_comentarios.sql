USE railway;

-- ============================================================
-- MIGRACIÓN 06: Comentarios en publicaciones
-- ============================================================

CREATE TABLE IF NOT EXISTS comentarios (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    publicacion_id INT NOT NULL,
    autor_id       INT NOT NULL,
    contenido      TEXT NOT NULL,
    creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (autor_id)       REFERENCES usuarios(id)      ON DELETE CASCADE
);
