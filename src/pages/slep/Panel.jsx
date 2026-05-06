import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, StatCard, PageHeader } from "../../components/ui";
import {
  getSlepStats,
  getSlepColegios,
  getSlepChartPostulacionesPorColegio,
  getSlepChartPostulacionesPorMes,
  getSlepChartTopEmpresas,
  getSlepChartEstudiantesPorCarrera,
} from "../../services/api";
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const quickLinks = [
  { to: "/slep/empresas", icon: "cuida:building-outline",    label: "Gestión de Empresas", desc: "Ver y administrar empresas registradas" },
  { to: "/slep/colegios", icon: "mdi:school-outline",        label: "Gestión de Colegios", desc: "Ver y administrar colegios vinculados" },
];

const MESES = { "01":"Ene","02":"Feb","03":"Mar","04":"Abr","05":"May","06":"Jun","07":"Jul","08":"Ago","09":"Sep","10":"Oct","11":"Nov","12":"Dic" };
const formatMes = (ym) => { const [y, m] = ym.split("-"); return `${MESES[m]} ${y.slice(2)}`; };

const C = {
  blue:  "#378ADD",
  amber: "#f59e0b",
  sky:   "#0ea5e9",
  muted: "#888780",
  axis:  "#5a5a56",
};

function MouseTracked({ children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top + 18 });
      }}
      onMouseLeave={() => setPos(null)}
    >
      {children(pos)}
    </div>
  );
}

function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  const bg  = isDark ? "#262624" : "#ffffff";
  const bd  = isDark ? "#3a3a38" : "#D3D1C7";
  const clr = isDark ? "#D3D1C7" : "#2C2C2A";
  const sub = isDark ? "#888780" : "#5F5E5A";
  return (
    <div style={{ background: bg, border: `1px solid ${bd}`, borderRadius: 12, padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 9999, minWidth: 140 }}>
      {label && <p style={{ fontSize: 11, color: sub, marginBottom: 6, fontWeight: 600 }}>{label}</p>}
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: sub, flex: 1 }}>{p.name}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: clr }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, loading, children, filters }) {
  const { isDark } = useDark();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const bg = isDark ? "bg-[#262624]" : "bg-white";
  return (
    <div className={`rounded-xl border ${B} ${bg} p-5`} style={{ overflow: "visible" }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className={`text-sm font-semibold ${T}`}>{title}</p>
        {filters}
      </div>
      {loading
        ? <div className="flex items-center justify-center h-40 text-[#888780]"><Icon icon="mdi:loading" width={24} className="animate-spin" /></div>
        : children}
    </div>
  );
}

function FilterSelect({ value, onChange, options, placeholder, isDark }) {
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const bg = isDark ? "bg-[#313130] text-[#D3D1C7]" : "bg-[#F7F6F3] text-[#2C2C2A]";
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={`text-xs px-2 py-1 rounded-lg border outline-none ${B} ${bg}`}>
      <option value="">{placeholder}</option>
      {options.map((o) => {
        const val = typeof o === "object" ? o.value : o;
        const lbl = typeof o === "object" ? o.label : o;
        return <option key={val} value={val}>{lbl}</option>;
      })}
    </select>
  );
}

const abbr = (str, max = 14) => str?.length > max ? str.slice(0, max - 1) + "." : str;

export default function SlepPanel() {
  const { isDark } = useDark();
  const [stats, setStats]   = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [colegios, setColegios] = useState([]);

  // chart data
  const [porColegio, setPorColegio]   = useState([]);
  const [porMes, setPorMes]           = useState([]);
  const [topEmpresas, setTopEmpresas] = useState([]);
  const [porCarrera, setPorCarrera]   = useState([]);

  // chart loading
  const [loadingColegio, setLoadingColegio]     = useState(true);
  const [loadingMes, setLoadingMes]             = useState(true);
  const [loadingEmpresas, setLoadingEmpresas]   = useState(true);
  const [loadingCarrera, setLoadingCarrera]     = useState(true);

  // filters
  const [filtroColegio, setFiltroColegio]           = useState("");
  const [filtroColegioCarrera, setFiltroColegioCarrera] = useState("");

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  useEffect(() => {
    getSlepStats().then(setStats).catch(() => {}).finally(() => setLoadingStats(false));
    getSlepColegios().then(setColegios).catch(() => {});
    getSlepChartPostulacionesPorColegio().then(setPorColegio).catch(() => {}).finally(() => setLoadingColegio(false));
    getSlepChartTopEmpresas().then(setTopEmpresas).catch(() => {}).finally(() => setLoadingEmpresas(false));
  }, []);

  useEffect(() => {
    setLoadingMes(true);
    getSlepChartPostulacionesPorMes({ colegio_id: filtroColegio })
      .then(setPorMes).catch(() => {}).finally(() => setLoadingMes(false));
  }, [filtroColegio]);

  useEffect(() => {
    setLoadingCarrera(true);
    getSlepChartEstudiantesPorCarrera({ colegio_id: filtroColegioCarrera })
      .then(setPorCarrera).catch(() => {}).finally(() => setLoadingCarrera(false));
  }, [filtroColegioCarrera]);

  const v = (key) => loadingStats ? "…" : (stats?.[key] ?? "—");

  const colegioOpts = colegios.map((c) => ({ value: String(c.usuario_id), label: c.nombre_institucion }));

  const porColegioData  = porColegio.map((r) => ({ colegio: abbr(r.colegio, 16), Postulaciones: Number(r.total) }));
  const porMesData      = porMes.map((r) => ({ mes: formatMes(r.mes), Postulaciones: Number(r.total) }));
  const topEmpData      = topEmpresas.map((r) => ({ empresa: abbr(r.empresa, 16), Postulaciones: Number(r.total) }));
  const porCarreraData  = porCarrera.map((r) => ({ carrera: abbr(r.carrera, 16), Estudiantes: Number(r.total) }));

  return (
    <div>
      <PageHeader
        title="Panel SLEP"
        subtitle="Gestión de empresas y colegios en la plataforma"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Colegios vinculados"   value={v("total_colegios")}    sub="En plataforma" />
        <StatCard label="Estudiantes activos"   value={v("total_estudiantes")} sub="Total en sistema" />
        <StatCard label="Vacantes activas"      value={v("total_vacantes")}    sub="Publicadas ahora" />
        <StatCard label="Empresas registradas"  value={v("total_empresas")}    sub="En plataforma" />
        <StatCard label="Postulaciones totales" value={v("total_postulaciones")} sub="De todos los colegios" />
        <StatCard label="Postulaciones este mes" value={v("postulaciones_este_mes")} sub="Mes en curso" />
      </div>

      {/* Charts */}
      <h2 className={`text-sm font-semibold ${T} mb-3`}>Analítica</h2>
      <div className={`${isDark ? "dark" : ""} mb-8`}>

        {/* Fila 1 */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2">
            <ChartCard
              title="Postulaciones por mes"
              loading={loadingMes}
              filters={
                <FilterSelect value={filtroColegio} onChange={setFiltroColegio}
                  options={colegioOpts} placeholder="Todos los colegios" isDark={isDark} />
              }
            >
              {porMesData.length === 0
                ? <p className={`text-xs text-center py-10 ${M}`}>Sin datos aún</p>
                : <MouseTracked>
                    {(pos) => (
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={porMesData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="grad-slep-blue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor={C.blue} stopOpacity={0.25} />
                              <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip position={pos ?? undefined} content={<CustomTooltip isDark={isDark} />} />
                          <Area type="monotone" dataKey="Postulaciones" stroke={C.blue} strokeWidth={2} fill="url(#grad-slep-blue)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </MouseTracked>}
            </ChartCard>
          </div>

          <ChartCard title="Top empresas que más contratan" loading={loadingEmpresas}>
            {topEmpData.length === 0
              ? <p className={`text-xs text-center py-10 ${M}`}>Sin datos aún</p>
              : <MouseTracked>
                  {(pos) => (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={topEmpData} layout="vertical" margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                        <XAxis type="number" tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <YAxis type="category" dataKey="empresa" width={90} tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} />
                        <Tooltip position={pos ?? undefined} content={<CustomTooltip isDark={isDark} />} />
                        <Bar dataKey="Postulaciones" fill={C.amber} radius={[0, 4, 4, 0]} maxBarSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </MouseTracked>}
          </ChartCard>
        </div>

        {/* Fila 2 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <ChartCard title="Postulaciones por colegio" loading={loadingColegio}>
              {porColegioData.length === 0
                ? <p className={`text-xs text-center py-10 ${M}`}>Sin datos aún</p>
                : <MouseTracked>
                    {(pos) => (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={porColegioData} layout="vertical" margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                          <XAxis type="number" tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <YAxis type="category" dataKey="colegio" width={110} tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} />
                          <Tooltip position={pos ?? undefined} content={<CustomTooltip isDark={isDark} />} />
                          <Bar dataKey="Postulaciones" fill={C.sky} radius={[0, 4, 4, 0]} maxBarSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </MouseTracked>}
            </ChartCard>
          </div>

          <ChartCard
            title="Estudiantes por carrera"
            loading={loadingCarrera}
            filters={
              <FilterSelect value={filtroColegioCarrera} onChange={setFiltroColegioCarrera}
                options={colegioOpts} placeholder="Todos los colegios" isDark={isDark} />
            }
          >
            {porCarreraData.length === 0
              ? <p className={`text-xs text-center py-10 ${M}`}>Sin datos aún</p>
              : <MouseTracked>
                  {(pos) => (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={porCarreraData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                        <XAxis dataKey="carrera" interval={0}
                          tickFormatter={(val) => val.length > 10 ? val.slice(0, 10) + "." : val}
                          tick={{ fontSize: 11, fill: C.axis, angle: -35, textAnchor: "end", dy: 4, dx: -4 }}
                          axisLine={false} tickLine={false} height={60} />
                        <YAxis tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip position={pos ?? undefined} content={<CustomTooltip isDark={isDark} />} />
                        <Bar dataKey="Estudiantes" fill={C.blue} radius={[4, 4, 0, 0]} maxBarSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </MouseTracked>}
          </ChartCard>
        </div>
      </div>

      {/* Quick links — compactos al fondo */}
      <h2 className={`text-sm font-semibold ${T} mb-3`}>Acceso rápido</h2>
      <div className="grid grid-cols-4 gap-2">
        {quickLinks.map((ql) => (
          <Link key={ql.to} to={ql.to}>
            <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${B} hover:border-[#378ADD] transition-colors cursor-pointer ${isDark ? "bg-[#262624]" : "bg-white"}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${S}`}>
                <Icon icon={ql.icon} width={15} className="text-[#378ADD]" />
              </div>
              <p className={`text-xs font-medium ${T} leading-tight`}>{ql.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
