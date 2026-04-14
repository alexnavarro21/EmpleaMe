import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { getNotificaciones, marcarNotificacionesLeidas } from "../services/api";

function getNotifLink(tipo, role) {
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
      postulacion_aceptada:  "/admin/monitoreo",
      postulacion_rechazada: "/admin/monitoreo",
      vacante_cerrada:       "/admin/monitoreo",
      practica_completada:   "/admin/monitoreo",
    },
  };
  return links[role]?.[tipo] || null;
}

const TIPO_CFG = {
  mensaje:               { icon: "mdi:message-outline",          color: "text-blue-500",   bg: "bg-blue-100"    },
  comentario:            { icon: "mdi:comment-account-outline",  color: "text-purple-500", bg: "bg-purple-100"  },
  postulacion_nueva:     { icon: "mdi:briefcase-plus-outline",   color: "text-teal-600",   bg: "bg-teal-100"    },
  postulacion_aceptada:  { icon: "mdi:briefcase-check-outline",  color: "text-green-600",  bg: "bg-green-100"   },
  postulacion_rechazada: { icon: "mdi:briefcase-remove-outline", color: "text-red-500",    bg: "bg-red-100"     },
  vacante_cerrada:       { icon: "mdi:close-circle-outline",     color: "text-orange-500", bg: "bg-orange-100"  },
  practica_completada:   { icon: "mdi:star-circle-outline",      color: "text-yellow-500", bg: "bg-yellow-100"  },
};

function tiempoRelativo(fecha) {
  const diff = Math.floor((Date.now() - new Date(fecha)) / 1000);
  if (diff < 60)    return "Ahora mismo";
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  const dias = Math.floor(diff / 86400);
  return dias < 30 ? `Hace ${dias} día${dias !== 1 ? "s" : ""}` : `Hace ${Math.floor(dias / 30)} mes${Math.floor(dias / 30) !== 1 ? "es" : ""}`;
}

export default function NotificacionesBell({ role }) {
  const { isDark } = useDark();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const historialPath = role === "empresa"
    ? "/empresa/notificaciones"
    : role === "admin"
    ? "/admin/notificaciones"
    : "/estudiante/notificaciones";

  // Click outside closes dropdown
  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Fetch unread count on mount + every 60s
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchCount() {
    try {
      const { noLeidas: n } = await getNotificaciones(1, 1);
      setNoLeidas(n);
    } catch (_) {}
  }

  async function handleOpen() {
    if (open) { setOpen(false); return; }
    setOpen(true);
    setLoading(true);
    try {
      const { notificaciones: rows, noLeidas: n } = await getNotificaciones(1, 8);
      setNotifs(rows);
      setNoLeidas(n);
    } catch (_) {} finally {
      setLoading(false);
    }
  }

  async function handleMarcarLeidas() {
    try {
      await marcarNotificacionesLeidas();
      setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch (_) {}
  }

  const T  = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";
  const HV = isDark ? "hover:bg-[#0F4D8A]/30" : "hover:bg-[#F0F4F8]";

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className={`relative p-1.5 rounded-lg transition-colors ${
          open
            ? "bg-[#0F4D8A] text-[#E6F1FB]"
            : "text-[#B5D4F4] hover:text-[#E6F1FB] hover:bg-[#0F4D8A]/40"
        }`}
        title="Notificaciones"
      >
        <Icon icon="mdi:bell-outline" width={22} />
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {noLeidas > 99 ? "99+" : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-xl border overflow-hidden z-50 ${BG} ${B}`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${B}`}>
            <span className={`text-sm font-semibold ${T}`}>
              Notificaciones
              {noLeidas > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-red-500 text-white font-bold">{noLeidas}</span>
              )}
            </span>
            {noLeidas > 0 && (
              <button
                onClick={handleMarcarLeidas}
                className="text-xs text-[#378ADD] hover:underline"
              >
                Marcar como leídas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className={`flex items-center justify-center py-8 gap-2 ${M} text-sm`}>
                <Icon icon="mdi:loading" width={18} className="animate-spin" />
                Cargando...
              </div>
            ) : notifs.length === 0 ? (
              <div className={`text-center py-8 ${M}`}>
                <Icon icon="mdi:bell-sleep-outline" width={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs">Sin notificaciones aún.</p>
              </div>
            ) : (
              notifs.map((n) => {
                const cfg  = TIPO_CFG[n.tipo] || { icon: "mdi:bell-outline", color: "text-blue-500", bg: "bg-blue-100" };
                const link = getNotifLink(n.tipo, role);
                return (
                  <div
                    key={n.id}
                    onClick={() => { if (link) { setOpen(false); navigate(link); } }}
                    className={`flex items-start gap-3 px-4 py-3 border-b ${B} last:border-0 transition-colors
                      ${!n.leida ? (isDark ? "bg-[#0F4D8A]/10" : "bg-[#EFF6FF]") : ""}
                      ${link ? (isDark ? "hover:bg-[#0F4D8A]/20 cursor-pointer" : "hover:bg-[#DBEAFE] cursor-pointer") : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon icon={cfg.icon} width={16} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-${n.leida ? "normal" : "semibold"} ${T} leading-snug`}>{n.titulo}</p>
                      {n.contenido && (
                        <p className={`text-xs ${M} mt-0.5 leading-snug line-clamp-2`}>{n.contenido}</p>
                      )}
                      <p className={`text-xs ${M} mt-1`}>{tiempoRelativo(n.creada_en)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {!n.leida && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />}
                      {link && <Icon icon="mdi:chevron-right" width={13} className={`${M} opacity-50`} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className={`border-t ${B} px-4 py-2.5`}>
            <Link
              to={historialPath}
              onClick={() => setOpen(false)}
              className="text-xs text-[#378ADD] hover:underline flex items-center gap-1"
            >
              Ver historial completo
              <Icon icon="mdi:arrow-right" width={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
