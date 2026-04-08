import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";

const navLinks = {
  estudiante: [
    { to: "/estudiante/dashboard", label: "Dashboard" },
    { to: "/estudiante/perfil", label: "Mi Perfil" },
    { to: "/estudiante/evidencias", label: "Evidencias" },
    { to: "/estudiante/mensajeria", label: "Mensajería" }, // <--- NUEVO ENLACE
  ],
  empresa: [
    { to: "/empresa/dashboard", label: "Dashboard" },
    { to: "/empresa/publicar", label: "Publicar Vacante" },
    { to: "/empresa/buscador", label: "Buscar Estudiantes" },
    { to: "/empresa/mensajeria", label: "Mensajería" }, // <--- NUEVO ENLACE
  ],
  admin: [
    { to: "/admin/panel", label: "Panel" },
    { to: "/admin/usuarios", label: "Usuarios" },
    { to: "/admin/evaluaciones", label: "Evaluaciones" },
    { to: "/admin/notas", label: "Importar Notas" },
    { to: "/admin/tests", label: "Tests" },
    { to: "/admin/mensajeria", label: "Mensajería" },
    { to: "/admin/monitoreo", label: "Monitoreo" },
  ],
};

const homePaths = {
  estudiante: "/estudiante/dashboard",
  empresa: "/empresa/dashboard",
  admin: "/admin/panel",
};

export default function Layout() {
  const { isDark, setIsDark } = useDark();
  const location = useLocation();
  const navigate = useNavigate();

  const role = location.pathname.startsWith("/admin")
    ? "admin"
    : location.pathname.startsWith("/empresa")
    ? "empresa"
    : "estudiante";

  const roleNames = { estudiante: "Estudiante", empresa: "Empresa", admin: "Admin/Profesor" };

  return (
    <div className={isDark ? "dark" : ""}>
      <div className={`min-h-screen font-sans ${isDark ? "bg-[#1e1e1c]" : "bg-[#F0F4F8]"}`}>

        {/* Navbar */}
        <nav className="bg-[#0C447C] h-14 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-6">
            <Link to={homePaths[role]} className="text-lg font-medium text-[#E6F1FB] tracking-tight flex-shrink-0">
              Emplea<span className="text-[#85B7EB]">Me</span>
            </Link>
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks[role].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    location.pathname === link.to
                      ? "bg-[#185FA5] text-[#E6F1FB] font-medium"
                      : "text-[#B5D4F4] hover:text-[#E6F1FB] hover:bg-[#185FA5]/40"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Demo: role switcher */}
            <select
              value={role}
              onChange={(e) => {
                const r = e.target.value;
                navigate(
                  r === "empresa" ? "/empresa/dashboard" :
                  r === "admin" ? "/admin/panel" :
                  "/estudiante/dashboard"
                );
              }}
              className="text-xs bg-[#185FA5] text-[#E6F1FB] border border-[#378ADD]/60 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value="estudiante">Estudiante</option>
              <option value="empresa">Empresa</option>
              <option value="admin">Admin/Profesor</option>
            </select>

            {/* Dark mode toggle */}
            <div className="flex items-center gap-1.5">
              <Icon
                icon={isDark ? "ph:moon-fill" : "ph:sun-fill"}
                width={16}
                className={isDark ? "text-[#85B7EB]" : "text-yellow-300"}
              />
              <button
                onClick={() => setIsDark(!isDark)}
                title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
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

            <Link to="/" className="text-xs text-[#B5D4F4] hover:text-[#E6F1FB] transition-colors">
              Cerrar Sesion
            </Link>
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
