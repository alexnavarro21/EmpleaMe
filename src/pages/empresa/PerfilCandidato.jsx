import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, PageHeader, SoftSkillBar } from "../../components/ui";
import PublicacionesUsuario from "../../components/PublicacionesUsuario";
import { getEstudianteById, iniciarConversacion, iniciarMensajeDirecto } from "../../services/api";

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
  const [contactando, setContactando] = useState(false);

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

  const viewer = JSON.parse(localStorage.getItem("usuario") || "{}");
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
            <p className={`text-sm ${M}`}>{nombreCarrera}</p>
            {(student.comuna || student.region) && (
              <p className={`text-xs ${M} flex items-center justify-center gap-1 mb-1`}>
                <Icon icon="mdi:map-marker-outline" width={12} />
                {[student.comuna, student.region].filter(Boolean).join(", ")}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 justify-center mb-2">
              {student.semestre && <Badge color="blue">Semestre {student.semestre}</Badge>}
              {student.estado_civil && <Badge color="gray">{student.estado_civil}</Badge>}
            </div>

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
              <PrimaryButton
                className="w-full flex items-center justify-center gap-2"
                disabled={contactando}
                onClick={async () => {
                  const viewer = JSON.parse(localStorage.getItem("usuario") || "{}");
                  setContactando(true);
                  try {
                    if (viewer.rol === "estudiante") {
                      const conv = await iniciarMensajeDirecto(id);
                      navigate("/estudiante/mensajeria", { state: { directaId: conv.id } });
                    } else {
                      const conv = await iniciarConversacion(id);
                      navigate("/empresa/mensajeria", { state: { conversacionId: conv.id } });
                    }
                  } catch (err) {
                    console.error("Error al contactar:", err);
                  } finally {
                    setContactando(false);
                  }
                }}
              >
                {contactando
                  ? <Icon icon="mdi:loading" width={16} className="animate-spin" />
                  : <Icon icon="mdi:message-outline" width={16} />}
                {contactando ? "Abriendo chat..." : "Contactar estudiante"}
              </PrimaryButton>
              <SecondaryButton className="w-full flex items-center justify-center gap-2">
                <Icon icon="fluent:handshake-32-regular" width={16} />
                Invitar a práctica
              </SecondaryButton>
            </div>
          </Card>

          {viewer.rol !== "estudiante" && (
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
          )}

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
                  percentage={h.porcentaje ?? (h.nivel_dominio === "Avanzado" ? 90 : h.nivel_dominio === "Intermedio" ? 65 : 40)}
                />
              ))}
            </Card>
          )}

          {(student.idiomas || []).length > 0 && (
            <Card>
              <h3 className={`text-sm font-semibold ${T} mb-3 flex items-center gap-2`}>
                <Icon icon="mdi:translate" width={16} className="text-[#378ADD]" />
                Idiomas
              </h3>
              <div className="flex flex-wrap gap-2">
                {student.idiomas.map((i) => (
                  <span key={i.id} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${B} ${T}`}>
                    {i.idioma}
                    <span className={`${M}`}>· {i.nivel}</span>
                  </span>
                ))}
              </div>
            </Card>
          )}

          {(student.historial_academico || []).length > 0 && (
            <Card>
              <h3 className={`text-sm font-semibold ${T} mb-3 flex items-center gap-2`}>
                <Icon icon="mdi:school-outline" width={16} className="text-[#378ADD]" />
                Historial académico
              </h3>
              <div className="flex flex-col gap-3">
                {student.historial_academico.map((a) => (
                  <div key={a.id} className={`pb-3 border-b ${B} last:border-0 last:pb-0`}>
                    <p className={`text-sm font-medium ${T}`}>{a.titulo}</p>
                    <p className={`text-xs ${M}`}>{a.institucion}{a.area ? ` · ${a.area}` : ""}</p>
                    {(a.fecha_inicio || a.fecha_fin) && (
                      <p className={`text-xs ${M}`}>{a.fecha_inicio || "?"} – {a.fecha_fin || "En curso"}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(student.historial_laboral || []).length > 0 && (
            <Card>
              <h3 className={`text-sm font-semibold ${T} mb-3 flex items-center gap-2`}>
                <Icon icon="mdi:briefcase-outline" width={16} className="text-[#378ADD]" />
                Experiencia laboral
              </h3>
              <div className="flex flex-col gap-3">
                {student.historial_laboral.map((l) => (
                  <div key={l.id} className={`pb-3 border-b ${B} last:border-0 last:pb-0`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${T}`}>{l.cargo}</p>
                      <Badge color={l.tipo === "practica_completada" ? "green" : "blue"}>
                        {l.tipo === "practica_completada" ? "Práctica" : "Verificado"}
                      </Badge>
                    </div>
                    <p className={`text-xs ${M}`}>{l.empresa_nombre}</p>
                    {(l.fecha_inicio || l.fecha_fin) && (
                      <p className={`text-xs ${M}`}>
                        {l.fecha_inicio ? new Date(l.fecha_inicio).toLocaleDateString("es-CL", { month: "short", year: "numeric" }) : "?"}
                        {" – "}
                        {l.fecha_fin ? new Date(l.fecha_fin).toLocaleDateString("es-CL", { month: "short", year: "numeric" }) : "Presente"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
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

      <PublicacionesUsuario usuarioId={id} />
    </div>
  );
}
