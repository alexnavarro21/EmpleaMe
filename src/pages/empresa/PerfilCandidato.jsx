import { useNavigate } from "react-router-dom";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, PageHeader } from "../../components/ui";

const student = {
  name: "Carlos Mendoza",
  career: "Desarrollo de Software",
  institute: "Instituto Técnico Nacional",
  semester: 6,
  gpa: 17.2,
  teacherRating: 4.5,
  location: "Lima, Perú",
  email: "carlos.mendoza@itn.edu.pe",
  phone: "+51 999 888 777",
  skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git"],
  softSkills: ["Trabajo en equipo", "Comunicación", "Resolución de problemas"],
  bio: "Estudiante de 6to semestre especializado en desarrollo frontend. He trabajado en proyectos de e-commerce y aplicaciones web usando React y Node.js. Busco una práctica donde pueda aportar y seguir aprendiendo en un entorno profesional.",
  experiences: [
    { title: "Proyecto Final — Tienda Online", desc: "Desarrollé una tienda online con React, Node.js y PostgreSQL. Incluye carrito, pagos y panel de administración.", date: "Nov 2024" },
    { title: "Hackathon TechLima 2024", desc: "Equipo ganador del 2do lugar. Desarrollamos un chatbot para orientación vocacional.", date: "Sep 2024" },
  ],
  evidences: [
    { name: "proyecto_final.mp4", type: "video" },
    { name: "certificado_react.pdf", type: "pdf" },
    { name: "foto_hackathon.jpg", type: "imagen" },
  ],
};

export default function EmpresaPerfilCandidato() {
  const { isDark } = useDark();
  const navigate = useNavigate();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  return (
    <div>
      <PageHeader
        title="Perfil del Candidato"
        subtitle="Vista detallada para evaluación"
        action={
          <SecondaryButton onClick={() => navigate(-1)}>← Volver</SecondaryButton>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="flex flex-col gap-4">
          <Card className="text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl ${S}`}>
              👤
            </div>
            <p className={`text-lg font-semibold ${T}`}>{student.name}</p>
            <p className={`text-sm ${M} mb-3`}>{student.career}</p>
            <Badge color="blue">92% match</Badge>

            <div className={`mt-4 pt-4 border-t ${B} flex flex-col gap-2 text-left`}>
              <p className={`flex items-center gap-2 text-xs ${M}`}>📍 {student.location}</p>
              <p className={`flex items-center gap-2 text-xs ${M}`}>📧 {student.email}</p>
              <p className={`flex items-center gap-2 text-xs ${M}`}>📱 {student.phone}</p>
              <p className={`flex items-center gap-2 text-xs ${M}`}>🏫 {student.institute}</p>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <PrimaryButton className="w-full">Contactar al estudiante</PrimaryButton>
              <SecondaryButton className="w-full">Invitar a práctica</SecondaryButton>
            </div>
          </Card>

          <Card>
            <p className={`text-sm font-medium ${T} mb-3`}>Métricas académicas</p>
            <div className={`flex flex-col gap-3`}>
              <div className={`flex justify-between items-center pb-3 border-b ${B}`}>
                <span className={`text-xs ${M}`}>Promedio</span>
                <span className={`text-sm font-semibold ${T}`}>{student.gpa} / 20</span>
              </div>
              <div className={`flex justify-between items-center pb-3 border-b ${B}`}>
                <span className={`text-xs ${M}`}>Eval. docente</span>
                <span className={`text-sm font-semibold ${T}`}>⭐ {student.teacherRating}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${M}`}>Semestre</span>
                <span className={`text-sm font-semibold ${T}`}>{student.semester}° sem.</span>
              </div>
            </div>
          </Card>

          <Card>
            <p className={`text-sm font-medium ${T} mb-3`}>Evidencias ({student.evidences.length})</p>
            {student.evidences.map((e) => (
              <div key={e.name} className={`flex items-center gap-2 text-xs ${M} mb-2`}>
                <span>{e.type === "video" ? "🎬" : e.type === "pdf" ? "📄" : "🖼️"}</span>
                <span className="truncate">{e.name}</span>
              </div>
            ))}
            <button className="text-xs text-[#378ADD] hover:underline mt-1">Ver todas las evidencias</button>
          </Card>
        </div>

        {/* Main content */}
        <div className="col-span-2 flex flex-col gap-4">
          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-2`}>Sobre mí</h3>
            <p className={`text-sm ${M} leading-relaxed`}>{student.bio}</p>
          </Card>

          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-3`}>Habilidades técnicas</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {student.skills.map((s) => (
                <span key={s} className={`text-sm px-3 py-1.5 rounded-full border ${B} ${T}`}>{s}</span>
              ))}
            </div>
            <h3 className={`text-sm font-semibold ${T} mb-3`}>Habilidades blandas</h3>
            <div className="flex flex-wrap gap-2">
              {student.softSkills.map((s) => (
                <span key={s} className={`text-sm px-3 py-1.5 rounded-full ${S} ${M}`}>{s}</span>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-3`}>Proyectos y experiencias</h3>
            {student.experiences.map((exp, i) => (
              <div key={exp.title} className={`${i < student.experiences.length - 1 ? `pb-4 mb-4 border-b ${B}` : ""}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className={`text-sm font-medium ${T}`}>{exp.title}</p>
                  <span className={`text-xs ${M} flex-shrink-0`}>{exp.date}</span>
                </div>
                <p className={`text-xs ${M} leading-relaxed`}>{exp.desc}</p>
              </div>
            ))}
          </Card>

          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-3`}>Video de presentación</h3>
            <div className={`rounded-xl border-2 border-dashed ${B} flex flex-col items-center justify-center py-12`}>
              <span className="text-4xl mb-2">▶️</span>
              <p className={`text-sm ${M}`}>Video disponible · 1:45 min</p>
              <button className="mt-3 text-sm text-[#378ADD] hover:underline">Reproducir video</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
