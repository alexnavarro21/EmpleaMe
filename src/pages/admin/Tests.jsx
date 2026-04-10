import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, PageHeader, SelectField } from "../../components/ui";
import { getEstudiantes, guardarResultadoTest } from "../../services/api";

const tests = [
  {
    id: 1,
    name: "Test DISC — Perfil de comportamiento",
    description: "Evalúa los 4 factores del comportamiento: Dominancia, Influencia, Estabilidad y Conciencia.",
    assignedTo: "Todos los estudiantes · 2do año+",
    responses: 61,
    total: 72,
    status: "activo",
    date: "01 Mar 2025",
    dimensiones: ["Dominancia", "Influencia", "Estabilidad", "Conciencia"],
  },
  {
    id: 2,
    name: "Test de Inteligencia Emocional (TMMS-24)",
    description: "Mide la capacidad de atención, claridad y reparación emocional.",
    assignedTo: "Administración · Sem. 4+",
    responses: 28,
    total: 34,
    status: "activo",
    date: "15 Feb 2025",
    dimensiones: ["Atención emocional", "Claridad emocional", "Reparación emocional"],
  },
  {
    id: 3,
    name: "Inventario de Habilidades Sociales",
    description: "Evalúa asertividad, empatía y habilidades de comunicación.",
    assignedTo: "Todos los estudiantes · 1er año",
    responses: 42,
    total: 42,
    status: "completado",
    date: "10 Ene 2025",
    dimensiones: ["Asertividad", "Empatía", "Comunicación", "Trabajo en equipo"],
  },
];

function ScoreInput({ label, value, onChange, isDark }) {
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={`text-sm ${T} flex-1`}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-20 px-2 py-1.5 rounded-lg text-sm text-center outline-none border transition-all focus:border-[#378ADD] ${
            isDark
              ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]"
              : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
          }`}
        />
        <span className={`text-xs ${M}`}>/ 100</span>
      </div>
    </div>
  );
}

export default function AdminTests() {
  const { isDark } = useDark();
  const [tab, setTab] = useState("lista");
  const [dragging, setDragging] = useState(false);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loadingEsts, setLoadingEsts] = useState(false);

  // Evaluación por estudiante
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedEstudiante, setSelectedEstudiante] = useState("");
  const [scores, setScores] = useState({});
  const [nota, setNota] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  useEffect(() => {
    if (tab === "evaluar" && estudiantes.length === 0) {
      setLoadingEsts(true);
      getEstudiantes()
        .then(setEstudiantes)
        .catch(() => {})
        .finally(() => setLoadingEsts(false));
    }
  }, [tab]);

  function handleSelectTest(test) {
    setSelectedTest(test);
    setScores(Object.fromEntries(test.dimensiones.map((d) => [d, ""])));
    setSelectedEstudiante("");
    setSavedMsg("");
    setNota("");
  }

  async function handleGuardarResultado() {
    if (!selectedTest || !selectedEstudiante) return;
    setSaving(true);
    setSavedMsg("");
    try {
      await guardarResultadoTest({
        test_id: selectedTest.id,
        test_nombre: selectedTest.name,
        estudiante_id: Number(selectedEstudiante),
        dimensiones: Object.entries(scores).map(([nombre, puntaje]) => ({ nombre, puntaje: Number(puntaje) })),
        nota_observaciones: nota,
      });
      setSavedMsg("Resultado guardado correctamente");
      setScores(Object.fromEntries(selectedTest.dimensiones.map((d) => [d, ""])));
      setNota("");
    } catch (err) {
      setSavedMsg("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Tests Socioemocionales"
        subtitle="Gestiona, asigna y evalúa tests por estudiante"
        action={
          <PrimaryButton className="flex items-center gap-2" onClick={() => setTab("cargar")}>
            <Icon icon="mdi:plus" width={16} />
            Cargar nuevo test
          </PrimaryButton>
        }
      />

      <div className={`flex border-b ${B} mb-6`}>
        {[
          { key: "lista", label: "Tests activos" },
          { key: "evaluar", label: "Evaluar estudiante" },
          { key: "cargar", label: "Cargar test" },
          { key: "resultados", label: "Resultados" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm border-b-2 -mb-px transition-colors ${
              tab === t.key ? "border-[#0F4D8A] text-[#0F4D8A] font-medium" : `border-transparent ${M}`
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "lista" && (
        <div className="flex flex-col gap-4">
          {tests.map((test) => {
            const pct = Math.round((test.responses / test.total) * 100);
            return (
              <Card key={test.id}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${S}`}>
                    <Icon icon="hugeicons:brain-02" width={22} className="text-[#378ADD]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className={`text-sm font-semibold ${T}`}>{test.name}</p>
                      <Badge color={test.status === "activo" ? "green" : "gray"}>{test.status}</Badge>
                    </div>
                    <p className={`text-xs ${M} mb-2`}>{test.description}</p>
                    <p className="text-xs text-[#378ADD] mb-3">Asignado a: {test.assignedTo}</p>
                    <div className="flex items-center gap-3">
                      <div className={`flex-1 h-1.5 rounded-full ${S}`}>
                        <div className="h-1.5 bg-[#378ADD] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-xs ${M} flex-shrink-0`}>
                        {test.responses}/{test.total} completaron ({pct}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <SecondaryButton
                      className="text-xs py-1.5 px-3"
                      onClick={() => { handleSelectTest(test); setTab("evaluar"); }}
                    >
                      Evaluar
                    </SecondaryButton>
                    <button className={`text-xs ${M} hover:text-red-500 transition-colors`}>Archivar</button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "evaluar" && (
        <div className="grid grid-cols-3 gap-6">
          {/* Test selector list */}
          <div className="flex flex-col gap-3">
            <p className={`text-xs font-medium ${M} uppercase tracking-wide`}>Seleccionar test</p>
            {tests.map((test) => (
              <button
                key={test.id}
                onClick={() => handleSelectTest(test)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  selectedTest?.id === test.id
                    ? `border-2 border-[#378ADD] ${isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"}`
                    : `border ${B} ${isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"}`
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon="hugeicons:brain-02" width={14} className="text-[#378ADD] flex-shrink-0" />
                  <span className={`text-xs font-medium ${T} line-clamp-2`}>{test.name}</span>
                </div>
                <Badge color={test.status === "activo" ? "green" : "gray"} className="text-xs">
                  {test.status}
                </Badge>
              </button>
            ))}
          </div>

          {/* Evaluation form */}
          <div className="col-span-2">
            {!selectedTest ? (
              <div className={`flex flex-col items-center justify-center h-64 border rounded-xl ${B} ${M}`}>
                <Icon icon="hugeicons:brain-02" width={40} className="mb-3 opacity-40" />
                <p className="text-sm">Selecciona un test para evaluar</p>
              </div>
            ) : (
              <Card>
                <h3 className={`text-sm font-semibold ${T} mb-1`}>{selectedTest.name}</h3>
                <p className={`text-xs ${M} mb-4`}>{selectedTest.description}</p>

                <div className="mb-4">
                  <label className={`block text-xs mb-1.5 ${M}`}>Estudiante a evaluar</label>
                  {loadingEsts ? (
                    <div className={`flex items-center gap-2 ${M} text-sm`}>
                      <Icon icon="mdi:loading" width={16} className="animate-spin" />
                      Cargando estudiantes...
                    </div>
                  ) : (
                    <select
                      value={selectedEstudiante}
                      onChange={(e) => setSelectedEstudiante(e.target.value)}
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
                  )}
                </div>

                <div className={`p-4 rounded-xl ${S} mb-4`}>
                  <h4 className={`text-sm font-semibold ${T} mb-3 flex items-center gap-2`}>
                    <Icon icon="mdi:chart-bar" width={16} className="text-[#378ADD]" />
                    Puntajes por dimensión
                  </h4>
                  <div className="flex flex-col gap-3">
                    {selectedTest.dimensiones.map((dim) => (
                      <ScoreInput
                        key={dim}
                        label={dim}
                        value={scores[dim] ?? ""}
                        onChange={(v) => setScores((prev) => ({ ...prev, [dim]: v }))}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className={`block text-xs mb-1.5 ${M}`}>Observaciones</label>
                  <textarea
                    rows={3}
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Notas sobre el resultado del estudiante en este test..."
                    className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all resize-none focus:border-[#378ADD] ${
                      isDark
                        ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                        : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
                    }`}
                  />
                </div>

                {savedMsg && (
                  <p className={`text-sm mb-3 ${savedMsg.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>
                    {savedMsg}
                  </p>
                )}

                <PrimaryButton
                  className="w-full"
                  onClick={handleGuardarResultado}
                  disabled={!selectedEstudiante || saving}
                >
                  {saving ? "Guardando..." : "Guardar resultado"}
                </PrimaryButton>
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === "cargar" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <h3 className={`text-sm font-semibold ${T} mb-4`}>Subir nuevo test</h3>
              <div className="mb-3">
                <label className={`block text-xs mb-1.5 ${M}`}>Nombre del test</label>
                <input
                  type="text"
                  placeholder="ej. Test de Resiliencia"
                  className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                    isDark
                      ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                      : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
                  }`}
                />
              </div>
              <div className="mb-3">
                <label className={`block text-xs mb-1.5 ${M}`}>Descripción</label>
                <textarea
                  rows={3}
                  placeholder="Breve descripción del test y qué mide..."
                  className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all resize-none focus:border-[#378ADD] ${
                    isDark
                      ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                      : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
                  }`}
                />
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); }}
                className={`rounded-xl border-2 border-dashed py-12 flex flex-col items-center cursor-pointer transition-colors mb-4 ${
                  dragging ? "border-[#378ADD] bg-[#E6F1FB]/30" : isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]"
                }`}
              >
                <Icon icon="mdi:clipboard-list-outline" width={44} className={`${M} mb-3`} />
                <p className={`text-sm ${T} mb-1`}>Sube el formulario del test</p>
                <p className={`text-xs ${M}`}>PDF, DOCX, XLSX aceptados</p>
              </div>

              <SelectField label="Asignar a">
                <option>Todos los estudiantes</option>
                <option>Mecánica Automotriz</option>
                <option>Administración</option>
                <option>Solo 1er año</option>
                <option>Solo 2do año+</option>
              </SelectField>

              <PrimaryButton className="w-full mt-2 flex items-center justify-center gap-2">
                <Icon icon="material-symbols:upload" width={16} />
                Publicar test
              </PrimaryButton>
            </Card>
          </div>

          <Card>
            <p className={`text-sm font-medium ${T} mb-3`}>Consejos</p>
            <ul className={`flex flex-col gap-2 text-xs ${M} list-disc list-inside`}>
              <li>Los tests deben tener instrucciones claras</li>
              <li>Define la escala de respuesta (Likert, Sí/No, etc.)</li>
              <li>Los resultados son confidenciales para los estudiantes</li>
              <li>Comunica el propósito del test antes de aplicarlo</li>
            </ul>
          </Card>
        </div>
      )}

      {tab === "resultados" && (
        <div className="flex flex-col gap-4">
          {tests.map((test) => (
            <Card key={test.id}>
              <p className={`text-sm font-semibold ${T} mb-1`}>{test.name}</p>
              <p className={`text-xs ${M} mb-3`}>{test.responses} respuestas de {test.total} asignados</p>
              <div className="grid grid-cols-4 gap-3">
                {test.dimensiones.map((dim, i) => (
                  <div key={dim} className={`p-3 rounded-lg ${S} text-center`}>
                    <p className={`text-lg font-bold ${T}`}>{[32, 28, 24, 16][i] ?? "—"}%</p>
                    <p className={`text-xs ${M} mt-0.5`}>{dim}</p>
                  </div>
                ))}
              </div>
              <button
                className="text-xs text-[#378ADD] hover:underline mt-3"
                onClick={() => { handleSelectTest(test); setTab("evaluar"); }}
              >
                Evaluar estudiante →
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
