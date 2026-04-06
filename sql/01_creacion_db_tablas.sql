CREATE DATABASE IF NOT EXISTS empleame_db;
USE empleame_db;

-- Drop en orden inverso para respetar las foreign keys
DROP TABLE IF EXISTS vacantes;
DROP TABLE IF EXISTS items_portafolio;
DROP TABLE IF EXISTS habilidades_estudiantes;
DROP TABLE IF EXISTS habilidades;
DROP TABLE IF EXISTS perfiles_empresas;
DROP TABLE IF EXISTS perfiles_estudiantes;
DROP TABLE IF EXISTS usuarios;

-- 1. Tabla de Usuarios (Login unificado)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol ENUM('estudiante', 'empresa', 'centro') NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Perfiles de Estudiantes
CREATE TABLE perfiles_estudiantes (
    usuario_id INT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    carrera ENUM('Mecanica Automotriz', 'Administracion') NOT NULL,
    telefono VARCHAR(20),
    biografia TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 3. Perfiles de Empresas
CREATE TABLE perfiles_empresas (
    usuario_id INT PRIMARY KEY,
    nombre_empresa VARCHAR(150) NOT NULL,
    telefono_contacto VARCHAR(20),
    descripcion TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 4. Catálogo de Habilidades
CREATE TABLE habilidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria ENUM('tecnica', 'blanda') NOT NULL
);

-- 5. Habilidades del Estudiante
CREATE TABLE habilidades_estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    habilidad_id INT NOT NULL,
    nivel_dominio ENUM('Basico', 'Intermedio', 'Avanzado') NOT NULL,
    esta_validada BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (habilidad_id) REFERENCES habilidades(id) ON DELETE CASCADE
);

-- 6. Portafolio Visual
CREATE TABLE items_portafolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    url_multimedia VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES perfiles_estudiantes(usuario_id) ON DELETE CASCADE
);

-- 7. Vacantes de Empleo / Prácticas
CREATE TABLE vacantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    requisitos TEXT,
    esta_activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES perfiles_empresas(usuario_id) ON DELETE CASCADE
);

-- ==============================================
-- USUARIOS DE PRUEBA
-- Contraseñas en texto plano (solo para desarrollo).
-- En producción usar bcrypt: hash de 'estudiante123' => $2b$10$...
-- ==============================================

INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES
    ('estudiante@empleame.cl', 'estudiante123', 'estudiante'),
    ('empresa@empleame.cl',    'empresa123',    'empresa'),
    ('admin@empleame.cl',      'admin123',      'centro');

-- Perfil del estudiante (usuario_id = 1)
INSERT INTO perfiles_estudiantes (usuario_id, nombre_completo, carrera, telefono, biografia) VALUES
    (1, 'Juan Pérez', 'Mecanica Automotriz', '+56912345678', 'Estudiante de tercer año apasionado por la mecánica moderna y los vehículos eléctricos.');

-- Perfil de la empresa (usuario_id = 2)
INSERT INTO perfiles_empresas (usuario_id, nombre_empresa, telefono_contacto, descripcion) VALUES
    (2, 'Taller Automotriz del Sur', '+56922334455', 'Empresa dedicada al mantenimiento y reparación de vehículos livianos y pesados.');

-- Habilidades de ejemplo
INSERT INTO habilidades (nombre, categoria) VALUES
    ('Diagnóstico electrónico', 'tecnica'),
    ('Cambio de aceite y filtros', 'tecnica'),
    ('Trabajo en equipo', 'blanda'),
    ('Comunicación efectiva', 'blanda');

-- Habilidades del estudiante
INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio, esta_validada) VALUES
    (1, 1, 'Intermedio', FALSE),
    (1, 2, 'Avanzado',   TRUE),
    (1, 3, 'Avanzado',   TRUE);
