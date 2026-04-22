-- ============================================================
-- EmpleaMe — Esquema completo normalizado (4FN)
-- Base: todas las migraciones 01–30 consolidadas
--
-- Cambios respecto al esquema anterior (normalización 4FN):
--   1. Nueva tabla `carreras`: reemplaza el ENUM carrera en
--      perfiles_estudiantes, eliminando la dependencia multivaluada
--      potencial y el acoplamiento al esquema.
--   2. Nueva tabla `cv_seleccion_experiencias`: reemplaza la columna
--      cv_experiencias TEXT (JSON) en perfiles_estudiantes, que
--      almacenaba un atributo multivaluado en una sola celda
--      (violación directa de 4FN).
-- ============================================================

-- ── Orden de creación respeta dependencias de FK ─────────────

-- 1. Usuarios (raíz de todo)
CREATE TABLE IF NOT EXISTS usuarios (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  correo           VARCHAR(150) UNIQUE NOT NULL,
  contrasena_hash  VARCHAR(255) NOT NULL,
  rol              ENUM('estudiante', 'empresa', 'centro') NOT NULL,
  fecha_creacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Carreras (catálogo — reemplaza ENUM en perfiles_estudiantes)
CREATE TABLE IF NOT EXISTS carreras (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE
);

-- 3. Perfiles de estudiantes
CREATE TABLE IF NOT EXISTS perfiles_estudiantes (
  usuario_id           INT PRIMARY KEY,
  nombre_completo      VARCHAR(150) NOT NULL,
  rut                  VARCHAR(12)  DEFAULT NULL,
  carrera_id           INT          DEFAULT NULL,
  semestre             SMALLINT     DEFAULT NULL,
  promedio             DECIMAL(3,1) DEFAULT NULL,
  calificacion_docente DECIMAL(3,1) DEFAULT NULL,
  telefono             VARCHAR(20)  DEFAULT NULL,
  biografia            TEXT,
  estado_civil         ENUM('soltero','casado','divorciado','viudo','conviviente civil') DEFAULT NULL,
  region               VARCHAR(80)  DEFAULT NULL,
  comuna               VARCHAR(80)  DEFAULT NULL,
  foto_perfil          VARCHAR(500) DEFAULT NULL,
  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
  FOREIGN KEY (carrera_id)  REFERENCES carreras(id)  ON DELETE SET NULL
);

-- 4. Perfiles de empresas
CREATE TABLE IF NOT EXISTS perfiles_empresas (
  usuario_id         INT PRIMARY KEY,
  nombre_empresa     VARCHAR(150) NOT NULL,
  telefono_contacto  VARCHAR(20)  DEFAULT NULL,
  descripcion        TEXT,
  region             VARCHAR(80)  DEFAULT NULL,
  comuna             VARCHAR(80)  DEFAULT NULL,
  foto_perfil        VARCHAR(500) DEFAULT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 5. Catálogo de habilidades
CREATE TABLE IF NOT EXISTS habilidades (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(100) NOT NULL,
  categoria ENUM('tecnica', 'blanda') NOT NULL
);

-- 6. Habilidades del estudiante
CREATE TABLE IF NOT EXISTS habilidades_estudiantes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  habilidad_id  INT NOT NULL,
  nivel_dominio ENUM('Basico','Intermedio','Avanzado') DEFAULT NULL,
  porcentaje    TINYINT DEFAULT NULL,
  esta_validada BOOLEAN DEFAULT FALSE,
  UNIQUE KEY uq_estudiante_habilidad (estudiante_id, habilidad_id),
  FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (habilidad_id)  REFERENCES habilidades(id)                  ON DELETE CASCADE
);

-- 7. Vacantes
CREATE TABLE IF NOT EXISTS vacantes (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id     INT NOT NULL,
  titulo         VARCHAR(150) NOT NULL,
  descripcion    TEXT NOT NULL,
  requisitos     TEXT,
  esta_activa    BOOLEAN DEFAULT TRUE,
  tipo           ENUM('practica','puesto_laboral') DEFAULT 'practica',
  area           VARCHAR(100) DEFAULT NULL,
  modalidad      ENUM('presencial','remoto','hibrido') DEFAULT 'presencial',
  duracion       VARCHAR(100) DEFAULT NULL,
  horario        VARCHAR(150) DEFAULT NULL,
  remuneracion   VARCHAR(100) DEFAULT NULL,
  direccion      VARCHAR(200) DEFAULT NULL,
  beneficios     TEXT DEFAULT NULL,
  fecha_limite   DATE DEFAULT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES perfiles_empresas(usuario_id) ON DELETE CASCADE
);

-- 9. Postulaciones
CREATE TABLE IF NOT EXISTS postulaciones (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  vacante_id       INT NOT NULL,
  estudiante_id    INT NOT NULL,
  estado           ENUM('pendiente','aceptado','rechazado','completado') DEFAULT 'pendiente',
  fecha_completada TIMESTAMP DEFAULT NULL,
  fecha_creacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_postulacion (vacante_id, estudiante_id),
  FOREIGN KEY (vacante_id)    REFERENCES vacantes(id)                         ON DELETE CASCADE,
  FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id)     ON DELETE CASCADE
);

-- 10. Historial académico
CREATE TABLE IF NOT EXISTS historial_academico (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  institucion   VARCHAR(150) NOT NULL,
  titulo        VARCHAR(150) NOT NULL,
  area          VARCHAR(100) DEFAULT NULL,
  fecha_inicio  YEAR DEFAULT NULL,
  fecha_fin     YEAR DEFAULT NULL,
  FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE
);

-- 11. Historial laboral
CREATE TABLE IF NOT EXISTS historial_laboral (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id  INT NOT NULL,
  empresa_nombre VARCHAR(150) NOT NULL,
  cargo          VARCHAR(150) NOT NULL,
  fecha_inicio   DATE DEFAULT NULL,
  fecha_fin      DATE DEFAULT NULL,
  descripcion    TEXT DEFAULT NULL,
  tipo           ENUM('verificado','practica_completada') NOT NULL DEFAULT 'verificado',
  postulacion_id INT DEFAULT NULL,
  FOREIGN KEY (estudiante_id)  REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (postulacion_id) REFERENCES postulaciones(id)                ON DELETE SET NULL
);

-- 12. Selección de experiencias para el CV  ← NUEVO (reemplaza cv_experiencias TEXT/JSON)
--     Cada fila indica que el estudiante eligió esa experiencia laboral para su CV.
--     Un estudiante puede seleccionar múltiples experiencias; una experiencia puede
--     aparecer en el CV de un solo estudiante → relación normalizada, sin MVD.
CREATE TABLE IF NOT EXISTS cv_seleccion_experiencias (
  estudiante_id  INT NOT NULL,
  experiencia_id INT NOT NULL,
  PRIMARY KEY (estudiante_id, experiencia_id),
  FOREIGN KEY (estudiante_id)  REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (experiencia_id) REFERENCES historial_laboral(id)            ON DELETE CASCADE
);

-- 13. Catálogo de tipos de publicación
CREATE TABLE IF NOT EXISTS tipos_publicacion (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(200)
);

-- 14. Publicaciones (feed)
CREATE TABLE IF NOT EXISTS publicaciones (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  autor_id       INT NOT NULL,
  tipo_id        INT NOT NULL,
  vacante_id     INT NULL,
  titulo         VARCHAR(200) NOT NULL,
  contenido      TEXT,
  url_multimedia VARCHAR(500) DEFAULT NULL,
  publicado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  esta_activa    BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (autor_id)   REFERENCES usuarios(id)         ON DELETE CASCADE,
  FOREIGN KEY (tipo_id)    REFERENCES tipos_publicacion(id),
  FOREIGN KEY (vacante_id) REFERENCES vacantes(id)         ON DELETE SET NULL
);

-- 15. Etiquetas de habilidades en publicaciones
CREATE TABLE IF NOT EXISTS publicacion_etiquetas (
  publicacion_id INT NOT NULL,
  habilidad_id   INT NOT NULL,
  relevancia     TINYINT NOT NULL DEFAULT 3,
  PRIMARY KEY (publicacion_id, habilidad_id),
  FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (habilidad_id)   REFERENCES habilidades(id)   ON DELETE CASCADE
);

-- 16. Likes en publicaciones
CREATE TABLE IF NOT EXISTS publicacion_likes (
  publicacion_id INT NOT NULL,
  usuario_id     INT NOT NULL,
  creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (publicacion_id, usuario_id),
  FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id)     REFERENCES usuarios(id)      ON DELETE CASCADE
);

-- 17. Comentarios en publicaciones
CREATE TABLE IF NOT EXISTS comentarios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  publicacion_id INT NOT NULL,
  autor_id       INT NOT NULL,
  contenido      TEXT NOT NULL,
  creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (autor_id)       REFERENCES usuarios(id)      ON DELETE CASCADE
);

-- 18. Conversaciones empresa ↔ estudiante
CREATE TABLE IF NOT EXISTS conversaciones (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id    INT NOT NULL,
  estudiante_id INT NOT NULL,
  creada_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_conv (empresa_id, estudiante_id),
  FOREIGN KEY (empresa_id)    REFERENCES perfiles_empresas(usuario_id)    ON DELETE CASCADE,
  FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE
);

-- 19. Mensajes en conversaciones empresa ↔ estudiante
CREATE TABLE IF NOT EXISTS mensajes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversacion_id INT NOT NULL,
  remitente_id    INT NOT NULL,
  contenido       TEXT NOT NULL,
  enviado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  leido           BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (remitente_id)    REFERENCES usuarios(id)       ON DELETE CASCADE
);

-- 20. Supervisión de conversaciones por el admin
CREATE TABLE IF NOT EXISTS supervision_mensajes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversacion_id INT NOT NULL,
  admin_id        INT NOT NULL,
  revisado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  nota_admin      TEXT,
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id)        REFERENCES usuarios(id)       ON DELETE CASCADE
);

-- 21. Notas del admin sobre conversaciones
CREATE TABLE IF NOT EXISTS notas_admin (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversacion_id INT NOT NULL,
  admin_id        INT NOT NULL,
  contenido       TEXT NOT NULL,
  actualizado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id)        REFERENCES usuarios(id)       ON DELETE CASCADE
);

-- 22. Conversaciones directas entre usuarios (estudiante ↔ estudiante)
--     usuario1_id < usuario2_id siempre para evitar duplicados
CREATE TABLE IF NOT EXISTS conversaciones_directas (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario1_id INT NOT NULL,
  usuario2_id INT NOT NULL,
  creada_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_directa (usuario1_id, usuario2_id),
  FOREIGN KEY (usuario1_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario2_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 23. Mensajes directos
CREATE TABLE IF NOT EXISTS mensajes_directos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversacion_id INT NOT NULL,
  remitente_id    INT NOT NULL,
  contenido       TEXT NOT NULL,
  enviado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  leido           BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones_directas(id) ON DELETE CASCADE,
  FOREIGN KEY (remitente_id)    REFERENCES usuarios(id)                ON DELETE CASCADE
);

-- 24. Evaluaciones docentes (header)
CREATE TABLE IF NOT EXISTS evaluaciones (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  evaluador_id  INT NOT NULL,
  periodo       VARCHAR(20) NOT NULL,
  observaciones TEXT,
  creada_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (evaluador_id)  REFERENCES usuarios(id)                     ON DELETE CASCADE
);

-- 25. Puntaje por habilidad dentro de una evaluación
CREATE TABLE IF NOT EXISTS evaluacion_habilidades (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  evaluacion_id INT NOT NULL,
  habilidad_id  INT NOT NULL,
  puntaje       TINYINT NOT NULL,
  CONSTRAINT chk_puntaje CHECK (puntaje BETWEEN 1 AND 5),
  FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id)  ON DELETE CASCADE,
  FOREIGN KEY (habilidad_id)  REFERENCES habilidades(id)   ON DELETE CASCADE
);

-- 26. Resultados de tests socioemocionales
CREATE TABLE IF NOT EXISTS test_resultados (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  test_nombre        VARCHAR(200) NOT NULL,
  estudiante_id      INT NOT NULL,
  evaluador_id       INT NOT NULL,
  nota_observaciones TEXT,
  registrado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (evaluador_id)  REFERENCES usuarios(id)                     ON DELETE CASCADE
);

-- 27. Dimensiones dentro de un resultado de test
CREATE TABLE IF NOT EXISTS test_resultado_dimensiones (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  resultado_id     INT NOT NULL,
  dimension_nombre VARCHAR(100) NOT NULL,
  puntaje          INT NOT NULL,
  FOREIGN KEY (resultado_id) REFERENCES test_resultados(id) ON DELETE CASCADE
);

-- 28. Idiomas del estudiante
CREATE TABLE IF NOT EXISTS idiomas_estudiantes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  idioma        VARCHAR(80) NOT NULL,
  nivel         ENUM('Básico','Intermedio','Avanzado','Nativo') NOT NULL DEFAULT 'Básico',
  UNIQUE KEY uq_idioma_estudiante (estudiante_id, idioma),
  FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE
);

-- 29. Notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id   INT NOT NULL,
  tipo         VARCHAR(40) NOT NULL,
  titulo       VARCHAR(200) NOT NULL,
  contenido    TEXT,
  leida        BOOLEAN DEFAULT FALSE,
  referencia_id INT DEFAULT NULL,
  creada_en    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_usuario (usuario_id, leida, creada_en DESC),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 30. Talleres (publicados por el centro)
CREATE TABLE IF NOT EXISTS talleres (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  titulo             VARCHAR(200) NOT NULL,
  descripcion        TEXT,
  requisitos         TEXT,
  area               VARCHAR(100),
  modalidad          ENUM('presencial','remoto','hibrido') DEFAULT 'presencial',
  duracion           VARCHAR(100),
  horario            VARCHAR(100),
  costo              DECIMAL(10,2) DEFAULT 0.00,
  direccion          VARCHAR(200),
  fecha_inicio       DATE,
  fecha_limite       DATE,
  cupos              INT,
  esta_activo        BOOLEAN DEFAULT TRUE,
  permite_inscripcion BOOLEAN DEFAULT TRUE,
  url_multimedia     VARCHAR(500) DEFAULT NULL,
  creado_en          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 31. Inscripciones a talleres
CREATE TABLE IF NOT EXISTS inscripciones_talleres (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  taller_id     INT NOT NULL,
  estudiante_id INT NOT NULL,
  estado        ENUM('pendiente','aceptado','rechazado') NOT NULL DEFAULT 'pendiente',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_inscripcion (taller_id, estudiante_id),
  FOREIGN KEY (taller_id)     REFERENCES talleres(id)                        ON DELETE CASCADE,
  FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id)    ON DELETE CASCADE
);

-- 32. Habilidades requeridas por una vacante
CREATE TABLE IF NOT EXISTS vacante_habilidades (
  vacante_id   INT NOT NULL,
  habilidad_id INT NOT NULL,
  PRIMARY KEY (vacante_id, habilidad_id),
  FOREIGN KEY (vacante_id)   REFERENCES vacantes(id)    ON DELETE CASCADE,
  FOREIGN KEY (habilidad_id) REFERENCES habilidades(id) ON DELETE CASCADE
);

-- 33. Seguidores entre usuarios
CREATE TABLE IF NOT EXISTS seguidores (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  seguido_id  INT NOT NULL,
  seguidor_id INT NOT NULL,
  creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_seguidor_seguido (seguidor_id, seguido_id),
  INDEX idx_seguido  (seguido_id),
  INDEX idx_seguidor (seguidor_id),
  FOREIGN KEY (seguido_id)  REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (seguidor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 34. Palabras prohibidas (moderación)
CREATE TABLE IF NOT EXISTS palabras_prohibidas (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  palabra   VARCHAR(100) NOT NULL UNIQUE,
  creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 35. Resúmenes IA de postulantes por vacante
CREATE TABLE IF NOT EXISTS resumenes_ia (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  vacante_id    INT NOT NULL,
  resumen       TEXT NOT NULL,
  perfil_hash   VARCHAR(64) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_estudiante_vacante (estudiante_id, vacante_id),
  FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (vacante_id)    REFERENCES vacantes(id)                     ON DELETE CASCADE
);

-- 36. Rankings IA por vacante
CREATE TABLE IF NOT EXISTS rankings_ia (
  vacante_id    INT PRIMARY KEY,
  ranking       MEDIUMTEXT NOT NULL,
  ranking_hash  VARCHAR(64) NOT NULL,
  generado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vacante_id) REFERENCES vacantes(id) ON DELETE CASCADE
);

-- 37. Reportes de contenido
CREATE TABLE IF NOT EXISTS reportes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  reportado_por INT NOT NULL,
  tipo          ENUM('publicacion','comentario','perfil') NOT NULL,
  referencia_id INT NOT NULL,
  motivo        ENUM('spam','contenido_inapropiado','acoso','informacion_falsa','otro') NOT NULL,
  descripcion   VARCHAR(500),
  estado        ENUM('pendiente','revisado','resuelto','descartado') DEFAULT 'pendiente',
  creado_en     DATETIME DEFAULT NOW(),
  revisado_en   DATETIME,
  revisado_por  INT,
  UNIQUE KEY uq_reporte (reportado_por, tipo, referencia_id),
  FOREIGN KEY (reportado_por) REFERENCES usuarios(id) ON DELETE CASCADE
);
