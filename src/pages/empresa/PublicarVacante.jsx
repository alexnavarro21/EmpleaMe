import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, PrimaryButton, SecondaryButton, FormField, TextAreaField, SelectField, PageHeader } from "../../components/ui";

const modalidades = [
  { id: "presencial", label: "Presencial", icon: "streamline:city-hall-remix" },
  { id: "remoto", label: "Remoto", icon: "mdi:monitor-outline" },
  { id: "hibrido", label: "Híbrido", icon: "mdi:home-work-outline" },
];

export default function EmpresaPublicarVacante() {
  const { isDark } = useDark();
  const navigate = useNavigate();
  const [modality, setModality] = useState("presencial");
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";

  return (
    <div>
      <PageHeader
        title="Publicar Vacante de Práctica"
        subtitle="Completa los datos para que los estudiantes encuentren tu oferta"
        action={<SecondaryButton onClick={() => navigate("/empresa/dashboard")}>Cancelar</SecondaryButton>}
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <h3 className={`text-sm font-semibold ${T} mb-4`}>Información general</h3>
            <FormField label="Título del puesto" placeholder="ej. Practicante Mecánico Automotriz" />
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Área / Carrera">
                <option>Mecánica Automotriz</option>
                <option>Administración</option>
                <option>Contabilidad</option>
                <option>Servicio al Cliente</option>
              </SelectField>
              <FormField label="Duración de la práctica" placeholder="ej. 3 meses" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Horario" placeholder="ej. Lunes a Viernes 8am–1pm" />
              <FormField label="Remuneración (opcional)" placeholder="ej. $250.000 mensual" />
            </div>
            <FormField label="Dirección / Ubicación" placeholder="ej. Lo Espejo, Santiago" />

            <div className="mb-4">
              <label className={`block text-xs mb-2 ${M}`}>Modalidad de trabajo</label>
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
                    <Icon
                      icon={m.icon}
                      width={24}
                      className={`mx-auto mb-1.5 ${modality === m.id ? "text-[#378ADD]" : M}`}
                    />
                    <span className={`text-sm font-medium ${T}`}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <TextAreaField label="Descripción del puesto" placeholder="Describe las actividades que realizará el practicante..." rows={4} />
            <TextAreaField label="Requisitos" placeholder="Carrera, conocimientos técnicos, habilidades requeridas..." rows={3} />
            <TextAreaField label="Beneficios" placeholder="Certificado de práctica, colación, movilización, posibilidad de contrato, etc." rows={2} />
            <FormField label="Fecha límite de postulación" type="date" />

            <div className="flex gap-3 mt-2">
              <PrimaryButton
                className="flex-1"
                onClick={() => { alert("Vacante publicada con éxito"); navigate("/empresa/dashboard"); }}
              >
                Publicar vacante
              </PrimaryButton>
              <SecondaryButton className="flex-1">Guardar borrador</SecondaryButton>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <p className={`text-sm font-medium ${T} mb-3`}>Vista previa</p>
            <div className={`p-3 rounded-lg ${isDark ? "bg-[#313130]" : "bg-[#F7F6F3]"}`}>
              <p className={`text-sm font-semibold ${T}`}>Practicante Mecánico Automotriz</p>
              <p className={`text-xs ${M} mt-1 flex items-center gap-1`}>
                <Icon icon="cuida:building-outline" width={12} />
                Automotriz Salinas · Lo Espejo
              </p>
              <p className={`text-xs ${M} mt-1`}>3 meses · Lun-Vie 8am–1pm</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <span className="text-xs bg-[#E6F1FB] text-[#185FA5] px-2 py-0.5 rounded-full">Mecánica Automotriz</span>
                <span className="text-xs bg-[#E6F1FB] text-[#185FA5] px-2 py-0.5 rounded-full">Presencial</span>
              </div>
            </div>
          </Card>

          <Card>
            <p className={`text-sm font-medium ${T} mb-2`}>Consejos</p>
            <ul className={`flex flex-col gap-2 text-xs ${M} list-disc list-inside`}>
              <li>Indica claramente las tareas del practicante</li>
              <li>Menciona herramientas o equipos a usar</li>
              <li>Especifica si hay posibilidad de contrato posterior</li>
              <li>Las prácticas con colación reciben más postulaciones</li>
            </ul>
          </Card>

          <Card>
            <p className={`text-sm font-medium ${T} mb-2`}>Alcance estimado</p>
            <p className={`text-xs ${M} mb-3`}>Estudiantes compatibles en la plataforma:</p>
            <p className={`text-2xl font-semibold ${T}`}>~42</p>
            <p className={`text-xs ${M}`}>del C.E. Cardenal J.M. Caro</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
