// Mock de la tabla `usuarios` de empleame_db.
// Estos datos coinciden exactamente con los INSERT del archivo sql/01_creacion_db_tablas.sql.
// Cuando haya un backend real, este archivo se reemplaza por una llamada a la API.

export const usuarios = [
  {
    id: 1,
    nombre: "Catalina",
    apellido: "Rodríguez",
    correo: "estudiante@empleame.cl",
    contrasena: "estudiante123",
    rol: "estudiante",
  },
  {
    id: 2,
    nombre: "Empresa",
    apellido: "Demo",
    correo: "empresa@empleame.cl",
    contrasena: "empresa123",
    rol: "empresa",
  },
  {
    id: 3,
    nombre: "Admin",
    apellido: "Demo",
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

// Simula el query: INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, rol)
// Retorna { ok: true, usuario } o { ok: false, error: string }
export function registrarUsuario({ nombre, apellido, correo, contrasena, rol }) {
  const existe = usuarios.find((u) => u.correo === correo);
  if (existe) {
    return { ok: false, error: "Ya existe una cuenta con ese correo." };
  }
  const rolNormalizado = rol === "admin" ? "centro" : rol;
  const nuevo = {
    id: usuarios.length + 1,
    nombre,
    apellido,
    correo,
    contrasena,
    rol: rolNormalizado,
  };
  usuarios.push(nuevo);
  return { ok: true, usuario: nuevo };
}
