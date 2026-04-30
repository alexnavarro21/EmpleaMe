-- 031: Reemplazar semestre por nivel (curso escolar: 1° a 4° Medio)
ALTER TABLE perfiles_estudiantes
  DROP COLUMN semestre,
  ADD COLUMN nivel ENUM('1° Medio','2° Medio','3° Medio','4° Medio') DEFAULT NULL;
