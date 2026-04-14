import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { Badge } from "./ui";
import VerMasModal from "./VerMasModal";
import { getPublicacionesByAutor, eliminarPublicacion } from "../services/api";

const TIPO_BADGE = {
  vacante:    { label: "Práctica",   color: "orange" },
  logro:      { label: "Logro",      color: "yellow" },
  evaluacion: { label: "Evaluación", color: "green"  },
  match:      { label: "Match",      color: "blue"   },
  general:    { label: "General",    color: "blue"   },
};

function tiempoRelativo(fecha) {
  const diff = Math.floor((Date.now() - new Date(fecha)) / 1000);
  if (diff < 60)    return "Ahora mismo";
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

function MiniPostCard({ pub, isDark, onDeleted }) {
  const [verMas, setVerMas] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const T  = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#E8E6E1]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";
  const HV = isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]";

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const canDelete = usuario.rol === "centro" || pub.autor_id === usuario.id;

  const handleEliminar = async () => {
    setEliminando(true);
    try {
      await eliminarPublicacion(pub.id);
      onDeleted?.(pub.id);
    } catch (err) {
      console.error(err);
      setEliminando(false);
      setConfirmarEliminar(false);
    }
  };
  const badge = pub.tipo === "vacante"
    ? { label: pub.vacante_tipo === "puesto_laboral" ? "Puesto laboral" : "Práctica", color: pub.vacante_tipo === "puesto_laboral" ? "green" : "orange" }
    : (TIPO_BADGE[pub.tipo] || { label: pub.tipo, color: "blue" });
  const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001";
  function resolverMedia(url) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${BASE_URL}${url}`;
    return `${BASE_URL}/uploads/${url}`;
  }

  const thumbnail = pub.url_multimedia ? (() => {
    const src = resolverMedia(pub.url_multimedia);
    const esVideo = /\.(mp4|webm|ogg|mov|avi)(\?|$)/i.test(pub.url_multimedia);
    return (
      <div className="relative w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0 bg-black">
        {esVideo ? (
          <>
            <video src={src} className="w-full h-full object-cover" muted />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Icon icon="mdi:play-circle" width={24} className="text-white" />
            </div>
          </>
        ) : (
          <img src={src} alt="" className="w-full h-full object-cover" />
        )}
      </div>
    );
  })() : null;

  return (
    <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <p className={`text-xs ${M}`}>{tiempoRelativo(pub.publicado_en)}</p>
        <div className="flex items-center gap-2">
          <Badge color={badge.color}>{badge.label}</Badge>
          {canDelete && (
            <div className="relative">
              <button
                onClick={() => { setMenuAbierto((v) => !v); setConfirmarEliminar(false); }}
                className={`p-1 rounded-lg transition-colors ${HV} ${M}`}
              >
                <Icon icon="mdi:dots-vertical" width={15} />
              </button>
              {menuAbierto && (
                <div className={`absolute right-0 top-full mt-1 z-20 rounded-xl border shadow-lg min-w-[160px] ${BG} ${B}`}>
                  {!confirmarEliminar ? (
                    <button
                      onClick={() => setConfirmarEliminar(true)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <Icon icon="mdi:trash-can-outline" width={14} />
                      Eliminar publicación
                    </button>
                  ) : (
                    <div className="px-4 py-3">
                      <p className={`text-xs ${T} font-medium mb-1`}>¿Eliminar publicación?</p>
                      <p className={`text-xs ${M} mb-3`}>Esta acción no se puede deshacer.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setConfirmarEliminar(false); setMenuAbierto(false); }}
                          className={`flex-1 text-xs py-1.5 rounded-lg border ${B} ${T} hover:bg-black/5 transition-colors`}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleEliminar}
                          disabled={eliminando}
                          className="flex-1 text-xs py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60"
                        >
                          {eliminando ? "..." : "Eliminar"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 px-5 pb-4">
        <div className="flex-1 min-w-0">
          {pub.titulo && pub.titulo !== "Actualización de estado" && (
            <p className={`text-sm font-semibold ${T} mb-1`}>{pub.titulo}</p>
          )}
          {pub.contenido && (
            <p className={`text-sm leading-relaxed ${T} line-clamp-3`}>{pub.contenido}</p>
          )}
        </div>
        {thumbnail}
      </div>

      <div className={`border-t ${B}`} />
      <button
        onClick={() => setVerMas(true)}
        className={`w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${HV} ${M}`}
      >
        <Icon icon="mdi:comment-outline" width={14} />
        Ver más · comentarios
      </button>

      {verMas && <VerMasModal pub={pub} onClose={() => setVerMas(false)} />}
    </div>
  );
}

export default function PublicacionesUsuario({ usuarioId }) {
  const { isDark } = useDark();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuarioId) return;
    getPublicacionesByAutor(usuarioId)
      .then(setPublicaciones)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [usuarioId]);

  if (loading) return (
    <div className={`flex items-center gap-2 py-6 justify-center ${M} text-sm`}>
      <Icon icon="mdi:loading" width={18} className="animate-spin" />
      Cargando publicaciones...
    </div>
  );

  return (
    <div className={`mt-6 border-t ${B} pt-6`}>
      <h3 className={`text-sm font-semibold ${T} mb-4`}>Publicaciones</h3>

      {publicaciones.length === 0 ? (
        <div className={`text-center py-8 ${M}`}>
          <Icon icon="mdi:newspaper-variant-outline" width={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-xs">Aún no hay publicaciones.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {publicaciones.map((pub) => (
            <MiniPostCard
              key={pub.id}
              pub={pub}
              isDark={isDark}
              onDeleted={(id) => setPublicaciones((prev) => prev.filter((p) => p.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
