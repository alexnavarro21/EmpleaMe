import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { Card, PageHeader } from "../components/ui";
import { getSeguidores, getSiguiendo, getMediaUrl, toggleSeguir } from "../services/api";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001";
function resolverMedia(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return `${BASE_URL}/uploads/${url}`;
}

function tiempoRelativo(fecha) {
  const diff = Math.floor((Date.now() - new Date(fecha)) / 1000);
  if (diff < 60)    return "Ahora mismo";
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

function UsuarioCard({ usuario, isDark, puedeDejarDeSeguir, onDejarDeSeguir }) {
  const T  = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";
  const HV = isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]";

  const foto = resolverMedia(usuario.foto_perfil);
  const inicial = usuario.nombre?.[0]?.toUpperCase() ?? "?";
  const esEmpresa = usuario.rol === "empresa";

  // Ruta del perfil público según rol
  const perfilLink = esEmpresa
    ? `/empresa-publica/${usuario.id}`
    : `/estudiante/candidato/${usuario.id}`;

  const [dejando, setDejando] = useState(false);

  const handleDejarDeSeguir = async () => {
    setDejando(true);
    try {
      await toggleSeguir(usuario.id);
      onDejarDeSeguir?.(usuario.id);
    } catch (err) {
      console.error(err);
    } finally {
      setDejando(false);
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${B} ${BG}`}>
      <div className="flex items-center gap-3">
        {foto ? (
          <img src={foto} className="w-11 h-11 rounded-full object-cover flex-shrink-0" alt="" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-[#0F4D8A] flex items-center justify-center text-white font-semibold text-base flex-shrink-0">
            {inicial}
          </div>
        )}
        <div>
          <Link to={perfilLink} className={`text-sm font-semibold ${T} hover:text-[#378ADD] transition-colors`}>
            {usuario.nombre}
          </Link>
          <p className={`text-xs ${M} flex items-center gap-1`}>
            <Icon icon={esEmpresa ? "mdi:office-building-outline" : "mdi:account-school-outline"} width={12} />
            {esEmpresa ? "Empresa" : "Estudiante"}
          </p>
          {usuario.creado_en && (
            <p className={`text-xs ${M}`}>Desde {tiempoRelativo(usuario.creado_en)}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={perfilLink}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${B} ${T} ${HV}`}
        >
          <Icon icon="mdi:account-eye-outline" width={14} />
          Ver perfil
        </Link>

        {puedeDejarDeSeguir && (
          <button
            onClick={handleDejarDeSeguir}
            disabled={dejando}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[#378ADD]/40 text-[#378ADD] hover:bg-[#378ADD]/10 disabled:opacity-50`}
          >
            {dejando
              ? <Icon icon="mdi:loading" width={14} className="animate-spin" />
              : <Icon icon="mdi:account-check" width={14} />
            }
            Siguiendo
          </button>
        )}
      </div>
    </div>
  );
}

export default function Seguidores() {
  const { isDark } = useDark();
  const navigate = useNavigate();

  const T  = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const miId = usuario.id;

  const [tab, setTab] = useState("seguidores"); // "seguidores" | "siguiendo"
  const [seguidores, setSeguidores]   = useState([]);
  const [siguiendo, setSiguiendo]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [busqueda, setBusqueda]       = useState("");

  useEffect(() => {
    if (!miId) return;
    setLoading(true);
    Promise.allSettled([getSeguidores(miId), getSiguiendo(miId)])
      .then(([seg, sigo]) => {
        if (seg.status === "fulfilled")  setSeguidores(seg.value);
        if (sigo.status === "fulfilled") setSiguiendo(sigo.value);
      })
      .finally(() => setLoading(false));
  }, [miId]);

  const handleDejarDeSeguir = (idUsuario) => {
    setSiguiendo((prev) => prev.filter((u) => u.id !== idUsuario));
  };

  const lista = tab === "seguidores" ? seguidores : siguiendo;
  const listaFiltrada = busqueda
    ? lista.filter((u) => u.nombre?.toLowerCase().includes(busqueda.toLowerCase()))
    : lista;

  return (
    <div>
      <PageHeader
        title="Seguidores"
        subtitle="Personas y empresas de tu red"
        action={
          <button onClick={() => navigate(-1)} className={`text-sm ${M} hover:text-[#378ADD] transition-colors flex items-center gap-1`}>
            ← Volver
          </button>
        }
      />

      {/* Tabs + búsqueda */}
      <div className={`flex items-center gap-4 mb-6 border-b ${B} pb-0`}>
        <button
          onClick={() => { setTab("seguidores"); setBusqueda(""); }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === "seguidores"
              ? "border-[#378ADD] text-[#378ADD]"
              : `border-transparent ${M} hover:text-[#378ADD]`
          }`}
        >
          <Icon icon="mdi:account-group-outline" width={16} />
          Seguidores
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            tab === "seguidores"
              ? "bg-[#378ADD]/15 text-[#378ADD]"
              : isDark ? "bg-[#3a3a38] text-[#888780]" : "bg-[#E8E6E1] text-[#5F5E5A]"
          }`}>
            {seguidores.length}
          </span>
        </button>

        <button
          onClick={() => { setTab("siguiendo"); setBusqueda(""); }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === "siguiendo"
              ? "border-[#378ADD] text-[#378ADD]"
              : `border-transparent ${M} hover:text-[#378ADD]`
          }`}
        >
          <Icon icon="mdi:account-arrow-right-outline" width={16} />
          Siguiendo
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            tab === "siguiendo"
              ? "bg-[#378ADD]/15 text-[#378ADD]"
              : isDark ? "bg-[#3a3a38] text-[#888780]" : "bg-[#E8E6E1] text-[#5F5E5A]"
          }`}>
            {siguiendo.length}
          </span>
        </button>

        {/* Buscador */}
        <div className="relative ml-auto">
          <Icon icon="mdi:search" width={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${M}`} />
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={`pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none border transition-all focus:border-[#378ADD] w-44 ${
              isDark
                ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
            }`}
          />
        </div>
      </div>

      {loading ? (
        <div className={`flex items-center justify-center py-24 ${M}`}>
          <Icon icon="mdi:loading" width={28} className="animate-spin mr-2" />
          Cargando...
        </div>
      ) : listaFiltrada.length === 0 ? (
        <Card>
          <div className={`text-center py-12 ${M}`}>
            <Icon
              icon={tab === "seguidores" ? "mdi:account-group-outline" : "mdi:account-arrow-right-outline"}
              width={48}
              className="mx-auto mb-3"
            />
            {busqueda ? (
              <p className="text-sm">Sin resultados para "{busqueda}"</p>
            ) : tab === "seguidores" ? (
              <>
                <p className={`text-base font-medium ${T} mb-1`}>Aún no tienes seguidores</p>
                <p className="text-sm">Cuando alguien te siga, aparecerá aquí.</p>
              </>
            ) : (
              <>
                <p className={`text-base font-medium ${T} mb-1`}>No sigues a nadie todavía</p>
                <p className="text-sm">Encuentra estudiantes y empresas en el muro o en la búsqueda.</p>
              </>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {listaFiltrada.map((u) => (
            <UsuarioCard
              key={u.id}
              usuario={u}
              isDark={isDark}
              puedeDejarDeSeguir={tab === "siguiendo"}
              onDejarDeSeguir={handleDejarDeSeguir}
            />
          ))}
        </div>
      )}
    </div>
  );
}
