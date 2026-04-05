import { useState } from "react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, PageHeader, SelectField } from "../../components/ui";

const previewData = [
  { dni: "12345678", name: "Carlos Mendoza", career: "Desarrollo de Software", semester: 6, avg: 17.2, status: "ok" },
  { dni: "87654321", name: "María López", career: "Desarrollo de Software", semester: 8, avg: 19.0, status: "ok" },
  { dni: "11223344", name: "Ana Torres", career: "Sistemas de Información", semester: 7, avg: 18.5, status: "ok" },
  { dni: "44332211", name: "Luis García", career: "Redes y Comunicaciones", semester: 6, avg: 16.8, status: "advertencia" },
  { dni: "55667788", name: "Diego Ríos", career: "Desarrollo de Software", semester: 8, avg: 18.1, status: "ok" },
];

export default function AdminImportarNotas() {
  const { isDark } = useDark();
  const [step, setStep] = useState("upload"); // upload | preview | done
  const [dragging, setDragging] = useState(false);
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  return (
    <div>
      <PageHeader
        title="Importación Masiva de Notas"
        subtitle="Carga calificaciones desde archivos Excel o CSV"
      />

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        {[
          { key: "upload", label: "1. Subir archivo" },
          { key: "preview", label: "2. Previsualizar" },
          { key: "done", label: "3. Confirmar" },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                step === s.key ? "bg-[#185FA5] text-white" :
                (step === "preview" && i === 0) || step === "done" ? "bg-green-500 text-white" :
                `${S} ${M}`
              }`}
            >
              {((step === "preview" && i === 0) || step === "done") ? "✓" : i + 1}
            </span>
            <span className={`text-sm ${step === s.key ? T : M}`}>{s.label}</span>
            {i < 2 && <span className={`text-sm ${M} mx-1`}>→</span>}
          </div>
        ))}
      </div>

      {step === "upload" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <SelectField label="Período académico">
                <option>2025-I</option>
                <option>2024-II</option>
                <option>2024-I</option>
              </SelectField>
              <SelectField label="Carrera">
                <option>Todas las carreras</option>
                <option>Desarrollo de Software</option>
                <option>Sistemas de Información</option>
                <option>Redes y Comunicaciones</option>
              </SelectField>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); setStep("preview"); }}
                className={`mt-2 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center py-16 cursor-pointer ${
                  dragging
                    ? "border-[#378ADD] bg-[#E6F1FB]/30"
                    : isDark ? "border-[#3a3a38] hover:border-[#378ADD]" : "border-[#D3D1C7] hover:border-[#378ADD]"
                }`}
              >
                <span className="text-5xl mb-4">📊</span>
                <p className={`text-base font-medium ${T} mb-1`}>Arrastra tu archivo aquí</p>
                <p className={`text-sm ${M} mb-4`}>Formatos permitidos: .xlsx, .csv</p>
                <PrimaryButton onClick={() => setStep("preview")}>
                  Seleccionar archivo
                </PrimaryButton>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <p className={`text-sm font-medium ${T} mb-3`}>Formato requerido</p>
              <p className={`text-xs ${M} mb-3`}>El archivo debe tener las siguientes columnas en orden:</p>
              <div className={`rounded-lg p-3 ${S} font-mono text-xs ${T}`}>
                <p className="mb-1">DNI | Nombres | Apellidos</p>
                <p className="mb-1">Carrera | Semestre</p>
                <p className="mb-1">Nota_C1 | Nota_C2 | ...</p>
                <p>Promedio</p>
              </div>
              <div className="mt-3">
                <button className="text-xs text-[#378ADD] hover:underline">
                  Descargar plantilla Excel →
                </button>
              </div>
            </Card>

            <Card>
              <p className={`text-sm font-medium ${T} mb-2`}>Importaciones anteriores</p>
              {[
                { label: "2024-II — 142 registros", date: "Feb 2025" },
                { label: "2024-I — 138 registros", date: "Ago 2024" },
              ].map((imp) => (
                <div key={imp.label} className={`flex justify-between items-center text-xs py-2 border-b ${B} last:border-0`}>
                  <span className={M}>{imp.label}</span>
                  <span className={M}>{imp.date}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {step === "preview" && (
        <Card className="p-0 overflow-hidden">
          <div className={`flex items-center justify-between px-5 py-4 border-b ${B}`}>
            <div>
              <p className={`text-sm font-semibold ${T}`}>notas_2025_I.xlsx</p>
              <p className={`text-xs ${M}`}>{previewData.length} registros encontrados · 1 advertencia</p>
            </div>
            <div className="flex gap-2">
              <SecondaryButton onClick={() => setStep("upload")}>Cambiar archivo</SecondaryButton>
              <PrimaryButton onClick={() => setStep("done")}>Confirmar importación</PrimaryButton>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className={`border-b ${B} ${S}`}>
                {["DNI", "Nombre", "Carrera", "Semestre", "Promedio", "Estado"].map((h) => (
                  <th key={h} className={`text-left text-xs font-medium ${M} px-5 py-3`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row) => (
                <tr key={row.dni} className={`border-b ${B} last:border-0`}>
                  <td className={`px-5 py-3 text-sm ${M}`}>{row.dni}</td>
                  <td className={`px-5 py-3 text-sm font-medium ${T}`}>{row.name}</td>
                  <td className={`px-5 py-3 text-sm ${M}`}>{row.career}</td>
                  <td className={`px-5 py-3 text-sm ${M}`}>Sem. {row.semester}</td>
                  <td className={`px-5 py-3 text-sm font-semibold ${T}`}>{row.avg}</td>
                  <td className="px-5 py-3">
                    <Badge color={row.status === "ok" ? "green" : "yellow"}>
                      {row.status === "ok" ? "OK" : "Revisar"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {step === "done" && (
        <Card className="text-center py-16">
          <div className="text-6xl mb-4">✅</div>
          <p className={`text-xl font-semibold ${T} mb-2`}>Importación exitosa</p>
          <p className={`text-sm ${M} mb-6`}>{previewData.length} registros importados correctamente para el período 2025-I</p>
          <div className="flex gap-3 justify-center">
            <PrimaryButton onClick={() => setStep("upload")}>Nueva importación</PrimaryButton>
            <SecondaryButton>Ver historial</SecondaryButton>
          </div>
        </Card>
      )}
    </div>
  );
}
