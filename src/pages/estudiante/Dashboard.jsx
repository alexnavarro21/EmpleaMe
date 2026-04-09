import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Badge } from "../../components/ui";
import { getEstudianteById, getPublicaciones, postularAVacante, getEmpresaById, getVacantesEmpresa, getPostulantesEmpresa, getConversaciones, getPostulacionesEstudiante } from "../../services/api";
import CrearPublicacion from "../../components/CrearPublicacion";
import VerMasModal from "../../components/VerMasModal";

const AVATAR_COLORS = ["bg-[#185FA5]", "bg-red-500", "bg-green-600", "bg-purple-600", "bg-amber-500"];

const BASE_URL_GLOBAL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001";
function resolverMedia(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${BASE_URL_GLOBAL}${url}`;
  return `${BASE_URL_GLOBAL}/uploads/${url}`;
}

function Avatar({ initial, color, size = "md" }) {
  const s = size === "lg" ? "w-14 h-14 text-xl" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
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

function FeedCard({ pub, isDark }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [verMas, setVerMas] = useState(false);
  const [estadoPostula, setEstadoPostula] = useState("idle"); // idle | loading | ok | duplicado | error
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

  return (
    <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#185FA5] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {inicial}
          </div>
          <div>
            <p className={`text-sm font-semibold leading-tight ${T}`}>{pub.autor_nombre}</p>
            <p className={`text-xs ${M}`}>{tiempoRelativo(pub.publicado_en)}</p>
          </div>
        </div>
        <Badge color={badge.color}>{badge.label}</Badge>
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

      {pub.url_multimedia && (
        <div className="px-4 pb-3">
          <img
            src={resolverMedia(pub.url_multimedia)}
            alt="Multimedia"
            className="rounded-lg max-h-72 w-full object-cover border"
            onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
          />
        </div>
      )}

      <div className={`border-t ${B}`} />
      <div className="flex items-center px-2 py-1">
        <button
          onClick={() => { setLiked((l) => !l); setLikes((n) => liked ? n - 1 : n + 1); }}
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
          <button
            onClick={handlePostular}
            disabled={estadoPostula !== "idle" || !pub.vacante_activa}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex-1 justify-center ${
              estadoPostula === "ok"        ? "text-green-600" :
              estadoPostula === "duplicado" ? "text-amber-500" :
              estadoPostula === "error"     ? "text-red-500"   :
              estadoPostula === "loading"   ? M                : M
            } ${estadoPostula === "idle" ? HV : ""}`}
          >
            <Icon
              icon={
                estadoPostula === "ok"        ? "mdi:check-circle-outline" :
                estadoPostula === "duplicado" ? "mdi:information-outline"  :
                estadoPostula === "error"     ? "mdi:alert-circle-outline" :
                estadoPostula === "loading"   ? "mdi:loading"              : "mdi:send-outline"
              }
              width={16}
              className={estadoPostula === "loading" ? "animate-spin" : ""}
            />
            {estadoPostula === "ok"        ? "Postulado" :
             estadoPostula === "duplicado" ? "Ya postulaste" :
             estadoPostula === "error"     ? "Error, reintentar" :
             estadoPostula === "loading"   ? "Enviando..." :
             !pub.vacante_activa           ? "Cerrada" : "Postular"}
          </button>
        )}
      </div>

      {verMas && <VerMasModal pub={pub} onClose={() => setVerMas(false)} />}
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

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const [perfil, setPerfil] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);

  // Estado estudiante extra
  const [estudiantePostulaciones, setEstudiantePostulaciones] = useState([]);
  const [estudianteConversaciones, setEstudianteConversaciones] = useState([]);

  // Estado empresa
  const [empresaPerfil, setEmpresaPerfil] = useState(null);
  const [empresaVacantes, setEmpresaVacantes] = useState([]);
  const [empresaPostulantes, setEmpresaPostulantes] = useState([]);
  const [empresaConversaciones, setEmpresaConversaciones] = useState([]);

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
    cargarPublicaciones();
  }, [usuario.id]);

  const nombre = perfil?.nombre_completo || "";
  const carrera = perfil?.carrera || "";
  const semestre = perfil?.semestre || "";
  const telefono = perfil?.telefono || "";
  const biografia = perfil?.biografia || "";
  const promedio = perfil?.promedio || "";
  const habilidades = perfil?.habilidades || [];

  const nombreCarrera = careerDisplay[carrera] || carrera;
  const inicial = nombre ? nombre.charAt(0).toUpperCase() : "?";
  const subtitleParts = [nombreCarrera, semestre ? `${semestre}° semestre` : ""].filter(Boolean);

  const pctCompleto = Math.round(
    [nombre, carrera, telefono, biografia, semestre ? String(semestre) : "", promedio ? String(promedio) : ""]
      .filter(Boolean).length / 6 * 100
  );

  const profileSteps = [
    { done: !!(nombre && telefono), label: "Datos personales" },
    { done: !!(carrera && semestre), label: "Info académica" },
    { done: false, label: "CV subido" },
    { done: false, label: "Video de presentación" },
    { done: false, label: "Subir evidencias" },
    { done: habilidades.length > 0, label: "Habilidades completas" },
  ];

  const conSidebar = isEstudiante || isEmpresa;
  const vacantesActivasEmpresa = empresaVacantes.filter((v) => v.esta_activa);
  const mensajesNoLeidos = empresaConversaciones.filter((c) => c.no_leidos > 0);

  return (
    <div className={conSidebar ? "grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] gap-5 items-start" : "max-w-2xl mx-auto w-full flex flex-col gap-4"}>

      {/* ── LEFT SIDEBAR EMPRESA ── */}
      {isEmpresa && (
        <div className="flex flex-col gap-4 sticky top-20">
          {/* Tarjeta empresa */}
          <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
            <div className="h-16 bg-gradient-to-r from-[#0C447C] to-[#378ADD]" />
            <div className="px-4 pb-4">
              <div className="-mt-7 mb-3">
                <div className="w-14 h-14 rounded-full bg-[#185FA5] flex items-center justify-center text-white text-xl font-bold border-2 border-white">
                  {(empresaPerfil?.nombre_empresa || usuario.nombre_empresa || "E")[0].toUpperCase()}
                </div>
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
                className="block text-center mt-3 text-xs font-medium text-[#185FA5] hover:text-[#0C447C] border border-[#185FA5] hover:bg-[#E6F1FB] py-1.5 rounded-lg transition-colors"
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

      {/* ── LEFT SIDEBAR ── */}
      {isEstudiante && <div className="flex flex-col gap-4 sticky top-20">
        {/* Profile card */}
        <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
          {/* Banner */}
          <div className="h-16 bg-gradient-to-r from-[#0C447C] to-[#378ADD]" />
          <div className="px-4 pb-4">
            <div className="-mt-7 mb-3">
              <Avatar initial={inicial} color="bg-[#185FA5]" size="lg" />
            </div>
            <p className={`text-sm font-semibold ${T}`}>{nombre || "Sin nombre"}</p>
            <p className={`text-xs ${M} mt-0.5`}>{subtitleParts.join(" · ") || "Sin carrera"}</p>
            <p className={`text-xs ${M}`}>C.E. Cardenal J.M. Caro</p>

            <div className={`flex gap-4 mt-3 pt-3 border-t ${B}`}>
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
              className="block text-center mt-3 text-xs font-medium text-[#185FA5] hover:text-[#0C447C] border border-[#185FA5] hover:bg-[#E6F1FB] py-1.5 rounded-lg transition-colors"
            >
              Ver mi perfil
            </Link>
          </div>
        </div>

        {/* Completitud */}
        <div className={`rounded-xl border ${B} ${BG} p-4`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-xs font-semibold ${T}`}>Completitud del perfil</p>
            <span className="text-xs font-semibold text-[#378ADD]">{pctCompleto}%</span>
          </div>
          <div className={`w-full h-1.5 rounded-full ${S} mb-3`}>
            <div className="h-1.5 bg-[#378ADD] rounded-full" style={{ width: `${pctCompleto}%` }} />
          </div>
          <ul className={`flex flex-col gap-2 text-xs ${M}`}>
            {profileSteps.map((s) => (
              <li key={s.label} className="flex items-center gap-2">
                <Icon
                  icon={s.done ? "mdi:check-circle" : "mdi:circle-outline"}
                  width={13}
                  className={s.done ? "text-green-500 flex-shrink-0" : `flex-shrink-0 ${isDark ? "text-[#3a3a38]" : "text-[#D3D1C7]"}`}
                />
                <span className={s.done ? "line-through opacity-60" : ""}>{s.label}</span>
              </li>
            ))}
          </ul>
          <Link to="/estudiante/perfil" className="block text-center mt-3 text-xs text-[#378ADD] hover:underline">
            Completar perfil →
          </Link>
        </div>

        {/* Quick links */}
        <div className={`rounded-xl border ${B} ${BG} p-4`}>
          <p className={`text-xs font-semibold ${T} mb-2`}>Accesos rápidos</p>
          {[
            { icon: "mdi:file-account-outline", label: "Mi CV", to: "/estudiante/perfil" },
            { icon: "mdi:folder-multiple-outline", label: "Mis Evidencias", to: "/estudiante/evidencias" },
            { icon: "mdi:bookmark-multiple-outline", label: "Guardados", to: "/estudiante/dashboard" },
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
        <CrearPublicacion onPublicado={cargarPublicaciones} />

        {publicaciones.length === 0 ? (
          <div className={`rounded-xl border ${B} ${BG} p-10 text-center ${M}`}>
            <Icon icon="mdi:newspaper-variant-outline" width={40} className="mx-auto mb-3 opacity-40" />
            <p className={`text-sm font-medium ${T}`}>Aún no hay publicaciones</p>
            <p className="text-xs mt-1">¡Sé el primero en compartir algo!</p>
          </div>
        ) : (
          publicaciones.map((pub) => (
            <FeedCard key={pub.id} pub={pub} isDark={isDark} />
          ))
        )}
      </div>

      {/* ── RIGHT SIDEBAR EMPRESA ── */}
      {isEmpresa && (
        <div className="flex flex-col gap-4 sticky top-20">

          {/* Mensajes no leídos */}
          <div className={`rounded-xl border ${B} ${BG} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-xs font-semibold ${T}`}>Mensajes</p>
              {mensajesNoLeidos.length > 0 && (
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                  {mensajesNoLeidos.length} sin leer
                </span>
              )}
            </div>
            {empresaConversaciones.length === 0 ? (
              <p className={`text-xs ${M}`}>Sin conversaciones aún.</p>
            ) : (
              <>
                {empresaConversaciones.slice(0, 4).map((c, i) => {
                  const nombre = c.nombre_estudiante || c.nombre_empresa || "Usuario";
                  return (
                    <Link
                      key={c.id}
                      to="/empresa/mensajeria"
                      state={{ conversacionId: c.id }}
                      className={`flex items-center gap-2.5 ${i < Math.min(empresaConversaciones.length, 4) - 1 ? `pb-2.5 mb-2.5 border-b ${B}` : ""}`}
                    >
                      <div className="w-7 h-7 rounded-full bg-[#185FA5] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {nombre[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${T} truncate`}>{nombre}</p>
                        <p className={`text-xs ${M} truncate`}>{c.ultimo_mensaje || "Sin mensajes"}</p>
                      </div>
                      {c.no_leidos > 0 && (
                        <span className="text-xs bg-[#185FA5] text-white font-semibold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
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
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 bg-[#185FA5]`}>
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

      {/* ── RIGHT SIDEBAR ESTUDIANTE ── */}
      {isEstudiante && <div className="flex flex-col gap-4 sticky top-20">

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
              {estudiantePostulaciones.slice(0, 4).map((p, i) => {
                const cfg = {
                  pendiente:  { label: "Pendiente", color: "text-blue-500",  icon: "mdi:clock-outline"          },
                  aceptado:   { label: "Aceptado",  color: "text-green-600", icon: "mdi:check-circle-outline"   },
                  rechazado:  { label: "Rechazado", color: "text-red-500",   icon: "mdi:close-circle-outline"   },
                }[p.estado] || { label: p.estado, color: M, icon: "mdi:help-circle-outline" };
                return (
                  <div key={p.id} className={`flex items-start gap-2 ${i < Math.min(estudiantePostulaciones.length, 4) - 1 ? `pb-2.5 mb-2.5 border-b ${B}` : ""}`}>
                    <Icon icon={cfg.icon} width={14} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${T} truncate`}>{p.titulo}</p>
                      <p className={`text-xs ${M} truncate`}>{p.nombre_empresa}</p>
                      <p className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</p>
                    </div>
                  </div>
                );
              })}
              {estudiantePostulaciones.length > 4 && (
                <p className={`text-xs ${M} text-center mt-2`}>+{estudiantePostulaciones.length - 4} más</p>
              )}
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
                const nombre = c.nombre_empresa || c.nombre_estudiante || "Usuario";
                return (
                  <Link
                    key={c.id}
                    to="/estudiante/mensajeria"
                    state={{ conversacionId: c.id }}
                    className={`flex items-center gap-2.5 ${i < Math.min(estudianteConversaciones.length, 3) - 1 ? `pb-2.5 mb-2.5 border-b ${B}` : ""}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#185FA5] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {nombre[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${T} truncate`}>{nombre}</p>
                      <p className={`text-xs ${M} truncate`}>{c.ultimo_mensaje || "Sin mensajes"}</p>
                    </div>
                    {c.no_leidos > 0 && (
                      <span className="text-xs bg-[#185FA5] text-white font-semibold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
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
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {v.autor_nombre?.[0]?.toUpperCase() || "?"}
                  </div>
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