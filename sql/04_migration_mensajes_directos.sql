USE railway;

-- ============================================================
-- MIGRACIÓN 04: Mensajes directos entre estudiantes
-- ============================================================

-- Conversaciones entre cualquier par de usuarios (estudiante↔estudiante)
-- usuario1_id siempre es el menor de los dos IDs para evitar duplicados
CREATE TABLE IF NOT EXISTS conversaciones_directas (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    usuario1_id  INT NOT NULL,
    usuario2_id  INT NOT NULL,
    creada_en    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_directa (usuario1_id, usuario2_id),
    FOREIGN KEY (usuario1_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario2_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Mensajes dentro de conversaciones directas
CREATE TABLE IF NOT EXISTS mensajes_directos (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    conversacion_id INT NOT NULL,
    remitente_id    INT NOT NULL,
    contenido       TEXT NOT NULL,
    enviado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leido           BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones_directas(id) ON DELETE CASCADE,
    FOREIGN KEY (remitente_id)    REFERENCES usuarios(id)               ON DELETE CASCADE
);
