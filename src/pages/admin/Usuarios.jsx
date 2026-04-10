import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PageHeader } from "../../components/ui";
import { getUsuariosAdmin } from "../../services/api";

const roleColor = { estudiante: "blue", empresa: "orange", admin: "green" };
const statusColor = { activo: "green", inactivo: "gray", pendiente: "yellow" };
const roleIcon = { estudiante: "mynaui:user-solid", empresa: "cuida:building-outline", admin: "mingcute:settings-2-line" };

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminUsuarios() {
  const { isDark } = useDark();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  useEffect(() => {
    async function load() {
      try {
        const data = await getUsuariosAdmin();
        const mapped = data.map((u) => ({
          id: u.id,
          name: u.nombre || u.correo,
          email: u.correo,
          role: u.rol,
          career: u.carrera || "—",
          status: "activo",
          date: formatDate(u.fecha_creacion),
        }));
        setUsers(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "todos" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <PageHeader
        title="Gestión de Usuarios"
        subtitle={loading ? "Cargando..." : `${filtered.length} usuarios registrados`}
      />

      <Card className="p-0 overflow-hidden">
        <div className={`flex items-center gap-3 p-4 border-b ${B} flex-wrap`}>
          <div className="relative flex-1 min-w-48">
            <Icon icon="mdi:search" width={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${M}`} />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                isDark
                  ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                  : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
              }`}
            />
          </div>
          <div className="flex gap-1">
            {["todos", "estudiante", "empresa"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  roleFilter === r ? "bg-[#0F4D8A] text-[#E6F1FB]" : `${S} ${M} hover:bg-[#0F4D8A]/10`
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className={`text-center py-12 ${M}`}>
              <Icon icon="mdi:loading" width={32} className={`mx-auto mb-3 animate-spin`} />
              <p className="text-sm">Cargando usuarios...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className={`border-b ${B} ${S}`}>
                  {["Usuario", "Email", "Carrera", "Rol", "Estado", "Registro", "Acciones"].map((h) => (
                    <th key={h} className={`text-left text-xs font-medium ${M} px-5 py-3`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={`${u.role}-${u.id}`}
                    className={`border-b ${B} last:border-0 transition-colors ${isDark ? "hover:bg-[#313130]/50" : "hover:bg-[#F7F6F3]"}`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                          <Icon icon={roleIcon[u.role]} width={16} className="text-[#378ADD]" />
                        </div>
                        <span className={`text-sm font-medium ${T}`}>{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className={`text-sm ${M}`}>{u.email}</span></td>
                    <td className="px-5 py-3"><span className={`text-sm ${M}`}>{u.career}</span></td>
                    <td className="px-5 py-3"><Badge color={roleColor[u.role]}>{u.role}</Badge></td>
                    <td className="px-5 py-3"><Badge color={statusColor[u.status]}>{u.status}</Badge></td>
                    <td className="px-5 py-3"><span className={`text-sm ${M}`}>{u.date}</span></td>
                    <td className="px-5 py-3">
                      {u.role === "estudiante" ? (
                        <a href={`/admin/candidato/${u.id}`} className="text-xs text-[#378ADD] hover:underline">
                          Ver perfil
                        </a>
                      ) : (
                        <span className="text-xs text-[#888780]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div className={`text-center py-12 ${M}`}>
              <Icon icon="mdi:search" width={40} className={`mx-auto mb-3 ${M}`} />
              <p className={`text-sm ${T}`}>No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
