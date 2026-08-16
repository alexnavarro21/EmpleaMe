import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { useDark } from "../context/DarkModeContext";
import { useState, useRef, useEffect } from "react";
import NotificacionesBell from "./NotificacionesBell";

const profilePaths = {
  estudiante: "/estudiante/perfil",
  empresa: "/empresa/perfil",
  admin: "/admin/perfil",
  slep: "/slep/perfil",
};

const navLinks = {
  estudiante: [
    { to: "/estudiante/muro", label: "Inicio", icon: "mdi:home-outline" },
    { to: "/estudiante/postulaciones", label: "Mis postulaciones", icon: "mdi:briefcase-check-outline" },
  ],
  empresa: [
    { to: "/empresa/muro", label: "Inicio", icon: "mdi:home-outline" },
    { to: "/empresa/dashboard", label: "Panel Empresa", icon: "mdi:view-dashboard-outline" },
    { to: "/empresa/publicar", label: "Publicar Vacante", icon: "mdi:plus-box-outline" },
  ],
  admin: [
    { to: "/admin/muro", label: "Inicio", icon: "mdi:home-outline" },
    { to: "/admin/panel", label: "Panel", icon: "mdi:view-dashboard-outline" },
    { to: "/admin/usuarios", label: "Estudiantes", icon: "mdi:account-group-outline" },
    { to: "/admin/talleres", label: "Talleres", icon: "mdi:school-outline" },
  ],
  slep: [
    { to: "/slep/muro",      label: "Inicio", icon: "mdi:home-outline" },
    { to: "/slep/panel",       label: "Panel", icon: "mdi:view-dashboard-outline" },
    { to: "/slep/usuarios",    label: "Usuarios", icon: "mdi:account-multiple-outline" },
    { to: "/slep/reportes",    label: "Reportes", icon: "mdi:chart-box-outline" },
  ],
};

const homePaths = {
  estudiante: "/estudiante/muro",
  empresa: "/empresa/muro",
  admin: "/admin/muro",
  slep: "/slep/muro",
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

const TIPO_CONFIG = {
  estudiante: { icon: "mynaui:user-solid",           label: "Estudiante", labelPlural: "Estudiantes", color: "bg-blue-500/20 text-blue-400" },
  empresa:    { icon: "mdi:office-building-outline", label: "Empresa",    labelPlural: "Empresas",    color: "bg-green-500/20 text-green-400" },
  vacante:    { icon: "mdi:briefcase-outline",       label: "Vacante",    labelPlural: "Vacantes",    color: "bg-orange-500/20 text-orange-400" },
  taller:     { icon: "mdi:school-outline",          label: "Taller",     labelPlural: "Talleres",    color: "bg-purple-500/20 text-purple-400" },
  colegio:    { icon: "mdi:domain",                  label: "Colegio",    labelPlural: "Colegios",    color: "bg-teal-500/20 text-teal-400" },
};

const CATEGORIA_ORDEN = ["estudiante", "empresa", "vacante", "taller", "colegio"];

const PLACEHOLDER_POR_ROL = {
  estudiante: "Buscar vacantes, empresas...",
  empresa: "Buscar estudiantes, colegios...",
  admin: "Buscar empresas, talleres...",
  slep: "Buscar empresas, colegios...",
};

export default function Layout() {
  const { isDark, setIsDark, isContrast, setTheme } = useDark();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accesibilidadOpen, setAccesibilidadOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Páginas (ej. chat de mensajería en mobile) pueden pedir ocultar el navbar
  // por completo (no solo taparlo) vía useOutletContext().setNavbarHidden(true).
  const [navbarHidden, setNavbarHidden] = useState(false);
  const menuRef = useRef(null);
  const accesibilidadRef = useRef(null);
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

  const resolverFoto = (raw) => {
    if (!raw) return null;
    if (raw.startsWith("http")) return raw;
    if (raw.startsWith("/")) return `${BASE_ORIGIN}${raw}`;
    return `${BASE_ORIGIN}/uploads/${raw}`;
  };

  const [fotoPerfil, setFotoPerfil] = useState(() =>
    resolverFoto(localStorage.getItem(`foto_perfil_${usuarioId}`) || "")
  );

  // Search bar state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!usuarioId) return;
    const endpoint = role === "empresa"
      ? `${BASE_API}/perfiles/empresa/${usuarioId}`
      : role === "admin"
      ? `${BASE_API}/perfiles/colegio/${usuarioId}`
      : role === "slep"
      ? `${BASE_API}/slep/perfil`
      : `${BASE_API}/perfiles/estudiante/${usuarioId}`;
    fetch(endpoint, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then((r) => r.json())
      .then((data) => {
        const raw = data.foto_perfil || "";
        localStorage.setItem(`foto_perfil_${usuarioId}`, raw);
        setFotoPerfil(resolverFoto(raw));
      })
      .catch(() => {});
  }, [usuarioId, role]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (accesibilidadRef.current && !accesibilidadRef.current.contains(e.target)) setAccesibilidadOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    }
    function handleStorageChange(e) {
      if (e.key === `foto_perfil_${usuarioId}`) {
        setFotoPerfil(resolverFoto(e.newValue || ""));
      }
    }
    function handleFotoUpdate(e) {
      if (e.detail?.key === `foto_perfil_${usuarioId}`) {
        setFotoPerfil(resolverFoto(e.detail.value || ""));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("foto_perfil_updated", handleFotoUpdate);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("foto_perfil_updated", handleFotoUpdate);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setNavbarHidden(false);
  }, [location.pathname]);

  // Sincroniza el color de la barra del navegador (mobile) con el navbar
  useEffect(() => {
    const meta = document.getElementById("meta-theme-color");
    if (meta) meta.setAttribute("content", "#0A3A6A");
  }, []);

  const isOnBuscar = location.pathname.includes("/buscar");

  // Cuando entramos/salimos de la página buscar, sincronizar el input con ?q=
  useEffect(() => {
    if (isOnBuscar) {
      const params = new URLSearchParams(location.search);
      setSearchQuery(params.get("q") || "");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [location.pathname, location.search]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceRef.current);

    if (isOnBuscar) {
      // En la página buscar: actualizar URL en tiempo real (sin dropdown)
      setShowSuggestions(false);
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(location.search);
        if (val.trim()) {
          params.set("q", val.trim());
        } else {
          params.delete("q");
        }
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
      }, 250);
      return;
    }

    // Fuera de la página buscar: mostrar dropdown de sugerencias
    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchLoading(false);
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
        setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        // silent
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowSuggestions(false);
    const q = searchQuery.trim();
    navigate(q ? `${buscarPaths[role]}?q=${encodeURIComponent(q)}` : buscarPaths[role]);
    setSearchQuery("");
  };

  const candidatoPaths = {
    admin: "/admin/candidato",
    empresa: "/empresa/candidato",
    slep: "/slep/candidato",
    estudiante: "/estudiante/candidato",
  };

  const handleSuggestionClick = (item) => {
    setShowSuggestions(false);
    setSearchQuery("");
    if (item.tipo === "estudiante") {
      navigate(`${candidatoPaths[role] || "/estudiante/candidato"}/${item.id}`);
    } else if (item.tipo === "empresa") {
      navigate(`/empresa-publica/${item.id}`);
    } else if (item.tipo === "vacante") {
      navigate(`${buscarPaths[role]}?q=${encodeURIComponent(item.nombre)}&cat=vacantes`);
    } else if (item.tipo === "taller") {
      navigate(`${buscarPaths[role]}?q=${encodeURIComponent(item.nombre)}&cat=talleres`);
    } else if (item.tipo === "colegio") {
      navigate(`${buscarPaths[role]}?q=${encodeURIComponent(item.nombre)}&cat=colegios`);
    }
  };

  const dropdownItemCls = `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
    isDark ? "text-[#D3D1C7] hover:bg-[#0F4D8A]/30" : "text-[#2C2C2A] hover:bg-[#F0F4F8]"
  }`;

  const drawerLinkCls = (active, dark) => `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
    active
      ? `font-medium text-[#378ADD] ${dark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"}`
      : dark ? "text-[#D3D1C7]" : "text-[#2C2C2A]"
  }`;

  // Botón flotante: volver al inicio del muro
  const [mostrarSubir, setMostrarSubir] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setMostrarSubir(window.scrollY > 400);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const subirArriba = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={isDark ? "dark" : isContrast ? "colorblind-mode" : ""}>
      <div className={`min-h-screen font-sans ${
        isContrast ? "bg-[#FFF9E8]" : isDark ? "bg-[#1e1e1c]" : "bg-[#F0F4F8]"
      }`}>

        {/* Navbar: algunas páginas (ej. chat de mensajería en mobile) piden ocultarlo
            por completo vía context, no solo taparlo visualmente */}
        {!navbarHidden && (
        <nav className="bg-[#0A3A6A] h-14 flex items-center px-4 md:px-6 sticky top-0 z-50 shadow-sm gap-4">

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
                  className={`text-sm px-3 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0 transition-colors ${
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
          <div className="hidden md:block flex-shrink-0" ref={searchRef}>
            <div className="relative">
              <form onSubmit={handleSearchSubmit}>
                <div className="flex items-center w-64 focus-within:w-[28rem] rounded-full bg-[#0F4D8A]/50 border border-[#1a5fa8] focus-within:bg-[#0F4D8A]/80 focus-within:border-[#378ADD] transition-all duration-200 overflow-hidden">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => { if (searchQuery.trim() && suggestions.length > 0) setShowSuggestions(true); }}
                    placeholder={PLACEHOLDER_POR_ROL[role] || "Buscar en EmpleaMe..."}
                    className="flex-1 min-w-0 pl-4 pr-2 py-1.5 text-sm bg-transparent text-[#E6F1FB] placeholder-[#85B7EB] outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Buscar"
                    className="flex-shrink-0 self-stretch px-3 flex items-center justify-center border-l border-[#1a5fa8] hover:bg-[#378ADD]/25 transition-colors"
                  >
                    <Icon
                      icon={searchLoading ? "mdi:loading" : "mdi:magnify"}
                      width={15}
                      className={`text-[#85B7EB] ${searchLoading ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>
              </form>

              {/* Dropdown sugerencias */}
              {showSuggestions && (
                <div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[28rem] max-h-[28rem] overflow-y-auto rounded-2xl shadow-2xl border z-50 ${
                  isDark ? "bg-[#262624] border-[#3a3a38]" : "bg-white border-[#D3D1C7]"
                }`}>
                  {searchLoading ? (
                    <div className={`flex items-center gap-2 px-4 py-3 text-xs ${isDark ? "text-[#888780]" : "text-[#5F5E5A]"}`}>
                      <Icon icon="mdi:loading" width={14} className="animate-spin" />
                      Buscando...
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className={`px-4 py-3 text-xs ${isDark ? "text-[#888780]" : "text-[#5F5E5A]"}`}>
                      Sin resultados para "{searchQuery}"
                    </div>
                  ) : (
                    <>
                      {CATEGORIA_ORDEN.map((tipo) => {
                        const items = suggestions.filter((s) => s.tipo === tipo);
                        if (items.length === 0) return null;
                        const cfg = TIPO_CONFIG[tipo];
                        return (
                          <div key={tipo} className={`border-b last:border-0 ${isDark ? "border-[#3a3a38]" : "border-[#F0EDE8]"}`}>
                            <p className={`px-4 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wide ${isDark ? "text-[#888780]" : "text-[#5F5E5A]"}`}>
                              {cfg.labelPlural}
                            </p>
                            {items.map((item, i) => (
                              <button
                                key={`${item.tipo}-${item.id}-${i}`}
                                onClick={() => handleSuggestionClick(item)}
                                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                                  isDark
                                    ? "hover:bg-[#0F4D8A]/25 text-[#D3D1C7]"
                                    : "hover:bg-[#EFF6FF] text-[#2C2C2A]"
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-[#313130]" : "bg-[#F7F6F3]"}`}>
                                  <Icon icon={cfg.icon} width={16} className="text-[#378ADD]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.nombre}</p>
                                  {item.sub && (
                                    <p className={`text-xs truncate ${isDark ? "text-[#888780]" : "text-[#5F5E5A]"}`}>
                                      {item.sub}
                                    </p>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        );
                      })}
                      {/* Ver todos */}
                      <button
                        onClick={handleSearchSubmit}
                        className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 transition-colors sticky bottom-0 ${
                          isDark
                            ? "text-[#378ADD] bg-[#262624] hover:bg-[#0F4D8A]/20 border-t border-[#3a3a38]"
                            : "text-[#378ADD] bg-white hover:bg-[#EFF6FF] border-t border-[#E8E6E1]"
                        }`}
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
              className="hidden md:flex p-1.5 rounded-lg transition-colors text-[#B5D4F4] hover:text-[#E6F1FB] hover:bg-[#0F4D8A]/40"
              title="Mensajes"
            >
              <Icon icon="mdi:message-outline" width={22} />
            </Link>

            <NotificacionesBell role={role} />

            {/* Botón de accesibilidad: modo oscuro / alto contraste */}
            <div className="relative hidden md:block" ref={accesibilidadRef}>
              <button
                onClick={() => setAccesibilidadOpen(!accesibilidadOpen)}
                title="Accesibilidad"
                className={`p-1.5 rounded-lg transition-colors ${
                  accesibilidadOpen
                    ? "bg-[#0F4D8A] text-[#E6F1FB]"
                    : "text-[#B5D4F4] hover:text-[#E6F1FB] hover:bg-[#0F4D8A]/40"
                }`}
              >
                <Icon icon="ph:eye-fill" width={22} />
              </button>

              {accesibilidadOpen && (
                <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg border overflow-hidden z-50 ${
                  isDark ? "bg-[#262624] border-[#3a3a38]" : "bg-white border-[#D3D1C7]"
                }`}>
                  {/* Modo oscuro/claro */}
                  <div className={`flex items-center justify-between px-4 py-3 text-sm ${isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]"}`}>
                    <div className="flex items-center gap-3">
                      <Icon
                        icon="ix:light-dark"
                        width={22}
                        className={isDark ? "text-[#85B7EB]" : "text-[#5F5E5A]"}
                      />
                      Modo oscuro
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
                        icon="mdi:contrast-circle"
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
                </div>
              )}
            </div>

            {/* Botón de perfil con popup */}
            <div className="relative hidden md:block" ref={menuRef}>
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

            {/* Botón hamburguesa: solo mobile */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className="md:hidden p-1.5 rounded-lg transition-colors text-[#B5D4F4] hover:text-[#E6F1FB] hover:bg-[#0F4D8A]/40"
            >
              <Icon icon={mobileMenuOpen ? "mdi:close" : "mdi:menu"} width={24} />
            </button>
          </div>
        </nav>
        )}

        {/* Drawer mobile */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                key="mobile-backdrop"
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                key="mobile-drawer"
                className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-xs z-50 md:hidden overflow-y-auto shadow-2xl ${
                  isDark ? "bg-[#262624]" : "bg-white"
                }`}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.22 }}
              >
                {/* Header del drawer */}
                <div className={`h-14 flex items-center justify-between px-4 border-b ${isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]"}`}>
                  <span className={`text-sm font-semibold ${isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]"}`}>Menú</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Cerrar menú"
                    className={`p-1.5 rounded-lg ${isDark ? "text-[#B4B2A9] hover:bg-[#313130]" : "text-[#5F5E5A] hover:bg-[#F7F6F3]"}`}
                  >
                    <Icon icon="mdi:close" width={20} />
                  </button>
                </div>

                {/* Links de navegación */}
                <div className="flex flex-col py-2 mt-2">
                  {/* Inicio */}
                  <Link
                    to={navLinks[role][0].to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={drawerLinkCls(location.pathname === navLinks[role][0].to, isDark)}
                  >
                    <Icon icon={navLinks[role][0].icon} width={18} className={isDark ? "text-[#85B7EB]" : "text-[#0A3B6A]"} />
                    {navLinks[role][0].label}
                  </Link>

                  {/* Mi perfil */}
                  {profilePaths[role] && (
                    <Link
                      to={profilePaths[role]}
                      onClick={() => setMobileMenuOpen(false)}
                      className={drawerLinkCls(location.pathname === profilePaths[role], isDark)}
                    >
                      <Icon icon="mynaui:user-solid" width={18} className={isDark ? "text-[#85B7EB]" : "text-[#0A3B6A]"} />
                      Mi perfil
                    </Link>
                  )}

                  {/* Resto de links propios del rol (ej. Mis postulaciones) */}
                  {navLinks[role].slice(1).map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={drawerLinkCls(location.pathname === link.to, isDark)}
                    >
                      <Icon icon={link.icon} width={18} className={isDark ? "text-[#85B7EB]" : "text-[#0A3B6A]"} />
                      {link.label}
                    </Link>
                  ))}

                  {/* Mensajes: siempre lleva a la lista de conversaciones */}
                  <Link
                    to={messagingPaths[role]}
                    state={{ forceList: true }}
                    onClick={() => setMobileMenuOpen(false)}
                    className={drawerLinkCls(location.pathname === messagingPaths[role], isDark)}
                  >
                    <Icon icon="mdi:message-outline" width={18} className={isDark ? "text-[#85B7EB]" : "text-[#0A3B6A]"} />
                    Mensajes
                  </Link>

                  {/* Seguidores */}
                  {seguidoresPaths[role] && (
                    <Link
                      to={seguidoresPaths[role]}
                      onClick={() => setMobileMenuOpen(false)}
                      className={drawerLinkCls(location.pathname === seguidoresPaths[role], isDark)}
                    >
                      <Icon icon="mdi:account-group-outline" width={18} className={isDark ? "text-[#85B7EB]" : "text-[#0A3B6A]"} />
                      Seguidores
                    </Link>
                  )}

                  {role === "admin" && (
                    <Link
                      to="/admin/reportes"
                      onClick={() => setMobileMenuOpen(false)}
                      className={drawerLinkCls(location.pathname === "/admin/reportes", isDark)}
                    >
                      <Icon icon="mdi:flag-outline" width={18} className={isDark ? "text-[#85B7EB]" : "text-[#0A3B6A]"} />
                      Reportes de contenido
                    </Link>
                  )}
                </div>

                {/* Accesibilidad */}
                <div className={`border-t px-4 py-3 ${isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]"}`}>
                  <div className={`flex items-center justify-between py-2 text-sm ${isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]"}`}>
                    <div className="flex items-center gap-3">
                      <Icon icon="ix:light-dark" width={20} className={isDark ? "text-[#85B7EB]" : "text-[#5F5E5A]"} />
                      Modo oscuro
                    </div>
                    <button
                      onClick={() => setIsDark(!isDark)}
                      className={`w-8 h-[18px] rounded-full relative transition-colors duration-200 flex-shrink-0 ${isDark ? "bg-[#378ADD]" : "bg-[#D3D1C7]"}`}
                    >
                      <span className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all duration-200 ${isDark ? "left-[16px]" : "left-[2px]"}`} />
                    </button>
                  </div>
                  <div className={`flex items-center justify-between py-2 text-sm ${isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]"}`}>
                    <div className="flex items-center gap-3">
                      <Icon icon="mdi:contrast-circle" width={18} className={isContrast ? "text-[#C45E00]" : isDark ? "text-[#888780]" : "text-[#5F5E5A]"} />
                      Alto contraste
                    </div>
                    <button
                      onClick={() => setTheme(isContrast ? (isDark ? "dark" : "light") : "colorblind")}
                      className={`w-8 h-[18px] rounded-full relative transition-colors duration-200 flex-shrink-0 ${isContrast ? "bg-[#C45E00]" : isDark ? "bg-[#3a3a38]" : "bg-[#D3D1C7]"}`}
                    >
                      <span className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all duration-200 ${isContrast ? "left-[16px]" : "left-[2px]"}`} />
                    </button>
                  </div>
                </div>

                {/* Cerrar sesión */}
                <div className={`border-t px-4 py-3 ${isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]"}`}>
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2 text-sm text-red-400"
                  >
                    <Icon icon="ph:sign-out-bold" width={18} />
                    Cerrar sesión
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <Outlet context={{ setNavbarHidden }} />
        </main>

        {/* Flecha flotante: volver arriba (no aplica en mensajería, que tiene su propio scroll interno) */}
        <AnimatePresence>
          {mostrarSubir && !location.pathname.includes("mensajeria") && (
            <motion.button
              key="scroll-top"
              type="button"
              onClick={subirArriba}
              title="Volver al comienzo"
              aria-label="Volver al comienzo"
              initial={{ opacity: 0, y: 12, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.85 }}
              transition={{ duration: 0.18 }}
              className={`fixed bottom-6 left-6 z-40 w-11 h-11 rounded-full shadow-lg border flex items-center justify-center transition-colors ${
                isContrast
                  ? "bg-[#FFF9E8] border-[#C45E00] text-[#C45E00] hover:bg-[#FCEFD1]"
                  : isDark
                  ? "bg-[#0F4D8A] border-[#1a5fa8] text-[#E6F1FB] hover:bg-[#0A3A6A]"
                  : "bg-[#0A3A6A] border-[#0A3A6A] text-[#E6F1FB] hover:bg-[#0F4D8A]"
              }`}
            >
              <Icon icon="mdi:arrow-up-bold" width={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
