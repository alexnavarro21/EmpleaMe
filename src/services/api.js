const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

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

// ── Vacantes ──────────────────────────────────────────────────────────────────

export async function getVacantesEmpresa(empresaId) {
  const res = await fetch(`${BASE_URL}/vacantes/empresa/${empresaId}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener vacantes");
  return data;
}

export async function crearVacante(datos) {
  const res = await fetch(`${BASE_URL}/vacantes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al crear vacante");
  return data; // { id, mensaje }
}

// ── Perfiles ──────────────────────────────────────────────────────────────────

export async function getEmpresas() {
  const res = await fetch(`${BASE_URL}/perfiles/empresas`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener empresas");
  return data; // [{ usuario_id, nombre_empresa, descripcion, telefono_contacto, total_vacantes }]
}

export async function getEstudiantes() {
  const res = await fetch(`${BASE_URL}/perfiles/estudiantes`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener estudiantes");
  return data;
}

export async function getEstudianteById(id) {
  const res = await fetch(`${BASE_URL}/perfiles/estudiante/${id}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener perfil");
  return data;
}

export async function getEmpresaById(id) {
  const res = await fetch(`${BASE_URL}/perfiles/empresa/${id}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener perfil");
  return data;
}

export async function actualizarPerfilEmpresa(id, datos) {
  const res = await fetch(`${BASE_URL}/perfiles/empresa/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al actualizar perfil");
  return data;
}

export async function actualizarPerfilEstudiante(id, datos) {
  const res = await fetch(`${BASE_URL}/perfiles/estudiante/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al actualizar perfil");
  return data;
}

// ── Postulaciones ─────────────────────────────────────────────────────────────

export async function postularAVacante(vacanteId) {
  const res = await fetch(`${BASE_URL}/postulaciones`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ vacante_id: vacanteId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al postular");
  return data;
}

export async function getPostulantesEmpresa() {
  const res = await fetch(`${BASE_URL}/postulaciones/empresa`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener postulantes");
  return data;
}

export async function getPostulantesPorVacante(vacanteId) {
  const res = await fetch(`${BASE_URL}/postulaciones/vacante/${vacanteId}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener postulantes");
  return data;
}

export async function actualizarEstadoPostulacion(postulacionId, estado) {
  const res = await fetch(`${BASE_URL}/postulaciones/${postulacionId}/estado`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ estado }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al actualizar estado");
  return data;
}

// ── Conversaciones ────────────────────────────────────────────────────────────

export async function getConversaciones() {
  const res = await fetch(`${BASE_URL}/conversaciones`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener conversaciones");
  return data;
}

export async function iniciarConversacion(estudianteId) {
  const res = await fetch(`${BASE_URL}/conversaciones`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ estudiante_id: estudianteId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al iniciar conversación");
  return data; // { id }
}

export async function getMensajes(conversacionId) {
  const res = await fetch(`${BASE_URL}/conversaciones/${conversacionId}/mensajes`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener mensajes");
  return data;
}

export async function enviarMensaje(conversacionId, contenido) {
  const res = await fetch(`${BASE_URL}/conversaciones/${conversacionId}/mensajes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ contenido }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al enviar mensaje");
  return data;
}

// ── Publicaciones ─────────────────────────────────────────────────────────────

export async function getPublicaciones() {
  const res = await fetch(`${BASE_URL}/publicaciones`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener publicaciones");
  return data;
}

export async function crearPublicacion(datos) {
  const res = await fetch(`${BASE_URL}/publicaciones`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al crear publicación");
  return data; // { id, mensaje }
}
