import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, StatCard, PageHeader } from "../../components/ui";

const activityLog = [
  { icon: "mynaui:user-solid", text: "Felipe Rojas inició sesión", time: "Hace 5 min" },
  { icon: "fluent:handshake-32-regular", text: "Nuevo match: Catalina Muñoz — ContaServ Chile", time: "Hace 12 min" },
  { icon: "cuida:building-outline", text: "Automotriz Salinas publicó nueva vacante", time: "Hace 28 min" },
  { icon: "mynaui:user-solid", text: "Nuevo registro: empresa Mecánica del Sur", time: "Hace 45 min" },
  { icon: "mdi:folder-outline", text: "Diego Castillo subió evidencia (38.7 MB)", time: "Hace 1h" },
  { icon: "mdi:clipboard-list-outline", text: "Prof. Morales evaluó a Valentina Soto", time: "Hace 2h" },
  { icon: "mynaui:user-solid", text: "Sebastián Contreras inició sesión", time: "Hace 3h" },
  { icon: "icon-park-outline:excel", text: "Importación de notas completada: 42 registros", time: "Hace 4h" },
];

function BarMeter({ label, value, max, color = "#378ADD" }) {
  const { isDark } = useDark();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F0F4F8]";
  const pct = Math.round((value / max) * 100);

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-xs ${M}`}>{label}</span>
        <span className={`text-xs font-medium ${T}`}>{value} / {max}</span>
      </div>
      <div className={`w-full h-2 rounded-full ${S}`}>
        <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
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
          <button className="text-sm text-[#378ADD] hover:underline flex items-center gap-1">
            <Icon icon="mdi:refresh" width={16} />
            Actualizar
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Usuarios activos ahora" value="9" sub="3 estudiantes, 2 empresas" />
        <StatCard label="Sesiones hoy" value="34" sub="+8 vs ayer" />
        <StatCard label="Acciones hoy" value="121" sub="Registros, matches, etc." />
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                  <Icon icon={item.icon} width={16} className="text-[#378ADD]" />
                </div>
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
          <Card>
            <p className={`text-sm font-semibold ${T} mb-3 flex items-center gap-2`}>
              <Icon icon="material-symbols:signal-cellular-alt" width={16} className="text-[#378ADD]" />
              Estado del sistema
            </p>
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

          <Card>
            <p className={`text-sm font-semibold ${T} mb-4`}>Uso de la plataforma</p>
            <BarMeter label="Perfiles completados" value={62} max={86} />
            <BarMeter label="Vacantes con postulantes" value={11} max={14} />
            <BarMeter label="Evaluaciones completadas" value={62} max={86} color="#22c55e" />
            <BarMeter label="Tests completados" value={61} max={86} color="#f59e0b" />
          </Card>

          <Card>
            <p className={`text-sm font-semibold ${T} mb-3`}>Resumen esta semana</p>
            {[
              { label: "Nuevos registros", value: "+6" },
              { label: "Nuevas vacantes", value: "+2" },
              { label: "Matches realizados", value: "+8" },
              { label: "Evaluaciones", value: "+14" },
              { label: "Evidencias subidas", value: "+11" },
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
