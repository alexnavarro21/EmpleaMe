-- ============================================================
-- EmpleaMe — Limpieza completa de la base de datos
-- Ejecutar ANTES de inserts.sql para resetear todos los datos.
-- Deshabilita FK checks para poder truncar en cualquier orden.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE reportes_perfiles;
TRUNCATE TABLE reportes_comentarios;
TRUNCATE TABLE reportes_publicaciones;
TRUNCATE TABLE reportes;
TRUNCATE TABLE resumenes_conversacion;
TRUNCATE TABLE rankings_ia;
TRUNCATE TABLE resumenes_ia;
TRUNCATE TABLE seguidores;
TRUNCATE TABLE vacante_habilidades;
TRUNCATE TABLE inscripciones_talleres;
TRUNCATE TABLE talleres;
TRUNCATE TABLE notificaciones;
TRUNCATE TABLE idiomas_estudiantes;
TRUNCATE TABLE test_resultado_dimensiones;
TRUNCATE TABLE test_resultados;
TRUNCATE TABLE evaluacion_habilidades;
TRUNCATE TABLE evaluaciones;
TRUNCATE TABLE mensajes_directos;
TRUNCATE TABLE conversaciones_directas;
TRUNCATE TABLE notas_admin;
TRUNCATE TABLE mensajes;
TRUNCATE TABLE conversaciones;
TRUNCATE TABLE comentarios;
TRUNCATE TABLE publicacion_likes;
TRUNCATE TABLE publicaciones_vacantes;
TRUNCATE TABLE publicaciones;
TRUNCATE TABLE tipos_publicacion;
TRUNCATE TABLE cv_seleccion_experiencias;
TRUNCATE TABLE historial_laboral_postulaciones;
TRUNCATE TABLE historial_laboral;
TRUNCATE TABLE historial_academico;
TRUNCATE TABLE postulaciones;
TRUNCATE TABLE vacantes;
TRUNCATE TABLE colegio_carreras;
TRUNCATE TABLE habilidades_estudiantes;
TRUNCATE TABLE habilidades;
TRUNCATE TABLE categorias_habilidades;
TRUNCATE TABLE perfiles_empresas;
TRUNCATE TABLE perfiles_estudiantes;
TRUNCATE TABLE perfiles_colegios;
TRUNCATE TABLE perfiles_slep;
TRUNCATE TABLE carreras;
TRUNCATE TABLE usuarios;

SET FOREIGN_KEY_CHECKS = 1;
