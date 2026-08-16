import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, Paginacion } from "../../components/ui";
import {
  getEstudiantes, getEmpresas, getVacantes, getTalleres, getColegios,
  iniciarMensajeDirecto, iniciarConversacionConEmpresa,
  postularAVacante, inscribirseEnTaller, getMediaUrl, getEstudianteById,
} from "../../services/api";
import { calcularCompletitud } from "../../utils/perfilCompletitud";
import { REGIONES_COMUNAS, REGIONES } from "../../data/regionesComunas";
import ModalReporte from "../../components/ModalReporte";

const careerDisplay = {
  Administracion: "Administración",
  "Mecanica Automotriz": "Mecánica Automotriz",
};

const CATEGORIAS_BASE = [
  { id: "estudiantes", icon: "mynaui:user-solid",           label: "Estudiantes" },
  { id: "empresas",    icon: "mdi:office-building-outline", label: "Empresas"    },
  { id: "vacantes",    icon: "mdi:briefcase-outline",       label: "Vacantes"    },
  { id: "talleres",    icon: "mdi:school-outline",          label: "Talleres"    },
];
const CAT_COLEGIOS = { id: "colegios", icon: "mdi:domain", label: "Colegios" };

const VALID_CATS_BASE = ["estudiantes", "empresas", "vacantes", "talleres"];

// ── Modal Vacante ─────────────────────────────────────────────────────────────
function VacanteModal({ vacante, role, onClose, perfilCompleto }) {
  const { isDark } = useDark();
  const [estado, setEstado] = useState("idle"); // idle | loading | ok | duplicado | error | incompleto

  const T  = isDark ? "text-[#D3D1C7]"   : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]"   : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#E8E6E1]";
  const BG = isDark ? "bg-[#1e1e1c]"     : "bg-white";
  const S  = isDark ? "bg-[#262624]"     : "bg-[#F7F6F3]";

  const handlePostular = async () => {
    if (estado !== "idle") return;
    if (!perfilCompleto) { setEstado("incompleto"); setTimeout(() => setEstado("idle"), 2500); return; }
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

  const esPuestoLaboral = vacante.tipo === "puesto_laboral";
  const modalidadIcon = (vacante.modalidad || "").toLowerCase() === "remoto"
    ? "mdi:laptop"
    : (vacante.modalidad || "").toLowerCase().includes("hibrido") || (vacante.modalidad || "").toLowerCase().includes("híbrido")
    ? "mdi:home-city"
    : "mdi:map-marker-outline";

  const infoFields = [
    { icon: esPuestoLaboral ? "mdi:briefcase-outline" : "mdi:school-outline", label: "Tipo de contrato", value: esPuestoLaboral ? "Puesto laboral" : "Práctica profesional" },
    vacante.area         && { icon: "mdi:tag-outline",          label: "Área",             value: vacante.area },
    vacante.modalidad     && { icon: modalidadIcon,               label: "Modalidad",        value: vacante.modalidad },
    vacante.remuneracion && { icon: "mdi:currency-usd",         label: "Remuneración",     value: vacante.remuneracion },
    vacante.duracion      && { icon: "mdi:clock-outline",         label: "Duración",         value: vacante.duracion },
    vacante.horario       && { icon: "mdi:calendar-clock-outline",label: "Horario",          value: vacante.horario },
    vacante.direccion     && { icon: "mdi:map-outline",           label: "Ubicación",        value: vacante.direccion },
    vacante.fecha_limite  && { icon: "mdi:calendar-alert-outline",label: "Postula hasta",    value: new Date(vacante.fecha_limite).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" }) },
  ].filter(Boolean);

  const empresaInicial = vacante.nombre_empresa?.[0]?.toUpperCase() ?? "E";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border ${B} ${BG}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`px-6 pt-6 pb-5 border-b ${B} flex items-start gap-4`}>
          <div className="w-12 h-12 rounded-xl bg-[#0F4D8A] flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
            {empresaInicial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <p className={`text-lg font-bold ${T} leading-snug`}>{vacante.titulo}</p>
              <button onClick={onClose} className={`p-1.5 -mt-1 -mr-1 rounded-lg transition-colors ${M} ${isDark ? "hover:bg-[#262624]" : "hover:bg-[#F7F6F3]"} flex-shrink-0`}>
                <Icon icon="mdi:close" width={18} />
              </button>
            </div>
            <p className="text-sm font-semibold text-[#378ADD] mt-0.5">{vacante.nombre_empresa}</p>
            <Badge color={esPuestoLaboral ? "green" : "orange"}>
              {esPuestoLaboral ? "Puesto laboral" : "Práctica profesional"}
            </Badge>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-6">
          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {infoFields.map((item, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${B} ${S}`}>
                <Icon icon={item.icon} width={16} className="text-[#378ADD] flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className={`text-[10px] font-semibold uppercase tracking-wide ${M}`}>{item.label}</p>
                  <p className={`text-sm font-medium ${T} capitalize truncate`}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Descripción */}
          {vacante.descripcion && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${M} mb-2`}>Descripción</p>
              <p className={`text-sm leading-relaxed ${T} whitespace-pre-line`}>{vacante.descripcion}</p>
            </div>
          )}

          {/* Requisitos */}
          {vacante.requisitos && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${M} mb-2`}>Requisitos</p>
              <p className={`text-sm leading-relaxed ${T} whitespace-pre-line`}>{vacante.requisitos}</p>
            </div>
          )}

          {/* Beneficios */}
          {vacante.beneficios && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${M} mb-2`}>Beneficios</p>
              <p className={`text-sm leading-relaxed ${T} whitespace-pre-line`}>{vacante.beneficios}</p>
            </div>
          )}

          {/* Habilidades requeridas */}
          {vacante.habilidades?.length > 0 && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${M} mb-2`}>Habilidades requeridas</p>
              <div className="flex flex-wrap gap-1.5">
                {vacante.habilidades.map((h) => (
                  <Badge key={h.id} color="blue">{h.nombre}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer acción */}
        {role === "estudiante" && (
          <div className={`px-6 py-4 border-t ${B}`}>
            <button
              onClick={handlePostular}
              disabled={estado !== "idle"}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                estado === "ok"        ? (isDark ? "bg-green-500/15 text-green-400" : "bg-green-100 text-green-700")
                : estado === "duplicado" ? (isDark ? "bg-amber-500/15 text-amber-400" : "bg-amber-100 text-amber-700")
                : estado === "error"     ? (isDark ? "bg-red-500/15 text-red-400"   : "bg-red-100 text-red-700")
                : estado === "incompleto" ? (isDark ? "bg-orange-500/15 text-orange-400" : "bg-orange-100 text-orange-700")
                : estado === "loading"   ? (isDark ? "bg-[#0F4D8A]/50 text-[#85B7EB]" : "bg-[#0F4D8A]/70 text-white")
                : "bg-[#0F4D8A] hover:bg-[#0A3A6A] text-white"
              }`}
            >
              <span key={estado} className="fade-swap flex items-center justify-center gap-2">
                <Icon
                  icon={
                    estado === "ok"        ? "mdi:check-circle-outline"
                    : estado === "duplicado" ? "mdi:information-outline"
                    : estado === "error"     ? "mdi:alert-circle-outline"
                    : estado === "incompleto" ? "mdi:account-alert-outline"
                    : estado === "loading"   ? "mdi:loading"
                    : "mdi:send-outline"
                  }
                  width={16}
                  className={estado === "loading" ? "animate-spin" : ""}
                />
                {estado === "ok"        ? "¡Postulación enviada!"
                 : estado === "duplicado" ? "Ya postulaste a esta vacante"
                 : estado === "error"     ? "Error al postular"
                 : estado === "incompleto" ? "Completa tu perfil primero"
                 : estado === "loading"   ? "Postulando..."
                 : "Postular"}
              </span>
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

  const infoFields = [
    taller.area           && { icon: "mdi:tag-outline",            label: "Área",             value: taller.area },
    taller.modalidad       && { icon: "mdi:map-marker-outline",     label: "Modalidad",        value: taller.modalidad },
    { icon: gratuito ? "mdi:gift-outline" : "mdi:currency-usd", label: "Costo", value: costoStr },
    taller.duracion        && { icon: "mdi:clock-outline",          label: "Duración",         value: taller.duracion },
    taller.horario         && { icon: "mdi:calendar-clock-outline", label: "Horario",          value: taller.horario },
    taller.direccion       && { icon: "mdi:map-outline",            label: "Ubicación",        value: taller.direccion },
    taller.cupos != null    && { icon: "mdi:account-group-outline",  label: "Cupos disponibles",value: taller.cupos_disponibles ?? taller.cupos },
    taller.fecha_inicio    && { icon: "mdi:calendar-start",         label: "Fecha de inicio",  value: new Date(taller.fecha_inicio).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" }) },
    taller.fecha_limite    && { icon: "mdi:calendar-alert-outline", label: "Inscríbete hasta", value: new Date(taller.fecha_limite).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" }) },
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border ${B} ${BG}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`px-6 pt-6 pb-5 border-b ${B} flex items-start gap-4`}>
          <div className="w-12 h-12 rounded-xl bg-[#0F4D8A] flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:school-outline" width={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <p className={`text-lg font-bold ${T} leading-snug`}>{taller.titulo}</p>
              <button onClick={onClose} className={`p-1.5 -mt-1 -mr-1 rounded-lg transition-colors ${M} ${isDark ? "hover:bg-[#262624]" : "hover:bg-[#F7F6F3]"} flex-shrink-0`}>
                <Icon icon="mdi:close" width={18} />
              </button>
            </div>
            <p className="text-sm font-semibold text-[#378ADD] mt-0.5">{taller.nombre_institucion || "Centro educacional"}</p>
            <Badge color={taller.esta_activo ? "green" : "gray"}>{taller.esta_activo ? "Activo" : "Cerrado"}</Badge>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-6">
          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {infoFields.map((item, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${B} ${S}`}>
                <Icon icon={item.icon} width={16} className="text-[#378ADD] flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className={`text-[10px] font-semibold uppercase tracking-wide ${M}`}>{item.label}</p>
                  <p className={`text-sm font-medium ${T} capitalize truncate`}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Descripción */}
          {taller.descripcion && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${M} mb-2`}>Descripción</p>
              <p className={`text-sm leading-relaxed ${T} whitespace-pre-line`}>{taller.descripcion}</p>
            </div>
          )}

          {/* Requisitos */}
          {taller.requisitos && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${M} mb-2`}>Requisitos</p>
              <p className={`text-sm leading-relaxed ${T} whitespace-pre-line`}>{taller.requisitos}</p>
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
          <div className={`px-6 py-4 border-t ${B}`}>
            <button
              onClick={handleInscribirse}
              disabled={estado !== "idle"}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                estado === "ok"        ? (isDark ? "bg-green-500/15 text-green-400"  : "bg-green-100 text-green-700")
                : estado === "duplicado" ? (isDark ? "bg-amber-500/15 text-amber-400" : "bg-amber-100 text-amber-700")
                : estado === "sin_cupos" ? (isDark ? "bg-red-500/15 text-red-400"    : "bg-red-100 text-red-700")
                : estado === "error"     ? (isDark ? "bg-red-500/15 text-red-400"    : "bg-red-100 text-red-700")
                : estado === "loading"   ? (isDark ? "bg-[#0F4D8A]/20 text-[#378ADD]" : "bg-[#E6F1FB] text-[#0F4D8A]")
                : "bg-[#0F4D8A] hover:bg-[#0A3A6A] text-white"
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

  const urlParams = new URLSearchParams(location.search);
  const urlQ   = urlParams.get("q")   || "";
  const urlCat = urlParams.get("cat") || "";

  const role = location.pathname.startsWith("/admin")
    ? "admin"
    : location.pathname.startsWith("/empresa")
    ? "empresa"
    : location.pathname.startsWith("/slep")
    ? "slep"
    : "estudiante";

  const canSeeColegios = role === "empresa" || role === "slep";
  const VALID_CATS = canSeeColegios ? [...VALID_CATS_BASE, "colegios"] : VALID_CATS_BASE;
  const CATEGORIAS = canSeeColegios ? [...CATEGORIAS_BASE, CAT_COLEGIOS] : CATEGORIAS_BASE;

  const [tab,            setTab]            = useState(VALID_CATS.includes(urlCat) ? urlCat : "estudiantes");
  const [students,       setStudents]       = useState([]);
  const [companies,      setCompanies]      = useState([]);
  const [vacantes,       setVacantes]       = useState([]);
  const [talleres,       setTalleres]       = useState([]);
  const [colegios,       setColegios]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState(urlQ);
  const [selectedCareer, setSelectedCareer] = useState("Todas");
  const [minGpa,         setMinGpa]         = useState(1);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedComuna, setSelectedComuna] = useState("");
  const [contactandoId,      setContactandoId]      = useState(null);
  const [modalVacante,       setModalVacante]       = useState(null);
  const [modalTaller,        setModalTaller]        = useState(null);
  const [selectedHabilidades, setSelectedHabilidades] = useState([]);
  const [selectedAreas,       setSelectedAreas]       = useState([]);
  const [habBusqueda,         setHabBusqueda]         = useState("");
  const [selectedModalidad,   setSelectedModalidad]   = useState("");
  const [filtroPrecio,        setFiltroPrecio]        = useState("todas"); // todas | gratuito | pago
  const [filtroRemuneracion,  setFiltroRemuneracion]  = useState("todas"); // todas | con_paga | sin_paga
  const [minEvalDocente,      setMinEvalDocente]      = useState(1);
  const [reportarPerfil,     setReportarPerfil]     = useState(null); // { id, tipo }
  const [pagina,             setPagina]             = useState(1);
  const [porPagina,          setPorPagina]          = useState(10);
  const [minAltura,          setMinAltura]          = useState(0);
  const [filtrosMobileOpen,  setFiltrosMobileOpen]  = useState(false);
  const resultadosRef = useRef(null);
  const [perfilCompleto,     setPerfilCompleto]     = useState(false);
  const [estadosPostulacion, setEstadosPostulacion] = useState({}); // { [vacanteId]: idle|loading|ok|duplicado|error|incompleto }
  const [estadosInscripcion, setEstadosInscripcion] = useState({}); // { [tallerId]: idle|loading|ok|duplicado|sin_cupos|error }

  const T  = isDark ? "text-[#D3D1C7]"   : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]"   : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S  = isDark ? "bg-[#313130]"     : "bg-[#F7F6F3]";
  const BG = isDark ? "bg-[#262624]"     : "bg-white";

  const candidatoBase =
    role === "empresa" ? "/empresa/candidato" :
    role === "admin"   ? "/admin/candidato"   :
    role === "slep"    ? "/slep/candidato"    : "/estudiante/candidato";

  // Sincronizar search con cambios en ?q= de la URL (cuando el navbar escribe)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("q") || "");
  }, [location.search]);

  useEffect(() => {
    if (role !== "estudiante") return;
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    if (!usuario.id) return;
    getEstudianteById(usuario.id)
      .then((perfil) => setPerfilCompleto(calcularCompletitud(perfil) === 100))
      .catch(() => {});
  }, [role]);

  const handlePostularCard = async (vacanteId) => {
    const actual = estadosPostulacion[vacanteId] || "idle";
    if (actual !== "idle") return;
    if (!perfilCompleto) {
      setEstadosPostulacion((prev) => ({ ...prev, [vacanteId]: "incompleto" }));
      setTimeout(() => setEstadosPostulacion((prev) => ({ ...prev, [vacanteId]: "idle" })), 2500);
      return;
    }
    setEstadosPostulacion((prev) => ({ ...prev, [vacanteId]: "loading" }));
    try {
      await postularAVacante(vacanteId);
      setEstadosPostulacion((prev) => ({ ...prev, [vacanteId]: "ok" }));
    } catch (err) {
      const msg = err.message?.toLowerCase();
      const estado = msg?.includes("ya") || msg?.includes("duplic") ? "duplicado" : "error";
      setEstadosPostulacion((prev) => ({ ...prev, [vacanteId]: estado }));
    }
  };

  const handleInscribirseCard = async (tallerId) => {
    const actual = estadosInscripcion[tallerId] || "idle";
    if (actual !== "idle") return;
    setEstadosInscripcion((prev) => ({ ...prev, [tallerId]: "loading" }));
    try {
      await inscribirseEnTaller(tallerId);
      setEstadosInscripcion((prev) => ({ ...prev, [tallerId]: "ok" }));
    } catch (err) {
      const msg = err.message?.toLowerCase();
      const estado = msg?.includes("ya estás") || msg?.includes("ya te") ? "duplicado" : msg?.includes("cupos") ? "sin_cupos" : "error";
      setEstadosInscripcion((prev) => ({ ...prev, [tallerId]: estado }));
    }
  };

  useEffect(() => {
    // El buscador general muestra todos los estudiantes de la plataforma, no solo
    // los propios del colegio (a diferencia de la gestión en "Usuarios").
    const fetchColegios = canSeeColegios ? getColegios() : Promise.reject();
    Promise.allSettled([getEstudiantes(), getEmpresas(), getVacantes(), getTalleres(true), fetchColegios])
      .then(([sts, cos, vacs, tals, cols]) => {
        if (sts.status  === "fulfilled") setStudents(sts.value);
        if (cos.status  === "fulfilled") setCompanies(cos.value);
        if (vacs.status === "fulfilled") setVacantes(vacs.value);
        if (tals.status === "fulfilled") setTalleres(tals.value);
        if (cols.status === "fulfilled") setColegios(cols.value);
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
    if (selectedAreas.length > 0 && !selectedAreas.includes(v.area)) return false;
    if (selectedModalidad && v.modalidad?.toLowerCase() !== selectedModalidad) return false;
    if (filtroRemuneracion === "con_paga"  && !v.remuneracion?.trim()) return false;
    if (filtroRemuneracion === "sin_paga"  &&  v.remuneracion?.trim()) return false;
    if (selectedHabilidades.length > 0) {
      const vHabs = (v.habilidades || []).map((h) => h.nombre.toLowerCase());
      if (!selectedHabilidades.some((h) => vHabs.includes(h.toLowerCase()))) return false;
    }
    return true;
  });

  const filteredColegios = colegios.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.nombre_institucion.toLowerCase().includes(q) || (c.descripcion || "").toLowerCase().includes(q)) &&
      (!selectedRegion || c.region === selectedRegion) &&
      (!selectedComuna || c.comuna === selectedComuna)
    );
  });

  const filteredTalleres = talleres.filter((t) => {
    const q = search.toLowerCase();
    if (!(t.titulo?.toLowerCase().includes(q) || t.area?.toLowerCase().includes(q) || t.descripcion?.toLowerCase().includes(q))) return false;
    if (selectedAreas.length > 0 && !selectedAreas.includes(t.area)) return false;
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
    colegios:    filteredColegios.length,
  };
  const count = countMap[tab] ?? 0;

  // Paginación de los resultados de la pestaña activa
  useEffect(() => { setPagina(1); setMinAltura(0); }, [
    tab, search, selectedCareer, minGpa, minEvalDocente, selectedRegion, selectedComuna,
    selectedHabilidades, selectedAreas, selectedModalidad, filtroPrecio, filtroRemuneracion, porPagina,
  ]);
  const totalPaginas = Math.max(1, Math.ceil(count / porPagina));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const paginar = (arr) => arr.slice((paginaSegura - 1) * porPagina, paginaSegura * porPagina);
  const cambiarPorPagina = (v) => { setPorPagina(v); setPagina(1); };
  const cambiarPagina = (p) => { setPagina(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // Reserva la altura máxima alcanzada por la grilla de resultados, así la paginación
  // no salta hacia arriba cuando una página trae menos resultados que las anteriores.
  // Sin deps a propósito: debe remedir en cada render (incluido el cambio de página);
  // el guard `alto > minAltura` evita el loop infinito.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (!resultadosRef.current) return;
    const alto = resultadosRef.current.offsetHeight;
    if (alto > minAltura) setMinAltura(alto);
  });
  const tabLabel = { estudiantes: "estudiante", empresas: "empresa", vacantes: "vacante", talleres: "taller", colegios: "colegio" }[tab];
  const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}");

  const limpiarFiltros = () => {
    setSearch(""); setSelectedCareer("Todas"); setMinGpa(1); setMinEvalDocente(1);
    setSelectedRegion(""); setSelectedComuna(""); setSelectedHabilidades([]);
    setSelectedAreas([]);
    setHabBusqueda(""); setSelectedModalidad(""); setFiltroPrecio("todas"); setFiltroRemuneracion("todas");
    const params = new URLSearchParams(location.search);
    params.delete("q");
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

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

  const handleContactarColegio = async (id) => {
    setContactandoId(id);
    try {
      const c = await iniciarMensajeDirecto(id);
      const dest = role === "slep" ? "/slep/mensajeria" : "/empresa/mensajeria";
      navigate(dest, { state: { directaId: c.id } });
    } catch (e) { console.error(e); } finally { setContactandoId(null); }
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
      {modalVacante && <VacanteModal vacante={modalVacante} role={role} onClose={() => setModalVacante(null)} perfilCompleto={perfilCompleto} />}
      {modalTaller  && <TallerModal  taller={modalTaller}  role={role} onClose={() => setModalTaller(null)}  />}

      <div className="mb-6">
        <h1 className={`text-xl font-bold ${T}`}>Búsqueda</h1>
        <p className={`text-sm ${M} mt-0.5`}>{count} {tabLabel}{count !== 1 ? "s" : ""} encontrado{count !== 1 ? "s" : ""}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Panel izquierdo ── */}
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setFiltrosMobileOpen((v) => !v)}
            className={`lg:hidden flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium ${B} ${T} ${isDark ? "bg-[#262624]" : "bg-white"}`}
          >
            <span className="flex items-center gap-2">
              <Icon icon="mdi:filter-variant" width={16} className="text-[#378ADD]" />
              Filtros
            </span>
            <Icon icon={filtrosMobileOpen ? "mdi:chevron-up" : "mdi:chevron-down"} width={18} className={M} />
          </button>
          <Card className={`${filtrosMobileOpen ? "block" : "hidden"} lg:block`}>
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
            {(tab === "vacantes" || tab === "talleres") && uniqueAreas.length > 2 && (
              <div className={`border-t ${B} pt-4 mb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-xs ${M}`}>Área</label>
                  {selectedAreas.length > 0 && (
                    <button onClick={() => setSelectedAreas([])} className="text-xs text-[#378ADD] hover:underline">
                      Limpiar
                    </button>
                  )}
                </div>
                {selectedAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedAreas.map((a) => (
                      <button key={a} onClick={() => setSelectedAreas((prev) => prev.filter((x) => x !== a))}
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#0F4D8A] text-white"
                      >
                        {a} <Icon icon="mdi:close" width={10} />
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto pr-1">
                  {uniqueAreas.filter((a) => a !== "Todas").map((a) => {
                    const active = selectedAreas.includes(a);
                    return (
                      <button key={a}
                        onClick={() => setSelectedAreas((prev) => active ? prev.filter((x) => x !== a) : [...prev, a])}
                        className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                          active ? "bg-[#0F4D8A] text-[#E6F1FB]" : `${T} hover:bg-[#0F4D8A]/10`
                        }`}
                      >
                        <Icon icon={active ? "mdi:checkbox-marked" : "mdi:checkbox-blank-outline"} width={14} className="flex-shrink-0" />
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filtro modalidad (vacantes / talleres) */}
            {(tab === "vacantes" || tab === "talleres") && (
              <div className={`border-t ${B} pt-4 mb-4`}>
                <label className={`block text-xs mb-2 ${M}`}>Modalidad</label>
                {[
                  { value: "",           label: "Todas",      icon: "mdi:view-grid-outline"  },
                  { value: "presencial", label: "Presencial", icon: "streamline:city-hall-remix" },
                  { value: "remoto",     label: "Remoto",     icon: "mdi:laptop"     },
                  { value: "hibrido",    label: "Híbrido",    icon: "mdi:home-city"   },
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

            {/* Región/comuna (estudiantes, empresas y colegios) */}
            {(tab === "estudiantes" || tab === "empresas" || tab === "colegios") && (
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
        <div className="lg:col-span-3 flex flex-col gap-4">
        <div ref={resultadosRef} style={minAltura ? { minHeight: minAltura } : undefined}>
          {/* Estudiantes */}
          {tab === "estudiantes" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paginar(filteredStudents).map((s) => {
                const nombreCarrera = careerDisplay[s.carrera] || s.carrera;
                return (
                  <Card key={s.usuario_id} className="hover:border-[#378ADD] transition-colors cursor-pointer" onClick={() => navigate(`${candidatoBase}/${s.usuario_id}`)}>
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
                        <p className={`text-xs ${M}`}>{nombreCarrera}{s.nivel ? ` · ${s.nivel}` : ""}</p>
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
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link to={`${candidatoBase}/${s.usuario_id}`} className="flex-1">
                        <PrimaryButton className="w-full">Ver perfil</PrimaryButton>
                      </Link>
                      {role === "estudiante" && s.usuario_id !== usuarioActual.id && (
                        <button onClick={() => handleContactarEstudiante(s.usuario_id)} disabled={contactandoId === s.usuario_id} title="Enviar mensaje"
                          className="px-3 py-2 rounded-lg border border-[#378ADD] text-[#378ADD] hover:bg-[#378ADD] hover:text-white transition-colors disabled:opacity-50 flex items-center">
                          <Icon icon={contactandoId === s.usuario_id ? "mdi:loading" : "mdi:message-outline"} width={16} className={contactandoId === s.usuario_id ? "animate-spin" : ""} />
                        </button>
                      )}
                      {s.usuario_id !== usuarioActual.id && (
                        <button
                          onClick={() => setReportarPerfil({ id: s.usuario_id, tipo: "perfil", titulo: "¿Por qué reportas este perfil?" })}
                          title="Reportar"
                          className={`px-3 py-2 rounded-lg border transition-colors flex items-center ${
                            isDark ? "border-[#3a3a38] text-[#888780] hover:text-red-400 hover:border-red-500/40" : "border-[#D3D1C7] text-[#5F5E5A] hover:text-red-500 hover:border-red-300"
                          }`}
                        >
                          <Icon icon="mdi:flag-outline" width={15} />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paginar(filteredCompanies).map((c) => (
                <Card key={c.usuario_id} className="hover:border-[#378ADD] transition-colors cursor-pointer" onClick={() => navigate(`/empresa-publica/${c.usuario_id}`)}>
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
                  <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/empresa-publica/${c.usuario_id}`} className="flex-1"><PrimaryButton className="w-full">Ver perfil</PrimaryButton></Link>
                    {role === "estudiante" && (
                      <button onClick={() => handleContactarEmpresa(c.usuario_id)} disabled={contactandoId === c.usuario_id} title="Enviar mensaje"
                        className="px-3 py-2 rounded-lg border border-[#378ADD] text-[#378ADD] hover:bg-[#378ADD] hover:text-white transition-colors disabled:opacity-50 flex items-center">
                        <Icon icon={contactandoId === c.usuario_id ? "mdi:loading" : "mdi:message-outline"} width={16} className={contactandoId === c.usuario_id ? "animate-spin" : ""} />
                      </button>
                    )}
                    <button
                      onClick={() => setReportarPerfil({ id: c.usuario_id, tipo: "perfil", titulo: "¿Por qué reportas este perfil de empresa?" })}
                      title="Reportar"
                      className={`px-3 py-2 rounded-lg border transition-colors flex items-center ${
                        isDark ? "border-[#3a3a38] text-[#888780] hover:text-red-400 hover:border-red-500/40" : "border-[#D3D1C7] text-[#5F5E5A] hover:text-red-500 hover:border-red-300"
                      }`}
                    >
                      <Icon icon="mdi:flag-outline" width={15} />
                    </button>
                  </div>
                </Card>
              ))}
              {filteredCompanies.length === 0 && <EmptyState T={T} M={M} />}
            </div>
          )}

          {/* Vacantes */}
          {tab === "vacantes" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paginar(filteredVacantes).map((v) => (
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
                    {v.modalidad && <span className="flex items-center gap-1"><Icon icon={v.modalidad.toLowerCase() === "remoto" ? "mdi:laptop" : v.modalidad.toLowerCase() === "hibrido" || v.modalidad.toLowerCase() === "híbrido" ? "mdi:home-city" : "mdi:map-marker-outline"} width={12}/>{v.modalidad}</span>}
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
                    {role === "estudiante" && (() => {
                      const estado = estadosPostulacion[v.id] || "idle";
                      return (
                        <PrimaryButton
                          className={`flex-1 text-xs py-2 fade-swap ${
                            estado === "ok"        ? "!bg-green-100 !text-green-700"  :
                            estado === "duplicado" ? "!bg-amber-100 !text-amber-700"  :
                            estado === "error"     ? "!bg-red-100 !text-red-700"      :
                            estado === "incompleto"? "!bg-orange-100 !text-orange-700": ""
                          }`}
                          key={estado}
                          disabled={estado !== "idle"}
                          onClick={() => handlePostularCard(v.id)}
                        >
                          {estado === "ok"        ? "¡Postulado!"         :
                           estado === "duplicado" ? "Ya postulaste"       :
                           estado === "error"     ? "Error, reintentar"   :
                           estado === "incompleto"? "Perfil incompleto"   :
                           estado === "loading"   ? "Postulando..."       : "Postular"}
                        </PrimaryButton>
                      );
                    })()}
                  </div>
                </Card>
              ))}
              {filteredVacantes.length === 0 && <EmptyState T={T} M={M} />}
            </div>
          )}

          {/* Colegios */}
          {tab === "colegios" && canSeeColegios && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paginar(filteredColegios).map((c) => (
                <Card key={c.usuario_id} className="hover:border-[#378ADD] transition-colors cursor-pointer flex flex-col" onClick={() => navigate(`/colegio-publico/${c.usuario_id}`)}>
                  <div className="flex items-start gap-3 mb-3">
                    {c.foto_perfil ? (
                      <img src={getMediaUrl(c.foto_perfil)} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#0F4D8A] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                        {c.nombre_institucion?.[0]?.toUpperCase() ?? "C"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${T} truncate`}>{c.nombre_institucion}</p>
                      <p className={`text-xs ${M} flex items-center gap-1`}>
                        <Icon icon="mdi:account-group-outline" width={12} />
                        {c.total_estudiantes || 0} estudiante{c.total_estudiantes !== 1 ? "s" : ""}
                      </p>
                      {(c.comuna || c.region) && (
                        <p className={`text-xs ${M} flex items-center gap-1`}>
                          <Icon icon="mdi:map-marker-outline" width={11} />
                          {[c.comuna, c.region].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                    <Badge color="blue">Institución</Badge>
                  </div>
                  {c.descripcion && <p className={`text-xs ${M} mb-3 line-clamp-2`}>{c.descripcion}</p>}
                  {c.telefono_contacto && (
                    <div className={`flex items-center gap-1.5 text-xs ${M} mb-3`}>
                      <Icon icon="mdi:phone-outline" width={13} />{c.telefono_contacto}
                    </div>
                  )}
                  <div className="flex gap-2 mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/colegio-publico/${c.usuario_id}`} className="flex-1">
                      <PrimaryButton className="w-full">Ver perfil</PrimaryButton>
                    </Link>
                    {(role === "slep" || role === "empresa") && (
                      <button
                        onClick={() => handleContactarColegio(c.usuario_id)}
                        disabled={contactandoId === c.usuario_id}
                        title="Contactar"
                        className="px-3 py-2 rounded-lg border border-[#378ADD] text-[#378ADD] hover:bg-[#378ADD] hover:text-white transition-colors disabled:opacity-50 flex items-center"
                      >
                        <Icon
                          icon={contactandoId === c.usuario_id ? "mdi:loading" : "mdi:message-outline"}
                          width={16}
                          className={contactandoId === c.usuario_id ? "animate-spin" : ""}
                        />
                      </button>
                    )}
                  </div>
                </Card>
              ))}
              {filteredColegios.length === 0 && <EmptyState T={T} M={M} />}
            </div>
          )}

          {/* Talleres */}
          {tab === "talleres" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paginar(filteredTalleres).map((t) => {
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
                      {role === "estudiante" && puedeInscribirse && (() => {
                        const estado = estadosInscripcion[t.id] || "idle";
                        return (
                          <button
                            key={estado}
                            onClick={() => handleInscribirseCard(t.id)}
                            disabled={estado !== "idle"}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors fade-swap ${
                              estado === "ok"        ? "bg-green-100 text-green-700"  :
                              estado === "duplicado" ? "bg-amber-100 text-amber-700"  :
                              estado === "sin_cupos" ? "bg-red-100 text-red-700"      :
                              estado === "error"     ? "bg-red-100 text-red-700"      :
                              "bg-[#0F4D8A] hover:bg-[#0A3A6A] text-white"
                            }`}
                          >
                            {estado === "ok"        ? "¡Inscrito!"          :
                             estado === "duplicado" ? "Ya inscrito"         :
                             estado === "sin_cupos" ? "Sin cupos"           :
                             estado === "error"     ? "Error, reintentar"  :
                             estado === "loading"   ? "Inscribiendo..."    : "Inscribirse"}
                          </button>
                        );
                      })()}
                    </div>
                  </Card>
                );
              })}
              {filteredTalleres.length === 0 && <EmptyState T={T} M={M} />}
            </div>
          )}
        </div>

          {count > 0 && (
            <Paginacion
              paginaActual={paginaSegura}
              totalPaginas={totalPaginas}
              onCambiar={cambiarPagina}
              porPagina={porPagina}
              opciones={[10, 20, 50]}
              onCambiarPorPagina={cambiarPorPagina}
            />
          )}
        </div>
      </div>

      {reportarPerfil && (
        <ModalReporte
          tipo={reportarPerfil.tipo}
          referenciaId={reportarPerfil.id}
          titulo={reportarPerfil.titulo}
          onCerrar={() => setReportarPerfil(null)}
        />
      )}
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
