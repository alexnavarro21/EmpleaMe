import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Badge } from "../../components/ui";
import { getEstudianteById, getPublicaciones, postularAVacante, getEmpresaById, getVacantesEmpresa, getPostulantesEmpresa, getConversaciones, getPostulacionesEstudiante, toggleLike, getTalleres, getAdminStats, inscribirseEnTaller, eliminarPublicacion } from "../../services/api";
import { calcularCompletitud } from "../../utils/perfilCompletitud";
import CrearPublicacion from "../../components/CrearPublicacion";
import VerMasModal from "../../components/VerMasModal";

const AVATAR_COLORS = ["bg-[#0F4D8A]", "bg-red-500", "bg-green-600", "bg-purple-600", "bg-amber-500"];

const BASE_URL_GLOBAL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001";
function resolverMedia(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${BASE_URL_GLOBAL}${url}`;
  return `${BASE_URL_GLOBAL}/uploads/${url}`;
}

function Avatar({ initial, color, size = "md", foto }) {
  const s = size === "lg" ? "w-14 h-14 text-xl" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  const resolvedFoto = foto ? resolverMedia(foto) : null;
  if (resolvedFoto) {
    return <img src={resolvedFoto} className={`${s} rounded-full object-cover flex-shrink-0 border-2 border-white`} alt="" />;
  }
  return (
    <div className={`${s} rounded-full ${color} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initial}
    </div>
  );
}

function PostCard({ post, isDark }) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [saved, setSaved] = useState(false);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#E8E6E1]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";
  const HV = isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]";

  function toggleLike() {
    if (liked) {
      setLikes((l) => l - 1);
    } else {
      setLikes((l) => l + 1);
    }
    setLiked((l) => !l);
  }

  return (
    <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar initial={post.companyInitial} color={post.companyColor} />
          <div>
            <p className={`text-sm font-semibold leading-tight ${T}`}>{post.company}</p>
            <p className={`text-xs ${M}`}>{post.role}</p>
            <p className={`text-xs ${M}`}>{post.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={post.badge.color}>{post.badge.label}</Badge>
          <button
            onClick={() => setSaved((s) => !s)}
            className={`p-1.5 rounded-lg transition-colors ${HV}`}
            title={saved ? "Guardado" : "Guardar"}
          >
            <Icon
              icon={saved ? "mdi:bookmark" : "mdi:bookmark-outline"}
              width={16}
              className={saved ? "text-[#378ADD]" : M}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className={`text-sm leading-relaxed ${T}`}>{post.content}</p>
      </div>

      {/* Match / Nota / Tags */}
      {(post.match || post.nota || post.tags || post.location) && (
        <div className={`mx-4 mb-3 p-3 rounded-lg border ${B} ${isDark ? "bg-[#1e1e1c]" : "bg-[#F7F6F3]"}`}>
          <div className="flex flex-wrap gap-3 items-center">
            {post.match && (
              <div className="flex items-center gap-1.5">
                <Icon icon="mdi:target" width={14} className="text-[#378ADD]" />
                <span className="text-xs font-semibold text-[#378ADD]">{post.match}% compatibilidad</span>
              </div>
            )}
            {post.nota && (
              <div className="flex items-center gap-1.5">
                <Icon icon="mdi:star" width={14} className="text-amber-500" />
                <span className={`text-xs font-semibold ${T}`}>{post.nota}</span>
              </div>
            )}
            {post.location && (
              <div className="flex items-center gap-1.5">
                <Icon icon="mdi:map-marker-outline" width={14} className={M} />
                <span className={`text-xs ${M}`}>{post.location}</span>
              </div>
            )}
            {post.area && (
              <Badge color="blue">{post.area}</Badge>
            )}
          </div>
          {post.tags && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.tags.map((tag) => (
                <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border ${B} ${M}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Divider + Actions */}
      <div className={`border-t ${B}`} />
      <div className="flex items-center px-2 py-1">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex-1 justify-center ${HV} ${
            liked ? "text-[#378ADD]" : M
          }`}
        >
          <Icon icon={liked ? "mdi:thumb-up" : "mdi:thumb-up-outline"} width={16} />
          {likes > 0 ? likes : "Me interesa"}
        </button>
        <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex-1 justify-center ${HV} ${M}`}>
          <Icon icon="mdi:comment-outline" width={16} />
          Comentar
        </button>
        {(post.type === "vacante" || post.type === "match") && (
          <Link
            to="/estudiante/perfil"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex-1 justify-center ${HV} ${M}`}
          >
            <Icon icon="mdi:send-outline" width={16} />
            Postular
          </Link>
        )}
      </div>
    </div>
  );
}

const TIPO_BADGE = {
  vacante:    { label: "Práctica",   color: "orange" },
  logro:      { label: "Logro",      color: "yellow" },
  evaluacion: { label: "Evaluación", color: "green"  },
  match:      { label: "Match",      color: "blue"   },
  general:    { label: "General",    color: "blue"   },
};

function tiempoRelativo(fecha) {
  const diff = Math.floor((Date.now() - new Date(fecha)) / 1000);
  if (diff < 60)   return "Ahora mismo";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

function FeedCard({ pub, isDark, perfilCompleto, onDeleted }) {
  const [liked, setLiked] = useState(!!pub.liked_by_me);
  const [likes, setLikes] = useState(pub.likes_count || 0);
  const [verMas, setVerMas] = useState(false);
  const [estadoPostula, setEstadoPostula] = useState("idle"); // idle | loading | ok | duplicado | error | incompleto
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#E8E6E1]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";
  const HV = isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]";

  const inicial = pub.autor_nombre ? pub.autor_nombre.charAt(0).toUpperCase() : "?";
  const badge = pub.tipo === "vacante"
    ? { label: pub.vacante_tipo === "puesto_laboral" ? "Puesto laboral" : "Práctica", color: pub.vacante_tipo === "puesto_laboral" ? "green" : "orange" }
    : (TIPO_BADGE[pub.tipo] || { label: pub.tipo, color: "blue" });
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

  const handlePostular = async () => {
    if (!pub.vacante_id || estadoPostula !== "idle") return;
    if (!perfilCompleto) { setEstadoPostula("incompleto"); return; }
    setEstadoPostula("loading");
    try {
      await postularAVacante(pub.vacante_id);
      setEstadoPostula("ok");
    } catch (err) {
      setEstadoPostula(err.message?.toLowerCase().includes("ya") ? "duplicado" : "error");
    }
  };

  return (
    <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <Link
          to={pub.autor_rol === "empresa"
            ? `/empresa-publica/${pub.autor_id}`
            : `/${usuario.rol === "centro" ? "admin" : usuario.rol}/candidato/${pub.autor_id}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar initial={inicial} color="bg-[#0F4D8A]" size="md" foto={pub.autor_foto_perfil} />
          <div>
            <p className={`text-sm font-semibold leading-tight ${T}`}>{pub.autor_nombre}</p>
            <p className={`text-xs ${M}`}>{tiempoRelativo(pub.publicado_en)}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Badge color={badge.color}>{badge.label}</Badge>
          {canDelete && (
            <div className="relative">
              <button
                onClick={() => { setMenuAbierto((v) => !v); setConfirmarEliminar(false); }}
                className={`p-1 rounded-lg transition-colors ${HV} ${M}`}
              >
                <Icon icon="mdi:dots-vertical" width={16} />
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

      {pub.titulo && pub.titulo !== "Actualización de estado" && (
        <div className="px-4 pb-1">
          <p className={`text-sm font-semibold ${T}`}>{pub.titulo}</p>
        </div>
      )}

      {pub.contenido && (
        <div className="px-4 pb-3">
          <p className={`text-sm leading-relaxed ${T}`}>{pub.contenido}</p>
        </div>
      )}

      {pub.tipo === "vacante" && (
        <div className={`mx-4 mb-3 p-3 rounded-lg border ${B} ${isDark ? "bg-[#1e1e1c]" : "bg-[#F7F6F3]"}`}>
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
            {pub.area && (
              <div className="flex items-center gap-1.5">
                <Icon icon="mdi:tag-outline" width={14} className="text-[#378ADD]" />
                <span className={`text-xs ${T}`}>{pub.area}</span>
              </div>
            )}
            {pub.modalidad && (
              <div className="flex items-center gap-1.5">
                <Icon icon="mdi:map-marker-outline" width={14} className={M} />
                <span className={`text-xs ${M} capitalize`}>{pub.modalidad}</span>
              </div>
            )}
            {pub.duracion && (
              <div className="flex items-center gap-1.5">
                <Icon icon="mdi:clock-outline" width={14} className={M} />
                <span className={`text-xs ${M}`}>{pub.duracion}</span>
              </div>
            )}
            {pub.remuneracion && (
              <div className="flex items-center gap-1.5">
                <Icon icon="mdi:currency-usd" width={14} className="text-green-500" />
                <span className={`text-xs ${M}`}>{pub.remuneracion}</span>
              </div>
            )}
            {pub.direccion && (
              <div className="flex items-center gap-1.5">
                <Icon icon="mdi:office-building-outline" width={14} className={M} />
                <span className={`text-xs ${M}`}>{pub.direccion}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {pub.url_multimedia && (() => {
        const src = resolverMedia(pub.url_multimedia);
        const esVideo = /\.(mp4|webm|ogg|mov|avi)(\?|$)/i.test(pub.url_multimedia);
        return (
          <div className="px-4 pb-3">
            {esVideo ? (
              <video
                src={src}
                controls
                className="rounded-lg w-full"
                style={{ maxHeight: "80vh", background: "transparent" }}
                onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
              />
            ) : (
              <img
                src={src}
                alt="Multimedia"
                className="rounded-lg max-h-72 w-full object-cover border"
                onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
              />
            )}
          </div>
        );
      })()}

      <div className={`border-t ${B}`} />
      <div className="flex items-center px-2 py-1">
        <button
          onClick={async () => {
            const prev = liked;
            setLiked(!prev);
            setLikes((n) => prev ? n - 1 : n + 1);
            try {
              const res = await toggleLike(pub.id);
              setLiked(res.liked);
              setLikes(res.total);
            } catch {
              // revertir si falla
              setLiked(prev);
              setLikes((n) => prev ? n + 1 : n - 1);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex-1 justify-center ${HV} ${liked ? "text-[#378ADD]" : M}`}
        >
          <Icon icon={liked ? "mdi:thumb-up" : "mdi:thumb-up-outline"} width={16} />
          {likes > 0 ? likes : "Me interesa"}
        </button>
        <button
          onClick={() => setVerMas(true)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex-1 justify-center ${HV} ${M}`}
        >
          <Icon icon="mdi:comment-outline" width={16} />
          Ver más
        </button>
        {pub.tipo === "vacante" && usuario.rol === "estudiante" && (
          <div className="flex-1 relative group">
            <button
              onClick={handlePostular}
              disabled={estadoPostula !== "idle" || !pub.vacante_activa}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full justify-center ${
                estadoPostula === "ok"          ? "text-green-600" :
                estadoPostula === "duplicado"   ? "text-amber-500" :
                estadoPostula === "error"       ? "text-red-500"   :
                estadoPostula === "incompleto"  ? "text-orange-500" :
                estadoPostula === "loading"     ? M                 : M
              } ${estadoPostula === "idle" ? HV : ""}`}
            >
              <Icon
                icon={
                  estadoPostula === "ok"         ? "mdi:check-circle-outline"  :
                  estadoPostula === "duplicado"  ? "mdi:information-outline"   :
                  estadoPostula === "error"      ? "mdi:alert-circle-outline"  :
                  estadoPostula === "incompleto" ? "mdi:account-alert-outline" :
                  estadoPostula === "loading"    ? "mdi:loading"               : "mdi:send-outline"
                }
                width={16}
                className={estadoPostula === "loading" ? "animate-spin" : ""}
              />
              {estadoPostula === "ok"         ? "Postulado"          :
               estadoPostula === "duplicado"  ? "Ya postulaste"      :
               estadoPostula === "error"      ? "Error, reintentar"  :
               estadoPostula === "incompleto" ? "Perfil incompleto"  :
               estadoPostula === "loading"    ? "Enviando..."        :
               !pub.vacante_activa            ? "Cerrada"            : "Postular"}
            </button>
            {estadoPostula === "incompleto" && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 text-center text-xs rounded-lg px-3 py-2 shadow-lg z-10 pointer-events-none ${
                isDark ? "bg-[#262624] border border-[#3a3a38] text-[#D3D1C7]" : "bg-white border border-[#D3D1C7] text-[#2C2C2A]"
              }`}>
                Completa tu perfil al 100% para poder postular
              </div>
            )}
          </div>
        )}
      </div>

      {verMas && <VerMasModal pub={pub} onClose={() => setVerMas(false)} />}
    </div>
  );
}

function TallerCard({ taller, isDark, perfilCompleto }) {
  const [estadoInscripcion, setEstadoInscripcion] = useState("idle"); // idle | loading | ok | duplicado | sin_cupos | error | incompleto
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const T  = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#E8E6E1]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";
  const HV = isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]";

  const gratuito = !taller.costo || Number(taller.costo) === 0;
  const costoStr = gratuito ? "Gratuito" : `$${Number(taller.costo).toLocaleString("es-CL")}`;

  const handleInscribirse = async () => {
    if (estadoInscripcion !== "idle") return;
    if (!perfilCompleto) { setEstadoInscripcion("incompleto"); return; }
    setEstadoInscripcion("loading");
    try {
      await inscribirseEnTaller(taller.id);
      setEstadoInscripcion("ok");
    } catch (err) {
      const msg = err.message?.toLowerCase();
      if (msg?.includes("ya estás")) setEstadoInscripcion("duplicado");
      else if (msg?.includes("cupos"))  setEstadoInscripcion("sin_cupos");
      else setEstadoInscripcion("error");
    }
  };

  return (
    <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
      {/* Header igual que FeedCard */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:school-outline" width={20} className="text-white" />
          </div>
          <div>
            <p className={`text-sm font-semibold leading-tight ${T}`}>C.E. Cardenal J.M. Caro</p>
            <p className={`text-xs ${M}`}>{tiempoRelativo(taller.creado_en)}</p>
          </div>
        </div>
        <Badge color="purple">Taller</Badge>
      </div>

      {/* Título */}
      <div className="px-4 pb-1">
        <p className={`text-sm font-semibold ${T}`}>{taller.titulo}</p>
      </div>

      {/* Descripción */}
      {taller.descripcion && (
        <div className="px-4 pb-3">
          <p className={`text-sm leading-relaxed ${T}`}>{taller.descripcion}</p>
        </div>
      )}

      {/* Info box igual que vacante */}
      <div className={`mx-4 mb-3 p-3 rounded-lg border ${B} ${isDark ? "bg-[#1e1e1c]" : "bg-[#F7F6F3]"}`}>
        <div className="flex flex-wrap gap-3">
          {taller.esta_activo === false || taller.esta_activo === 0 ? (
            <div className="flex items-center gap-1.5">
              <Icon icon="mdi:close-circle-outline" width={14} className="text-red-400" />
              <span className="text-xs font-medium text-red-500">Cerrado</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Icon icon="mdi:check-circle-outline" width={14} className="text-green-500" />
              <span className="text-xs font-medium text-green-600">Activo</span>
            </div>
          )}
          {taller.area && (
            <div className="flex items-center gap-1.5">
              <Icon icon="mdi:tag-outline" width={14} className="text-purple-500" />
              <span className={`text-xs ${T}`}>{taller.area}</span>
            </div>
          )}
          {taller.modalidad && (
            <div className="flex items-center gap-1.5">
              <Icon icon="mdi:map-marker-outline" width={14} className={M} />
              <span className={`text-xs ${M} capitalize`}>{taller.modalidad}</span>
            </div>
          )}
          {taller.duracion && (
            <div className="flex items-center gap-1.5">
              <Icon icon="mdi:clock-outline" width={14} className={M} />
              <span className={`text-xs ${M}`}>{taller.duracion}</span>
            </div>
          )}
          {taller.horario && (
            <div className="flex items-center gap-1.5">
              <Icon icon="mdi:calendar-clock-outline" width={14} className={M} />
              <span className={`text-xs ${M}`}>{taller.horario}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Icon icon={gratuito ? "mdi:gift-outline" : "mdi:currency-usd"} width={14} className={gratuito ? "text-green-500" : "text-amber-500"} />
            <span className={`text-xs font-medium ${gratuito ? "text-green-600" : "text-amber-600"}`}>{costoStr}</span>
          </div>
          {taller.cupos != null && (
            <div className="flex items-center gap-1.5">
              <Icon icon="mdi:account-group-outline" width={14} className={M} />
              <span className={`text-xs ${M}`}>{taller.cupos} cupos</span>
            </div>
          )}
          {taller.fecha_inicio && (
            <div className="flex items-center gap-1.5">
              <Icon icon="mdi:calendar-start" width={14} className={M} />
              <span className={`text-xs ${M}`}>{new Date(taller.fecha_inicio).toLocaleDateString("es-CL")}</span>
            </div>
          )}
          {(taller.permite_inscripcion === false || taller.permite_inscripcion === 0) && (
            <div className="flex items-center gap-1.5">
              <Icon icon="mdi:open-in-new" width={14} className={M} />
              <span className={`text-xs ${M}`}>Informativo</span>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className={`border-t ${B}`} />
      <div className="flex items-center px-2 py-1">
        <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex-1 justify-center ${HV} ${M}`}>
          <Icon icon="mdi:thumb-up-outline" width={16} />
          Me interesa
        </button>
        <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex-1 justify-center ${HV} ${M}`}>
          <Icon icon="mdi:information-outline" width={16} />
          Ver más
        </button>
        {usuario.rol === "estudiante" && (taller.esta_activo === true || taller.esta_activo === 1) && (taller.permite_inscripcion === true || taller.permite_inscripcion === 1) && (
          <div className="flex-1 relative group">
            <button
              onClick={handleInscribirse}
              disabled={estadoInscripcion !== "idle"}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full justify-center ${
                estadoInscripcion === "ok"         ? "text-green-600"  :
                estadoInscripcion === "duplicado"  ? "text-amber-500"  :
                estadoInscripcion === "sin_cupos"  ? "text-red-500"    :
                estadoInscripcion === "error"      ? "text-red-500"    :
                estadoInscripcion === "incompleto" ? "text-orange-500" : M
              } ${estadoInscripcion === "idle" ? HV : ""}`}
            >
              <Icon
                icon={
                  estadoInscripcion === "ok"         ? "mdi:check-circle-outline"  :
                  estadoInscripcion === "duplicado"  ? "mdi:information-outline"   :
                  estadoInscripcion === "sin_cupos"  ? "mdi:account-cancel-outline":
                  estadoInscripcion === "error"      ? "mdi:alert-circle-outline"  :
                  estadoInscripcion === "incompleto" ? "mdi:account-alert-outline" :
                  estadoInscripcion === "loading"    ? "mdi:loading"               : "mdi:clipboard-plus-outline"
                }
                width={16}
                className={estadoInscripcion === "loading" ? "animate-spin" : ""}
              />
              {estadoInscripcion === "ok"         ? "Inscrito"           :
               estadoInscripcion === "duplicado"  ? "Ya inscrito"        :
               estadoInscripcion === "sin_cupos"  ? "Sin cupos"          :
               estadoInscripcion === "error"      ? "Error, reintentar"  :
               estadoInscripcion === "incompleto" ? "Perfil incompleto"  :
               estadoInscripcion === "loading"    ? "Enviando..."        : "Inscribirse"}
            </button>
            {estadoInscripcion === "incompleto" && (
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 text-center text-xs rounded-lg px-3 py-2 shadow-lg z-10 pointer-events-none ${
                isDark ? "bg-[#262624] border border-[#3a3a38] text-[#D3D1C7]" : "bg-white border border-[#D3D1C7] text-[#2C2C2A]"
              }`}>
                Completa tu perfil al 100% para inscribirte
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const careerDisplay = {
  "Administracion": "Administración",
  "Mecanica Automotriz": "Mecánica Automotriz",
};

export default function EstudianteDashboard() {
  const { isDark } = useDark();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#E8E6E1]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const location = useLocation();
  const isEstudiante = location.pathname.startsWith("/estudiante");
  const isEmpresa = location.pathname.startsWith("/empresa");
  const isAdmin = location.pathname.startsWith("/admin");

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const [perfil, setPerfil] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [talleres, setTalleres] = useState([]);

  // Estado estudiante extra
  const [estudiantePostulaciones, setEstudiantePostulaciones] = useState([]);
  const [estudianteConversaciones, setEstudianteConversaciones] = useState([]);

  // Estado empresa
  const [empresaPerfil, setEmpresaPerfil] = useState(null);
  const [empresaVacantes, setEmpresaVacantes] = useState([]);
  const [empresaPostulantes, setEmpresaPostulantes] = useState([]);
  const [empresaConversaciones, setEmpresaConversaciones] = useState([]);

  // Estado admin
  const [adminStats, setAdminStats] = useState(null);

  const cargarPublicaciones = () => {
    getPublicaciones().then(setPublicaciones).catch(console.error);
  };

  useEffect(() => {
    if (usuario.id && usuario.rol === "estudiante") {
      getEstudianteById(usuario.id).then(setPerfil).catch(console.error);
      getPostulacionesEstudiante().then(setEstudiantePostulaciones).catch(console.error);
      getConversaciones().then(setEstudianteConversaciones).catch(console.error);
    }
    if (usuario.id && usuario.rol === "empresa") {
      getEmpresaById(usuario.id).then(setEmpresaPerfil).catch(console.error);
      getVacantesEmpresa(usuario.id).then(setEmpresaVacantes).catch(console.error);
      getPostulantesEmpresa().then(setEmpresaPostulantes).catch(console.error);
      getConversaciones().then(setEmpresaConversaciones).catch(console.error);
    }
    if (usuario.id && usuario.rol === "centro") {
      getAdminStats().then(setAdminStats).catch(console.error);
    }
    cargarPublicaciones();
    getTalleres().then(setTalleres).catch(console.error);
  }, [usuario.id]);

  const nombre = perfil?.nombre_completo || "";
  const carrera = perfil?.carrera || "";
  const semestre = perfil?.semestre || "";
  const telefono = perfil?.telefono || "";
  const biografia = perfil?.biografia || "";
  const promedio = perfil?.promedio || "";
  const habilidades = perfil?.habilidades || [];
  const estadoCivil = perfil?.estado_civil || "";
  const rut = perfil?.rut || "";
  const region = perfil?.region || "";
  const comuna = perfil?.comuna || "";

  const nombreCarrera = careerDisplay[carrera] || carrera;
  const inicial = nombre ? nombre.charAt(0).toUpperCase() : "?";
  const subtitleParts = [nombreCarrera, semestre ? `${semestre}° semestre` : ""].filter(Boolean);

  const pctCompleto = calcularCompletitud({ nombre_completo: nombre, carrera, telefono, biografia, estado_civil: estadoCivil, rut, region, comuna });
  const perfilCompleto = pctCompleto === 100;

  const profileSteps = [
    { done: !!(nombre && telefono),  label: "Nombre y teléfono" },
    { done: !!(rut),                 label: "RUT válido" },
    { done: !!(carrera),             label: "Carrera" },
    { done: !!(estadoCivil),         label: "Estado civil" },
    { done: !!(region && comuna),    label: "Región y comuna" },
    { done: !!(biografia),           label: "Presentación personal" },
  ];

  const conSidebar = isEstudiante || isEmpresa || isAdmin;
  const vacantesActivasEmpresa = empresaVacantes.filter((v) => v.esta_activa);
  const mensajesNoLeidos = empresaConversaciones.filter((c) => c.no_leidos > 0);

  return (
    <div className={conSidebar ? "grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] gap-5 items-start" : "max-w-2xl mx-auto w-full flex flex-col gap-4"}>

      {/* ── LEFT SIDEBAR EMPRESA ── */}
      {isEmpresa && (
        <div className="flex flex-col gap-4 sticky top-20">
          {/* Tarjeta empresa */}
          <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
            <div className="h-16 bg-gradient-to-r from-[#0A3A6A] to-[#378ADD]" />
            <div className="px-4 pb-4">
              <div className="-mt-7 mb-3">
                <Avatar
                  initial={(empresaPerfil?.nombre_empresa || usuario.nombre_empresa || "E")[0].toUpperCase()}
                  color="bg-[#0F4D8A]"
                  size="lg"
                  foto={empresaPerfil?.foto_perfil}
                />
              </div>
              <p className={`text-sm font-semibold ${T}`}>{empresaPerfil?.nombre_empresa || usuario.nombre_empresa || "Mi empresa"}</p>
              <p className={`text-xs ${M} mt-0.5`}>Empresa verificada · EmpleaMe</p>

              <div className={`flex gap-4 mt-3 pt-3 border-t ${B}`}>
                <div className="text-center">
                  <p className={`text-base font-semibold ${T}`}>{vacantesActivasEmpresa.length}</p>
                  <p className={`text-xs ${M}`}>Activas</p>
                </div>
                <div className="text-center">
                  <p className={`text-base font-semibold ${T}`}>{empresaVacantes.reduce((a, v) => a + (v.total_postulantes || 0), 0)}</p>
                  <p className={`text-xs ${M}`}>Postulantes</p>
                </div>
                <div className="text-center">
                  <p className={`text-base font-semibold text-amber-500`}>{empresaPostulantes.length}</p>
                  <p className={`text-xs ${M}`}>Pendientes</p>
                </div>
              </div>

              <Link
                to="/empresa/dashboard"
                className="block text-center mt-3 text-xs font-medium text-[#0F4D8A] hover:text-[#0A3A6A] border border-[#0F4D8A] hover:bg-[#E6F1FB] py-1.5 rounded-lg transition-colors"
              >
                Ir al panel
              </Link>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className={`rounded-xl border ${B} ${BG} p-4`}>
            <p className={`text-xs font-semibold ${T} mb-2`}>Accesos rápidos</p>
            {[
              { icon: "mdi:plus-circle-outline",    label: "Publicar vacante",   to: "/empresa/publicar"   },
              { icon: "mdi:view-dashboard-outline", label: "Panel de empresa",   to: "/empresa/dashboard"  },
              { icon: "mdi:account-search-outline", label: "Buscar estudiantes", to: "/empresa/buscador"   },
              { icon: "mdi:message-outline",        label: "Mensajería",         to: "/empresa/mensajeria" },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`flex items-center gap-2.5 py-2 text-xs rounded-lg px-2 -mx-2 transition-colors ${isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"} ${M}`}
              >
                <Icon icon={link.icon} width={15} className="flex-shrink-0" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── LEFT SIDEBAR ADMIN ── */}
      {isAdmin && (
        <div className="flex flex-col gap-4 sticky top-20">
          {/* Tarjeta perfil admin */}
          <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
            <div className="h-16 bg-gradient-to-r from-purple-900 to-purple-600" />
            <div className="px-4 pb-4">
              <div className="-mt-7 mb-3">
                <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold border-2 border-white">
                  <Icon icon="mdi:shield-account-outline" width={28} />
                </div>
              </div>
              <p className={`text-sm font-semibold ${T}`}>C.E. Cardenal J.M. Caro</p>
              <p className={`text-xs ${M} mt-0.5`}>Administrador del sistema</p>

              <div className={`grid grid-cols-2 gap-2 mt-3 pt-3 border-t ${B}`}>
                <div className="text-center">
                  <p className={`text-base font-semibold ${T}`}>{adminStats?.total_estudiantes ?? "—"}</p>
                  <p className={`text-xs ${M}`}>Estudiantes</p>
                </div>
                <div className="text-center">
                  <p className={`text-base font-semibold ${T}`}>{adminStats?.total_empresas ?? "—"}</p>
                  <p className={`text-xs ${M}`}>Empresas</p>
                </div>
                <div className="text-center">
                  <p className={`text-base font-semibold text-green-600`}>{adminStats?.total_vacantes_activas ?? "—"}</p>
                  <p className={`text-xs ${M}`}>Vacantes</p>
                </div>
                <div className="text-center">
                  <p className={`text-base font-semibold text-amber-500`}>{adminStats?.total_postulaciones ?? "—"}</p>
                  <p className={`text-xs ${M}`}>Pendientes</p>
                </div>
              </div>

              <Link
                to="/admin/panel"
                className="block text-center mt-3 text-xs font-medium text-purple-600 hover:text-purple-700 border border-purple-500 hover:bg-purple-50 py-1.5 rounded-lg transition-colors"
              >
                Ir al panel
              </Link>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className={`rounded-xl border ${B} ${BG} p-4`}>
            <p className={`text-xs font-semibold ${T} mb-2`}>Accesos rápidos</p>
            {[
              { icon: "mdi:account-group-outline",   label: "Gestión de usuarios",  to: "/admin/usuarios"     },
              { icon: "mdi:school-outline",           label: "Talleres",             to: "/admin/talleres"     },
              { icon: "mdi:clipboard-check-outline",  label: "Evaluaciones",         to: "/admin/evaluaciones" },
              { icon: "mdi:message-outline",          label: "Mensajería",           to: "/admin/mensajeria"   },
              { icon: "mdi:account-search-outline",   label: "Buscar perfiles",      to: "/admin/buscar"       },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`flex items-center gap-2.5 py-2 text-xs rounded-lg px-2 -mx-2 transition-colors ${isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"} ${M}`}
              >
                <Icon icon={link.icon} width={15} className="flex-shrink-0" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── LEFT SIDEBAR ── */}
      {isEstudiante && <div className="flex flex-col gap-4 sticky top-20">
        {/* Profile card */}
        <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
          {/* Banner */}
          <div className="h-16 bg-gradient-to-r from-[#0A3A6A] to-[#378ADD]" />
          <div className="px-4 pb-4 text-center">
            <div className="-mt-7 mb-3 flex justify-center">
              <Avatar initial={inicial} color="bg-[#0F4D8A]" size="lg" foto={perfil?.foto_perfil} />
            </div>
            <p className={`text-sm font-semibold ${T}`}>{nombre || "Sin nombre"}</p>
            <p className={`text-xs ${M} mt-0.5`}>{subtitleParts.join(" · ") || "Sin carrera"}</p>
            <p className={`text-xs ${M}`}>C.E. Cardenal J.M. Caro</p>

            <div className={`flex gap-4 mt-3 pt-3 border-t ${B} justify-center`}>
              <div className="text-center">
                <p className={`text-base font-semibold ${T}`}>{estudiantePostulaciones.length}</p>
                <p className={`text-xs ${M}`}>Postulaciones</p>
              </div>
              <div className="text-center">
                <p className={`text-base font-semibold text-green-600`}>
                  {estudiantePostulaciones.filter((p) => p.estado === "aceptado").length}
                </p>
                <p className={`text-xs ${M}`}>Aceptadas</p>
              </div>
              <div className="text-center">
                <p className={`text-base font-semibold ${estudianteConversaciones.some((c) => c.no_leidos > 0) ? "text-red-500" : T}`}>
                  {estudianteConversaciones.reduce((a, c) => a + (c.no_leidos || 0), 0)}
                </p>
                <p className={`text-xs ${M}`}>Mensajes</p>
              </div>
            </div>

            <Link
              to="/estudiante/perfil"
              className="block text-center mt-3 text-xs font-medium text-[#0F4D8A] hover:text-[#0A3A6A] border border-[#0F4D8A] hover:bg-[#E6F1FB] py-1.5 rounded-lg transition-colors"
            >
              Ver mi perfil
            </Link>
          </div>
        </div>

        {/* Quick links */}
        <div className={`rounded-xl border ${B} ${BG} p-4`}>
          <p className={`text-xs font-semibold ${T} mb-2`}>Accesos rápidos</p>
          {[
            { icon: "mdi:send-check-outline",       label: "Mis postulaciones", to: "/estudiante/postulaciones" },
            { icon: "mdi:message-outline",           label: "Mensajería",        to: "/estudiante/mensajeria"    },
            { icon: "mdi:account-search-outline",    label: "Buscar perfiles",   to: "/estudiante/buscar"        },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`flex items-center gap-2.5 py-2 text-xs rounded-lg px-2 -mx-2 transition-colors ${
                isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"
              } ${M}`}
            >
              <Icon icon={link.icon} width={15} />
              {link.label}
            </Link>
          ))}
        </div>
      </div>}

      {/* ── CENTER FEED ── */}
      <div className="flex flex-col gap-4">
        {(isEstudiante || isEmpresa || isAdmin) && <CrearPublicacion onPublicado={cargarPublicaciones} />}

        {(() => {
          const feedUnificado = [
            ...publicaciones.map((p) => ({ ...p, _tipo: "publicacion", _fecha: new Date(p.publicado_en) })),
            ...talleres.map((t) => ({ ...t, _tipo: "taller", _fecha: new Date(t.creado_en) })),
          ].sort((a, b) => b._fecha - a._fecha);

          if (feedUnificado.length === 0) {
            return (
              <div className={`rounded-xl border ${B} ${BG} p-10 text-center ${M}`}>
                <Icon icon="mdi:newspaper-variant-outline" width={40} className="mx-auto mb-3 opacity-40" />
                <p className={`text-sm font-medium ${T}`}>Aún no hay publicaciones</p>
                <p className="text-xs mt-1">¡Sé el primero en compartir algo!</p>
              </div>
            );
          }

          return feedUnificado.map((item) =>
            item._tipo === "taller"
              ? <TallerCard key={`taller-${item.id}`} taller={item} isDark={isDark} perfilCompleto={perfilCompleto} />
              : <FeedCard key={`pub-${item.id}`} pub={item} isDark={isDark} perfilCompleto={perfilCompleto} onDeleted={(id) => setPublicaciones((prev) => prev.filter((p) => p.id !== id))} />
          );
        })()}
      </div>

      {/* ── RIGHT SIDEBAR EMPRESA ── */}
      {isEmpresa && (
        <div className="flex flex-col gap-4 sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pr-0.5">

          {/* Mensajes no leídos */}
          <div className={`rounded-xl border ${B} ${BG} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-xs font-semibold ${T}`}>Mensajes</p>
              {mensajesNoLeidos.length > 0 && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isDark ? "bg-red-500/15 text-red-400" : "bg-red-100 text-red-600"}`}>
                  {mensajesNoLeidos.length} sin leer
                </span>
              )}
            </div>
            {empresaConversaciones.length === 0 ? (
              <p className={`text-xs ${M}`}>Sin conversaciones aún.</p>
            ) : (
              <>
                {empresaConversaciones.slice(0, 4).map((c, i) => {
                  const nombre = c.contraparte || c.nombre_estudiante || c.nombre_empresa || "Usuario";
                  return (
                    <Link
                      key={c.id}
                      to="/empresa/mensajeria"
                      state={{ conversacionId: c.id }}
                      className={`flex items-center gap-2.5 ${i < Math.min(empresaConversaciones.length, 4) - 1 ? `pb-2.5 mb-2.5 border-b ${B}` : ""}`}
                    >
                      {c.contraparte_foto ? (
                        <img src={resolverMedia(c.contraparte_foto)} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#0F4D8A] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {nombre[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${T} truncate`}>{nombre}</p>
                        <p className={`text-xs ${M} truncate`}>{c.ultimo_mensaje || "Sin mensajes"}</p>
                      </div>
                      {c.no_leidos > 0 && (
                        <span className="text-xs bg-[#0F4D8A] text-white font-semibold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                          {c.no_leidos}
                        </span>
                      )}
                    </Link>
                  );
                })}
                <Link to="/empresa/mensajeria" className={`block text-center mt-2 text-xs text-[#378ADD] hover:underline`}>
                  Ver todos →
                </Link>
              </>
            )}
          </div>

          {/* Últimos postulantes pendientes */}
          <div className={`rounded-xl border ${B} ${BG} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-xs font-semibold ${T}`}>Postulantes pendientes</p>
              {empresaPostulantes.length > 0 && (
                <span className="text-xs text-amber-600 font-semibold">{empresaPostulantes.length}</span>
              )}
            </div>
            {empresaPostulantes.length === 0 ? (
              <p className={`text-xs ${M}`}>Sin postulantes pendientes.</p>
            ) : (
              <>
                {empresaPostulantes.slice(0, 3).map((p, i) => (
                  <Link
                    key={p.id}
                    to={`/empresa/candidato/${p.estudiante_id}`}
                    className={`flex items-center gap-2.5 ${i < Math.min(empresaPostulantes.length, 3) - 1 ? `pb-2.5 mb-2.5 border-b ${B}` : ""}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 bg-[#0F4D8A]`}>
                      {p.nombre_completo?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${T} truncate`}>{p.nombre_completo}</p>
                      <p className={`text-xs ${M} truncate`}>{p.vacante_titulo || p.carrera}</p>
                    </div>
                    <Icon icon="mdi:chevron-right" width={14} className={M} />
                  </Link>
                ))}
                <Link to="/empresa/dashboard" className={`block text-center mt-2 text-xs text-[#378ADD] hover:underline`}>
                  Ver panel →
                </Link>
              </>
            )}
          </div>

          {/* Vacantes activas resumen */}
          <div className={`rounded-xl border ${B} ${BG} p-4`}>
            <p className={`text-xs font-semibold ${T} mb-3`}>Mis vacantes activas</p>
            {vacantesActivasEmpresa.length === 0 ? (
              <p className={`text-xs ${M}`}>No tienes vacantes activas.</p>
            ) : (
              <>
                {vacantesActivasEmpresa.slice(0, 3).map((v, i) => (
                  <div key={v.id} className={`${i < Math.min(vacantesActivasEmpresa.length, 3) - 1 ? `pb-2.5 mb-2.5 border-b ${B}` : ""}`}>
                    <p className={`text-xs font-medium ${T} truncate`}>{v.titulo}</p>
                    <p className={`text-xs ${M}`}>
                      {v.tipo === "puesto_laboral" ? "Puesto laboral" : "Práctica"} · {v.total_postulantes || 0} postulantes
                    </p>
                  </div>
                ))}
                <Link to="/empresa/dashboard" className={`block text-center mt-2 text-xs text-[#378ADD] hover:underline`}>
                  Gestionar vacantes →
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── RIGHT SIDEBAR ADMIN ── */}
      {isAdmin && (
        <div className="flex flex-col gap-4 sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pr-0.5">

          {/* Estadísticas del sistema */}
          <div className={`rounded-xl border ${B} ${BG} p-4`}>
            <p className={`text-xs font-semibold ${T} mb-3`}>Estado del sistema</p>
            {[
              { label: "Estudiantes registrados", value: adminStats?.total_estudiantes, icon: "mdi:account-school-outline",  color: "text-[#378ADD]"  },
              { label: "Empresas registradas",    value: adminStats?.total_empresas,    icon: "mdi:domain",                  color: "text-purple-600" },
              { label: "Vacantes activas",        value: adminStats?.total_vacantes_activas, icon: "mdi:briefcase-check-outline", color: "text-green-600"  },
              { label: "Postulaciones pendientes",value: adminStats?.total_postulaciones,icon: "mdi:clock-outline",           color: "text-amber-500"  },
              { label: "Conversaciones totales",  value: adminStats?.total_conversaciones,icon: "mdi:message-outline",        color: "text-[#378ADD]"  },
              { label: "Evaluaciones realizadas", value: adminStats?.total_evaluaciones, icon: "mdi:clipboard-check-outline", color: "text-green-600"  },
            ].map((s, i, arr) => (
              <div key={s.label} className={`flex items-center gap-2.5 ${i < arr.length - 1 ? `pb-2.5 mb-2.5 border-b ${B}` : ""}`}>
                <Icon icon={s.icon} width={16} className={`flex-shrink-0 ${s.color}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${M} truncate`}>{s.label}</p>
                </div>
                <p className={`text-sm font-semibold ${T} flex-shrink-0`}>{s.value ?? "—"}</p>
              </div>
            ))}
          </div>

          {/* Talleres recientes */}
          {talleres.length > 0 && (
            <div className={`rounded-xl border ${B} ${BG} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs font-semibold ${T}`}>Talleres activos</p>
                <span className={`text-xs font-semibold text-purple-600`}>{talleres.filter(t => t.esta_activo).length}</span>
              </div>
              {talleres.filter(t => t.esta_activo).slice(0, 3).map((t, i, arr) => (
                <div key={t.id} className={`flex items-center gap-2.5 ${i < arr.length - 1 ? `pb-2.5 mb-2.5 border-b ${B}` : ""}`}>
                  <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Icon icon="mdi:school-outline" width={14} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${T} truncate`}>{t.titulo}</p>
                    <p className={`text-xs ${M} truncate capitalize`}>{t.modalidad} {t.area ? `· ${t.area}` : ""}</p>
                  </div>
                </div>
              ))}
              <Link to="/admin/talleres" className="block text-center mt-2 text-xs text-purple-600 hover:underline">
                Gestionar talleres →
              </Link>
            </div>
          )}

          {/* Estudiantes evaluados */}
          {adminStats && (
            <div className={`rounded-xl border ${B} ${BG} p-4`}>
              <p className={`text-xs font-semibold ${T} mb-3`}>Cobertura de evaluaciones</p>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-purple-500 transition-all"
                    style={{ width: `${adminStats.total_estudiantes > 0 ? Math.round((adminStats.estudiantes_evaluados / adminStats.total_estudiantes) * 100) : 0}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold ${T} flex-shrink-0`}>
                  {adminStats.total_estudiantes > 0
                    ? Math.round((adminStats.estudiantes_evaluados / adminStats.total_estudiantes) * 100)
                    : 0}%
                </span>
              </div>
              <p className={`text-xs ${M}`}>{adminStats.estudiantes_evaluados} de {adminStats.total_estudiantes} estudiantes evaluados</p>
              <Link to="/admin/evaluaciones" className="block text-center mt-2 text-xs text-purple-600 hover:underline">
                Ver evaluaciones →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── RIGHT SIDEBAR ESTUDIANTE ── */}
      {isEstudiante && <div className="flex flex-col gap-4 sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pr-0.5">

        {/* Mis postulaciones */}
        <div className={`rounded-xl border ${B} ${BG} p-4`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold ${T}`}>Mis postulaciones</p>
            {estudiantePostulaciones.length > 0 && (
              <span className={`text-xs font-semibold ${M}`}>{estudiantePostulaciones.length}</span>
            )}
          </div>
          {estudiantePostulaciones.length === 0 ? (
            <p className={`text-xs ${M}`}>Aún no has postulado a ninguna vacante.</p>
          ) : (
            <>
              {estudiantePostulaciones.slice(0, 3).map((p, i) => {
                const cfg = {
                  pendiente:  { label: "Pendiente", color: "text-blue-500",  icon: "mdi:clock-outline"          },
                  aceptado:   { label: "Aceptado",  color: "text-green-600", icon: "mdi:check-circle-outline"   },
                  rechazado:  { label: "Rechazado", color: "text-red-500",   icon: "mdi:close-circle-outline"   },
                }[p.estado] || { label: p.estado, color: M, icon: "mdi:help-circle-outline" };
                return (
                  <div key={p.id} className={`flex items-start gap-2 ${i < Math.min(estudiantePostulaciones.length, 3) - 1 ? `pb-2.5 mb-2.5 border-b ${B}` : ""}`}>
                    <Icon icon={cfg.icon} width={14} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${T} truncate`}>{p.titulo}</p>
                      <p className={`text-xs ${M} truncate`}>{p.nombre_empresa}</p>
                      <p className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</p>
                    </div>
                  </div>
                );
              })}
              <Link to="/estudiante/postulaciones" className="block text-center mt-2 text-xs text-[#378ADD] hover:underline">
                Ver todas →
              </Link>
            </>
          )}
        </div>

        {/* Mensajes */}
        <div className={`rounded-xl border ${B} ${BG} p-4`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold ${T}`}>Mensajes</p>
            {estudianteConversaciones.some((c) => c.no_leidos > 0) && (
              <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                {estudianteConversaciones.reduce((a, c) => a + (c.no_leidos || 0), 0)} sin leer
              </span>
            )}
          </div>
          {estudianteConversaciones.length === 0 ? (
            <p className={`text-xs ${M}`}>Sin conversaciones aún.</p>
          ) : (
            <>
              {estudianteConversaciones.slice(0, 3).map((c, i) => {
                const nombre = c.contraparte || c.nombre_empresa || c.nombre_estudiante || "Usuario";
                return (
                  <Link
                    key={c.id}
                    to="/estudiante/mensajeria"
                    state={{ conversacionId: c.id }}
                    className={`flex items-center gap-2.5 ${i < Math.min(estudianteConversaciones.length, 3) - 1 ? `pb-2.5 mb-2.5 border-b ${B}` : ""}`}
                  >
                    {c.contraparte_foto ? (
                      <img src={resolverMedia(c.contraparte_foto)} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#0F4D8A] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {nombre[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${T} truncate`}>{nombre}</p>
                      <p className={`text-xs ${M} truncate`}>{c.ultimo_mensaje || "Sin mensajes"}</p>
                    </div>
                    {c.no_leidos > 0 && (
                      <span className="text-xs bg-[#0F4D8A] text-white font-semibold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                        {c.no_leidos}
                      </span>
                    )}
                  </Link>
                );
              })}
              <Link to="/estudiante/mensajeria" className="block text-center mt-2 text-xs text-[#378ADD] hover:underline">
                Ver todos →
              </Link>
            </>
          )}
        </div>

        {/* Vacantes recomendadas del feed */}
        {(() => {
          const vacantes = publicaciones.filter((p) => p.tipo === "vacante" && p.vacante_activa).slice(0, 3);
          return vacantes.length === 0 ? null : (
            <div className={`rounded-xl border ${B} ${BG} p-4`}>
              <p className={`text-xs font-semibold ${T} mb-3`}>Vacantes en el muro</p>
              {vacantes.map((v, i) => (
                <div key={v.id} className={`flex items-center gap-2.5 ${i < vacantes.length - 1 ? `pb-2.5 mb-2.5 border-b ${B}` : ""}`}>
                  {v.autor_foto_perfil ? (
                    <img src={resolverMedia(v.autor_foto_perfil)} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="" />
                  ) : (
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                      {v.autor_nombre?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${T} truncate`}>{v.titulo || v.area || "Vacante"}</p>
                    <p className={`text-xs ${M} truncate`}>{v.autor_nombre}</p>
                    <span className={`text-xs font-medium ${v.vacante_tipo === "puesto_laboral" ? "text-green-600" : "text-orange-500"}`}>
                      {v.vacante_tipo === "puesto_laboral" ? "Puesto laboral" : "Práctica"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

      </div>}
    </div>
  );
}