import { useState } from "react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, PageHeader, SelectField } from "../../components/ui";

const tests = [
  {
    id: 1,
    name: "Test DISC — Perfil de comportamiento",
    description: "Evalúa los 4 factores del comportamiento: Dominancia, Influencia, Estabilidad, Conciencia.",
    assignedTo: "Todos los estudiantes · Sem. 4+",
    responses: 89,
    total: 98,
    status: "activo",
    date: "01 Mar 2025",
  },
  {
    id: 2,
    name: "Test de Inteligencia Emocional (TMMS-24)",
    description: "Mide la capacidad de atención, claridad y reparación emocional.",
    assignedTo: "Desarrollo de Software · Sem. 6+",
    responses: 34,
    total: 42,
    status: "activo",
    date: "15 Feb 2025",
  },
  {
    id: 3,
    name: "Inventario de Habilidades Sociales",
    description: "Evalúa asertividad, empatía y habilidades de comunicación.",
    assignedTo: "Todos los estudiantes · Sem. 2",
    responses: 55,
    total: 55,
    status: "completado",
    date: "10 Ene 2025",
  },
];

export default function AdminTests() {
  const { isDark } = useDark();
  const [tab, setTab] = useState("lista");
  const [dragging, setDragging] = useState(false);
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  return (
    <div>
      <PageHeader
        title="Tests Socioemocionales"
        subtitle="Gestiona y asigna tests psicológicos y de habilidades blandas"
        action={<PrimaryButton onClick={() => setTab("cargar")}>+ Cargar nuevo test</PrimaryButton>}
      />

      {/* Tabs */}
      <div className={`flex border-b ${B} mb-6`}>
        {[{ key: "lista", label: "Tests activos" }, { key: "cargar", label: "Cargar test" }, { key: "resultados", label: "Resultados" }].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm border-b-2 -mb-px transition-colors ${
              tab === t.key ? "border-[#185FA5] text-[#185FA5] font-medium" : `border-transparent ${M}`
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
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${S}`}>
                    🧪
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className={`text-sm font-semibold ${T}`}>{test.name}</p>
                      <Badge color={test.status === "activo" ? "green" : "gray"}>{test.status}</Badge>
                    </div>
                    <p className={`text-xs ${M} mb-2`}>{test.description}</p>
                    <p className={`text-xs text-[#378ADD] mb-3`}>Asignado a: {test.assignedTo}</p>

                    <div className="flex items-center gap-3">
                      <div className={`flex-1 h-1.5 rounded-full ${S}`}>
                        <div className="h-1.5 bg-[#378ADD] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-xs ${M} flex-shrink-0`}>{test.responses}/{test.total} completaron ({pct}%)</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <SecondaryButton className="text-xs py-1.5 px-3">Ver resultados</SecondaryButton>
                    <button className={`text-xs ${M} hover:text-red-500 transition-colors`}>Archivar</button>
                  </div>
                </div>
              </Card>
            );
          })}
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
                  placeholder="ej. Test de Resiliencia BRIEF"
                  className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                    isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]" : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
                  }`}
                />
              </div>
              <div className="mb-3">
                <label className={`block text-xs mb-1.5 ${M}`}>Descripción</label>
                <textarea
                  rows={3}
                  placeholder="Breve descripción del test y qué mide..."
                  className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all resize-none focus:border-[#378ADD] ${
                    isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]" : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
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
                <span className="text-4xl mb-3">📋</span>
                <p className={`text-sm ${T} mb-1`}>Sube el formulario del test</p>
                <p className={`text-xs ${M}`}>PDF, DOCX, XLSX aceptados</p>
              </div>

              <SelectField label="Asignar a">
                <option>Todos los estudiantes</option>
                <option>Desarrollo de Software</option>
                <option>Sistemas de Información</option>
                <option>Solo Sem. 1-3</option>
                <option>Solo Sem. 4+</option>
              </SelectField>

              <PrimaryButton className="w-full mt-2">Publicar test</PrimaryButton>
            </Card>
          </div>

          <Card>
            <p className={`text-sm font-medium ${T} mb-3`}>Consejos</p>
            <ul className={`flex flex-col gap-2 text-xs ${M} list-disc list-inside`}>
              <li>Los tests deben tener instrucciones claras</li>
              <li>Incluye escala de valoración (1-5, Likert, etc.)</li>
              <li>Define quién puede ver los resultados</li>
              <li>Los resultados son confidenciales para los estudiantes</li>
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
                {["Dominancia alta", "Influencia alta", "Estabilidad alta", "Conciencia alta"].map((dim, i) => (
                  <div key={dim} className={`p-3 rounded-lg ${S} text-center`}>
                    <p className={`text-lg font-bold ${T}`}>{[32, 28, 24, 16][i]}%</p>
                    <p className={`text-xs ${M} mt-0.5`}>{dim}</p>
                  </div>
                ))}
              </div>
              <button className="text-xs text-[#378ADD] hover:underline mt-3">Ver reporte completo →</button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
