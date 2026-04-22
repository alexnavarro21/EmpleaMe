import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useDark } from "../../context/DarkModeContext";
import { PageHeader } from "../../components/ui";
import { getReportes, actualizarReporte, eliminarContenidoReporte } from "../../services/api";
import { MOTIVO_LABEL } from "../../utils/reportes";

const TIPO_LABEL = {
  publicacion: "Publicación",
  comentario:  "Comentario",
  perfil:      "Perfil",
};

const ESTADO_CFG = {
  pendiente:  { label: "Pendiente",  color: "text-amber-500", bg: "bg-amber-500/10" },
  resuelto:   { label: "Resuelto",   color: "text-green-500", bg: "bg-green-500/10" },
  descartado: { label: "Descartado", color: "text-[#888780]", bg: "bg-[#888780]/10" },
};

function tiempoRelativo(fecha) {
  const diff = Math.floor((Date.now() - new Date(fecha)) / 1000);
  if (diff < 60)    return "Ahora";
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} día(s)`;
}

function perfilLink(r) {
  if (r.tipo !== "perfil") return null;
  if (r.referencia_rol === "empresa") return `/buscar?empresa=${r.referencia_id}`;
  return `/buscar?estudiante=${r.referencia_id}`;
}

export default function AdminReportes() {
  const { isDark } = useDark();
  const T  = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";
  const S  = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";
  const PV = isDark ? "bg-[#1e1e1c] border-[#3a3a38]" : "bg-[#F7F6F3] border-[#E8E6E1]";

  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("pendiente");
  const [actualizando, setActualizando] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  const cargar = (estado) => {
    setLoading(true);
    getReportes(estado)
      .then(setReportes)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(filtroEstado); }, [filtroEstado]);

  const handleAccion = async (id, estado) => {
    setActualizando(id);
    try {
      await actualizarReporte(id, estado);
      setReportes((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setActualizando(null);
    }
  };

  const handleEliminarYResolver = async (id, tipo) => {
    const labelTipo = tipo === "publicacion" ? "publicación" : "comentario";
    if (!window.confirm(`¿Eliminar esta ${labelTipo} y marcar el reporte como resuelto?`)) return;
    setEliminando(id);
    try {
      await eliminarContenidoReporte(id);
      setReportes((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Reportes de contenido"
        subtitle="Revisa y gestiona el contenido reportado por los usuarios"
      />

      {/* Tabs de estado */}
      <div className={`flex gap-1 mb-5 p-1 rounded-xl w-fit border ${B} ${BG}`}>
        {["pendiente", "resuelto", "descartado"].map((e) => (
          <button
            key={e}
            onClick={() => setFiltroEstado(e)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${
              filtroEstado === e
                ? "bg-[#0F4D8A] text-white"
                : `${M} hover:bg-[#0F4D8A]/10`
            }`}
          >
            {ESTADO_CFG[e].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={`flex items-center justify-center py-24 ${M}`}>
          <Icon icon="mdi:loading" width={28} className="animate-spin mr-2" />
          Cargando reportes...
        </div>
      ) : reportes.length === 0 ? (
        <div className={`rounded-xl border ${B} ${BG} p-16 text-center`}>
          <Icon icon="mdi:flag-off-outline" width={44} className={`mx-auto mb-3 ${M}`} />
          <p className={`text-sm font-medium ${T}`}>No hay reportes {ESTADO_CFG[filtroEstado]?.label.toLowerCase()}</p>
        </div>
      ) : (
        <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
          {reportes.map((r, i) => {
            const cfg = ESTADO_CFG[r.estado] || ESTADO_CFG.pendiente;
            const enlacePerfil = perfilLink(r);
            return (
              <div
                key={r.id}
                className={`px-5 py-4 flex items-start gap-4 ${i < reportes.length - 1 ? `border-b ${B}` : ""}`}
              >
                {/* Icono tipo */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                  <Icon
                    icon={r.tipo === "publicacion" ? "mdi:file-document-outline" : r.tipo === "comentario" ? "mdi:comment-outline" : "mdi:account-outline"}
                    width={18}
                    className="text-[#378ADD]"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${S} ${M}`}>
                      {TIPO_LABEL[r.tipo] || r.tipo}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${S} ${M}`}>
                      {MOTIVO_LABEL[r.motivo] || r.motivo}
                    </span>
                  </div>

                  <p className={`text-sm font-medium ${T}`}>
                    Reportado por: {r.reportado_por_nombre}
                  </p>
                  {r.descripcion && (
                    <p className={`text-xs ${M} mt-0.5`}>"{r.descripcion}"</p>
                  )}

                  {/* Vista previa del contenido reportado */}
                  {r.contenido_preview && (
                    <div className={`mt-2 px-3 py-2 rounded-lg border text-xs ${PV} ${T} line-clamp-3`}>
                      {r.tipo === "perfil" ? (
                        <span className={M}>
                          <Icon icon="mdi:account-outline" width={12} className="inline mr-1" />
                          Perfil: <strong className={T}>{r.contenido_preview}</strong>
                          {enlacePerfil && (
                            <Link to={enlacePerfil} className="ml-2 text-[#378ADD] hover:underline">
                              Ver perfil →
                            </Link>
                          )}
                        </span>
                      ) : (
                        <span>"{r.contenido_preview}"</span>
                      )}
                    </div>
                  )}

                  <p className={`text-xs ${M} mt-1.5`}>
                    {tiempoRelativo(r.creado_en)}
                  </p>
                </div>

                {/* Acciones */}
                {r.estado === "pendiente" && (
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {r.tipo !== "perfil" && (
                      <button
                        onClick={() => handleEliminarYResolver(r.id, r.tipo)}
                        disabled={eliminando === r.id || actualizando === r.id}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          isDark ? "bg-red-500/15 text-red-400 hover:bg-red-500/25" : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {eliminando === r.id
                          ? <Icon icon="mdi:loading" width={14} className="animate-spin" />
                          : "Eliminar y resolver"}
                      </button>
                    )}
                    <button
                      onClick={() => handleAccion(r.id, "resuelto")}
                      disabled={actualizando === r.id || eliminando === r.id}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                        isDark ? "bg-green-500/15 text-green-400 hover:bg-green-500/25" : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {actualizando === r.id ? <Icon icon="mdi:loading" width={14} className="animate-spin" /> : "Conservar y resolver"}
                    </button>
                    <button
                      onClick={() => handleAccion(r.id, "descartado")}
                      disabled={actualizando === r.id || eliminando === r.id}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                        isDark ? "bg-[#3a3a38] text-[#888780] hover:bg-[#444442]" : "bg-[#F0F0EE] text-[#5F5E5A] hover:bg-[#E0DFDC]"
                      }`}
                    >
                      Descartar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
