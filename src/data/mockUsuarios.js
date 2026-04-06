// Mock de la tabla `usuarios` de empleame_db.
// Estos datos coinciden exactamente con los INSERT del archivo sql/01_creacion_db_tablas.sql.
// Cuando haya un backend real, este archivo se reemplaza por una llamada a la API.

export const usuarios = [
  {
    id: 1,
    correo: "estudiante@empleame.cl",
    contrasena: "estudiante123",
    rol: "estudiante",
  },
  {
    id: 2,
    correo: "empresa@empleame.cl",
    contrasena: "empresa123",
    rol: "empresa",
  },
  {
    id: 3,
    correo: "admin@empleame.cl",
    contrasena: "admin123",
    rol: "centro",
  },
];

// Simula el query: SELECT * FROM usuarios WHERE correo = ? AND contrasena_hash = ?
export function autenticarUsuario(correo, contrasena) {
  return usuarios.find(
    (u) => u.correo === correo && u.contrasena === contrasena
  ) || null;
}
