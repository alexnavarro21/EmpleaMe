import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, PageHeader, SoftSkillBar } from "../../components/ui";
import PublicacionesUsuario from "../../components/PublicacionesUsuario";
import { getEstudianteById, iniciarConversacion, iniciarMensajeDirecto, getVacantesEmpresa, enviarMensaje, getMediaUrl } from "../../services/api";
import { generarCV } from "../../utils/generarCV";

const careerDisplay = {
  "Administracion": "Administración",
  "Mecanica Automotriz": "Mecánica Automotriz",
};

export default function EmpresaPerfilCandidato() {
  const { isDark } = useDark();
  const navigate = useNavigate();
  const { id } = useParams();

  const viewer = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contactando, setContactando] = useState(false);
  const [showInvitarModal, setShowInvitarModal] = useState(false);
  const [vacantesEmpresa, setVacantesEmpresa] = useState([]);
  const [vacanteSel, setVacanteSel] = useState(null);
  const [enviandoInvitacion, setEnviandoInvitacion] = useState(false);
  const [expPagina, setExpPagina] = useState(1);
  const [expPorPagina, setExpPorPagina] = useState(3);
  const [generandoCV, setGenerandoCV] = useState(false);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";

  useEffect(() => {
    getEstudianteById(id)
      .then(setStudent)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (viewer.rol === "empresa") {
      getVacantesEmpresa(viewer.id)
        .then((vs) => setVacantesEmpresa(vs.filter((v) => v.esta_activa)))
        .catch(() => {});
    }
  }, []);

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

  const descargarCV = async () => {
    if (generandoCV) return;
    setGenerandoCV(true);
    try {
      await generarCV({
        nombre:   student.nombre_completo,
        carrera:  student.carrera,
        telefono: student.telefono || "",
        correo:   student.correo   || "",
        region:   student.region   || "",
        comuna:   student.comuna   || "",
        rut:      student.rut      || "",
        biografia: student.biografia || "",
        promedio:  student.promedio  || "",
        fotoUrl:   student.foto_perfil ? getMediaUrl(student.foto_perfil) : null,
        idiomas:   student.idiomas   || [],
        habilidadesBlandas:  habilidadesBlandas,
        habilidadesTecnicas: habilidadesTecnicas,
        experiencia: student.historial_laboral  || [],
        formacion:   student.historial_academico || [],
      });
    } finally {
      setGenerandoCV(false);
    }
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
            {student.foto_perfil ? (
              <img src={getMediaUrl(student.foto_perfil)} className="w-20 h-20 rounded-full object-cover mx-auto mb-3" alt="" />
            ) : (
              <div className={`w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center ${S}`}>
                <Icon icon="mynaui:user-solid" width={44} className="text-[#378ADD]" />
              </div>
            )}
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
              {viewer.rol === "empresa" && (
                <SecondaryButton
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => { setVacanteSel(null); setShowInvitarModal(true); }}
                >
                  <Icon icon="fluent:handshake-32-regular" width={16} />
                  Invitar a vacante
                </SecondaryButton>
              )}
              <SecondaryButton
                className="w-full flex items-center justify-center gap-2"
                disabled={generandoCV}
                onClick={descargarCV}
              >
                {generandoCV
                  ? <Icon icon="mdi:loading" width={16} className="animate-spin" />
                  : <Icon icon="mdi:file-download-outline" width={16} />}
                {generandoCV ? "Generando PDF..." : "Descargar CV"}
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

          {(student.historial_laboral || []).length > 0 && (() => {
            const totalExp = student.historial_laboral.length;
            const totalPagExp = Math.ceil(totalExp / expPorPagina);
            const expPaginadas = student.historial_laboral.slice(
              (expPagina - 1) * expPorPagina,
              expPagina * expPorPagina
            );
            return (
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-semibold ${T} flex items-center gap-2`}>
                    <Icon icon="mdi:briefcase-outline" width={16} className="text-[#378ADD]" />
                    Experiencia
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs ${M}`}>Mostrar</span>
                    <select
                      value={expPorPagina}
                      onChange={(e) => { setExpPorPagina(Number(e.target.value)); setExpPagina(1); }}
                      className={`text-xs rounded-lg border ${B} ${BG} ${T} px-2 py-1 focus:outline-none`}
                    >
                      {[3, 5, 10].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {expPaginadas.map((l) => (
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
                {totalPagExp > 1 && (
                  <div className={`flex items-center justify-between mt-4 pt-3 border-t ${B}`}>
                    <span className={`text-xs ${M}`}>{totalExp} entradas</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExpPagina((p) => Math.max(1, p - 1))}
                        disabled={expPagina === 1}
                        className={`p-1 rounded-lg transition-colors disabled:opacity-30 ${M} hover:text-[#378ADD]`}
                      >
                        <Icon icon="mdi:chevron-left" width={16} />
                      </button>
                      {Array.from({ length: totalPagExp }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          onClick={() => setExpPagina(n)}
                          className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                            expPagina === n
                              ? "bg-[#378ADD] text-white"
                              : `${M} hover:text-[#378ADD]`
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        onClick={() => setExpPagina((p) => Math.min(totalPagExp, p + 1))}
                        disabled={expPagina === totalPagExp}
                        className={`p-1 rounded-lg transition-colors disabled:opacity-30 ${M} hover:text-[#378ADD]`}
                      >
                        <Icon icon="mdi:chevron-right" width={16} />
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })()}

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

      {showInvitarModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowInvitarModal(false)}
        >
          <div
            className={`w-full max-w-md rounded-2xl p-6 shadow-xl ${BG}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-base font-semibold ${T} mb-1`}>Invitar a vacante</h3>
            <p className={`text-sm ${M} mb-4`}>
              Selecciona una vacante para invitar a <strong>{student.nombre_completo}</strong>.
            </p>

            {vacantesEmpresa.length === 0 ? (
              <p className={`text-sm ${M} text-center py-6`}>
                No tienes vacantes activas publicadas.
              </p>
            ) : (
              <div className="flex flex-col gap-2 mb-5 max-h-56 overflow-y-auto">
                {vacantesEmpresa.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVacanteSel(v)}
                    className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                      vacanteSel?.id === v.id
                        ? "border-[#378ADD] bg-[#0F4D8A]/10"
                        : `${B} hover:border-[#378ADD]`
                    }`}
                  >
                    <p className={`text-sm font-medium ${T}`}>{v.titulo}</p>
                    <p className={`text-xs ${M}`}>{[v.area, v.modalidad].filter(Boolean).join(" · ")}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <SecondaryButton onClick={() => setShowInvitarModal(false)}>Cancelar</SecondaryButton>
              <PrimaryButton
                disabled={!vacanteSel || enviandoInvitacion}
                onClick={async () => {
                  setEnviandoInvitacion(true);
                  try {
                    const conv = await iniciarConversacion(id);
                    const texto = `Has sido invitado/a a postular a la vacante "${vacanteSel.titulo}". ¡Revisa la oportunidad y postula desde la plataforma!\n\n[VACANTE_INVITACION:${vacanteSel.id}:${viewer.id}]`;
                    await enviarMensaje(conv.id, texto);
                    setShowInvitarModal(false);
                    navigate("/empresa/mensajeria", { state: { conversacionId: conv.id } });
                  } catch (err) {
                    console.error("Error al enviar invitación:", err);
                  } finally {
                    setEnviandoInvitacion(false);
                  }
                }}
              >
                {enviandoInvitacion && <Icon icon="mdi:loading" width={16} className="animate-spin mr-1" />}
                Enviar invitación
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
