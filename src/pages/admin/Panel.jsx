import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, StatCard, PageHeader } from "../../components/ui";

const recentActivity = [
  { icon: "mynaui:user-solid", text: "Valentina Soto completó su registro como estudiante", time: "Hace 10 min" },
  { icon: "cuida:building-outline", text: "Automotriz Salinas publicó una nueva vacante: Practicante Mecánico", time: "Hace 32 min" },
  { icon: "mdi:clipboard-list-outline", text: "Prof. Morales registró evaluación para 4 estudiantes", time: "Hace 1 hora" },
  { icon: "icon-park-outline:excel", text: "Se importaron 42 notas del semestre 2024-II", time: "Hace 3 horas" },
  { icon: "fluent:handshake-32-regular", text: "Felipe Rojas y Automotriz Salinas iniciaron conversación", time: "Hace 5 horas" },
  { icon: "hugeicons:brain-02", text: "Se cargó el test DISC para los estudiantes de 2do año", time: "Ayer" },
];

const alerts = [
  { text: "3 estudiantes con perfil incompleto por más de 30 días" },
  { text: "2 vacantes sin respuesta llevan más de 14 días activas" },
  { text: "Pendiente revisión de 5 evidencias nuevas" },
];

const quickLinks = [
  { to: "/admin/usuarios", icon: "mdi:account-group-outline", label: "Gestión de usuarios", desc: "Ver y administrar cuentas" },
  { to: "/admin/evaluaciones", icon: "mdi:clipboard-list-outline", label: "Registrar evaluaciones", desc: "Competencias técnicas y blandas" },
  { to: "/admin/notas", icon: "icon-park-outline:excel", label: "Importar notas", desc: "Excel / CSV con calificaciones" },
  { to: "/admin/tests", icon: "hugeicons:brain-02", label: "Tests socioemocionales", desc: "Cargar y asignar tests" },
  { to: "/admin/mensajeria", icon: "flowbite:messages-solid", label: "Bandeja de mensajería", desc: "Supervisión de comunicaciones" },
  { to: "/admin/monitoreo", icon: "material-symbols:signal-cellular-alt", label: "Monitoreo", desc: "Estado general de la plataforma" },
];

export default function AdminPanel() {
  const { isDark } = useDark();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  return (
    <div>
      <PageHeader
        title="Panel Administrativo"
        subtitle="C.E. Cardenal José María Caro · Lo Espejo, Santiago"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Estudiantes registrados" value="86" sub="+6 este mes" />
        <StatCard label="Empresas activas" value="14" sub="+2 este mes" />
        <StatCard label="Prácticas en curso" value="11" sub="7 finalizadas" />
        <StatCard label="Evaluaciones pendientes" value="24" sub="Por calificar" subColor="text-orange-500" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h2 className={`text-sm font-semibold ${T} mb-3`}>Acceso rápido</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {quickLinks.map((ql) => (
              <Link key={ql.to} to={ql.to}>
                <Card className="hover:border-[#378ADD] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${S}`}>
                      <Icon icon={ql.icon} width={20} className="text-[#378ADD]" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${T}`}>{ql.label}</p>
                      <p className={`text-xs ${M}`}>{ql.desc}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <h2 className={`text-sm font-semibold ${T} mb-3`}>Actividad reciente</h2>
          <Card className="p-0">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 px-5 py-3.5 ${i < recentActivity.length - 1 ? `border-b ${B}` : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                  <Icon icon={item.icon} width={16} className="text-[#378ADD]" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${T}`}>{item.text}</p>
                  <p className={`text-xs ${M} mt-0.5`}>{item.time}</p>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <p className={`text-sm font-semibold ${T} mb-3`}>Alertas</p>
            {alerts.map((a, i) => (
              <div key={i} className={`flex items-start gap-2 mb-3 last:mb-0`}>
                <Icon icon="mdi:alert-circle-outline" width={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
                <p className={`text-xs ${M} leading-snug`}>{a.text}</p>
              </div>
            ))}
          </Card>

          <Card>
            <p className={`text-sm font-semibold ${T} mb-3`}>Estado del sistema</p>
            {[
              { label: "Plataforma", status: "Operativo", color: "green" },
              { label: "Base de datos", status: "Operativo", color: "green" },
              { label: "Almacenamiento", status: "67% usado", color: "yellow" },
              { label: "Backups", status: "Al día", color: "green" },
            ].map((item) => (
              <div key={item.label} className={`flex justify-between items-center mb-2 last:mb-0`}>
                <span className={`text-xs ${M}`}>{item.label}</span>
                <Badge color={item.color}>{item.status}</Badge>
              </div>
            ))}
          </Card>

          <Card>
            <p className={`text-sm font-semibold ${T} mb-3`}>Resumen semestral</p>
            <div className={`flex flex-col gap-2 text-xs ${M}`}>
              {[
                { label: "Estudiantes evaluados", value: "62 / 86" },
                { label: "Notas importadas", value: "86" },
                { label: "Tests aplicados", value: "2" },
                { label: "Matches realizados", value: "21" },
              ].map((row) => (
                <div key={row.label} className={`flex justify-between pb-2 border-b ${B} last:border-0`}>
                  <span>{row.label}</span>
                  <strong className={T}>{row.value}</strong>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
