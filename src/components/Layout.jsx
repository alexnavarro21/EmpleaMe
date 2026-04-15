import { Link, Outlet, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { useState, useRef, useEffect } from "react";
import NotificacionesBell from "./NotificacionesBell";

const profilePaths = {
  estudiante: "/estudiante/perfil",
  empresa: "/empresa/perfil",
};

const navLinks = {
  estudiante: [
    { to: "/estudiante/dashboard", label: "Inicio" },
    { to: "/estudiante/buscar", label: "Búsqueda" },
  ],
  empresa: [
    { to: "/empresa/inicio", label: "Inicio" },
    { to: "/empresa/dashboard", label: "Panel" },
    { to: "/empresa/publicar", label: "Publicar Vacante" },
    { to: "/empresa/buscar", label: "Búsqueda" },
  ],
  admin: [
    { to: "/admin/inicio", label: "Inicio" },
    { to: "/admin/panel", label: "Panel" },
    { to: "/admin/usuarios", label: "Usuarios" },
    { to: "/admin/evaluaciones", label: "Gestión de Estudiantes" },
    { to: "/admin/talleres", label: "Talleres" },
    { to: "/admin/buscar", label: "Búsqueda" },
  ],
};

const homePaths = {
  estudiante: "/estudiante/dashboard",
  empresa: "/empresa/inicio",
  admin: "/admin/inicio",
};

const messagingPaths = {
  estudiante: "/estudiante/mensajeria",
  empresa: "/empresa/mensajeria",
  admin: "/admin/mensajeria",
};

const notifPaths = {
  estudiante: "/estudiante/notificaciones",
  empresa: "/empresa/notificaciones",
  admin: "/admin/notificaciones",
};

export default function Layout() {
  const { isDark, setIsDark, isContrast, setTheme } = useDark();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const BASE_ORIGIN = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001";
  const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const role = usuario.rol === "centro"
    ? "admin"
    : usuario.rol === "empresa"
    ? "empresa"
    : "estudiante";
  const usuarioId = usuario.id;

  const [fotoPerfil, setFotoPerfil] = useState(() => {
    const raw = localStorage.getItem(`foto_perfil_${usuarioId}`) || "";
    return raw ? (raw.startsWith("http") ? raw : `${BASE_ORIGIN}${raw}`) : null;
  });

  useEffect(() => {
    if (!usuarioId || role === "admin") return;
    const endpoint = role === "empresa"
      ? `${BASE_API}/perfiles/empresa/${usuarioId}`
      : `${BASE_API}/perfiles/estudiante/${usuarioId}`;
    fetch(endpoint, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then((r) => r.json())
      .then((data) => {
        const raw = data.foto_perfil || "";
        localStorage.setItem(`foto_perfil_${usuarioId}`, raw);
        setFotoPerfil(raw ? (raw.startsWith("http") ? raw : `${BASE_ORIGIN}${raw}`) : null);
      })
      .catch(() => {});
  }, [usuarioId, role]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div className={isDark ? "dark" : isContrast ? "colorblind-mode" : ""}>
      <div className={`min-h-screen font-sans ${
        isContrast ? "bg-[#FFF9E8]" : isDark ? "bg-[#1e1e1c]" : "bg-[#F0F4F8]"
      }`}>

        {/* Navbar */}
        <nav className="bg-[#0A3A6A] h-14 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-6">
            <Link to={homePaths[role]} className="flex items-center gap-2 flex-shrink-0">
              <img src="/empleame-icono.svg" alt="EmpleaMe" className="h-7 w-7" />
              <span className="text-lg font-semibold text-[#E6F1FB] tracking-tight">
                Emplea<span className="text-[#85B7EB]">Me</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks[role].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    location.pathname === link.to
                      ? "bg-[#0F4D8A] text-[#E6F1FB] font-medium"
                      : "text-[#B5D4F4] hover:text-[#E6F1FB] hover:bg-[#0F4D8A]/40"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Campana + mensajes + perfil (derecha) */}
          <div className="flex items-center gap-1">
          <Link
            to={messagingPaths[role]}
            className={`p-1.5 rounded-lg transition-colors text-[#B5D4F4] hover:text-[#E6F1FB] hover:bg-[#0F4D8A]/40`}
            title="Mensajes"
          >
            <Icon icon="mdi:message-outline" width={22} />
          </Link>
          <NotificacionesBell role={role} />

          {/* Botón de perfil con popup */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`relative p-1.5 rounded-lg transition-colors ${
                menuOpen
                  ? "bg-[#0F4D8A] text-[#E6F1FB]"
                  : "text-[#B5D4F4] hover:text-[#E6F1FB] hover:bg-[#0F4D8A]/40"
              }`}
            >
              {fotoPerfil
                ? <img src={fotoPerfil} className="w-7 h-7 rounded-full object-cover" alt="" />
                : <Icon icon="mynaui:user-solid" width={22} />
              }
            </button>

            {menuOpen && (
              <div className={`absolute right-0 mt-2 w-52 rounded-xl shadow-lg border overflow-hidden z-50 ${
                isDark ? "bg-[#262624] border-[#3a3a38]" : "bg-white border-[#D3D1C7]"
              }`}>

                {/* Mi perfil */}
                {profilePaths[role] && (
                  <Link
                    to={profilePaths[role]}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      isDark
                        ? "text-[#D3D1C7] hover:bg-[#0F4D8A]/30"
                        : "text-[#2C2C2A] hover:bg-[#F0F4F8]"
                    }`}
                  >
                    <Icon icon="mynaui:user-solid" width={18} className="text-[#378ADD]" />
                    Mi perfil
                  </Link>
                )}

                {/* Mis postulaciones (solo estudiante) */}
                {role === "estudiante" && (
                  <Link
                    to="/estudiante/postulaciones"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      isDark
                        ? "text-[#D3D1C7] hover:bg-[#0F4D8A]/30"
                        : "text-[#2C2C2A] hover:bg-[#F0F4F8]"
                    }`}
                  >
                    <Icon icon="mdi:clipboard-list-outline" width={18} className="text-[#378ADD]" />
                    Mis postulaciones
                  </Link>
                )}

                {/* Mensajes */}
                <Link
                  to={messagingPaths[role]}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isDark
                      ? "text-[#D3D1C7] hover:bg-[#0F4D8A]/30"
                      : "text-[#2C2C2A] hover:bg-[#F0F4F8]"
                  }`}
                >
                  <Icon icon="mdi:message-outline" width={18} className="text-[#378ADD]" />
                  Mensajes
                </Link>

                {/* Notificaciones */}
                <Link
                  to={notifPaths[role]}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isDark
                      ? "text-[#D3D1C7] hover:bg-[#0F4D8A]/30"
                      : "text-[#2C2C2A] hover:bg-[#F0F4F8]"
                  }`}
                >
                  <Icon icon="mdi:bell-outline" width={18} className="text-[#378ADD]" />
                  Mis notificaciones
                </Link>

                {/* Separador */}
                <div className={`mx-3 border-t ${isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]"}`} />

                {/* Modo oscuro/claro */}
                <div className={`flex items-center justify-between px-4 py-3 text-sm ${
                  isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]"
                }`}>
                  <div className="flex items-center gap-3">
                    <Icon
                      icon={isDark ? "ph:moon-fill" : "ph:sun-fill"}
                      width={18}
                      className={isDark ? "text-[#85B7EB]" : "text-yellow-400"}
                    />
                    {isDark ? "Modo oscuro" : "Modo claro"}
                  </div>
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className={`w-8 h-[18px] rounded-full relative transition-colors duration-200 flex-shrink-0 ${
                      isDark ? "bg-[#378ADD]" : "bg-[#D3D1C7]"
                    }`}
                  >
                    <span
                      className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all duration-200 ${
                        isDark ? "left-[16px]" : "left-[2px]"
                      }`}
                    />
                  </button>
                </div>

                {/* Modo alto contraste (daltónico) */}
                <div className={`flex items-center justify-between px-4 py-3 text-sm ${
                  isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]"
                }`}>
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="ph:eye-fill"
                      width={18}
                      className={isContrast ? "text-[#C45E00]" : isDark ? "text-[#888780]" : "text-[#5F5E5A]"}
                    />
                    Alto contraste
                  </div>
                  <button
                    onClick={() => setTheme(isContrast ? (isDark ? "dark" : "light") : "colorblind")}
                    className={`w-8 h-[18px] rounded-full relative transition-colors duration-200 flex-shrink-0 ${
                      isContrast ? "bg-[#C45E00]" : isDark ? "bg-[#3a3a38]" : "bg-[#D3D1C7]"
                    }`}
                  >
                    <span
                      className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all duration-200 ${
                        isContrast ? "left-[16px]" : "left-[2px]"
                      }`}
                    />
                  </button>
                </div>

                {/* Separador */}
                <div className={`mx-3 border-t ${isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]"}`} />

                {/* Cerrar sesión */}
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Icon icon="ph:sign-out-bold" width={18} />
                  Cerrar sesión
                </Link>
              </div>
            )}
          </div>
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
