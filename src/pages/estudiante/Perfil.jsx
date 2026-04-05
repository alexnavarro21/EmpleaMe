import { useState } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, FormField, PageHeader, TextAreaField, SoftSkillBar } from "../../components/ui";

const technicalSkills = [
  "Excel avanzado",
  "Contabilidad básica",
  "Atención al cliente",
  "Gestión documental",
  "Facturación electrónica",
  "Software de oficina",
];

const softSkills = [
  { label: "Comunicación efectiva", percentage: 85 },
  { label: "Organización y planificación", percentage: 90 },
  { label: "Trabajo en equipo", percentage: 80 },
  { label: "Orientación al cliente", percentage: 88 },
  { label: "Resolución de problemas", percentage: 72 },
  { label: "Adaptabilidad", percentage: 78 },
];

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
            <PrimaryButton className="flex items-center gap-2">
              <Icon icon="material-symbols:download" width={16} />
              Descargar CV PDF
            </PrimaryButton>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Left: profile card */}
        <div className="flex flex-col gap-4">
          <Card className="text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center ${S}`}>
              <Icon icon="mynaui:user-solid" width={40} className="text-[#378ADD]" />
            </div>
            <p className={`text-base font-semibold ${T}`}>Catalina Muñoz</p>
            <p className={`text-xs ${M} mb-2`}>Administración</p>
            <Badge color="blue">Estudiante Activa</Badge>
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
              <Icon icon="solar:star-bold-duotone" width={22} className="text-yellow-400" />
              <span className={`text-2xl font-semibold ${T}`}>6.2</span>
              <span className={`text-xs ${M}`}>/ 7.0</span>
            </div>
            <p className={`text-xs ${M} mt-1`}>Por Prof. Morales · 2024</p>
          </Card>

          <Card>
            <p className={`text-xs font-medium ${T} mb-1`}>Promedio académico</p>
            <p className={`text-2xl font-semibold ${T}`}>6.5</p>
            <p className={`text-xs ${M}`}>Escala 1.0 — 7.0</p>
          </Card>
        </div>

        {/* Right: tabs */}
        <div className="col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className={`flex border-b ${B}`}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? "border-[#185FA5] text-[#185FA5] font-medium"
                      : `border-transparent ${M}`
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === "Personal" && (
                <div className="grid grid-cols-2 gap-x-6">
                  <FormField label="Nombre" placeholder="Catalina" />
                  <FormField label="Apellido" placeholder="Muñoz" />
                  <FormField label="RUT" placeholder="12.345.678-9" />
                  <FormField label="Fecha de nacimiento" type="date" />
                  <FormField label="Correo electrónico" type="email" placeholder="catalina@colegio.cl" />
                  <FormField label="Teléfono" type="tel" placeholder="+56 9 1234 5678" />
                  <FormField label="Dirección" placeholder="Av. Lo Espejo 123" className="col-span-2" />
                  <FormField label="Comuna" placeholder="Lo Espejo" />
                  <FormField label="Ciudad" placeholder="Santiago" />
                  {editMode && (
                    <div className="col-span-2 mt-2">
                      <PrimaryButton className="w-full">Guardar cambios</PrimaryButton>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Académico" && (
                <div className="grid grid-cols-2 gap-x-6">
                  <FormField label="Establecimiento" placeholder="C.E. Cardenal J.M. Caro" className="col-span-2" />
                  <FormField label="Carrera técnica" placeholder="Administración" />
                  <FormField label="Semestre actual" placeholder="4to semestre" />
                  <FormField label="Promedio general" placeholder="6.5" />
                  <FormField label="Año de egreso esperado" placeholder="2026" />
                  <TextAreaField
                    label="Logros académicos"
                    placeholder="Menciones, reconocimientos, proyectos destacados..."
                    rows={3}
                  />
                  {editMode && (
                    <div className="col-span-2 mt-2">
                      <PrimaryButton className="w-full">Guardar cambios</PrimaryButton>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Habilidades" && (
                <div>
                  <p className={`text-xs font-medium ${T} mb-3`}>Habilidades técnicas</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {technicalSkills.map((s) => (
                      <span
                        key={s}
                        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${B} ${T}`}
                      >
                        {s}
                        {editMode && (
                          <button className={`${M} hover:text-red-500 text-xs leading-none`}>
                            <Icon icon="mdi:close" width={12} />
                          </button>
                        )}
                      </span>
                    ))}
                    {editMode && (
                      <button className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border border-dashed border-[#378ADD] text-[#378ADD] hover:bg-[#E6F1FB] transition-colors">
                        <Icon icon="mdi:plus" width={14} />
                        Agregar
                      </button>
                    )}
                  </div>

                  <div className={`pt-5 border-t ${B}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <Icon icon="hugeicons:brain-02" width={18} className="text-[#378ADD]" />
                      <p className={`text-xs font-medium ${T}`}>Habilidades blandas</p>
                      <span className={`text-xs ${M}`}>— evaluadas por docente</span>
                    </div>
                    {softSkills.map((s) => (
                      <SoftSkillBar key={s.label} label={s.label} percentage={s.percentage} />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Video" && (
                <div>
                  <div className={`rounded-xl border-2 border-dashed ${B} flex flex-col items-center justify-center py-16 mb-4`}>
                    <Icon icon="mdi:play-circle-outline" width={52} className={`${M} mb-3`} />
                    <p className={`text-sm font-medium ${T} mb-1`}>Video de presentación</p>
                    <p className={`text-xs ${M} mb-4`}>Muéstrale a las empresas quién eres · Máx. 50 MB</p>
                    <PrimaryButton className="flex items-center gap-2">
                      <Icon icon="material-symbols:upload" width={16} />
                      Subir video
                    </PrimaryButton>
                  </div>
                  <p className={`text-xs ${M}`}>
                    Graba un video de 1–2 minutos presentándote, mencionando tu carrera, habilidades y qué tipo de práctica buscas.
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
