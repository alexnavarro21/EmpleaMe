import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, StatCard, PageHeader } from "../../components/ui";
import { getAdminStats, getColegioById } from "../../services/api";

const quickLinks = [
  { to: "/admin/usuarios",     icon: "mdi:account-group-outline",    label: "Gestión de usuarios",     desc: "Ver y administrar cuentas" },
  { to: "/admin/evaluaciones", icon: "mdi:clipboard-list-outline",   label: "Registrar evaluaciones",  desc: "Competencias técnicas y socioemocionales" },
  { to: "/admin/notas",        icon: "icon-park-outline:excel",      label: "Importar notas",          desc: "Excel / CSV con calificaciones" },
  { to: "/admin/tests",        icon: "hugeicons:brain-02",           label: "Tests socioemocionales",  desc: "Cargar y asignar tests" },
  { to: "/admin/talleres",     icon: "mdi:school-outline",           label: "Gestión de talleres",     desc: "Crear y administrar talleres" },
  { to: "/admin/mensajeria",   icon: "flowbite:messages-solid",      label: "Bandeja de mensajería",   desc: "Supervisión de comunicaciones" },
  { to: "/admin/reportes",     icon: "mdi:flag-outline",             label: "Reportes de contenido",   desc: "Revisar contenido reportado por usuarios" },
  { to: "/admin/buscar",       icon: "mdi:magnify",                  label: "Buscar perfiles",         desc: "Explorar estudiantes, vacantes y talleres" },
];

export default function AdminPanel() {
  const { isDark } = useDark();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [colegio, setColegio] = useState(null);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoadingStats(false));
    if (usuario.id) {
      getColegioById(usuario.id).then(setColegio).catch(() => {});
    }
  }, []);

  const v = (key) => {
    if (loadingStats) return "…";
    return stats?.[key] ?? "—";
  };

  return (
    <div>
      <PageHeader
        title="Panel Administrativo"
        subtitle={colegio ? [colegio.nombre_institucion, colegio.region, colegio.comuna].filter(Boolean).join(" · ") : ""}
      />

      {/* Stats — todos relevantes al colegio */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Estudiantes registrados"
          value={v("total_estudiantes")}
          sub={`${v("estudiantes_evaluados")} evaluados`}
        />
        <StatCard
          label="Talleres activos"
          value={v("total_talleres_activos")}
          sub="De tu institución"
        />
        <StatCard
          label="Postulaciones de alumnos"
          value={v("total_postulaciones")}
          sub={`${v("total_postulaciones_pendientes")} pendientes`}
        />
        <StatCard
          label="Conversaciones supervisadas"
          value={v("total_conversaciones")}
          sub="Entre alumnos y empresas"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Acceso rápido */}
        <div className="col-span-2">
          <h2 className={`text-sm font-semibold ${T} mb-3`}>Acceso rápido</h2>
          <div className="grid grid-cols-2 gap-3">
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

        {/* Lateral derecho */}
        <div className="flex flex-col gap-4">
          <Card>
            <p className={`text-sm font-semibold ${T} mb-3`}>Resumen semestral</p>
            <div className={`flex flex-col gap-2 text-xs ${M}`}>
              {[
                { label: "Estudiantes evaluados", value: `${v("estudiantes_evaluados")} / ${v("total_estudiantes")}` },
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
            {loadingStats ? (
              <div className={`flex items-center justify-center py-4 ${M}`}>
                <Icon icon="mdi:loading" width={20} className="animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-end mb-2">
                  <span className={`text-xs ${M}`}>Estudiantes evaluados</span>
                  <span className={`text-sm font-semibold ${T}`}>
                    {v("estudiantes_evaluados")} / {v("total_estudiantes")}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${S} overflow-hidden`}>
                  <div
                    className="h-full rounded-full bg-[#378ADD] transition-all"
                    style={{
                      width: stats?.total_estudiantes > 0
                        ? `${Math.round((stats.estudiantes_evaluados / stats.total_estudiantes) * 100)}%`
                        : "0%",
                    }}
                  />
                </div>
                <p className={`text-xs ${M} mt-2 text-right`}>
                  {stats?.total_estudiantes > 0
                    ? `${Math.round((stats.estudiantes_evaluados / stats.total_estudiantes) * 100)}% completado`
                    : "Sin estudiantes aún"}
                </p>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
