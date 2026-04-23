const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const BACKEND_ORIGIN = BASE_URL.replace(/\/api$/, "");

export function getMediaUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BACKEND_ORIGIN}${path}`;
}


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

export async function loginUsuario(identifier, contrasena) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, contrasena }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");
  return data; // { token, usuario: { id, correo, rol } }
}

// rol: "estudiante" | "empresa" | "colegio" | "slep"
export async function registrarUsuario({ correo, contrasena, rol, nombre_completo, carrera, semestre, telefono, nombre_empresa, telefono_contacto, colegio_id }) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena, rol, nombre_completo, carrera, semestre, telefono, nombre_empresa, telefono_contacto, colegio_id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al crear la cuenta");
  return data; // { mensaje, id }
}

export async function listarColegios() {
  const res = await fetch(`${BASE_URL}/auth/colegios`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cargar colegios");
  return data; // [{ id, nombre_institucion }]
}

// ── Habilidades ───────────────────────────────────────────────────────────────

export async function getHabilidades() {
  const res = await fetch(`${BASE_URL}/habilidades`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener habilidades");
  return data; // [{ id, nombre, categoria }]
}

export async function crearHabilidad(datos) {
  const res = await fetch(`${BASE_URL}/habilidades`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al crear habilidad");
  return data;
}

export async function actualizarHabilidad(id, datos) {
  const res = await fetch(`${BASE_URL}/habilidades/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al actualizar habilidad");
  return data;
}

export async function getEstudiantesDeHabilidad(id) {
  const res = await fetch(`${BASE_URL}/habilidades/${id}/estudiantes`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al consultar estudiantes");
  return data; // [{ nombre_completo, usuario_id }]
}

export async function eliminarHabilidad(id) {
  const res = await fetch(`${BASE_URL}/habilidades/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al eliminar habilidad");
  return data;
}

// ── Vacantes ──────────────────────────────────────────────────────────────────

export async function getVacantes(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.area) params.set("area", filtros.area);
  if (filtros.modalidad) params.set("modalidad", filtros.modalidad);
  if (filtros.tipo) params.set("tipo", filtros.tipo);
  const qs = params.toString();
  const res = await fetch(`${BASE_URL}/vacantes${qs ? `?${qs}` : ""}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener vacantes");
  return data;
}

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

export async function getEstudiantes(colegioId) {
  const url = colegioId
    ? `${BASE_URL}/perfiles/estudiantes?colegio_id=${colegioId}`
    : `${BASE_URL}/perfiles/estudiantes`;
  const res = await fetch(url, { headers: authHeaders() });
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

export async function getColegioById(id) {
  const res = await fetch(`${BASE_URL}/perfiles/colegio/${id}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener perfil");
  return data;
}

export async function actualizarPerfilColegio(id, datos) {
  const res = await fetch(`${BASE_URL}/perfiles/colegio/${id}`, {
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

export async function guardarCvExperiencias(estudianteId, ids) {
  const res = await fetch(`${BASE_URL}/perfiles/estudiante/${estudianteId}/cv-experiencias`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error("Error al guardar selección de CV");
}

export async function subirFotoPerfil(archivo) {
  const form = new FormData();
  form.append("foto", archivo);
  const res = await fetch(`${BASE_URL}/perfiles/foto`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al subir foto");
  return data; // { foto_perfil: "/api/media/uploads/..." }
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

export async function getPostulantesEmpresa(estado = null) {
  const url = estado
    ? `${BASE_URL}/postulaciones/empresa?estado=${estado}`
    : `${BASE_URL}/postulaciones/empresa?estado=pendiente`;
  const res = await fetch(url, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener postulantes");
  return data;
}

export async function getPostulantesRechazados() {
  return getPostulantesEmpresa("rechazado");
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

// ── Notificaciones ────────────────────────────────────────────────────────────

export async function getNotificaciones(pagina = 1, porPagina = 10) {
  const res = await fetch(`${BASE_URL}/notificaciones?pagina=${pagina}&porPagina=${porPagina}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener notificaciones");
  return data; // { notificaciones: [...], total, noLeidas }
}

export async function getNoLeidas() {
  const res = await fetch(`${BASE_URL}/notificaciones/no-leidas`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error");
  return data.count;
}

export async function marcarNotificacionesLeidas() {
  const res = await fetch(`${BASE_URL}/notificaciones/leidas`, {
    method: "PUT",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error");
  return data;
}

// ── Publicaciones (Soporta Archivos Multimedia) ───────────────────────────────

export async function getPublicaciones(pagina = 1, limite = 20) {
  const res = await fetch(`${BASE_URL}/publicaciones?pagina=${pagina}&limite=${limite}`, {
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

// Subir Excel de alumnos  →  POST /api/admin/alumnos/excel
export async function subirExcelAlumnos(archivo) {
  const formData = new FormData();
  formData.append("archivo", archivo);
  const res = await fetch(`${BASE_URL}/admin/alumnos/excel`, {
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

export async function marcarEgresado(estudianteId) {
  const res = await fetch(`${BASE_URL}/admin/historial-academico/${estudianteId}/egreso`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al registrar egreso");
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

// ── Idiomas ───────────────────────────────────────────────────────────────────

export async function getIdiomasEstudiante(estudianteId) {
  const res = await fetch(`${BASE_URL}/admin/idiomas/${estudianteId}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener idiomas");
  return data;
}

export async function agregarIdioma(datos) {
  const res = await fetch(`${BASE_URL}/admin/idiomas`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al agregar idioma");
  return data;
}

export async function eliminarIdioma(id) {
  const res = await fetch(`${BASE_URL}/admin/idiomas/${id}`, {
    method: "DELETE", headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al eliminar idioma");
  return data;
}

// ── Historial académico ───────────────────────────────────────────────────────

export async function getHistorialAcademico(estudianteId) {
  const res = await fetch(`${BASE_URL}/admin/historial-academico/${estudianteId}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener historial académico");
  return data;
}

export async function agregarHistorialAcademico(datos) {
  const res = await fetch(`${BASE_URL}/admin/historial-academico`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al agregar historial académico");
  return data;
}

export async function eliminarHistorialAcademico(id) {
  const res = await fetch(`${BASE_URL}/admin/historial-academico/${id}`, {
    method: "DELETE", headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al eliminar registro académico");
  return data;
}

// ── Historial laboral ─────────────────────────────────────────────────────────

export async function getHistorialLaboral(estudianteId) {
  const res = await fetch(`${BASE_URL}/admin/historial-laboral/${estudianteId}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener historial laboral");
  return data;
}

export async function agregarHistorialLaboral(datos) {
  const res = await fetch(`${BASE_URL}/admin/historial-laboral`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al agregar historial laboral");
  return data;
}

export async function eliminarHistorialLaboral(id) {
  const res = await fetch(`${BASE_URL}/admin/historial-laboral/${id}`, {
    method: "DELETE", headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al eliminar registro laboral");
  return data;
}

// Obtener postulaciones aceptadas de la empresa  →  GET /api/postulaciones/empresa/aceptados
export async function getPostulantesAceptados() {
  const res = await fetch(`${BASE_URL}/postulaciones/empresa/aceptados`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener aceptados");
  return data;
}

// ── Likes publicaciones ───────────────────────────────────────────────────────

export async function toggleLike(publicacionId) {
  const res = await fetch(`${BASE_URL}/publicaciones/${publicacionId}/like`, {
    method: "POST", headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al procesar me gusta");
  return data; // { liked: bool, total: number }
}

export async function crearReporte({ tipo, referencia_id, motivo, descripcion }) {
  const res = await fetch(`${BASE_URL}/reportes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ tipo, referencia_id, motivo, descripcion }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al enviar reporte");
  return data;
}

export async function getReportes(estado = "pendiente") {
  const res = await fetch(`${BASE_URL}/reportes?estado=${estado}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener reportes");
  return data;
}

export async function eliminarContenidoReporte(id) {
  const res = await fetch(`${BASE_URL}/reportes/${id}/contenido`, {
    method: "DELETE", headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al eliminar contenido");
  return data;
}

export async function actualizarReporte(id, estado) {
  const res = await fetch(`${BASE_URL}/reportes/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ estado }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al actualizar reporte");
  return data;
}

export async function eliminarPublicacion(publicacionId) {
  const res = await fetch(`${BASE_URL}/publicaciones/${publicacionId}`, {
    method: "DELETE", headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al eliminar publicación");
  return data;
}

export async function eliminarComentario(publicacionId, comentarioId) {
  const res = await fetch(`${BASE_URL}/publicaciones/${publicacionId}/comentarios/${comentarioId}`, {
    method: "DELETE", headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al eliminar comentario");
  return data;
}

// ── Talleres ──────────────────────────────────────────────────────────────────

export async function getTalleres(todos = false) {
  const url = todos ? `${BASE_URL}/talleres?todos=1` : `${BASE_URL}/talleres`;
  const res = await fetch(url, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener talleres");
  return data;
}

export async function crearTaller(datos, archivo) {
  const formData = new FormData();
  Object.entries(datos).forEach(([k, v]) => { if (v != null) formData.append(k, v); });
  if (archivo) formData.append("archivo_multimedia", archivo);
  const res = await fetch(`${BASE_URL}/talleres`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al crear taller");
  return data;
}

export async function actualizarTaller(id, datos, archivo, quitarMultimedia) {
  const formData = new FormData();
  Object.entries(datos).forEach(([k, v]) => { if (v != null) formData.append(k, v); });
  if (archivo) formData.append("archivo_multimedia", archivo);
  if (quitarMultimedia) formData.append("quitar_multimedia", "1");
  const res = await fetch(`${BASE_URL}/talleres/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al actualizar taller");
  return data;
}

export async function toggleTaller(id) {
  const res = await fetch(`${BASE_URL}/talleres/${id}/toggle`, {
    method: "PUT", headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cambiar estado del taller");
  return data;
}

export async function eliminarTaller(id) {
  const res = await fetch(`${BASE_URL}/talleres/${id}`, {
    method: "DELETE", headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al eliminar taller");
  return data;
}

// ── Inscripciones a talleres ──────────────────────────────────────────────────

export async function inscribirseEnTaller(tallerId) {
  const res = await fetch(`${BASE_URL}/talleres/${tallerId}/inscribir`, {
    method: "POST", headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al inscribirse");
  return data;
}

export async function getMisInscripcionesTalleres() {
  const res = await fetch(`${BASE_URL}/talleres/mis-inscripciones`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener inscripciones");
  return data;
}

export async function getInscritosPendientesTalleres() {
  const res = await fetch(`${BASE_URL}/talleres/inscritos/pendientes`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener inscritos pendientes");
  return data;
}

export async function getInscritosTaller(tallerId) {
  const res = await fetch(`${BASE_URL}/talleres/${tallerId}/inscritos`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener inscritos");
  return data;
}

export async function actualizarEstadoInscripcion(inscripcionId, estado) {
  const res = await fetch(`${BASE_URL}/talleres/inscripciones/${inscripcionId}/estado`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ estado }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al actualizar inscripción");
  return data;
}

// ── Completar práctica (empresa) ──────────────────────────────────────────────

export async function completarPractica(postulacionId) {
  const res = await fetch(`${BASE_URL}/postulaciones/${postulacionId}/completar`, {
    method: "PUT", headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al completar práctica");
  return data;
}

// ── Notas admin por conversación ──────────────────────────────────────────────

export async function getNotasAdmin(conversacionId) {
  const res = await fetch(`${BASE_URL}/notas-admin/${conversacionId}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener notas");
  return data;
}

export async function agregarNotaAdmin(conversacionId, contenido) {
  const res = await fetch(`${BASE_URL}/notas-admin/${conversacionId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ contenido }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al agregar nota");
  return data;
}

// ── IA ────────────────────────────────────────────────────────────────────────

export async function getResumenIA(estudianteId, vacanteId) {
  const res = await fetch(`${BASE_URL}/ia/resumen/${estudianteId}/${vacanteId}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al generar resumen");
  return data; // { resumen, desde_cache }
}

// ── Seguidores ────────────────────────────────────────────────────────────────

// Seguir / dejar de seguir a un usuario
export async function toggleSeguir(usuarioId) {
  const res = await fetch(`${BASE_URL}/seguidores/${usuarioId}/toggle`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al seguir usuario");
  return data; // { siguiendo: true|false }
}

// Estado de seguimiento + conteos del usuario :id
export async function getEstadoSeguimiento(usuarioId) {
  const res = await fetch(`${BASE_URL}/seguidores/${usuarioId}/estado`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener estado");
  return data; // { siguiendo, seguidores, siguiendo_count }
}

// Lista de seguidores del usuario :id
export async function getSeguidores(usuarioId) {
  const res = await fetch(`${BASE_URL}/seguidores/${usuarioId}/seguidores`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener seguidores");
  return data;
}

// Ranking IA de postulantes por compatibilidad con una vacante (con caché)
export async function getRankingIA(vacanteId) {
  const res = await fetch(`${BASE_URL}/ia/ranking/${vacanteId}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al generar ranking");
  return data;
}

// Moderar contenido con IA antes de publicar
export async function moderarContenido(contenido) {
  const res = await fetch(`${BASE_URL}/ia/moderar`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ contenido }),
  });
  if (!res.ok) return { aprobado: true };
  return res.json();
}

// Lista de usuarios que sigue el usuario :id
export async function getSiguiendo(usuarioId) {
  const res = await fetch(`${BASE_URL}/seguidores/${usuarioId}/siguiendo`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener siguiendo");
  return data;
}

