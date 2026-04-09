import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { getPostulantesPorVacante, actualizarEstadoPostulacion, iniciarConversacion } from "../services/api";

const estadoConfig = {
  pendiente:  { label: "Pendiente",  color: "bg-blue-100 text-blue-700"   },
  aceptado:   { label: "Aceptado",   color: "bg-green-100 text-green-700" },
  rechazado:  { label: "Rechazado",  color: "bg-red-100 text-red-700"     },
};

function tiempoRelativo(fecha) {
  const diff = Math.floor((Date.now() - new Date(fecha)) / 1000);
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

export default function PostulantesVacanteModal({ vacante, onClose }) {
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
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {counts.pendiente} pendiente{counts.pendiente > 1 ? "s" : ""}
                </span>
              )}
              {counts.aceptado > 0 && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {counts.aceptado} aceptado{counts.aceptado > 1 ? "s" : ""}
                </span>
              )}
              {counts.rechazado > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {counts.rechazado} rechazado{counts.rechazado > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${HV} transition-colors ${M} flex-shrink-0`}
          >
            <Icon icon="mdi:close" width={18} />
          </button>
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
              {postulantes.map((p) => {
                const cfg = estadoConfig[p.estado] || estadoConfig.pendiente;
                const actualizando = actualizandoId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${B} ${isDark ? "bg-[#262624]" : "bg-white"}`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#185FA5] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {p.nombre_completo?.charAt(0).toUpperCase() || "?"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium ${T} truncate`}>{p.nombre_completo}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cfg.color}`}>
                          {cfg.label}
                        </span>
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
                      {/* Cambiar estado */}
                      {actualizando ? (
                        <Icon icon="mdi:loading" width={18} className={`animate-spin ${M}`} />
                      ) : p.estado === "pendiente" ? (
                        <>
                          <button
                            onClick={() => handleEstado(p.id, "aceptado")}
                            title="Aceptar"
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors font-medium"
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleEstado(p.id, "rechazado")}
                            title="Rechazar"
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors font-medium"
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
