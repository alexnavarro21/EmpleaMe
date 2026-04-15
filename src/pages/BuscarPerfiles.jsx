import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { Card, Badge, PrimaryButton } from "../components/ui";
import { getEstudiantes, getEmpresas, getVacantes, getTalleres, iniciarMensajeDirecto, iniciarConversacionConEmpresa, getMediaUrl } from "../services/api";
import { REGIONES_COMUNAS, REGIONES } from "../data/regionesComunas";

const careerDisplay = {
  Administracion: "Administración",
  "Mecanica Automotriz": "Mecánica Automotriz",
};

const CATEGORIAS = [
  { id: "estudiantes", icon: "mynaui:user-solid",             label: "Estudiantes" },
  { id: "empresas",    icon: "mdi:office-building-outline",   label: "Empresas"    },
  { id: "vacantes",    icon: "mdi:briefcase-outline",         label: "Vacantes"    },
  { id: "talleres",    icon: "mdi:school-outline",            label: "Talleres"    },
];

export default function BuscarPerfiles() {
  const { isDark } = useDark();
  const location  = useLocation();
  const navigate  = useNavigate();

  const [tab,             setTab]             = useState("estudiantes");
  const [students,        setStudents]        = useState([]);
  const [companies,       setCompanies]       = useState([]);
  const [vacantes,        setVacantes]        = useState([]);
  const [talleres,        setTalleres]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState("");
  const [selectedCareer,  setSelectedCareer]  = useState("Todas");
  const [minGpa,          setMinGpa]          = useState(1);
  const [selectedRegion,  setSelectedRegion]  = useState("");
  const [selectedComuna,  setSelectedComuna]  = useState("");
  const [contactandoId,   setContactandoId]   = useState(null);

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
    role === "admin"   ? "/admin/candidato"   :
                         "/estudiante/candidato";

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

  const uniqueCareers = ["Todas", ...new Set(students.map((s) => s.carrera))];

  const filteredStudents = students.filter((s) => {
    const nombreCarrera = careerDisplay[s.carrera] || s.carrera;
    const q = search.toLowerCase();
    const matchSearch  = s.nombre_completo.toLowerCase().includes(q) ||
      (s.habilidades || []).some((sk) => sk.toLowerCase().includes(q));
    const matchCareer  = selectedCareer === "Todas" || s.carrera === selectedCareer || nombreCarrera === selectedCareer;
    const matchGpa     = !s.promedio || s.promedio >= minGpa;
    const matchRegion  = !selectedRegion || s.region === selectedRegion;
    const matchComuna  = !selectedComuna || s.comuna === selectedComuna;
    return matchSearch && matchCareer && matchGpa && matchRegion && matchComuna;
  });

  const filteredCompanies = companies.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = c.nombre_empresa.toLowerCase().includes(q) ||
      (c.descripcion || "").toLowerCase().includes(q);
    const matchRegion = !selectedRegion || c.region === selectedRegion;
    const matchComuna = !selectedComuna || c.comuna === selectedComuna;
    return matchSearch && matchRegion && matchComuna;
  });

  const filteredVacantes = vacantes.filter((v) => {
    const q = search.toLowerCase();
    return v.titulo?.toLowerCase().includes(q) ||
      v.nombre_empresa?.toLowerCase().includes(q) ||
      v.area?.toLowerCase().includes(q);
  });

  const filteredTalleres = talleres.filter((t) => {
    const q = search.toLowerCase();
    return t.titulo?.toLowerCase().includes(q) ||
      t.area?.toLowerCase().includes(q) ||
      t.descripcion?.toLowerCase().includes(q);
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

  const handleContactarEstudiante = async (estudianteId) => {
    setContactandoId(estudianteId);
    try {
      const conv = await iniciarMensajeDirecto(estudianteId);
      navigate("/estudiante/mensajeria", { state: { directaId: conv.id } });
    } catch (err) { console.error(err); }
    finally { setContactandoId(null); }
  };

  const handleContactarEmpresa = async (empresaId) => {
    setContactandoId(empresaId);
    try {
      const conv = await iniciarConversacionConEmpresa(empresaId);
      navigate("/estudiante/mensajeria", { state: { conversacionId: conv.id } });
    } catch (err) { console.error(err); }
    finally { setContactandoId(null); }
  };

  const limpiarFiltros = () => {
    setSearch(""); setSelectedCareer("Todas"); setMinGpa(1);
    setSelectedRegion(""); setSelectedComuna("");
  };

  const inputCls = `w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
    isDark
      ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
      : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
  }`;

  const selectCls = `w-full px-2.5 py-2 rounded-lg text-xs outline-none border focus:border-[#378ADD] transition-colors ${
    isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]" : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
  }`;

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
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-xl font-bold ${T}`}>Búsqueda</h1>
        <p className={`text-sm ${M} mt-0.5`}>
          {count} {tabLabel}{count !== 1 ? "s" : ""} encontrado{count !== 1 ? "s" : ""}
        </p>
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
                  onClick={() => { setTab(cat.id); setSearch(""); limpiarFiltros(); }}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg mb-1 transition-colors flex items-center gap-2 ${
                    tab === cat.id ? "bg-[#0F4D8A] text-[#E6F1FB]" : `${T} hover:bg-[#0F4D8A]/10`
                  }`}
                >
                  <Icon icon={cat.icon} width={14} />
                  {cat.label}
                  <span className={`ml-auto text-xs font-semibold ${tab === cat.id ? "text-[#85B7EB]" : M}`}>
                    {countMap[cat.id]}
                  </span>
                </button>
              ))}
            </div>

            {/* Filtros específicos por categoría */}
            {tab === "estudiantes" && (
              <>
                <div className={`border-t ${B} pt-4 mb-4`}>
                  <label className={`block text-xs mb-2 ${M}`}>Carrera técnica</label>
                  {uniqueCareers.map((c) => {
                    const label = careerDisplay[c] || c;
                    const isActive = selectedCareer === c ||
                      (selectedCareer !== "Todas" && (careerDisplay[selectedCareer] || selectedCareer) === label);
                    return (
                      <button
                        key={c}
                        onClick={() => setSelectedCareer(c)}
                        className={`w-full text-left text-sm px-3 py-1.5 rounded-lg mb-1 transition-colors flex items-center gap-2 ${
                          isActive ? "bg-[#0F4D8A] text-[#E6F1FB]" : `${T} hover:bg-[#0F4D8A]/10`
                        }`}
                      >
                        <Icon
                          icon={c.includes("Mecánica") || c.includes("Mecanica") ? "mdi:car-wrench" : c === "Todas" ? "mdi:account-group-outline" : "mdi:clipboard-list-outline"}
                          width={14}
                        />
                        {label}
                      </button>
                    );
                  })}
                </div>

                {role !== "estudiante" && (
                  <div className="mb-4">
                    <label className={`block text-xs mb-2 ${M}`}>
                      Nota mínima: <strong className={T}>{minGpa > 1 ? minGpa.toFixed(1) : "Sin filtro"}</strong>
                    </label>
                    <input
                      type="range" min="1" max="7" step="0.1"
                      value={minGpa}
                      onChange={(e) => setMinGpa(parseFloat(e.target.value))}
                      className="w-full accent-[#0F4D8A]"
                    />
                    <div className={`flex justify-between text-xs ${M} mt-1`}>
                      <span>1.0</span><span>4.0</span><span>7.0</span>
                    </div>
                  </div>
                )}
              </>
            )}

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

            <button onClick={limpiarFiltros} className="mt-1 w-full text-xs text-[#378ADD] hover:underline">
              Limpiar filtros
            </button>
          </Card>
        </div>

        {/* ── Área de resultados ── */}
        <div className="col-span-3 flex flex-col gap-4">

          {/* Barra de búsqueda prominente */}
          <div className="relative">
            <Icon icon="mdi:search" width={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${M}`} />
            <input
              type="text"
              placeholder={{
                estudiantes: "Buscar por nombre o habilidad...",
                empresas:    "Buscar por nombre o descripción...",
                vacantes:    "Buscar por título, empresa o área...",
                talleres:    "Buscar por título o área...",
              }[tab]}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border-2 transition-all focus:border-[#378ADD] shadow-sm ${
                isDark
                  ? "bg-[#262624] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                  : "bg-white border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
              }`}
            />
            {search && (
              <button onClick={() => setSearch("")} className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${M} hover:text-red-400 transition-colors`}>
                <Icon icon="mdi:close-circle" width={16} />
              </button>
            )}
          </div>

          {/* Grid de cards */}
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
                          <p className={`text-xs ${M} flex items-center gap-1`}>
                            <Icon icon="mdi:map-marker-outline" width={11} />
                            {[s.comuna, s.region].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    {role !== "estudiante" && (
                      <div className={`flex gap-4 mb-3 pb-3 border-b ${B}`}>
                        <div>
                          <p className={`text-xs ${M}`}>Promedio</p>
                          <p className={`text-sm font-semibold ${T}`}>{s.promedio ? parseFloat(s.promedio).toFixed(1) : "—"}</p>
                        </div>
                        {s.calificacion_docente && (
                          <div>
                            <p className={`text-xs ${M}`}>Eval. docente</p>
                            <p className={`text-sm font-semibold ${T} flex items-center gap-1`}>
                              <Icon icon="solar:star-bold-duotone" width={14} className="text-yellow-400" />
                              {parseFloat(s.calificacion_docente).toFixed(1)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {s.habilidades && s.habilidades.length > 0 && (
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
                        <button
                          onClick={() => handleContactarEstudiante(s.usuario_id)}
                          disabled={contactandoId === s.usuario_id}
                          title="Enviar mensaje"
                          className="px-3 py-2 rounded-lg border border-[#378ADD] text-[#378ADD] hover:bg-[#378ADD] hover:text-white transition-colors disabled:opacity-50 flex items-center"
                        >
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
                      <p className={`text-xs ${M} flex items-center gap-1`}>
                        <Icon icon="mdi:briefcase-outline" width={12} />
                        {c.total_vacantes || 0} vacante{c.total_vacantes !== 1 ? "s" : ""} activa{c.total_vacantes !== 1 ? "s" : ""}
                      </p>
                      {(c.comuna || c.region) && (
                        <p className={`text-xs ${M} flex items-center gap-1`}>
                          <Icon icon="mdi:map-marker-outline" width={11} />
                          {[c.comuna, c.region].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                    <Badge color="blue">Empresa</Badge>
                  </div>
                  {c.descripcion && <p className={`text-xs ${M} mb-3 line-clamp-2`}>{c.descripcion}</p>}
                  {c.telefono_contacto && (
                    <div className={`flex items-center gap-1.5 text-xs ${M} mb-3`}>
                      <Icon icon="mdi:phone-outline" width={13} />
                      {c.telefono_contacto}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Link to={`/empresa-publica/${c.usuario_id}`} className="flex-1">
                      <PrimaryButton className="w-full">Ver perfil</PrimaryButton>
                    </Link>
                    {role === "estudiante" && (
                      <button
                        onClick={() => handleContactarEmpresa(c.usuario_id)}
                        disabled={contactandoId === c.usuario_id}
                        title="Enviar mensaje"
                        className="px-3 py-2 rounded-lg border border-[#378ADD] text-[#378ADD] hover:bg-[#378ADD] hover:text-white transition-colors disabled:opacity-50 flex items-center"
                      >
                        <Icon icon={contactandoId === c.usuario_id ? "mdi:loading" : "mdi:message-outline"} width={16} className={contactandoId === c.usuario_id ? "animate-spin" : ""} />
                      </button>
                    )}
                  </div>
                </Card>
              ))}
              {filteredCompanies.length === 0 && <EmptyState T={T} M={M} />}
            </div>
          )}

          {tab === "vacantes" && (
            <div className="grid grid-cols-2 gap-4">
              {filteredVacantes.map((v) => (
                <Card key={v.id} className="hover:border-[#378ADD] transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className={`text-sm font-semibold ${T} leading-snug`}>{v.titulo}</p>
                    <Badge color={v.tipo === "puesto_laboral" ? "green" : "orange"} className="flex-shrink-0">
                      {v.tipo === "puesto_laboral" ? "Puesto laboral" : "Práctica"}
                    </Badge>
                  </div>
                  <p className={`text-xs font-medium text-[#378ADD] mb-2`}>{v.nombre_empresa}</p>
                  <div className={`flex flex-wrap gap-x-3 gap-y-1 text-xs ${M} mb-3`}>
                    {v.area && <span className="flex items-center gap-1"><Icon icon="mdi:tag-outline" width={12}/>{v.area}</span>}
                    {v.modalidad && <span className="flex items-center gap-1"><Icon icon="mdi:map-marker-outline" width={12}/>{v.modalidad}</span>}
                    {v.duracion && <span className="flex items-center gap-1"><Icon icon="mdi:clock-outline" width={12}/>{v.duracion}</span>}
                  </div>
                  {v.habilidades && v.habilidades.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {v.habilidades.slice(0, 3).map((h) => <Badge key={h.id} color="blue">{h.nombre}</Badge>)}
                      {v.habilidades.length > 3 && <span className={`text-xs ${M}`}>+{v.habilidades.length - 3} más</span>}
                    </div>
                  )}
                  {role === "estudiante" && (
                    <Link to={`/empresa-publica/${v.empresa_id}`}>
                      <PrimaryButton className="w-full">Ver empresa</PrimaryButton>
                    </Link>
                  )}
                </Card>
              ))}
              {filteredVacantes.length === 0 && <EmptyState T={T} M={M} />}
            </div>
          )}

          {tab === "talleres" && (
            <div className="grid grid-cols-2 gap-4">
              {filteredTalleres.map((t) => (
                <Card key={t.id} className="hover:border-[#378ADD] transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className={`text-sm font-semibold ${T} leading-snug`}>{t.titulo}</p>
                    <Badge color={t.esta_activo ? "green" : "gray"}>{t.esta_activo ? "Activo" : "Inactivo"}</Badge>
                  </div>
                  <div className={`flex flex-wrap gap-x-3 gap-y-1 text-xs ${M} mb-3`}>
                    {t.area && <span className="flex items-center gap-1"><Icon icon="mdi:tag-outline" width={12}/>{t.area}</span>}
                    {t.modalidad && <span className="flex items-center gap-1"><Icon icon="mdi:map-marker-outline" width={12}/>{t.modalidad}</span>}
                    {t.cupos != null && (
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:account-group-outline" width={12}/>
                        {t.cupos_disponibles ?? t.cupos} cupo{(t.cupos_disponibles ?? t.cupos) !== 1 ? "s" : ""} disponibles
                      </span>
                    )}
                  </div>
                  {t.descripcion && <p className={`text-xs ${M} line-clamp-2`}>{t.descripcion}</p>}
                </Card>
              ))}
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
