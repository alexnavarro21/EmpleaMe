import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import {
  Card, Badge, PrimaryButton, SecondaryButton,
  PageHeader, TextAreaField,
} from "../../components/ui";
import {
  getEstudiantes, getHabilidades,
  guardarEvaluacion, getEvaluaciones,
  asignarHabilidadesTecnicas,
  subirExcelTests, subirExcelPromedios,
  getIdiomasEstudiante, agregarIdioma, eliminarIdioma,
  getHistorialAcademico, agregarHistorialAcademico, eliminarHistorialAcademico,
  getHistorialLaboral, agregarHistorialLaboral, eliminarHistorialLaboral,
  crearHabilidad, actualizarHabilidad, eliminarHabilidad, getEstudiantesDeHabilidad,
} from "../../services/api";

// ── Download helper ───────────────────────────────────────────────────────────

async function descargarPlantilla(endpoint, filename, setError) {
  const BASE  = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
  const token = localStorage.getItem("token");
  try {
    const r = await fetch(`${BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) {
      const json = await r.json().catch(() => ({}));
      setError(json.error || `Error del servidor (${r.status})`);
      return;
    }
    const blob = await r.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    setError("No se pudo conectar con el servidor");
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} onClick={() => onChange(s)} className="transition-transform hover:scale-110">
          <Icon
            icon={s <= value ? "solar:star-bold-duotone" : "mdi:star-outline"}
            width={20}
            className={s <= value ? "text-yellow-400" : "text-[#888780]"}
          />
        </button>
      ))}
    </div>
  );
}

const starToNota = (avg) => avg ? (1 + (avg / 5) * 6).toFixed(1) : "—";

function avgOf(map) {
  const vals = Object.values(map).filter(Boolean);
  return vals.length ? starToNota(vals.reduce((a, b) => a + b, 0) / vals.length) : "—";
}

// ── StudentSearch ─────────────────────────────────────────────────────────────

function StudentSearch({ estudiantes, selectedId, onSelect, isDark }) {
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";

  const [query, setQuery]   = useState("");
  const [open, setOpen]     = useState(false);
  const wrapRef             = useRef(null);

  const selected = estudiantes.find((e) => String(e.usuario_id) === String(selectedId));

  const filtered = query.trim()
    ? estudiantes.filter((e) =>
        e.nombre_completo?.toLowerCase().includes(query.toLowerCase()) ||
        e.carrera?.toLowerCase().includes(query.toLowerCase())
      )
    : estudiantes;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelect(e) {
    onSelect(String(e.usuario_id));
    setQuery("");
    setOpen(false);
  }

  function handleClear() {
    onSelect("");
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <label className={`block text-xs mb-1.5 ${M}`}>Estudiante</label>

      {selected && !open ? (
        <div className={`w-full px-3 py-2.5 rounded-lg text-sm border flex items-center justify-between ${
          isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]" : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <Icon icon="mynaui:user-solid" width={14} className="text-[#378ADD] flex-shrink-0" />
            <span className="truncate">{selected.nombre_completo}</span>
            <span className={`text-xs flex-shrink-0 ${M}`}>· {selected.carrera || "Sin carrera"}</span>
          </div>
          <button onClick={handleClear} className={`ml-2 flex-shrink-0 hover:text-red-400 transition-colors ${M}`}>
            <Icon icon="mdi:close" width={14} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Icon icon="mdi:magnify" width={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${M}`} />
          <input
            type="text"
            autoFocus={open}
            placeholder="Buscar estudiante por nombre o carrera..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            className={`w-full pl-8 pr-3 py-2.5 rounded-lg text-sm outline-none border focus:border-[#378ADD] transition-colors ${
              isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder:text-[#888780]"
                     : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder:text-[#888780]"
            }`}
          />
        </div>
      )}

      {open && (
        <div className={`absolute z-20 mt-1 w-full rounded-xl border shadow-lg overflow-hidden ${
          isDark ? "bg-[#262624] border-[#3a3a38]" : "bg-white border-[#D3D1C7]"
        }`}>
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div className={`px-4 py-3 text-xs ${M}`}>Sin resultados</div>
            ) : (
              filtered.map((e) => (
                <button
                  key={e.usuario_id}
                  onMouseDown={() => handleSelect(e)}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors text-sm ${
                    isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"
                  } ${String(e.usuario_id) === String(selectedId) ? isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]" : ""}`}
                >
                  <Icon icon="mynaui:user-solid" width={14} className="text-[#378ADD] flex-shrink-0" />
                  <span className={T}>{e.nombre_completo}</span>
                  <span className={`text-xs ml-auto flex-shrink-0 ${M}`}>{e.carrera || "Sin carrera"}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab components ────────────────────────────────────────────────────────────

// TAB 1: Editar estudiante (técnicas, blandas, idiomas, historial)
function TabEditarEstudiante({ estudiantes, habilidades, isDark }) {
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const [selectedId, setSelectedId]       = useState("");
  const [subTab, setSubTab]               = useState("tecnicas");
  const [selected, setSelected]           = useState({});
  const [selectedBlandas2, setSelectedBlandas2] = useState({});
  const [currentSkills, setCurrentSkills] = useState([]);
  const [saving, setSaving]               = useState(false);
  const [msg, setMsg]                     = useState("");

  // Idiomas
  const [idiomas, setIdiomas]             = useState([]);
  const [nuevoIdioma, setNuevoIdioma]     = useState("");
  const [nivelIdioma, setNivelIdioma]     = useState("Básico");

  // Historial académico
  const [academico, setAcademico]         = useState([]);
  const [aInstitucion, setAInstitucion]   = useState("");
  const [aTitulo, setATitulo]             = useState("");
  const [aArea, setAArea]                 = useState("");
  const [aInicio, setAInicio]             = useState("");
  const [aFin, setAFin]                   = useState("");

  // Historial laboral
  const [laboral, setLaboral]             = useState([]);
  const [lEmpresa, setLEmpresa]           = useState("");
  const [lCargo, setLCargo]               = useState("");
  const [lInicio, setLInicio]             = useState("");
  const [lFin, setLFin]                   = useState("");
  const [lDesc, setLDesc]                 = useState("");
  const [seccionHistorial, setSeccionHistorial] = useState("academico");

  const tecnicas = habilidades.filter((h) => h.categoria === "tecnica" || h.categoria === "técnica");
  const blandas  = habilidades.filter((h) => h.categoria === "blanda");

  function toggleTecnica(hId) {
    setSelected((prev) => {
      const copy = { ...prev };
      if (copy[hId]) delete copy[hId];
      else copy[hId] = "Intermedio";
      return copy;
    });
  }

  useEffect(() => {
    if (!selectedId) {
      setCurrentSkills([]); setSelected({}); setSelectedBlandas2({});
      setIdiomas([]); setAcademico([]); setLaboral([]);
      return;
    }
    import("../../services/api").then(({ getEstudianteById }) => {
      getEstudianteById(selectedId).then((data) => {
        const curr = data.habilidades || [];
        setCurrentSkills(curr);
        const preTec = {};
        const preBlnd = {};
        curr.forEach((h) => {
          if (h.categoria === "tecnica" || h.categoria === "técnica") {
            preTec[h.id || h.habilidad_id] = h.nivel_dominio || "";
          } else if (h.categoria === "blanda") {
            preBlnd[h.id || h.habilidad_id] = h.porcentaje ?? 50;
          }
        });
        setSelected(preTec);
        setSelectedBlandas2(preBlnd);
        setIdiomas(data.idiomas || []);
        setAcademico(data.historial_academico || []);
        setLaboral(data.historial_laboral || []);
      }).catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  function toggleBlanda(hId) {
    setSelectedBlandas2((prev) => {
      const copy = { ...prev };
      if (copy[hId] !== undefined) delete copy[hId];
      else copy[hId] = 50;
      return copy;
    });
  }

  async function handleGuardarTecnicas() {
    const payload = Object.entries(selected)
      .filter(([, nivel]) => nivel)
      .map(([habilidad_id, nivel_dominio]) => ({ habilidad_id: Number(habilidad_id), nivel_dominio, porcentaje: null }));
    if (!selectedId || !payload.length) return;
    setSaving(true); setMsg("");
    try {
      await asignarHabilidadesTecnicas({ estudiante_id: Number(selectedId), habilidades: payload });
      setMsg("Habilidades técnicas guardadas");
    } catch (e) { setMsg("Error: " + e.message); }
    finally { setSaving(false); }
  }

  async function handleGuardarBlandas() {
    if (!selectedId) return;
    const payload = Object.entries(selectedBlandas2)
      .map(([habilidad_id, porcentaje]) => ({ habilidad_id: Number(habilidad_id), nivel_dominio: null, porcentaje: Number(porcentaje) }));
    setSaving(true); setMsg("");
    try {
      await asignarHabilidadesTecnicas({ estudiante_id: Number(selectedId), habilidades: payload, modo: "blandas" });
      setMsg("Competencias socioemocionales guardadas");
    } catch (e) { setMsg("Error: " + e.message); }
    finally { setSaving(false); }
  }

  async function handleAgregarIdioma() {
    if (!selectedId || !nuevoIdioma.trim()) return;
    setSaving(true); setMsg("");
    try {
      const nuevo = await agregarIdioma({ estudiante_id: Number(selectedId), idioma: nuevoIdioma.trim(), nivel: nivelIdioma });
      setIdiomas((prev) => [...prev.filter((i) => i.id !== nuevo.id), nuevo].sort((a, b) => a.idioma.localeCompare(b.idioma)));
      setNuevoIdioma(""); setMsg("Idioma agregado");
    } catch (e) { setMsg("Error: " + e.message); }
    finally { setSaving(false); }
  }

  async function handleEliminarIdioma(id) {
    try { await eliminarIdioma(id); setIdiomas((prev) => prev.filter((i) => i.id !== id)); }
    catch (e) { setMsg("Error: " + e.message); }
  }

  async function handleAgregarAcademico() {
    if (!selectedId || !aInstitucion.trim() || !aTitulo.trim()) return;
    setSaving(true); setMsg("");
    try {
      const nuevo = await agregarHistorialAcademico({ estudiante_id: Number(selectedId), institucion: aInstitucion, titulo: aTitulo, area: aArea, fecha_inicio: aInicio || null, fecha_fin: aFin || null });
      setAcademico((prev) => [nuevo, ...prev]);
      setAInstitucion(""); setATitulo(""); setAArea(""); setAInicio(""); setAFin("");
      setMsg("Registro académico agregado");
    } catch (e) { setMsg("Error: " + e.message); }
    finally { setSaving(false); }
  }

  async function handleAgregarLaboral() {
    if (!selectedId || !lEmpresa.trim() || !lCargo.trim()) return;
    setSaving(true); setMsg("");
    try {
      const nuevo = await agregarHistorialLaboral({ estudiante_id: Number(selectedId), empresa_nombre: lEmpresa, cargo: lCargo, fecha_inicio: lInicio || null, fecha_fin: lFin || null, descripcion: lDesc });
      setLaboral((prev) => [nuevo, ...prev]);
      setLEmpresa(""); setLCargo(""); setLInicio(""); setLFin(""); setLDesc("");
      setMsg("Experiencia laboral agregada");
    } catch (e) { setMsg("Error: " + e.message); }
    finally { setSaving(false); }
  }

  function SkillRow({ h, activo, onToggle, showLevel }) {
    return (
      <div
        className={`flex items-center gap-3 px-4 py-3 transition-colors ${
          activo
            ? isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"
            : isDark ? "hover:bg-[#313130]/60" : "hover:bg-[#F7F6F3]"
        }`}
      >
        <button
          onClick={() => onToggle(h.id)}
          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            activo ? "bg-[#0F4D8A] border-[#0F4D8A]" : "border-[#888780]"
          }`}
        >
          {activo && <Icon icon="mdi:check" width={10} className="text-white" />}
        </button>
        <span className={`text-sm flex-1 ${T}`}>{h.nombre}</span>
        {activo && showLevel && (
          <select
            value={selected[h.id] || "Intermedio"}
            onChange={(e) => setSelected((prev) => ({ ...prev, [h.id]: e.target.value }))}
            onClick={(e) => e.stopPropagation()}
            className={`text-xs px-2 py-1 rounded-lg border outline-none focus:border-[#378ADD] ${
              isDark ? "bg-[#262624] border-[#3a3a38] text-[#D3D1C7]"
                     : "bg-white border-[#D3D1C7] text-[#2C2C2A]"
            }`}
          >
            <option value="Basico">Básico</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        )}
      </div>
    );
  }

  const totalTecnicas = Object.keys(selected).length;
  const totalBlandas  = Object.keys(selectedBlandas2).length;

  const inputCls = `w-full px-3 py-2 rounded-lg text-sm border outline-none focus:border-[#378ADD] ${
    isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder:text-[#888780]"
           : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder:text-[#888780]"
  }`;
  const nivelColor = { "Básico": "gray", "Intermedio": "blue", "Avanzado": "green", "Nativo": "green" };

  const SUB_TABS = [
    { key: "tecnicas",  label: "Técnicas",  icon: "mdi:wrench-outline" },
    { key: "blandas",   label: "Socioemocionales", icon: "mdi:account-heart-outline" },
    { key: "idiomas",   label: "Idiomas",   icon: "mdi:translate" },
    { key: "historial", label: "Historial", icon: "mdi:briefcase-outline" },
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* Buscador único arriba */}
      <Card>
        <StudentSearch
          estudiantes={estudiantes}
          selectedId={selectedId}
          onSelect={(id) => { setSelectedId(id); setMsg(""); }}
          isDark={isDark}
        />
      </Card>

      {/* Sub-tabs */}
      <div className={`flex border-b ${B} gap-0`}>
        {SUB_TABS.map((st) => (
          <button
            key={st.key}
            onClick={() => { setSubTab(st.key); setMsg(""); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
              subTab === st.key
                ? "border-[#0F4D8A] text-[#0F4D8A] font-medium"
                : `border-transparent ${M} hover:text-[#0F4D8A]`
            }`}
          >
            <Icon icon={st.icon} width={14} />
            {st.label}
          </button>
        ))}
      </div>

      {msg && <p className={`text-sm ${msg.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>{msg}</p>}

      {/* ── Técnicas ── */}
      {subTab === "tecnicas" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              {!selectedId ? (
                <div className={`text-center py-10 ${M}`}>
                  <Icon icon="mdi:magnify" width={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Busca un estudiante arriba para comenzar</p>
                </div>
              ) : tecnicas.length === 0 ? (
                <p className={`text-xs ${M}`}>Sin habilidades técnicas en el catálogo</p>
              ) : (
                <div className={`rounded-xl border ${B} overflow-hidden`}>
                  <div className={`px-4 py-2.5 text-xs font-semibold ${M} ${S} border-b ${B}`}>
                    Selecciona las habilidades y el nivel de dominio
                  </div>
                  <div className="divide-y" style={{ maxHeight: 380, overflowY: "auto" }}>
                    {tecnicas.map((h) => (
                      <SkillRow key={h.id} h={h} activo={!!selected[h.id]} onToggle={toggleTecnica} showLevel />
                    ))}
                  </div>
                </div>
              )}
              {selectedId && (
                <div className="mt-4">
                  <PrimaryButton onClick={handleGuardarTecnicas} disabled={!totalTecnicas || saving} className="w-full">
                    {saving ? "Guardando..." : `Guardar ${totalTecnicas} técnicas`}
                  </PrimaryButton>
                </div>
              )}
            </Card>
          </div>
          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-3`}>Técnicas actuales</h3>
            {currentSkills.filter((h) => h.categoria === "tecnica" || h.categoria === "técnica").length === 0 ? (
              <p className={`text-xs ${M}`}>{selectedId ? "Sin técnicas asignadas" : "Busca un estudiante"}</p>
            ) : (
              currentSkills.filter((h) => h.categoria === "tecnica" || h.categoria === "técnica").map((h, i) => (
                <div key={i} className={`flex justify-between items-center py-1.5 border-b ${B} last:border-0`}>
                  <span className={`text-xs ${T} flex-1`}>{h.nombre}</span>
                  <Badge color={h.nivel_dominio === "Avanzado" ? "green" : h.nivel_dominio === "Intermedio" ? "blue" : "gray"}>
                    {h.nivel_dominio || "—"}
                  </Badge>
                </div>
              ))
            )}
          </Card>
        </div>
      )}

      {/* ── Blandas ── */}
      {subTab === "blandas" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              {!selectedId ? (
                <div className={`text-center py-10 ${M}`}>
                  <Icon icon="mdi:magnify" width={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Busca un estudiante arriba para comenzar</p>
                </div>
              ) : blandas.length === 0 ? (
                <p className={`text-xs ${M}`}>Sin competencias socioemocionales en el catálogo</p>
              ) : (
                <div className={`rounded-xl border ${B} overflow-hidden`}>
                  <div className={`px-4 py-2.5 text-xs font-semibold ${M} ${S} border-b ${B} flex items-center`}>
                    Selecciona las habilidades
                    <span className={`ml-auto font-normal ${M}`}>escala 0 – 100</span>
                  </div>
                  <div className="divide-y" style={{ maxHeight: 380, overflowY: "auto" }}>
                    {blandas.map((h) => {
                      const activo = selectedBlandas2[h.id] !== undefined;
                      return (
                        <div key={h.id} className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                          activo ? isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"
                                 : isDark ? "hover:bg-[#313130]/60" : "hover:bg-[#F7F6F3]"
                        }`}>
                          <button
                            onClick={() => toggleBlanda(h.id)}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              activo ? "bg-[#0F4D8A] border-[#0F4D8A]" : "border-[#888780]"
                            }`}
                          >
                            {activo && <Icon icon="mdi:check" width={10} className="text-white" />}
                          </button>
                          <span className={`text-sm flex-1 ${T}`}>{h.nombre}</span>
                          {activo && (
                            <div className="flex items-center gap-2">
                              <input type="range" min={0} max={100} step={5}
                                value={selectedBlandas2[h.id] ?? 50}
                                onChange={(e) => setSelectedBlandas2((prev) => ({ ...prev, [h.id]: Number(e.target.value) }))}
                                className="w-24 accent-[#0F4D8A]"
                              />
                              <span className={`text-xs w-8 text-right ${T}`}>{selectedBlandas2[h.id] ?? 50}%</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {selectedId && (
                <div className="mt-4">
                  <PrimaryButton onClick={handleGuardarBlandas} disabled={saving} className="w-full">
                    {saving ? "Guardando..." : totalBlandas > 0 ? `Guardar ${totalBlandas} socioemocionales` : "Guardar (quitar todas)"}
                  </PrimaryButton>
                </div>
              )}
            </Card>
          </div>
          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-3`}>Socioemocionales actuales</h3>
            {currentSkills.filter((h) => h.categoria === "blanda").length === 0 ? (
              <p className={`text-xs ${M}`}>{selectedId ? "Sin competencias socioemocionales asignadas" : "Busca un estudiante"}</p>
            ) : (
              currentSkills.filter((h) => h.categoria === "blanda").map((h, i) => (
                <div key={i} className={`flex justify-between items-center py-1.5 border-b ${B} last:border-0`}>
                  <span className={`text-xs ${T} flex-1`}>{h.nombre}</span>
                  {h.porcentaje != null && <span className="text-xs text-[#378ADD]">{h.porcentaje}%</span>}
                </div>
              ))
            )}
          </Card>
        </div>
      )}

      {/* ── Idiomas ── */}
      {subTab === "idiomas" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              {!selectedId ? (
                <div className={`text-center py-10 ${M}`}>
                  <Icon icon="mdi:magnify" width={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Busca un estudiante arriba para comenzar</p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <input type="text" placeholder="Ej: Inglés, Francés..." value={nuevoIdioma}
                    onChange={(e) => setNuevoIdioma(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAgregarIdioma()}
                    className={inputCls + " flex-1"}
                  />
                  <select value={nivelIdioma} onChange={(e) => setNivelIdioma(e.target.value)}
                    className={`px-3 py-2 rounded-lg text-sm border outline-none focus:border-[#378ADD] ${
                      isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]" : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
                    }`}>
                    <option>Básico</option><option>Intermedio</option><option>Avanzado</option><option>Nativo</option>
                  </select>
                  <PrimaryButton onClick={handleAgregarIdioma} disabled={saving || !nuevoIdioma.trim()}>
                    {saving ? "..." : "Agregar"}
                  </PrimaryButton>
                </div>
              )}
            </Card>
          </div>
          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-3`}>Idiomas actuales</h3>
            {idiomas.length === 0 ? (
              <p className={`text-xs ${M}`}>{selectedId ? "Sin idiomas" : "Busca un estudiante"}</p>
            ) : idiomas.map((i) => (
              <div key={i.id} className={`flex items-center justify-between py-1.5 border-b ${B} last:border-0`}>
                <span className={`text-xs ${T} flex-1`}>{i.idioma}</span>
                <Badge color={nivelColor[i.nivel] || "gray"}>{i.nivel}</Badge>
                <button onClick={() => handleEliminarIdioma(i.id)} className="ml-2 text-[#888780] hover:text-red-400 transition-colors">
                  <Icon icon="mdi:close" width={14} />
                </button>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── Historial ── */}
      {subTab === "historial" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              {/* Toggle académico / laboral */}
              <div className={`flex rounded-lg border ${B} overflow-hidden mb-4`}>
                {[["academico","Académico","mdi:school"],["laboral","Laboral","mdi:briefcase"]].map(([key, label, icon]) => (
                  <button key={key} onClick={() => setSeccionHistorial(key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm transition-colors ${
                      seccionHistorial === key ? "bg-[#0F4D8A] text-white"
                        : isDark ? `${T} hover:bg-[#313130]` : `${T} hover:bg-[#F7F6F3]`
                    }`}>
                    <Icon icon={icon} width={14} />{label}
                  </button>
                ))}
              </div>

              {!selectedId ? (
                <div className={`text-center py-10 ${M}`}>
                  <Icon icon="mdi:magnify" width={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Busca un estudiante arriba para comenzar</p>
                </div>
              ) : seccionHistorial === "academico" ? (
                <div className="grid grid-cols-2 gap-3">
                  <input className={`${inputCls} col-span-2`} placeholder="Institución *" value={aInstitucion} onChange={(e) => setAInstitucion(e.target.value)} />
                  <input className={inputCls} placeholder="Título / Certificación *" value={aTitulo} onChange={(e) => setATitulo(e.target.value)} />
                  <input className={inputCls} placeholder="Área (opcional)" value={aArea} onChange={(e) => setAArea(e.target.value)} />
                  <div>
                    <label className={`block text-xs mb-1 ${M}`}>Año inicio</label>
                    <input type="number" className={inputCls} placeholder="2022" value={aInicio} onChange={(e) => setAInicio(e.target.value)} />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${M}`}>Año fin</label>
                    <input type="number" className={inputCls} placeholder="2024" value={aFin} onChange={(e) => setAFin(e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <PrimaryButton onClick={handleAgregarAcademico} disabled={saving || !aInstitucion.trim() || !aTitulo.trim()} className="w-full">
                      {saving ? "Guardando..." : "Agregar registro académico"}
                    </PrimaryButton>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputCls} placeholder="Empresa *" value={lEmpresa} onChange={(e) => setLEmpresa(e.target.value)} />
                  <input className={inputCls} placeholder="Cargo / Puesto *" value={lCargo} onChange={(e) => setLCargo(e.target.value)} />
                  <div>
                    <label className={`block text-xs mb-1 ${M}`}>Fecha inicio</label>
                    <input type="date" className={inputCls} value={lInicio} onChange={(e) => setLInicio(e.target.value)} />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${M}`}>Fecha fin</label>
                    <input type="date" className={inputCls} value={lFin} onChange={(e) => setLFin(e.target.value)} />
                  </div>
                  <textarea className={`${inputCls} col-span-2`} rows={2} placeholder="Descripción (opcional)" value={lDesc} onChange={(e) => setLDesc(e.target.value)} />
                  <div className="col-span-2">
                    <PrimaryButton onClick={handleAgregarLaboral} disabled={saving || !lEmpresa.trim() || !lCargo.trim()} className="w-full">
                      {saving ? "Guardando..." : "Agregar experiencia laboral"}
                    </PrimaryButton>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-3`}>
              {seccionHistorial === "academico" ? "Estudios" : "Experiencias"}
            </h3>
            {seccionHistorial === "academico" ? (
              academico.length === 0 ? <p className={`text-xs ${M}`}>{selectedId ? "Sin estudios" : "Busca un estudiante"}</p> :
              academico.map((a) => (
                <div key={a.id} className={`pb-3 mb-3 border-b ${B} last:border-0 last:mb-0`}>
                  <div className="flex justify-between items-start">
                    <p className={`text-xs font-semibold ${T}`}>{a.titulo}</p>
                    <button onClick={() => eliminarHistorialAcademico(a.id).then(() => setAcademico((p) => p.filter((x) => x.id !== a.id))).catch(() => {})}
                      className="text-[#888780] hover:text-red-400"><Icon icon="mdi:close" width={13} /></button>
                  </div>
                  <p className={`text-xs ${M}`}>{a.institucion}</p>
                  {(a.fecha_inicio || a.fecha_fin) && <p className={`text-xs ${M}`}>{a.fecha_inicio || "?"} – {a.fecha_fin || "En curso"}</p>}
                </div>
              ))
            ) : (
              laboral.length === 0 ? <p className={`text-xs ${M}`}>{selectedId ? "Sin experiencias" : "Busca un estudiante"}</p> :
              laboral.map((l) => (
                <div key={l.id} className={`pb-3 mb-3 border-b ${B} last:border-0 last:mb-0`}>
                  <div className="flex justify-between items-start">
                    <p className={`text-xs font-semibold ${T}`}>{l.cargo}</p>
                    {l.tipo === "verificado" && (
                      <button onClick={() => eliminarHistorialLaboral(l.id).then(() => setLaboral((p) => p.filter((x) => x.id !== l.id))).catch(() => {})}
                        className="text-[#888780] hover:text-red-400"><Icon icon="mdi:close" width={13} /></button>
                    )}
                  </div>
                  <p className={`text-xs ${M}`}>{l.empresa_nombre}</p>
                  <Badge color={l.tipo === "practica_completada" ? "green" : "blue"}>
                    {l.tipo === "practica_completada" ? "Práctica" : "Verificado"}
                  </Badge>
                </div>
              ))
            )}
          </Card>
        </div>
      )}

    </div>
  );
}

// TAB 2: Evaluación estudiante (star ratings)
function TabEvaluacion({ estudiantes, habilidades, isDark }) {
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const [selectedId, setSelectedId] = useState("");
  const [periodo, setPeriodo] = useState("2025-I");
  const [ratings, setRatings] = useState({});
  const [obs, setObs] = useState("");
  const [historial, setHistorial] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const tecnicas = habilidades.filter((h) => h.categoria === "tecnica" || h.categoria === "técnica");
  const blandas  = habilidades.filter((h) => h.categoria === "blanda");

  useEffect(() => {
    getEvaluaciones().then(setHistorial).catch(() => {});
  }, []);

  async function handleGuardar() {
    if (!selectedId) return;
    setSaving(true); setMsg("");
    try {
      await guardarEvaluacion({
        estudiante_id: Number(selectedId),
        periodo,
        observaciones: obs,
        habilidades: Object.entries(ratings)
          .filter(([, v]) => v)
          .map(([habilidad_id, puntaje]) => ({ habilidad_id: Number(habilidad_id), puntaje })),
      });
      setMsg("Evaluación guardada");
      setRatings({}); setObs(""); setSelectedId("");
      getEvaluaciones().then(setHistorial).catch(() => {});
    } catch (e) { setMsg("Error: " + e.message); }
    finally { setSaving(false); }
  }

  const techAvg = avgOf(Object.fromEntries(tecnicas.map((h) => [h.id, ratings[h.id]])));
  const softAvg = avgOf(Object.fromEntries(blandas.map((h) => [h.id, ratings[h.id]])));

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 flex flex-col gap-4">
        <Card>
          <h3 className={`text-sm font-semibold ${T} mb-4`}>Nueva evaluación estudiante</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <StudentSearch
                estudiantes={estudiantes}
                selectedId={selectedId}
                onSelect={(id) => { setSelectedId(id); setRatings({}); }}
                isDark={isDark}
              />
            </div>
            <div>
              <label className={`block text-xs mb-1.5 ${M}`}>Período</label>
              <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border focus:border-[#378ADD] ${
                  isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]" : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
                }`}
              >
                <option>2025-I</option><option>2024-II</option><option>2024-I</option>
              </select>
            </div>
          </div>

          {tecnicas.length > 0 && (
            <div className={`p-4 rounded-xl ${S} mb-4`}>
              <div className="flex justify-between mb-3">
                <h4 className={`text-sm font-semibold ${T}`}>Habilidades técnicas</h4>
                <span className="text-xs text-[#378ADD]">Prom: {techAvg}</span>
              </div>
              {tecnicas.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-4 mb-2 last:mb-0">
                  <span className={`text-xs ${T} flex-1`}>{h.nombre}</span>
                  <StarRating value={ratings[h.id] || 0} onChange={(v) => setRatings((p) => ({ ...p, [h.id]: v }))} />
                </div>
              ))}
            </div>
          )}

          {blandas.length > 0 && (
            <div className={`p-4 rounded-xl ${S} mb-4`}>
              <div className="flex justify-between mb-3">
                <h4 className={`text-sm font-semibold ${T}`}>Competencias socioemocionales</h4>
                <span className="text-xs text-[#378ADD]">Prom: {softAvg}</span>
              </div>
              {blandas.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-4 mb-2 last:mb-0">
                  <span className={`text-xs ${T} flex-1`}>{h.nombre}</span>
                  <StarRating value={ratings[h.id] || 0} onChange={(v) => setRatings((p) => ({ ...p, [h.id]: v }))} />
                </div>
              ))}
            </div>
          )}

          <TextAreaField label="Observaciones" placeholder="Notas sobre el rendimiento..." rows={3}
            value={obs} onChange={(e) => setObs(e.target.value)} />

          {msg && <p className={`text-sm mb-2 ${msg.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>{msg}</p>}

          <div className="flex gap-3">
            <PrimaryButton className="flex-1" onClick={handleGuardar} disabled={!selectedId || saving}>
              {saving ? "Guardando..." : "Guardar evaluación"}
            </PrimaryButton>
            <SecondaryButton className="flex-1" onClick={() => { setRatings({}); setObs(""); setMsg(""); }}>
              Limpiar
            </SecondaryButton>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <h3 className={`text-sm font-semibold ${T} mb-3`}>Evaluaciones recientes</h3>
          {historial.length === 0 ? (
            <p className={`text-xs ${M}`}>Sin evaluaciones registradas</p>
          ) : (
            historial.slice(0, 5).map((h, i) => (
              <div key={i} className={`${i < Math.min(historial.length, 5) - 1 ? `pb-3 mb-3 border-b ${B}` : ""}`}>
                <p className={`text-sm font-medium ${T}`}>{h.nombre_estudiante}</p>
                <p className={`text-xs ${M}`}>{h.carrera} · {h.periodo}</p>
                <div className="flex gap-2 mt-0.5 text-xs">
                  {h.promedio_tecnico && <span className="text-[#378ADD]">T: {h.promedio_tecnico}</span>}
                  {h.promedio_blando  && <span className="text-[#378ADD]">B: {h.promedio_blando}</span>}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}

// TAB 3: Tests socioemocionales (subida de Excel)
function TabTests({ isDark }) {
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [dlError, setDlError] = useState("");
  const fileRef = useRef();

  async function handleFile(file) {
    if (!file) return;
    setUploading(true); setResult(null);
    try {
      const res = await subirExcelTests(file);
      setResult(res);
    } catch (e) {
      setResult({ error: e.message });
    } finally { setUploading(false); }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-semibold ${T}`}>Subir resultados de test socioemocional</h3>
            <button
              onClick={() => descargarPlantilla("/admin/tests/template", "plantilla_tests.xlsx", setDlError)}
              className="flex items-center gap-1.5 text-xs text-[#378ADD] hover:underline"
            >
              <Icon icon="mdi:download" width={14} />
              Descargar plantilla
            </button>
          </div>
          {dlError && <p className="text-xs text-red-400 mb-2">Error: {dlError}</p>}
          <p className={`text-xs ${M} mb-4`}>
            La plantilla tiene una fila por estudiante. Las columnas son <strong>Correo</strong>, <strong>Nombre</strong> y luego una columna por cada competencia socioemocional. Rellena las celdas con un porcentaje de <strong>0 a 100</strong>; las celdas vacías se omiten.
          </p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={`rounded-xl border-2 border-dashed py-12 flex flex-col items-center cursor-pointer transition-colors mb-4 ${
              dragging ? "border-[#378ADD] bg-[#E6F1FB]/20"
                       : isDark ? "border-[#3a3a38] hover:border-[#378ADD]"
                                : "border-[#D3D1C7] hover:border-[#378ADD]"
            }`}
          >
            <Icon icon="mdi:microsoft-excel" width={44} className="text-green-500 mb-3" />
            <p className={`text-sm ${T} mb-1`}>{uploading ? "Procesando..." : "Arrastra el Excel o haz clic para seleccionar"}</p>
            <p className={`text-xs ${M}`}>.xlsx, .xls</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
              onChange={(e) => handleFile(e.target.files[0])} />
          </div>

          {result && !result.error && (
            <div className={`rounded-xl border ${B} overflow-hidden`}>
              <div className={`px-4 py-2.5 flex items-center gap-2 ${isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"}`}>
                <Icon icon="mdi:check-circle" width={16} className="text-green-500" />
                <span className="text-sm font-medium text-green-500">{result.actualizados} filas procesadas</span>
              </div>
              {result.errores?.length > 0 && (
                <div className="px-4 py-3">
                  <p className={`text-xs font-medium ${M} mb-1`}>Advertencias:</p>
                  {result.errores.map((e, i) => (
                    <p key={i} className="text-xs text-orange-400 mb-0.5">· {e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
          {result?.error && <p className="text-sm text-red-400 mt-2">Error: {result.error}</p>}
        </Card>
      </div>

      <Card>
        <p className={`text-sm font-semibold ${T} mb-3`}>Formato esperado</p>
        <div className={`rounded-lg border ${B} overflow-x-auto text-xs`}>
          {/* Encabezados */}
          <div className={`flex px-3 py-2 font-medium ${M} border-b ${B} ${isDark ? "bg-[#313130]" : "bg-[#F7F6F3]"} gap-2 min-w-max`}>
            <span className="w-24 flex-shrink-0">Correo</span>
            <span className="w-20 flex-shrink-0">Nombre</span>
            <span className="w-16 flex-shrink-0">Trabajo en equipo</span>
            <span className="w-16 flex-shrink-0">Comunicación</span>
            <span className="w-16 flex-shrink-0">Liderazgo...</span>
          </div>
          {/* Fila 1 */}
          <div className={`flex px-3 py-2 border-b ${B} gap-2 min-w-max ${T}`}>
            <span className="w-24 flex-shrink-0 truncate">juan@test.cl</span>
            <span className="w-20 flex-shrink-0 truncate">Juan P.</span>
            <span className="w-16 flex-shrink-0 text-center">85</span>
            <span className="w-16 flex-shrink-0 text-center">72</span>
            <span className="w-16 flex-shrink-0 text-center"></span>
          </div>
          {/* Fila 2 */}
          <div className={`flex px-3 py-2 gap-2 min-w-max ${T}`}>
            <span className="w-24 flex-shrink-0 truncate">maria@test.cl</span>
            <span className="w-20 flex-shrink-0 truncate">María G.</span>
            <span className="w-16 flex-shrink-0 text-center"></span>
            <span className="w-16 flex-shrink-0 text-center">90</span>
            <span className="w-16 flex-shrink-0 text-center">78</span>
          </div>
        </div>
        <p className={`text-xs ${M} mt-3`}>
          Las columnas de habilidades se generan automáticamente al descargar la plantilla. Las celdas vacías no modifican datos existentes.
        </p>
      </Card>
    </div>
  );
}

// TAB 4: Promedios académicos
function TabPromedios({ isDark }) {
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [dlError, setDlError] = useState("");
  const fileRef = useRef();

  async function handleFile(file) {
    if (!file) return;
    setUploading(true); setResult(null);
    try {
      const res = await subirExcelPromedios(file);
      setResult(res);
    } catch (e) {
      setResult({ error: e.message });
    } finally { setUploading(false); }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold ${T}`}>Subir promedios académicos</h3>
            <button
              onClick={() => descargarPlantilla("/admin/promedios/template", "plantilla_promedios.xlsx", setDlError)}
              className="flex items-center gap-1.5 text-xs text-[#378ADD] hover:underline"
            >
              <Icon icon="mdi:download" width={14} />
              Descargar plantilla
            </button>
          </div>
          {dlError && <p className="text-xs text-red-400 mb-2">Error: {dlError}</p>}

          <p className={`text-xs ${M} mb-4`}>
            El Excel debe tener estas columnas: <strong>Estudiante</strong>, <strong>Correo</strong>, <strong>Periodo</strong>, <strong>Promedio (1.0-7.0)</strong>.
          </p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={`rounded-xl border-2 border-dashed py-12 flex flex-col items-center cursor-pointer transition-colors mb-4 ${
              dragging ? "border-[#378ADD] bg-[#E6F1FB]/20"
                       : isDark ? "border-[#3a3a38] hover:border-[#378ADD]"
                                : "border-[#D3D1C7] hover:border-[#378ADD]"
            }`}
          >
            <Icon icon="mdi:microsoft-excel" width={44} className="text-green-500 mb-3" />
            <p className={`text-sm ${T} mb-1`}>{uploading ? "Procesando..." : "Arrastra el Excel o haz clic"}</p>
            <p className={`text-xs ${M}`}>.xlsx, .xls</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
              onChange={(e) => handleFile(e.target.files[0])} />
          </div>

          {result && !result.error && (
            <div className={`rounded-xl border ${B} overflow-hidden`}>
              <div className={`px-4 py-2.5 flex items-center gap-2 ${isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"}`}>
                <Icon icon="mdi:check-circle" width={16} className="text-green-500" />
                <span className="text-sm font-medium text-green-500">{result.actualizados} promedios actualizados</span>
              </div>
              {result.filas?.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className={`border-b ${B} ${isDark ? "bg-[#313130]" : "bg-[#F7F6F3]"}`}>
                        <th className={`px-4 py-2 text-left ${M}`}>Correo</th>
                        <th className={`px-4 py-2 text-left ${M}`}>Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.filas.map((f, i) => (
                        <tr key={i} className={`border-b ${B} last:border-0`}>
                          <td className={`px-4 py-2 ${T}`}>{f.correo}</td>
                          <td className={`px-4 py-2 text-[#378ADD] font-medium`}>{f.promedio}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {result.errores?.length > 0 && (
                <div className="px-4 py-3">
                  <p className={`text-xs font-medium ${M} mb-1`}>Advertencias:</p>
                  {result.errores.map((e, i) => (
                    <p key={i} className="text-xs text-orange-400 mb-0.5">· {e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
          {result?.error && <p className="text-sm text-red-400 mt-2">Error: {result.error}</p>}
        </Card>
      </div>

      <Card>
        <p className={`text-sm font-semibold ${T} mb-3`}>Instrucciones</p>
        <ol className={`text-xs ${M} list-decimal list-inside space-y-2`}>
          <li>Descarga la plantilla con todos los estudiantes pre-cargados</li>
          <li>Llena la columna <strong>Promedio</strong> con el valor en escala 1.0-7.0</li>
          <li>Guarda el archivo y súbelo aquí</li>
          <li>El promedio se actualizará en el perfil de cada estudiante</li>
        </ol>
        <div className={`mt-4 p-3 rounded-lg ${isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"}`}>
          <p className="text-xs text-[#378ADD]">
            La plantilla incluye automáticamente todos los estudiantes registrados en la plataforma.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ── TabHabilidades ────────────────────────────────────────────────────────────

function TabHabilidades({ habilidades, onRefresh, isDark }) {
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";
  const inputCls = `w-full px-3 py-2 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
    isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
           : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
  }`;

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("tecnica");
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null); // { id, nombre, categoria }
  const [eliminando, setEliminando] = useState(null);
  const [error, setError] = useState("");
  // { id, nombre, afectados: [{nombre_completo}], cargando: bool }
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const handleCrear = async () => {
    if (!nombre.trim()) { setError("El nombre es requerido"); return; }
    setGuardando(true); setError("");
    try {
      await crearHabilidad({ nombre: nombre.trim(), categoria });
      setNombre(""); await onRefresh();
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  };

  const handleEditar = async () => {
    if (!editando?.nombre.trim()) { setError("El nombre es requerido"); return; }
    setGuardando(true); setError("");
    try {
      await actualizarHabilidad(editando.id, { nombre: editando.nombre.trim(), categoria: editando.categoria });
      setEditando(null); await onRefresh();
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async (h) => {
    setConfirmEliminar({ id: h.id, nombre: h.nombre, afectados: [], cargando: true });
    try {
      const afectados = await getEstudiantesDeHabilidad(h.id);
      setConfirmEliminar((prev) => prev ? { ...prev, afectados, cargando: false } : null);
    } catch {
      setConfirmEliminar((prev) => prev ? { ...prev, afectados: [], cargando: false } : null);
    }
  };

  const confirmarEliminar = async () => {
    if (!confirmEliminar) return;
    setEliminando(confirmEliminar.id);
    setConfirmEliminar(null);
    try { await eliminarHabilidad(confirmEliminar.id); await onRefresh(); }
    catch (e) { setError(e.message); }
    finally { setEliminando(null); }
  };

  const tecnicas = habilidades.filter((h) => h.categoria === "tecnica" || h.categoria === "técnica");
  const blandas  = habilidades.filter((h) => h.categoria === "blanda");

  const HabilidadLista = ({ lista, titulo, colorBadge }) => (
    <div className={`rounded-xl border ${B} ${BG} overflow-hidden`}>
      <div className={`px-4 py-3 border-b ${B} flex items-center justify-between`}>
        <p className={`text-sm font-semibold ${T}`}>{titulo}</p>
        <span className={`text-xs ${M}`}>{lista.length} habilidades</span>
      </div>
      {lista.length === 0 ? (
        <p className={`text-xs ${M} px-4 py-6 text-center`}>Sin habilidades en esta categoría.</p>
      ) : (
        <div>
          {lista.map((h, i) => (
            editando?.id === h.id ? (
              <div key={h.id} className={`flex items-center gap-2 px-4 py-3 ${i < lista.length - 1 ? `border-b ${B}` : ""}`}>
                <input
                  value={editando.nombre}
                  onChange={(e) => setEditando((p) => ({ ...p, nombre: e.target.value }))}
                  className={`${inputCls} flex-1`}
                  autoFocus
                />
                <select
                  value={editando.categoria}
                  onChange={(e) => setEditando((p) => ({ ...p, categoria: e.target.value }))}
                  className={`${inputCls} w-32`}
                >
                  <option value="tecnica">Técnica</option>
                  <option value="blanda">Socioemocional</option>
                </select>
                <button onClick={handleEditar} disabled={guardando} className="px-3 py-1.5 text-xs rounded-lg bg-[#0F4D8A] text-white hover:bg-[#0A3A6A] transition-colors disabled:opacity-50">
                  {guardando ? "..." : "Guardar"}
                </button>
                <button onClick={() => setEditando(null)} className={`px-3 py-1.5 text-xs rounded-lg border ${B} ${M} hover:border-[#378ADD] transition-colors`}>
                  Cancelar
                </button>
              </div>
            ) : (
              <div key={h.id} className={`flex items-center gap-3 px-4 py-3 ${i < lista.length - 1 ? `border-b ${B}` : ""}`}>
                <span className={`flex-1 text-sm ${T}`}>{h.nombre}</span>
                <button
                  onClick={() => setEditando({ id: h.id, nombre: h.nombre, categoria: h.categoria })}
                  className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-[#3a3a38]" : "hover:bg-[#F0F4F8]"} ${M}`}
                  title="Editar"
                >
                  <Icon icon="mdi:pencil-outline" width={15} />
                </button>
                <button
                  onClick={() => handleEliminar(h)}
                  disabled={eliminando === h.id}
                  className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-red-900/30" : "hover:bg-red-50"} text-red-500 disabled:opacity-40`}
                  title="Eliminar"
                >
                  <Icon icon={eliminando === h.id ? "mdi:loading" : "mdi:trash-can-outline"} width={15} className={eliminando === h.id ? "animate-spin" : ""} />
                </button>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Form nueva habilidad */}
      <Card>
        <p className={`text-sm font-semibold ${T} mb-4`}>Agregar habilidad</p>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-48">
            <label className={`block text-xs mb-1 ${M}`}>Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCrear()}
              placeholder="Ej: Diagnóstico automotriz"
              className={inputCls}
            />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${M}`}>Categoría</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputCls}>
              <option value="tecnica">Técnica</option>
              <option value="blanda">Socioemocional</option>
            </select>
          </div>
          <PrimaryButton onClick={handleCrear} disabled={guardando}>
            {guardando ? "Guardando..." : "Agregar"}
          </PrimaryButton>
        </div>
        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HabilidadLista lista={tecnicas} titulo="Habilidades técnicas" colorBadge="blue" />
        <HabilidadLista lista={blandas}  titulo="Competencias socioemocionales"  colorBadge="green" />
      </div>

      {/* Modal confirmación eliminar */}
      {confirmEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className={`rounded-2xl border shadow-xl w-full max-w-sm p-6 ${isDark ? "bg-[#262624] border-[#3a3a38]" : "bg-white border-[#D3D1C7]"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? "bg-red-500/15" : "bg-red-100"}`}>
                <Icon icon="mdi:alert-outline" width={18} className={isDark ? "text-red-400" : "text-red-500"} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]"}`}>
                  Eliminar habilidad
                </p>
                <p className={`text-xs ${isDark ? "text-[#888780]" : "text-[#5F5E5A]"}`}>
                  "{confirmEliminar.nombre}"
                </p>
              </div>
            </div>

            {confirmEliminar.cargando ? (
              <div className={`flex items-center gap-2 py-3 text-xs ${isDark ? "text-[#888780]" : "text-[#5F5E5A]"}`}>
                <Icon icon="mdi:loading" width={15} className="animate-spin" />
                Verificando estudiantes afectados...
              </div>
            ) : confirmEliminar.afectados.length > 0 ? (
              <div className="mb-4">
                <p className={`text-xs font-medium mb-2 text-amber-500`}>
                  <Icon icon="mdi:account-alert-outline" width={14} className="inline mr-1" />
                  {confirmEliminar.afectados.length} estudiante{confirmEliminar.afectados.length !== 1 ? "s" : ""} tienen esta habilidad asignada y la perderán:
                </p>
                <div className={`rounded-lg border ${isDark ? "border-[#3a3a38] bg-[#1e1e1c]" : "border-[#E8E6E1] bg-[#F7F6F3]"} max-h-36 overflow-y-auto`}>
                  {confirmEliminar.afectados.map((e) => (
                    <div key={e.usuario_id} className={`flex items-center gap-2 px-3 py-2 text-xs border-b last:border-0 ${isDark ? "border-[#3a3a38] text-[#D3D1C7]" : "border-[#E8E6E1] text-[#2C2C2A]"}`}>
                      <Icon icon="mynaui:user-solid" width={13} className={isDark ? "text-[#888780]" : "text-[#5F5E5A]"} />
                      {e.nombre_completo}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className={`text-xs mb-4 ${isDark ? "text-[#888780]" : "text-[#5F5E5A]"}`}>
                Ningún estudiante tiene esta habilidad asignada actualmente.
              </p>
            )}

            {!confirmEliminar.cargando && (
              <p className={`text-xs mb-5 ${isDark ? "text-[#888780]" : "text-[#5F5E5A]"}`}>
                Esta acción no se puede deshacer.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmEliminar(null)}
                className={`flex-1 py-2 text-xs rounded-xl border transition-colors ${isDark ? "border-[#3a3a38] text-[#D3D1C7] hover:bg-[#313130]" : "border-[#D3D1C7] text-[#2C2C2A] hover:bg-[#F7F6F3]"}`}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={confirmEliminar.cargando}
                className="flex-1 py-2 text-xs rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const TABS = [
  { key: "editar_estudiante", label: "Editar estudiante",     icon: "mdi:account-edit-outline" },
  { key: "evaluacion",        label: "Evaluación estudiante", icon: "mdi:clipboard-list-outline" },
  { key: "tests",             label: "Tests socioemocionales",icon: "hugeicons:brain-02" },
  { key: "promedios",         label: "Promedios académicos",  icon: "mdi:school-outline" },
  { key: "habilidades",       label: "Habilidades",           icon: "mdi:tag-multiple-outline" },
];

export default function GestionEstudiantes() {
  const { isDark } = useDark();
  const [tab, setTab] = useState("editar_estudiante");
  const [estudiantes, setEstudiantes] = useState([]);
  const [habilidades, setHabilidades]  = useState([]);
  const [loading, setLoading] = useState(true);

  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";

  const cargarHabilidades = () => getHabilidades().then(setHabilidades).catch(() => {});

  useEffect(() => {
    Promise.all([getEstudiantes(), getHabilidades()])
      .then(([ests, habs]) => { setEstudiantes(ests); setHabilidades(habs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Gestión de Estudiantes"
        subtitle="Habilidades, evaluaciones, tests socioemocionales y promedios"
      />

      <div className={`flex border-b ${B} mb-6 gap-0.5`}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-[#0F4D8A] text-[#0F4D8A] font-medium"
                : `border-transparent ${M} hover:text-[#0F4D8A]`
            }`}
          >
            <Icon icon={t.icon} width={15} />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={`flex items-center justify-center py-20 ${M}`}>
          <Icon icon="mdi:loading" width={28} className="animate-spin mr-2" />
          Cargando datos...
        </div>
      ) : (
        <>
          {tab === "editar_estudiante" && <TabEditarEstudiante estudiantes={estudiantes} habilidades={habilidades} isDark={isDark} />}
          {tab === "evaluacion"        && <TabEvaluacion      estudiantes={estudiantes} habilidades={habilidades} isDark={isDark} />}
          {tab === "tests"             && <TabTests  isDark={isDark} />}
          {tab === "promedios"         && <TabPromedios isDark={isDark} />}
          {tab === "habilidades"       && <TabHabilidades habilidades={habilidades} onRefresh={cargarHabilidades} isDark={isDark} />}
        </>
      )}
    </div>
  );
}
