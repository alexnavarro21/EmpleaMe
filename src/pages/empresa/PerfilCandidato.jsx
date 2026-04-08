import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, PageHeader, SoftSkillBar } from "../../components/ui";
import { getEstudianteById } from "../../services/api";

const careerDisplay = {
  "Administracion": "Administración",
  "Mecanica Automotriz": "Mecánica Automotriz",
};

export default function EmpresaPerfilCandidato() {
  const { isDark } = useDark();
  const navigate = useNavigate();
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  useEffect(() => {
    getEstudianteById(id)
      .then(setStudent)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-24 ${M}`}>
        <Icon icon="mdi:loading" width={28} className="animate-spin mr-2" />
        Cargando perfil...
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className={`text-center py-24 ${M}`}>
        <Icon icon="mdi:account-off-outline" width={48} className="mx-auto mb-3" />
        <p className={`text-base font-medium ${T}`}>{error || "Perfil no encontrado"}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-[#378ADD] hover:underline">
          ← Volver
        </button>
      </div>
    );
  }

  const nombreCarrera = careerDisplay[student.carrera] || student.carrera;
  const habilidadesTecnicas = (student.habilidades || []).filter((h) => h.categoria === "tecnica");
  const habilidadesBlandas = (student.habilidades || []).filter((h) => h.categoria === "blanda");
  const evidences = student.portafolio || [];

  const evidenceIcon = (url) => {
    if (url.endsWith(".mp4") || url.endsWith(".mov")) return "mdi:play-circle-outline";
    if (url.endsWith(".pdf")) return "mdi:file-account-outline";
    return "mdi:image-outline";
  };

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
            <p className={`text-lg font-semibold ${T}`}>{student.nombre_completo}</p>
            <p className={`text-sm ${M} mb-2`}>{nombreCarrera}</p>
            {student.semestre && <Badge color="blue">Semestre {student.semestre}</Badge>}

            <div className={`mt-4 pt-4 border-t ${B} flex flex-col gap-2.5 text-left`}>
              {student.telefono && (
                <p className={`flex items-center gap-2 text-xs ${M}`}>
                  <Icon icon="mdi:phone-outline" width={14} className="flex-shrink-0 text-[#378ADD]" />
                  {student.telefono}
                </p>
              )}
              <p className={`flex items-center gap-2 text-xs ${M}`}>
                <Icon icon="fa6-solid:school" width={14} className="flex-shrink-0 text-[#378ADD]" />
                C.E. Cardenal J.M. Caro
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
                <span className={`text-sm font-semibold ${T}`}>
                  {student.promedio ? `${parseFloat(student.promedio).toFixed(1)} / 7.0` : "—"}
                </span>
              </div>
              {student.calificacion_docente && (
                <div className={`flex justify-between items-center py-2.5 border-b ${B}`}>
                  <span className={`text-xs ${M}`}>Eval. docente</span>
                  <span className={`text-sm font-semibold ${T} flex items-center gap-1`}>
                    <Icon icon="solar:star-bold-duotone" width={14} className="text-yellow-400" />
                    {parseFloat(student.calificacion_docente).toFixed(1)}
                  </span>
                </div>
              )}
              {student.semestre && (
                <div className="flex justify-between items-center py-2.5">
                  <span className={`text-xs ${M}`}>Semestre</span>
                  <span className={`text-sm font-semibold ${T}`}>{student.semestre}° sem.</span>
                </div>
              )}
            </div>
          </Card>

          {evidences.length > 0 && (
            <Card>
              <p className={`text-sm font-medium ${T} mb-3`}>
                Evidencias ({evidences.length})
              </p>
              {evidences.map((e) => (
                <div key={e.id} className={`flex items-center gap-2 text-xs ${M} mb-2`}>
                  <Icon icon={evidenceIcon(e.url_multimedia)} width={15} className="text-[#378ADD] flex-shrink-0" />
                  <span className="truncate">{e.descripcion || e.url_multimedia}</span>
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Main content */}
        <div className="col-span-2 flex flex-col gap-4">
          {student.biografia && (
            <Card>
              <h3 className={`text-sm font-semibold ${T} mb-2`}>Sobre mí</h3>
              <p className={`text-sm ${M} leading-relaxed`}>{student.biografia}</p>
            </Card>
          )}

          {habilidadesTecnicas.length > 0 && (
            <Card>
              <h3 className={`text-sm font-semibold ${T} mb-3 flex items-center gap-2`}>
                <Icon icon="mdi:wrench-outline" width={16} className="text-[#378ADD]" />
                Habilidades técnicas
              </h3>
              <div className="flex flex-wrap gap-2">
                {habilidadesTecnicas.map((h) => (
                  <span key={h.id || h.nombre} className={`text-sm px-3 py-1.5 rounded-full border ${B} ${T}`}>
                    {h.nombre}
                    {h.nivel_dominio && (
                      <span className={`ml-1 text-xs ${M}`}>· {h.nivel_dominio}</span>
                    )}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {habilidadesBlandas.length > 0 && (
            <Card>
              <h3 className={`text-sm font-semibold ${T} mb-4 flex items-center gap-2`}>
                <Icon icon="hugeicons:brain-02" width={16} className="text-[#378ADD]" />
                Habilidades blandas
                <span className={`text-xs font-normal ${M}`}>— evaluadas por docente</span>
              </h3>
              {habilidadesBlandas.map((h) => (
                <SoftSkillBar
                  key={h.id || h.nombre}
                  label={h.nombre}
                  percentage={h.nivel_dominio === "Avanzado" ? 90 : h.nivel_dominio === "Intermedio" ? 65 : 40}
                />
              ))}
            </Card>
          )}

          {!student.biografia && habilidadesTecnicas.length === 0 && habilidadesBlandas.length === 0 && (
            <Card>
              <div className={`text-center py-10 ${M}`}>
                <Icon icon="mdi:account-edit-outline" width={40} className="mx-auto mb-3" />
                <p className={`text-sm font-medium ${T}`}>Perfil incompleto</p>
                <p className="text-xs mt-1">El estudiante aún no ha completado su perfil.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
