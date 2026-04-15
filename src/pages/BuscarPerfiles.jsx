import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { Card, Badge, PrimaryButton } from "../components/ui";
import {
  getEstudiantes, getEmpresas, getVacantes, getTalleres,
  iniciarMensajeDirecto, iniciarConversacionConEmpresa,
  postularAVacante, inscribirseEnTaller, getMediaUrl,
} from "../services/api";
import { REGIONES_COMUNAS, REGIONES } from "../data/regionesComunas";

const careerDisplay = {
  Administracion: "Administración",
  "Mecanica Automotriz": "Mecánica Automotriz",
};

const CATEGORIAS = [
  { id: "estudiantes", icon: "mynaui:user-solid",           label: "Estudiantes" },
  { id: "empresas",    icon: "mdi:office-building-outline", label: "Empresas"    },
  { id: "vacantes",    icon: "mdi:briefcase-outline",       label: "Vacantes"    },
  { id: "talleres",    icon: "mdi:school-outline",          label: "Talleres"    },
];

// ── Modal Vacante ─────────────────────────────────────────────────────────────
function VacanteModal({ vacante, role, onClose }) {
  const { isDark } = useDark();
  const [estado, setEstado] = useState("idle"); // idle | loading | ok | duplicado | error

  const T  = isDark ? "text-[#D3D1C7]"   : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]"   : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#E8E6E1]";
  const BG = isDark ? "bg-[#1e1e1c]"     : "bg-white";
  const S  = isDark ? "bg-[#262624]"     : "bg-[#F7F6F3]";

  const handlePostular = async () => {
    if (estado !== "idle") return;
    setEstado("loading");
    try {
      await postularAVacante(vacante.id);
      setEstado("ok");
    } catch (err) {
      const msg = err.message?.toLowerCase();
      if (msg?.includes("ya") || msg?.includes("duplic")) setEstado("duplicado");
      else setEstado("error");
    }
  };

  const infoItems = [
    vacante.tipo      && { icon: vacante.tipo === "puesto_laboral" ? "mdi:briefcase-outline" : "mdi:school-outline", label: vacante.tipo === "puesto_laboral" ? "Puesto laboral" : "Práctica profesional", color: vacante.tipo === "puesto_laboral" ? "text-green-500" : "text-orange-500" },
    vacante.area      && { icon: "mdi:tag-outline",           label: vacante.area,      color: "text-[#378ADD]" },
    vacante.modalidad && { icon: "mdi:map-marker-outline",    label: vacante.modalidad  },
    vacante.duracion  && { icon: "mdi:clock-outline",         label: vacante.duracion   },
    vacante.remuneracion && { icon: "mdi:currency-usd",       label: vacante.remuneracion },
    vacante.direccion && { icon: "mdi:map-outline",           label: vacante.direccion  },
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className={`relative w-full max-w-lg max-h-[88vh] flex flex-col rounded-2xl shadow-2xl border ${B} ${BG}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`px-5 py-4 border-b ${B} flex items-start justify-between gap-3`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className={`text-base font-semibold ${T} leading-snug`}>{vacante.titulo}</p>
              <Badge color={vacante.tipo === "puesto_laboral" ? "green" : "orange"}>
                {vacante.tipo === "puesto_laboral" ? "Puesto laboral" : "Práctica"}
              </Badge>
            </div>
            <p className="text-sm font-medium text-[#378ADD]">{vacante.nombre_empresa}</p>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg hover:${S} transition-colors ${M} flex-shrink-0`}>
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">
          {/* Info chips */}
          <div className={`flex flex-wrap gap-3 p-3 rounded-xl border ${B} ${S}`}>
            {infoItems.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Icon icon={item.icon} width={14} className={item.color || M} />
                <span className={`text-xs ${item.color || M} capitalize`}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Descripción */}
          {vacante.descripcion && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${M} mb-1.5`}>Descripción</p>
              <p className={`text-sm leading-relaxed ${T}`}>{vacante.descripcion}</p>
            </div>
          )}

          {/* Habilidades requeridas */}
          {vacante.habilidades?.length > 0 && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${M} mb-2`}>Habilidades requeridas</p>
              <div className="flex flex-wrap gap-1.5">
                {vacante.habilidades.map((h) => (
                  <Badge key={h.id} color={h.categoria === "blanda" ? "purple" : "blue"}>{h.nombre}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer acción */}
        {role === "estudiante" && (
          <div className={`px-5 py-3 border-t ${B}`}>
            <button
              onClick={handlePostular}
              disabled={estado !== "idle"}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                estado === "ok"        ? (isDark ? "bg-green-500/15 text-green-400" : "bg-green-100 text-green-700")
                : estado === "duplicado" ? (isDark ? "bg-amber-500/15 text-amber-400" : "bg-amber-100 text-amber-700")
                : estado === "error"     ? (isDark ? "bg-red-500/15 text-red-400"   : "bg-red-100 text-red-700")
                : estado === "loading"   ? (isDark ? "bg-[#0F4D8A]/50 text-[#85B7EB]" : "bg-[#0F4D8A]/70 text-white")
                : "bg-[#0F4D8A] hover:bg-[#0A3A6A] text-white"
              }`}
            >
              <Icon
                icon={
                  estado === "ok"        ? "mdi:check-circle-outline"
                  : estado === "duplicado" ? "mdi:information-outline"
                  : estado === "error"     ? "mdi:alert-circle-outline"
                  : estado === "loading"   ? "mdi:loading"
                  : "mdi:send-outline"
                }
                width={16}
                className={estado === "loading" ? "animate-spin" : ""}
              />
              {estado === "ok"        ? "¡Postulación enviada!"
               : estado === "duplicado" ? "Ya postulaste a esta vacante"
               : estado === "error"     ? "Error al postular"
               : estado === "loading"   ? "Postulando..."
               : "Postular"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Modal Taller ──────────────────────────────────────────────────────────────
function TallerModal({ taller, role, onClose }) {
  const { isDark } = useDark();
  const [estado, setEstado] = useState("idle"); // idle | loading | ok | duplicado | sin_cupos | error

  const T  = isDark ? "text-[#D3D1C7]"   : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]"   : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#E8E6E1]";
  const BG = isDark ? "bg-[#1e1e1c]"     : "bg-white";
  const S  = isDark ? "bg-[#262624]"     : "bg-[#F7F6F3]";

  const puedeInscribirse = role === "estudiante" &&
    (taller.esta_activo === true || taller.esta_activo === 1) &&
    (taller.permite_inscripcion === true || taller.permite_inscripcion === 1);

  const handleInscribirse = async () => {
    if (estado !== "idle") return;
    setEstado("loading");
    try {
      await inscribirseEnTaller(taller.id);
      setEstado("ok");
    } catch (err) {
      const msg = err.message?.toLowerCase();
      if (msg?.includes("ya estás") || msg?.includes("ya te"))  setEstado("duplicado");
      else if (msg?.includes("cupos"))                            setEstado("sin_cupos");
      else                                                        setEstado("error");
    }
  };

  const gratuito = !taller.costo || parseFloat(taller.costo) === 0;
  const costoStr = gratuito ? "Gratuito" : `$${Number(taller.costo).toLocaleString("es-CL")}`;

  const infoItems = [
    taller.area      && { icon: "mdi:tag-outline",            label: taller.area,      color: "text-purple-500" },
    taller.modalidad && { icon: "mdi:map-marker-outline",     label: taller.modalidad  },
    taller.duracion  && { icon: "mdi:clock-outline",          label: taller.duracion   },
    taller.horario   && { icon: "mdi:calendar-clock-outline", label: taller.horario    },
    taller.cupos != null && { icon: "mdi:account-group-outline", label: `${taller.cupos_disponibles ?? taller.cupos} cupos disponibles` },
    taller.fecha_inicio && { icon: "mdi:calendar-start",      label: new Date(taller.fecha_inicio).toLocaleDateString("es-CL") },
    { icon: gratuito ? "mdi:gift-outline" : "mdi:currency-usd", label: costoStr, color: gratuito ? "text-green-500" : "text-amber-500" },
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className={`relative w-full max-w-lg max-h-[88vh] flex flex-col rounded-2xl shadow-2xl border ${B} ${BG}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`px-5 py-4 border-b ${B} flex items-start justify-between gap-3`}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:school-outline" width={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-base font-semibold ${T} leading-snug`}>{taller.titulo}</p>
              <p className={`text-xs ${M}`}>C.E. Cardenal J.M. Caro</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge color={taller.esta_activo ? "green" : "gray"}>{taller.esta_activo ? "Activo" : "Cerrado"}</Badge>
            <button onClick={onClose} className={`p-1.5 rounded-lg hover:${S} transition-colors ${M}`}>
              <Icon icon="mdi:close" width={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">
          {/* Info chips */}
          <div className={`flex flex-wrap gap-3 p-3 rounded-xl border ${B} ${S}`}>
            {infoItems.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Icon icon={item.icon} width={14} className={item.color || M} />
                <span className={`text-xs ${item.color || M} capitalize`}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Descripción */}
          {taller.descripcion && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${M} mb-1.5`}>Descripción</p>
              <p className={`text-sm leading-relaxed ${T}`}>{taller.descripcion}</p>
            </div>
          )}

          {!puedeInscribirse && role === "estudiante" && (
            <p className={`text-xs ${M} text-center`}>
              {!taller.esta_activo ? "Este taller no está activo actualmente." : "Este taller es solo informativo, no acepta inscripciones."}
            </p>
          )}
        </div>

        {/* Footer acción */}
        {puedeInscribirse && (
          <div className={`px-5 py-3 border-t ${B}`}>
            <button
              onClick={handleInscribirse}
              disabled={estado !== "idle"}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                estado === "ok"        ? (isDark ? "bg-green-500/15 text-green-400"  : "bg-green-100 text-green-700")
                : estado === "duplicado" ? (isDark ? "bg-amber-500/15 text-amber-400" : "bg-amber-100 text-amber-700")
                : estado === "sin_cupos" ? (isDark ? "bg-red-500/15 text-red-400"    : "bg-red-100 text-red-700")
                : estado === "error"     ? (isDark ? "bg-red-500/15 text-red-400"    : "bg-red-100 text-red-700")
                : estado === "loading"   ? (isDark ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-700")
                : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              <Icon
                icon={
                  estado === "ok"        ? "mdi:check-circle-outline"
                  : estado === "duplicado" ? "mdi:information-outline"
                  : estado === "sin_cupos" ? "mdi:account-cancel-outline"
                  : estado === "error"     ? "mdi:alert-circle-outline"
                  : estado === "loading"   ? "mdi:loading"
                  : "mdi:school-outline"
                }
                width={16}
                className={estado === "loading" ? "animate-spin" : ""}
              />
              {estado === "ok"        ? "¡Inscripción enviada!"
               : estado === "duplicado" ? "Ya estás inscrito"
               : estado === "sin_cupos" ? "Sin cupos disponibles"
               : estado === "error"     ? "Error al inscribirse"
               : estado === "loading"   ? "Inscribiendo..."
               : "Inscribirse"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function BuscarPerfiles() {
  const { isDark } = useDark();
  const location  = useLocation();
  const navigate  = useNavigate();

  const [tab,            setTab]            = useState("estudiantes");
  const [students,       setStudents]       = useState([]);
  const [companies,      setCompanies]      = useState([]);
  const [vacantes,       setVacantes]       = useState([]);
  const [talleres,       setTalleres]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [selectedCareer, setSelectedCareer] = useState("Todas");
  const [minGpa,         setMinGpa]         = useState(1);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedComuna, setSelectedComuna] = useState("");
  const [contactandoId,      setContactandoId]      = useState(null);
  const [modalVacante,       setModalVacante]       = useState(null);
  const [modalTaller,        setModalTaller]        = useState(null);
  const [selectedHabilidades, setSelectedHabilidades] = useState([]);
  const [habBusqueda,         setHabBusqueda]         = useState("");
  const [selectedModalidad,   setSelectedModalidad]   = useState("");
  const [filtroPrecio,        setFiltroPrecio]        = useState("todas"); // todas | gratuito | pago
  const [filtroRemuneracion,  setFiltroRemuneracion]  = useState("todas"); // todas | con_paga | sin_paga
  const [minEvalDocente,      setMinEvalDocente]      = useState(1);

  const T  = isDark ? "text-[#D3D1C7]"   : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]"   : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S  = isDark ? "bg-[#313130]"     : "bg-[#F7F6F3]";
  const BG = isDark ? "bg-[#262624]"     : "bg-white";

  const role = location.pathname.startsWith("/admin")
    ? "admin"
    : location.pathname.startsWith("/empresa")
    ? "empresa"
    : "estudiante";

  const candidatoBase =
    role === "empresa" ? "/empresa/candidato" :
    role === "admin"   ? "/admin/candidato"   : "/estudiante/candidato";

  useEffect(() => {
    Promise.allSettled([getEstudiantes(), getEmpresas(), getVacantes(), getTalleres(true)])
      .then(([sts, cos, vacs, tals]) => {
        if (sts.status  === "fulfilled") setStudents(sts.value);
        if (cos.status  === "fulfilled") setCompanies(cos.value);
        if (vacs.status === "fulfilled") setVacantes(vacs.value);
        if (tals.status === "fulfilled") setTalleres(tals.value);
      })
      .finally(() => setLoading(false));
  }, []);

  const uniqueCareers = ["Todas", ...new Set(students.map((s) => s.carrera).filter(Boolean))];
  const uniqueAreas   = ["Todas", ...new Set(
    (tab === "vacantes" ? vacantes : talleres).map((x) => x.area).filter(Boolean)
  )];
  const uniqueHabilidades = [...new Set(
    tab === "estudiantes"
      ? students.flatMap((s) => s.habilidades || [])
      : tab === "vacantes"
      ? vacantes.flatMap((v) => (v.habilidades || []).map((h) => h.nombre))
      : []
  )].sort();

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    const nombreCarrera = careerDisplay[s.carrera] || s.carrera;
    if (!(s.nombre_completo.toLowerCase().includes(q) || (s.habilidades || []).some((sk) => sk.toLowerCase().includes(q)))) return false;
    if (!(selectedCareer === "Todas" || s.carrera === selectedCareer || nombreCarrera === selectedCareer)) return false;
    if (s.promedio && s.promedio < minGpa) return false;
    if (minEvalDocente > 1 && s.calificacion_docente && parseFloat(s.calificacion_docente) < minEvalDocente) return false;
    if (selectedRegion && s.region !== selectedRegion) return false;
    if (selectedComuna && s.comuna !== selectedComuna) return false;
    if (selectedHabilidades.length > 0) {
      const sHabs = (s.habilidades || []).map((h) => h.toLowerCase());
      if (!selectedHabilidades.some((h) => sHabs.includes(h.toLowerCase()))) return false;
    }
    return true;
  });

  const filteredCompanies = companies.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.nombre_empresa.toLowerCase().includes(q) || (c.descripcion || "").toLowerCase().includes(q)) &&
      (!selectedRegion || c.region === selectedRegion) &&
      (!selectedComuna || c.comuna === selectedComuna)
    );
  });

  const filteredVacantes = vacantes.filter((v) => {
    const q = search.toLowerCase();
    if (!(v.titulo?.toLowerCase().includes(q) || v.nombre_empresa?.toLowerCase().includes(q) || v.area?.toLowerCase().includes(q))) return false;
    if (selectedCareer && selectedCareer !== "Todas" && v.area !== selectedCareer) return false;
    if (selectedModalidad && v.modalidad?.toLowerCase() !== selectedModalidad) return false;
    if (filtroRemuneracion === "con_paga"  && !v.remuneracion?.trim()) return false;
    if (filtroRemuneracion === "sin_paga"  &&  v.remuneracion?.trim()) return false;
    if (selectedHabilidades.length > 0) {
      const vHabs = (v.habilidades || []).map((h) => h.nombre.toLowerCase());
      if (!selectedHabilidades.some((h) => vHabs.includes(h.toLowerCase()))) return false;
    }
    return true;
  });

  const filteredTalleres = talleres.filter((t) => {
    const q = search.toLowerCase();
    if (!(t.titulo?.toLowerCase().includes(q) || t.area?.toLowerCase().includes(q) || t.descripcion?.toLowerCase().includes(q))) return false;
    if (selectedCareer && selectedCareer !== "Todas" && t.area !== selectedCareer) return false;
    if (selectedModalidad && t.modalidad?.toLowerCase() !== selectedModalidad) return false;
    const costo = parseFloat(t.costo) || 0;
    if (filtroPrecio === "gratuito" && costo > 0) return false;
    if (filtroPrecio === "pago"     && costo <= 0) return false;
    if (selectedHabilidades.length > 0) {
      const tHabs = (t.habilidades || []).map((h) => (h.nombre || h).toLowerCase());
      if (!selectedHabilidades.some((h) => tHabs.includes(h.toLowerCase()))) return false;
    }
    return true;
  });

  const countMap = {
    estudiantes: filteredStudents.length,
    empresas:    filteredCompanies.length,
    vacantes:    filteredVacantes.length,
    talleres:    filteredTalleres.length,
  };
  const count = countMap[tab] ?? 0;
  const tabLabel = { estudiantes: "estudiante", empresas: "empresa", vacantes: "vacante", talleres: "taller" }[tab];
  const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}");

  const limpiarFiltros = () => { setSearch(""); setSelectedCareer("Todas"); setMinGpa(1); setMinEvalDocente(1); setSelectedRegion(""); setSelectedComuna(""); setSelectedHabilidades([]); setHabBusqueda(""); setSelectedModalidad(""); setFiltroPrecio("todas"); setFiltroRemuneracion("todas"); };

  const handleContactarEstudiante = async (id) => {
    setContactandoId(id);
    try { const c = await iniciarMensajeDirecto(id); navigate("/estudiante/mensajeria", { state: { directaId: c.id } }); }
    catch (e) { console.error(e); } finally { setContactandoId(null); }
  };

  const handleContactarEmpresa = async (id) => {
    setContactandoId(id);
    try { const c = await iniciarConversacionConEmpresa(id); navigate("/estudiante/mensajeria", { state: { conversacionId: c.id } }); }
    catch (e) { console.error(e); } finally { setContactandoId(null); }
  };

  const selectCls = `w-full px-2.5 py-2 rounded-lg text-xs outline-none border focus:border-[#378ADD] transition-colors ${
    isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]" : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
  }`;

  if (loading) return (
    <div className={`flex items-center justify-center py-24 ${M}`}>
      <Icon icon="mdi:loading" width={28} className="animate-spin mr-2" />Cargando...
    </div>
  );

  return (
    <div>
      {modalVacante && <VacanteModal vacante={modalVacante} role={role} onClose={() => setModalVacante(null)} />}
      {modalTaller  && <TallerModal  taller={modalTaller}  role={role} onClose={() => setModalTaller(null)}  />}

      <div className="mb-6">
        <h1 className={`text-xl font-bold ${T}`}>Búsqueda</h1>
        <p className={`text-sm ${M} mt-0.5`}>{count} {tabLabel}{count !== 1 ? "s" : ""} encontrado{count !== 1 ? "s" : ""}</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* ── Panel izquierdo ── */}
        <div className="flex flex-col gap-4">
          <Card>
            <p className={`text-sm font-semibold ${T} mb-4`}>Filtros</p>

            {/* Categoría */}
            <div className="mb-5">
              <label className={`block text-xs mb-2 ${M}`}>Categoría</label>
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setTab(cat.id); limpiarFiltros(); }}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg mb-1 transition-colors flex items-center gap-2 ${
                    tab === cat.id ? "bg-[#0F4D8A] text-[#E6F1FB]" : `${T} hover:bg-[#0F4D8A]/10`
                  }`}
                >
                  <Icon icon={cat.icon} width={14} />
                  {cat.label}
                  <span className={`ml-auto text-xs font-semibold ${tab === cat.id ? "text-[#85B7EB]" : M}`}>{countMap[cat.id]}</span>
                </button>
              ))}
            </div>

            {/* Filtro carrera (estudiantes) */}
            {tab === "estudiantes" && (
              <>
                <div className={`border-t ${B} pt-4 mb-4`}>
                  <label className={`block text-xs mb-2 ${M}`}>Carrera técnica</label>
                  {uniqueCareers.map((c) => {
                    const label = careerDisplay[c] || c;
                    const isActive = selectedCareer === c || (selectedCareer !== "Todas" && (careerDisplay[selectedCareer] || selectedCareer) === label);
                    return (
                      <button key={c} onClick={() => setSelectedCareer(c)}
                        className={`w-full text-left text-sm px-3 py-1.5 rounded-lg mb-1 transition-colors flex items-center gap-2 ${
                          isActive ? "bg-[#0F4D8A] text-[#E6F1FB]" : `${T} hover:bg-[#0F4D8A]/10`
                        }`}
                      >
                        <Icon icon={c.includes("Mecánica") || c.includes("Mecanica") ? "mdi:car-wrench" : c === "Todas" ? "mdi:account-group-outline" : "mdi:clipboard-list-outline"} width={14} />
                        {label}
                      </button>
                    );
                  })}
                </div>
                {role !== "estudiante" && (
                  <>
                    <div className="mb-4">
                      <label className={`block text-xs mb-2 ${M}`}>
                        Nota mínima: <strong className={T}>{minGpa > 1 ? minGpa.toFixed(1) : "Sin filtro"}</strong>
                      </label>
                      <input type="range" min="1" max="7" step="0.1" value={minGpa} onChange={(e) => setMinGpa(parseFloat(e.target.value))} className="w-full accent-[#0F4D8A]" />
                      <div className={`flex justify-between text-xs ${M} mt-1`}><span>1.0</span><span>4.0</span><span>7.0</span></div>
                    </div>
                    <div className="mb-4">
                      <label className={`block text-xs mb-2 ${M}`}>
                        Eval. docente mín.: <strong className={T}>{minEvalDocente > 1 ? minEvalDocente.toFixed(1) : "Sin filtro"}</strong>
                      </label>
                      <input type="range" min="1" max="7" step="0.1" value={minEvalDocente} onChange={(e) => setMinEvalDocente(parseFloat(e.target.value))} className="w-full accent-[#378ADD]" />
                      <div className={`flex justify-between text-xs ${M} mt-1`}><span>1.0</span><span>4.0</span><span>7.0</span></div>
                      <p className={`text-xs ${M} mt-1`}>Solo filtra estudiantes con evaluación registrada</p>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Filtro área (vacantes / talleres) */}
            {(tab === "vacantes" || tab === "talleres") && uniqueAreas.length > 1 && (
              <div className={`border-t ${B} pt-4 mb-4`}>
                <label className={`block text-xs mb-2 ${M}`}>Área</label>
                {uniqueAreas.map((a) => (
                  <button key={a} onClick={() => setSelectedCareer(a)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg mb-1 transition-colors flex items-center gap-2 ${
                      selectedCareer === a || (!selectedCareer && a === "Todas") ? "bg-[#0F4D8A] text-[#E6F1FB]" : `${T} hover:bg-[#0F4D8A]/10`
                    }`}
                  >
                    <Icon icon={a === "Todas" ? "mdi:view-grid-outline" : "mdi:tag-outline"} width={14} />
                    {a}
                  </button>
                ))}
              </div>
            )}

            {/* Filtro modalidad (vacantes / talleres) */}
            {(tab === "vacantes" || tab === "talleres") && (
              <div className={`border-t ${B} pt-4 mb-4`}>
                <label className={`block text-xs mb-2 ${M}`}>Modalidad</label>
                {[
                  { value: "",           label: "Todas",      icon: "mdi:view-grid-outline"  },
                  { value: "presencial", label: "Presencial", icon: "streamline:city-hall-remix" },
                  { value: "remoto",     label: "Remoto",     icon: "mdi:monitor-outline"     },
                  { value: "hibrido",    label: "Híbrido",    icon: "mdi:home-work-outline"   },
                ].map((m) => (
                  <button key={m.value} onClick={() => setSelectedModalidad(m.value)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg mb-1 transition-colors flex items-center gap-2 ${
                      selectedModalidad === m.value ? "bg-[#0F4D8A] text-[#E6F1FB]" : `${T} hover:bg-[#0F4D8A]/10`
                    }`}
                  >
                    <Icon icon={m.icon} width={14} />
                    {m.label}
                  </button>
                ))}
              </div>
            )}

            {/* Filtro remuneración (vacantes) */}
            {tab === "vacantes" && (
              <div className={`border-t ${B} pt-4 mb-4`}>
                <label className={`block text-xs mb-2 ${M}`}>Remuneración</label>
                {[
                  { value: "todas",    label: "Todas",         icon: "mdi:view-grid-outline"   },
                  { value: "con_paga", label: "Con paga",      icon: "mdi:currency-usd"        },
                  { value: "sin_paga", label: "Sin paga",      icon: "mdi:currency-usd-off"    },
                ].map((r) => (
                  <button key={r.value} onClick={() => setFiltroRemuneracion(r.value)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg mb-1 transition-colors flex items-center gap-2 ${
                      filtroRemuneracion === r.value ? "bg-[#0F4D8A] text-[#E6F1FB]" : `${T} hover:bg-[#0F4D8A]/10`
                    }`}
                  >
                    <Icon icon={r.icon} width={14} />
                    {r.label}
                  </button>
                ))}
              </div>
            )}

            {/* Filtro precio (talleres) */}
            {tab === "talleres" && (
              <div className={`border-t ${B} pt-4 mb-4`}>
                <label className={`block text-xs mb-2 ${M}`}>Precio</label>
                {[
                  { value: "todas",   label: "Todos",    icon: "mdi:view-grid-outline" },
                  { value: "gratuito",label: "Gratuito", icon: "mdi:gift-outline"      },
                  { value: "pago",    label: "De pago",  icon: "mdi:currency-usd"      },
                ].map((p) => (
                  <button key={p.value} onClick={() => setFiltroPrecio(p.value)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg mb-1 transition-colors flex items-center gap-2 ${
                      filtroPrecio === p.value ? "bg-[#0F4D8A] text-[#E6F1FB]" : `${T} hover:bg-[#0F4D8A]/10`
                    }`}
                  >
                    <Icon icon={p.icon} width={14} />
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Filtro habilidades (estudiantes / vacantes / talleres) */}
            {uniqueHabilidades.length > 0 && (
              <div className={`border-t ${B} pt-4 mb-4`}>
                <label className={`block text-xs mb-2 ${M}`}>Habilidades</label>

                {/* Chips seleccionados */}
                {selectedHabilidades.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedHabilidades.map((h) => (
                      <button key={h} onClick={() => setSelectedHabilidades((prev) => prev.filter((x) => x !== h))}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#0F4D8A] text-white"
                      >
                        {h} <Icon icon="mdi:close" width={11} />
                      </button>
                    ))}
                  </div>
                )}

                {/* Buscador de habilidades */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${B} ${S} mb-2`}>
                  <Icon icon="mdi:magnify" width={13} className={M} />
                  <input
                    type="text"
                    value={habBusqueda}
                    onChange={(e) => setHabBusqueda(e.target.value)}
                    placeholder="Buscar habilidad..."
                    className={`flex-1 bg-transparent text-xs outline-none ${T} placeholder-[#B4B2A9]`}
                  />
                  {habBusqueda && (
                    <button type="button" onClick={() => setHabBusqueda("")}>
                      <Icon icon="mdi:close-circle" width={13} className={M} />
                    </button>
                  )}
                </div>

                {/* Lista filtrada */}
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {uniqueHabilidades
                    .filter((h) => !selectedHabilidades.includes(h) && (!habBusqueda || h.toLowerCase().includes(habBusqueda.toLowerCase())))
                    .slice(0, 30)
                    .map((h) => (
                      <button key={h} onClick={() => setSelectedHabilidades((prev) => [...prev, h])}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${B} ${M} hover:border-[#378ADD] hover:text-[#378ADD]`}
                      >
                        {h}
                      </button>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Región/comuna (estudiantes y empresas) */}
            {(tab === "estudiantes" || tab === "empresas") && (
              <div className={`${tab === "estudiantes" ? "" : `border-t ${B} pt-4`} mb-4`}>
                <label className={`block text-xs mb-1.5 ${M}`}>Región</label>
                <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setSelectedComuna(""); }} className={selectCls}>
                  <option value="">Todas las regiones</option>
                  {REGIONES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {selectedRegion && (
                  <div className="mt-2">
                    <label className={`block text-xs mb-1.5 ${M}`}>Comuna</label>
                    <select value={selectedComuna} onChange={(e) => setSelectedComuna(e.target.value)} className={selectCls}>
                      <option value="">Todas las comunas</option>
                      {(REGIONES_COMUNAS[selectedRegion] || []).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}

            <button onClick={limpiarFiltros} className="mt-1 w-full text-xs text-[#378ADD] hover:underline">Limpiar filtros</button>
          </Card>
        </div>

        {/* ── Resultados ── */}
        <div className="col-span-3 flex flex-col gap-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Icon icon="mdi:search" width={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${M}`} />
            <input
              type="text"
              placeholder={{ estudiantes: "Buscar por nombre o habilidad...", empresas: "Buscar por nombre o descripción...", vacantes: "Buscar por título, empresa o área...", talleres: "Buscar por título o área..." }[tab]}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none border-2 transition-all focus:border-[#378ADD] shadow-sm ${
                isDark ? "bg-[#262624] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]" : "bg-white border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
              }`}
            />
            {search && (
              <button onClick={() => setSearch("")} className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${M} hover:text-red-400 transition-colors`}>
                <Icon icon="mdi:close-circle" width={16} />
              </button>
            )}
          </div>

          {/* Estudiantes */}
          {tab === "estudiantes" && (
            <div className="grid grid-cols-2 gap-4">
              {filteredStudents.map((s) => {
                const nombreCarrera = careerDisplay[s.carrera] || s.carrera;
                return (
                  <Card key={s.usuario_id} className="hover:border-[#378ADD] transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      {s.foto_perfil ? (
                        <img src={getMediaUrl(s.foto_perfil)} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                          <Icon icon="mynaui:user-solid" width={22} className="text-[#378ADD]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${T} truncate`}>{s.nombre_completo}</p>
                        <p className={`text-xs ${M}`}>{nombreCarrera}{s.semestre ? ` · Sem. ${s.semestre}` : ""}</p>
                        {(s.comuna || s.region) && (
                          <p className={`text-xs ${M} flex items-center gap-1`}><Icon icon="mdi:map-marker-outline" width={11} />{[s.comuna, s.region].filter(Boolean).join(", ")}</p>
                        )}
                      </div>
                    </div>
                    {role !== "estudiante" && (
                      <div className={`flex gap-4 mb-3 pb-3 border-b ${B}`}>
                        <div><p className={`text-xs ${M}`}>Promedio</p><p className={`text-sm font-semibold ${T}`}>{s.promedio ? parseFloat(s.promedio).toFixed(1) : "—"}</p></div>
                        {s.calificacion_docente && (
                          <div><p className={`text-xs ${M}`}>Eval. docente</p>
                            <p className={`text-sm font-semibold ${T} flex items-center gap-1`}><Icon icon="solar:star-bold-duotone" width={14} className="text-yellow-400" />{parseFloat(s.calificacion_docente).toFixed(1)}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {s.habilidades?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {s.habilidades.slice(0, 3).map((sk) => <Badge key={sk} color="blue">{sk}</Badge>)}
                        {s.habilidades.length > 3 && <span className={`text-xs ${M}`}>+{s.habilidades.length - 3} más</span>}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link to={`${candidatoBase}/${s.usuario_id}`} className="flex-1">
                        <PrimaryButton className="w-full">Ver perfil</PrimaryButton>
                      </Link>
                      {role === "estudiante" && s.usuario_id !== usuarioActual.id && (
                        <button onClick={() => handleContactarEstudiante(s.usuario_id)} disabled={contactandoId === s.usuario_id} title="Enviar mensaje"
                          className="px-3 py-2 rounded-lg border border-[#378ADD] text-[#378ADD] hover:bg-[#378ADD] hover:text-white transition-colors disabled:opacity-50 flex items-center">
                          <Icon icon={contactandoId === s.usuario_id ? "mdi:loading" : "mdi:message-outline"} width={16} className={contactandoId === s.usuario_id ? "animate-spin" : ""} />
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
              {filteredStudents.length === 0 && <EmptyState T={T} M={M} />}
            </div>
          )}

          {/* Empresas */}
          {tab === "empresas" && (
            <div className="grid grid-cols-2 gap-4">
              {filteredCompanies.map((c) => (
                <Card key={c.usuario_id} className="hover:border-[#378ADD] transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    {c.foto_perfil ? (
                      <img src={getMediaUrl(c.foto_perfil)} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#0F4D8A] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                        {c.nombre_empresa?.[0]?.toUpperCase() ?? "E"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${T} truncate`}>{c.nombre_empresa}</p>
                      <p className={`text-xs ${M} flex items-center gap-1`}><Icon icon="mdi:briefcase-outline" width={12} />{c.total_vacantes || 0} vacante{c.total_vacantes !== 1 ? "s" : ""} activa{c.total_vacantes !== 1 ? "s" : ""}</p>
                      {(c.comuna || c.region) && (
                        <p className={`text-xs ${M} flex items-center gap-1`}><Icon icon="mdi:map-marker-outline" width={11} />{[c.comuna, c.region].filter(Boolean).join(", ")}</p>
                      )}
                    </div>
                    <Badge color="blue">Empresa</Badge>
                  </div>
                  {c.descripcion && <p className={`text-xs ${M} mb-3 line-clamp-2`}>{c.descripcion}</p>}
                  {c.telefono_contacto && <div className={`flex items-center gap-1.5 text-xs ${M} mb-3`}><Icon icon="mdi:phone-outline" width={13} />{c.telefono_contacto}</div>}
                  <div className="flex gap-2 mt-2">
                    <Link to={`/empresa-publica/${c.usuario_id}`} className="flex-1"><PrimaryButton className="w-full">Ver perfil</PrimaryButton></Link>
                    {role === "estudiante" && (
                      <button onClick={() => handleContactarEmpresa(c.usuario_id)} disabled={contactandoId === c.usuario_id} title="Enviar mensaje"
                        className="px-3 py-2 rounded-lg border border-[#378ADD] text-[#378ADD] hover:bg-[#378ADD] hover:text-white transition-colors disabled:opacity-50 flex items-center">
                        <Icon icon={contactandoId === c.usuario_id ? "mdi:loading" : "mdi:message-outline"} width={16} className={contactandoId === c.usuario_id ? "animate-spin" : ""} />
                      </button>
                    )}
                  </div>
                </Card>
              ))}
              {filteredCompanies.length === 0 && <EmptyState T={T} M={M} />}
            </div>
          )}

          {/* Vacantes */}
          {tab === "vacantes" && (
            <div className="grid grid-cols-2 gap-4">
              {filteredVacantes.map((v) => (
                <Card key={v.id} className="hover:border-[#378ADD] transition-colors cursor-pointer flex flex-col" onClick={() => setModalVacante(v)}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className={`text-sm font-semibold ${T} leading-snug`}>{v.titulo}</p>
                    <Badge color={v.tipo === "puesto_laboral" ? "green" : "orange"} className="flex-shrink-0">
                      {v.tipo === "puesto_laboral" ? "Puesto laboral" : "Práctica"}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-[#378ADD] mb-2">{v.nombre_empresa}</p>
                  <div className={`flex flex-wrap gap-x-3 gap-y-1 text-xs ${M} mb-3`}>
                    {v.area     && <span className="flex items-center gap-1"><Icon icon="mdi:tag-outline" width={12}/>{v.area}</span>}
                    {v.modalidad && <span className="flex items-center gap-1"><Icon icon="mdi:map-marker-outline" width={12}/>{v.modalidad}</span>}
                    {v.duracion  && <span className="flex items-center gap-1"><Icon icon="mdi:clock-outline" width={12}/>{v.duracion}</span>}
                  </div>
                  {v.habilidades?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {v.habilidades.slice(0, 3).map((h) => <Badge key={h.id} color="blue">{h.nombre}</Badge>)}
                      {v.habilidades.length > 3 && <span className={`text-xs ${M}`}>+{v.habilidades.length - 3} más</span>}
                    </div>
                  )}
                  <div className="mt-auto pt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setModalVacante(v)} className={`flex-1 py-2 rounded-lg text-xs font-medium border ${isDark ? "border-[#3a3a38] text-[#D3D1C7] hover:bg-[#313130]" : "border-[#D3D1C7] text-[#2C2C2A] hover:bg-[#F7F6F3]"} transition-colors`}>
                      Ver más
                    </button>
                    {role === "estudiante" && (
                      <PrimaryButton className="flex-1 text-xs py-2" onClick={() => setModalVacante(v)}>Postular</PrimaryButton>
                    )}
                  </div>
                </Card>
              ))}
              {filteredVacantes.length === 0 && <EmptyState T={T} M={M} />}
            </div>
          )}

          {/* Talleres */}
          {tab === "talleres" && (
            <div className="grid grid-cols-2 gap-4">
              {filteredTalleres.map((t) => {
                const puedeInscribirse = (t.esta_activo === true || t.esta_activo === 1) && (t.permite_inscripcion === true || t.permite_inscripcion === 1);
                return (
                  <Card key={t.id} className="hover:border-[#378ADD] transition-colors cursor-pointer flex flex-col" onClick={() => setModalTaller(t)}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className={`text-sm font-semibold ${T} leading-snug`}>{t.titulo}</p>
                      <Badge color={t.esta_activo ? "green" : "gray"}>{t.esta_activo ? "Activo" : "Cerrado"}</Badge>
                    </div>
                    <div className={`flex flex-wrap gap-x-3 gap-y-1 text-xs ${M} mb-3`}>
                      {t.area      && <span className="flex items-center gap-1"><Icon icon="mdi:tag-outline" width={12}/>{t.area}</span>}
                      {t.modalidad && <span className="flex items-center gap-1"><Icon icon="mdi:map-marker-outline" width={12}/>{t.modalidad}</span>}
                      {t.cupos != null && (
                        <span className="flex items-center gap-1"><Icon icon="mdi:account-group-outline" width={12}/>{t.cupos_disponibles ?? t.cupos} cupos</span>
                      )}
                    </div>
                    {t.descripcion && <p className={`text-xs ${M} line-clamp-2 mb-3`}>{t.descripcion}</p>}
                    <div className="mt-auto pt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setModalTaller(t)} className={`flex-1 py-2 rounded-lg text-xs font-medium border ${isDark ? "border-[#3a3a38] text-[#D3D1C7] hover:bg-[#313130]" : "border-[#D3D1C7] text-[#2C2C2A] hover:bg-[#F7F6F3]"} transition-colors`}>
                        Ver más
                      </button>
                      {role === "estudiante" && puedeInscribirse && (
                        <button onClick={() => setModalTaller(t)} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors">
                          Inscribirse
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
              {filteredTalleres.length === 0 && <EmptyState T={T} M={M} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ T, M }) {
  return (
    <div className={`col-span-2 text-center py-16 ${M}`}>
      <Icon icon="mdi:search" width={48} className={`mx-auto mb-3 ${M}`} />
      <p className={`text-base font-medium ${T}`}>No se encontraron resultados</p>
      <p className="text-sm">Prueba con otros filtros</p>
    </div>
  );
}
