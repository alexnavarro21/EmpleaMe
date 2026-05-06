import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PageHeader, Paginacion } from "../../components/ui";
import {
  getSlepEmpresas, crearSlepEmpresa, editarSlepEmpresa, eliminarSlepEmpresa,
  getSlepColegios, crearSlepColegio, editarSlepColegio, getMediaUrl,
} from "../../services/api";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

const FORM_EMP_VACIO = { nombre_empresa: "", correo: "", contrasena: "", region: "", comuna: "", telefono_contacto: "", descripcion: "" };
const FORM_COL_VACIO = { nombre_institucion: "", correo: "", contrasena: "", region: "", comuna: "", telefono_contacto: "", descripcion: "" };

export default function SlepUsuarios() {
  const { isDark } = useDark();
  const [tab, setTab] = useState("empresas");

  // ── Empresas ──────────────────────────────────────────────
  const [empresas, setEmpresas]       = useState([]);
  const [loadingEmp, setLoadingEmp]   = useState(true);
  const [searchEmp, setSearchEmp]     = useState("");
  const [paginaEmp, setPaginaEmp]     = useState(1);
  const [porPaginaEmp, setPorPaginaEmp] = useState(12);

  const [showCrearEmp, setShowCrearEmp]     = useState(false);
  const [formCrearEmp, setFormCrearEmp]     = useState(FORM_EMP_VACIO);
  const [creandoEmp, setCreandoEmp]         = useState(false);
  const [errorCrearEmp, setErrorCrearEmp]   = useState("");
  const [exitoCrearEmp, setExitoCrearEmp]   = useState(false);

  const [showEditarEmp, setShowEditarEmp]   = useState(false);
  const [editEmpTarget, setEditEmpTarget]   = useState(null);
  const [formEditarEmp, setFormEditarEmp]   = useState({});
  const [editandoEmp, setEditandoEmp]       = useState(false);
  const [errorEditarEmp, setErrorEditarEmp] = useState("");

  const [showEliminarEmp, setShowEliminarEmp] = useState(false);
  const [elimEmpTarget, setElimEmpTarget]     = useState(null);
  const [eliminandoEmp, setEliminandoEmp]     = useState(false);
  const [errorEliminarEmp, setErrorEliminarEmp] = useState("");

  // ── Colegios ─────────────────────────────────────────────
  const [colegios, setColegios]       = useState([]);
  const [loadingCol, setLoadingCol]   = useState(true);
  const [searchCol, setSearchCol]     = useState("");
  const [paginaCol, setPaginaCol]     = useState(1);
  const [porPaginaCol, setPorPaginaCol] = useState(12);

  const [showCrearCol, setShowCrearCol]     = useState(false);
  const [formCrearCol, setFormCrearCol]     = useState(FORM_COL_VACIO);
  const [creandoCol, setCreandoCol]         = useState(false);
  const [errorCrearCol, setErrorCrearCol]   = useState("");
  const [exitoCrearCol, setExitoCrearCol]   = useState(false);

  const [showEditarCol, setShowEditarCol]   = useState(false);
  const [editColTarget, setEditColTarget]   = useState(null);
  const [formEditarCol, setFormEditarCol]   = useState({});
  const [editandoCol, setEditandoCol]       = useState(false);
  const [errorEditarCol, setErrorEditarCol] = useState("");

  // ── Estilos ───────────────────────────────────────────────
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";
  const inputCls = `w-full px-3 py-2 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
    isDark
      ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
      : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
  }`;

  // ── Carga ────────────────────────────────────────────────
  const cargarEmpresas = async () => {
    try { setEmpresas(await getSlepEmpresas()); } catch (e) { console.error(e); }
  };
  const cargarColegios = async () => {
    try { setColegios(await getSlepColegios()); } catch (e) { console.error(e); }
  };

  useEffect(() => { cargarEmpresas().finally(() => setLoadingEmp(false)); }, []);
  useEffect(() => { cargarColegios().finally(() => setLoadingCol(false)); }, []);

  // ── Filtrado empresas ────────────────────────────────────
  const filteredEmp = empresas.filter((e) =>
    e.nombre_empresa?.toLowerCase().includes(searchEmp.toLowerCase()) ||
    e.correo?.toLowerCase().includes(searchEmp.toLowerCase()) ||
    e.region?.toLowerCase().includes(searchEmp.toLowerCase())
  );
  const totalPaginasEmp = Math.ceil(filteredEmp.length / porPaginaEmp);
  const paginadasEmp = filteredEmp.slice((paginaEmp - 1) * porPaginaEmp, paginaEmp * porPaginaEmp);

  // ── Filtrado colegios ────────────────────────────────────
  const filteredCol = colegios.filter((c) =>
    c.nombre_institucion?.toLowerCase().includes(searchCol.toLowerCase()) ||
    c.correo?.toLowerCase().includes(searchCol.toLowerCase()) ||
    c.region?.toLowerCase().includes(searchCol.toLowerCase())
  );
  const totalPaginasCol = Math.ceil(filteredCol.length / porPaginaCol);
  const paginadasCol = filteredCol.slice((paginaCol - 1) * porPaginaCol, paginaCol * porPaginaCol);

  // ── Handlers empresas ────────────────────────────────────
  const handleCrearEmp = async (e) => {
    e.preventDefault();
    setCreandoEmp(true); setErrorCrearEmp("");
    try {
      await crearSlepEmpresa(formCrearEmp);
      setExitoCrearEmp(true);
      await cargarEmpresas();
      setTimeout(() => { setShowCrearEmp(false); setExitoCrearEmp(false); setFormCrearEmp(FORM_EMP_VACIO); }, 1200);
    } catch (err) { setErrorCrearEmp(err.message); }
    finally { setCreandoEmp(false); }
  };

  const abrirEditarEmp = (emp) => {
    setEditEmpTarget(emp);
    setFormEditarEmp({ nombre_empresa: emp.nombre_empresa || "", telefono_contacto: emp.telefono_contacto || "", descripcion: emp.descripcion || "", region: emp.region || "", comuna: emp.comuna || "" });
    setErrorEditarEmp(""); setShowEditarEmp(true);
  };

  const handleEditarEmp = async (e) => {
    e.preventDefault();
    setEditandoEmp(true); setErrorEditarEmp("");
    try { await editarSlepEmpresa(editEmpTarget.usuario_id, formEditarEmp); await cargarEmpresas(); setShowEditarEmp(false); }
    catch (err) { setErrorEditarEmp(err.message); }
    finally { setEditandoEmp(false); }
  };

  const abrirEliminarEmp = (emp) => { setElimEmpTarget(emp); setErrorEliminarEmp(""); setShowEliminarEmp(true); };

  const handleEliminarEmp = async () => {
    setEliminandoEmp(true); setErrorEliminarEmp("");
    try { await eliminarSlepEmpresa(elimEmpTarget.usuario_id); await cargarEmpresas(); setShowEliminarEmp(false); }
    catch (err) { setErrorEliminarEmp(err.message); }
    finally { setEliminandoEmp(false); }
  };

  // ── Handlers colegios ────────────────────────────────────
  const handleCrearCol = async (e) => {
    e.preventDefault();
    setCreandoCol(true); setErrorCrearCol("");
    try {
      await crearSlepColegio(formCrearCol);
      setExitoCrearCol(true);
      await cargarColegios();
      setTimeout(() => { setShowCrearCol(false); setExitoCrearCol(false); setFormCrearCol(FORM_COL_VACIO); }, 1200);
    } catch (err) { setErrorCrearCol(err.message); }
    finally { setCreandoCol(false); }
  };

  const abrirEditarCol = (col) => {
    setEditColTarget(col);
    setFormEditarCol({ nombre_institucion: col.nombre_institucion || "", telefono_contacto: col.telefono_contacto || "", descripcion: col.descripcion || "", region: col.region || "", comuna: col.comuna || "" });
    setErrorEditarCol(""); setShowEditarCol(true);
  };

  const handleEditarCol = async (e) => {
    e.preventDefault();
    setEditandoCol(true); setErrorEditarCol("");
    try { await editarSlepColegio(editColTarget.usuario_id, formEditarCol); await cargarColegios(); setShowEditarCol(false); }
    catch (err) { setErrorEditarCol(err.message); }
    finally { setEditandoCol(false); }
  };

  // ── Modal genérico ────────────────────────────────────────
  const Modal = ({ titulo, children, onCerrar }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full max-w-md rounded-xl border ${B} ${isDark ? "bg-[#1e1e1c]" : "bg-white"} p-6 shadow-xl`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-base font-semibold ${T}`}>{titulo}</h2>
          <button onClick={onCerrar} className={`${M} hover:text-red-400 transition-colors`}>
            <Icon icon="mdi:close" width={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  // ── Formulario campos comunes ─────────────────────────────
  const CamposUbicacion = ({ form, setForm }) => (
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
  );

  // ── Tabs ─────────────────────────────────────────────────
  const tabBtn = (key, label) => (
    <button
      key={key}
      onClick={() => setTab(key)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        tab === key
          ? "bg-[#0F4D8A] text-[#E6F1FB]"
          : `${M} hover:text-[#378ADD] ${isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"}`
      }`}
    >
      {label}
    </button>
  );

  const loading = tab === "empresas" ? loadingEmp : loadingCol;
  const totalRegistros = tab === "empresas" ? filteredEmp.length : filteredCol.length;

  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle={loading ? "Cargando..." : `${totalRegistros} ${tab === "empresas" ? "empresa" : "colegio"}${totalRegistros !== 1 ? "s" : ""} registrado${totalRegistros !== 1 ? "s" : ""}`}
        action={
          tab === "empresas" ? (
            <button
              onClick={() => { setShowCrearEmp(true); setErrorCrearEmp(""); setExitoCrearEmp(false); setFormCrearEmp(FORM_EMP_VACIO); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] text-sm font-medium transition-colors"
            >
              <Icon icon="mdi:plus" width={16} />
              Crear empresa
            </button>
          ) : (
            <button
              onClick={() => { setShowCrearCol(true); setErrorCrearCol(""); setExitoCrearCol(false); setFormCrearCol(FORM_COL_VACIO); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] text-sm font-medium transition-colors"
            >
              <Icon icon="mdi:plus" width={16} />
              Crear colegio
            </button>
          )
        }
      />

      <Card className="p-0 overflow-hidden">
        {/* Tabs + búsqueda */}
        <div className={`flex items-center gap-3 p-3 border-b ${B}`}>
          <div className="flex gap-1">
            {tabBtn("empresas", "Empresas")}
            {tabBtn("colegios", "Colegios")}
          </div>
          <div className="relative flex-1 min-w-48">
            <Icon icon="mdi:search" width={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${M}`} />
            {tab === "empresas" ? (
              <input
                type="text"
                placeholder="Buscar por nombre, email o región..."
                value={searchEmp}
                onChange={(e) => { setSearchEmp(e.target.value); setPaginaEmp(1); }}
                className={`w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                  isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                         : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
                }`}
              />
            ) : (
              <input
                type="text"
                placeholder="Buscar por nombre, email o región..."
                value={searchCol}
                onChange={(e) => { setSearchCol(e.target.value); setPaginaCol(1); }}
                className={`w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                  isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                         : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
                }`}
              />
            )}
          </div>
        </div>

        {/* Tabla empresas */}
        {tab === "empresas" && (
          <div className="overflow-x-auto">
            {loadingEmp ? (
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
                  {paginadasEmp.map((e) => (
                    <tr key={e.usuario_id} className={`border-b ${B} last:border-0 transition-colors ${isDark ? "hover:bg-[#313130]/50" : "hover:bg-[#F7F6F3]"}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                            {e.foto_perfil ? (
                            <img src={getMediaUrl(e.foto_perfil)} className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="" />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                              <Icon icon="cuida:building-outline" width={16} className="text-[#378ADD]" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-medium ${T}`}>{e.nombre_empresa || "Sin nombre"}</p>
                              {e.creado_por != null && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#378ADD]/15 text-[#378ADD] font-medium flex-shrink-0">SLEP</span>
                              )}
                            </div>
                            {e.descripcion && <p className={`text-xs ${M} line-clamp-1 max-w-xs`}>{e.descripcion}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3"><span className={`text-sm ${M}`}>{e.correo}</span></td>
                      <td className="px-5 py-3"><span className={`text-sm ${M}`}>{[e.comuna, e.region].filter(Boolean).join(", ") || "—"}</span></td>
                      <td className="px-5 py-3">
                        <Badge color={e.total_vacantes_activas > 0 ? "green" : "gray"}>
                          {e.total_vacantes_activas} vacante{e.total_vacantes_activas !== 1 ? "s" : ""}
                        </Badge>
                      </td>
                      <td className="px-5 py-3"><span className={`text-sm ${M}`}>{formatDate(e.fecha_creacion)}</span></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/empresa-publica/${e.usuario_id}`} className="text-xs text-[#378ADD] hover:underline">Ver</Link>
                          <button onClick={() => abrirEditarEmp(e)} className={`text-xs ${M} hover:text-[#378ADD] transition-colors`} title="Editar">
                            <Icon icon="mdi:pencil-outline" width={15} />
                          </button>
                          <button onClick={() => abrirEliminarEmp(e)} className={`text-xs ${M} hover:text-red-400 transition-colors`} title="Eliminar">
                            <Icon icon="mdi:trash-can-outline" width={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loadingEmp && filteredEmp.length === 0 && (
              <div className={`text-center py-12 ${M}`}>
                <Icon icon="mdi:office-building-outline" width={40} className="mx-auto mb-3" />
                <p className={`text-sm ${T}`}>No se encontraron empresas</p>
              </div>
            )}
          </div>
        )}

        {/* Tabla colegios */}
        {tab === "colegios" && (
          <div className="overflow-x-auto">
            {loadingCol ? (
              <div className={`text-center py-12 ${M}`}>
                <Icon icon="mdi:loading" width={32} className="mx-auto mb-3 animate-spin" />
                <p className="text-sm">Cargando colegios...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${B} ${S}`}>
                    {["Institución", "Email", "Ubicación", "Estudiantes", "Registro", "Acciones"].map((h) => (
                      <th key={h} className={`text-left text-xs font-medium ${M} px-5 py-3`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginadasCol.map((c) => (
                    <tr key={c.usuario_id} className={`border-b ${B} last:border-0 transition-colors ${isDark ? "hover:bg-[#313130]/50" : "hover:bg-[#F7F6F3]"}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                            {c.foto_perfil ? (
                            <img src={getMediaUrl(c.foto_perfil)} className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="" />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                              <Icon icon="mdi:school-outline" width={16} className="text-[#378ADD]" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <Link to={`/colegio-publico/${c.usuario_id}`} className={`text-sm font-medium ${T} hover:text-[#378ADD] transition-colors`}>
                                {c.nombre_institucion || "Sin nombre"}
                              </Link>
                              {c.creado_por != null && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#378ADD]/15 text-[#378ADD] font-medium flex-shrink-0">SLEP</span>
                              )}
                            </div>
                            {c.telefono_contacto && <p className={`text-xs ${M}`}>{c.telefono_contacto}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3"><span className={`text-sm ${M}`}>{c.correo}</span></td>
                      <td className="px-5 py-3"><span className={`text-sm ${M}`}>{[c.comuna, c.region].filter(Boolean).join(", ") || "—"}</span></td>
                      <td className="px-5 py-3">
                        <span className={`text-sm font-medium ${T}`}>{c.total_estudiantes}</span>
                        <span className={`text-xs ${M} ml-1`}>estudiante{c.total_estudiantes !== 1 ? "s" : ""}</span>
                      </td>
                      <td className="px-5 py-3"><span className={`text-sm ${M}`}>{formatDate(c.fecha_creacion)}</span></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/colegio-publico/${c.usuario_id}`} className="text-xs text-[#378ADD] hover:underline">Ver</Link>
                          <button onClick={() => abrirEditarCol(c)} className={`text-xs ${M} hover:text-[#378ADD] transition-colors`} title="Editar">
                            <Icon icon="mdi:pencil-outline" width={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loadingCol && filteredCol.length === 0 && (
              <div className={`text-center py-12 ${M}`}>
                <Icon icon="mdi:school-outline" width={40} className="mx-auto mb-3" />
                <p className={`text-sm ${T}`}>No se encontraron colegios</p>
              </div>
            )}
          </div>
        )}

        {/* Paginación */}
        {tab === "empresas" && !loadingEmp && filteredEmp.length > 0 && (
          <div className="px-4 pb-4">
            <Paginacion paginaActual={paginaEmp} totalPaginas={totalPaginasEmp} onCambiar={setPaginaEmp}
              porPagina={porPaginaEmp} opciones={[12, 24, 48]} onCambiarPorPagina={(v) => { setPorPaginaEmp(v); setPaginaEmp(1); }} />
          </div>
        )}
        {tab === "colegios" && !loadingCol && filteredCol.length > 0 && (
          <div className="px-4 pb-4">
            <Paginacion paginaActual={paginaCol} totalPaginas={totalPaginasCol} onCambiar={setPaginaCol}
              porPagina={porPaginaCol} opciones={[12, 24, 48]} onCambiarPorPagina={(v) => { setPorPaginaCol(v); setPaginaCol(1); }} />
          </div>
        )}
      </Card>

      {/* ── Modales empresas ─────────────────────────────────── */}
      {showCrearEmp && (
        exitoCrearEmp ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-xs rounded-xl border ${B} ${isDark ? "bg-[#1e1e1c]" : "bg-white"} p-8 shadow-xl flex flex-col items-center gap-3`}>
              <Icon icon="mdi:check-circle" width={40} className="text-green-500" />
              <p className={`text-sm font-medium ${T}`}>Empresa creada correctamente</p>
            </div>
          </div>
        ) : (
          <Modal titulo="Crear empresa" onCerrar={() => setShowCrearEmp(false)}>
            <form onSubmit={handleCrearEmp} className="flex flex-col gap-3">
              <div>
                <label className={`text-xs font-medium ${M} block mb-1`}>Nombre de la empresa *</label>
                <input className={inputCls} placeholder="Ej: Taller Mecánico Norte" value={formCrearEmp.nombre_empresa}
                  onChange={(e) => setFormCrearEmp((f) => ({ ...f, nombre_empresa: e.target.value }))} required />
              </div>
              <div>
                <label className={`text-xs font-medium ${M} block mb-1`}>Correo *</label>
                <input type="email" className={inputCls} placeholder="contacto@empresa.cl" value={formCrearEmp.correo}
                  onChange={(e) => setFormCrearEmp((f) => ({ ...f, correo: e.target.value }))} required />
              </div>
              <div>
                <label className={`text-xs font-medium ${M} block mb-1`}>Contraseña *</label>
                <input type="password" className={inputCls} placeholder="Mínimo 6 caracteres" value={formCrearEmp.contrasena}
                  onChange={(e) => setFormCrearEmp((f) => ({ ...f, contrasena: e.target.value }))} required minLength={6} />
              </div>
              <CamposUbicacion form={formCrearEmp} setForm={setFormCrearEmp} />
              <div>
                <label className={`text-xs font-medium ${M} block mb-1`}>Teléfono de contacto</label>
                <input className={inputCls} placeholder="+56 9 1234 5678" value={formCrearEmp.telefono_contacto}
                  onChange={(e) => setFormCrearEmp((f) => ({ ...f, telefono_contacto: e.target.value }))} />
              </div>
              <div>
                <label className={`text-xs font-medium ${M} block mb-1`}>Descripción</label>
                <textarea rows={3} className={inputCls} placeholder="Descripción de la empresa..." value={formCrearEmp.descripcion}
                  onChange={(e) => setFormCrearEmp((f) => ({ ...f, descripcion: e.target.value }))} />
              </div>
              {errorCrearEmp && <p className="text-xs text-red-500 flex items-center gap-1"><Icon icon="mdi:alert-circle-outline" width={14} />{errorCrearEmp}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowCrearEmp(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${B} ${M} transition-colors ${isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"}`}>
                  Cancelar
                </button>
                <button type="submit" disabled={creandoEmp}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {creandoEmp && <Icon icon="mdi:loading" width={15} className="animate-spin" />}
                  {creandoEmp ? "Guardando..." : "Crear empresa"}
                </button>
              </div>
            </form>
          </Modal>
        )
      )}

      {showEditarEmp && (
        <Modal titulo={`Editar: ${editEmpTarget?.nombre_empresa}`} onCerrar={() => setShowEditarEmp(false)}>
          <form onSubmit={handleEditarEmp} className="flex flex-col gap-3">
            <div>
              <label className={`text-xs font-medium ${M} block mb-1`}>Nombre de la empresa *</label>
              <input className={inputCls} value={formEditarEmp.nombre_empresa || ""}
                onChange={(e) => setFormEditarEmp((f) => ({ ...f, nombre_empresa: e.target.value }))} required />
            </div>
            <CamposUbicacion form={formEditarEmp} setForm={setFormEditarEmp} />
            <div>
              <label className={`text-xs font-medium ${M} block mb-1`}>Teléfono de contacto</label>
              <input className={inputCls} value={formEditarEmp.telefono_contacto || ""}
                onChange={(e) => setFormEditarEmp((f) => ({ ...f, telefono_contacto: e.target.value }))} />
            </div>
            <div>
              <label className={`text-xs font-medium ${M} block mb-1`}>Descripción</label>
              <textarea rows={3} className={inputCls} value={formEditarEmp.descripcion || ""}
                onChange={(e) => setFormEditarEmp((f) => ({ ...f, descripcion: e.target.value }))} />
            </div>
            <div>
              <label className={`text-xs font-medium ${M} block mb-1`}>Nueva contraseña <span className={`font-normal ${M}`}>(dejar vacío para no cambiar)</span></label>
              <input type="password" className={inputCls} placeholder="Mínimo 6 caracteres" value={formEditarEmp.contrasena || ""}
                onChange={(e) => setFormEditarEmp((f) => ({ ...f, contrasena: e.target.value }))} minLength={6} />
            </div>
            {errorEditarEmp && <p className="text-xs text-red-500 flex items-center gap-1"><Icon icon="mdi:alert-circle-outline" width={14} />{errorEditarEmp}</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowEditarEmp(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${B} ${M} transition-colors ${isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"}`}>
                Cancelar
              </button>
              <button type="submit" disabled={editandoEmp}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {editandoEmp && <Icon icon="mdi:loading" width={15} className="animate-spin" />}
                {editandoEmp ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showEliminarEmp && elimEmpTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-sm rounded-xl border ${B} ${isDark ? "bg-[#1e1e1c]" : "bg-white"} p-6 shadow-xl`}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon icon="mdi:trash-can-outline" width={18} className="text-red-400" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${T}`}>Eliminar empresa</p>
                <p className={`text-xs ${M} mt-1`}>
                  ¿Eliminar <span className="font-medium text-red-400">{elimEmpTarget.nombre_empresa}</span>?
                  Esta acción eliminará también sus vacantes y conversaciones. No se puede deshacer.
                </p>
              </div>
            </div>
            {errorEliminarEmp && <p className="text-xs text-red-500 mb-3 flex items-center gap-1"><Icon icon="mdi:alert-circle-outline" width={14} />{errorEliminarEmp}</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowEliminarEmp(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${B} ${M} transition-colors ${isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"}`}>
                Cancelar
              </button>
              <button onClick={handleEliminarEmp} disabled={eliminandoEmp}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {eliminandoEmp && <Icon icon="mdi:loading" width={15} className="animate-spin" />}
                {eliminandoEmp ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modales colegios ─────────────────────────────────── */}
      {showCrearCol && (
        exitoCrearCol ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-xs rounded-xl border ${B} ${isDark ? "bg-[#1e1e1c]" : "bg-white"} p-8 shadow-xl flex flex-col items-center gap-3`}>
              <Icon icon="mdi:check-circle" width={40} className="text-green-500" />
              <p className={`text-sm font-medium ${T}`}>Colegio creado correctamente</p>
            </div>
          </div>
        ) : (
          <Modal titulo="Crear colegio" onCerrar={() => setShowCrearCol(false)}>
            <form onSubmit={handleCrearCol} className="flex flex-col gap-3">
              <div>
                <label className={`text-xs font-medium ${M} block mb-1`}>Nombre de la institución *</label>
                <input className={inputCls} placeholder="Ej: Liceo Industrial A-1" value={formCrearCol.nombre_institucion}
                  onChange={(e) => setFormCrearCol((f) => ({ ...f, nombre_institucion: e.target.value }))} required />
              </div>
              <div>
                <label className={`text-xs font-medium ${M} block mb-1`}>Correo *</label>
                <input type="email" className={inputCls} placeholder="contacto@colegio.cl" value={formCrearCol.correo}
                  onChange={(e) => setFormCrearCol((f) => ({ ...f, correo: e.target.value }))} required />
              </div>
              <div>
                <label className={`text-xs font-medium ${M} block mb-1`}>Contraseña *</label>
                <input type="password" className={inputCls} placeholder="Mínimo 6 caracteres" value={formCrearCol.contrasena}
                  onChange={(e) => setFormCrearCol((f) => ({ ...f, contrasena: e.target.value }))} required minLength={6} />
              </div>
              <CamposUbicacion form={formCrearCol} setForm={setFormCrearCol} />
              <div>
                <label className={`text-xs font-medium ${M} block mb-1`}>Teléfono de contacto</label>
                <input className={inputCls} placeholder="+56 9 1234 5678" value={formCrearCol.telefono_contacto}
                  onChange={(e) => setFormCrearCol((f) => ({ ...f, telefono_contacto: e.target.value }))} />
              </div>
              <div>
                <label className={`text-xs font-medium ${M} block mb-1`}>Descripción</label>
                <textarea rows={3} className={inputCls} placeholder="Descripción del establecimiento..." value={formCrearCol.descripcion}
                  onChange={(e) => setFormCrearCol((f) => ({ ...f, descripcion: e.target.value }))} />
              </div>
              {errorCrearCol && <p className="text-xs text-red-500 flex items-center gap-1"><Icon icon="mdi:alert-circle-outline" width={14} />{errorCrearCol}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowCrearCol(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${B} ${M} transition-colors ${isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"}`}>
                  Cancelar
                </button>
                <button type="submit" disabled={creandoCol}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {creandoCol && <Icon icon="mdi:loading" width={15} className="animate-spin" />}
                  {creandoCol ? "Guardando..." : "Crear colegio"}
                </button>
              </div>
            </form>
          </Modal>
        )
      )}

      {showEditarCol && (
        <Modal titulo={`Editar: ${editColTarget?.nombre_institucion}`} onCerrar={() => setShowEditarCol(false)}>
          <form onSubmit={handleEditarCol} className="flex flex-col gap-3">
            <div>
              <label className={`text-xs font-medium ${M} block mb-1`}>Nombre de la institución *</label>
              <input className={inputCls} value={formEditarCol.nombre_institucion || ""}
                onChange={(e) => setFormEditarCol((f) => ({ ...f, nombre_institucion: e.target.value }))} required />
            </div>
            <CamposUbicacion form={formEditarCol} setForm={setFormEditarCol} />
            <div>
              <label className={`text-xs font-medium ${M} block mb-1`}>Teléfono de contacto</label>
              <input className={inputCls} value={formEditarCol.telefono_contacto || ""}
                onChange={(e) => setFormEditarCol((f) => ({ ...f, telefono_contacto: e.target.value }))} />
            </div>
            <div>
              <label className={`text-xs font-medium ${M} block mb-1`}>Descripción</label>
              <textarea rows={3} className={inputCls} value={formEditarCol.descripcion || ""}
                onChange={(e) => setFormEditarCol((f) => ({ ...f, descripcion: e.target.value }))} />
            </div>
            <div>
              <label className={`text-xs font-medium ${M} block mb-1`}>Nueva contraseña <span className={`font-normal ${M}`}>(dejar vacío para no cambiar)</span></label>
              <input type="password" className={inputCls} placeholder="Mínimo 6 caracteres" value={formEditarCol.contrasena || ""}
                onChange={(e) => setFormEditarCol((f) => ({ ...f, contrasena: e.target.value }))} minLength={6} />
            </div>
            {errorEditarCol && <p className="text-xs text-red-500 flex items-center gap-1"><Icon icon="mdi:alert-circle-outline" width={14} />{errorEditarCol}</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowEditarCol(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${B} ${M} transition-colors ${isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"}`}>
                Cancelar
              </button>
              <button type="submit" disabled={editandoCol}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {editandoCol && <Icon icon="mdi:loading" width={15} className="animate-spin" />}
                {editandoCol ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
