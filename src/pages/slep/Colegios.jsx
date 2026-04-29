import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, PageHeader, Paginacion } from "../../components/ui";
import { getSlepColegios, crearSlepColegio, editarSlepColegio } from "../../services/api";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

const FORM_VACIO = {
  nombre_institucion: "", correo: "", contrasena: "",
  region: "", comuna: "", telefono_contacto: "", descripcion: "",
};

export default function SlepColegios() {
  const { isDark } = useDark();
  const [colegios, setColegios] = useState([]);
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
      const data = await getSlepColegios();
      setColegios(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    cargar().finally(() => setLoading(false));
  }, []);

  const filtered = colegios.filter((c) =>
    c.nombre_institucion?.toLowerCase().includes(search.toLowerCase()) ||
    c.correo?.toLowerCase().includes(search.toLowerCase()) ||
    c.region?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPaginasCol = Math.ceil(filtered.length / porPagina);
  const paginadas = filtered.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Crear
  const handleCrear = async (e) => {
    e.preventDefault();
    setCreando(true);
    setErrorCrear("");
    try {
      await crearSlepColegio(formCrear);
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
  const abrirEditar = (col) => {
    setEditTarget(col);
    setFormEditar({
      nombre_institucion: col.nombre_institucion || "",
      telefono_contacto:  col.telefono_contacto  || "",
      descripcion:        col.descripcion        || "",
      region:             col.region             || "",
      comuna:             col.comuna             || "",
    });
    setErrorEditar("");
    setShowEditar(true);
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setEditando(true);
    setErrorEditar("");
    try {
      await editarSlepColegio(editTarget.usuario_id, formEditar);
      await cargar();
      setShowEditar(false);
    } catch (err) {
      setErrorEditar(err.message);
    } finally {
      setEditando(false);
    }
  };

  const FormContent = ({ form, setForm, esCrear, error, cargando, onCerrar, onSubmit }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full max-w-md rounded-xl border ${B} ${isDark ? "bg-[#1e1e1c]" : "bg-white"} p-6 shadow-xl`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-base font-semibold ${T}`}>
            {esCrear ? "Crear colegio" : `Editar: ${editTarget?.nombre_institucion}`}
          </h2>
          <button onClick={onCerrar} className={`${M} hover:text-red-400 transition-colors`}>
            <Icon icon="mdi:close" width={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div>
            <label className={`text-xs font-medium ${M} block mb-1`}>Nombre de la institución *</label>
            <input className={inputCls} placeholder="Ej: Liceo Industrial A-1" value={form.nombre_institucion || ""}
              onChange={(e) => setForm((f) => ({ ...f, nombre_institucion: e.target.value }))} required />
          </div>
          {esCrear && (
            <>
              <div>
                <label className={`text-xs font-medium ${M} block mb-1`}>Correo *</label>
                <input type="email" className={inputCls} placeholder="contacto@colegio.cl" value={form.correo || ""}
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
            <textarea rows={3} className={inputCls} placeholder="Descripción del establecimiento..." value={form.descripcion || ""}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
          </div>
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
              {cargando ? "Guardando..." : esCrear ? "Crear colegio" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Colegios"
        subtitle={loading ? "Cargando..." : `${filtered.length} colegios registrados`}
        action={
          <button
            onClick={() => { setShowCrear(true); setErrorCrear(""); setExitoCrear(false); setFormCrear(FORM_VACIO); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] text-sm font-medium transition-colors"
          >
            <Icon icon="mdi:plus" width={16} />
            Crear colegio
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
                {paginadas.map((c) => (
                  <tr
                    key={c.usuario_id}
                    className={`border-b ${B} last:border-0 transition-colors ${isDark ? "hover:bg-[#313130]/50" : "hover:bg-[#F7F6F3]"}`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                          <Icon icon="mdi:school-outline" width={16} className="text-[#378ADD]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link to={`/colegio-publico/${c.usuario_id}`} className={`text-sm font-medium ${T} hover:text-[#378ADD] transition-colors`}>
                              {c.nombre_institucion || "Sin nombre"}
                            </Link>
                            {c.creado_por != null && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#378ADD]/15 text-[#378ADD] font-medium flex-shrink-0">
                                SLEP
                              </span>
                            )}
                          </div>
                          {c.telefono_contacto && (
                            <p className={`text-xs ${M}`}>{c.telefono_contacto}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className={`text-sm ${M}`}>{c.correo}</span></td>
                    <td className="px-5 py-3">
                      <span className={`text-sm ${M}`}>
                        {[c.comuna, c.region].filter(Boolean).join(", ") || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-medium ${T}`}>{c.total_estudiantes}</span>
                      <span className={`text-xs ${M} ml-1`}>estudiante{c.total_estudiantes !== 1 ? "s" : ""}</span>
                    </td>
                    <td className="px-5 py-3"><span className={`text-sm ${M}`}>{formatDate(c.fecha_creacion)}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/colegio-publico/${c.usuario_id}`} className="text-xs text-[#378ADD] hover:underline">
                          Ver
                        </Link>
                        <button
                          onClick={() => abrirEditar(c)}
                          className={`text-xs ${M} hover:text-[#378ADD] transition-colors`}
                          title="Editar"
                        >
                          <Icon icon="mdi:pencil-outline" width={15} />
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
              <Icon icon="mdi:school-outline" width={40} className={`mx-auto mb-3 ${M}`} />
              <p className={`text-sm ${T}`}>No se encontraron colegios</p>
            </div>
          )}
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-4 pb-4">
            <Paginacion
              paginaActual={pagina}
              totalPaginas={totalPaginasCol}
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
              <p className={`text-sm font-medium ${T}`}>Colegio creado correctamente</p>
            </div>
          </div>
        ) : (
          <FormContent
            form={formCrear}
            setForm={setFormCrear}
            esCrear
            error={errorCrear}
            cargando={creando}
            onCerrar={() => setShowCrear(false)}
            onSubmit={handleCrear}
          />
        )
      )}

      {/* Modal editar */}
      {showEditar && (
        <FormContent
          form={formEditar}
          setForm={setFormEditar}
          esCrear={false}
          error={errorEditar}
          cargando={editando}
          onCerrar={() => setShowEditar(false)}
          onSubmit={handleEditar}
        />
      )}
    </div>
  );
}
