-- Migration 30: Sistema de reportes de contenido

CREATE TABLE IF NOT EXISTS reportes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  reportado_por   INT NOT NULL,
  tipo            ENUM('publicacion', 'comentario', 'perfil') NOT NULL,
  referencia_id   INT NOT NULL,
  motivo          ENUM('spam', 'contenido_inapropiado', 'acoso', 'informacion_falsa', 'otro') NOT NULL,
  descripcion     VARCHAR(500),
  estado          ENUM('pendiente', 'revisado', 'resuelto', 'descartado') DEFAULT 'pendiente',
  creado_en       DATETIME DEFAULT NOW(),
  revisado_en     DATETIME,
  revisado_por    INT,
  FOREIGN KEY (reportado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY uq_reporte (reportado_por, tipo, referencia_id)
);
