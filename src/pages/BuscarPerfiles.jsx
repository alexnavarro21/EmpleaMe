import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { Card, Badge, PrimaryButton, PageHeader } from "../components/ui";
import { getEstudiantes, getEmpresas, iniciarMensajeDirecto, iniciarConversacionConEmpresa } from "../services/api";

const careerDisplay = {
  Administracion: "Administración",
  "Mecanica Automotriz": "Mecánica Automotriz",
};

export default function BuscarPerfiles() {
  const { isDark } = useDark();
  const location = useLocation();
  const navigate = useNavigate();

  const [tab, setTab] = useState("estudiantes");
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCareer, setSelectedCareer] = useState("Todas");
  const [minGpa, setMinGpa] = useState(1);
  const [contactandoId, setContactandoId] = useState(null);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";

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
    Promise.allSettled([getEstudiantes(), getEmpresas()])
      .then(([sts, cos]) => {
        if (sts.status === "fulfilled") setStudents(sts.value);
        if (cos.status === "fulfilled") setCompanies(cos.value);
      })
      .finally(() => setLoading(false));
  }, []);

  const uniqueCareers = ["Todas", ...new Set(students.map((s) => s.carrera))];

  const filteredStudents = students.filter((s) => {
    const nombreCarrera = careerDisplay[s.carrera] || s.carrera;
    const matchSearch =
      s.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
      (s.habilidades || []).some((sk) => sk.toLowerCase().includes(search.toLowerCase()));
    const matchCareer =
      selectedCareer === "Todas" ||
      s.carrera === selectedCareer ||
      nombreCarrera === selectedCareer;
    const matchGpa = !s.promedio || s.promedio >= minGpa;
    return matchSearch && matchCareer && matchGpa;
  });

  const filteredCompanies = companies.filter((c) =>
    c.nombre_empresa.toLowerCase().includes(search.toLowerCase()) ||
    (c.descripcion || "").toLowerCase().includes(search.toLowerCase())
  );

  const count = tab === "estudiantes" ? filteredStudents.length : filteredCompanies.length;
  const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}");

  const handleContactarEstudiante = async (estudianteId) => {
    setContactandoId(estudianteId);
    try {
      const conv = await iniciarMensajeDirecto(estudianteId);
      navigate("/estudiante/mensajeria", { state: { directaId: conv.id } });
    } catch (err) {
      console.error("Error al contactar:", err);
    } finally {
      setContactandoId(null);
    }
  };

  const handleContactarEmpresa = async (empresaId) => {
    setContactandoId(empresaId);
    try {
      const conv = await iniciarConversacionConEmpresa(empresaId);
      navigate("/estudiante/mensajeria", { state: { conversacionId: conv.id } });
    } catch (err) {
      console.error("Error al contactar:", err);
    } finally {
      setContactandoId(null);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-24 ${M}`}>
        <Icon icon="mdi:loading" width={28} className="animate-spin mr-2" />
        Cargando perfiles...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Buscar Perfiles"
        subtitle={`${count} ${tab === "estudiantes" ? "estudiante" : "empresa"}${count !== 1 ? "s" : ""} encontrado${count !== 1 ? "s" : ""}`}
      />

      {/* Tabs */}
      <div className={`flex gap-1 mb-5 p-1 rounded-xl w-fit border ${B} ${BG}`}>
        {[
          { id: "estudiantes", icon: "mynaui:user-solid", label: "Estudiantes" },
          { id: "empresas", icon: "mdi:office-building-outline", label: "Empresas" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSearch(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-[#185FA5] text-[#E6F1FB]"
                : `${M} hover:bg-[#185FA5]/10`
            }`}
          >
            <Icon icon={t.icon} width={15} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Filters */}
        <div className="flex flex-col gap-4">
          <Card>
            <p className={`text-sm font-semibold ${T} mb-4`}>Filtros</p>

            <div className="mb-4">
              <label className={`block text-xs mb-1.5 ${M}`}>Buscar</label>
              <div className="relative">
                <Icon icon="mdi:search" width={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${M}`} />
                <input
                  type="text"
                  placeholder={tab === "estudiantes" ? "Nombre o habilidad..." : "Nombre o descripción..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full pl-8 pr-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                    isDark
                      ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                      : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
                  }`}
                />
              </div>
            </div>

            {tab === "estudiantes" && (
              <>
                <div className="mb-4">
                  <label className={`block text-xs mb-2 ${M}`}>Carrera técnica</label>
                  {uniqueCareers.map((c) => {
                    const label = careerDisplay[c] || c;
                    const isActive =
                      selectedCareer === c ||
                      (selectedCareer !== "Todas" && (careerDisplay[selectedCareer] || selectedCareer) === label);
                    return (
                      <button
                        key={c}
                        onClick={() => setSelectedCareer(c)}
                        className={`w-full text-left text-sm px-3 py-1.5 rounded-lg mb-1 transition-colors flex items-center gap-2 ${
                          isActive ? "bg-[#185FA5] text-[#E6F1FB]" : `${T} hover:bg-[#185FA5]/10`
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

                <div className="mb-4">
                  <label className={`block text-xs mb-2 ${M}`}>
                    Nota mínima: <strong className={T}>{minGpa > 1 ? minGpa.toFixed(1) : "Sin filtro"}</strong>
                  </label>
                  <input
                    type="range" min="1" max="7" step="0.1"
                    value={minGpa}
                    onChange={(e) => setMinGpa(parseFloat(e.target.value))}
                    className="w-full accent-[#185FA5]"
                  />
                  <div className={`flex justify-between text-xs ${M} mt-1`}>
                    <span>1.0</span><span>4.0</span><span>7.0</span>
                  </div>
                </div>
              </>
            )}

            <button
              onClick={() => { setSearch(""); setSelectedCareer("Todas"); setMinGpa(1); }}
              className="mt-2 w-full text-xs text-[#378ADD] hover:underline"
            >
              Limpiar filtros
            </button>
          </Card>
        </div>

        {/* Cards */}
        <div className="col-span-3">
          {tab === "estudiantes" && (
            <div className="grid grid-cols-2 gap-4">
              {filteredStudents.map((s) => {
                const nombreCarrera = careerDisplay[s.carrera] || s.carrera;
                return (
                  <Card key={s.usuario_id} className="hover:border-[#378ADD] transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                        <Icon icon="mynaui:user-solid" width={22} className="text-[#378ADD]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${T} truncate`}>{s.nombre_completo}</p>
                        <p className={`text-xs ${M}`}>{nombreCarrera}{s.semestre ? ` · Sem. ${s.semestre}` : ""}</p>
                      </div>
                    </div>
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
                          <Icon
                            icon={contactandoId === s.usuario_id ? "mdi:loading" : "mdi:message-outline"}
                            width={16}
                            className={contactandoId === s.usuario_id ? "animate-spin" : ""}
                          />
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
                    <div className="w-10 h-10 rounded-full bg-[#185FA5] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      {c.nombre_empresa?.[0]?.toUpperCase() ?? "E"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${T} truncate`}>{c.nombre_empresa}</p>
                      <p className={`text-xs ${M} flex items-center gap-1`}>
                        <Icon icon="mdi:briefcase-outline" width={12} />
                        {c.total_vacantes || 0} vacante{c.total_vacantes !== 1 ? "s" : ""} activa{c.total_vacantes !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Badge color="blue">Empresa</Badge>
                  </div>
                  {c.descripcion && (
                    <p className={`text-xs ${M} mb-3 line-clamp-2`}>{c.descripcion}</p>
                  )}
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
              {filteredCompanies.length === 0 && <EmptyState T={T} M={M} />}
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
