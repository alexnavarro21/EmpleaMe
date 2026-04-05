import { Link } from "react-router-dom";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, StatCard, PageHeader } from "../../components/ui";

const feed = [
  {
    icon: "🎯",
    title: "Nuevo match con TechCorp",
    desc: "Tu perfil interesó a TechCorp para su práctica en Desarrollo Web",
    time: "Hace 2 horas",
    badge: { label: "Match", color: "blue" },
  },
  {
    icon: "📋",
    title: "Evaluación recibida",
    desc: "Prof. García evaluó tus competencias técnicas: 4.5/5.0",
    time: "Ayer",
    badge: { label: "Evaluación", color: "green" },
  },
  {
    icon: "🏅",
    title: "Insignia obtenida",
    desc: 'Completaste tu perfil al 100% y ganaste la insignia "Perfil Destacado"',
    time: "Hace 3 días",
    badge: { label: "Logro", color: "yellow" },
  },
  {
    icon: "💼",
    title: "Nueva práctica disponible",
    desc: "DataSoft publicó una práctica en Análisis de Datos que coincide con tu perfil",
    time: "Hace 4 días",
    badge: { label: "Práctica", color: "orange" },
  },
];

const practices = [
  { company: "TechCorp", role: "Practicante Frontend", area: "Desarrollo Web", match: 92 },
  { company: "DataSoft", role: "Practicante Datos", area: "Análisis de Datos", match: 85 },
  { company: "CloudSys", role: "Practicante DevOps", area: "Infraestructura", match: 78 },
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
        title="Hola, Carlos 👋"
        subtitle="Instituto Técnico Nacional · Desarrollo de Software · Sem. 6"
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

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Feed */}
        <div className="col-span-2 flex flex-col gap-4">
          <h2 className={`text-sm font-semibold ${T}`}>Actividad reciente</h2>
          {feed.map((item) => (
            <Card key={item.title}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${S}`}>
                  {item.icon}
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
          {/* Profile completion */}
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
                  <span className={s.done ? "text-green-500" : isDark ? "text-[#3a3a38]" : "text-[#D3D1C7]"}>
                    {s.done ? "✓" : "○"}
                  </span>
                  {s.label}
                </li>
              ))}
            </ul>
            <Link
              to="/estudiante/perfil"
              className="block text-center mt-4 text-xs text-[#378ADD] hover:underline"
            >
              Completar perfil →
            </Link>
          </Card>

          {/* Recommended practices */}
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
