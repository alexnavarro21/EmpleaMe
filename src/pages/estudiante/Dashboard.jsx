import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, StatCard, PageHeader } from "../../components/ui";

const feed = [
  {
    icon: "fluent:handshake-32-regular",
    title: "Nuevo match con Automotriz Salinas",
    desc: "Tu perfil interesó a Automotriz Salinas para su práctica en Gestión Administrativa",
    time: "Hace 2 horas",
    badge: { label: "Match", color: "blue" },
  },
  {
    icon: "mdi:clipboard-list-outline",
    title: "Evaluación recibida",
    desc: "Prof. Morales evaluó tus competencias técnicas: 6.2 / 7.0",
    time: "Ayer",
    badge: { label: "Evaluación", color: "green" },
  },
  {
    icon: "solar:medal-ribbons-star-bold-duotone",
    title: "Insignia obtenida",
    desc: 'Completaste tu perfil al 100% y ganaste la insignia "Perfil Destacado"',
    time: "Hace 3 días",
    badge: { label: "Logro", color: "yellow" },
  },
  {
    icon: "temaki:suitcase",
    title: "Nueva práctica disponible",
    desc: "ContaServ Chile publicó una práctica en Administración de Oficina que coincide con tu perfil",
    time: "Hace 4 días",
    badge: { label: "Práctica", color: "orange" },
  },
];

const practices = [
  { company: "Automotriz Salinas", role: "Asistente Administrativo", area: "Administración", match: 92 },
  { company: "ContaServ Chile", role: "Practicante Contabilidad", area: "Contabilidad", match: 85 },
  { company: "Mutual de Seguridad", role: "Asistente de Gestión", area: "Administración", match: 78 },
];

export default function EstudianteDashboard() {
  const { isDark } = useDark();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  return (
    <div>
      <PageHeader
        title="Hola, Catalina"
        subtitle="C.E. Cardenal J.M. Caro · Administración · 4to semestre"
        action={
          <Link
            to="/estudiante/perfil"
            className="text-sm bg-[#185FA5] hover:bg-[#0C447C] text-[#E6F1FB] px-4 py-2 rounded-lg transition-colors"
          >
            Ver mi perfil
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Postulaciones" value="3" sub="+1 esta semana" />
        <StatCard label="Vistas al perfil" value="24" sub="Últimos 30 días" />
        <StatCard label="Matches activos" value="7" sub="Empresas interesadas" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Feed */}
        <div className="col-span-2 flex flex-col gap-4">
          <h2 className={`text-sm font-semibold ${T}`}>Actividad reciente</h2>
          {feed.map((item) => (
            <Card key={item.title}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                  <Icon icon={item.icon} width={20} className="text-[#378ADD]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className={`text-sm font-medium ${T}`}>{item.title}</p>
                    <Badge color={item.badge.color}>{item.badge.label}</Badge>
                  </div>
                  <p className={`text-xs ${M}`}>{item.desc}</p>
                  <p className={`text-xs ${M} mt-2`}>{item.time}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <Card>
            <p className={`text-sm font-medium ${T} mb-3`}>Completitud del perfil</p>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs ${M}`}>72%</span>
              <span className="text-xs text-[#378ADD]">Faltan 3 pasos</span>
            </div>
            <div className={`w-full h-2 rounded-full ${S}`}>
              <div className="h-2 bg-[#378ADD] rounded-full" style={{ width: "72%" }} />
            </div>
            <ul className={`mt-3 flex flex-col gap-1.5 text-xs ${M}`}>
              {[
                { done: true, label: "Datos personales" },
                { done: true, label: "Info académica" },
                { done: true, label: "CV subido" },
                { done: false, label: "Video de presentación" },
                { done: false, label: "Subir evidencias" },
                { done: false, label: "Habilidades completas" },
              ].map((s) => (
                <li key={s.label} className="flex items-center gap-2">
                  <Icon
                    icon={s.done ? "mdi:check-circle" : "mdi:circle-outline"}
                    width={14}
                    className={s.done ? "text-green-500" : isDark ? "text-[#3a3a38]" : "text-[#D3D1C7]"}
                  />
                  {s.label}
                </li>
              ))}
            </ul>
            <Link to="/estudiante/perfil" className="block text-center mt-4 text-xs text-[#378ADD] hover:underline">
              Completar perfil →
            </Link>
          </Card>

          <Card>
            <p className={`text-sm font-medium ${T} mb-3`}>Prácticas recomendadas</p>
            {practices.map((p, i) => (
              <div key={p.company} className={`${i < practices.length - 1 ? `pb-3 mb-3 border-b ${B}` : ""}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`text-sm font-medium ${T}`}>{p.company}</p>
                  <span className="text-xs text-[#378ADD] font-medium">{p.match}%</span>
                </div>
                <p className={`text-xs ${M} mb-1`}>{p.role}</p>
                <Badge color="blue">{p.area}</Badge>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
