import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, PageHeader } from "../../components/ui";

const students = [
  {
    id: 1,
    name: "Catalina Muñoz",
    career: "Administración",
    semester: 4,
    gpa: 6.5,
    skills: ["Excel avanzado", "Contabilidad", "Atención al cliente"],
    match: 95,
    teacherRating: 6.8,
  },
  {
    id: 2,
    name: "Felipe Rojas",
    career: "Mecánica Automotriz",
    semester: 3,
    gpa: 6.2,
    skills: ["Diagnóstico de fallas", "Mantención preventiva", "Soldadura básica"],
    match: 92,
    teacherRating: 6.4,
  },
  {
    id: 3,
    name: "Valentina Soto",
    career: "Administración",
    semester: 6,
    gpa: 5.9,
    skills: ["Facturación electrónica", "Excel", "Gestión de RRHH"],
    match: 88,
    teacherRating: 6.2,
  },
  {
    id: 4,
    name: "Sebastián Contreras",
    career: "Mecánica Automotriz",
    semester: 5,
    gpa: 5.8,
    skills: ["Reparación de motor", "Frenos y suspensión", "Escáner automotriz"],
    match: 84,
    teacherRating: 6.0,
  },
  {
    id: 5,
    name: "Camila Fuentes",
    career: "Administración",
    semester: 4,
    gpa: 6.1,
    skills: ["Contabilidad básica", "Excel", "Atención al cliente"],
    match: 79,
    teacherRating: 6.3,
  },
  {
    id: 6,
    name: "Diego Castillo",
    career: "Mecánica Automotriz",
    semester: 6,
    gpa: 6.4,
    skills: ["Soldadura", "Motor diésel", "Sistemas hidráulicos"],
    match: 74,
    teacherRating: 6.5,
  },
];

const careers = ["Todas", "Administración", "Mecánica Automotriz"];

export default function EmpresaBuscadorEstudiantes() {
  const { isDark } = useDark();
  const [search, setSearch] = useState("");
  const [selectedCareer, setSelectedCareer] = useState("Todas");
  const [minGpa, setMinGpa] = useState(1);
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.skills.some((sk) => sk.toLowerCase().includes(search.toLowerCase()));
    const matchCareer = selectedCareer === "Todas" || s.career === selectedCareer;
    const matchGpa = s.gpa >= minGpa;
    return matchSearch && matchCareer && matchGpa;
  });

  return (
    <div>
      <PageHeader
        title="Buscar Estudiantes"
        subtitle={`${filtered.length} estudiantes encontrados · C.E. Cardenal J.M. Caro`}
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
              {careers.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCareer(c)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg mb-1 transition-colors flex items-center gap-2 ${
                    selectedCareer === c
                      ? "bg-[#185FA5] text-[#E6F1FB]"
                      : `${T} hover:bg-[#185FA5]/10`
                  }`}
                >
                  <Icon
                    icon={c === "Mecánica Automotriz" ? "mdi:car-wrench" : c === "Administración" ? "mdi:clipboard-list-outline" : "mdi:account-group-outline"}
                    width={14}
                  />
                  {c}
                </button>
              ))}
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

            <div>
              <label className={`block text-xs mb-2 ${M}`}>Evaluación docente mínima</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star}>
                    <Icon icon="solar:star-bold-duotone" width={20} className="text-yellow-400" />
                  </button>
                ))}
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
            {filtered.map((s) => (
              <Card key={s.id} className="hover:border-[#378ADD] transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                    <Icon icon="mynaui:user-solid" width={22} className="text-[#378ADD]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${T} truncate`}>{s.name}</p>
                    <p className={`text-xs ${M}`}>{s.career} · Sem. {s.semester}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg font-bold text-[#378ADD]">{s.match}%</p>
                    <p className={`text-xs ${M}`}>match</p>
                  </div>
                </div>

                <div className={`flex gap-4 mb-3 pb-3 border-b ${B}`}>
                  <div>
                    <p className={`text-xs ${M}`}>Promedio</p>
                    <p className={`text-sm font-semibold ${T}`}>{s.gpa.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${M}`}>Eval. docente</p>
                    <p className={`text-sm font-semibold ${T} flex items-center gap-1`}>
                      <Icon icon="solar:star-bold-duotone" width={14} className="text-yellow-400" />
                      {s.teacherRating.toFixed(1)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {s.skills.map((sk) => (
                    <Badge key={sk} color="blue">{sk}</Badge>
                  ))}
                </div>

                <Link to={`/empresa/candidato/${s.id}`}>
                  <PrimaryButton className="w-full">Ver perfil completo</PrimaryButton>
                </Link>
              </Card>
            ))}
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
