-- ============================================================
-- EmpleaMe — Esquema completo normalizado (5FN)
-- Consolida todas las migraciones 01–033 + cambios de 5FN.
--
-- Cambios respecto al esquema 4FN anterior:
--   1. Nueva tabla `categorias_habilidades`: reemplaza el ENUM
--      `habilidades.categoria`, eliminando el acoplamiento de
--      valores de dominio al DDL.
--   2. Nueva tabla `publicaciones_vacantes`: extrae la relación
--      opcional publicacion↔vacante de la tabla publicaciones
--      (FK nullable → tabla de asociación).
--   3. Nueva tabla `historial_laboral_postulaciones`: extrae la
--      relación opcional historial_laboral↔postulacion
--      (FK nullable → tabla de asociación).
--   4. Nuevas tablas `reportes_publicaciones`, `reportes_comentarios`,
--      `reportes_perfiles`: reemplazan el patrón polimórfico
--      (tipo+referencia_id) con FKs reales por tipo.
--   5. Corregida FK de `talleres.colegio_id` para apuntar a
--      `perfiles_colegios(usuario_id)` en lugar de `usuarios(id)`.
--   6. Consolidadas migraciones 027–033:
--      - usuarios.creado_por (027)
--      - perfiles_estudiantes: nombre/apellidos split + GENERATED
--        nombre_completo (028), genero (029), nivel ENUM (031)
--      - tabla colegio_carreras (032)
--      - perfiles_colegios.slep_id (033 — ya estaba en 4FN)
-- ============================================================

-- ── Orden de creación respeta dependencias de FK ─────────────

-- 1. Usuarios (raíz de todo)
CREATE TABLE IF NOT EXISTS usuarios (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  correo           VARCHAR(150) UNIQUE NULL,
  rut              VARCHAR(12)  UNIQUE NULL,
  contrasena_hash  VARCHAR(255) NOT NULL,
  rol              ENUM('estudiante', 'empresa', 'colegio', 'slep') NOT NULL,
  fecha_creacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  creado_por       INT DEFAULT NULL,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 2. Carreras (catálogo)
CREATE TABLE IF NOT EXISTS carreras (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE
);

-- 3. Categorías de habilidades (catálogo — reemplaza ENUM en habilidades)
CREATE TABLE IF NOT EXISTS categorias_habilidades (
  id     TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

-- 4a. Perfiles SLEP
CREATE TABLE IF NOT EXISTS perfiles_slep (
  usuario_id        INT PRIMARY KEY,
  nombre_organismo  VARCHAR(150) NOT NULL DEFAULT 'SLEP',
  telefono_contacto VARCHAR(20)  DEFAULT NULL,
  descripcion       TEXT,
  region            VARCHAR(80)  DEFAULT NULL,
  foto_perfil       VARCHAR(500) DEFAULT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 4b. Perfiles de colegios
CREATE TABLE IF NOT EXISTS perfiles_colegios (
  usuario_id        INT PRIMARY KEY,
  slep_id           INT          DEFAULT NULL,
  nombre_institucion VARCHAR(150) NOT NULL,
  telefono_contacto VARCHAR(20)  DEFAULT NULL,
  descripcion       TEXT,
  region            VARCHAR(80)  DEFAULT NULL,
  comuna            VARCHAR(80)  DEFAULT NULL,
  foto_perfil       VARCHAR(500) DEFAULT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)         ON DELETE CASCADE,
  FOREIGN KEY (slep_id)    REFERENCES perfiles_slep(usuario_id) ON DELETE SET NULL
);

-- 5. Perfiles de estudiantes
--    nombre_completo es columna GENERADA a partir de los tres campos de nombre.
CREATE TABLE IF NOT EXISTS perfiles_estudiantes (
  usuario_id           INT PRIMARY KEY,
  nombre               VARCHAR(80)  NOT NULL DEFAULT '',
  apellido_paterno     VARCHAR(80)  NOT NULL DEFAULT '',
  apellido_materno     VARCHAR(80)  DEFAULT NULL,
  nombre_completo      VARCHAR(250) GENERATED ALWAYS AS (
                         TRIM(CONCAT_WS(' ',
                           NULLIF(TRIM(nombre), ''),
                           NULLIF(TRIM(apellido_paterno), ''),
                           NULLIF(TRIM(apellido_materno), '')
                         ))
                       ) STORED,
  rut                  VARCHAR(12)  DEFAULT NULL,
  carrera_id           INT          DEFAULT NULL,
  colegio_id           INT          DEFAULT NULL,
  nivel                ENUM('1° Medio','2° Medio','3° Medio','4° Medio') DEFAULT NULL,
  promedio             DECIMAL(3,1) DEFAULT NULL,
  calificacion_docente DECIMAL(3,1) DEFAULT NULL,
  telefono             VARCHAR(20)  DEFAULT NULL,
  biografia            TEXT,
  estado_civil         ENUM('soltero','casado','divorciado','viudo','conviviente civil') DEFAULT NULL,
  genero               ENUM('masculino','femenino','otro','no_especifica') DEFAULT 'no_especifica',
  region               VARCHAR(80)  DEFAULT NULL,
  comuna               VARCHAR(80)  DEFAULT NULL,
  foto_perfil          VARCHAR(500) DEFAULT NULL,
  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)                  ON DELETE CASCADE,
  FOREIGN KEY (carrera_id)  REFERENCES carreras(id)                  ON DELETE SET NULL,
  FOREIGN KEY (colegio_id)  REFERENCES perfiles_colegios(usuario_id) ON DELETE SET NULL
);

-- 6. Perfiles de empresas
CREATE TABLE IF NOT EXISTS perfiles_empresas (
  usuario_id        INT PRIMARY KEY,
  nombre_empresa    VARCHAR(150) NOT NULL,
  telefono_contacto VARCHAR(20)  DEFAULT NULL,
  descripcion       TEXT,
  region            VARCHAR(80)  DEFAULT NULL,
  comuna            VARCHAR(80)  DEFAULT NULL,
  foto_perfil       VARCHAR(500) DEFAULT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 7. Catálogo de habilidades (categoria → FK a categorias_habilidades)
CREATE TABLE IF NOT EXISTS habilidades (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL,
  categoria_id TINYINT UNSIGNED NOT NULL,
  FOREIGN KEY (categoria_id) REFERENCES categorias_habilidades(id)
);

-- 8. Habilidades del estudiante
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

-- 9. Carreras impartidas por colegio (many-to-many)
CREATE TABLE IF NOT EXISTS colegio_carreras (
  colegio_id INT NOT NULL,
  carrera_id INT NOT NULL,
  PRIMARY KEY (colegio_id, carrera_id),
  FOREIGN KEY (colegio_id) REFERENCES perfiles_colegios(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (carrera_id) REFERENCES carreras(id)                  ON DELETE CASCADE
);

-- 10. Vacantes
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

-- 11. Postulaciones
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

-- 12. Historial académico
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

-- 13. Historial laboral (sin postulacion_id — extraído a tabla de asociación)
CREATE TABLE IF NOT EXISTS historial_laboral (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id  INT NOT NULL,
  empresa_nombre VARCHAR(150) NOT NULL,
  cargo          VARCHAR(150) NOT NULL,
  fecha_inicio   DATE DEFAULT NULL,
  fecha_fin      DATE DEFAULT NULL,
  descripcion    TEXT DEFAULT NULL,
  tipo           ENUM('verificado','practica_completada') NOT NULL DEFAULT 'verificado',
  FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE
);

-- 14. Asociación historial_laboral ↔ postulacion (5FN: extrae FK opcional)
--     Una entrada de historial puede originarse de una práctica completada.
CREATE TABLE IF NOT EXISTS historial_laboral_postulaciones (
  historial_id   INT PRIMARY KEY,
  postulacion_id INT NOT NULL UNIQUE,
  FOREIGN KEY (historial_id)   REFERENCES historial_laboral(id) ON DELETE CASCADE,
  FOREIGN KEY (postulacion_id) REFERENCES postulaciones(id)     ON DELETE CASCADE
);

-- 15. Selección de experiencias para el CV
CREATE TABLE IF NOT EXISTS cv_seleccion_experiencias (
  estudiante_id  INT NOT NULL,
  experiencia_id INT NOT NULL,
  PRIMARY KEY (estudiante_id, experiencia_id),
  FOREIGN KEY (estudiante_id)  REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (experiencia_id) REFERENCES historial_laboral(id)            ON DELETE CASCADE
);

-- 16. Catálogo de tipos de publicación
CREATE TABLE IF NOT EXISTS tipos_publicacion (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(200)
);

-- 17. Publicaciones (sin vacante_id — extraído a tabla de asociación)
CREATE TABLE IF NOT EXISTS publicaciones (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  autor_id       INT NOT NULL,
  tipo_id        INT NOT NULL,
  titulo         VARCHAR(200) NOT NULL,
  contenido      TEXT,
  url_multimedia VARCHAR(500) DEFAULT NULL,
  publicado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  esta_activa    BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (autor_id)  REFERENCES usuarios(id)         ON DELETE CASCADE,
  FOREIGN KEY (tipo_id)   REFERENCES tipos_publicacion(id)
);

-- 18. Asociación publicacion ↔ vacante (5FN: extrae FK opcional)
--     Solo las publicaciones de tipo 'vacante' tienen entrada aquí.
CREATE TABLE IF NOT EXISTS publicaciones_vacantes (
  publicacion_id INT PRIMARY KEY,
  vacante_id     INT NOT NULL,
  FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (vacante_id)     REFERENCES vacantes(id)      ON DELETE CASCADE
);

-- 19. Etiquetas de habilidades en publicaciones
CREATE TABLE IF NOT EXISTS publicacion_etiquetas (
  publicacion_id INT NOT NULL,
  habilidad_id   INT NOT NULL,
  relevancia     TINYINT NOT NULL DEFAULT 3,
  PRIMARY KEY (publicacion_id, habilidad_id),
  FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (habilidad_id)   REFERENCES habilidades(id)   ON DELETE CASCADE
);

-- 20. Likes en publicaciones
CREATE TABLE IF NOT EXISTS publicacion_likes (
  publicacion_id INT NOT NULL,
  usuario_id     INT NOT NULL,
  creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (publicacion_id, usuario_id),
  FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id)     REFERENCES usuarios(id)      ON DELETE CASCADE
);

-- 21. Comentarios en publicaciones
CREATE TABLE IF NOT EXISTS comentarios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  publicacion_id INT NOT NULL,
  autor_id       INT NOT NULL,
  contenido      TEXT NOT NULL,
  creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (autor_id)       REFERENCES usuarios(id)      ON DELETE CASCADE
);

-- 22. Conversaciones empresa ↔ estudiante
CREATE TABLE IF NOT EXISTS conversaciones (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id    INT NOT NULL,
  estudiante_id INT NOT NULL,
  creada_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_conv (empresa_id, estudiante_id),
  FOREIGN KEY (empresa_id)    REFERENCES perfiles_empresas(usuario_id)    ON DELETE CASCADE,
  FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE
);

-- 23. Mensajes en conversaciones empresa ↔ estudiante
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

-- 24. Supervisión de conversaciones por el admin
CREATE TABLE IF NOT EXISTS supervision_mensajes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversacion_id INT NOT NULL,
  admin_id        INT NOT NULL,
  revisado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  nota_admin      TEXT,
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id)        REFERENCES usuarios(id)       ON DELETE CASCADE
);

-- 25. Notas del admin sobre conversaciones
CREATE TABLE IF NOT EXISTS notas_admin (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversacion_id INT NOT NULL,
  admin_id        INT NOT NULL,
  contenido       TEXT NOT NULL,
  actualizado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id)        REFERENCES usuarios(id)       ON DELETE CASCADE
);

-- 26. Conversaciones directas entre usuarios (usuario1_id < usuario2_id siempre)
CREATE TABLE IF NOT EXISTS conversaciones_directas (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario1_id INT NOT NULL,
  usuario2_id INT NOT NULL,
  creada_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_directa (usuario1_id, usuario2_id),
  FOREIGN KEY (usuario1_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario2_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 27. Mensajes directos
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

-- 28. Evaluaciones docentes (encabezado)
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

-- 29. Puntaje por habilidad dentro de una evaluación
CREATE TABLE IF NOT EXISTS evaluacion_habilidades (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  evaluacion_id INT NOT NULL,
  habilidad_id  INT NOT NULL,
  puntaje       TINYINT NOT NULL,
  CONSTRAINT chk_puntaje CHECK (puntaje BETWEEN 1 AND 5),
  FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (habilidad_id)  REFERENCES habilidades(id)  ON DELETE CASCADE
);

-- 30. Resultados de tests socioemocionales
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

-- 31. Dimensiones dentro de un resultado de test
CREATE TABLE IF NOT EXISTS test_resultado_dimensiones (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  resultado_id     INT NOT NULL,
  dimension_nombre VARCHAR(100) NOT NULL,
  puntaje          INT NOT NULL,
  FOREIGN KEY (resultado_id) REFERENCES test_resultados(id) ON DELETE CASCADE
);

-- 32. Idiomas del estudiante
CREATE TABLE IF NOT EXISTS idiomas_estudiantes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  idioma        VARCHAR(80) NOT NULL,
  nivel         ENUM('Básico','Intermedio','Avanzado','Nativo') NOT NULL DEFAULT 'Básico',
  UNIQUE KEY uq_idioma_estudiante (estudiante_id, idioma),
  FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE
);

-- 33. Notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id    INT NOT NULL,
  tipo          VARCHAR(40) NOT NULL,
  titulo        VARCHAR(200) NOT NULL,
  contenido     TEXT,
  leida         BOOLEAN DEFAULT FALSE,
  referencia_id INT DEFAULT NULL,
  creada_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_usuario (usuario_id, leida, creada_en DESC),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 34. Talleres (FK corregida: colegio_id → perfiles_colegios en lugar de usuarios)
CREATE TABLE IF NOT EXISTS talleres (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  colegio_id          INT,
  titulo              VARCHAR(200) NOT NULL,
  descripcion         TEXT,
  requisitos          TEXT,
  area                VARCHAR(100),
  modalidad           ENUM('presencial','remoto','hibrido') DEFAULT 'presencial',
  duracion            VARCHAR(100),
  horario             VARCHAR(100),
  costo               DECIMAL(10,2) DEFAULT 0.00,
  direccion           VARCHAR(200),
  fecha_inicio        DATE,
  fecha_limite        DATE,
  cupos               INT,
  esta_activo         BOOLEAN DEFAULT TRUE,
  permite_inscripcion BOOLEAN DEFAULT TRUE,
  url_multimedia      VARCHAR(500) DEFAULT NULL,
  creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (colegio_id) REFERENCES perfiles_colegios(usuario_id) ON DELETE SET NULL
);

-- 35. Inscripciones a talleres
CREATE TABLE IF NOT EXISTS inscripciones_talleres (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  taller_id      INT NOT NULL,
  estudiante_id  INT NOT NULL,
  estado         ENUM('pendiente','aceptado','rechazado') NOT NULL DEFAULT 'pendiente',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_inscripcion (taller_id, estudiante_id),
  FOREIGN KEY (taller_id)     REFERENCES talleres(id)                        ON DELETE CASCADE,
  FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id)    ON DELETE CASCADE
);

-- 36. Habilidades requeridas por una vacante
CREATE TABLE IF NOT EXISTS vacante_habilidades (
  vacante_id   INT NOT NULL,
  habilidad_id INT NOT NULL,
  PRIMARY KEY (vacante_id, habilidad_id),
  FOREIGN KEY (vacante_id)   REFERENCES vacantes(id)    ON DELETE CASCADE,
  FOREIGN KEY (habilidad_id) REFERENCES habilidades(id) ON DELETE CASCADE
);

-- 37. Seguidores entre usuarios
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

-- 38. Palabras prohibidas (moderación)
CREATE TABLE IF NOT EXISTS palabras_prohibidas (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  palabra   VARCHAR(100) NOT NULL UNIQUE,
  creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 39. Resúmenes IA de postulantes por vacante
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

-- 40. Rankings IA por vacante
CREATE TABLE IF NOT EXISTS rankings_ia (
  vacante_id   INT PRIMARY KEY,
  ranking      MEDIUMTEXT NOT NULL,
  ranking_hash VARCHAR(64) NOT NULL,
  generado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vacante_id) REFERENCES vacantes(id) ON DELETE CASCADE
);

-- 41. Reportes de contenido (sin referencia_id — extraído a tablas tipo-específicas)
CREATE TABLE IF NOT EXISTS reportes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  reportado_por INT NOT NULL,
  tipo          ENUM('publicacion','comentario','perfil') NOT NULL,
  motivo        ENUM('spam','contenido_inapropiado','acoso','informacion_falsa','otro') NOT NULL,
  descripcion   VARCHAR(500),
  estado        ENUM('pendiente','revisado','resuelto','descartado') DEFAULT 'pendiente',
  creado_en     DATETIME DEFAULT NOW(),
  revisado_en   DATETIME,
  revisado_por  INT,
  FOREIGN KEY (reportado_por) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 42. Reporte sobre publicación (FK real a publicaciones)
CREATE TABLE IF NOT EXISTS reportes_publicaciones (
  reporte_id     INT PRIMARY KEY,
  publicacion_id INT NOT NULL,
  FOREIGN KEY (reporte_id)     REFERENCES reportes(id)      ON DELETE CASCADE,
  FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
);

-- 43. Reporte sobre comentario (FK real a comentarios)
CREATE TABLE IF NOT EXISTS reportes_comentarios (
  reporte_id    INT PRIMARY KEY,
  comentario_id INT NOT NULL,
  FOREIGN KEY (reporte_id)    REFERENCES reportes(id)    ON DELETE CASCADE,
  FOREIGN KEY (comentario_id) REFERENCES comentarios(id) ON DELETE CASCADE
);

-- 44. Reporte sobre perfil de usuario (FK real a usuarios)
CREATE TABLE IF NOT EXISTS reportes_perfiles (
  reporte_id INT PRIMARY KEY,
  usuario_id INT NOT NULL,
  FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
