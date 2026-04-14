-- Elimina el UNIQUE para permitir múltiples notas por admin por conversación
ALTER TABLE notas_admin DROP INDEX uq_conv_admin;
