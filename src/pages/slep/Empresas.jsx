import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PageHeader } from "../../components/ui";
import { getSlepEmpresas, crearSlepEmpresa } from "../../services/api";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

const FORM_VACIO = {
  nombre_empresa: "", correo: "", contrasena: "",
  region: "", comuna: "", telefono_contacto: "", descripcion: "",
};

export default function SlepEmpresas() {
  const { isDark } = useDark();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(FORM_VACIO);
  const [creando, setCreando]     = useState(false);
  const [errorCrear, setErrorCrear] = useState("");
  const [exitoCrear, setExitoCrear] = useState(false);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";
  const inputCls = `w-full px-3 py-2 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
    isDark
      ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
      : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
  }`;

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

  const handleCrear = async (e) => {
    e.preventDefault();
    setCreando(true);
    setErrorCrear("");
    try {
      await crearSlepEmpresa(form);
      setExitoCrear(true);
      const data = await getSlepEmpresas();
      setEmpresas(data);
      setTimeout(() => {
        setShowModal(false);
        setExitoCrear(false);
        setForm(FORM_VACIO);
      }, 1200);
    } catch (err) {
      setErrorCrear(err.message);
    } finally {
      setCreando(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Empresas"
        subtitle={loading ? "Cargando..." : `${filtered.length} empresas registradas`}
        action={
          <button
            onClick={() => { setShowModal(true); setErrorCrear(""); setExitoCrear(false); setForm(FORM_VACIO); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] text-sm font-medium transition-colors"
          >
            <Icon icon="mdi:plus" width={16} />
            Crear empresa
          </button>
        }
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

      {/* Modal crear empresa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-md rounded-xl border ${B} ${isDark ? "bg-[#1e1e1c]" : "bg-white"} p-6 shadow-xl`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-base font-semibold ${T}`}>Crear empresa</h2>
              <button onClick={() => setShowModal(false)} className={`${M} hover:text-red-400 transition-colors`}>
                <Icon icon="mdi:close" width={20} />
              </button>
            </div>

            {exitoCrear ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Icon icon="mdi:check-circle" width={40} className="text-green-500" />
                <p className={`text-sm font-medium ${T}`}>Empresa creada correctamente</p>
              </div>
            ) : (
              <form onSubmit={handleCrear} className="flex flex-col gap-3">
                <div>
                  <label className={`text-xs font-medium ${M} block mb-1`}>Nombre de la empresa *</label>
                  <input className={inputCls} placeholder="Ej: Taller Mecánico Norte" value={form.nombre_empresa}
                    onChange={(e) => setForm((f) => ({ ...f, nombre_empresa: e.target.value }))} required />
                </div>
                <div>
                  <label className={`text-xs font-medium ${M} block mb-1`}>Correo *</label>
                  <input type="email" className={inputCls} placeholder="contacto@empresa.cl" value={form.correo}
                    onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))} required />
                </div>
                <div>
                  <label className={`text-xs font-medium ${M} block mb-1`}>Contraseña *</label>
                  <input type="password" className={inputCls} placeholder="Mínimo 6 caracteres" value={form.contrasena}
                    onChange={(e) => setForm((f) => ({ ...f, contrasena: e.target.value }))} required minLength={6} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-medium ${M} block mb-1`}>Región</label>
                    <input className={inputCls} placeholder="Ej: Araucanía" value={form.region}
                      onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} />
                  </div>
                  <div>
                    <label className={`text-xs font-medium ${M} block mb-1`}>Comuna</label>
                    <input className={inputCls} placeholder="Ej: Temuco" value={form.comuna}
                      onChange={(e) => setForm((f) => ({ ...f, comuna: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-medium ${M} block mb-1`}>Teléfono de contacto</label>
                  <input className={inputCls} placeholder="+56 9 1234 5678" value={form.telefono_contacto}
                    onChange={(e) => setForm((f) => ({ ...f, telefono_contacto: e.target.value }))} />
                </div>
                <div>
                  <label className={`text-xs font-medium ${M} block mb-1`}>Descripción</label>
                  <textarea rows={3} className={inputCls} placeholder="Descripción de la empresa..." value={form.descripcion}
                    onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
                </div>

                {errorCrear && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <Icon icon="mdi:alert-circle-outline" width={14} />
                    {errorCrear}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowModal(false)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${B} ${M} transition-colors ${isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"}`}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={creando}
                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {creando && <Icon icon="mdi:loading" width={15} className="animate-spin" />}
                    {creando ? "Creando..." : "Crear empresa"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
