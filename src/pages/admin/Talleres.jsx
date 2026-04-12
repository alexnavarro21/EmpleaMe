import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Badge, Card, PageHeader, Paginacion } from "../../components/ui";
import { Link } from "react-router-dom";
import { getTalleres, crearTaller, actualizarTaller, toggleTaller, eliminarTaller, getInscritosTaller, actualizarEstadoInscripcion } from "../../services/api";

const MODALIDADES = ["presencial", "remoto", "hibrido"];

const FORM_VACÍO = {
  titulo: "", descripcion: "", requisitos: "", area: "", modalidad: "presencial",
  duracion: "", horario: "", costo: "", direccion: "", fecha_inicio: "", fecha_limite: "", cupos: "",
};

function tiempoRelativo(fecha) {
  if (!fecha) return "Ahora mismo";
  const diff = Math.floor((Date.now() - new Date(fecha)) / 1000);
  if (diff < 60)    return "Ahora mismo";
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

// Preview del post que verán los estudiantes en el muro
function TallerPreview({ form, isDark }) {
  const T  = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#E8E6E1]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";
  const HV = isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]";
  const gratuito = !form.costo || Number(form.costo) === 0;
  const costoStr = gratuito ? "Gratuito" : `$${Number(form.costo).toLocaleString("es-CL")}`;

  return (
    <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:school-outline" width={20} className="text-white" />
          </div>
          <div>
            <p className={`text-sm font-semibold leading-tight ${T}`}>C.E. Cardenal J.M. Caro</p>
            <p className={`text-xs ${M}`}>Ahora mismo</p>
          </div>
        </div>
        <Badge color="purple">Taller</Badge>
      </div>

      {/* Título */}
      <div className="px-4 pb-1">
        <p className={`text-sm font-semibold ${T}`}>{form.titulo || "Título del taller"}</p>
      </div>

      {/* Descripción */}
      {form.descripcion && (
        <div className="px-4 pb-3">
          <p className={`text-sm leading-relaxed ${T}`}>{form.descripcion}</p>
        </div>
      )}

      {/* Info box */}
      <div className={`mx-4 mb-3 p-3 rounded-lg border ${B} ${isDark ? "bg-[#1e1e1c]" : "bg-[#F7F6F3]"}`}>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <Icon icon="mdi:check-circle-outline" width={14} className="text-green-500" />
            <span className="text-xs font-medium text-green-600">Activo</span>
          </div>
          {form.area && (
            <div className="flex items-center gap-1.5">
              <Icon icon="mdi:tag-outline" width={14} className="text-purple-500" />
              <span className={`text-xs ${T}`}>{form.area}</span>
            </div>
          )}
          {form.modalidad && (
            <div className="flex items-center gap-1.5">
              <Icon icon="mdi:map-marker-outline" width={14} className={M} />
              <span className={`text-xs ${M} capitalize`}>{form.modalidad}</span>
            </div>
          )}
          {form.duracion && (
            <div className="flex items-center gap-1.5">
              <Icon icon="mdi:clock-outline" width={14} className={M} />
              <span className={`text-xs ${M}`}>{form.duracion}</span>
            </div>
          )}
          {form.horario && (
            <div className="flex items-center gap-1.5">
              <Icon icon="mdi:calendar-clock-outline" width={14} className={M} />
              <span className={`text-xs ${M}`}>{form.horario}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Icon icon={gratuito ? "mdi:gift-outline" : "mdi:currency-usd"} width={14} className={gratuito ? "text-green-500" : "text-amber-500"} />
            <span className={`text-xs font-medium ${gratuito ? "text-green-600" : "text-amber-600"}`}>{costoStr}</span>
          </div>
          {form.cupos && (
            <div className="flex items-center gap-1.5">
              <Icon icon="mdi:account-group-outline" width={14} className={M} />
              <span className={`text-xs ${M}`}>{form.cupos} cupos</span>
            </div>
          )}
          {form.fecha_inicio && (
            <div className="flex items-center gap-1.5">
              <Icon icon="mdi:calendar-start" width={14} className={M} />
              <span className={`text-xs ${M}`}>{new Date(form.fecha_inicio).toLocaleDateString("es-CL")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className={`border-t ${B}`} />
      <div className="flex items-center px-2 py-1">
        <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium flex-1 justify-center ${M}`}>
          <Icon icon="mdi:thumb-up-outline" width={16} />
          Me interesa
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium flex-1 justify-center ${M}`}>
          <Icon icon="mdi:information-outline" width={16} />
          Ver más
        </div>
      </div>
    </div>
  );
}

// Formulario de crear/editar (vista de página completa)
function TallerForm({ taller, onGuardar, onCancelar, isDark }) {
  const T  = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";

  const [form, setForm] = useState(taller ? {
    titulo:       taller.titulo      || "",
    descripcion:  taller.descripcion || "",
    requisitos:   taller.requisitos  || "",
    area:         taller.area        || "",
    modalidad:    taller.modalidad   || "presencial",
    duracion:     taller.duracion    || "",
    horario:      taller.horario     || "",
    costo:        taller.costo != null ? String(taller.costo) : "",
    direccion:    taller.direccion   || "",
    fecha_inicio: taller.fecha_inicio ? taller.fecha_inicio.split("T")[0] : "",
    fecha_limite: taller.fecha_limite ? taller.fecha_limite.split("T")[0] : "",
    cupos:        taller.cupos != null ? String(taller.cupos) : "",
  } : FORM_VACÍO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const inputCls = `w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-purple-500 ${
    isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
           : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
  }`;
  const labelCls = `block text-xs mb-1.5 font-medium ${isDark ? "text-[#B4B2A9]" : "text-[#5F5E5A]"}`;

  const F = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.titulo.trim()) { setError("El título es requerido"); return; }
    setGuardando(true); setError("");
    try {
      await onGuardar({
        ...form,
        costo:        form.costo !== "" ? Number(form.costo) : 0,
        cupos:        form.cupos !== "" ? Number(form.cupos) : null,
        fecha_inicio: form.fecha_inicio || null,
        fecha_limite: form.fecha_limite || null,
      });
    } catch (e) {
      setError(e.message || "Error al guardar");
      setGuardando(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={taller ? "Editar taller" : "Nuevo taller"}
        subtitle={taller ? "Modifica los datos del taller" : "Completa los datos para publicar el taller en el muro"}
        action={
          <button
            onClick={onCancelar}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border ${B} ${M} hover:border-purple-500 transition-colors`}
          >
            <Icon icon="mdi:arrow-left" width={16} />
            Volver a talleres
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* ── Formulario ── */}
        <div className="col-span-2">
          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-4`}>Información del taller</h3>

            <div className="mb-4">
              <label className={labelCls}>Título *</label>
              <input value={form.titulo} onChange={F("titulo")} placeholder="Ej: Taller de Soldadura Básica" className={inputCls} />
            </div>

            <div className="mb-4">
              <label className={labelCls}>Descripción</label>
              <textarea value={form.descripcion} onChange={F("descripcion")} rows={3} placeholder="¿De qué trata el taller? ¿Qué aprenderán los estudiantes?" className={`${inputCls} resize-none`} />
            </div>

            <div className="mb-4">
              <label className={labelCls}>Requisitos</label>
              <textarea value={form.requisitos} onChange={F("requisitos")} rows={2} placeholder="¿Qué deben saber o tener los participantes?" className={`${inputCls} resize-none`} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Área</label>
                <input value={form.area} onChange={F("area")} placeholder="Ej: Mecánica Automotriz" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Modalidad</label>
                <div className="grid grid-cols-3 gap-2">
                  {MODALIDADES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, modalidad: m }))}
                      className={`py-2 rounded-lg border text-center text-xs font-medium transition-all capitalize ${
                        form.modalidad === m
                          ? "border-2 border-purple-500 bg-purple-50 text-purple-700"
                          : `border ${B} ${M} hover:border-purple-400`
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Duración</label>
                <input value={form.duracion} onChange={F("duracion")} placeholder="Ej: 8 horas, 2 semanas" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Horario</label>
                <input value={form.horario} onChange={F("horario")} placeholder="Ej: Sábados 9:00–13:00" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Costo ($) — 0 = Gratuito</label>
                <input type="number" min="0" value={form.costo} onChange={F("costo")} placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Cupos (vacío = sin límite)</label>
                <input type="number" min="1" value={form.cupos} onChange={F("cupos")} placeholder="Sin límite" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Fecha de inicio</label>
                <input type="date" value={form.fecha_inicio} onChange={F("fecha_inicio")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Fecha límite inscripción</label>
                <input type="date" value={form.fecha_limite} onChange={F("fecha_limite")} className={inputCls} />
              </div>
            </div>

            <div className="mb-4">
              <label className={labelCls}>Dirección</label>
              <input value={form.direccion} onChange={F("direccion")} placeholder="Ej: Av. Matta 123, Lo Espejo" className={inputCls} />
            </div>

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <div className="flex gap-3 mt-2">
              <button
                onClick={handleSubmit}
                disabled={guardando}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50"
              >
                <Icon icon={guardando ? "mdi:loading" : "mdi:check"} width={16} className={guardando ? "animate-spin" : ""} />
                {guardando ? "Guardando..." : taller ? "Guardar cambios" : "Publicar taller"}
              </button>
              <button
                onClick={onCancelar}
                className={`flex-1 py-2.5 text-sm rounded-lg border ${B} ${M} hover:border-purple-500 transition-colors`}
              >
                Cancelar
              </button>
            </div>
          </Card>
        </div>

        {/* ── Preview + Consejos ── */}
        <div className="flex flex-col gap-4">
          <Card>
            <p className={`text-sm font-semibold ${T} mb-3`}>Vista previa del post</p>
            <p className={`text-xs ${M} mb-3`}>Así verán los estudiantes el taller en el muro</p>
            <TallerPreview form={form} isDark={isDark} />
          </Card>

          <Card>
            <p className={`text-sm font-medium ${T} mb-2`}>Consejos</p>
            <ul className={`flex flex-col gap-2 text-xs ${M} list-disc list-inside`}>
              <li>Usa un título claro que describa el taller</li>
              <li>Indica si el taller es gratuito para más participación</li>
              <li>Especifica los cupos para generar urgencia</li>
              <li>Menciona si se entrega certificado al terminar</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminTalleres() {
  const { isDark } = useDark();
  const T  = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";

  const [talleres, setTalleres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState("lista"); // "lista" | "nuevo" | taller object (editar) | { tipo:"inscritos", taller }
  const [toggling, setToggling]   = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [busqueda, setBusqueda]   = useState("");
  const [filtro, setFiltro]       = useState("todos");
  const [pagina, setPagina]       = useState(1);
  const [porPagina, setPorPagina] = useState(6);

  // Vista inscritos
  const [inscritos, setInscritos]           = useState([]);
  const [loadingInscritos, setLoadingInscritos] = useState(false);
  const [actualizando, setActualizando]     = useState(null);
  const [filtroInscripcion, setFiltroInscripcion] = useState("todos");

  const cargarInscritos = async (tallerId) => {
    setLoadingInscritos(true);
    try {
      const data = await getInscritosTaller(tallerId);
      setInscritos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInscritos(false);
    }
  };

  const handleEstadoInscripcion = async (inscripcionId, estado) => {
    setActualizando(inscripcionId);
    try {
      await actualizarEstadoInscripcion(inscripcionId, estado);
      setInscritos((prev) => prev.map((i) => i.id === inscripcionId ? { ...i, estado } : i));
    } catch (e) {
      console.error(e);
    } finally {
      setActualizando(null);
    }
  };

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getTalleres(true);
      setTalleres(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleGuardar = async (datos) => {
    if (vista && vista !== "nuevo" && vista !== "lista") {
      await actualizarTaller(vista.id, datos);
    } else {
      await crearTaller(datos);
    }
    await cargar();
    setVista("lista");
  };

  const handleToggle = async (taller) => {
    setToggling(taller.id);
    try {
      const res = await toggleTaller(taller.id);
      setTalleres((prev) => prev.map((t) => t.id === taller.id ? { ...t, esta_activo: res.esta_activo } : t));
    } catch (e) {
      console.error(e);
    } finally {
      setToggling(null);
    }
  };

  const handleEliminar = async (taller) => {
    if (!confirm(`¿Eliminar el taller "${taller.titulo}"? Esta acción no se puede deshacer.`)) return;
    setEliminando(taller.id);
    try {
      await eliminarTaller(taller.id);
      setTalleres((prev) => prev.filter((t) => t.id !== taller.id));
    } catch (e) {
      console.error(e);
    } finally {
      setEliminando(null);
    }
  };

  // Vista inscritos
  if (vista?.tipo === "inscritos") {
    const t = vista.taller;
    const inscritosFiltrados = inscritos.filter((i) =>
      filtroInscripcion === "todos" ? true : i.estado === filtroInscripcion
    );
    const conteoInsc = {
      todos:     inscritos.length,
      pendiente: inscritos.filter(i => i.estado === "pendiente").length,
      aceptado:  inscritos.filter(i => i.estado === "aceptado").length,
      rechazado: inscritos.filter(i => i.estado === "rechazado").length,
    };

    return (
      <div>
        <PageHeader
          title={`Inscritos — ${t.titulo}`}
          subtitle={`${inscritos.length} inscripción${inscritos.length !== 1 ? "es" : ""} · ${t.area || ""} · ${t.modalidad || ""}`}
          action={
            <button
              onClick={() => setVista("lista")}
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border ${B} ${M} hover:border-purple-500 transition-colors`}
            >
              <Icon icon="mdi:arrow-left" width={16} />
              Volver a talleres
            </button>
          }
        />

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap mb-5">
          {[
            { key: "todos",     label: "Todos",     color: "" },
            { key: "pendiente", label: "Pendientes", color: "text-amber-600" },
            { key: "aceptado",  label: "Aceptados",  color: "text-green-600" },
            { key: "rechazado", label: "Rechazados", color: "text-red-500"   },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltroInscripcion(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filtroInscripcion === key
                  ? "bg-purple-600 text-white border-purple-600"
                  : `${B} ${M} hover:border-purple-500 hover:text-purple-500`
              }`}
            >
              {label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                filtroInscripcion === key ? "bg-white/20 text-white" : isDark ? "bg-[#3a3a38] text-[#888780]" : "bg-[#F0F4F8] text-[#5F5E5A]"
              }`}>{conteoInsc[key]}</span>
            </button>
          ))}
        </div>

        {loadingInscritos ? (
          <div className={`flex items-center justify-center py-20 gap-2 ${M}`}>
            <Icon icon="mdi:loading" width={24} className="animate-spin" />
            Cargando inscritos...
          </div>
        ) : inscritosFiltrados.length === 0 ? (
          <div className={`rounded-xl border ${B} ${BG} p-16 text-center`}>
            <Icon icon="mdi:account-group-outline" width={44} className={`mx-auto mb-3 ${M}`} />
            <p className={`text-sm font-medium ${T}`}>
              {inscritos.length === 0 ? "Aún no hay inscripciones en este taller" : `Sin inscripciones con estado "${filtroInscripcion}"`}
            </p>
          </div>
        ) : (
          <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
            {inscritosFiltrados.map((ins, i) => {
              const estadoCfg = {
                pendiente: { label: "Pendiente", color: "bg-amber-100 text-amber-700",  icon: "mdi:clock-outline"         },
                aceptado:  { label: "Aceptado",  color: "bg-green-100 text-green-700",  icon: "mdi:check-circle-outline"  },
                rechazado: { label: "Rechazado", color: "bg-red-100 text-red-600",      icon: "mdi:close-circle-outline"  },
              }[ins.estado] || { label: ins.estado, color: "bg-gray-100 text-gray-600", icon: "mdi:help-circle-outline" };

              return (
                <div
                  key={ins.id}
                  className={`flex items-center gap-4 px-5 py-4 ${i < inscritosFiltrados.length - 1 ? `border-b ${B}` : ""}`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#0F4D8A] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {ins.nombre_completo?.[0]?.toUpperCase() || "?"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Link
                        to={`/admin/candidato/${ins.estudiante_id}`}
                        className={`text-sm font-semibold ${T} hover:text-purple-600 transition-colors`}
                      >
                        {ins.nombre_completo}
                      </Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoCfg.color}`}>
                        <Icon icon={estadoCfg.icon} width={11} className="inline mr-1" />
                        {estadoCfg.label}
                      </span>
                    </div>
                    <div className={`flex gap-3 text-xs ${M}`}>
                      <span>{ins.carrera || "Sin carrera"}</span>
                      {ins.promedio && <span>Promedio: {ins.promedio}</span>}
                      {ins.calificacion_docente && <span>Eval. docente: {ins.calificacion_docente}</span>}
                      <span>{new Date(ins.fecha_creacion).toLocaleDateString("es-CL")}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {ins.estado !== "aceptado" && (
                      <button
                        onClick={() => handleEstadoInscripcion(ins.id, "aceptado")}
                        disabled={actualizando === ins.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          isDark ? "bg-green-900/40 hover:bg-green-900/60 text-green-400" : "bg-green-50 hover:bg-green-100 text-green-700"
                        } disabled:opacity-40`}
                      >
                        <Icon icon={actualizando === ins.id ? "mdi:loading" : "mdi:check"} width={14} className={actualizando === ins.id ? "animate-spin" : ""} />
                        Aceptar
                      </button>
                    )}
                    {ins.estado !== "rechazado" && (
                      <button
                        onClick={() => handleEstadoInscripcion(ins.id, "rechazado")}
                        disabled={actualizando === ins.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          isDark ? "bg-red-900/40 hover:bg-red-900/60 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-600"
                        } disabled:opacity-40`}
                      >
                        <Icon icon="mdi:close" width={14} />
                        Rechazar
                      </button>
                    )}
                    {ins.estado !== "pendiente" && (
                      <button
                        onClick={() => handleEstadoInscripcion(ins.id, "pendiente")}
                        disabled={actualizando === ins.id}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-[#3a3a38]" : "hover:bg-[#F0F4F8]"} ${M}`}
                        title="Volver a pendiente"
                      >
                        <Icon icon="mdi:refresh" width={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Vista crear/editar
  if (vista !== "lista") {
    return (
      <TallerForm
        taller={vista === "nuevo" ? null : vista}
        onGuardar={handleGuardar}
        onCancelar={() => setVista("lista")}
        isDark={isDark}
      />
    );
  }

  // Vista lista
  const filtrados = talleres
    .filter((t) => filtro === "activos" ? t.esta_activo : filtro === "inactivos" ? !t.esta_activo : true)
    .filter((t) => !busqueda || t.titulo?.toLowerCase().includes(busqueda.toLowerCase()) || t.area?.toLowerCase().includes(busqueda.toLowerCase()));

  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const paginados = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  const conteos = {
    todos:     talleres.length,
    activos:   talleres.filter((t) => t.esta_activo).length,
    inactivos: talleres.filter((t) => !t.esta_activo).length,
  };

  return (
    <div>
      <PageHeader
        title="Gestión de Talleres"
        subtitle={`${talleres.length} taller${talleres.length !== 1 ? "es" : ""} registrado${talleres.length !== 1 ? "s" : ""}`}
        action={
          <button
            onClick={() => setVista("nuevo")}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
          >
            <Icon icon="mdi:plus" width={16} />
            Nuevo taller
          </button>
        }
      />

      {/* Filtros + búsqueda */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "todos",     label: "Todos"     },
            { key: "activos",   label: "Activos"   },
            { key: "inactivos", label: "Inactivos" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setFiltro(key); setPagina(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filtro === key
                  ? "bg-purple-600 text-white border-purple-600"
                  : `${B} ${M} hover:border-purple-500 hover:text-purple-500`
              }`}
            >
              {label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                filtro === key ? "bg-white/20 text-white" : isDark ? "bg-[#3a3a38] text-[#888780]" : "bg-[#F0F4F8] text-[#5F5E5A]"
              }`}>{conteos[key]}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Icon icon="mdi:search" width={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${M}`} />
          <input
            type="text"
            placeholder="Buscar taller..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            className={`pl-8 pr-3 py-1.5 rounded-lg text-sm outline-none border transition-all focus:border-purple-500 w-48 ${
              isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                     : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
            }`}
          />
        </div>
      </div>

      {loading ? (
        <div className={`flex items-center justify-center py-20 gap-2 ${M}`}>
          <Icon icon="mdi:loading" width={24} className="animate-spin" />
          Cargando talleres...
        </div>
      ) : filtrados.length === 0 ? (
        <div className={`rounded-xl border ${B} ${BG} p-16 text-center`}>
          <Icon icon="mdi:school-outline" width={44} className={`mx-auto mb-3 ${M}`} />
          <p className={`text-sm font-medium ${T}`}>
            {busqueda ? `Sin resultados para "${busqueda}"` : "No hay talleres aún. ¡Crea el primero!"}
          </p>
        </div>
      ) : (
        <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
          {paginados.map((t, i) => {
            const gratuito = !t.costo || Number(t.costo) === 0;
            const costoStr = gratuito ? "Gratuito" : `$${Number(t.costo).toLocaleString("es-CL")}`;
            return (
              <div
                key={t.id}
                className={`flex items-start gap-4 px-5 py-4 ${i < paginados.length - 1 ? `border-b ${B}` : ""} ${!t.esta_activo ? "opacity-60" : ""}`}
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Icon icon="mdi:school-outline" width={20} className="text-purple-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-0.5">
                    <p className={`text-sm font-semibold ${T} truncate`}>{t.titulo}</p>
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.esta_activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {t.esta_activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className={`flex flex-wrap gap-3 text-xs ${M} mt-1`}>
                    {t.area && (
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:tag-outline" width={12} className="text-purple-500" />
                        {t.area}
                      </span>
                    )}
                    {t.modalidad && (
                      <span className="flex items-center gap-1 capitalize">
                        <Icon icon="mdi:map-marker-outline" width={12} />
                        {t.modalidad}
                      </span>
                    )}
                    {t.duracion && (
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:clock-outline" width={12} />
                        {t.duracion}
                      </span>
                    )}
                    {t.horario && (
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:calendar-clock-outline" width={12} />
                        {t.horario}
                      </span>
                    )}
                    <span className={`flex items-center gap-1 font-medium ${gratuito ? "text-green-600" : "text-amber-600"}`}>
                      <Icon icon={gratuito ? "mdi:gift-outline" : "mdi:currency-usd"} width={12} />
                      {costoStr}
                    </span>
                    {t.cupos != null && (
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:account-group-outline" width={12} />
                        {t.cupos} cupos
                      </span>
                    )}
                    {t.fecha_inicio && (
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:calendar-start" width={12} />
                        {new Date(t.fecha_inicio).toLocaleDateString("es-CL")}
                      </span>
                    )}
                  </div>
                  {t.descripcion && (
                    <p className={`text-xs ${M} mt-1 line-clamp-2`}>{t.descripcion}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setVista({ tipo: "inscritos", taller: t });
                      setFiltroInscripcion("todos");
                      cargarInscritos(t.id);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isDark ? "bg-purple-900/40 hover:bg-purple-900/60 text-purple-400" : "bg-purple-50 hover:bg-purple-100 text-purple-700"
                    }`}
                    title="Ver inscritos"
                  >
                    <Icon icon="mdi:account-group-outline" width={14} />
                    Inscritos
                  </button>
                  <button
                    onClick={() => setVista(t)}
                    className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-[#3a3a38]" : "hover:bg-[#F0F4F8]"} ${M}`}
                    title="Editar"
                  >
                    <Icon icon="mdi:pencil-outline" width={16} />
                  </button>
                  <button
                    onClick={() => handleToggle(t)}
                    disabled={toggling === t.id}
                    className={`p-2 rounded-lg transition-colors ${
                      t.esta_activo
                        ? `${isDark ? "hover:bg-orange-900/30" : "hover:bg-orange-50"} text-orange-500`
                        : `${isDark ? "hover:bg-green-900/30" : "hover:bg-green-50"} text-green-600`
                    } disabled:opacity-40`}
                    title={t.esta_activo ? "Desactivar" : "Activar"}
                  >
                    <Icon icon={toggling === t.id ? "mdi:loading" : t.esta_activo ? "mdi:eye-off-outline" : "mdi:eye-outline"} width={16} className={toggling === t.id ? "animate-spin" : ""} />
                  </button>
                  <button
                    onClick={() => handleEliminar(t)}
                    disabled={eliminando === t.id}
                    className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-red-900/30" : "hover:bg-red-50"} text-red-500 disabled:opacity-40`}
                    title="Eliminar"
                  >
                    <Icon icon={eliminando === t.id ? "mdi:loading" : "mdi:trash-can-outline"} width={16} className={eliminando === t.id ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtrados.length > 0 && (
        <Paginacion
          paginaActual={pagina}
          totalPaginas={totalPaginas}
          onCambiar={setPagina}
          porPagina={porPagina}
          opciones={[3, 6, 9, 15]}
          onCambiarPorPagina={(n) => { setPorPagina(n); setPagina(1); }}
        />
      )}
    </div>
  );
}
