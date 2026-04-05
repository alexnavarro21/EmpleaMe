import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDark } from "../../context/DarkModeContext";
import { Card, PrimaryButton, SecondaryButton, FormField, TextAreaField, SelectField, PageHeader } from "../../components/ui";

export default function EmpresaPublicarVacante() {
  const { isDark } = useDark();
  const navigate = useNavigate();
  const [modality, setModality] = useState("hibrido");
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";

  const modalidades = [
    { id: "presencial", label: "Presencial", icon: "🏢" },
    { id: "remoto", label: "Remoto", icon: "💻" },
    { id: "hibrido", label: "Híbrido", icon: "🔀" },
  ];

  return (
    <div>
      <PageHeader
        title="Publicar Vacante de Práctica"
        subtitle="Completa los datos para que los estudiantes encuentren tu oferta"
        action={
          <SecondaryButton onClick={() => navigate("/empresa/dashboard")}>
            Cancelar
          </SecondaryButton>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Form */}
        <div className="col-span-2">
          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-4`}>Información general</h3>
            <FormField label="Título del puesto" placeholder="ej. Practicante de Desarrollo Web" />
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Área / Departamento">
                <option>Desarrollo de Software</option>
                <option>Análisis de Datos</option>
                <option>Diseño UX/UI</option>
                <option>Infraestructura y Redes</option>
                <option>Marketing Digital</option>
                <option>Administración</option>
              </SelectField>
              <FormField label="Duración de la práctica" placeholder="ej. 3 meses" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Horario" placeholder="ej. Lunes a Viernes 9am–1pm" />
              <FormField label="Remuneración (opcional)" placeholder="ej. S/. 700 mensual" />
            </div>
            <FormField label="Ubicación" placeholder="ej. Miraflores, Lima" />

            {/* Modalidad */}
            <div className="mb-4">
              <label className={`block text-xs mb-2 ${isDark ? "text-[#B4B2A9]" : "text-[#5F5E5A]"}`}>
                Modalidad de trabajo
              </label>
              <div className="grid grid-cols-3 gap-3">
                {modalidades.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModality(m.id)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      modality === m.id
                        ? `border-2 border-[#378ADD] ${isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"}`
                        : `border ${B}`
                    }`}
                  >
                    <span className="text-xl block mb-1">{m.icon}</span>
                    <span className={`text-sm font-medium ${T}`}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <TextAreaField label="Descripción del puesto" placeholder="Describe las actividades que realizará el practicante..." rows={4} />
            <TextAreaField label="Requisitos" placeholder="Carrera, conocimientos técnicos, habilidades requeridas..." rows={3} />
            <TextAreaField label="Beneficios" placeholder="Certificado de prácticas, mentoría, posibilidad de contrato, etc." rows={2} />

            <div className="mt-2">
              <FormField label="Fecha límite de postulación" type="date" />
            </div>

            <div className="flex gap-3 mt-2">
              <PrimaryButton
                className="flex-1"
                onClick={() => { alert("Vacante publicada con éxito"); navigate("/empresa/dashboard"); }}
              >
                Publicar vacante
              </PrimaryButton>
              <SecondaryButton className="flex-1">
                Guardar borrador
              </SecondaryButton>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <Card>
            <p className={`text-sm font-medium ${T} mb-3`}>Vista previa</p>
            <div className={`p-3 rounded-lg ${isDark ? "bg-[#313130]" : "bg-[#F7F6F3]"}`}>
              <p className={`text-sm font-semibold ${T}`}>Practicante de Desarrollo Web</p>
              <p className={`text-xs ${M} mt-1`}>TechCorp · Lima · Híbrido</p>
              <p className={`text-xs ${M} mt-1`}>3 meses · Lun-Vie 9am–1pm</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <span className="text-xs bg-[#E6F1FB] text-[#185FA5] px-2 py-0.5 rounded-full">Desarrollo Web</span>
                <span className="text-xs bg-[#E6F1FB] text-[#185FA5] px-2 py-0.5 rounded-full">Híbrido</span>
              </div>
            </div>
          </Card>

          <Card>
            <p className={`text-sm font-medium ${T} mb-2`}>Consejos</p>
            <ul className={`flex flex-col gap-2 text-xs ${M} list-disc list-inside`}>
              <li>Sé específico sobre las tareas del practicante</li>
              <li>Menciona las tecnologías o herramientas a usar</li>
              <li>Indica si hay posibilidad de contrato posterior</li>
              <li>Las prácticas remuneradas reciben más postulaciones</li>
            </ul>
          </Card>

          <Card>
            <p className={`text-sm font-medium ${T} mb-2`}>Alcance estimado</p>
            <p className={`text-xs ${M} mb-3`}>Con esta descripción tu vacante podría llegar a:</p>
            <p className={`text-2xl font-semibold ${T}`}>~85</p>
            <p className={`text-xs ${M}`}>estudiantes compatibles en la plataforma</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
