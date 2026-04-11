import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { PageHeader, Paginacion } from "../../components/ui";
import { getPostulacionesEstudiante } from "../../services/api";

const ESTADO_CFG = {
  pendiente: { label: "Pendiente", color: "text-blue-500",  bg: "bg-blue-50",  icon: "mdi:clock-outline"        },
  aceptado:  { label: "Aceptado",  color: "text-green-600", bg: "bg-green-50", icon: "mdi:check-circle-outline" },
  rechazado: { label: "Rechazado", color: "text-red-500",   bg: "bg-red-50",   icon: "mdi:close-circle-outline" },
};

function tiempoRelativo(fecha) {
  const diff = Math.floor((Date.now() - new Date(fecha)) / 1000);
  if (diff < 60)    return "Ahora mismo";
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  const dias = Math.floor(diff / 86400);
  if (dias < 30)    return `Hace ${dias} día${dias !== 1 ? "s" : ""}`;
  const meses = Math.floor(dias / 30);
  return `Hace ${meses} mes${meses !== 1 ? "es" : ""}`;
}

export default function MisPostulaciones() {
  const { isDark } = useDark();
  const T  = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";

  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(3);

  useEffect(() => {
    getPostulacionesEstudiante()
      .then(setPostulaciones)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtradas = postulaciones
    .filter((p) => filtro === "todas" || p.estado === filtro)
    .filter((p) =>
      !busqueda ||
      p.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.nombre_empresa?.toLowerCase().includes(busqueda.toLowerCase())
    );

  const totalPaginas = Math.ceil(filtradas.length / porPagina);
  const paginadas = filtradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  const conteos = {
    todas:    postulaciones.length,
    pendiente: postulaciones.filter((p) => p.estado === "pendiente").length,
    aceptado:  postulaciones.filter((p) => p.estado === "aceptado").length,
    rechazado: postulaciones.filter((p) => p.estado === "rechazado").length,
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-24 ${M}`}>
        <Icon icon="mdi:loading" width={28} className="animate-spin mr-2" />
        Cargando postulaciones...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Mis postulaciones"
        subtitle={`${postulaciones.length} postulación${postulaciones.length !== 1 ? "es" : ""} en total`}
        action={
          <Link
            to="/estudiante/dashboard"
            className={`text-sm px-4 py-2 rounded-lg border ${B} ${M} hover:text-[#378ADD] hover:border-[#378ADD] transition-colors`}
          >
            ← Volver al inicio
          </Link>
        }
      />

      {/* Búsqueda */}
      {postulaciones.length > 0 && (
        <div className="relative mb-4 max-w-xs">
          <Icon icon="mdi:search" width={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${M}`} />
          <input
            type="text"
            placeholder="Buscar por vacante o empresa..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
              isDark
                ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
            }`}
          />
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { key: "todas",    label: "Todas"     },
          { key: "pendiente", label: "Pendientes" },
          { key: "aceptado",  label: "Aceptadas"  },
          { key: "rechazado", label: "Rechazadas" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setFiltro(key); setPagina(1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filtro === key
                ? "bg-[#0F4D8A] text-white border-[#0F4D8A]"
                : `${B} ${M} hover:border-[#378ADD] hover:text-[#378ADD]`
            }`}
          >
            {label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
              filtro === key ? "bg-white/20 text-white" : isDark ? "bg-[#3a3a38] text-[#888780]" : "bg-[#F0F4F8] text-[#5F5E5A]"
            }`}>
              {conteos[key]}
            </span>
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <div className={`rounded-xl border ${B} ${BG} p-12 text-center`}>
          <Icon icon={busqueda ? "mdi:magnify-close" : "mdi:clipboard-remove-outline"} width={44} className={`mx-auto mb-3 ${M}`} />
          <p className={`text-sm font-medium ${T}`}>
            {busqueda
              ? `Sin resultados para "${busqueda}".`
              : filtro === "todas"
              ? "Aún no has postulado a ninguna vacante."
              : `Sin postulaciones ${filtro === "aceptado" ? "aceptadas" : filtro === "rechazado" ? "rechazadas" : "pendientes"}.`}
          </p>
          {filtro === "todas" && !busqueda && (
            <Link to="/estudiante/dashboard" className="inline-block mt-3 text-xs text-[#378ADD] hover:underline">
              Explorar vacantes en el muro →
            </Link>
          )}
        </div>
      ) : (
        <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
          {paginadas.map((p, i) => {
            const cfg = ESTADO_CFG[p.estado] || { label: p.estado, color: M, bg: "", icon: "mdi:help-circle-outline" };
            return (
              <div
                key={p.id}
                className={`flex items-start gap-4 px-5 py-4 ${i < paginadas.length - 1 ? `border-b ${B}` : ""}`}
              >
                {/* Icono estado */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon icon={cfg.icon} width={18} className={cfg.color} />
                </div>

                {/* Info vacante */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${T} truncate`}>{p.titulo || "Vacante sin título"}</p>
                  <p className={`text-xs ${M}`}>
                    {p.nombre_empresa}
                    {p.area ? ` · ${p.area}` : ""}
                    {p.modalidad ? ` · ${p.modalidad}` : ""}
                  </p>
                  <p className={`text-xs ${M} mt-0.5`}>{tiempoRelativo(p.fecha_creacion)}</p>
                </div>

                {/* Badge estado */}
                <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {filtradas.length > 0 && (
        <Paginacion
          paginaActual={pagina}
          totalPaginas={totalPaginas}
          onCambiar={setPagina}
          porPagina={porPagina}
          opciones={[3, 6, 9, 15]}
          onCambiarPorPagina={(n) => { setPorPagina(n); setPagina(1); }}
        />
      )}
    </div>
  );
}
