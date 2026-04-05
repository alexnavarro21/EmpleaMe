import { useState } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, PageHeader, SelectField, TextAreaField } from "../../components/ui";

const competencias = {
  "Mecánica Automotriz": {
    tecnicas: [
      "Diagnóstico y reparación de motor",
      "Sistemas de frenos y suspensión",
      "Sistemas eléctricos automotrices",
      "Mantención preventiva y correctiva",
      "Uso de equipos de diagnóstico",
    ],
    blandas: [
      "Trabajo en equipo",
      "Seguridad e higiene laboral",
      "Responsabilidad y puntualidad",
      "Atención al detalle",
      "Comunicación con clientes",
    ],
  },
  "Administración": {
    tecnicas: [
      "Manejo de software contable",
      "Gestión y archivo documental",
      "Atención y servicio al cliente",
      "Elaboración de informes",
      "Uso avanzado de planillas",
    ],
    blandas: [
      "Comunicación oral y escrita",
      "Organización y planificación",
      "Trabajo en equipo",
      "Orientación al servicio",
      "Resolución de conflictos",
    ],
  },
};

const historial = [
  { student: "Catalina Muñoz", career: "Administración", date: "Mar 2025", techAvg: 6.2, softAvg: 6.5, by: "Prof. Morales" },
  { student: "Felipe Rojas", career: "Mecánica Automotriz", date: "Mar 2025", techAvg: 6.0, softAvg: 6.3, by: "Prof. Morales" },
  { student: "Diego Castillo", career: "Mecánica Automotriz", date: "Feb 2025", techAvg: 5.8, softAvg: 6.0, by: "Prof. Morales" },
  { student: "Valentina Soto", career: "Administración", date: "Feb 2025", techAvg: 6.4, softAvg: 6.6, by: "Prof. Morales" },
];

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

// Convert 1-5 star rating to 1.0-7.0 scale
const starToNote = (stars) => stars ? (1 + (stars / 5) * 6).toFixed(1) : "—";

export default function AdminEvaluaciones() {
  const { isDark } = useDark();
  const [career, setCareer] = useState("Mecánica Automotriz");
  const [techRatings, setTechRatings] = useState({});
  const [softRatings, setSoftRatings] = useState({});
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const comps = competencias[career];

  const techAvg = Object.keys(techRatings).length
    ? starToNote(Object.values(techRatings).reduce((a, b) => a + b, 0) / Object.keys(techRatings).length)
    : "—";
  const softAvg = Object.keys(softRatings).length
    ? starToNote(Object.values(softRatings).reduce((a, b) => a + b, 0) / Object.keys(softRatings).length)
    : "—";

  const handleCareerChange = (newCareer) => {
    setCareer(newCareer);
    setTechRatings({});
    setSoftRatings({});
  };

  return (
    <div>
      <PageHeader
        title="Registro de Evaluaciones"
        subtitle="Competencias técnicas y blandas de estudiantes"
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-4">
          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-4`}>Nueva evaluación</h3>
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Estudiante">
                <option>Seleccionar estudiante...</option>
                <option>Catalina Muñoz — Administración</option>
                <option>Felipe Rojas — Mecánica Automotriz</option>
                <option>Valentina Soto — Administración</option>
                <option>Sebastián Contreras — Mecánica Automotriz</option>
                <option>Camila Fuentes — Administración</option>
                <option>Diego Castillo — Mecánica Automotriz</option>
              </SelectField>
              <SelectField label="Período">
                <option>2025-I</option>
                <option>2024-II</option>
                <option>2024-I</option>
              </SelectField>
            </div>

            {/* Career selector */}
            <div className="mb-4">
              <label className={`block text-xs mb-2 ${M}`}>Carrera técnica</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(competencias).map((c) => (
                  <button
                    key={c}
                    onClick={() => handleCareerChange(c)}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                      career === c
                        ? `border-2 border-[#378ADD] ${isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"}`
                        : `border ${B}`
                    }`}
                  >
                    <Icon
                      icon={c === "Mecánica Automotriz" ? "mdi:car-wrench" : "mdi:clipboard-list-outline"}
                      width={18}
                      className={career === c ? "text-[#378ADD]" : M}
                    />
                    <span className={`text-sm font-medium ${T}`}>{c}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Technical competencies */}
            <div className={`p-4 rounded-xl ${S} mb-4`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-semibold ${T} flex items-center gap-2`}>
                  <Icon icon={career === "Mecánica Automotriz" ? "mdi:engine-outline" : "mdi:file-account-outline"} width={16} className="text-[#378ADD]" />
                  Competencias técnicas
                </h4>
                <span className="text-xs text-[#378ADD] font-medium">Promedio: {techAvg}</span>
              </div>
              <div className="flex flex-col gap-3">
                {comps.tecnicas.map((comp) => (
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
                <h4 className={`text-sm font-semibold ${T} flex items-center gap-2`}>
                  <Icon icon="hugeicons:brain-02" width={16} className="text-[#378ADD]" />
                  Competencias blandas
                </h4>
                <span className="text-xs text-[#378ADD] font-medium">Promedio: {softAvg}</span>
              </div>
              <div className="flex flex-col gap-3">
                {comps.blandas.map((comp) => (
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
                onClick={() => { setTechRatings({}); setSoftRatings({}); alert("Evaluación guardada"); }}
              >
                Guardar evaluación
              </PrimaryButton>
              <SecondaryButton className="flex-1" onClick={() => { setTechRatings({}); setSoftRatings({}); }}>
                Limpiar
              </SecondaryButton>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-3`}>Evaluaciones recientes</h3>
            {historial.map((h, i) => (
              <div key={h.student} className={`${i < historial.length - 1 ? `pb-3 mb-3 border-b ${B}` : ""}`}>
                <p className={`text-sm font-medium ${T}`}>{h.student}</p>
                <p className={`text-xs ${M} mb-1`}>{h.career} · {h.date}</p>
                <div className="flex gap-3 text-xs">
                  <span className="text-[#378ADD]">Técnico: {h.techAvg}</span>
                  <span className="text-[#378ADD]">Blando: {h.softAvg}</span>
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-2 flex items-center gap-2`}>
              <Icon icon="gg:sand-clock" width={16} className="text-orange-400" />
              Pendientes
            </h3>
            <p className={`text-3xl font-bold ${T}`}>24</p>
            <p className={`text-xs ${M}`}>estudiantes por evaluar</p>
            <div className={`mt-3 pt-3 border-t ${B}`}>
              <p className={`text-xs ${M}`}>Plazo recomendado: antes del 30 de abril</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
