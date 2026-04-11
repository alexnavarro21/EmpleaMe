-- ============================================================
-- Migración 11: Perfil extendido del estudiante
-- - Estado civil
-- - Idiomas
-- - Historial académico
-- - Historial laboral (admin + prácticas completadas)
-- - Estado "completado" en postulaciones
-- ============================================================

-- 1. Estado civil en perfiles_estudiantes
ALTER TABLE perfiles_estudiantes
  ADD COLUMN estado_civil ENUM('soltero','casado','divorciado','viudo','conviviente civil')
  DEFAULT NULL AFTER biografia;

-- 2. Tabla de idiomas del estudiante
CREATE TABLE idiomas_estudiantes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  idioma        VARCHAR(80) NOT NULL,
  nivel         ENUM('Básico','Intermedio','Avanzado','Nativo') NOT NULL DEFAULT 'Básico',
  FOREIGN KEY (estudiante_id)
    REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE,
  UNIQUE KEY uq_idioma_estudiante (estudiante_id, idioma)
);

-- 3. Historial académico (cursos, títulos, estudios)
CREATE TABLE historial_academico (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  institucion   VARCHAR(150) NOT NULL,
  titulo        VARCHAR(150) NOT NULL,
  area          VARCHAR(100) DEFAULT NULL,
  fecha_inicio  YEAR         DEFAULT NULL,
  fecha_fin     YEAR         DEFAULT NULL,
  FOREIGN KEY (estudiante_id)
    REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE
);

-- 4. Historial laboral
CREATE TABLE historial_laboral (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id   INT NOT NULL,
  empresa_nombre  VARCHAR(150) NOT NULL,
  cargo           VARCHAR(150) NOT NULL,
  fecha_inicio    DATE DEFAULT NULL,
  fecha_fin       DATE DEFAULT NULL,
  descripcion     TEXT DEFAULT NULL,
  tipo            ENUM('verificado','practica_completada') NOT NULL DEFAULT 'verificado',
  postulacion_id  INT DEFAULT NULL,
  FOREIGN KEY (estudiante_id)
    REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (postulacion_id)
    REFERENCES postulaciones(id) ON DELETE SET NULL
);

-- 5. Ampliar estado de postulaciones para incluir "completado"
ALTER TABLE postulaciones
  MODIFY COLUMN estado
    ENUM('pendiente','aceptado','rechazado','completado') DEFAULT 'pendiente';

ALTER TABLE postulaciones
  ADD COLUMN fecha_completada TIMESTAMP DEFAULT NULL AFTER estado;
