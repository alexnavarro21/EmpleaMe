import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDark } from "../../context/DarkModeContext";
import { loginUsuario, registrarUsuario, listarColegios, solicitarRecuperacion } from "../../services/api";
import Mascota from "../../components/Mascota";

const RUTAS_ROL = {
  estudiante: "/estudiante/muro",
  empresa: "/empresa/muro",
  colegio: "/admin/muro",
  slep: "/slep/muro",
};

export default function Login() {
  const { isDark } = useDark();
  const [activeTab, setActiveTab] = useState("login");

  // Login state
  const [identifier, setIdentifier] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register state
  const [activeRole, setActiveRole] = useState("estudiante");
  const [colegios, setColegios] = useState([]);
  const [regColegioId, setRegColegioId] = useState("");
  const [regRut, setRegRut] = useState("");
  const [regNombre, setRegNombre] = useState("");
  const [regApellidoPaterno, setRegApellidoPaterno] = useState("");
  const [regApellidoMaterno, setRegApellidoMaterno] = useState("");
  const [regCarrera, setRegCarrera] = useState("");
  const [regNivel, setRegNivel] = useState("");
  const [regTelefono, setRegTelefono] = useState("");
  const [regNombreEmpresa, setRegNombreEmpresa] = useState("");
  const [regTelefonoEmpresa, setRegTelefonoEmpresa] = useState("");
  const [regCorreo, setRegCorreo] = useState("");
  const [regContrasena, setRegContrasena] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Recovery modal state
  const [showRecovery, setShowRecovery] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    listarColegios().then(setColegios).catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const { token, usuario } = await loginUsuario(identifier, contrasena);
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

    if (!regContrasena) {
      setRegError("Completa todos los campos obligatorios.");
      return;
    }
    if (activeRole === "estudiante" && !regCorreo && !regRut) {
      setRegError("Debes ingresar correo o RUT.");
      return;
    }
    if (activeRole === "empresa" && !regCorreo) {
      setRegError("Las empresas deben registrarse con correo.");
      return;
    }
    if (activeRole === "estudiante" && (!regNombre || !regApellidoPaterno || !regCarrera)) {
      setRegError("Nombre, apellido paterno y carrera son obligatorios.");
      return;
    }
    if (activeRole === "empresa" && !regNombreEmpresa) {
      setRegError("El nombre de la empresa es obligatorio.");
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
      await registrarUsuario({
        correo: regCorreo || undefined,
        rut: activeRole === "estudiante" && regRut ? regRut : undefined,
        contrasena: regContrasena,
        rol: activeRole,
        nombre: regNombre || undefined,
        apellido_paterno: regApellidoPaterno || undefined,
        apellido_materno: regApellidoMaterno || undefined,
        carrera: regCarrera || undefined,
        nivel: regNivel || undefined,
        telefono: regTelefono || undefined,
        nombre_empresa: regNombreEmpresa || undefined,
        telefono_contacto: regTelefonoEmpresa || undefined,
        colegio_id: activeRole === "estudiante" && regColegioId ? Number(regColegioId) : undefined,
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

        {/* Main grid */}
        <div className="grid md:grid-cols-2 h-screen">

          {/* Left panel */}
          <div className={`relative flex flex-col justify-center px-10 py-16 ${isDark ? "bg-[#02192e]" : "bg-[#042C53]"}`}>
            {/* Logo centrado arriba */}
            <div className="flex items-center justify-center gap-4 mb-8 -translate-x-8"> 
              <img src="/empleame-icono.svg" alt="EmpleaMe" className="h-20 w-20" />
              <span className="text-4xl font-semibold tracking-tight">
                <span className="text-white">Emplea</span>
                <span className="text-[#85B7EB]">Me</span>
              </span>
            </div>
            <h1 className="text-[26px] font-medium text-[#E6F1FB] leading-snug mb-3">
              Tu primera práctica laboral está a un paso
            </h1>
            <p className="text-lg text-[#85B7EB] leading-relaxed mb-10">
              Conectamos estudiantes técnicos con empresas que buscan talento en formación.
            </p>

            <div className="flex flex-col gap-5">
              {[
                { n: "1", title: "Crea tu cuenta", desc: "Regístrate con tu correo y completa tu perfil con tus datos y habilidades" },
                { n: "2", title: "Explora prácticas", desc: "Filtra vacantes por área, modalidad y ubicación según tu carrera" },
                { n: "3", title: "Postula con un click", desc: "Aplica directamente desde la plataforma y haz seguimiento a tus postulaciones" },
              ].map((step, i) => (
                <div key={step.n}>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#0F4D8A] flex items-center justify-center text-base font-medium text-[#E6F1FB] flex-shrink-0">
                      {step.n}
                    </div>
                    <div className="pt-1">
                      <p className="text-base font-medium text-[#E6F1FB] mb-1">{step.title}</p>
                      <p className="text-sm text-[#85B7EB] leading-snug">{step.desc}</p>
                    </div>
                  </div>
                  {i < 2 && <div className="w-px h-4 bg-[#0F4D8A] ml-4 mt-1" />}
                </div>
              ))}
            </div>

            {/* Mascota saludando */}
            <Mascota pose="saludando" className="absolute bottom-0 right-0 w-28 opacity-90" />
          </div>

          {/* Right panel */}
          <div className={`flex flex-col overflow-y-auto ${isDark ? "bg-[#262624]" : "bg-white"}`}>
          <div className="my-auto px-8 py-12">
            {/* Tabs */}
            <div className={`flex mb-6 border-b ${isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]"}`}>
              {["login", "register"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm cursor-pointer px-4 py-2 border-b-2 -mb-px transition-colors ${
                    activeTab === tab
                      ? "text-[#0F4D8A] border-[#0F4D8A] font-medium"
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
                  label="Correo o RUT"
                  type="text"
                  placeholder="tucorreo@email.com o 12.345.678-9"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
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
                  <button
                    type="button"
                    onClick={() => setShowRecovery(true)}
                    className="text-xs text-[#378ADD] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] rounded-lg text-sm font-medium transition-colors mt-1"
                >
                  Iniciar sesión
                </button>
              </form>
            )}

            {activeTab === "register" && (
              <form className="flex flex-col gap-1" onSubmit={handleRegister}>
                {/* Selector de rol: solo Estudiante y Empresa */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { id: "estudiante", label: "Estudiante", desc: "Busco práctica profesional" },
                    { id: "empresa",    label: "Empresa",    desc: "Quiero publicar vacantes"   },
                  ].map((role) => (
                    <button
                      type="button"
                      key={role.id}
                      onClick={() => setActiveRole(role.id)}
                      className={`rounded-xl p-3.5 text-center border transition-all ${
                        activeRole === role.id
                          ? `border-2 border-[#378ADD] ${isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"}`
                          : `border ${isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]"}`
                      }`}
                    >
                      <p className={`text-sm font-semibold ${isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]"}`}>
                        {role.label}
                      </p>
                      <p className="text-xs text-[#888780] mt-0.5">{role.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Campos para Estudiante */}
                {activeRole === "estudiante" && (
                  <>
                    <FormField
                      label="Nombre *"
                      type="text"
                      placeholder="Tu nombre"
                      value={regNombre}
                      onChange={(e) => setRegNombre(e.target.value)}
                      isDark={isDark}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        label="Apellido paterno *"
                        type="text"
                        placeholder="Apellido paterno"
                        value={regApellidoPaterno}
                        onChange={(e) => setRegApellidoPaterno(e.target.value)}
                        isDark={isDark}
                      />
                      <FormField
                        label="Apellido materno"
                        type="text"
                        placeholder="Apellido materno"
                        value={regApellidoMaterno}
                        onChange={(e) => setRegApellidoMaterno(e.target.value)}
                        isDark={isDark}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <SelectField label="Carrera *" value={regCarrera} onChange={(e) => setRegCarrera(e.target.value)} isDark={isDark}>
                        <option value="">Selecciona tu carrera</option>
                        <option value="Administracion">Administración</option>
                        <option value="Mecanica Automotriz">Mecánica Automotriz</option>
                      </SelectField>
                      <SelectField label="Nivel" value={regNivel} onChange={(e) => setRegNivel(e.target.value)} isDark={isDark}>
                        <option value="">Nivel (opcional)</option>
                        {['1° Medio','2° Medio','3° Medio','4° Medio'].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </SelectField>
                    </div>
                    <div className={`text-xs mb-1 ${isDark ? "text-[#B4B2A9]" : "text-[#5F5E5A]"}`}>
                      Ingresa al menos uno: correo o RUT
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        label="Correo (opcional)"
                        type="email"
                        placeholder="tucorreo@email.com"
                        value={regCorreo}
                        onChange={(e) => setRegCorreo(e.target.value)}
                        isDark={isDark}
                      />
                      <FormField
                        label="RUT (opcional)"
                        type="text"
                        placeholder="12.345.678-9"
                        value={regRut}
                        onChange={(e) => setRegRut(e.target.value)}
                        isDark={isDark}
                      />
                    </div>
                    <FormField
                      label="Teléfono (opcional)"
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      value={regTelefono}
                      onChange={(e) => setRegTelefono(e.target.value)}
                      isDark={isDark}
                    />
                    <SelectField
                      label="Centro educacional (opcional)"
                      value={regColegioId}
                      onChange={(e) => setRegColegioId(e.target.value)}
                      isDark={isDark}
                    >
                      <option value="">Sin institución asociada</option>
                      {colegios.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre_institucion}</option>
                      ))}
                    </SelectField>
                  </>
                )}

                {/* Campos para Empresa */}
                {activeRole === "empresa" && (
                  <>
                    <FormField
                      label="Nombre de la empresa *"
                      type="text"
                      placeholder="Ej: Automotriz Salinas SpA"
                      value={regNombreEmpresa}
                      onChange={(e) => setRegNombreEmpresa(e.target.value)}
                      isDark={isDark}
                    />
                    <FormField
                      label="Teléfono de contacto (opcional)"
                      type="tel"
                      placeholder="+56 2 1234 5678"
                      value={regTelefonoEmpresa}
                      onChange={(e) => setRegTelefonoEmpresa(e.target.value)}
                      isDark={isDark}
                    />
                  </>
                )}

                {/* Campos comunes — correo solo obligatorio para empresa */}
                {activeRole === "empresa" && (
                  <FormField label="Correo electrónico *" type="email" placeholder="tucorreo@email.com" value={regCorreo} onChange={(e) => setRegCorreo(e.target.value)} isDark={isDark} />
                )}
                <FormField label="Contraseña *" type="password" placeholder="Mínimo 8 caracteres" value={regContrasena} onChange={(e) => setRegContrasena(e.target.value)} isDark={isDark} />
                <FormField label="Confirmar contraseña *" type="password" placeholder="Repite tu contraseña" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} isDark={isDark} />

                {regError && (
                  <p className="text-xs text-red-500 mt-1">{regError}</p>
                )}
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2.5 bg-[#0F4D8A] hover:bg-[#0A3A6A] disabled:opacity-60 text-[#E6F1FB] rounded-lg text-sm font-medium transition-colors mt-1"
                >
                  {regLoading ? "Creando cuenta..." : "Crear cuenta"}
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

      {showRecovery && (
        <ModalRecuperacion isDark={isDark} onClose={() => setShowRecovery(false)} />
      )}
    </div>
  );
}

function ModalRecuperacion({ isDark, onClose }) {
  const [paso, setPaso] = useState(1);
  const [tipoPerfil, setTipoPerfil] = useState("");
  const [rut, setRut] = useState("");
  const [correoContacto, setCorreoContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensajeExtra, setMensajeExtra] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSeleccionarTipo = (tipo) => {
    setTipoPerfil(tipo);
    setPaso(2);
    setError("");
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    setError("");

    if (tipoPerfil === "estudiante") {
      if (!rut || !correoContacto || !telefono)
        return setError("RUT, correo de contacto y teléfono son obligatorios.");
    } else {
      if (!correoContacto || !telefono)
        return setError("Correo y teléfono son obligatorios.");
    }

    setCargando(true);
    try {
      await solicitarRecuperacion({
        tipo_perfil: tipoPerfil,
        rut: tipoPerfil === "estudiante" ? rut : undefined,
        correo_contacto: tipoPerfil === "estudiante" ? correoContacto : undefined,
        correo: tipoPerfil !== "estudiante" ? correoContacto : undefined,
        telefono,
        mensaje: tipoPerfil === "estudiante" ? mensajeExtra : undefined,
      });
      setPaso(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const overlayClass = "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4";
  const cardClass = `relative w-full max-w-md rounded-2xl shadow-xl p-7 ${isDark ? "bg-[#262624] text-[#D3D1C7]" : "bg-white text-[#2C2C2A]"}`;
  const labelClass = `block text-xs mb-1.5 ${isDark ? "text-[#B4B2A9]" : "text-[#5F5E5A]"}`;
  const inputClass = `w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] focus:ring-2 focus:ring-[#B5D4F4] ${isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]" : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"}`;

  return (
    <div className={overlayClass} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cardClass}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 text-lg font-bold ${isDark ? "text-[#888780] hover:text-[#D3D1C7]" : "text-[#888780] hover:text-[#2C2C2A]"}`}
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-1">Recuperar contraseña</h2>

        {/* PASO 1: Selección de tipo de perfil */}
        {paso === 1 && (
          <>
            <p className={`text-sm mb-5 ${isDark ? "text-[#B4B2A9]" : "text-[#5F5E5A]"}`}>
              Selecciona el tipo de cuenta para continuar con la recuperación.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { id: "estudiante", label: "Estudiante", desc: "Enviaré una solicitud a mi colegio" },
                { id: "empresa",    label: "Empresa",    desc: "Enviaré una solicitud al SLEP" },
                { id: "colegio",    label: "Colegio",    desc: "Enviaré una solicitud a mi SLEP asignado" },
              ].map((tipo) => (
                <button
                  key={tipo.id}
                  type="button"
                  onClick={() => handleSeleccionarTipo(tipo.id)}
                  className={`w-full rounded-xl p-4 text-left border transition-all hover:border-[#378ADD] ${isDark ? "border-[#3a3a38] hover:bg-[#1a2e42]" : "border-[#D3D1C7] hover:bg-[#E6F1FB]"}`}
                >
                  <p className="text-sm font-semibold">{tipo.label}</p>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-[#888780]" : "text-[#888780]"}`}>{tipo.desc}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {/* PASO 2: Formulario según tipo */}
        {paso === 2 && (
          <form onSubmit={handleEnviar} className="flex flex-col gap-1 mt-4">
            <p className={`text-xs mb-3 ${isDark ? "text-[#B4B2A9]" : "text-[#5F5E5A]"}`}>
              {tipoPerfil === "estudiante"
                ? "Completa los datos para que tu colegio pueda identificarte y restablecer tu contraseña."
                : tipoPerfil === "empresa"
                ? "Completa los datos para que el SLEP pueda identificar tu cuenta y restablecer tu contraseña."
                : "Completa los datos para que tu SLEP asignado pueda identificar tu cuenta y restablecer tu contraseña."}
            </p>

            {tipoPerfil === "estudiante" && (
              <div className="mb-3">
                <label className={labelClass}>RUT *</label>
                <input className={inputClass} type="text" placeholder="12.345.678-9" value={rut} onChange={(e) => setRut(e.target.value)} />
              </div>
            )}

            <div className="mb-3">
              <label className={labelClass}>Correo de contacto *</label>
              <input className={inputClass} type="email" placeholder="tucorreo@email.com" value={correoContacto} onChange={(e) => setCorreoContacto(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className={labelClass}>Teléfono de contacto *</label>
              <input className={inputClass} type="tel" placeholder="+56 9 1234 5678" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </div>

            {tipoPerfil === "estudiante" && (
              <div className="mb-3">
                <label className={labelClass}>Mensaje adicional (opcional)</label>
                <textarea
                  className={`${inputClass} resize-none h-20`}
                  placeholder="Escribe un mensaje para tu colegio si lo necesitas..."
                  value={mensajeExtra}
                  onChange={(e) => setMensajeExtra(e.target.value)}
                />
              </div>
            )}

            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => { setPaso(1); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm border transition-colors ${isDark ? "border-[#3a3a38] text-[#B4B2A9] hover:bg-[#313130]" : "border-[#D3D1C7] text-[#5F5E5A] hover:bg-[#F7F6F3]"}`}
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={cargando}
                className="flex-1 py-2.5 bg-[#0F4D8A] hover:bg-[#0A3A6A] disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {cargando ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </form>
        )}

        {/* PASO 3: Confirmación */}
        {paso === 3 && (
          <div className="flex flex-col items-center text-center mt-4 gap-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm">
              {tipoPerfil === "estudiante"
                ? "Tu solicitud fue enviada a tu colegio. Ellos recibirán una notificación y se comunicarán contigo para restablecer tu contraseña."
                : tipoPerfil === "empresa"
                ? "Tu solicitud fue enviada al SLEP. Un administrador recibirá la notificación y se comunicará contigo."
                : "Tu solicitud fue enviada a tu SLEP asignado. Ellos recibirán la notificación y se comunicarán contigo."}
            </p>
            <button
              onClick={onClose}
              className="py-2.5 px-6 bg-[#0F4D8A] hover:bg-[#0A3A6A] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({ label, type, placeholder, isDark, value, onChange }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-3">
      <label className={`block text-xs mb-1.5 ${isDark ? "text-[#B4B2A9]" : "text-[#5F5E5A]"}`}>{label}</label>
      <div className="relative">
        <input
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all
            focus:border-[#378ADD] focus:ring-2 focus:ring-[#B5D4F4]
            ${isPassword ? "pr-10" : ""}
            ${isDark
              ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
              : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
            }`}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-[#888780] hover:text-[#B4B2A9]" : "text-[#888780] hover:text-[#5F5E5A]"}`}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
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


