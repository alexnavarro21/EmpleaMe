import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { getComentarios, crearComentario, iniciarConversacionConEmpresa, postularAVacante } from "../services/api";

function TIPO_BADGE(isDark) {
  return {
    logro:      { label: "Logro",      color: isDark ? "bg-yellow-500/15 text-yellow-400" : "bg-yellow-100 text-yellow-700" },
    evaluacion: { label: "Evaluación", color: isDark ? "bg-green-500/15 text-green-400"  : "bg-green-100 text-green-700"   },
    match:      { label: "Match",      color: isDark ? "bg-blue-500/15 text-blue-400"    : "bg-blue-100 text-blue-700"     },
    general:    { label: "General",    color: isDark ? "bg-blue-500/15 text-blue-400"    : "bg-blue-100 text-blue-700"     },
  };
}

function badgeVacante(vacante_tipo, isDark) {
  return vacante_tipo === "puesto_laboral"
    ? { label: "Puesto laboral", color: isDark ? "bg-green-500/15 text-green-400"  : "bg-green-100 text-green-700"  }
    : { label: "Práctica",       color: isDark ? "bg-orange-500/15 text-orange-400": "bg-orange-100 text-orange-700" };
}

function tiempoRelativo(fecha) {
  const diff = Math.floor((Date.now() - new Date(fecha)) / 1000);
  if (diff < 60)    return "Ahora mismo";
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

export default function VerMasModal({ pub, onClose }) {
  const { isDark } = useDark();
  const navigate = useNavigate();
  const [comentarios, setComentarios] = useState([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [contactando, setContactando] = useState(false);
  const [estadoPostula, setEstadoPostula] = useState("idle"); // idle | loading | ok | duplicado | error
  const inputRef = useRef(null);

  const T  = isDark ? "text-[#D3D1C7]"  : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]"  : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]": "border-[#E8E6E1]";
  const BG = isDark ? "bg-[#1e1e1c]"    : "bg-white";
  const S  = isDark ? "bg-[#262624]"    : "bg-[#F7F6F3]";

  const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001";
  function resolverMedia(url) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${BASE_URL}${url}`;
    return `${BASE_URL}/uploads/${url}`;
  }
  const badge = pub.tipo === "vacante"
    ? badgeVacante(pub.vacante_tipo, isDark)
    : (TIPO_BADGE(isDark)[pub.tipo] || { label: pub.tipo, color: isDark ? "bg-blue-500/15 text-blue-400" : "bg-blue-100 text-blue-700" });
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    getComentarios(pub.id).then(setComentarios).catch(console.error);
  }, [pub.id]);

  const handleEnviarComentario = async () => {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      await crearComentario(pub.id, texto.trim());
      setTexto("");
      const nuevos = await getComentarios(pub.id);
      setComentarios(nuevos);
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  const handlePostular = async () => {
    if (!pub.vacante_id || estadoPostula !== "idle") return;
    setEstadoPostula("loading");
    try {
      await postularAVacante(pub.vacante_id);
      setEstadoPostula("ok");
    } catch (err) {
      setEstadoPostula(err.message?.toLowerCase().includes("ya") ? "duplicado" : "error");
    }
  };

  const handleContactarEmpresa = async () => {
    if (!pub.vacante_id) return;
    setContactando(true);
    try {
      const { id } = await iniciarConversacionConEmpresa(pub.autor_id || pub.empresa_id);
      navigate(`/estudiante/mensajeria?conv=${id}`);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setContactando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border ${B} ${BG}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${B}`}>
          <div className="flex items-center gap-3">
            {pub.autor_foto_perfil ? (
              <img src={resolverMedia(pub.autor_foto_perfil)} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#0F4D8A] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {pub.autor_nombre?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div>
              <p className={`text-sm font-semibold ${T}`}>{pub.autor_nombre}</p>
              <p className={`text-xs ${M}`}>{tiempoRelativo(pub.publicado_en)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.color}`}>{badge.label}</span>
            <button onClick={onClose} className={`p-1.5 rounded-lg hover:${S} transition-colors ${M}`}>
              <Icon icon="mdi:close" width={18} />
            </button>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {/* Título y contenido */}
          {pub.titulo && pub.titulo !== "Actualización de estado" && (
            <p className={`text-base font-semibold ${T} mb-2`}>{pub.titulo}</p>
          )}
          {pub.contenido && (
            <p className={`text-sm leading-relaxed ${T} mb-4`}>{pub.contenido}</p>
          )}

          {/* Datos de vacante */}
          {pub.tipo === "vacante" && (
            <div className={`p-3 rounded-lg border ${B} ${S} mb-4`}>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5">
                  <Icon
                    icon={pub.vacante_tipo === "puesto_laboral" ? "mdi:briefcase-outline" : "mdi:school-outline"}
                    width={14}
                    className={pub.vacante_tipo === "puesto_laboral" ? "text-green-600" : "text-orange-500"}
                  />
                  <span className={`text-xs font-medium ${pub.vacante_tipo === "puesto_laboral" ? "text-green-700" : "text-orange-600"}`}>
                    {pub.vacante_tipo === "puesto_laboral" ? "Puesto laboral" : "Práctica profesional"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon
                    icon={pub.vacante_activa ? "mdi:check-circle-outline" : "mdi:close-circle-outline"}
                    width={14}
                    className={pub.vacante_activa ? "text-green-500" : "text-red-400"}
                  />
                  <span className={`text-xs font-medium ${pub.vacante_activa ? "text-green-600" : "text-red-500"}`}>
                    {pub.vacante_activa ? "Activa" : "Cerrada"}
                  </span>
                </div>
                {pub.area && <div className="flex items-center gap-1.5"><Icon icon="mdi:tag-outline" width={14} className="text-[#378ADD]" /><span className={`text-xs ${T}`}>{pub.area}</span></div>}
                {pub.modalidad && <div className="flex items-center gap-1.5"><Icon icon="mdi:map-marker-outline" width={14} className={M} /><span className={`text-xs ${M} capitalize`}>{pub.modalidad}</span></div>}
                {pub.duracion && <div className="flex items-center gap-1.5"><Icon icon="mdi:clock-outline" width={14} className={M} /><span className={`text-xs ${M}`}>{pub.duracion}</span></div>}
                {pub.remuneracion && <div className="flex items-center gap-1.5"><Icon icon="mdi:currency-usd" width={14} className="text-green-500" /><span className={`text-xs ${M}`}>{pub.remuneracion}</span></div>}
                {pub.direccion && <div className="flex items-center gap-1.5"><Icon icon="mdi:office-building-outline" width={14} className={M} /><span className={`text-xs ${M}`}>{pub.direccion}</span></div>}
              </div>
            </div>
          )}

          {/* Imagen / Video */}
          {pub.url_multimedia && (() => {
            const src = resolverMedia(pub.url_multimedia);
            const esVideo = /\.(mp4|webm|ogg|mov|avi)(\?|$)/i.test(pub.url_multimedia);
            return esVideo ? (
              <video
                src={src}
                controls
                className="rounded-xl w-full mb-4"
                style={{ maxHeight: "70vh", background: "transparent" }}
                onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
              />
            ) : (
              <img
                src={src}
                alt="Multimedia"
                className="rounded-xl w-full object-contain max-h-[70vh] mb-4 border"
                onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
              />
            );
          })()}

          {/* Acciones de vacante para estudiante */}
          {pub.tipo === "vacante" && usuario.rol === "estudiante" && (
            <div className="flex gap-3 mb-5">
              <button
                onClick={handlePostular}
                disabled={estadoPostula !== "idle" || !pub.vacante_activa}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  estadoPostula === "ok"
                    ? isDark ? "bg-green-500/15 text-green-400 cursor-default" : "bg-green-100 text-green-700 cursor-default"
                    : estadoPostula === "duplicado"
                    ? isDark ? "bg-amber-500/15 text-amber-400 cursor-default" : "bg-amber-100 text-amber-700 cursor-default"
                    : estadoPostula === "error"
                    ? isDark ? "bg-red-500/15 text-red-400" : "bg-red-100 text-red-700"
                    : "bg-[#0F4D8A] hover:bg-[#0A3A6A] text-white"
                }`}
              >
                <Icon
                  icon={
                    estadoPostula === "ok"        ? "mdi:check-circle-outline" :
                    estadoPostula === "duplicado" ? "mdi:information-outline"  :
                    estadoPostula === "error"     ? "mdi:alert-circle-outline" :
                    estadoPostula === "loading"   ? "mdi:loading"              : "mdi:send-outline"
                  }
                  width={18}
                  className={estadoPostula === "loading" ? "animate-spin" : ""}
                />
                {estadoPostula === "ok"        ? "Postulación enviada" :
                 estadoPostula === "duplicado" ? "Ya postulaste"       :
                 estadoPostula === "error"     ? "Error, reintentar"   :
                 estadoPostula === "loading"   ? "Enviando..."         :
                 !pub.vacante_activa           ? "Vacante cerrada"     : "Postular"}
              </button>
              <button
                onClick={handleContactarEmpresa}
                disabled={contactando}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${B} ${M} hover:border-[#378ADD] hover:text-[#378ADD]`}
              >
                <Icon icon="mdi:message-outline" width={18} />
                {contactando ? "Abriendo chat..." : "Contactar empresa"}
              </button>
            </div>
          )}

          {/* Comentarios */}
          <div className={`border-t ${B} pt-4`}>
            <p className={`text-xs font-semibold ${T} mb-3`}>
              Comentarios {comentarios.length > 0 && `(${comentarios.length})`}
            </p>

            {comentarios.length === 0 ? (
              <p className={`text-xs ${M} mb-4`}>Sé el primero en comentar.</p>
            ) : (
              <div className="flex flex-col gap-3 mb-4">
                {comentarios.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    {c.autor_foto_perfil ? (
                      <img src={resolverMedia(c.autor_foto_perfil)} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#0F4D8A] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {c.autor_nombre?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                    <div className={`flex-1 px-3 py-2 rounded-xl ${S}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-semibold ${T}`}>{c.autor_nombre}</span>
                        <span className={`text-xs ${M}`}>{tiempoRelativo(c.creado_en)}</span>
                      </div>
                      <p className={`text-sm ${T}`}>{c.contenido}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input comentario */}
        <div className={`px-5 py-3 border-t ${B} flex gap-2`}>
          <input
            ref={inputRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleEnviarComentario()}
            placeholder="Escribe un comentario..."
            className={`flex-1 text-sm px-3 py-2 rounded-xl border ${B} outline-none focus:border-[#378ADD] transition-colors ${isDark ? "bg-[#262624] text-[#D3D1C7] placeholder-[#5F5E5A]" : "bg-[#F7F6F3] text-[#2C2C2A] placeholder-[#888780]"}`}
          />
          <button
            onClick={handleEnviarComentario}
            disabled={!texto.trim() || enviando}
            className="px-4 py-2 rounded-xl bg-[#0F4D8A] hover:bg-[#0A3A6A] disabled:opacity-40 text-white text-sm font-medium transition-colors"
          >
            <Icon icon="mdi:send" width={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
