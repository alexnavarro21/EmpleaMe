import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, PageHeader, SelectField, TextAreaField } from "../../components/ui";
import { getEstudiantes, getHabilidades, guardarEvaluacion, getEvaluaciones } from "../../services/api";

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => onChange(star)} className="transition-transform hover:scale-110">
          <Icon
            icon={star <= value ? "solar:star-bold-duotone" : "mdi:star-outline"}
            width={22}
            className={star <= value ? "text-yellow-400" : "text-[#888780]"}
          />
        </button>
      ))}
    </div>
  );
}

const starToNote = (stars) => stars ? (1 + (stars / 5) * 6).toFixed(1) : "—";

function avgRatings(ratingsMap) {
  const vals = Object.values(ratingsMap).filter(Boolean);
  if (!vals.length) return "—";
  return starToNote(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export default function AdminEvaluaciones() {
  const { isDark } = useDark();
  const [estudiantes, setEstudiantes] = useState([]);
  const [habilidades, setHabilidades] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const [selectedEstudiante, setSelectedEstudiante] = useState("");
  const [periodo, setPeriodo] = useState("2025-I");
  const [ratings, setRatings] = useState({});
  const [observaciones, setObservaciones] = useState("");

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  useEffect(() => {
    async function load() {
      try {
        const [ests, habs, evals] = await Promise.all([
          getEstudiantes(),
          getHabilidades(),
          getEvaluaciones().catch(() => []),
        ]);
        setEstudiantes(ests);
        setHabilidades(habs);
        setHistorial(evals);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const tecnicas = habilidades.filter(
    (h) => h.categoria?.toLowerCase() === "tecnica" || h.categoria?.toLowerCase() === "técnica"
  );
  const blandas = habilidades.filter(
    (h) => h.categoria?.toLowerCase() === "blanda" || h.categoria?.toLowerCase() === "socioemocional"
  );

  const estudianteSeleccionado = estudiantes.find(
    (e) => String(e.usuario_id) === String(selectedEstudiante)
  );

  const techAvg = avgRatings(
    Object.fromEntries(
      tecnicas.map((h) => [h.id, ratings[h.id]])
    )
  );
  const softAvg = avgRatings(
    Object.fromEntries(
      blandas.map((h) => [h.id, ratings[h.id]])
    )
  );

  function handleClear() {
    setRatings({});
    setObservaciones("");
    setSelectedEstudiante("");
    setSavedMsg("");
  }

  async function handleGuardar() {
    if (!selectedEstudiante) return;
    setSaving(true);
    setSavedMsg("");
    try {
      const habilidadesEval = Object.entries(ratings)
        .filter(([, v]) => v)
        .map(([id, puntaje]) => ({ habilidad_id: Number(id), puntaje }));

      await guardarEvaluacion({
        estudiante_id: Number(selectedEstudiante),
        periodo,
        habilidades: habilidadesEval,
        observaciones,
      });

      setSavedMsg("Evaluación guardada correctamente");
      const evals = await getEvaluaciones().catch(() => historial);
      setHistorial(evals);
      setRatings({});
      setObservaciones("");
    } catch (err) {
      setSavedMsg("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Registro de Evaluaciones"
        subtitle="Competencias técnicas y socioemocionales de estudiantes"
      />

      {loading ? (
        <div className={`flex items-center justify-center py-20 ${M}`}>
          <Icon icon="mdi:loading" width={32} className="animate-spin mr-3" />
          <span>Cargando datos...</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col gap-4">
            <Card>
              <h3 className={`text-sm font-semibold ${T} mb-4`}>Nueva evaluación</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Estudiante selector */}
                <div>
                  <label className={`block text-xs mb-1.5 ${M}`}>Estudiante</label>
                  <select
                    value={selectedEstudiante}
                    onChange={(e) => { setSelectedEstudiante(e.target.value); setRatings({}); }}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                      isDark
                        ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]"
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

                {/* Período */}
                <div>
                  <label className={`block text-xs mb-1.5 ${M}`}>Período</label>
                  <select
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                      isDark
                        ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]"
                        : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
                    }`}
                  >
                    <option>2025-I</option>
                    <option>2024-II</option>
                    <option>2024-I</option>
                  </select>
                </div>
              </div>

              {estudianteSeleccionado && (
                <div className={`mb-4 px-4 py-2.5 rounded-lg flex items-center gap-3 ${isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"}`}>
                  <Icon icon="mynaui:user-solid" width={16} className="text-[#378ADD]" />
                  <div>
                    <p className={`text-sm font-medium ${T}`}>{estudianteSeleccionado.nombre_completo}</p>
                    <p className="text-xs text-[#378ADD]">
                      {estudianteSeleccionado.carrera || "—"} · Sem. {estudianteSeleccionado.semestre || "—"}
                    </p>
                  </div>
                </div>
              )}

              {/* Technical skills */}
              {tecnicas.length > 0 && (
                <div className={`p-4 rounded-xl ${S} mb-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-sm font-semibold ${T} flex items-center gap-2`}>
                      <Icon icon="mdi:wrench-outline" width={16} className="text-[#378ADD]" />
                      Habilidades técnicas
                    </h4>
                    <span className="text-xs text-[#378ADD] font-medium">Promedio: {techAvg}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {tecnicas.map((h) => (
                      <div key={h.id} className="flex items-center justify-between gap-4">
                        <span className={`text-sm ${T} flex-1`}>{h.nombre}</span>
                        <StarRating
                          value={ratings[h.id] || 0}
                          onChange={(v) => setRatings((prev) => ({ ...prev, [h.id]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Soft / socioemotional skills */}
              {blandas.length > 0 && (
                <div className={`p-4 rounded-xl ${S} mb-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-sm font-semibold ${T} flex items-center gap-2`}>
                      <Icon icon="hugeicons:brain-02" width={16} className="text-[#378ADD]" />
                      Habilidades socioemocionales
                    </h4>
                    <span className="text-xs text-[#378ADD] font-medium">Promedio: {softAvg}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {blandas.map((h) => (
                      <div key={h.id} className="flex items-center justify-between gap-4">
                        <span className={`text-sm ${T} flex-1`}>{h.nombre}</span>
                        <StarRating
                          value={ratings[h.id] || 0}
                          onChange={(v) => setRatings((prev) => ({ ...prev, [h.id]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {habilidades.length === 0 && (
                <div className={`text-center py-8 ${M} border rounded-xl ${B} mb-4`}>
                  <Icon icon="mdi:alert-circle-outline" width={28} className="mx-auto mb-2 text-yellow-400" />
                  <p className="text-sm">No se encontraron habilidades en la base de datos</p>
                </div>
              )}

              <TextAreaField
                label="Observaciones y comentarios"
                placeholder="Notas adicionales sobre el rendimiento del estudiante..."
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />

              {savedMsg && (
                <p className={`text-sm mb-3 ${savedMsg.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>
                  {savedMsg}
                </p>
              )}

              <div className="flex gap-3">
                <PrimaryButton
                  className="flex-1"
                  onClick={handleGuardar}
                  disabled={!selectedEstudiante || saving}
                >
                  {saving ? "Guardando..." : "Guardar evaluación"}
                </PrimaryButton>
                <SecondaryButton className="flex-1" onClick={handleClear}>
                  Limpiar
                </SecondaryButton>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <h3 className={`text-sm font-semibold ${T} mb-3`}>Evaluaciones recientes</h3>
              {historial.length === 0 ? (
                <p className={`text-xs ${M}`}>No hay evaluaciones registradas</p>
              ) : (
                historial.slice(0, 6).map((h, i) => (
                  <div key={i} className={`${i < Math.min(historial.length, 6) - 1 ? `pb-3 mb-3 border-b ${B}` : ""}`}>
                    <p className={`text-sm font-medium ${T}`}>{h.nombre_estudiante || h.estudiante}</p>
                    <p className={`text-xs ${M} mb-1`}>{h.carrera || "—"} · {h.periodo || h.date}</p>
                    <div className="flex gap-3 text-xs">
                      {h.promedio_tecnico && <span className="text-[#378ADD]">Técnico: {h.promedio_tecnico}</span>}
                      {h.promedio_blando && <span className="text-[#378ADD]">Blando: {h.promedio_blando}</span>}
                    </div>
                  </div>
                ))
              )}
            </Card>

            <Card>
              <h3 className={`text-sm font-semibold ${T} mb-2 flex items-center gap-2`}>
                <Icon icon="gg:sand-clock" width={16} className="text-orange-400" />
                Pendientes
              </h3>
              <p className={`text-3xl font-bold ${T}`}>{estudiantes.length}</p>
              <p className={`text-xs ${M}`}>estudiantes registrados</p>
              <div className={`mt-3 pt-3 border-t ${B}`}>
                <p className={`text-xs ${M}`}>Plazo recomendado: antes del 30 de abril</p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
