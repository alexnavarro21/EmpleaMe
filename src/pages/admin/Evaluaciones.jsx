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

// ── Tab components ────────────────────────────────────────────────────────────

// TAB 1: Asignar habilidades técnicas
function TabHabilidades({ estudiantes, habilidades, isDark }) {
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const [selectedId, setSelectedId] = useState("");
  const [selected, setSelected] = useState({});   // habilidad_id → nivel_dominio | ""
  const [currentSkills, setCurrentSkills] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const tecnicas = habilidades.filter(
    (h) => h.categoria === "tecnica" || h.categoria === "técnica"
  );

  const est = estudiantes.find((e) => String(e.usuario_id) === String(selectedId));

  useEffect(() => {
    if (!selectedId) { setCurrentSkills([]); setSelected({}); return; }
    // Pre-cargar skills actuales del estudiante
    import("../../services/api").then(({ getEstudianteById }) => {
      getEstudianteById(selectedId).then((data) => {
        const curr = data.habilidades?.filter((h) => h.categoria === "tecnica") || [];
        setCurrentSkills(curr);
        const pre = {};
        curr.forEach((h) => { pre[h.id || h.habilidad_id] = h.nivel_dominio || ""; });
        setSelected(pre);
      }).catch(() => {});
    });
  }, [selectedId]);

  function toggle(hId) {
    setSelected((prev) => {
      const copy = { ...prev };
      if (copy[hId]) delete copy[hId];
      else copy[hId] = "Intermedio";
      return copy;
    });
  }

  async function handleGuardar() {
    if (!selectedId || !Object.keys(selected).length) return;
    setSaving(true); setMsg("");
    try {
      await asignarHabilidadesTecnicas({
        estudiante_id: Number(selectedId),
        habilidades: Object.entries(selected)
          .filter(([, nivel]) => nivel)
          .map(([habilidad_id, nivel_dominio]) => ({
            habilidad_id: Number(habilidad_id),
            nivel_dominio,
          })),
      });
      setMsg("Habilidades asignadas correctamente");
    } catch (e) {
      setMsg("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <Card>
          <h3 className={`text-sm font-semibold ${T} mb-4`}>Asignar habilidades técnicas</h3>

          <div className="mb-4">
            <label className={`block text-xs mb-1.5 ${M}`}>Estudiante</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border focus:border-[#378ADD] ${
                isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]"
                       : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
              }`}
            >
              <option value="">Seleccionar estudiante...</option>
              {estudiantes.map((e) => (
                <option key={e.usuario_id} value={e.usuario_id}>
                  {e.nombre_completo} — {e.carrera || "Sin carrera"}
                </option>
              ))}
            </select>
          </div>

          {est && (
            <div className={`mb-4 px-4 py-2 rounded-lg flex items-center gap-2 ${isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"}`}>
              <Icon icon="mynaui:user-solid" width={14} className="text-[#378ADD]" />
              <span className={`text-xs text-[#378ADD]`}>{est.carrera || "Sin carrera"} · Sem. {est.semestre || "—"}</span>
            </div>
          )}

          {selectedId && tecnicas.length > 0 && (
            <div className={`rounded-xl border ${B} overflow-hidden`}>
              <div className={`px-4 py-2.5 text-xs font-medium ${M} ${S} border-b ${B}`}>
                Selecciona las habilidades y el nivel de dominio
              </div>
              <div className="divide-y" style={{ maxHeight: 360, overflowY: "auto" }}>
                {tecnicas.map((h) => {
                  const activo = !!selected[h.id];
                  return (
                    <div
                      key={h.id}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        activo
                          ? isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"
                          : isDark ? "hover:bg-[#313130]/60" : "hover:bg-[#F7F6F3]"
                      }`}
                    >
                      <button
                        onClick={() => toggle(h.id)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          activo ? "bg-[#0F4D8A] border-[#0F4D8A]" : `border-[#888780]`
                        }`}
                      >
                        {activo && <Icon icon="mdi:check" width={10} className="text-white" />}
                      </button>
                      <span className={`text-sm flex-1 ${T}`}>{h.nombre}</span>
                      {activo && (
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
                })}
              </div>
            </div>
          )}

          {!selectedId && (
            <div className={`text-center py-10 border rounded-xl ${B} ${M}`}>
              <Icon icon="mynaui:user-solid" width={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Selecciona un estudiante para ver las habilidades</p>
            </div>
          )}

          {msg && (
            <p className={`text-sm mt-3 ${msg.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>{msg}</p>
          )}

          <div className="mt-4">
            <PrimaryButton
              onClick={handleGuardar}
              disabled={!selectedId || !Object.keys(selected).length || saving}
              className="w-full"
            >
              {saving ? "Guardando..." : `Guardar ${Object.keys(selected).length} habilidades`}
            </PrimaryButton>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className={`text-sm font-semibold ${T} mb-3`}>Habilidades actuales</h3>
        {currentSkills.length === 0 ? (
          <p className={`text-xs ${M}`}>{selectedId ? "Sin habilidades técnicas asignadas" : "Selecciona un estudiante"}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {currentSkills.map((h, i) => (
              <div key={i} className={`flex justify-between items-center py-1.5 border-b ${B} last:border-0`}>
                <span className={`text-xs ${T} flex-1`}>{h.nombre}</span>
                <Badge color={h.nivel_dominio === "Avanzado" ? "green" : h.nivel_dominio === "Intermedio" ? "blue" : "gray"}>
                  {h.nivel_dominio || "—"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// TAB 2: Evaluación docente (star ratings)
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
          <h3 className={`text-sm font-semibold ${T} mb-4`}>Nueva evaluación docente</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block text-xs mb-1.5 ${M}`}>Estudiante</label>
              <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setRatings({}); }}
                className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border focus:border-[#378ADD] ${
                  isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]" : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
                }`}
              >
                <option value="">Seleccionar...</option>
                {estudiantes.map((e) => (
                  <option key={e.usuario_id} value={e.usuario_id}>{e.nombre_completo}</option>
                ))}
              </select>
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
                <h4 className={`text-sm font-semibold ${T}`}>Habilidades blandas</h4>
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
            La plantilla tiene una fila por estudiante. Las columnas son <strong>Correo</strong>, <strong>Nombre</strong> y luego una columna por cada habilidad blanda. Rellena las celdas con un porcentaje de <strong>0 a 100</strong>; las celdas vacías se omiten.
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

// ── Main component ────────────────────────────────────────────────────────────

const TABS = [
  { key: "tecnicas",   label: "Habilidades técnicas",      icon: "mdi:wrench-outline" },
  { key: "evaluacion", label: "Evaluación docente",         icon: "mdi:clipboard-list-outline" },
  { key: "tests",      label: "Tests socioemocionales",     icon: "hugeicons:brain-02" },
  { key: "promedios",  label: "Promedios académicos",       icon: "mdi:school-outline" },
];

export default function GestionEstudiantes() {
  const { isDark } = useDark();
  const [tab, setTab] = useState("tecnicas");
  const [estudiantes, setEstudiantes] = useState([]);
  const [habilidades, setHabilidades]  = useState([]);
  const [loading, setLoading] = useState(true);

  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";

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
          {tab === "tecnicas"   && <TabHabilidades  estudiantes={estudiantes} habilidades={habilidades} isDark={isDark} />}
          {tab === "evaluacion" && <TabEvaluacion   estudiantes={estudiantes} habilidades={habilidades} isDark={isDark} />}
          {tab === "tests"      && <TabTests  isDark={isDark} />}
          {tab === "promedios"  && <TabPromedios isDark={isDark} />}
        </>
      )}
    </div>
  );
}
