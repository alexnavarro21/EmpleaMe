import { useState } from "react";
import { Link } from "react-router-dom";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, PageHeader } from "../../components/ui";

const students = [
  { id: 1, name: "María López", career: "Desarrollo de Software", semester: 8, gpa: 19.0, skills: ["React", "Python", "SQL"], match: 95, teacherRating: 4.8 },
  { id: 2, name: "Carlos Mendoza", career: "Desarrollo de Software", semester: 6, gpa: 17.2, skills: ["JavaScript", "React", "Node.js"], match: 92, teacherRating: 4.5 },
  { id: 3, name: "Ana Torres", career: "Sistemas de Información", semester: 7, gpa: 18.5, skills: ["SQL", "Power BI", "Excel"], match: 89, teacherRating: 4.7 },
  { id: 4, name: "Luis García", career: "Redes y Comunicaciones", semester: 6, gpa: 16.8, skills: ["Linux", "Cisco", "Python"], match: 81, teacherRating: 4.2 },
  { id: 5, name: "Sofia Vargas", career: "Diseño Digital", semester: 5, gpa: 17.9, skills: ["Figma", "Photoshop", "CSS"], match: 77, teacherRating: 4.6 },
  { id: 6, name: "Diego Ríos", career: "Desarrollo de Software", semester: 8, gpa: 18.1, skills: ["Java", "Spring", "Docker"], match: 74, teacherRating: 4.3 },
];

const careers = ["Todas", "Desarrollo de Software", "Sistemas de Información", "Redes y Comunicaciones", "Diseño Digital"];

export default function EmpresaBuscadorEstudiantes() {
  const { isDark } = useDark();
  const [search, setSearch] = useState("");
  const [selectedCareer, setSelectedCareer] = useState("Todas");
  const [minGpa, setMinGpa] = useState(0);
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.skills.some((sk) => sk.toLowerCase().includes(search.toLowerCase()));
    const matchCareer = selectedCareer === "Todas" || s.career === selectedCareer;
    const matchGpa = s.gpa >= minGpa;
    return matchSearch && matchCareer && matchGpa;
  });

  return (
    <div>
      <PageHeader
        title="Buscar Estudiantes"
        subtitle={`${filtered.length} estudiantes encontrados`}
      />

      <div className="grid grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="flex flex-col gap-4">
          <Card>
            <p className={`text-sm font-semibold ${T} mb-3`}>Filtros</p>

            {/* Search */}
            <div className="mb-4">
              <label className={`block text-xs mb-1.5 ${M}`}>Buscar por nombre o habilidad</label>
              <input
                type="text"
                placeholder="ej. React, Python..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] focus:ring-2 focus:ring-[#B5D4F4] ${
                  isDark
                    ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                    : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
                }`}
              />
            </div>

            {/* Career */}
            <div className="mb-4">
              <label className={`block text-xs mb-2 ${M}`}>Carrera</label>
              {careers.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCareer(c)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg mb-1 transition-colors ${
                    selectedCareer === c
                      ? "bg-[#185FA5] text-[#E6F1FB]"
                      : `${T} hover:bg-[#185FA5]/10`
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Min GPA */}
            <div className="mb-4">
              <label className={`block text-xs mb-2 ${M}`}>Nota mínima: <strong className={T}>{minGpa > 0 ? minGpa : "Sin filtro"}</strong></label>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={minGpa}
                onChange={(e) => setMinGpa(parseFloat(e.target.value))}
                className="w-full accent-[#185FA5]"
              />
              <div className={`flex justify-between text-xs ${M} mt-1`}>
                <span>0</span>
                <span>10</span>
                <span>20</span>
              </div>
            </div>

            {/* Teacher rating */}
            <div>
              <label className={`block text-xs mb-2 ${M}`}>Evaluación docente mínima</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} className="text-xl hover:scale-110 transition-transform">
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setSearch(""); setSelectedCareer("Todas"); setMinGpa(0); }}
              className={`mt-4 w-full text-xs text-[#378ADD] hover:underline`}
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
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${S}`}>
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${T} truncate`}>{s.name}</p>
                    </div>
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
                    <p className={`text-sm font-semibold ${T}`}>{s.gpa}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${M}`}>Eval. docente</p>
                    <p className={`text-sm font-semibold ${T}`}>⭐ {s.teacherRating}</p>
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
              <p className="text-4xl mb-3">🔍</p>
              <p className={`text-base font-medium ${T}`}>No se encontraron estudiantes</p>
              <p className="text-sm">Prueba con otros filtros</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
