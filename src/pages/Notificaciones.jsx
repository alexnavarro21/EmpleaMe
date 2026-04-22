import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { PageHeader, Paginacion } from "../components/ui";
import { getNotificaciones, marcarNotificacionesLeidas } from "../services/api";

function getRoleFromPath(pathname) {
  if (pathname.startsWith("/admin"))    return "admin";
  if (pathname.startsWith("/empresa"))  return "empresa";
  return "estudiante";
}

function getNotifLink(tipo, role, referenciaId) {
  // Notificación de seguidor: navegar al perfil del usuario que te siguió
  if (tipo === "seguidor" && referenciaId) {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    // Necesitamos saber el rol del seguidor para armar el link correcto.
    // Como no lo tenemos, usamos la ruta de candidato (funciona para ambos roles
    // ya que PerfilCandidato soporta empresas y estudiantes).
    const prefix = role === "empresa" ? "empresa" : role === "admin" ? "admin" : "estudiante";
    return `/${prefix}/candidato/${referenciaId}`;
  }
  if (tipo === "seguidor") {
    // Sin referencia_id: ir a la página de seguidores
    return role === "empresa" ? "/empresa/seguidores" : "/estudiante/seguidores";
  }

  const links = {
    estudiante: {
      mensaje:               "/estudiante/mensajeria",
      comentario:            "/estudiante/dashboard",
      postulacion_aceptada:  "/estudiante/postulaciones",
      postulacion_rechazada: "/estudiante/postulaciones",
      vacante_cerrada:       "/estudiante/postulaciones",
      practica_completada:   "/estudiante/perfil",
      postulacion_nueva:     "/estudiante/buscar",
    },
    empresa: {
      mensaje:               "/empresa/mensajeria",
      comentario:            "/empresa/inicio",
      postulacion_nueva:     "/empresa/dashboard",
      postulacion_aceptada:  "/empresa/dashboard",
      postulacion_rechazada: "/empresa/dashboard",
      vacante_cerrada:       "/empresa/dashboard",
      practica_completada:   "/empresa/dashboard",
    },
    admin: {
      mensaje:               "/admin/mensajeria",
      comentario:            "/admin/inicio",
      postulacion_nueva:     "/admin/talleres",
      postulacion_aceptada:  "/admin/panel",
      postulacion_rechazada: "/admin/panel",
      vacante_cerrada:       "/admin/panel",
      practica_completada:   "/admin/panel",
    },
  };
  return links[role]?.[tipo] || null;
}

const TIPO_CFG = {
  mensaje:               { icon: "mdi:message-outline",          color: "text-blue-500",   colorDark: "text-blue-400",   bg: "bg-blue-100",    bgDark: "bg-blue-500/15",    label: "Mensaje"     },
  comentario:            { icon: "mdi:comment-account-outline",  color: "text-[#0F4D8A]",  colorDark: "text-[#378ADD]",  bg: "bg-[#E6F1FB]",   bgDark: "bg-[#0F4D8A]/15",   label: "Comentario"  },
  postulacion_nueva:     { icon: "mdi:briefcase-plus-outline",   color: "text-teal-600",   colorDark: "text-teal-400",   bg: "bg-teal-100",    bgDark: "bg-teal-500/15",    label: "Postulación" },
  postulacion_aceptada:  { icon: "mdi:briefcase-check-outline",  color: "text-green-600",  colorDark: "text-green-400",  bg: "bg-green-100",   bgDark: "bg-green-500/15",   label: "Aceptado"    },
  postulacion_rechazada: { icon: "mdi:briefcase-remove-outline", color: "text-red-500",    colorDark: "text-red-400",    bg: "bg-red-100",     bgDark: "bg-red-500/15",     label: "Rechazado"   },
  vacante_cerrada:       { icon: "mdi:close-circle-outline",     color: "text-orange-500", colorDark: "text-orange-400", bg: "bg-orange-100",  bgDark: "bg-orange-500/15",  label: "Vacante"     },
  practica_completada:   { icon: "mdi:star-circle-outline",      color: "text-yellow-500", colorDark: "text-yellow-400", bg: "bg-yellow-100",  bgDark: "bg-yellow-500/15",  label: "Completado"  },
  seguidor:              { icon: "mdi:account-plus-outline",     color: "text-sky-500",    colorDark: "text-sky-400",    bg: "bg-sky-100",     bgDark: "bg-sky-500/15",     label: "Seguidor"    },
};

const FILTROS = [
  { key: "todas",                label: "Todas"        },
  { key: "seguidor",             label: "Seguidores"   },
  { key: "mensaje",              label: "Mensajes"     },
  { key: "comentario",           label: "Comentarios"  },
  { key: "postulacion_aceptada", label: "Aceptadas"    },
  { key: "postulacion_rechazada",label: "Rechazadas"   },
  { key: "postulacion_nueva",    label: "Postulaciones"},
  { key: "practica_completada",  label: "Completadas"  },
];

function tiempoRelativo(fecha) {
  const diff = Math.floor((Date.now() - new Date(fecha)) / 1000);
  if (diff < 60)    return "Ahora mismo";
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  const dias = Math.floor(diff / 86400);
  return dias < 30 ? `Hace ${dias} día${dias !== 1 ? "s" : ""}` : `Hace ${Math.floor(dias / 30)} mes${Math.floor(dias / 30) !== 1 ? "es" : ""}`;
}

export default function Notificaciones() {
  const { isDark } = useDark();
  const navigate   = useNavigate();
  const location   = useLocation();
  const role       = getRoleFromPath(location.pathname);
  const T  = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";
  const S  = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const [todas, setTodas]       = useState([]);   // all loaded from backend
  const [noLeidas, setNoLeidas] = useState(0);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [filtro, setFiltro]     = useState("todas");
  const [pagina, setPagina]     = useState(1);
  const [porPagina, setPorPagina] = useState(9);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setLoading(true);
    try {
      // Load all at once (max 200) for client-side filtering + pagination
      const { notificaciones, total: t, noLeidas: n } = await getNotificaciones(1, 200);
      setTodas(notificaciones);
      setTotal(t);
      setNoLeidas(n);
    } catch (_) {} finally {
      setLoading(false);
    }
  }

  async function handleMarcarLeidas() {
    try {
      await marcarNotificacionesLeidas();
      setTodas((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch (_) {}
  }

  const filtradas   = filtro === "todas" ? todas : todas.filter((n) => n.tipo === filtro);
  const totalPags   = Math.ceil(filtradas.length / porPagina);
  const paginadas   = filtradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div>
      <PageHeader
        title="Historial de notificaciones"
        subtitle={`${total} notificación${total !== 1 ? "es" : ""} en total${noLeidas > 0 ? ` · ${noLeidas} sin leer` : ""}`}
        action={
          noLeidas > 0 ? (
            <button
              onClick={handleMarcarLeidas}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-[#378ADD] text-[#378ADD] hover:bg-[#378ADD]/10 transition-colors"
            >
              <Icon icon="mdi:check-all" width={16} />
              Marcar todas como leídas
            </button>
          ) : null
        }
      />

      {/* Filtros */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTROS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setFiltro(key); setPagina(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filtro === key
                ? "bg-[#0F4D8A] text-[#E6F1FB] border-[#0F4D8A]"
                : `${B} ${M} hover:border-[#378ADD] hover:text-[#378ADD]`
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={`flex items-center justify-center py-24 gap-2 ${M}`}>
          <Icon icon="mdi:loading" width={24} className="animate-spin" />
          Cargando...
        </div>
      ) : filtradas.length === 0 ? (
        <div className={`rounded-xl border ${B} ${BG} p-16 text-center`}>
          <Icon icon="mdi:bell-sleep-outline" width={44} className={`mx-auto mb-3 ${M}`} />
          <p className={`text-sm font-medium ${T}`}>
            {filtro === "todas" ? "Sin notificaciones aún." : "Sin notificaciones de este tipo."}
          </p>
        </div>
      ) : (
        <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
          {paginadas.map((n, i) => {
            const cfg  = TIPO_CFG[n.tipo] || { icon: "mdi:bell-outline", color: "text-blue-500", colorDark: "text-blue-400", bg: "bg-blue-100", bgDark: "bg-blue-500/15", label: n.tipo };
            const cfgBg    = isDark ? cfg.bgDark    : cfg.bg;
            const cfgColor = isDark ? cfg.colorDark : cfg.color;
            const link = getNotifLink(n.tipo, role, n.referencia_id);
            return (
              <div
                key={n.id}
                onClick={() => link && navigate(link)}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                  i < paginadas.length - 1 ? `border-b ${B}` : ""
                } ${!n.leida ? (isDark ? "bg-[#0F4D8A]/10" : "bg-[#EFF6FF]") : (isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]")}
                ${link ? "cursor-pointer" : ""}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfgBg}`}>
                  <Icon icon={cfg.icon} width={20} className={cfgColor} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${n.leida ? "" : "font-semibold"} ${T} leading-snug`}>
                      {n.titulo}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${S} ${M}`}>{cfg.label}</span>
                      {!n.leida && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                    </div>
                  </div>
                  {n.contenido && (
                    <p className={`text-xs ${M} mt-0.5 leading-relaxed`}>{n.contenido}</p>
                  )}
                  <div className="flex items-center justify-between mt-1.5">
                    <p className={`text-xs ${M}`}>{tiempoRelativo(n.creada_en)}</p>
                    {link && (
                      <span className="text-xs text-[#378ADD] flex items-center gap-0.5 opacity-70">
                        Ver <Icon icon="mdi:arrow-right" width={12} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtradas.length > 0 && (
        <Paginacion
          paginaActual={pagina}
          totalPaginas={totalPags}
          onCambiar={setPagina}
          porPagina={porPagina}
          opciones={[3, 6, 9]}
          onCambiarPorPagina={(n) => { setPorPagina(n); setPagina(1); }}
        />
      )}
    </div>
  );
}
