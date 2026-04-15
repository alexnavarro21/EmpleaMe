import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Badge, Card, StatCard, PageHeader, Paginacion } from "../../components/ui";
import {
  getTalleres, crearTaller, actualizarTaller, toggleTaller, eliminarTaller,
  getInscritosTaller, getInscritosPendientesTalleres, actualizarEstadoInscripcion,
} from "../../services/api";

const MODALIDADES = ["presencial", "remoto", "hibrido"];

const FORM_VACÍO = {
  titulo: "", descripcion: "", requisitos: "", area: "", modalidad: "presencial",
  duracion: "", horario: "", costo: "", direccion: "", fecha_inicio: "", fecha_limite: "", cupos: "",
  permite_inscripcion: true,
};

function tiempoRelativo(fecha) {
  if (!fecha) return "Ahora mismo";
  const diff = Math.floor((Date.now() - new Date(fecha)) / 1000);
  if (diff < 60)    return "Ahora mismo";
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

// ── Preview del post en el muro ───────────────────────────────────────────────
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
      <div className="px-4 pb-1">
        <p className={`text-sm font-semibold ${T}`}>{form.titulo || "Título del taller"}</p>
      </div>
      {form.descripcion && (
        <div className="px-4 pb-3">
          <p className={`text-sm leading-relaxed ${T}`}>{form.descripcion}</p>
        </div>
      )}
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
      <div className={`border-t ${B}`} />
      <div className="flex items-center px-2 py-1">
        <div className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium flex-1 justify-center ${M}`}>
          <Icon icon="mdi:thumb-up-outline" width={16} /> Me interesa
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium flex-1 justify-center ${M}`}>
          <Icon icon="mdi:information-outline" width={16} /> Ver más
        </div>
        {form.permite_inscripcion && (
          <div className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium flex-1 justify-center text-purple-600`}>
            <Icon icon="mdi:clipboard-plus-outline" width={16} /> Inscribirse
          </div>
        )}
      </div>
      {!form.permite_inscripcion && (
        <div className={`mx-4 mb-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${isDark ? "bg-[#1e1e1c] text-[#888780]" : "bg-[#F7F6F3] text-[#5F5E5A]"}`}>
          <Icon icon="mdi:open-in-new" width={14} />
          Taller informativo — sin inscripción directa
        </div>
      )}
    </div>
  );
}

// ── Formulario crear/editar (página completa) ─────────────────────────────────
function TallerForm({ taller, onGuardar, onCancelar, isDark }) {
  const T  = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";

  const [form, setForm] = useState(taller ? {
    titulo:              taller.titulo      || "",
    descripcion:         taller.descripcion || "",
    requisitos:          taller.requisitos  || "",
    area:                taller.area        || "",
    modalidad:           taller.modalidad   || "presencial",
    duracion:            taller.duracion    || "",
    horario:             taller.horario     || "",
    costo:               taller.costo != null ? String(taller.costo) : "",
    direccion:           taller.direccion   || "",
    fecha_inicio:        taller.fecha_inicio ? taller.fecha_inicio.split("T")[0] : "",
    fecha_limite:        taller.fecha_limite ? taller.fecha_limite.split("T")[0] : "",
    cupos:               taller.cupos != null ? String(taller.cupos) : "",
    permite_inscripcion: taller.permite_inscripcion != null ? Boolean(taller.permite_inscripcion) : true,
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
          <button onClick={onCancelar} className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border ${B} ${M} hover:border-purple-500 transition-colors`}>
            <Icon icon="mdi:arrow-left" width={16} />
            Volver al panel
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-4`}>Información del taller</h3>

            <div className="mb-4">
              <label className={labelCls}>Título *</label>
              <input value={form.titulo} onChange={F("titulo")} placeholder="Ej: Taller de Soldadura Básica" className={inputCls} />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Descripción</label>
              <textarea value={form.descripcion} onChange={F("descripcion")} rows={3} placeholder="¿De qué trata el taller?" className={`${inputCls} resize-none`} />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Requisitos</label>
              <textarea value={form.requisitos} onChange={F("requisitos")} rows={2} placeholder="¿Qué deben saber los participantes?" className={`${inputCls} resize-none`} />
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
                    <button key={m} type="button" onClick={() => setForm((f) => ({ ...f, modalidad: m }))}
                      className={`py-2 rounded-lg border text-center text-xs font-medium transition-all capitalize ${
                        form.modalidad === m
                          ? "border-2 border-purple-500 bg-purple-50 text-purple-700"
                          : `border ${B} ${M} hover:border-purple-400`
                      }`}>{m}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className={labelCls}>Duración</label><input value={form.duracion} onChange={F("duracion")} placeholder="Ej: 8 horas" className={inputCls} /></div>
              <div><label className={labelCls}>Horario</label><input value={form.horario} onChange={F("horario")} placeholder="Ej: Sábados 9:00–13:00" className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className={labelCls}>Costo ($) — 0 = Gratuito</label><input type="number" min="0" value={form.costo} onChange={F("costo")} placeholder="0" className={inputCls} /></div>
              <div><label className={labelCls}>Cupos (vacío = sin límite)</label><input type="number" min="1" value={form.cupos} onChange={F("cupos")} placeholder="Sin límite" className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className={labelCls}>Fecha de inicio</label><input type="date" value={form.fecha_inicio} onChange={F("fecha_inicio")} className={inputCls} /></div>
              <div><label className={labelCls}>Fecha límite inscripción</label><input type="date" value={form.fecha_limite} onChange={F("fecha_limite")} className={inputCls} /></div>
            </div>
            <div className="mb-4">
              <label className={labelCls}>Dirección</label>
              <input value={form.direccion} onChange={F("direccion")} placeholder="Ej: Av. Matta 123, Lo Espejo" className={inputCls} />
            </div>

            {/* ── Sección inscripciones ── */}
            <div className={`mt-2 mb-4 rounded-lg border ${B} overflow-hidden`}>
              <div className={`px-4 py-3 ${isDark ? "bg-[#1e1e1c]" : "bg-[#F7F6F3]"}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${M}`}>Inscripciones</p>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {[
                  {
                    value: true,
                    icon: "mdi:clipboard-plus-outline",
                    label: "Permite inscripción directa",
                    desc:  "Los estudiantes pueden inscribirse desde el muro. El centro gestiona las inscripciones.",
                  },
                  {
                    value: false,
                    icon: "mdi:open-in-new",
                    label: "Solo informativo (externo / recomendado)",
                    desc:  "El taller es de terceros o no requiere gestión interna. No se muestra el botón de inscripción.",
                  },
                ].map(({ value, icon, label, desc }) => {
                  const active = form.permite_inscripcion === value;
                  return (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, permite_inscripcion: value }))}
                      className={`flex items-start gap-3 text-left p-3 rounded-lg border-2 transition-all ${
                        active
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                          : `${B} ${isDark ? "hover:border-[#555]" : "hover:border-[#B4B2A9]"}`
                      }`}
                    >
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        active ? "bg-purple-600 text-white" : isDark ? "bg-[#313130] text-[#888780]" : "bg-[#E8E6E1] text-[#5F5E5A]"
                      }`}>
                        <Icon icon={icon} width={16} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${active ? "text-purple-700" : T}`}>{label}</p>
                        <p className={`text-xs mt-0.5 ${M}`}>{desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <div className="flex gap-3 mt-2">
              <button onClick={handleSubmit} disabled={guardando}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50">
                <Icon icon={guardando ? "mdi:loading" : "mdi:check"} width={16} className={guardando ? "animate-spin" : ""} />
                {guardando ? "Guardando..." : taller ? "Guardar cambios" : "Publicar taller"}
              </button>
              <button onClick={onCancelar} className={`flex-1 py-2.5 text-sm rounded-lg border ${B} ${M} hover:border-purple-500 transition-colors`}>
                Cancelar
              </button>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <p className={`text-sm font-semibold ${T} mb-1`}>Vista previa del post</p>
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

// ── Vista de inscritos de un taller específico ────────────────────────────────
function InscritosView({ taller, onVolver, isDark }) {
  const T  = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";

  const [inscritos, setInscritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(null);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    getInscritosTaller(taller.id)
      .then(setInscritos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [taller.id]);

  const handleEstado = async (id, estado) => {
    setActualizando(id);
    try {
      await actualizarEstadoInscripcion(id, estado);
      setInscritos((prev) => prev.map((i) => i.id === id ? { ...i, estado } : i));
    } catch (e) { console.error(e); }
    finally { setActualizando(null); }
  };

  const filtrados = inscritos.filter((i) => filtro === "todos" ? true : i.estado === filtro);
  const conteos = {
    todos:     inscritos.length,
    pendiente: inscritos.filter(i => i.estado === "pendiente").length,
    aceptado:  inscritos.filter(i => i.estado === "aceptado").length,
    rechazado: inscritos.filter(i => i.estado === "rechazado").length,
  };

  return (
    <div>
      <PageHeader
        title={`Inscritos — ${taller.titulo}`}
        subtitle={`${inscritos.length} inscripción${inscritos.length !== 1 ? "es" : ""} · ${taller.area || ""} · ${taller.modalidad || ""}`}
        action={
          <button onClick={onVolver} className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border ${B} ${M} hover:border-purple-500 transition-colors`}>
            <Icon icon="mdi:arrow-left" width={16} /> Volver al panel
          </button>
        }
      />

      <div className="flex gap-2 flex-wrap mb-5">
        {[
          { key: "todos",     label: "Todos"      },
          { key: "pendiente", label: "Pendientes" },
          { key: "aceptado",  label: "Aceptados"  },
          { key: "rechazado", label: "Rechazados" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFiltro(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filtro === key ? "bg-purple-600 text-white border-purple-600" : `${B} ${M} hover:border-purple-500 hover:text-purple-500`
            }`}>
            {label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
              filtro === key ? "bg-white/20 text-white" : isDark ? "bg-[#3a3a38] text-[#888780]" : "bg-[#F0F4F8] text-[#5F5E5A]"
            }`}>{conteos[key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className={`flex items-center justify-center py-20 gap-2 ${M}`}>
          <Icon icon="mdi:loading" width={24} className="animate-spin" /> Cargando...
        </div>
      ) : filtrados.length === 0 ? (
        <div className={`rounded-xl border ${B} ${BG} p-16 text-center`}>
          <Icon icon="mdi:account-group-outline" width={44} className={`mx-auto mb-3 ${M}`} />
          <p className={`text-sm font-medium ${T}`}>{inscritos.length === 0 ? "Aún no hay inscripciones" : `Sin inscripciones "${filtro}"`}</p>
        </div>
      ) : (
        <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
          {filtrados.map((ins, i) => {
            const cfg = {
              pendiente: { label: "Pendiente", color: isDark ? "bg-amber-500/15 text-amber-400"  : "bg-amber-100 text-amber-700" },
              aceptado:  { label: "Aceptado",  color: isDark ? "bg-green-500/15 text-green-400"  : "bg-green-100 text-green-700" },
              rechazado: { label: "Rechazado", color: isDark ? "bg-red-500/15 text-red-400"      : "bg-red-100 text-red-600"     },
            }[ins.estado] || { label: ins.estado, color: isDark ? "bg-[#3a3a38] text-[#888780]" : "bg-gray-100 text-gray-600" };
            return (
              <div key={ins.id} className={`flex items-center gap-4 px-5 py-4 ${i < filtrados.length - 1 ? `border-b ${B}` : ""}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${isDark ? "bg-purple-500/15 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
                  {ins.nombre_completo?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link to={`/admin/candidato/${ins.estudiante_id}`} className={`text-sm font-semibold ${T} hover:text-purple-600 transition-colors`}>
                      {ins.nombre_completo}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <p className={`text-xs ${M}`}>
                    {ins.carrera || "Sin carrera"} {ins.promedio ? `· Promedio: ${ins.promedio}` : ""}
                    {" · "}{new Date(ins.fecha_creacion).toLocaleDateString("es-CL")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {ins.estado !== "aceptado" && (
                    <button onClick={() => handleEstado(ins.id, "aceptado")} disabled={actualizando === ins.id}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${isDark ? "bg-green-500/15 text-green-400 hover:bg-green-500/25" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                      Aceptar
                    </button>
                  )}
                  {ins.estado !== "rechazado" && (
                    <button onClick={() => handleEstado(ins.id, "rechazado")} disabled={actualizando === ins.id}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${isDark ? "bg-red-500/15 text-red-400 hover:bg-red-500/25" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
                      Rechazar
                    </button>
                  )}
                  {ins.estado !== "pendiente" && (
                    <button onClick={() => handleEstado(ins.id, "pendiente")} disabled={actualizando === ins.id}
                      className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-[#3a3a38]" : "hover:bg-[#F0F4F8]"} ${M}`} title="Volver a pendiente">
                      <Icon icon="mdi:refresh" width={14} />
                    </button>
                  )}
                  <Link to={`/admin/candidato/${ins.estudiante_id}`} className={`${M} hover:text-purple-600 transition-colors`}>
                    <Icon icon="mdi:chevron-right" width={20} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function AdminTalleres() {
  const { isDark } = useDark();
  const T  = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S  = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";

  const [talleres, setTalleres] = useState([]);
  const [inscritosPendientes, setInscritosPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState("panel"); // "panel" | "nuevo" | taller (editar) | { tipo:"inscritos", taller }
  const [toggling, setToggling] = useState(null);
  const [actualizando, setActualizando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(6);

  const cargar = async () => {
    setLoading(true);
    try {
      const [talls, pends] = await Promise.all([
        getTalleres(true),
        getInscritosPendientesTalleres(),
      ]);
      setTalleres(talls);
      setInscritosPendientes(pends);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const handleGuardar = async (datos) => {
    if (vista && vista !== "nuevo" && vista !== "panel") {
      await actualizarTaller(vista.id, datos);
    } else {
      await crearTaller(datos);
    }
    await cargar();
    setVista("panel");
  };

  const handleToggle = async (taller) => {
    setToggling(taller.id);
    try {
      const res = await toggleTaller(taller.id);
      setTalleres((prev) => prev.map((t) => t.id === taller.id ? { ...t, esta_activo: res.esta_activo } : t));
    } catch (e) { console.error(e); }
    finally { setToggling(null); }
  };

  const handleEliminar = async (taller) => {
    if (!confirm(`¿Eliminar "${taller.titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarTaller(taller.id);
      setTalleres((prev) => prev.filter((t) => t.id !== taller.id));
    } catch (e) { console.error(e); }
  };

  const handleEstadoInscripcion = async (id, estado) => {
    setActualizando(id);
    try {
      await actualizarEstadoInscripcion(id, estado);
      setInscritosPendientes((prev) => prev.filter((i) => i.id !== id));
    } catch (e) { console.error(e); }
    finally { setActualizando(null); }
  };

  // ── Vistas secundarias ────────────────────────────────────────────────────
  if (vista?.tipo === "inscritos") {
    return <InscritosView taller={vista.taller} onVolver={() => setVista("panel")} isDark={isDark} />;
  }
  if (vista !== "panel") {
    return (
      <TallerForm
        taller={vista === "nuevo" ? null : vista}
        onGuardar={handleGuardar}
        onCancelar={() => setVista("panel")}
        isDark={isDark}
      />
    );
  }

  // ── Vista principal del panel ─────────────────────────────────────────────
  const tallActivos   = talleres.filter((t) => t.esta_activo).length;
  const tallInactivos = talleres.length - tallActivos;
  const totalInscritos = talleres.reduce((a, t) => a + (Number(t.total_inscritos) || 0), 0);

  const talleresFiltrados = talleres.filter((t) =>
    !busqueda || t.titulo?.toLowerCase().includes(busqueda.toLowerCase()) || t.area?.toLowerCase().includes(busqueda.toLowerCase())
  );
  const totalPaginas = Math.ceil(talleresFiltrados.length / porPagina);
  const talleresPagina = talleresFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-24 ${M}`}>
        <Icon icon="mdi:loading" width={28} className="animate-spin mr-2" />
        Cargando...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Panel de Talleres"
        subtitle="C.E. Cardenal J.M. Caro"
        action={
          <button
            onClick={() => setVista("nuevo")}
            className="flex items-center gap-2 text-base font-semibold bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Icon icon="mdi:plus" width={20} />
            Nuevo taller
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Talleres activos"    value={String(tallActivos)}            sub={`${talleres.length} en total`}    subColor="text-purple-600" />
        <StatCard label="Talleres inactivos"  value={String(tallInactivos)}          sub="Cerrados o pausados"              subColor="text-[#888780]" />
        <StatCard label="Total inscritos"     value={String(totalInscritos)}         sub="Acumulado"                        subColor="text-[#378ADD]" />
        <StatCard label="Inscritos pendientes" value={String(inscritosPendientes.length)} sub="Sin revisar"                subColor="text-amber-500" />
      </div>

      {/* Panel 2 columnas */}
      <div className="grid grid-cols-2 gap-6">

        {/* ── Mis talleres ── */}
        <Card>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <h2 className={`text-sm font-semibold ${T} flex items-center gap-2 flex-1`}>
              <Icon icon="mdi:school-outline" width={16} className="text-purple-600" />
              Mis talleres
            </h2>
            {talleres.length > 0 && (
              <div className="relative">
                <Icon icon="mdi:search" width={13} className={`absolute left-2 top-1/2 -translate-y-1/2 ${M}`} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={busqueda}
                  onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
                  className={`pl-7 pr-2 py-1.5 rounded-lg text-xs outline-none border transition-all focus:border-purple-500 w-32 ${
                    isDark ? "bg-[#262624] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                           : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
                  }`}
                />
              </div>
            )}
            <button onClick={() => setVista("nuevo")} className="text-xs text-purple-600 hover:underline">+ Nuevo</button>
          </div>

          {talleres.length === 0 ? (
            <p className={`text-xs ${M} text-center py-8`}>No hay talleres publicados aún.</p>
          ) : talleresFiltrados.length === 0 ? (
            <p className={`text-xs ${M} text-center py-6`}>Sin resultados para "{busqueda}".</p>
          ) : (
            <div className="flex flex-col gap-3">
              {talleresPagina.map((t) => {
                const gratuito = !t.costo || Number(t.costo) === 0;
                return (
                  <div key={t.id} className={`p-3 rounded-lg border ${B} ${!t.esta_activo ? "opacity-60" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-medium ${T} truncate pr-2`}>{t.titulo}</p>
                      <Badge color={t.esta_activo ? "green" : "gray"}>
                        {t.esta_activo ? "activo" : "inactivo"}
                      </Badge>
                    </div>
                    <p className={`text-xs ${M} mb-2 capitalize`}>
                      {t.area || "Sin área"} · {t.modalidad || "presencial"} · {gratuito ? "Gratuito" : `$${Number(t.costo).toLocaleString("es-CL")}`}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs ${M}`}>{t.total_inscritos || 0} inscritos</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(t)}
                          disabled={toggling === t.id}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                            t.esta_activo
                              ? isDark ? "bg-red-500/15 text-red-400 hover:bg-red-500/25" : "bg-red-50 text-red-600 hover:bg-red-100"
                              : isDark ? "bg-purple-500/15 text-purple-400 hover:bg-purple-500/25" : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                          } disabled:opacity-50`}
                        >
                          <Icon icon={toggling === t.id ? "mdi:loading" : t.esta_activo ? "mdi:pause-circle-outline" : "mdi:play-circle-outline"}
                            width={14} className={toggling === t.id ? "animate-spin" : ""} />
                          {t.esta_activo ? "Desactivar" : "Activar"}
                        </button>
                        <button onClick={() => setVista(t)} className={`${M} hover:text-purple-600 transition-colors`} title="Editar">
                          <Icon icon="mdi:pencil-outline" width={15} />
                        </button>
                        <button onClick={() => handleEliminar(t)} className={`${M} hover:text-red-500 transition-colors`} title="Eliminar">
                          <Icon icon="mdi:trash-can-outline" width={15} />
                        </button>
                        <button
                          onClick={() => setVista({ tipo: "inscritos", taller: t })}
                          className="text-xs text-purple-600 hover:underline"
                        >
                          Ver inscritos →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Paginacion
            paginaActual={pagina}
            totalPaginas={totalPaginas}
            onCambiar={setPagina}
            porPagina={porPagina}
            opciones={[3, 6, 9, 15]}
            onCambiarPorPagina={(n) => { setPorPagina(n); setPagina(1); }}
          />
        </Card>

        {/* ── Inscritos pendientes ── */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-sm font-semibold ${T} flex items-center gap-2`}>
              <Icon icon="mdi:account-group-outline" width={16} className="text-purple-600" />
              Inscritos pendientes
            </h2>
          </div>

          {inscritosPendientes.length === 0 ? (
            <p className={`text-xs ${M} text-center py-8`}>No hay inscripciones pendientes.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {inscritosPendientes.slice(0, 6).map((ins) => (
                <div key={ins.id} className={`flex items-center gap-3 p-3 rounded-lg border ${B}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100`}>
                    <Icon icon="mynaui:user-solid" width={20} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${T} truncate`}>{ins.nombre_completo}</p>
                      <Badge color="purple">pendiente</Badge>
                    </div>
                    <p className={`text-xs ${M}`}>
                      {ins.carrera} {ins.promedio ? `· Nota: ${parseFloat(ins.promedio).toFixed(1)}` : ""}
                    </p>
                    {ins.taller_titulo && (
                      <p className="text-xs text-purple-600 truncate">
                        <Icon icon="mdi:school-outline" width={11} className="inline mr-0.5 mb-0.5" />
                        {ins.taller_titulo}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEstadoInscripcion(ins.id, "aceptado")}
                      disabled={actualizando === ins.id}
                      className={`text-xs px-2 py-1 rounded transition-colors disabled:opacity-50 ${isDark ? "bg-green-500/15 text-green-400 hover:bg-green-500/25" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => handleEstadoInscripcion(ins.id, "rechazado")}
                      disabled={actualizando === ins.id}
                      className={`text-xs px-2 py-1 rounded transition-colors disabled:opacity-50 ${isDark ? "bg-red-500/15 text-red-400 hover:bg-red-500/25" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                    >
                      Rechazar
                    </button>
                    <Link to={`/admin/candidato/${ins.estudiante_id}`} className={`${M} hover:text-purple-600 transition-colors`}>
                      <Icon icon="mdi:chevron-right" width={20} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
