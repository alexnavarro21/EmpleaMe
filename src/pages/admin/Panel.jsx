import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, StatCard, PageHeader } from "../../components/ui";
import { getAdminStats } from "../../services/api";

const quickLinks = [
  { to: "/admin/usuarios", icon: "mdi:account-group-outline", label: "Gestión de usuarios", desc: "Ver y administrar cuentas" },
  { to: "/admin/evaluaciones", icon: "mdi:clipboard-list-outline", label: "Registrar evaluaciones", desc: "Competencias técnicas y blandas" },
  { to: "/admin/notas", icon: "icon-park-outline:excel", label: "Importar notas", desc: "Excel / CSV con calificaciones" },
  { to: "/admin/tests", icon: "hugeicons:brain-02", label: "Tests socioemocionales", desc: "Cargar y asignar tests" },
  { to: "/admin/talleres", icon: "mdi:school-outline", label: "Gestión de talleres", desc: "Crear y administrar talleres" },
  { to: "/admin/mensajeria", icon: "flowbite:messages-solid", label: "Bandeja de mensajería", desc: "Supervisión de comunicaciones" },
  { to: "/admin/monitoreo", icon: "material-symbols:signal-cellular-alt", label: "Monitoreo", desc: "Estado general de la plataforma" },
];

export default function AdminPanel() {
  const { isDark } = useDark();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  const v = (key) => {
    if (loadingStats) return "…";
    return stats?.[key] ?? "—";
  };

  return (
    <div>
      <PageHeader
        title="Panel Administrativo"
        subtitle="C.E. Cardenal José María Caro · Lo Espejo, Santiago"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Estudiantes registrados"
          value={v("total_estudiantes")}
          sub={`${v("estudiantes_evaluados")} evaluados`}
        />
        <StatCard
          label="Empresas activas"
          value={v("total_empresas")}
          sub="En plataforma"
        />
        <StatCard
          label="Vacantes activas"
          value={v("total_vacantes_activas")}
          sub={`${v("total_postulaciones")} postulaciones pendientes`}
        />
        <StatCard
          label="Conversaciones"
          value={v("total_conversaciones")}
          sub={`${v("total_evaluaciones")} evaluaciones registradas`}
          subColor="text-orange-500"
        />
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
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <p className={`text-sm font-semibold ${T} mb-3`}>Estado del sistema</p>
            {[
              { label: "Plataforma", status: "Operativo", color: "green" },
              { label: "Base de datos", status: "Operativo", color: "green" },
              { label: "API Railway", status: "Operativo", color: "green" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center mb-2 last:mb-0">
                <span className={`text-xs ${M}`}>{item.label}</span>
                <Badge color={item.color}>{item.status}</Badge>
              </div>
            ))}
          </Card>

          <Card>
            <p className={`text-sm font-semibold ${T} mb-3`}>Resumen semestral</p>
            <div className={`flex flex-col gap-2 text-xs ${M}`}>
              {[
                { label: "Estudiantes evaluados", value: `${v("estudiantes_evaluados")} / ${v("total_estudiantes")}` },
                { label: "Evaluaciones registradas", value: v("total_evaluaciones") },
                { label: "Conversaciones activas", value: v("total_conversaciones") },
                { label: "Vacantes publicadas", value: v("total_vacantes_activas") },
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
