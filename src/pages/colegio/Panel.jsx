import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, StatCard, PageHeader } from "../../components/ui";
import {
  getAdminStats, getColegioById,
  getChartPostulacionesPorMes, getChartTopEmpresas,
  getChartEstadoPostulaciones, getChartVacantesDisponibles,
} from "../../services/api";
import {
  BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const quickLinks = [
  { to: "/admin/usuarios",   icon: "mdi:account-group-outline",  label: "Gestión de usuarios",    desc: "Ver y administrar cuentas" },
  { to: "/admin/usuarios",   icon: "mdi:clipboard-list-outline", label: "Registrar evaluaciones", desc: "Competencias técnicas y socioemocionales" },
  { to: "/admin/notas",      icon: "icon-park-outline:excel",    label: "Importar notas",         desc: "Excel / CSV con calificaciones" },
  { to: "/admin/tests",      icon: "hugeicons:brain-02",         label: "Tests socioemocionales", desc: "Cargar y asignar tests" },
  { to: "/admin/talleres",   icon: "mdi:school-outline",         label: "Gestión de talleres",    desc: "Crear y administrar talleres" },
  { to: "/admin/mensajeria", icon: "flowbite:messages-solid",    label: "Bandeja de mensajería",  desc: "Supervisión de comunicaciones" },
  { to: "/admin/reportes",   icon: "mdi:flag-outline",           label: "Reportes de contenido",  desc: "Revisar contenido reportado por usuarios" },
  { to: "/admin/buscar",     icon: "mdi:magnify",                label: "Buscar perfiles",        desc: "Explorar estudiantes, vacantes y talleres" },
];

const MESES = { "01":"Ene","02":"Feb","03":"Mar","04":"Abr","05":"May","06":"Jun","07":"Jul","08":"Ago","09":"Sep","10":"Oct","11":"Nov","12":"Dic" };
const formatMes = (ym) => { const [y, m] = ym.split("-"); return `${MESES[m]} ${y.slice(2)}`; };

const ESTADO_LABEL = { pendiente: "Pendiente", aceptado: "Aceptada", rechazado: "Rechazada", completado: "Completada" };
const ESTADO_HEX   = ["#378ADD", "#10b981", "#f43f5e", "#f59e0b"];

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

const CARRERAS = ["Administracion", "Mecanica Automotriz"];
const NIVELES  = ["1° Medio", "2° Medio", "3° Medio", "4° Medio"];
const GENEROS  = [
  { value: "masculino",    label: "Masculino" },
  { value: "femenino",     label: "Femenino" },
  { value: "otro",         label: "Otro" },
  { value: "no_especifica", label: "No especifica" },
];

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

export default function AdminPanel() {
  const { isDark } = useDark();
  const [stats, setStats]             = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [colegio, setColegio]         = useState(null);

  // chart data
  const [postMes, setPostMes]         = useState([]);
  const [topEmp, setTopEmp]           = useState([]);
  const [estados, setEstados]         = useState([]);
  const [vacantes, setVacantes]       = useState([]);

  // chart loading
  const [loadingPostMes, setLoadingPostMes] = useState(true);
  const [loadingTopEmp, setLoadingTopEmp]   = useState(true);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [loadingVac, setLoadingVac]         = useState(true);

  // filters
  const [filtroCarrera, setFiltroCarrera] = useState("");
  const [filtroNivel, setFiltroNivel]     = useState("");
  const [filtroGenero, setFiltroGenero]   = useState("");
  const [filtroArea, setFiltroArea]       = useState("");
  const [filtroTipo, setFiltroTipo]       = useState("");

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => {}).finally(() => setLoadingStats(false));
    if (usuario.id) getColegioById(usuario.id).then(setColegio).catch(() => {});
    getChartTopEmpresas().then(setTopEmp).catch(() => {}).finally(() => setLoadingTopEmp(false));
    getChartEstadoPostulaciones().then(setEstados).catch(() => {}).finally(() => setLoadingEstados(false));
    getChartVacantesDisponibles().then(setVacantes).catch(() => {}).finally(() => setLoadingVac(false));
  }, []);

  useEffect(() => {
    setLoadingPostMes(true);
    getChartPostulacionesPorMes({ carrera: filtroCarrera, nivel: filtroNivel, genero: filtroGenero })
      .then(setPostMes).catch(() => {}).finally(() => setLoadingPostMes(false));
  }, [filtroCarrera, filtroNivel, filtroGenero]);

  useEffect(() => {
    setLoadingVac(true);
    getChartVacantesDisponibles({ area: filtroArea, tipo: filtroTipo })
      .then(setVacantes).catch(() => {}).finally(() => setLoadingVac(false));
  }, [filtroArea, filtroTipo]);

  const v = (key) => loadingStats ? "…" : (stats?.[key] ?? "—");

  // transform postMes
  const postMesData = postMes.map((r) => ({ mes: formatMes(r.mes), Postulaciones: Number(r.total) }));

  // transform topEmpresas
  const topEmpData = topEmp.map((r) => ({ empresa: r.empresa, Postulaciones: Number(r.total) }));

  // transform estados
  const estadosData = estados.map((r) => ({
    name: ESTADO_LABEL[r.estado] || r.estado,
    value: Number(r.total),
  }));

  // transform vacantes — pivot por area, separate practica vs puesto_laboral
  const areasSet = [...new Set(vacantes.map((r) => r.area))];
  const vacData = areasSet.map((area) => {
    const rows = vacantes.filter((r) => r.area === area);
    const p = rows.find((r) => r.tipo === "practica");
    const pl = rows.find((r) => r.tipo === "puesto_laboral");
    return { area, "Práctica": Number(p?.total || 0), "Puesto laboral": Number(pl?.total || 0) };
  });
  const vacAreas = [...new Set(vacantes.map((r) => r.area).filter(Boolean))];

  return (
    <div>
      <PageHeader
        title="Panel Administrativo"
        subtitle={colegio ? [colegio.nombre_institucion, colegio.region, colegio.comuna].filter(Boolean).join(" · ") : ""}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Estudiantes registrados" value={v("total_estudiantes")} sub={`${v("estudiantes_evaluados")} evaluados`} />
        <StatCard label="Talleres activos"         value={v("total_talleres_activos")} sub="De tu institución" />
        <StatCard label="Postulaciones de alumnos" value={v("total_postulaciones")} sub={`${v("total_postulaciones_pendientes")} pendientes`} />
        <StatCard label="Conversaciones supervisadas" value={v("total_conversaciones")} sub="Entre alumnos y empresas" />
      </div>

      {/* Charts */}
      <h2 className={`text-sm font-semibold ${T} mb-3`}>Analítica</h2>
      <div className={`${isDark ? "dark" : ""} mb-8`}>

        {/* Row 1: Postulaciones por mes + Top empresas */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2">
            <ChartCard
              title="Postulaciones por mes"
              loading={loadingPostMes}
              filters={
                <div className="flex gap-2 flex-wrap">
                  <FilterSelect value={filtroCarrera} onChange={setFiltroCarrera} options={CARRERAS} placeholder="Todas las carreras" isDark={isDark} />
                  <FilterSelect value={filtroNivel}   onChange={setFiltroNivel}   options={NIVELES}  placeholder="Todos los niveles"   isDark={isDark} />
                  <FilterSelect value={filtroGenero}  onChange={setFiltroGenero}  options={GENEROS}  placeholder="Todos los géneros"   isDark={isDark} />
                </div>
              }
            >
              {postMesData.length === 0
                ? <p className={`text-xs text-center py-10 ${M}`}>Sin datos para los filtros seleccionados</p>
                : <MouseTracked>
                    {(pos) => (
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={postMesData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor={C.blue} stopOpacity={0.25} />
                              <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip position={pos ?? undefined} content={<CustomTooltip isDark={isDark} />} />
                          <Area type="monotone" dataKey="Postulaciones" stroke={C.blue} strokeWidth={2} fill="url(#grad-blue)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </MouseTracked>}
            </ChartCard>
          </div>

          <ChartCard title="Top empresas" loading={loadingTopEmp}>
            {topEmpData.length === 0
              ? <p className={`text-xs text-center py-10 ${M}`}>Sin datos aún</p>
              : <MouseTracked>
                  {(pos) => (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={topEmpData} layout="vertical" margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                        <XAxis type="number" tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <YAxis type="category" dataKey="empresa" width={90} tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} />
                        <Tooltip position={pos ?? undefined} content={<CustomTooltip isDark={isDark} />} />
                        <Bar dataKey="Postulaciones" fill={C.sky} radius={[0, 4, 4, 0]} maxBarSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </MouseTracked>}
          </ChartCard>
        </div>

        {/* Row 2: Dona estados + Vacantes por área */}
        <div className="grid grid-cols-3 gap-6">
          <ChartCard title="Estado de postulaciones" loading={loadingEstados}>
            {estadosData.length === 0
              ? <p className={`text-xs text-center py-10 ${M}`}>Sin postulaciones aún</p>
              : <MouseTracked>
                  {(pos) => (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={estadosData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                          {estadosData.map((_, i) => <Cell key={i} fill={ESTADO_HEX[i % ESTADO_HEX.length]} />)}
                        </Pie>
                        <Tooltip position={pos ?? undefined} content={<CustomTooltip isDark={isDark} />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: isDark ? "#888780" : "#5F5E5A" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </MouseTracked>}
          </ChartCard>

          <div className="col-span-2">
            <ChartCard
              title="Vacantes disponibles por área"
              loading={loadingVac}
              filters={
                <div className="flex gap-2">
                  <FilterSelect value={filtroArea} onChange={setFiltroArea} options={vacAreas} placeholder="Todas las áreas" isDark={isDark} />
                  <FilterSelect value={filtroTipo} onChange={setFiltroTipo}
                    options={[{ value: "practica", label: "Práctica" }, { value: "puesto_laboral", label: "Puesto Laboral" }]}
                    placeholder="Todos los tipos" isDark={isDark} />
                </div>
              }
            >
              {vacData.length === 0
                ? <p className={`text-xs text-center py-10 ${M}`}>Sin vacantes activas</p>
                : <>
                    <div className={`flex gap-4 mb-2 text-xs ${isDark ? "text-[#888780]" : "text-[#5F5E5A]"}`}>
                      <span className="flex items-center gap-1.5"><span style={{ width:8, height:8, borderRadius:2, background:C.blue,  display:"inline-block" }} />Práctica</span>
                      <span className="flex items-center gap-1.5"><span style={{ width:8, height:8, borderRadius:2, background:C.amber, display:"inline-block" }} />Puesto laboral</span>
                    </div>
                    <MouseTracked>
                      {(pos) => (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={vacData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                            <XAxis dataKey="area" interval={0} tickFormatter={(v) => v.length > 12 ? v.slice(0, 12) + "." : v} tick={{ fontSize: 11, fill: C.axis, angle: -45, textAnchor: "end", dy: 4, dx: -4 }} axisLine={false} tickLine={false} height={70} />
                            <YAxis tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip position={pos ?? undefined} content={<CustomTooltip isDark={isDark} />} />
                            <Bar dataKey="Práctica"       fill={C.blue}  radius={[4, 4, 0, 0]} maxBarSize={28} />
                            <Bar dataKey="Puesto laboral" fill={C.amber} radius={[4, 4, 0, 0]} maxBarSize={28} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </MouseTracked>
                  </>}
            </ChartCard>
          </div>
        </div>
      </div>

      {/* Resumen + Progreso */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <Card>
          <p className={`text-sm font-semibold ${T} mb-3`}>Resumen semestral</p>
          <div className={`flex flex-col gap-2 text-xs ${M}`}>
            {[
              { label: "Estudiantes evaluados",    value: `${v("estudiantes_evaluados")} / ${v("total_estudiantes")}` },
              { label: "Evaluaciones registradas", value: v("total_evaluaciones") },
              { label: "Talleres activos",          value: v("total_talleres_activos") },
              { label: "Postulaciones realizadas",  value: v("total_postulaciones") },
              { label: "Conversaciones activas",    value: v("total_conversaciones") },
            ].map((row) => (
              <div key={row.label} className={`flex justify-between pb-2 border-b ${B} last:border-0`}>
                <span>{row.label}</span>
                <strong className={T}>{row.value}</strong>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className={`text-sm font-semibold ${T} mb-3`}>Progreso de evaluaciones</p>
          {loadingStats
            ? <div className={`flex items-center justify-center py-4 ${M}`}><Icon icon="mdi:loading" width={20} className="animate-spin" /></div>
            : <>
                <div className="flex justify-between items-end mb-2">
                  <span className={`text-xs ${M}`}>Estudiantes evaluados</span>
                  <span className={`text-sm font-semibold ${T}`}>{v("estudiantes_evaluados")} / {v("total_estudiantes")}</span>
                </div>
                <div className={`w-full h-2 rounded-full ${S} overflow-hidden`}>
                  <div className="h-full rounded-full bg-[#378ADD] transition-all"
                    style={{ width: stats?.total_estudiantes > 0 ? `${Math.round((stats.estudiantes_evaluados / stats.total_estudiantes) * 100)}%` : "0%" }} />
                </div>
                <p className={`text-xs ${M} mt-2 text-right`}>
                  {stats?.total_estudiantes > 0 ? `${Math.round((stats.estudiantes_evaluados / stats.total_estudiantes) * 100)}% completado` : "Sin estudiantes aún"}
                </p>
              </>}
        </Card>
      </div>

      {/* Quick links — compactos al fondo */}
      <h2 className={`text-sm font-semibold ${T} mb-3`}>Acceso rápido</h2>
      <div className="grid grid-cols-4 gap-2">
        {quickLinks.map((ql, i) => (
          <Link key={i} to={ql.to}>
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
