import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { useState, useRef, useEffect } from "react";
import NotificacionesBell from "./NotificacionesBell";

const profilePaths = {
  estudiante: "/estudiante/perfil",
  empresa: "/empresa/perfil",
  admin: "/admin/perfil",
  slep: null,
};

const navLinks = {
  estudiante: [
    { to: "/estudiante/dashboard", label: "Inicio" },
  ],
  empresa: [
    { to: "/empresa/inicio", label: "Inicio" },
    { to: "/empresa/dashboard", label: "Panel" },
    { to: "/empresa/publicar", label: "Publicar Vacante" },
  ],
  admin: [
    { to: "/admin/inicio", label: "Inicio" },
    { to: "/admin/panel", label: "Panel" },
    { to: "/admin/usuarios", label: "Usuarios" },
    { to: "/admin/evaluaciones", label: "Gestión de Estudiantes" },
    { to: "/admin/talleres", label: "Talleres" },
  ],
  slep: [
    { to: "/slep/inicio",      label: "Inicio" },
    { to: "/slep/panel",       label: "Panel" },
    { to: "/slep/empresas",    label: "Empresas" },
    { to: "/slep/colegios",    label: "Colegios" },
    { to: "/slep/reportes",    label: "Reportes" },
    { to: "/slep/mensajeria",  label: "Mensajería" },
  ],
};

const homePaths = {
  estudiante: "/estudiante/dashboard",
  empresa: "/empresa/inicio",
  admin: "/admin/inicio",
  slep: "/slep/inicio",
};

const messagingPaths = {
  estudiante: "/estudiante/mensajeria",
  empresa: "/empresa/mensajeria",
  admin: "/admin/mensajeria",
  slep: "/slep/mensajeria",
};

const notifPaths = {
  estudiante: "/estudiante/notificaciones",
  empresa: "/empresa/notificaciones",
  admin: "/admin/notificaciones",
  slep: "/slep/notificaciones",
};

const buscarPaths = {
  estudiante: "/estudiante/buscar",
  empresa: "/empresa/buscar",
  admin: "/admin/buscar",
  slep: "/slep/buscar",
};

const seguidoresPaths = {
  estudiante: "/estudiante/seguidores",
  empresa: "/empresa/seguidores",
};

const SUGGEST_ICONS = {
  estudiantes: "mynaui:user-solid",
  empresas: "mdi:office-building-outline",
  vacantes: "mdi:briefcase-outline",
  talleres: "mdi:school-outline",
};

const SUGGEST_LABELS = {
  estudiantes: "Estudiantes",
  empresas: "Empresas",
  vacantes: "Vacantes",
  talleres: "Talleres",
};

export default function Layout() {
  const { isDark, setIsDark, isContrast, setTheme } = useDark();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const BASE_ORIGIN = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001";
  const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const role = usuario.rol === "colegio"
    ? "admin"
    : usuario.rol === "slep"
    ? "slep"
    : usuario.rol === "empresa"
    ? "empresa"
    : "estudiante";
  const usuarioId = usuario.id;

  const [fotoPerfil, setFotoPerfil] = useState(() => {
    const raw = localStorage.getItem(`foto_perfil_${usuarioId}`) || "";
    return raw ? (raw.startsWith("http") ? raw : `${BASE_ORIGIN}${raw}`) : null;
  });

  // Search bar state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState({ estudiantes: [], empresas: [], vacantes: [], talleres: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!usuarioId || role === "slep") return;
    const endpoint = role === "empresa"
      ? `${BASE_API}/perfiles/empresa/${usuarioId}`
      : role === "admin"
      ? `${BASE_API}/perfiles/colegio/${usuarioId}`
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
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSuggestions({ estudiantes: [], empresas: [], vacantes: [], talleres: [] });
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(true);
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${BASE_API}/buscar/sugerencias?q=${encodeURIComponent(val.trim())}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const data = await res.json();
        setSuggestions(data);
      } catch {
        // silent
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    navigate(`${buscarPaths[role]}?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
  };

  const handleSuggestionClick = (categoria, item) => {
    setShowSuggestions(false);
    setSearchQuery("");
    navigate(`${buscarPaths[role]}?q=${encodeURIComponent(item.nombre)}&cat=${categoria}`);
  };

  const hasSuggestions = Object.values(suggestions).some((arr) => arr.length > 0);

  const dropdownItemCls = `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
    isDark ? "text-[#D3D1C7] hover:bg-[#0F4D8A]/30" : "text-[#2C2C2A] hover:bg-[#F0F4F8]"
  }`;

  return (
    <div className={isDark ? "dark" : isContrast ? "colorblind-mode" : ""}>
      <div className={`min-h-screen font-sans ${
        isContrast ? "bg-[#FFF9E8]" : isDark ? "bg-[#1e1e1c]" : "bg-[#F0F4F8]"
      }`}>

        {/* Navbar */}
        <nav className="bg-[#0A3A6A] h-14 flex items-center px-6 sticky top-0 z-50 shadow-sm gap-4">

          {/* Izquierda: Logo + links */}
          <div className="flex items-center gap-6 flex-1 min-w-0">
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

          {/* Centro: Barra de búsqueda */}
          <div className="flex-shrink-0" ref={searchRef}>
            <div className="relative">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Icon
                    icon={searchLoading ? "mdi:loading" : "mdi:magnify"}
                    width={16}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85B7EB] pointer-events-none ${searchLoading ? "animate-spin" : ""}`}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => { if (searchQuery.trim() && hasSuggestions) setShowSuggestions(true); }}
                    placeholder="Buscar estudiantes, empresas..."
                    className="w-64 pl-9 pr-4 py-1.5 rounded-full text-sm bg-[#0F4D8A]/50 border border-[#1a5fa8] text-[#E6F1FB] placeholder-[#85B7EB] outline-none focus:w-80 focus:bg-[#0F4D8A]/80 focus:border-[#378ADD] transition-all duration-200"
                  />
                </div>
              </form>

              {/* Dropdown sugerencias */}
              {showSuggestions && (
                <div className={`absolute top-full mt-2 right-0 w-72 rounded-xl shadow-xl border overflow-hidden z-50 ${
                  isDark ? "bg-[#262624] border-[#3a3a38]" : "bg-white border-[#D3D1C7]"
                }`}>
                  {!hasSuggestions && !searchLoading ? (
                    <div className={`px-4 py-3 text-xs ${isDark ? "text-[#888780]" : "text-[#5F5E5A]"}`}>
                      Sin resultados para "{searchQuery}"
                    </div>
                  ) : (
                    <>
                      {["estudiantes", "empresas", "vacantes", "talleres"].map((cat) => {
                        const items = suggestions[cat] || [];
                        if (items.length === 0) return null;
                        return (
                          <div key={cat}>
                            <div className={`px-4 py-1.5 flex items-center gap-2 ${isDark ? "bg-[#313130]" : "bg-[#F7F6F3]"}`}>
                              <Icon icon={SUGGEST_ICONS[cat]} width={12} className="text-[#378ADD]" />
                              <span className={`text-xs font-medium ${isDark ? "text-[#888780]" : "text-[#5F5E5A]"}`}>
                                {SUGGEST_LABELS[cat]}
                              </span>
                            </div>
                            {items.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleSuggestionClick(cat, item)}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                                  isDark
                                    ? "text-[#D3D1C7] hover:bg-[#0F4D8A]/30"
                                    : "text-[#2C2C2A] hover:bg-[#EFF6FF]"
                                }`}
                              >
                                <Icon icon={SUGGEST_ICONS[cat]} width={14} className={isDark ? "text-[#888780]" : "text-[#5F5E5A]"} />
                                <span className="truncate flex-1">{item.nombre}</span>
                                {item.carrera && <span className={`text-xs flex-shrink-0 ${isDark ? "text-[#888780]" : "text-[#5F5E5A]"}`}>{item.carrera}</span>}
                                {item.empresa && <span className={`text-xs flex-shrink-0 ${isDark ? "text-[#888780]" : "text-[#5F5E5A]"}`}>{item.empresa}</span>}
                              </button>
                            ))}
                          </div>
                        );
                      })}
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full text-left px-4 py-2.5 text-xs text-[#378ADD] hover:bg-[#0F4D8A]/10 transition-colors flex items-center gap-2 border-t border-[#3a3a38]/30"
                      >
                        <Icon icon="mdi:magnify" width={14} />
                        Ver todos los resultados para "{searchQuery}"
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Derecha: íconos */}
          <div className="flex items-center gap-1 flex-1 justify-end">
            <Link
              to={messagingPaths[role]}
              className="p-1.5 rounded-lg transition-colors text-[#B5D4F4] hover:text-[#E6F1FB] hover:bg-[#0F4D8A]/40"
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
                    <Link to={profilePaths[role]} onClick={() => setMenuOpen(false)} className={dropdownItemCls}>
                      <Icon icon="mynaui:user-solid" width={18} className="text-[#378ADD]" />
                      Mi perfil
                    </Link>
                  )}

                  {/* Mis postulaciones (solo estudiante) */}
                  {role === "estudiante" && (
                    <Link to="/estudiante/postulaciones" onClick={() => setMenuOpen(false)} className={dropdownItemCls}>
                      <Icon icon="mdi:clipboard-list-outline" width={18} className="text-[#378ADD]" />
                      Mis postulaciones
                    </Link>
                  )}

                  {/* Seguidores (estudiante y empresa) */}
                  {seguidoresPaths[role] && (
                    <Link to={seguidoresPaths[role]} onClick={() => setMenuOpen(false)} className={dropdownItemCls}>
                      <Icon icon="mdi:account-group-outline" width={18} className="text-[#378ADD]" />
                      Seguidores
                    </Link>
                  )}

                  {/* Reportes (solo admin/colegio) */}
                  {role === "admin" && (
                    <Link to="/admin/reportes" onClick={() => setMenuOpen(false)} className={dropdownItemCls}>
                      <Icon icon="mdi:flag-outline" width={18} className="text-[#378ADD]" />
                      Reportes de contenido
                    </Link>
                  )}

                  {/* Separador */}
                  <div className={`mx-3 border-t ${isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]"}`} />

                  {/* Modo oscuro/claro */}
                  <div className={`flex items-center justify-between px-4 py-3 text-sm ${isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]"}`}>
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
                      className={`w-8 h-[18px] rounded-full relative transition-colors duration-200 flex-shrink-0 ${isDark ? "bg-[#378ADD]" : "bg-[#D3D1C7]"}`}
                    >
                      <span className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all duration-200 ${isDark ? "left-[16px]" : "left-[2px]"}`} />
                    </button>
                  </div>

                  {/* Modo alto contraste */}
                  <div className={`flex items-center justify-between px-4 py-3 text-sm ${isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]"}`}>
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
                      className={`w-8 h-[18px] rounded-full relative transition-colors duration-200 flex-shrink-0 ${isContrast ? "bg-[#C45E00]" : isDark ? "bg-[#3a3a38]" : "bg-[#D3D1C7]"}`}
                    >
                      <span className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all duration-200 ${isContrast ? "left-[16px]" : "left-[2px]"}`} />
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
