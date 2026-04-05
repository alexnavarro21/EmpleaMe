import { useState } from "react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, PageHeader, SelectField, TextAreaField } from "../../components/ui";

const technicalComps = [
  "Programación y algoritmia",
  "Base de datos",
  "Redes y comunicaciones",
  "Desarrollo web",
  "Control de versiones",
];

const softComps = [
  "Trabajo en equipo",
  "Comunicación oral y escrita",
  "Puntualidad y responsabilidad",
  "Resolución de problemas",
  "Adaptabilidad",
];

const history = [
  { student: "Carlos Mendoza", date: "Mar 2025", techAvg: 4.4, softAvg: 4.6, by: "Prof. García" },
  { student: "Ana Torres", date: "Mar 2025", techAvg: 4.7, softAvg: 4.8, by: "Prof. García" },
  { student: "Luis García", date: "Feb 2025", techAvg: 3.9, softAvg: 4.2, by: "Prof. Ramírez" },
  { student: "María López", date: "Feb 2025", techAvg: 4.9, softAvg: 5.0, by: "Prof. García" },
];

function StarRating({ value, onChange }) {
  const { isDark } = useDark();
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={`text-xl transition-transform hover:scale-110 ${star <= value ? "opacity-100" : "opacity-30"}`}
        >
          ⭐
        </button>
      ))}
    </div>
  );
}

export default function AdminEvaluaciones() {
  const { isDark } = useDark();
  const [techRatings, setTechRatings] = useState({});
  const [softRatings, setSoftRatings] = useState({});
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const techAvg = Object.keys(techRatings).length
    ? (Object.values(techRatings).reduce((a, b) => a + b, 0) / Object.keys(techRatings).length).toFixed(1)
    : "—";
  const softAvg = Object.keys(softRatings).length
    ? (Object.values(softRatings).reduce((a, b) => a + b, 0) / Object.keys(softRatings).length).toFixed(1)
    : "—";

  return (
    <div>
      <PageHeader
        title="Registro de Evaluaciones"
        subtitle="Competencias técnicas y blandas de estudiantes"
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Evaluation form */}
        <div className="col-span-2 flex flex-col gap-4">
          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-4`}>Nueva evaluación</h3>
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Estudiante">
                <option>Seleccionar estudiante...</option>
                <option>Carlos Mendoza</option>
                <option>María López</option>
                <option>Ana Torres</option>
                <option>Luis García</option>
                <option>Diego Ríos</option>
              </SelectField>
              <SelectField label="Período">
                <option>2025-I</option>
                <option>2024-II</option>
                <option>2024-I</option>
              </SelectField>
            </div>

            {/* Technical competencies */}
            <div className={`mt-2 p-4 rounded-xl ${S} mb-4`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-semibold ${T}`}>Competencias técnicas</h4>
                <span className="text-xs text-[#378ADD] font-medium">Promedio: {techAvg}</span>
              </div>
              <div className="flex flex-col gap-3">
                {technicalComps.map((comp) => (
                  <div key={comp} className="flex items-center justify-between gap-4">
                    <span className={`text-sm ${T} flex-1`}>{comp}</span>
                    <StarRating
                      value={techRatings[comp] || 0}
                      onChange={(v) => setTechRatings((prev) => ({ ...prev, [comp]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Soft competencies */}
            <div className={`p-4 rounded-xl ${S} mb-4`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-semibold ${T}`}>Competencias blandas</h4>
                <span className="text-xs text-[#378ADD] font-medium">Promedio: {softAvg}</span>
              </div>
              <div className="flex flex-col gap-3">
                {softComps.map((comp) => (
                  <div key={comp} className="flex items-center justify-between gap-4">
                    <span className={`text-sm ${T} flex-1`}>{comp}</span>
                    <StarRating
                      value={softRatings[comp] || 0}
                      onChange={(v) => setSoftRatings((prev) => ({ ...prev, [comp]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <TextAreaField label="Observaciones y comentarios" placeholder="Notas adicionales sobre el rendimiento del estudiante..." rows={3} />

            <div className="flex gap-3">
              <PrimaryButton
                className="flex-1"
                onClick={() => { setTechRatings({}); setSoftRatings({}); alert("Evaluación guardada con éxito"); }}
              >
                Guardar evaluación
              </PrimaryButton>
              <SecondaryButton className="flex-1" onClick={() => { setTechRatings({}); setSoftRatings({}); }}>
                Limpiar
              </SecondaryButton>
            </div>
          </Card>
        </div>

        {/* History */}
        <div>
          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-3`}>Evaluaciones recientes</h3>
            {history.map((h, i) => (
              <div key={h.student} className={`${i < history.length - 1 ? `pb-3 mb-3 border-b ${B}` : ""}`}>
                <p className={`text-sm font-medium ${T}`}>{h.student}</p>
                <p className={`text-xs ${M} mb-1`}>{h.date} · {h.by}</p>
                <div className="flex gap-3 text-xs">
                  <span className="text-[#378ADD]">Técnico: ⭐{h.techAvg}</span>
                  <span className="text-[#378ADD]">Blando: ⭐{h.softAvg}</span>
                </div>
              </div>
            ))}
          </Card>

          <Card className="mt-4">
            <h3 className={`text-sm font-semibold ${T} mb-2`}>Pendientes</h3>
            <p className={`text-3xl font-bold ${T}`}>31</p>
            <p className={`text-xs ${M}`}>estudiantes por evaluar</p>
            <div className={`mt-3 pt-3 border-t ${B}`}>
              <p className={`text-xs ${M}`}>Plazo recomendado: antes del 15 de abril</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
