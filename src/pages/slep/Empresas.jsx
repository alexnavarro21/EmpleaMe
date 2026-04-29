import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PageHeader, Paginacion } from "../../components/ui";
import { getSlepEmpresas, crearSlepEmpresa, editarSlepEmpresa, eliminarSlepEmpresa } from "../../services/api";

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
  const [pagina, setPagina]     = useState(1);
  const [porPagina, setPorPagina] = useState(12);

  // Modal crear
  const [showCrear, setShowCrear]     = useState(false);
  const [formCrear, setFormCrear]     = useState(FORM_VACIO);
  const [creando, setCreando]         = useState(false);
  const [errorCrear, setErrorCrear]   = useState("");
  const [exitoCrear, setExitoCrear]   = useState(false);

  // Modal editar
  const [showEditar, setShowEditar]   = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [formEditar, setFormEditar]   = useState({});
  const [editando, setEditando]       = useState(false);
  const [errorEditar, setErrorEditar] = useState("");

  // Modal eliminar
  const [showEliminar, setShowEliminar]   = useState(false);
  const [elimTarget, setElimTarget]       = useState(null);
  const [eliminando, setEliminando]       = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";
  const inputCls = `w-full px-3 py-2 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
    isDark
      ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
      : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
  }`;

  const cargar = async () => {
    try {
      const data = await getSlepEmpresas();
      setEmpresas(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    cargar().finally(() => setLoading(false));
  }, []);

  const filtered = empresas.filter((e) =>
    e.nombre_empresa?.toLowerCase().includes(search.toLowerCase()) ||
    e.correo?.toLowerCase().includes(search.toLowerCase()) ||
    e.region?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPaginasEmp = Math.ceil(filtered.length / porPagina);
  const paginadas = filtered.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Crear
  const handleCrear = async (e) => {
    e.preventDefault();
    setCreando(true);
    setErrorCrear("");
    try {
      await crearSlepEmpresa(formCrear);
      setExitoCrear(true);
      await cargar();
      setTimeout(() => { setShowCrear(false); setExitoCrear(false); setFormCrear(FORM_VACIO); }, 1200);
    } catch (err) {
      setErrorCrear(err.message);
    } finally {
      setCreando(false);
    }
  };

  // Editar
  const abrirEditar = (emp) => {
    setEditTarget(emp);
    setFormEditar({
      nombre_empresa:    emp.nombre_empresa    || "",
      telefono_contacto: emp.telefono_contacto || "",
      descripcion:       emp.descripcion       || "",
      region:            emp.region            || "",
      comuna:            emp.comuna            || "",
    });
    setErrorEditar("");
    setShowEditar(true);
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setEditando(true);
    setErrorEditar("");
    try {
      await editarSlepEmpresa(editTarget.usuario_id, formEditar);
      await cargar();
      setShowEditar(false);
    } catch (err) {
      setErrorEditar(err.message);
    } finally {
      setEditando(false);
    }
  };

  // Eliminar
  const abrirEliminar = (emp) => {
    setElimTarget(emp);
    setErrorEliminar("");
    setShowEliminar(true);
  };

  const handleEliminar = async () => {
    setEliminando(true);
    setErrorEliminar("");
    try {
      await eliminarSlepEmpresa(elimTarget.usuario_id);
      await cargar();
      setShowEliminar(false);
    } catch (err) {
      setErrorEliminar(err.message);
    } finally {
      setEliminando(false);
    }
  };

  const ModalForm = ({ titulo, form, setForm, onSubmit, cargando, error, esCrear, onCerrar }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full max-w-md rounded-xl border ${B} ${isDark ? "bg-[#1e1e1c]" : "bg-white"} p-6 shadow-xl`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-base font-semibold ${T}`}>{titulo}</h2>
          <button onClick={onCerrar} className={`${M} hover:text-red-400 transition-colors`}>
            <Icon icon="mdi:close" width={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div>
            <label className={`text-xs font-medium ${M} block mb-1`}>Nombre de la empresa *</label>
            <input className={inputCls} placeholder="Ej: Taller Mecánico Norte" value={form.nombre_empresa || ""}
              onChange={(e) => setForm((f) => ({ ...f, nombre_empresa: e.target.value }))} required />
          </div>
          {esCrear && (
            <>
              <div>
                <label className={`text-xs font-medium ${M} block mb-1`}>Correo *</label>
                <input type="email" className={inputCls} placeholder="contacto@empresa.cl" value={form.correo || ""}
                  onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))} required />
              </div>
              <div>
                <label className={`text-xs font-medium ${M} block mb-1`}>Contraseña *</label>
                <input type="password" className={inputCls} placeholder="Mínimo 6 caracteres" value={form.contrasena || ""}
                  onChange={(e) => setForm((f) => ({ ...f, contrasena: e.target.value }))} required minLength={6} />
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs font-medium ${M} block mb-1`}>Región</label>
              <input className={inputCls} placeholder="Ej: Araucanía" value={form.region || ""}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} />
            </div>
            <div>
              <label className={`text-xs font-medium ${M} block mb-1`}>Comuna</label>
              <input className={inputCls} placeholder="Ej: Temuco" value={form.comuna || ""}
                onChange={(e) => setForm((f) => ({ ...f, comuna: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className={`text-xs font-medium ${M} block mb-1`}>Teléfono de contacto</label>
            <input className={inputCls} placeholder="+56 9 1234 5678" value={form.telefono_contacto || ""}
              onChange={(e) => setForm((f) => ({ ...f, telefono_contacto: e.target.value }))} />
          </div>
          <div>
            <label className={`text-xs font-medium ${M} block mb-1`}>Descripción</label>
            <textarea rows={3} className={inputCls} placeholder="Descripción de la empresa..." value={form.descripcion || ""}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
          </div>
          {!esCrear && (
            <div>
              <label className={`text-xs font-medium ${M} block mb-1`}>Nueva contraseña <span className={`font-normal ${M}`}>(dejar vacío para no cambiar)</span></label>
              <input type="password" className={inputCls} placeholder="Mínimo 6 caracteres" value={form.contrasena || ""}
                onChange={(e) => setForm((f) => ({ ...f, contrasena: e.target.value }))} minLength={6} />
            </div>
          )}
          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <Icon icon="mdi:alert-circle-outline" width={14} />{error}
            </p>
          )}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onCerrar}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border ${B} ${M} transition-colors ${isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"}`}>
              Cancelar
            </button>
            <button type="submit" disabled={cargando}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {cargando && <Icon icon="mdi:loading" width={15} className="animate-spin" />}
              {cargando ? "Guardando..." : esCrear ? "Crear empresa" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Empresas"
        subtitle={loading ? "Cargando..." : `${filtered.length} empresas registradas`}
        action={
          <button
            onClick={() => { setShowCrear(true); setErrorCrear(""); setExitoCrear(false); setFormCrear(FORM_VACIO); }}
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
              onChange={(e) => { setSearch(e.target.value); setPagina(1); }}
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
                  {["Empresa", "Email", "Ubicación", "Vacantes activas", "Registro", "Acciones"].map((h) => (
                    <th key={h} className={`text-left text-xs font-medium ${M} px-5 py-3`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginadas.map((e) => (
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
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${T}`}>{e.nombre_empresa || "Sin nombre"}</p>
                            {e.creado_por != null && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#378ADD]/15 text-[#378ADD] font-medium flex-shrink-0">
                                SLEP
                              </span>
                            )}
                          </div>
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
                      <div className="flex items-center gap-2">
                        <Link to={`/empresa-publica/${e.usuario_id}`} className="text-xs text-[#378ADD] hover:underline">
                          Ver
                        </Link>
                        <button
                          onClick={() => abrirEditar(e)}
                          className={`text-xs ${M} hover:text-[#378ADD] transition-colors`}
                          title="Editar"
                        >
                          <Icon icon="mdi:pencil-outline" width={15} />
                        </button>
                        <button
                          onClick={() => abrirEliminar(e)}
                          className={`text-xs ${M} hover:text-red-400 transition-colors`}
                          title="Eliminar"
                        >
                          <Icon icon="mdi:trash-can-outline" width={15} />
                        </button>
                      </div>
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
        {!loading && filtered.length > 0 && (
          <div className="px-4 pb-4">
            <Paginacion
              paginaActual={pagina}
              totalPaginas={totalPaginasEmp}
              onCambiar={setPagina}
              porPagina={porPagina}
              opciones={[12, 24, 48]}
              onCambiarPorPagina={(v) => { setPorPagina(v); setPagina(1); }}
            />
          </div>
        )}
      </Card>

      {/* Modal crear */}
      {showCrear && (
        exitoCrear ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-xs rounded-xl border ${B} ${isDark ? "bg-[#1e1e1c]" : "bg-white"} p-8 shadow-xl flex flex-col items-center gap-3`}>
              <Icon icon="mdi:check-circle" width={40} className="text-green-500" />
              <p className={`text-sm font-medium ${T}`}>Empresa creada correctamente</p>
            </div>
          </div>
        ) : (
          <ModalForm
            titulo="Crear empresa"
            form={formCrear}
            setForm={setFormCrear}
            onSubmit={handleCrear}
            cargando={creando}
            error={errorCrear}
            esCrear
            onCerrar={() => setShowCrear(false)}
          />
        )
      )}

      {/* Modal editar */}
      {showEditar && (
        <ModalForm
          titulo={`Editar: ${editTarget?.nombre_empresa}`}
          form={formEditar}
          setForm={setFormEditar}
          onSubmit={handleEditar}
          cargando={editando}
          error={errorEditar}
          esCrear={false}
          onCerrar={() => setShowEditar(false)}
        />
      )}

      {/* Modal confirmar eliminar */}
      {showEliminar && elimTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-sm rounded-xl border ${B} ${isDark ? "bg-[#1e1e1c]" : "bg-white"} p-6 shadow-xl`}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon icon="mdi:trash-can-outline" width={18} className="text-red-400" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${T}`}>Eliminar empresa</p>
                <p className={`text-xs ${M} mt-1`}>
                  ¿Eliminar <span className="font-medium text-red-400">{elimTarget.nombre_empresa}</span>?
                  Esta acción eliminará también sus vacantes y conversaciones. No se puede deshacer.
                </p>
              </div>
            </div>
            {errorEliminar && (
              <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
                <Icon icon="mdi:alert-circle-outline" width={14} />{errorEliminar}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowEliminar(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${B} ${M} transition-colors ${isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"}`}
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminando}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {eliminando && <Icon icon="mdi:loading" width={15} className="animate-spin" />}
                {eliminando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
