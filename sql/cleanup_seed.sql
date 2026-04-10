-- =============================================================================
-- CLEANUP: Elimina los datos del seed realista
-- Conserva: estudiante@empleame.cl (id=1), empresa@empleame.cl (id=2), admin@empleame.cl (id=3)
-- También conserva usuarios previos no seed (ids 6-13)
-- ÚSALO SÓLO para revertir sql/seed_realistic.sql
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Identificar usuarios seed (correos de dominio @alumnos.cft.cl y empresas seed)
-- Empresas seed
DELETE FROM postulaciones
WHERE estudiante_id IN (
  SELECT id FROM usuarios WHERE correo LIKE '%@alumnos.cft.cl'
)
OR vacante_id IN (
  SELECT v.id FROM vacantes v
  JOIN usuarios u ON v.empresa_id = u.id
  WHERE u.correo IN (
    'contacto@tallerperezhijos.cl',
    'rrhh@nordiklogistica.cl',
    'practicas@autoservicionorte.cl',
    'administracion@cgestion.cl'
  )
);

DELETE FROM habilidades_estudiantes
WHERE estudiante_id IN (
  SELECT id FROM usuarios WHERE correo LIKE '%@alumnos.cft.cl'
);

DELETE FROM vacantes
WHERE empresa_id IN (
  SELECT id FROM usuarios WHERE correo IN (
    'contacto@tallerperezhijos.cl',
    'rrhh@nordiklogistica.cl',
    'practicas@autoservicionorte.cl',
    'administracion@cgestion.cl'
  )
);

DELETE FROM perfiles_empresas
WHERE usuario_id IN (
  SELECT id FROM usuarios WHERE correo IN (
    'contacto@tallerperezhijos.cl',
    'rrhh@nordiklogistica.cl',
    'practicas@autoservicionorte.cl',
    'administracion@cgestion.cl'
  )
);

DELETE FROM perfiles_estudiantes
WHERE usuario_id IN (
  SELECT id FROM usuarios WHERE correo LIKE '%@alumnos.cft.cl'
);

-- Borrar usuarios seed (empresas y estudiantes)
DELETE FROM usuarios
WHERE correo IN (
  'contacto@tallerperezhijos.cl',
  'rrhh@nordiklogistica.cl',
  'practicas@autoservicionorte.cl',
  'administracion@cgestion.cl',
  'sebastian.morales@alumnos.cft.cl',
  'valentina.torres@alumnos.cft.cl',
  'nicolas.fuentes@alumnos.cft.cl',
  'camila.vargas@alumnos.cft.cl',
  'felipe.contreras@alumnos.cft.cl',
  'daniela.espinoza@alumnos.cft.cl',
  'rodrigo.nunez@alumnos.cft.cl',
  'javiera.saavedra@alumnos.cft.cl',
  'matias.gonzalez@alumnos.cft.cl',
  'isabella.reyes@alumnos.cft.cl'
);

SET FOREIGN_KEY_CHECKS = 1;
