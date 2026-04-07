const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function loginUsuario(correo, contrasena) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");
  return data; // { token, usuario: { id, correo, rol } }
}

// rol: "estudiante" | "empresa" | "centro"
// estudiante requiere: nombre_completo, carrera
// empresa requiere: nombre_empresa
// centro no requiere campos extra
export async function registrarUsuario({ correo, contrasena, rol, nombre_completo, carrera, nombre_empresa }) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena, rol, nombre_completo, carrera, nombre_empresa }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al crear la cuenta");
  return data; // { mensaje, id }
}
