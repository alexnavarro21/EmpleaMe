USE railway;

-- Tabla pivot: habilidades requeridas por una vacante
CREATE TABLE vacante_habilidades (
    vacante_id  INT NOT NULL,
    habilidad_id INT NOT NULL,
    PRIMARY KEY (vacante_id, habilidad_id),
    FOREIGN KEY (vacante_id)   REFERENCES vacantes(id)    ON DELETE CASCADE,
    FOREIGN KEY (habilidad_id) REFERENCES habilidades(id) ON DELETE CASCADE
);
