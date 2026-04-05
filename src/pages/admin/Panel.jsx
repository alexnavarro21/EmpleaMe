import { Link } from "react-router-dom";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, StatCard, PageHeader } from "../../components/ui";

const recentActivity = [
  { icon: "👤", text: "María López completó su registro como estudiante", time: "Hace 10 min", type: "registro" },
  { icon: "🏢", text: "TechCorp publicó una nueva vacante: Practicante Frontend", time: "Hace 32 min", type: "vacante" },
  { icon: "📋", text: "Prof. García registró evaluación para 5 estudiantes", time: "Hace 1 hora", type: "evaluacion" },
  { icon: "📊", text: "Se importaron 48 notas del semestre 2024-II", time: "Hace 3 horas", type: "notas" },
  { icon: "🤝", text: "Carlos Mendoza y TechCorp iniciaron conversación", time: "Hace 5 horas", type: "match" },
  { icon: "🧪", text: "Se cargó el test socioemocional DISC para 2do año", time: "Ayer", type: "test" },
];

const alerts = [
  { text: "3 estudiantes con perfil incompleto por más de 30 días", color: "yellow" },
  { text: "2 vacantes sin respuesta llevan más de 14 días activas", color: "orange" },
  { text: "Pendiente revisión de 5 evidencias nuevas", color: "blue" },
];

const quickLinks = [
  { to: "/admin/usuarios", icon: "👥", label: "Gestión de usuarios", desc: "Ver y administrar cuentas" },
  { to: "/admin/evaluaciones", icon: "📋", label: "Registrar evaluaciones", desc: "Competencias técnicas y blandas" },
  { to: "/admin/notas", icon: "📊", label: "Importar notas", desc: "Excel / CSV con calificaciones" },
  { to: "/admin/tests", icon: "🧪", label: "Tests socioemocionales", desc: "Cargar y asignar tests" },
  { to: "/admin/mensajeria", icon: "💬", label: "Bandeja de mensajería", desc: "Supervisión de comunicaciones" },
  { to: "/admin/monitoreo", icon: "📈", label: "Monitoreo", desc: "Estado general de la plataforma" },
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
        subtitle="Instituto Técnico Nacional · Admin/Profesor"
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Estudiantes registrados" value="142" sub="+8 este mes" />
        <StatCard label="Empresas activas" value="23" sub="+2 este mes" />
        <StatCard label="Prácticas en curso" value="17" sub="9 finalizadas" />
        <StatCard label="Evaluaciones pendientes" value="31" sub="Por calificar" subColor="text-orange-500" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Quick links */}
        <div className="col-span-2">
          <h2 className={`text-sm font-semibold ${T} mb-3`}>Acceso rápido</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {quickLinks.map((ql) => (
              <Link key={ql.to} to={ql.to}>
                <Card className={`hover:border-[#378ADD] transition-colors cursor-pointer`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ql.icon}</span>
                    <div>
                      <p className={`text-sm font-medium ${T}`}>{ql.label}</p>
                      <p className={`text-xs ${M}`}>{ql.desc}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Recent activity */}
          <h2 className={`text-sm font-semibold ${T} mb-3`}>Actividad reciente</h2>
          <Card className="p-0">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 px-5 py-3.5 ${i < recentActivity.length - 1 ? `border-b ${B}` : ""}`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm ${T}`}>{item.text}</p>
                  <p className={`text-xs ${M} mt-0.5`}>{item.time}</p>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Alerts sidebar */}
        <div className="flex flex-col gap-4">
          <Card>
            <p className={`text-sm font-semibold ${T} mb-3`}>Alertas</p>
            {alerts.map((a, i) => (
              <div key={i} className={`flex items-start gap-2 mb-3 last:mb-0`}>
                <span className="text-base mt-0.5">⚠️</span>
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
              <div className={`flex justify-between pb-2 border-b ${B}`}>
                <span>Estudiantes evaluados</span>
                <strong className={T}>89 / 142</strong>
              </div>
              <div className={`flex justify-between pb-2 border-b ${B}`}>
                <span>Notas importadas</span>
                <strong className={T}>142</strong>
              </div>
              <div className={`flex justify-between pb-2 border-b ${B}`}>
                <strong className="flex justify-between">Tests aplicados</strong>
                <strong className={T}>3</strong>
              </div>
              <div className="flex justify-between">
                <span>Matches realizados</span>
                <strong className={T}>34</strong>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
