-- Migration 15: Talleres (publicados por admin)
CREATE TABLE IF NOT EXISTS talleres (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  titulo       VARCHAR(200) NOT NULL,
  descripcion  TEXT,
  requisitos   TEXT,
  area         VARCHAR(100),
  modalidad    ENUM('presencial','remoto','hibrido') DEFAULT 'presencial',
  duracion     VARCHAR(100),
  horario      VARCHAR(100),
  costo        DECIMAL(10,2) DEFAULT 0.00,
  direccion    VARCHAR(200),
  fecha_inicio DATE,
  fecha_limite DATE,
  cupos        INT,
  esta_activo  BOOLEAN DEFAULT TRUE,
  creado_en    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
