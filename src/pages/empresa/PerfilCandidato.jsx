import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, PageHeader, SoftSkillBar } from "../../components/ui";

const student = {
  name: "Felipe Rojas",
  career: "Mecánica Automotriz",
  institute: "C.E. Cardenal José María Caro",
  location: "Lo Espejo, Santiago",
  semester: 3,
  gpa: 6.2,
  teacherRating: 6.4,
  email: "felipe.rojas@colegio.cl",
  phone: "+56 9 8765 4321",
  skills: [
    "Diagnóstico de fallas",
    "Mantención preventiva",
    "Soldadura básica",
    "Sistemas eléctricos automotrices",
    "Escáner automotriz",
    "Cambio de aceite y filtros",
  ],
  softSkills: [
    { label: "Trabajo en equipo", percentage: 82 },
    { label: "Responsabilidad", percentage: 88 },
    { label: "Atención al detalle", percentage: 85 },
    { label: "Comunicación con clientes", percentage: 70 },
    { label: "Seguridad e higiene laboral", percentage: 90 },
    { label: "Adaptabilidad", percentage: 75 },
  ],
  bio: "Estudiante de 3er semestre de Mecánica Automotriz. He participado en talleres prácticos de diagnóstico electrónico, mantención de frenos y sistemas de suspensión. Busco una práctica donde pueda aplicar mis conocimientos técnicos y seguir aprendiendo junto a profesionales del área.",
  experiences: [
    {
      title: "Taller de Diagnóstico Electrónico — Proyecto Final",
      desc: "Diagnóstico completo de un vehículo con escáner OBD-II, identificación de fallas y propuesta de reparación. Nota: 6.8",
      date: "Nov 2024",
    },
    {
      title: "Competencia Técnica Interescolar",
      desc: "2do lugar en competencia de mantención preventiva organizada por el MINEDUC. Representando al C.E. Cardenal J.M. Caro.",
      date: "Sep 2024",
    },
  ],
  evidences: [
    { name: "taller_diagnostico_final.mp4", type: "video" },
    { name: "certificado_competencia.pdf", type: "pdf" },
    { name: "foto_taller_mecanica.jpg", type: "imagen" },
  ],
};

export default function EmpresaPerfilCandidato() {
  const { isDark } = useDark();
  const navigate = useNavigate();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const evidenceIcon = { video: "mdi:play-circle-outline", pdf: "mdi:file-account-outline", imagen: "mdi:image-outline" };

  return (
    <div>
      <PageHeader
        title="Perfil del Candidato"
        subtitle="Vista detallada para evaluación"
        action={<SecondaryButton onClick={() => navigate(-1)}>← Volver</SecondaryButton>}
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="flex flex-col gap-4">
          <Card className="text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center ${S}`}>
              <Icon icon="mynaui:user-solid" width={44} className="text-[#378ADD]" />
            </div>
            <p className={`text-lg font-semibold ${T}`}>{student.name}</p>
            <p className={`text-sm ${M} mb-1`}>{student.career}</p>
            <Badge color="blue">92% match</Badge>

            <div className={`mt-4 pt-4 border-t ${B} flex flex-col gap-2.5 text-left`}>
              <p className={`flex items-center gap-2 text-xs ${M}`}>
                <Icon icon="tdesign:location-filled" width={14} className="flex-shrink-0 text-[#378ADD]" />
                {student.location}
              </p>
              <p className={`flex items-center gap-2 text-xs ${M}`}>
                <Icon icon="mdi:email-outline" width={14} className="flex-shrink-0 text-[#378ADD]" />
                {student.email}
              </p>
              <p className={`flex items-center gap-2 text-xs ${M}`}>
                <Icon icon="mdi:phone-outline" width={14} className="flex-shrink-0 text-[#378ADD]" />
                {student.phone}
              </p>
              <p className={`flex items-center gap-2 text-xs ${M}`}>
                <Icon icon="fa6-solid:school" width={14} className="flex-shrink-0 text-[#378ADD]" />
                {student.institute}
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <PrimaryButton className="w-full">Contactar estudiante</PrimaryButton>
              <SecondaryButton className="w-full flex items-center justify-center gap-2">
                <Icon icon="fluent:handshake-32-regular" width={16} />
                Invitar a práctica
              </SecondaryButton>
            </div>
          </Card>

          <Card>
            <p className={`text-sm font-medium ${T} mb-3`}>Métricas académicas</p>
            <div className="flex flex-col gap-0">
              <div className={`flex justify-between items-center py-2.5 border-b ${B}`}>
                <span className={`text-xs ${M}`}>Promedio</span>
                <span className={`text-sm font-semibold ${T}`}>{student.gpa.toFixed(1)} / 7.0</span>
              </div>
              <div className={`flex justify-between items-center py-2.5 border-b ${B}`}>
                <span className={`text-xs ${M}`}>Eval. docente</span>
                <span className={`text-sm font-semibold ${T} flex items-center gap-1`}>
                  <Icon icon="solar:star-bold-duotone" width={14} className="text-yellow-400" />
                  {student.teacherRating.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className={`text-xs ${M}`}>Semestre</span>
                <span className={`text-sm font-semibold ${T}`}>{student.semester}° sem.</span>
              </div>
            </div>
          </Card>

          <Card>
            <p className={`text-sm font-medium ${T} mb-3`}>
              Evidencias ({student.evidences.length})
            </p>
            {student.evidences.map((e) => (
              <div key={e.name} className={`flex items-center gap-2 text-xs ${M} mb-2`}>
                <Icon icon={evidenceIcon[e.type]} width={15} className="text-[#378ADD] flex-shrink-0" />
                <span className="truncate">{e.name}</span>
              </div>
            ))}
            <button className="text-xs text-[#378ADD] hover:underline mt-1">
              Ver todas las evidencias
            </button>
          </Card>
        </div>

        {/* Main content */}
        <div className="col-span-2 flex flex-col gap-4">
          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-2`}>Sobre mí</h3>
            <p className={`text-sm ${M} leading-relaxed`}>{student.bio}</p>
          </Card>

          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-3 flex items-center gap-2`}>
              <Icon icon="mdi:car-wrench" width={16} className="text-[#378ADD]" />
              Habilidades técnicas
            </h3>
            <div className="flex flex-wrap gap-2">
              {student.skills.map((s) => (
                <span key={s} className={`text-sm px-3 py-1.5 rounded-full border ${B} ${T}`}>{s}</span>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-4 flex items-center gap-2`}>
              <Icon icon="hugeicons:brain-02" width={16} className="text-[#378ADD]" />
              Habilidades blandas
              <span className={`text-xs font-normal ${M}`}>— evaluadas por docente</span>
            </h3>
            {student.softSkills.map((s) => (
              <SoftSkillBar key={s.label} label={s.label} percentage={s.percentage} />
            ))}
          </Card>

          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-3 flex items-center gap-2`}>
              <Icon icon="temaki:suitcase" width={16} className="text-[#378ADD]" />
              Proyectos y experiencias
            </h3>
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
            <h3 className={`text-sm font-semibold ${T} mb-3 flex items-center gap-2`}>
              <Icon icon="mdi:play-circle-outline" width={16} className="text-[#378ADD]" />
              Video de presentación
            </h3>
            <div className={`rounded-xl border-2 border-dashed ${B} flex flex-col items-center justify-center py-12`}>
              <Icon icon="mdi:play" width={40} className={`${M} mb-2`} />
              <p className={`text-sm ${M}`}>Video disponible · 1:45 min</p>
              <button className="mt-3 text-sm text-[#378ADD] hover:underline flex items-center gap-1">
                <Icon icon="mdi:play-circle-outline" width={16} />
                Reproducir video
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
