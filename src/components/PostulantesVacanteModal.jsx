import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { getPostulantesPorVacante, actualizarEstadoPostulacion, iniciarConversacion, getResumenIA, getRankingIA, getMediaUrl } from "../services/api";

function estadoConfig(isDark) {
  return {
    pendiente:  { label: "Pendiente",  color: isDark ? "bg-blue-500/15 text-blue-400"  : "bg-blue-100 text-blue-700"   },
    aceptado:   { label: "Aceptado",   color: isDark ? "bg-green-500/15 text-green-400": "bg-green-100 text-green-700" },
    rechazado:  { label: "Rechazado",  color: isDark ? "bg-red-500/15 text-red-400"    : "bg-red-100 text-red-700"     },
  };
}

function tiempoRelativo(fecha) {
  const diff = Math.floor((Date.now() - new Date(fecha)) / 1000);
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

export default function PostulantesVacanteModal({ vacante, onClose, onEstadoCambiado }) {
  const { isDark } = useDark();
  const navigate = useNavigate();

  const T  = isDark ? "text-[#D3D1C7]"   : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]"   : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#E8E6E1]";
  const BG = isDark ? "bg-[#1e1e1c]"     : "bg-white";
  const S  = isDark ? "bg-[#262624]"     : "bg-[#F7F6F3]";
  const HV = isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]";

  const [postulantes, setPostulantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactandoId, setContactandoId] = useState(null);
  const [actualizandoId, setActualizandoId] = useState(null);
  const [resumenes, setResumenes] = useState({});      // { estudiante_id: { texto, cargando, abierto } }
  const [rankingCargando, setRankingCargando] = useState(false);
  const [rankingActivo, setRankingActivo] = useState(false);
  const [compatibilidades, setCompatibilidades] = useState({}); // { estudiante_id: "Alta"|"Media"|"Baja" }

  const PUNTAJE = { Alta: 3, Media: 2, Baja: 1 };

  const handleRanking = async () => {
    if (rankingActivo) { setRankingActivo(false); return; }
    setRankingCargando(true);
    try {
      const { ranking } = await getRankingIA(vacante.id);
      const nuevos = Object.fromEntries(ranking.map(r => [r.estudiante_id, r.compatibilidad]));
      setCompatibilidades(nuevos);
      setRankingActivo(true);
    } catch (err) {
      console.error("Error ranking IA:", err);
    } finally {
      setRankingCargando(false);
    }
  };

  const postulantesOrdenados = rankingActivo
    ? [...postulantes].sort((a, b) =>
        (PUNTAJE[compatibilidades[b.estudiante_id]] || 0) -
        (PUNTAJE[compatibilidades[a.estudiante_id]] || 0)
      )
    : postulantes;


  useEffect(() => {
    getPostulantesPorVacante(vacante.id)
      .then(setPostulantes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [vacante.id]);

  const handleEstado = async (postulacionId, nuevoEstado) => {
    setActualizandoId(postulacionId);
    try {
      await actualizarEstadoPostulacion(postulacionId, nuevoEstado);
      setPostulantes((prev) =>
        prev.map((p) => (p.id === postulacionId ? { ...p, estado: nuevoEstado } : p))
      );
      onEstadoCambiado?.();
    } catch (err) {
      console.error(err);
    } finally {
      setActualizandoId(null);
    }
  };

  const handleContactar = async (estudianteId) => {
    setContactandoId(estudianteId);
    try {
      const conv = await iniciarConversacion(estudianteId);
      navigate("/empresa/mensajeria", { state: { conversacionId: conv.id } });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setContactandoId(null);
    }
  };

  const toggleResumen = async (estudianteId) => {
    const actual = resumenes[estudianteId];

    // Si ya tiene texto y está abierto, solo cerrar
    if (actual?.texto && actual.abierto) {
      setResumenes(prev => ({ ...prev, [estudianteId]: { ...prev[estudianteId], abierto: false } }));
      return;
    }
    // Si ya tiene texto y está cerrado, solo abrir
    if (actual?.texto && !actual.abierto) {
      setResumenes(prev => ({ ...prev, [estudianteId]: { ...prev[estudianteId], abierto: true } }));
      return;
    }

    // Generar por primera vez
    setResumenes(prev => ({ ...prev, [estudianteId]: { texto: null, cargando: true, abierto: true } }));
    try {
      const { resumen } = await getResumenIA(estudianteId, vacante.id);
      setResumenes(prev => ({ ...prev, [estudianteId]: { texto: resumen, cargando: false, abierto: true } }));
    } catch (err) {
      setResumenes(prev => ({ ...prev, [estudianteId]: { texto: `Error: ${err.message}`, cargando: false, abierto: true } }));
    }
  };

  const counts = postulantes.reduce(
    (acc, p) => { acc[p.estado] = (acc[p.estado] || 0) + 1; return acc; },
    {}
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl shadow-2xl border ${B} ${BG}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-start justify-between px-5 py-4 border-b ${B}`}>
          <div>
            <p className={`text-sm font-semibold ${T}`}>{vacante.titulo}</p>
            <p className={`text-xs ${M} mt-0.5`}>
              {vacante.area && `${vacante.area} · `}
              {vacante.modalidad || "presencial"}
              {vacante.tipo === "puesto_laboral" ? " · Puesto laboral" : " · Práctica"}
            </p>
            <div className="flex gap-3 mt-2">
              <span className={`text-xs ${M}`}>
                <span className="font-semibold text-[#378ADD]">{postulantes.length}</span> postulantes
              </span>
              {counts.pendiente > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-blue-500/15 text-blue-400" : "bg-blue-100 text-blue-700"}`}>
                  {counts.pendiente} pendiente{counts.pendiente > 1 ? "s" : ""}
                </span>
              )}
              {counts.aceptado > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-green-500/15 text-green-400" : "bg-green-100 text-green-700"}`}>
                  {counts.aceptado} aceptado{counts.aceptado > 1 ? "s" : ""}
                </span>
              )}
              {counts.rechazado > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-red-500/15 text-red-400" : "bg-red-100 text-red-700"}`}>
                  {counts.rechazado} rechazado{counts.rechazado > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {postulantes.length > 0 && (
              <button
                onClick={handleRanking}
                disabled={rankingCargando}
                title="Ordenar postulantes por compatibilidad con la vacante usando IA"
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                  rankingActivo
                    ? "bg-purple-500 text-white"
                    : isDark
                    ? "bg-purple-500/15 text-purple-400 hover:bg-purple-500/25"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                }`}
              >
                <Icon
                  icon={rankingCargando ? "mdi:loading" : "mdi:trophy-outline"}
                  width={14}
                  className={rankingCargando ? "animate-spin" : ""}
                />
                {rankingCargando ? "Analizando..." : rankingActivo ? "Ranking activo" : "Ranking IA"}
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg ${HV} transition-colors ${M}`}
            >
              <Icon icon="mdi:close" width={18} />
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {loading ? (
            <div className={`flex items-center justify-center py-16 ${M}`}>
              <Icon icon="mdi:loading" width={24} className="animate-spin mr-2" />
              Cargando postulantes...
            </div>
          ) : postulantes.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-16 gap-2 ${M}`}>
              <Icon icon="mdi:account-off-outline" width={36} />
              <p className="text-sm">Nadie ha postulado a esta vacante aún.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {postulantesOrdenados.map((p, idx) => {
                const cfg = estadoConfig(isDark)[p.estado] || estadoConfig(isDark).pendiente;
                const actualizando = actualizandoId === p.id;
                const compat = rankingActivo ? compatibilidades[p.estudiante_id] : null;
                const compatColor = compat === "Alta"
                  ? isDark ? "bg-green-500/15 text-green-400" : "bg-green-100 text-green-700"
                  : compat === "Media"
                  ? isDark ? "bg-yellow-500/15 text-yellow-400" : "bg-yellow-100 text-yellow-700"
                  : compat === "Baja"
                  ? isDark ? "bg-red-500/15 text-red-400" : "bg-red-100 text-red-700"
                  : "";
                const medallaIcon = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border ${B} ${isDark ? "bg-[#262624]" : "bg-white"} overflow-hidden`}
                  >
                    <div className="flex items-center gap-3 p-3">
                      {/* Avatar */}
                      {p.foto_perfil ? (
                        <img src={getMediaUrl(p.foto_perfil)} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#0F4D8A] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {p.nombre_completo?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {rankingActivo && (
                            <span className="text-sm font-bold text-purple-500 flex-shrink-0">{medallaIcon}</span>
                          )}
                          <p className={`text-sm font-medium ${T} truncate`}>{p.nombre_completo}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          {compat && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${compatColor}`}>
                              {compat}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${M}`}>
                          {p.carrera}
                          {p.promedio ? ` · Nota: ${parseFloat(p.promedio).toFixed(1)}` : ""}
                          {p.calificacion_docente ? ` · Eval: ${parseFloat(p.calificacion_docente).toFixed(1)}` : ""}
                        </p>
                        <p className={`text-xs ${M}`}>{tiempoRelativo(p.fecha_creacion)}</p>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Botón resumen IA */}
                        <button
                          onClick={() => toggleResumen(p.estudiante_id)}
                          title="Resumen IA"
                          className={`p-2 rounded-lg ${HV} transition-colors ${
                            resumenes[p.estudiante_id]?.abierto
                              ? "text-purple-500"
                              : `${M} hover:text-purple-500`
                          }`}
                        >
                          {resumenes[p.estudiante_id]?.cargando
                            ? <Icon icon="mdi:loading" width={18} className="animate-spin" />
                            : <Icon icon="mdi:robot-excited-outline" width={18} />}
                        </button>

                        {/* Cambiar estado */}
                        {actualizando ? (
                          <Icon icon="mdi:loading" width={18} className={`animate-spin ${M}`} />
                        ) : p.estado === "pendiente" ? (
                          <>
                            <button
                              onClick={() => handleEstado(p.id, "aceptado")}
                              title="Aceptar"
                              className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors font-medium ${isDark ? "bg-green-500/15 text-green-400 hover:bg-green-500/25" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={() => handleEstado(p.id, "rechazado")}
                              title="Rechazar"
                              className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors font-medium ${isDark ? "bg-red-500/15 text-red-400 hover:bg-red-500/25" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                            >
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEstado(p.id, "pendiente")}
                            title="Volver a pendiente"
                            className={`text-xs px-2.5 py-1.5 rounded-lg border ${B} ${M} hover:border-[#378ADD] hover:text-[#378ADD] transition-colors`}
                          >
                            Pendiente
                          </button>
                        )}

                        {/* Mensaje */}
                        <button
                          onClick={() => handleContactar(p.estudiante_id)}
                          disabled={contactandoId === p.estudiante_id}
                          title="Enviar mensaje"
                          className={`p-2 rounded-lg ${HV} transition-colors ${M} hover:text-[#378ADD] disabled:opacity-40`}
                        >
                          <Icon
                            icon={contactandoId === p.estudiante_id ? "mdi:loading" : "mdi:message-outline"}
                            width={18}
                            className={contactandoId === p.estudiante_id ? "animate-spin" : ""}
                          />
                        </button>

                        {/* Ver perfil */}
                        <Link
                          to={`/empresa/candidato/${p.estudiante_id}`}
                          title="Ver perfil"
                          className={`p-2 rounded-lg ${HV} transition-colors ${M} hover:text-[#378ADD]`}
                          onClick={onClose}
                        >
                          <Icon icon="mdi:account-outline" width={18} />
                        </Link>
                      </div>
                    </div>

                    {/* Panel resumen IA */}
                    {resumenes[p.estudiante_id]?.abierto && (
                      <div className={`px-4 pb-4 pt-1 border-t ${B} ${isDark ? "bg-[#1e1e1c]" : "bg-[#F7F6F3]"}`}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Icon icon="mdi:robot-excited-outline" width={14} className="text-purple-500" />
                          <span className="text-xs font-semibold text-purple-500">Resumen IA</span>
                        </div>
                        {resumenes[p.estudiante_id]?.cargando ? (
                          <div className={`flex items-center gap-2 text-xs ${M}`}>
                            <Icon icon="mdi:loading" width={14} className="animate-spin" />
                            Analizando perfil...
                          </div>
                        ) : (
                          <p className={`text-xs ${M} leading-relaxed whitespace-pre-line`}>
                            {resumenes[p.estudiante_id]?.texto}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
