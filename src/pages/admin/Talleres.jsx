import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, PageHeader, Paginacion } from "../../components/ui";
import { getTalleres, crearTaller, actualizarTaller, toggleTaller, eliminarTaller } from "../../services/api";

const MODALIDADES = ["presencial", "remoto", "hibrido"];

const FORM_VACÍO = {
  titulo: "", descripcion: "", requisitos: "", area: "", modalidad: "presencial",
  duracion: "", horario: "", costo: "", direccion: "", fecha_inicio: "", fecha_limite: "", cupos: "",
};

function TallerFormModal({ taller, onGuardar, onCancelar, isDark, T, M, B, BG }) {
  const [form, setForm] = useState(taller ? {
    titulo:      taller.titulo      || "",
    descripcion: taller.descripcion || "",
    requisitos:  taller.requisitos  || "",
    area:        taller.area        || "",
    modalidad:   taller.modalidad   || "presencial",
    duracion:    taller.duracion    || "",
    horario:     taller.horario     || "",
    costo:       taller.costo != null ? String(taller.costo) : "",
    direccion:   taller.direccion   || "",
    fecha_inicio: taller.fecha_inicio ? taller.fecha_inicio.split("T")[0] : "",
    fecha_limite: taller.fecha_limite ? taller.fecha_limite.split("T")[0] : "",
    cupos:       taller.cupos != null ? String(taller.cupos) : "",
  } : FORM_VACÍO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const inputCls = `w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
    isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
           : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
  }`;
  const labelCls = `block text-xs mb-1 ${isDark ? "text-[#B4B2A9]" : "text-[#5F5E5A]"}`;

  const handleSubmit = async () => {
    if (!form.titulo.trim()) { setError("El título es requerido"); return; }
    setGuardando(true); setError("");
    try {
      const datos = {
        ...form,
        costo:       form.costo !== "" ? Number(form.costo) : 0,
        cupos:       form.cupos !== "" ? Number(form.cupos) : null,
        fecha_inicio: form.fecha_inicio || null,
        fecha_limite: form.fecha_limite || null,
      };
      await onGuardar(datos);
    } catch (e) {
      setError(e.message || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const F = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancelar}>
      <div className={`w-full max-w-xl rounded-2xl p-6 shadow-xl ${BG} max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        <h3 className={`text-base font-semibold ${T} mb-4`}>{taller ? "Editar taller" : "Nuevo taller"}</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelCls}>Título *</label>
            <input value={form.titulo} onChange={F("titulo")} placeholder="Nombre del taller" className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Descripción</label>
            <textarea value={form.descripcion} onChange={F("descripcion")} rows={3} placeholder="¿De qué trata el taller?" className={`${inputCls} resize-none`} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Requisitos</label>
            <textarea value={form.requisitos} onChange={F("requisitos")} rows={2} placeholder="¿Qué necesitan saber o tener los participantes?" className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className={labelCls}>Área</label>
            <input value={form.area} onChange={F("area")} placeholder="Ej: Mecánica Automotriz" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Modalidad</label>
            <select value={form.modalidad} onChange={F("modalidad")} className={inputCls}>
              {MODALIDADES.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Duración</label>
            <input value={form.duracion} onChange={F("duracion")} placeholder="Ej: 8 horas, 2 semanas" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Horario</label>
            <input value={form.horario} onChange={F("horario")} placeholder="Ej: Sábados 9:00–13:00" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Costo ($) — 0 = Gratuito</label>
            <input type="number" min="0" value={form.costo} onChange={F("costo")} placeholder="0" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Cupos (vacío = sin límite)</label>
            <input type="number" min="1" value={form.cupos} onChange={F("cupos")} placeholder="Sin límite" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Fecha inicio</label>
            <input type="date" value={form.fecha_inicio} onChange={F("fecha_inicio")} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Fecha límite inscripción</label>
            <input type="date" value={form.fecha_limite} onChange={F("fecha_limite")} className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Dirección</label>
            <input value={form.direccion} onChange={F("direccion")} placeholder="Ej: Av. Matta 123, Lo Espejo" className={inputCls} />
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

        <div className="flex gap-2 justify-end mt-5">
          <button onClick={onCancelar} className={`px-4 py-2 text-sm rounded-lg border ${B} ${M} hover:border-[#378ADD] transition-colors`}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={guardando}
            className="px-4 py-2 text-sm rounded-lg font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50"
          >
            {guardando ? "Guardando..." : taller ? "Guardar cambios" : "Publicar taller"}
          </button>
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
  const S  = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";

  const [talleres, setTalleres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalForm, setModalForm] = useState(null);   // null | "nuevo" | taller object
  const [toggling, setToggling]   = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [busqueda, setBusqueda]   = useState("");
  const [filtro, setFiltro]       = useState("todos"); // "todos" | "activos" | "inactivos"
  const [pagina, setPagina]       = useState(1);
  const [porPagina, setPorPagina] = useState(6);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getTalleres(true); // admin ve todos
      setTalleres(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleGuardar = async (datos) => {
    if (modalForm && modalForm !== "nuevo") {
      await actualizarTaller(modalForm.id, datos);
    } else {
      await crearTaller(datos);
    }
    await cargar();
    setModalForm(null);
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
            onClick={() => setModalForm("nuevo")}
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
                {/* Icono */}
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Icon icon="mdi:school-outline" width={20} className="text-purple-600" />
                </div>

                {/* Info */}
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

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setModalForm(t)}
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

      {modalForm !== null && (
        <TallerFormModal
          taller={modalForm === "nuevo" ? null : modalForm}
          onGuardar={handleGuardar}
          onCancelar={() => setModalForm(null)}
          isDark={isDark} T={T} M={M} B={B} BG={BG}
        />
      )}
    </div>
  );
}
