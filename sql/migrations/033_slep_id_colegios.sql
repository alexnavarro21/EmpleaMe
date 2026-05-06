-- Migración 033: Asignar colegios a SLEP (sistema multi-SLEP)
-- Cada colegio pertenece a un SLEP específico

ALTER TABLE perfiles_colegios
  ADD COLUMN slep_id INT DEFAULT NULL AFTER usuario_id,
  ADD CONSTRAINT fk_colegio_slep
    FOREIGN KEY (slep_id) REFERENCES perfiles_slep(usuario_id) ON DELETE SET NULL;

-- Backfill: asignar colegios existentes al SLEP que los creó (vía usuarios.creado_por)
UPDATE perfiles_colegios pc
JOIN usuarios u_col   ON u_col.id = pc.usuario_id
JOIN usuarios u_slep  ON u_slep.id = u_col.creado_por AND u_slep.rol = 'slep'
SET pc.slep_id = u_slep.id
WHERE u_col.creado_por IS NOT NULL;
