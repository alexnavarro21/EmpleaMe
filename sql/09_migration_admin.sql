USE railway;

-- ============================================================
-- MIGRACIÓN 09: Tablas para evaluaciones docentes y resultados
--               de tests socioemocionales por estudiante
-- ============================================================

-- 1. Evaluaciones docentes (header)
CREATE TABLE evaluaciones (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    evaluador_id  INT NOT NULL,
    periodo       VARCHAR(20) NOT NULL,
    observaciones TEXT,
    creada_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (evaluador_id)  REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 2. Puntaje por habilidad dentro de una evaluación (1-5 estrellas)
CREATE TABLE evaluacion_habilidades (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    evaluacion_id INT NOT NULL,
    habilidad_id  INT NOT NULL,
    puntaje       TINYINT NOT NULL,
    CONSTRAINT chk_puntaje CHECK (puntaje BETWEEN 1 AND 5),
    FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (habilidad_id)  REFERENCES habilidades(id) ON DELETE CASCADE
);

-- 3. Resultados de tests socioemocionales por estudiante
CREATE TABLE test_resultados (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    test_nombre         VARCHAR(200) NOT NULL,
    estudiante_id       INT NOT NULL,
    evaluador_id        INT NOT NULL,
    nota_observaciones  TEXT,
    registrado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (evaluador_id)  REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 4. Puntaje por dimensión dentro de un resultado de test
CREATE TABLE test_resultado_dimensiones (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    resultado_id     INT NOT NULL,
    dimension_nombre VARCHAR(100) NOT NULL,
    puntaje          INT NOT NULL,
    FOREIGN KEY (resultado_id) REFERENCES test_resultados(id) ON DELETE CASCADE
);
