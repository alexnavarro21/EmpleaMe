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

// ── Habilidades ───────────────────────────────────────────────────────────────

export async function getHabilidades() {
  const res = await fetch(`${BASE_URL}/habilidades`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener habilidades");
  return data; // [{ id, nombre, categoria }]
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

export async function desactivarVacante(vacanteId) {
  const res = await fetch(`${BASE_URL}/vacantes/${vacanteId}/desactivar`, {
    method: "PUT",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al desactivar vacante");
  return data;
}

export async function activarVacante(vacanteId) {
  const res = await fetch(`${BASE_URL}/vacantes/${vacanteId}/activar`, {
    method: "PUT",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al activar vacante");
  return data;
}

export async function crearVacante(datos, archivo = null) {
  let body, headers;
  if (archivo) {
    const formData = new FormData();
    Object.entries(datos).forEach(([k, v]) => {
      if (v === undefined) return;
      // Arrays (habilidades) se serializan como JSON
      formData.append(k, Array.isArray(v) ? JSON.stringify(v) : v);
    });
    formData.append("archivo_multimedia", archivo);
    body = formData;
    headers = { Authorization: `Bearer ${getToken()}` };
  } else {
    body = JSON.stringify(datos);
    headers = authHeaders();
  }
  const res = await fetch(`${BASE_URL}/vacantes`, { method: "POST", headers, body });
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

export async function getPostulacionesEstudiante() {
  const res = await fetch(`${BASE_URL}/postulaciones/estudiante`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener postulaciones");
  return data; // [{ id, estado, fecha_creacion, vacante_id, titulo, area, modalidad, nombre_empresa }]
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

// Empresa inicia conversación con estudiante
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

// Estudiante inicia conversación con empresa
export async function iniciarConversacionConEmpresa(empresaId) {
  const res = await fetch(`${BASE_URL}/conversaciones`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ empresa_id: empresaId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al iniciar conversación");
  return data; // { id }
}

// ── Mensajes Directos (estudiante↔estudiante) ─────────────────────────────────

export async function getMensajesDirectos() {
  const res = await fetch(`${BASE_URL}/mensajes-directos`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener conversaciones");
  return data;
}

export async function iniciarMensajeDirecto(destinatarioId) {
  const res = await fetch(`${BASE_URL}/mensajes-directos`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ destinatario_id: destinatarioId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al iniciar conversación");
  return data; // { id }
}

export async function getMensajesDeDirecta(conversacionId) {
  const res = await fetch(`${BASE_URL}/mensajes-directos/${conversacionId}/mensajes`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener mensajes");
  return data;
}

export async function enviarMensajeDirecto(conversacionId, contenido) {
  const res = await fetch(`${BASE_URL}/mensajes-directos/${conversacionId}/mensajes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ contenido }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al enviar mensaje");
  return data;
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

// ── Publicaciones (Soporta Archivos Multimedia) ───────────────────────────────

export async function getPublicaciones() {
  const res = await fetch(`${BASE_URL}/publicaciones`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener publicaciones");
  return data;
}

export async function crearPublicacion(datos) {
  // Si trae archivo usamos multipart/form-data (requiere multer en backend)
  // Si no, enviamos JSON para compatibilidad con el backend actual
  const tieneArchivo = datos instanceof FormData && datos.get("archivo_multimedia");

  const res = await fetch(`${BASE_URL}/publicaciones`, {
    method: "POST",
    headers: tieneArchivo
      ? { Authorization: `Bearer ${getToken()}` }
      : authHeaders(),
    body: tieneArchivo
      ? datos
      : JSON.stringify({
          titulo:      datos.get("titulo"),
          contenido:   datos.get("contenido"),
          tipo_nombre: datos.get("tipo_nombre"),
        }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al crear publicación");
  return data;
}

export async function getPublicacionesByAutor(autorId) {
  const res = await fetch(`${BASE_URL}/publicaciones?autor_id=${autorId}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener publicaciones");
  return data;
}

export async function getComentarios(publicacionId) {
  const res = await fetch(`${BASE_URL}/publicaciones/${publicacionId}/comentarios`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener comentarios");
  return data;
}

export async function crearComentario(publicacionId, contenido) {
  const res = await fetch(`${BASE_URL}/publicaciones/${publicacionId}/comentarios`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ contenido }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al comentar");
  return data;
}

// ── Admin ─────────────────────────────────────────────────────────────────────

// Asignar habilidades técnicas  →  POST /api/admin/habilidades/asignar
export async function asignarHabilidadesTecnicas(datos) {
  const res = await fetch(`${BASE_URL}/admin/habilidades/asignar`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al asignar habilidades");
  return data;
}

// Subir Excel de tests socioemocionales  →  POST /api/admin/tests/excel
export async function subirExcelTests(archivo) {
  const formData = new FormData();
  formData.append("archivo", archivo);
  const res = await fetch(`${BASE_URL}/admin/tests/excel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al procesar el archivo");
  return data;
}

// Subir Excel de promedios  →  POST /api/admin/promedios/excel
export async function subirExcelPromedios(archivo) {
  const formData = new FormData();
  formData.append("archivo", archivo);
  const res = await fetch(`${BASE_URL}/admin/promedios/excel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al procesar el archivo");
  return data;
}

// KPIs del panel  →  GET /api/admin/stats
export async function getAdminStats() {
  const res = await fetch(`${BASE_URL}/admin/stats`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener estadísticas");
  return data;
}

// Usuarios con nombres  →  GET /api/admin/usuarios
export async function getUsuariosAdmin() {
  const res = await fetch(`${BASE_URL}/admin/usuarios`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener usuarios");
  return data;
}

// Evaluaciones docentes  →  GET|POST /api/admin/evaluaciones
export async function getEvaluaciones() {
  const res = await fetch(`${BASE_URL}/admin/evaluaciones`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener evaluaciones");
  return data;
}

export async function guardarEvaluacion(datos) {
  const res = await fetch(`${BASE_URL}/admin/evaluaciones`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al guardar evaluación");
  return data;
}

// Tests socioemocionales  →  GET|POST /api/admin/tests/resultados
export async function getResultadosTest(estudianteId) {
  const res = await fetch(`${BASE_URL}/admin/tests/resultados/${estudianteId}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener resultados");
  return data;
}

export async function guardarResultadoTest(datos) {
  const res = await fetch(`${BASE_URL}/admin/tests/resultados`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al guardar resultado");
  return data;
}