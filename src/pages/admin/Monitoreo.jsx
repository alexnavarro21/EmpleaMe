import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, StatCard, PageHeader } from "../../components/ui";

const activityLog = [
  { type: "login", text: "Carlos Mendoza inició sesión", time: "Hace 5 min", icon: "🔑" },
  { type: "match", text: "Nuevo match: María López ↔ TechCorp", time: "Hace 12 min", icon: "🎯" },
  { type: "vacante", text: "DataSoft publicó nueva vacante", time: "Hace 28 min", icon: "📋" },
  { type: "registro", text: "Nuevo registro: empresa CloudSys", time: "Hace 45 min", icon: "🏢" },
  { type: "evidencia", text: "Diego Ríos subió evidencia (38.7 MB)", time: "Hace 1h", icon: "📁" },
  { type: "evaluacion", text: "Prof. García evaluó a Luis García", time: "Hace 2h", icon: "⭐" },
  { type: "login", text: "Ana Torres inició sesión", time: "Hace 3h", icon: "🔑" },
  { type: "notas", text: "Importación de notas completada: 48 registros", time: "Hace 4h", icon: "📊" },
];

function BarMeter({ label, value, max, color = "#378ADD" }) {
  const { isDark } = useDark();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";
  const pct = Math.round((value / max) * 100);

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-xs ${M}`}>{label}</span>
        <span className={`text-xs font-medium ${T}`}>{value} / {max}</span>
      </div>
      <div className={`w-full h-2 rounded-full ${S}`}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function AdminMonitoreo() {
  const { isDark } = useDark();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  return (
    <div>
      <PageHeader
        title="Monitoreo de la Plataforma"
        subtitle="Estado en tiempo real · Actualizado hace 2 min"
        action={
          <button className="text-sm text-[#378ADD] hover:underline">Actualizar</button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Usuarios activos ahora" value="14" sub="↑ 3 en última hora" />
        <StatCard label="Sesiones hoy" value="67" sub="↑ 12 vs ayer" />
        <StatCard label="Acciones hoy" value="234" sub="Registros, matches, etc." />
        <StatCard label="Errores del sistema" value="0" sub="Todo operativo" subColor="text-green-500" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Activity log */}
        <div className="col-span-2">
          <h2 className={`text-sm font-semibold ${T} mb-3`}>Registro de actividad en tiempo real</h2>
          <Card className="p-0">
            {activityLog.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-5 py-3 ${i < activityLog.length - 1 ? `border-b ${B}` : ""}`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${T}`}>{item.text}</p>
                </div>
                <span className={`text-xs ${M} flex-shrink-0`}>{item.time}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Right panels */}
        <div className="flex flex-col gap-4">
          {/* System health */}
          <Card>
            <p className={`text-sm font-semibold ${T} mb-3`}>Estado del sistema</p>
            {[
              { label: "API", status: "100% uptime", color: "green" },
              { label: "Base de datos", status: "Operativa", color: "green" },
              { label: "Almacenamiento", status: "67% usado", color: "yellow" },
              { label: "Cola de emails", status: "0 pendientes", color: "green" },
              { label: "Backups", status: "Último: hoy 3am", color: "green" },
            ].map((item) => (
              <div key={item.label} className={`flex justify-between items-center py-1.5 border-b ${B} last:border-0`}>
                <span className={`text-xs ${M}`}>{item.label}</span>
                <Badge color={item.color}>{item.status}</Badge>
              </div>
            ))}
          </Card>

          {/* Usage meters */}
          <Card>
            <p className={`text-sm font-semibold ${T} mb-4`}>Uso de la plataforma</p>
            <BarMeter label="Estudiantes con perfil completo" value={89} max={142} />
            <BarMeter label="Vacantes con postulantes" value={18} max={23} />
            <BarMeter label="Evaluaciones completadas" value={111} max={142} color="#22c55e" />
            <BarMeter label="Tests socioemocionales" value={89} max={142} color="#f59e0b" />
          </Card>

          {/* Weekly summary */}
          <Card>
            <p className={`text-sm font-semibold ${T} mb-3`}>Resumen esta semana</p>
            {[
              { label: "Nuevos registros", value: "+8" },
              { label: "Nuevas vacantes", value: "+3" },
              { label: "Matches realizados", value: "+11" },
              { label: "Evaluaciones", value: "+24" },
              { label: "Evidencias subidas", value: "+17" },
            ].map((item) => (
              <div key={item.label} className={`flex justify-between text-xs py-1.5 border-b ${B} last:border-0`}>
                <span className={M}>{item.label}</span>
                <span className="text-[#378ADD] font-medium">{item.value}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
