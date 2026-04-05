import { useState } from "react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, PageHeader } from "../../components/ui";

const users = [
  { id: 1, name: "Carlos Mendoza", email: "carlos@itn.edu.pe", role: "estudiante", status: "activo", date: "12 Mar 2025" },
  { id: 2, name: "María López", email: "maria@itn.edu.pe", role: "estudiante", status: "activo", date: "10 Mar 2025" },
  { id: 3, name: "Ana Torres", email: "ana@itn.edu.pe", role: "estudiante", status: "activo", date: "08 Mar 2025" },
  { id: 4, name: "Luis García", email: "luis@itn.edu.pe", role: "estudiante", status: "inactivo", date: "01 Feb 2025" },
  { id: 5, name: "TechCorp SAC", email: "rrhh@techcorp.pe", role: "empresa", status: "activo", date: "20 Feb 2025" },
  { id: 6, name: "DataSoft Perú", email: "practicas@datasoft.pe", role: "empresa", status: "activo", date: "15 Feb 2025" },
  { id: 7, name: "Prof. García", email: "garcia@itn.edu.pe", role: "admin", status: "activo", date: "01 Ene 2025" },
  { id: 8, name: "Diego Ríos", email: "diego@itn.edu.pe", role: "estudiante", status: "pendiente", date: "04 Abr 2025" },
];

const roleColor = { estudiante: "blue", empresa: "orange", admin: "green" };
const statusColor = { activo: "green", inactivo: "gray", pendiente: "yellow" };

export default function AdminUsuarios() {
  const { isDark } = useDark();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "todos" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <PageHeader
        title="Gestión de Usuarios"
        subtitle={`${filtered.length} usuarios encontrados`}
        action={<PrimaryButton>+ Nuevo usuario</PrimaryButton>}
      />

      <Card className="p-0 overflow-hidden">
        {/* Toolbar */}
        <div className={`flex items-center gap-3 p-4 border-b ${B} flex-wrap`}>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`flex-1 min-w-48 px-3 py-2 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
              isDark
                ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
            }`}
          />
          <div className="flex gap-1">
            {["todos", "estudiante", "empresa", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  roleFilter === r
                    ? "bg-[#185FA5] text-[#E6F1FB]"
                    : `${S} ${M} hover:bg-[#185FA5]/10`
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${B} ${S}`}>
                {["Usuario", "Email", "Rol", "Estado", "Registro", "Acciones"].map((h) => (
                  <th key={h} className={`text-left text-xs font-medium ${M} px-5 py-3`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className={`border-b ${B} last:border-0 hover:${S} transition-colors`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${S}`}>
                        {u.role === "empresa" ? "🏢" : "👤"}
                      </div>
                      <span className={`text-sm font-medium ${T}`}>{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-sm ${M}`}>{u.email}</span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={roleColor[u.role]}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={statusColor[u.status]}>{u.status}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-sm ${M}`}>{u.date}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button className="text-xs text-[#378ADD] hover:underline">Editar</button>
                      <button className={`text-xs ${M} hover:text-red-500 transition-colors`}>
                        {u.status === "activo" ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className={`text-center py-12 ${M}`}>
              <p className="text-3xl mb-2">🔍</p>
              <p className={`text-sm ${T}`}>No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
