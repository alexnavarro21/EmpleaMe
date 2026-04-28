import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PageHeader } from "../../components/ui";
import { getSlepEmpresas } from "../../services/api";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SlepEmpresas() {
  const { isDark } = useDark();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  useEffect(() => {
    getSlepEmpresas()
      .then(setEmpresas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = empresas.filter((e) =>
    e.nombre_empresa?.toLowerCase().includes(search.toLowerCase()) ||
    e.correo?.toLowerCase().includes(search.toLowerCase()) ||
    e.region?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Empresas"
        subtitle={loading ? "Cargando..." : `${filtered.length} empresas registradas`}
      />

      <Card className="p-0 overflow-hidden">
        <div className={`flex items-center gap-3 p-4 border-b ${B}`}>
          <div className="relative flex-1 min-w-48">
            <Icon icon="mdi:search" width={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${M}`} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o región..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                isDark
                  ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                  : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
              }`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className={`text-center py-12 ${M}`}>
              <Icon icon="mdi:loading" width={32} className="mx-auto mb-3 animate-spin" />
              <p className="text-sm">Cargando empresas...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className={`border-b ${B} ${S}`}>
                  {["Empresa", "Email", "Ubicación", "Vacantes activas", "Registro", ""].map((h) => (
                    <th key={h} className={`text-left text-xs font-medium ${M} px-5 py-3`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr
                    key={e.usuario_id}
                    className={`border-b ${B} last:border-0 transition-colors ${isDark ? "hover:bg-[#313130]/50" : "hover:bg-[#F7F6F3]"}`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                          <Icon icon="cuida:building-outline" width={16} className="text-[#378ADD]" />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${T}`}>{e.nombre_empresa || "Sin nombre"}</p>
                          {e.descripcion && (
                            <p className={`text-xs ${M} line-clamp-1 max-w-xs`}>{e.descripcion}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className={`text-sm ${M}`}>{e.correo}</span></td>
                    <td className="px-5 py-3">
                      <span className={`text-sm ${M}`}>
                        {[e.comuna, e.region].filter(Boolean).join(", ") || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge color={e.total_vacantes_activas > 0 ? "green" : "gray"}>
                        {e.total_vacantes_activas} vacante{e.total_vacantes_activas !== 1 ? "s" : ""}
                      </Badge>
                    </td>
                    <td className="px-5 py-3"><span className={`text-sm ${M}`}>{formatDate(e.fecha_creacion)}</span></td>
                    <td className="px-5 py-3">
                      <Link to={`/empresa-publica/${e.usuario_id}`} className="text-xs text-[#378ADD] hover:underline">
                        Ver perfil
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div className={`text-center py-12 ${M}`}>
              <Icon icon="mdi:office-building-outline" width={40} className={`mx-auto mb-3 ${M}`} />
              <p className={`text-sm ${T}`}>No se encontraron empresas</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
