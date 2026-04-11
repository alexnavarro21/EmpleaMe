import { validarRut } from "./validarRut";

/**
 * Calcula el % de completitud del perfil de un estudiante.
 * Basado en los 8 campos que el propio estudiante puede editar.
 * Retorna un número de 0 a 100.
 */
export function calcularCompletitud(perfil) {
  if (!perfil) return 0;
  const rutValido = validarRut(perfil.rut || "");
  const campos = [
    perfil.nombre_completo,
    perfil.carrera,
    perfil.telefono,
    perfil.biografia,
    perfil.estado_civil,
    rutValido ? perfil.rut : "",
    perfil.region,
    perfil.comuna,
  ];
  return Math.round(campos.filter(Boolean).length / 8 * 100);
}
