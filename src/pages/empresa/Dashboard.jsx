import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, StatCard, PageHeader, PrimaryButton } from "../../components/ui";

const vacantes = [
  { title: "Asistente Administrativo", area: "Administración", modality: "Presencial", applicants: 9, status: "activa" },
  { title: "Practicante Mecánico Automotriz", area: "Mecánica", modality: "Presencial", applicants: 6, status: "activa" },
  { title: "Auxiliar Contable", area: "Contabilidad", modality: "Presencial", applicants: 3, status: "cerrada" },
];

const postulantes = [
  { name: "Catalina Muñoz", career: "Administración", gpa: 6.5, match: 95, status: "nuevo" },
  { name: "Felipe Rojas", career: "Mecánica Automotriz", gpa: 6.2, match: 92, status: "revisado" },
  { name: "Valentina Soto", career: "Administración", gpa: 5.9, match: 88, status: "nuevo" },
  { name: "Sebastián Contreras", career: "Mecánica Automotriz", gpa: 5.8, match: 84, status: "entrevista" },
];

const statusColor = { activa: "green", cerrada: "gray", pausada: "yellow" };
const postColor = { nuevo: "blue", revisado: "gray", entrevista: "orange" };

export default function EmpresaDashboard() {
  const { isDark } = useDark();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  return (
    <div>
      <PageHeader
        title="Dashboard Empresa"
        subtitle="Automotriz Salinas · Lo Espejo, Santiago"
        action={
          <Link
            to="/empresa/publicar"
            className="flex items-center gap-2 text-sm bg-[#185FA5] hover:bg-[#0C447C] text-[#E6F1FB] px-4 py-2 rounded-lg transition-colors"
          >
            <Icon icon="mdi:plus" width={16} />
            Publicar vacante
          </Link>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Vacantes activas" value="2" sub="1 cerrada este mes" />
        <StatCard label="Total postulantes" value="18" sub="+4 esta semana" />
        <StatCard label="Perfiles vistos" value="41" sub="Últimos 30 días" />
        <StatCard label="Matches sugeridos" value="12" sub="Estudiantes compatibles" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-sm font-semibold ${T} flex items-center gap-2`}>
              <Icon icon="mdi:clipboard-list-outline" width={16} className="text-[#378ADD]" />
              Mis vacantes
            </h2>
            <Link to="/empresa/publicar" className="text-xs text-[#378ADD] hover:underline">Ver todas</Link>
          </div>
          <div className="flex flex-col gap-3">
            {vacantes.map((v) => (
              <div key={v.title} className={`p-3 rounded-lg border ${B}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm font-medium ${T}`}>{v.title}</p>
                  <Badge color={statusColor[v.status]}>{v.status}</Badge>
                </div>
                <p className={`text-xs ${M} mb-2`}>{v.area} · {v.modality}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${M}`}>{v.applicants} postulantes</span>
                  <Link to="/empresa/buscador" className="text-xs text-[#378ADD] hover:underline">
                    Ver postulantes →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-sm font-semibold ${T} flex items-center gap-2`}>
              <Icon icon="mdi:account-group-outline" width={16} className="text-[#378ADD]" />
              Postulantes recientes
            </h2>
            <Link to="/empresa/buscador" className="text-xs text-[#378ADD] hover:underline">Ver todos</Link>
          </div>
          <div className="flex flex-col gap-3">
            {postulantes.map((p) => (
              <div key={p.name} className={`flex items-center gap-3 p-3 rounded-lg border ${B}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                  <Icon icon="mynaui:user-solid" width={20} className="text-[#378ADD]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${T} truncate`}>{p.name}</p>
                    <Badge color={postColor[p.status]}>{p.status}</Badge>
                  </div>
                  <p className={`text-xs ${M}`}>{p.career} · Nota: {p.gpa.toFixed(1)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-[#378ADD]">{p.match}%</p>
                  <p className={`text-xs ${M}`}>match</p>
                </div>
                <Link to="/empresa/candidato/1" className={`${M} hover:text-[#378ADD] transition-colors flex-shrink-0`}>
                  <Icon icon="mdi:chevron-right" width={20} />
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className={`mt-6 p-4 rounded-xl border ${B} ${isDark ? "bg-[#262624]" : "bg-white"}`}>
        <p className={`text-sm font-semibold ${T} mb-3`}>Acciones rápidas</p>
        <div className="flex gap-3 flex-wrap">
          <Link to="/empresa/publicar">
            <PrimaryButton className="flex items-center gap-2">
              <Icon icon="mdi:plus" width={16} />
              Nueva vacante
            </PrimaryButton>
          </Link>
          <Link to="/empresa/buscador">
            <PrimaryButton className="bg-[#378ADD] hover:bg-[#185FA5] flex items-center gap-2">
              <Icon icon="mdi:search" width={16} />
              Buscar estudiantes
            </PrimaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
