import { useState } from "react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, PageHeader } from "../../components/ui";

const mockFiles = [
  { name: "proyecto_final_web.mp4", type: "video", size: "24.3 MB", date: "12 Mar 2025", status: "aprobado" },
  { name: "certificado_python.pdf", type: "pdf", size: "1.2 MB", date: "05 Feb 2025", status: "aprobado" },
  { name: "demo_app_movil.mp4", type: "video", size: "38.7 MB", date: "20 Ene 2025", status: "pendiente" },
  { name: "foto_hackathon.jpg", type: "imagen", size: "3.1 MB", date: "10 Ene 2025", status: "aprobado" },
];

const typeIcon = { video: "🎬", pdf: "📄", imagen: "🖼️" };
const statusColor = { aprobado: "green", pendiente: "yellow", rechazado: "red" };

export default function EstudianteEvidencias() {
  const { isDark } = useDark();
  const [dragging, setDragging] = useState(false);
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  return (
    <div>
      <PageHeader
        title="Mis Evidencias"
        subtitle="Sube fotos, videos y certificados para destacar tu perfil"
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Upload zone */}
        <div className="col-span-2">
          <Card>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); }}
              className={`rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center py-16 mb-6 cursor-pointer ${
                dragging
                  ? "border-[#378ADD] bg-[#E6F1FB]/30"
                  : isDark ? "border-[#3a3a38] hover:border-[#378ADD]" : "border-[#D3D1C7] hover:border-[#378ADD]"
              }`}
            >
              <div className="text-5xl mb-4">📁</div>
              <p className={`text-base font-medium ${T} mb-1`}>Arrastra archivos aquí</p>
              <p className={`text-sm ${M} mb-4`}>o haz click para seleccionar</p>
              <PrimaryButton>Seleccionar archivos</PrimaryButton>
              <p className={`text-xs ${M} mt-3`}>
                Formatos: JPG, PNG, MP4, MOV, PDF · Máximo 50 MB por archivo
              </p>
            </div>

            {/* File list */}
            <div>
              <h3 className={`text-sm font-semibold ${T} mb-3`}>Archivos subidos ({mockFiles.length})</h3>
              <div className="flex flex-col gap-2">
                {mockFiles.map((file) => (
                  <div
                    key={file.name}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${B} ${isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"} transition-colors`}
                  >
                    <span className="text-2xl flex-shrink-0">{typeIcon[file.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${T} truncate`}>{file.name}</p>
                      <p className={`text-xs ${M}`}>{file.size} · {file.date}</p>
                    </div>
                    <Badge color={statusColor[file.status]}>{file.status}</Badge>
                    <button className={`text-xs ${M} hover:text-red-500 transition-colors flex-shrink-0`}>
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="flex flex-col gap-4">
          <Card>
            <p className={`text-sm font-medium ${T} mb-3`}>Espacio utilizado</p>
            <div className="flex items-end gap-1 mb-1.5">
              <span className={`text-2xl font-semibold ${T}`}>67.3</span>
              <span className={`text-sm ${M} mb-0.5`}>MB / 500 MB</span>
            </div>
            <div className={`w-full h-2 rounded-full ${S}`}>
              <div className="h-2 bg-[#378ADD] rounded-full" style={{ width: "13.5%" }} />
            </div>
            <p className={`text-xs ${M} mt-2`}>432.7 MB disponibles</p>
          </Card>

          <Card>
            <p className={`text-sm font-medium ${T} mb-3`}>Formatos permitidos</p>
            <ul className={`flex flex-col gap-2 text-xs ${M}`}>
              <li className="flex items-center gap-2"><span>🖼️</span> Imágenes (JPG, PNG, WEBP)</li>
              <li className="flex items-center gap-2"><span>🎬</span> Videos (MP4, MOV)</li>
              <li className="flex items-center gap-2"><span>📄</span> Documentos (PDF)</li>
            </ul>
            <div className={`mt-3 pt-3 border-t ${B} text-xs ${M}`}>
              Cada archivo puede tener un máximo de <strong className={T}>50 MB</strong>.
            </div>
          </Card>

          <Card>
            <p className={`text-sm font-medium ${T} mb-2`}>Consejos</p>
            <ul className={`flex flex-col gap-2 text-xs ${M} list-disc list-inside`}>
              <li>Sube proyectos finales y trabajos destacados</li>
              <li>Incluye certificados de cursos completados</li>
              <li>Un video corto explicando un proyecto te diferencia</li>
              <li>Las evidencias son visibles para empresas que te contacten</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
