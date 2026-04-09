USE railway;

-- ============================================================
-- MIGRACIÓN 03: Mensajería, supervisión y publicaciones
-- ============================================================

-- 1. Catálogo de tipos de publicación
CREATE TABLE IF NOT EXISTS tipos_publicacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

INSERT IGNORE INTO tipos_publicacion (nombre, descripcion) VALUES
    ('vacante',    'Publicación de una vacante o práctica profesional'),
    ('logro',      'Logro o insignia desbloqueada por un estudiante'),
    ('evaluacion', 'Resultado de evaluación docente'),
    ('match',      'Match entre estudiante y empresa'),
    ('general',    'Publicación general del centro o estudiante');

-- 2. Publicaciones (feed tipo red social)
CREATE TABLE IF NOT EXISTS publicaciones (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    autor_id       INT NOT NULL,
    tipo_id        INT NOT NULL,
    vacante_id     INT NULL,
    titulo         VARCHAR(200) NOT NULL,
    contenido      TEXT,
    url_multimedia VARCHAR(255) NULL,
    publicado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    esta_activa    BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (autor_id)   REFERENCES usuarios(id)          ON DELETE CASCADE,
    FOREIGN KEY (tipo_id)    REFERENCES tipos_publicacion(id),
    FOREIGN KEY (vacante_id) REFERENCES vacantes(id)          ON DELETE SET NULL
);

-- 3. Etiquetas de habilidades en publicaciones
CREATE TABLE IF NOT EXISTS publicacion_etiquetas (
    publicacion_id INT NOT NULL,
    habilidad_id   INT NOT NULL,
    relevancia     TINYINT NOT NULL DEFAULT 3,
    PRIMARY KEY (publicacion_id, habilidad_id),
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id)  ON DELETE CASCADE,
    FOREIGN KEY (habilidad_id)   REFERENCES habilidades(id)    ON DELETE CASCADE
);

-- 4. Conversaciones entre empresa y estudiante
CREATE TABLE IF NOT EXISTS conversaciones (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id    INT NOT NULL,
    estudiante_id INT NOT NULL,
    creada_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_conv (empresa_id, estudiante_id),
    FOREIGN KEY (empresa_id)    REFERENCES perfiles_empresas(usuario_id)    ON DELETE CASCADE,
    FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE
);

-- 5. Mensajes dentro de una conversación
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

-- 6. Supervisión de conversaciones por el admin/centro
CREATE TABLE IF NOT EXISTS supervision_mensajes (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    conversacion_id INT NOT NULL,
    admin_id        INT NOT NULL,
    revisado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nota_admin      TEXT,
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id)        REFERENCES usuarios(id)       ON DELETE CASCADE
);
