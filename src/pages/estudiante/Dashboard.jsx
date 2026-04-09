import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Badge } from "../../components/ui";
import { getEstudianteById, getPublicaciones } from "../../services/api";
import CrearPublicacion from "../../components/CrearPublicacion";

const suggestions = [
  { company: "Banco Estado", role: "Práctica Adm. Finanzas", match: 88, initial: "B", color: "bg-red-500" },
  { company: "Entel", role: "Asistente Comercial", match: 80, initial: "E", color: "bg-[#185FA5]" },
  { company: "Sodexo Chile", role: "Gestión de Oficina", match: 74, initial: "S", color: "bg-green-600" },
];

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
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#E8E6E1]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";
  const HV = isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]";

  const inicial = pub.autor_nombre ? pub.autor_nombre.charAt(0).toUpperCase() : "?";
  const badge = TIPO_BADGE[pub.tipo] || { label: pub.tipo, color: "blue" };
  const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001";

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

      {pub.url_multimedia && (
        <div className="px-4 pb-3">
          <img
            src={`${BASE_URL}${pub.url_multimedia}`}
            alt="Multimedia"
            className="rounded-lg max-h-72 w-full object-cover border"
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
        <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex-1 justify-center ${HV} ${M}`}>
          <Icon icon="mdi:comment-outline" width={16} />
          Comentar
        </button>
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

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const [perfil, setPerfil] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);

  const cargarPublicaciones = () => {
    getPublicaciones().then(setPublicaciones).catch(console.error);
  };

  useEffect(() => {
    if (usuario.id) {
      getEstudianteById(usuario.id).then(setPerfil).catch(console.error);
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

  return (
    <div className={isEstudiante ? "grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] gap-5 items-start" : "max-w-2xl mx-auto w-full flex flex-col gap-4"}>

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
                <p className={`text-base font-semibold ${T}`}>3</p>
                <p className={`text-xs ${M}`}>Postulaciones</p>
              </div>
              <div className="text-center">
                <p className={`text-base font-semibold ${T}`}>7</p>
                <p className={`text-xs ${M}`}>Matches</p>
              </div>
              <div className="text-center">
                <p className={`text-base font-semibold ${T}`}>24</p>
                <p className={`text-xs ${M}`}>Visitas</p>
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

      {/* ── RIGHT SIDEBAR ── */}
      {isEstudiante && <div className="flex flex-col gap-4 sticky top-20">
        {/* Suggested practices */}
        <div className={`rounded-xl border ${B} ${BG} p-4`}>
          <p className={`text-xs font-semibold ${T} mb-3`}>Prácticas recomendadas</p>
          {suggestions.map((s, i) => (
            <div key={s.company} className={`flex items-center gap-3 ${i < suggestions.length - 1 ? `pb-3 mb-3 border-b ${B}` : ""}`}>
              <Avatar initial={s.initial} color={s.color} size="sm" />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${T} truncate`}>{s.company}</p>
                <p className={`text-xs ${M} truncate`}>{s.role}</p>
              </div>
              <button className="text-xs font-medium text-[#185FA5] hover:text-[#0C447C] border border-[#185FA5] hover:bg-[#E6F1FB] px-2 py-0.5 rounded-full transition-colors flex-shrink-0">
                Ver
              </button>
            </div>
          ))}
          <Link to="/estudiante/perfil" className="block text-center mt-1 text-xs text-[#378ADD] hover:underline">
            Ver todas →
          </Link>
        </div>

        {/* Badges */}
        <div className={`rounded-xl border ${B} ${BG} p-4`}>
          <p className={`text-xs font-semibold ${T} mb-3`}>Mis insignias</p>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: "solar:medal-ribbons-star-bold-duotone", label: "Perfil Destacado", color: "text-amber-500" },
              { icon: "mdi:check-decagram", label: "CV Verificado", color: "text-[#378ADD]" },
              { icon: "mdi:school", label: "4to semestre", color: "text-purple-500" },
            ].map((b) => (
              <div
                key={b.label}
                title={b.label}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border ${B} ${S} w-[72px]`}
              >
                <Icon icon={b.icon} width={22} className={b.color} />
                <span className={`text-[10px] text-center leading-tight ${M}`}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente compacta */}
        <div className={`rounded-xl border ${B} ${BG} p-4`}>
          <p className={`text-xs font-semibold ${T} mb-3`}>Esta semana</p>
          {[
            { icon: "mdi:eye-outline", label: "24 vistas al perfil", color: "text-[#378ADD]" },
            { icon: "fluent:handshake-32-regular", label: "7 matches activos", color: "text-green-500" },
            { icon: "mdi:send-check-outline", label: "3 postulaciones", color: "text-purple-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 mb-2 last:mb-0">
              <Icon icon={item.icon} width={14} className={`${item.color} flex-shrink-0`} />
              <span className={`text-xs ${M}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
}