import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, PageHeader } from "../../components/ui";
import { getEstudiantes } from "../../services/api";

const careers = ["Todas", "Administración", "Mecánica Automotriz", "Mecanica Automotriz", "Administracion"];
const careerDisplay = {
  "Administracion": "Administración",
  "Mecanica Automotriz": "Mecánica Automotriz",
};

export default function EmpresaBuscadorEstudiantes() {
  const { isDark } = useDark();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCareer, setSelectedCareer] = useState("Todas");
  const [minGpa, setMinGpa] = useState(1);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  useEffect(() => {
    getEstudiantes()
      .then(setStudents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const uniqueCareers = ["Todas", ...new Set(students.map((s) => s.carrera))];

  const filtered = students.filter((s) => {
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

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-24 ${M}`}>
        <Icon icon="mdi:loading" width={28} className="animate-spin mr-2" />
        Cargando estudiantes...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Buscar Estudiantes"
        subtitle={`${filtered.length} estudiante${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
      />

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
                  placeholder="Nombre o habilidad..."
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

            <div className="mb-4">
              <label className={`block text-xs mb-2 ${M}`}>Carrera técnica</label>
              {uniqueCareers.map((c) => {
                const label = careerDisplay[c] || c;
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedCareer(c)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg mb-1 transition-colors flex items-center gap-2 ${
                      selectedCareer === c || (selectedCareer !== "Todas" && (careerDisplay[selectedCareer] || selectedCareer) === label)
                        ? "bg-[#185FA5] text-[#E6F1FB]"
                        : `${T} hover:bg-[#185FA5]/10`
                    }`}
                  >
                    <Icon
                      icon={
                        c.includes("Mecánica") || c.includes("Mecanica")
                          ? "mdi:car-wrench"
                          : c === "Todas"
                          ? "mdi:account-group-outline"
                          : "mdi:clipboard-list-outline"
                      }
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
                type="range"
                min="1"
                max="7"
                step="0.1"
                value={minGpa}
                onChange={(e) => setMinGpa(parseFloat(e.target.value))}
                className="w-full accent-[#185FA5]"
              />
              <div className={`flex justify-between text-xs ${M} mt-1`}>
                <span>1.0</span>
                <span>4.0</span>
                <span>7.0</span>
              </div>
            </div>

            <button
              onClick={() => { setSearch(""); setSelectedCareer("Todas"); setMinGpa(1); }}
              className="mt-4 w-full text-xs text-[#378ADD] hover:underline"
            >
              Limpiar filtros
            </button>
          </Card>
        </div>

        {/* Student cards */}
        <div className="col-span-3">
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((s) => {
              const nombreCarrera = careerDisplay[s.carrera] || s.carrera;
              return (
                <Card key={s.usuario_id} className="hover:border-[#378ADD] transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                      <Icon icon="mynaui:user-solid" width={22} className="text-[#378ADD]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${T} truncate`}>{s.nombre_completo}</p>
                      <p className={`text-xs ${M}`}>
                        {nombreCarrera}{s.semestre ? ` · Sem. ${s.semestre}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className={`flex gap-4 mb-3 pb-3 border-b ${B}`}>
                    <div>
                      <p className={`text-xs ${M}`}>Promedio</p>
                      <p className={`text-sm font-semibold ${T}`}>
                        {s.promedio ? parseFloat(s.promedio).toFixed(1) : "—"}
                      </p>
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
                      {s.habilidades.slice(0, 3).map((sk) => (
                        <Badge key={sk} color="blue">{sk}</Badge>
                      ))}
                      {s.habilidades.length > 3 && (
                        <span className={`text-xs ${M}`}>+{s.habilidades.length - 3} más</span>
                      )}
                    </div>
                  )}

                  <Link to={`/empresa/candidato/${s.usuario_id}`}>
                    <PrimaryButton className="w-full">Ver perfil completo</PrimaryButton>
                  </Link>
                </Card>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className={`text-center py-16 ${M}`}>
              <Icon icon="mdi:search" width={48} className={`mx-auto mb-3 ${M}`} />
              <p className={`text-base font-medium ${T}`}>No se encontraron estudiantes</p>
              <p className="text-sm">Prueba con otros filtros</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
