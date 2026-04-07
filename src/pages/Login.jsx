import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { loginUsuario, registrarUsuario } from "../services/api";

const RUTAS_ROL = {
  estudiante: "/estudiante/dashboard",
  empresa: "/empresa/dashboard",
  centro: "/admin/panel",
};

export default function Login() {
  const { isDark, setIsDark } = useDark();
  const [activeTab, setActiveTab] = useState("login");

  // Login state
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register state
  const [activeRole, setActiveRole] = useState("estudiante");
  const [regNombreCompleto, setRegNombreCompleto] = useState("");
  const [regCarrera, setRegCarrera] = useState("");
  const [regNombreEmpresa, setRegNombreEmpresa] = useState("");
  const [regCorreo, setRegCorreo] = useState("");
  const [regContrasena, setRegContrasena] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const { token, usuario } = await loginUsuario(correo, contrasena);
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      navigate(RUTAS_ROL[usuario.rol]);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");

    if (!regCorreo || !regContrasena) {
      setRegError("Completa todos los campos.");
      return;
    }
    if (activeRole === "estudiante" && (!regNombreCompleto || !regCarrera)) {
      setRegError("Completa nombre completo y carrera.");
      return;
    }
    if (activeRole === "empresa" && !regNombreEmpresa) {
      setRegError("Ingresa el nombre de la empresa.");
      return;
    }
    if (regContrasena.length < 8) {
      setRegError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (regContrasena !== regConfirm) {
      setRegError("Las contraseñas no coinciden.");
      return;
    }

    setRegLoading(true);
    try {
      // El backend devuelve { mensaje, id }, sin token → hacemos auto-login
      await registrarUsuario({
        correo: regCorreo,
        contrasena: regContrasena,
        rol: activeRole === "admin" ? "centro" : activeRole,
        nombre_completo: regNombreCompleto || undefined,
        carrera: regCarrera || undefined,
        nombre_empresa: regNombreEmpresa || undefined,
      });
      const { token, usuario } = await loginUsuario(regCorreo, regContrasena);
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      navigate(RUTAS_ROL[usuario.rol]);
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className={isDark ? "dark" : ""}>
      <div className={`min-h-screen font-sans ${isDark ? "bg-[#1e1e1c]" : "bg-white"}`}>

        {/* Navbar */}
        <nav className="bg-[#0C447C] h-14 flex items-center justify-between px-8">
          <span className="text-lg font-medium text-[#E6F1FB] tracking-tight">
            Emplea<span className="text-[#85B7EB]">Me</span>
          </span>
          <div className="flex items-center gap-6">
            <span className="text-sm text-[#B5D4F4] cursor-pointer hidden md:block">Empleos</span>
            <span className="text-sm text-[#B5D4F4] cursor-pointer hidden md:block">Empresas</span>
            <span className="text-sm bg-[#378ADD] text-[#E6F1FB] px-4 py-1.5 rounded-lg cursor-pointer">
              Publicar práctica
            </span>
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
          </div>
        </nav>

        {/* Main grid */}
        <div className="grid md:grid-cols-2 min-h-[calc(100vh-56px)]">

          {/* Left panel */}
          <div className={`flex flex-col justify-center px-10 py-16 ${isDark ? "bg-[#02192e]" : "bg-[#042C53]"}`}>
            <span className="inline-block text-md px-3 py-1 rounded-lg bg-[#185FA5] text-[#B5D4F4] mb-4 w-fit">
              Para estudiantes técnicos
            </span>
            <h1 className="text-[26px] font-medium text-[#E6F1FB] leading-snug mb-3">
              Tu primera práctica laboral está a un paso
            </h1>
            <p className="text-lg text-[#85B7EB] leading-relaxed mb-10">
              Conectamos estudiantes técnicos con empresas que buscan talento en formación.
            </p>

            <div className="flex flex-col gap-5">
              {[
                { n: "1", title: "Crea tu perfil", desc: "Sube tu CV, habilidades y un video corto mostrando quién eres" },
                { n: "2", title: "Explora prácticas", desc: "Filtra por área, modalidad y ubicación según tu carrera" },
                { n: "3", title: "Postula y destaca", desc: "Aplica con un click y diferénciate con tu video de experiencia" },
              ].map((step, i) => (
                <div key={step.n}>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#185FA5] flex items-center justify-center text-base font-medium text-[#E6F1FB] flex-shrink-0">
                      {step.n}
                    </div>
                    <div className="pt-1">
                      <p className="text-base font-medium text-[#E6F1FB] mb-1">{step.title}</p>
                      <p className="text-sm text-[#85B7EB] leading-snug">{step.desc}</p>
                    </div>
                  </div>
                  {i < 2 && <div className="w-px h-4 bg-[#185FA5] ml-4 mt-1" />}
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className={`flex flex-col justify-center px-8 py-12 ${isDark ? "bg-[#262624]" : "bg-white"}`}>
            {/* Tabs */}
            <div className={`flex mb-6 border-b ${isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]"}`}>
              {["login", "register"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm cursor-pointer px-4 py-2 border-b-2 -mb-px transition-colors ${
                    activeTab === tab
                      ? "text-[#185FA5] border-[#185FA5] font-medium"
                      : `border-transparent ${isDark ? "text-[#B4B2A9]" : "text-[#888780]"}`
                  }`}
                >
                  {tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </button>
              ))}
            </div>

            {activeTab === "login" && (
              <form className="flex flex-col gap-1" onSubmit={handleLogin}>
                <FormField
                  label="Correo electrónico"
                  type="email"
                  placeholder="tucorreo@email.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  isDark={isDark}
                />
                <FormField
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  isDark={isDark}
                />
                {loginError && (
                  <p className="text-xs text-red-500 mt-1">{loginError}</p>
                )}
                <div className="text-right mb-3">
                  <a href="#" className="text-xs text-[#378ADD]">¿Olvidaste tu contraseña?</a>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#185FA5] hover:bg-[#0C447C] text-[#E6F1FB] rounded-lg text-sm font-medium transition-colors mt-1"
                >
                  Iniciar sesión
                </button>
                <Divider isDark={isDark} />
                <GoogleButton isDark={isDark} />
              </form>
            )}

            {activeTab === "register" && (
              <form className="flex flex-col gap-1" onSubmit={handleRegister}>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { id: "estudiante", label: "Estudiante", desc: "Busco práctica" },
                    { id: "empresa", label: "Empresa", desc: "Ofrezco práctica" },
                    { id: "admin", label: "Admin/Docente", desc: "Gestión y evaluación" },
                  ].map((role) => (
                    <button
                      type="button"
                      key={role.id}
                      onClick={() => setActiveRole(role.id)}
                      className={`rounded-lg p-3 text-center border transition-all ${
                        activeRole === role.id
                          ? `border-2 border-[#378ADD] ${isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"}`
                          : `border ${isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]"}`
                      }`}
                    >
                      <p className={`text-sm font-medium ${isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]"}`}>
                        {role.label}
                      </p>
                      <p className="text-xs text-[#888780] mt-0.5">{role.desc}</p>
                    </button>
                  ))}
                </div>
                {activeRole === "estudiante" && (
                  <>
                    <FormField label="Nombre completo" type="text" placeholder="Tu nombre y apellido" value={regNombreCompleto} onChange={(e) => setRegNombreCompleto(e.target.value)} isDark={isDark} />
                    <SelectField label="Carrera" value={regCarrera} onChange={(e) => setRegCarrera(e.target.value)} isDark={isDark}>
                      <option value="">Selecciona tu carrera</option>
                      <option value="Administracion">Administración</option>
                      <option value="Mecanica Automotriz">Mecánica Automotriz</option>
                    </SelectField>
                  </>
                )}
                {activeRole === "empresa" && (
                  <FormField label="Nombre de la empresa" type="text" placeholder="Ej: Automotriz Salinas" value={regNombreEmpresa} onChange={(e) => setRegNombreEmpresa(e.target.value)} isDark={isDark} />
                )}
                {activeRole === "admin" && (
                  <FormField label="Nombre completo" type="text" placeholder="Tu nombre y apellido" value={regNombreCompleto} onChange={(e) => setRegNombreCompleto(e.target.value)} isDark={isDark} />
                )}
                <FormField label="Correo electrónico" type="email" placeholder="tucorreo@email.com" value={regCorreo} onChange={(e) => setRegCorreo(e.target.value)} isDark={isDark} />
                <FormField label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" value={regContrasena} onChange={(e) => setRegContrasena(e.target.value)} isDark={isDark} />
                <FormField label="Confirmar contraseña" type="password" placeholder="Repite tu contraseña" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} isDark={isDark} />
                {regError && (
                  <p className="text-xs text-red-500 mt-1">{regError}</p>
                )}
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2.5 bg-[#185FA5] hover:bg-[#0C447C] disabled:opacity-60 text-[#E6F1FB] rounded-lg text-sm font-medium transition-colors mt-1"
                >
                  {regLoading ? "Creando cuenta..." : "Crear cuenta gratis"}
                </button>
                <p className="text-xs text-[#888780] text-center mt-3 leading-relaxed">
                  Al registrarte aceptas nuestros{" "}
                  <a href="#" className="text-[#378ADD]">Términos de uso</a> y{" "}
                  <a href="#" className="text-[#378ADD]">Política de privacidad</a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, type, placeholder, isDark, value, onChange }) {
  return (
    <div className="mb-3">
      <label className={`block text-xs mb-1.5 ${isDark ? "text-[#B4B2A9]" : "text-[#5F5E5A]"}`}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all
          focus:border-[#378ADD] focus:ring-2 focus:ring-[#B5D4F4]
          ${isDark
            ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
            : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
          }`}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, isDark, children }) {
  return (
    <div className="mb-3">
      <label className={`block text-xs mb-1.5 ${isDark ? "text-[#B4B2A9]" : "text-[#5F5E5A]"}`}>{label}</label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all
          focus:border-[#378ADD] focus:ring-2 focus:ring-[#B5D4F4]
          ${isDark
            ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]"
            : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
          }`}
      >
        {children}
      </select>
    </div>
  );
}

function Divider({ isDark }) {
  return (
    <div className="relative my-4 text-center">
      <div className={`absolute inset-y-1/2 left-0 right-0 h-px ${isDark ? "bg-[#3a3a38]" : "bg-[#D3D1C7]"}`} />
      <span className={`relative px-3 text-xs ${isDark ? "bg-[#262624] text-[#888780]" : "bg-white text-[#888780]"}`}>
        o continúa con
      </span>
    </div>
  );
}

function GoogleButton({ isDark }) {
  return (
    <button className={`w-full py-2.5 rounded-lg text-sm border transition-colors ${isDark ? "border-[#3a3a38] text-[#D3D1C7] hover:bg-[#313130]" : "border-[#D3D1C7] text-[#2C2C2A] hover:bg-[#F7F6F3]"}`}>
      Google
    </button>
  );
}

