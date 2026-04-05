import { useState } from "react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, FormField, PageHeader, TextAreaField } from "../../components/ui";

const skills = ["JavaScript", "React", "Python", "SQL", "Git", "HTML/CSS", "Node.js"];

const tabs = ["Personal", "Académico", "Habilidades", "Video"];

export default function EstudiantePerfil() {
  const { isDark } = useDark();
  const [activeTab, setActiveTab] = useState("Personal");
  const [editMode, setEditMode] = useState(false);
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  return (
    <div>
      <PageHeader
        title="Mi Perfil"
        subtitle="Gestiona tu información y descarga tu CV"
        action={
          <div className="flex gap-2">
            <SecondaryButton onClick={() => setEditMode(!editMode)}>
              {editMode ? "Cancelar" : "Editar perfil"}
            </SecondaryButton>
            <PrimaryButton
              onClick={() => alert("CV generado en PDF")}
              className="flex items-center gap-2"
            >
              ⬇ Descargar CV PDF
            </PrimaryButton>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Left: profile card */}
        <div className="flex flex-col gap-4">
          <Card className="text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl ${S}`}>
              👤
            </div>
            <p className={`text-base font-semibold ${T}`}>Carlos Mendoza</p>
            <p className={`text-xs ${M} mb-2`}>Desarrollo de Software</p>
            <Badge color="blue">Estudiante Activo</Badge>
            <div className={`mt-4 pt-4 border-t ${B} text-left`}>
              <div className="flex justify-between text-xs mb-1">
                <span className={M}>Perfil completado</span>
                <span className="text-[#378ADD]">72%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full ${S}`}>
                <div className="h-1.5 bg-[#378ADD] rounded-full" style={{ width: "72%" }} />
              </div>
            </div>
          </Card>

          <Card>
            <p className={`text-xs font-medium ${T} mb-2`}>Evaluación docente</p>
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <span className={`text-2xl font-semibold ${T}`}>4.5</span>
              <span className={`text-xs ${M}`}>/ 5.0</span>
            </div>
            <p className={`text-xs ${M} mt-1`}>Por Prof. García · Nov 2024</p>
          </Card>

          <Card>
            <p className={`text-xs font-medium ${T} mb-3`}>Notas académicas</p>
            <p className={`text-2xl font-semibold ${T}`}>17.2</p>
            <p className={`text-xs ${M}`}>Promedio sobre 20</p>
          </Card>
        </div>

        {/* Right: tabs */}
        <div className="col-span-2">
          <Card className="p-0 overflow-hidden">
            {/* Tab bar */}
            <div className={`flex border-b ${B}`}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? "border-[#185FA5] text-[#185FA5] font-medium"
                      : `border-transparent ${M} hover:${T}`
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === "Personal" && (
                <div className="grid grid-cols-2 gap-x-6">
                  <FormField label="Nombre" placeholder="Carlos" />
                  <FormField label="Apellido" placeholder="Mendoza" />
                  <FormField label="Correo electrónico" type="email" placeholder="carlos@email.com" />
                  <FormField label="Teléfono" type="tel" placeholder="+51 999 888 777" />
                  <FormField label="DNI" placeholder="12345678" />
                  <FormField label="Fecha de nacimiento" type="date" />
                  <FormField label="Dirección" placeholder="Av. Principal 123" className="col-span-2" />
                  <FormField label="Ciudad" placeholder="Lima" />
                  <FormField label="País" placeholder="Perú" />
                  {editMode && (
                    <div className="col-span-2 mt-2">
                      <PrimaryButton className="w-full">Guardar cambios</PrimaryButton>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Académico" && (
                <div className="grid grid-cols-2 gap-x-6">
                  <FormField label="Instituto" placeholder="Instituto Técnico Nacional" className="col-span-2" />
                  <FormField label="Carrera" placeholder="Desarrollo de Software" />
                  <FormField label="Semestre actual" placeholder="6° semestre" />
                  <FormField label="Promedio (sobre 20)" placeholder="17.2" />
                  <FormField label="Año de egreso esperado" placeholder="2025" />
                  <TextAreaField label="Logros académicos" placeholder="Menciones, premios, proyectos destacados..." rows={3} />
                  {editMode && (
                    <div className="col-span-2 mt-2">
                      <PrimaryButton className="w-full">Guardar cambios</PrimaryButton>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Habilidades" && (
                <div>
                  <p className={`text-xs ${M} mb-3`}>Habilidades técnicas</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${B} ${T}`}
                      >
                        {s}
                        {editMode && (
                          <button className="text-[#888780] hover:text-red-500 text-xs">✕</button>
                        )}
                      </span>
                    ))}
                    {editMode && (
                      <button className="text-sm px-3 py-1.5 rounded-full border border-dashed border-[#378ADD] text-[#378ADD] hover:bg-[#E6F1FB] transition-colors">
                        + Agregar
                      </button>
                    )}
                  </div>
                  <p className={`text-xs ${M} mb-3`}>Habilidades blandas</p>
                  <div className="flex flex-wrap gap-2">
                    {["Trabajo en equipo", "Comunicación", "Resolución de problemas", "Adaptabilidad"].map((s) => (
                      <span key={s} className={`text-sm px-3 py-1.5 rounded-full border ${B} ${T} flex items-center gap-1.5`}>
                        {s}
                        {editMode && (
                          <button className="text-[#888780] hover:text-red-500 text-xs">✕</button>
                        )}
                      </span>
                    ))}
                    {editMode && (
                      <button className="text-sm px-3 py-1.5 rounded-full border border-dashed border-[#378ADD] text-[#378ADD] hover:bg-[#E6F1FB] transition-colors">
                        + Agregar
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Video" && (
                <div>
                  <div className={`rounded-xl border-2 border-dashed ${B} flex flex-col items-center justify-center py-16 mb-4`}>
                    <div className="text-4xl mb-3">🎬</div>
                    <p className={`text-sm font-medium ${T} mb-1`}>Video de presentación</p>
                    <p className={`text-xs ${M} mb-4`}>Muéstrale a las empresas quién eres · Máx. 50 MB</p>
                    <PrimaryButton>Subir video</PrimaryButton>
                  </div>
                  <p className={`text-xs ${M}`}>
                    Consejo: graba un video de 1–2 minutos presentándote, mencionando tu carrera, habilidades y qué tipo de práctica buscas.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
