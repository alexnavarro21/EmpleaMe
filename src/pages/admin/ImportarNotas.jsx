import { useState } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, PageHeader, SelectField } from "../../components/ui";

const previewData = [
  { rut: "21.345.678-9", name: "Catalina Muñoz", career: "Administración", semester: 4, avg: 6.5, status: "ok" },
  { rut: "20.876.543-2", name: "Felipe Rojas", career: "Mecánica Automotriz", semester: 3, avg: 6.2, status: "ok" },
  { rut: "21.111.222-3", name: "Valentina Soto", career: "Administración", semester: 6, avg: 5.9, status: "ok" },
  { rut: "20.555.444-K", name: "Sebastián Contreras", career: "Mecánica Automotriz", semester: 5, avg: 5.8, status: "advertencia" },
  { rut: "21.888.999-1", name: "Camila Fuentes", career: "Administración", semester: 4, avg: 6.1, status: "ok" },
  { rut: "20.333.111-5", name: "Diego Castillo", career: "Mecánica Automotriz", semester: 6, avg: 6.4, status: "ok" },
];

export default function AdminImportarNotas() {
  const { isDark } = useDark();
  const [step, setStep] = useState("upload");
  const [dragging, setDragging] = useState(false);
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  return (
    <div>
      <PageHeader
        title="Importación Masiva de Notas"
        subtitle="Carga calificaciones desde archivos Excel o CSV · Escala 1.0 – 7.0"
      />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: "upload", label: "1. Subir archivo" },
          { key: "preview", label: "2. Previsualizar" },
          { key: "done", label: "3. Confirmar" },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                step === s.key ? "bg-[#0F4D8A] text-white" :
                (step === "preview" && i === 0) || step === "done" ? "bg-green-500 text-white" :
                `${S} ${M}`
              }`}
            >
              {((step === "preview" && i === 0) || step === "done")
                ? <Icon icon="mdi:check" width={14} />
                : i + 1}
            </span>
            <span className={`text-sm ${step === s.key ? T : M}`}>{s.label}</span>
            {i < 2 && <Icon icon="mdi:chevron-right" width={16} className={M} />}
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
                <option>Mecánica Automotriz</option>
                <option>Administración</option>
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
                <Icon icon="icon-park-outline:excel" width={52} className={`${M} mb-4`} />
                <p className={`text-base font-medium ${T} mb-1`}>Arrastra tu archivo aquí</p>
                <p className={`text-sm ${M} mb-4`}>Formatos: .xlsx, .csv</p>
                <PrimaryButton
                  className="flex items-center gap-2"
                  onClick={() => setStep("preview")}
                >
                  <Icon icon="material-symbols:upload" width={16} />
                  Seleccionar archivo
                </PrimaryButton>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <p className={`text-sm font-medium ${T} mb-3`}>Formato requerido</p>
              <p className={`text-xs ${M} mb-3`}>El archivo debe contener las columnas:</p>
              <div className={`rounded-lg p-3 ${S} font-mono text-xs ${T}`}>
                <p className="mb-1">RUT | Nombres | Apellidos</p>
                <p className="mb-1">Carrera | Semestre</p>
                <p className="mb-1">Nota_M1 | Nota_M2 | ...</p>
                <p>Promedio (1.0 – 7.0)</p>
              </div>
              <button className="text-xs text-[#378ADD] hover:underline mt-3 flex items-center gap-1">
                <Icon icon="material-symbols:download" width={14} />
                Descargar plantilla Excel
              </button>
            </Card>

            <Card>
              <p className={`text-sm font-medium ${T} mb-2`}>Importaciones anteriores</p>
              {[
                { label: "2024-II — 86 registros", date: "Feb 2025" },
                { label: "2024-I — 82 registros", date: "Ago 2024" },
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
                {["RUT", "Nombre", "Carrera", "Semestre", "Promedio", "Estado"].map((h) => (
                  <th key={h} className={`text-left text-xs font-medium ${M} px-5 py-3`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row) => (
                <tr key={row.rut} className={`border-b ${B} last:border-0`}>
                  <td className={`px-5 py-3 text-sm ${M} font-mono`}>{row.rut}</td>
                  <td className={`px-5 py-3 text-sm font-medium ${T}`}>{row.name}</td>
                  <td className={`px-5 py-3 text-sm ${M}`}>{row.career}</td>
                  <td className={`px-5 py-3 text-sm ${M}`}>Sem. {row.semester}</td>
                  <td className={`px-5 py-3 text-sm font-semibold ${T}`}>{row.avg.toFixed(1)}</td>
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
          <Icon icon="mdi:check-circle" width={64} className="mx-auto mb-4 text-green-500" />
          <p className={`text-xl font-semibold ${T} mb-2`}>Importación exitosa</p>
          <p className={`text-sm ${M} mb-6`}>
            {previewData.length} registros importados para el período 2025-I
          </p>
          <div className="flex gap-3 justify-center">
            <PrimaryButton onClick={() => setStep("upload")} className="flex items-center gap-2">
              <Icon icon="material-symbols:upload" width={16} />
              Nueva importación
            </PrimaryButton>
            <SecondaryButton>Ver historial</SecondaryButton>
          </div>
        </Card>
      )}
    </div>
  );
}
