import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, StatCard, PageHeader } from "../../components/ui";
import { getSlepStats } from "../../services/api";

const quickLinks = [
  { to: "/slep/empresas", icon: "cuida:building-outline",    label: "Gestión de Empresas", desc: "Ver y administrar empresas registradas" },
  { to: "/slep/colegios", icon: "mdi:school-outline",        label: "Gestión de Colegios", desc: "Ver y administrar colegios vinculados" },
];

export default function SlepPanel() {
  const { isDark } = useDark();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  useEffect(() => {
    getSlepStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const v = (key) => (loading ? "…" : stats?.[key] ?? "—");

  return (
    <div>
      <PageHeader
        title="Panel SLEP"
        subtitle="Gestión de empresas y colegios en la plataforma"
      />

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Empresas registradas"  value={v("total_empresas")}    sub="En plataforma" />
        <StatCard label="Colegios vinculados"   value={v("total_colegios")}    sub="En plataforma" />
        <StatCard label="Estudiantes activos"   value={v("total_estudiantes")} sub="Total en sistema" />
        <StatCard label="Vacantes activas"      value={v("total_vacantes")}    sub="Publicadas ahora" />
      </div>

      <h2 className={`text-sm font-semibold ${T} mb-3`}>Acceso rápido</h2>
      <div className="grid grid-cols-2 gap-3 max-w-xl">
        {quickLinks.map((link) => (
          <Link key={link.to} to={link.to}>
            <Card className={`flex items-start gap-3 p-4 hover:border-[#378ADD]/60 transition-colors cursor-pointer`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${S}`}>
                <Icon icon={link.icon} width={20} className="text-[#378ADD]" />
              </div>
              <div>
                <p className={`text-sm font-medium ${T}`}>{link.label}</p>
                <p className={`text-xs mt-0.5 ${M}`}>{link.desc}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
