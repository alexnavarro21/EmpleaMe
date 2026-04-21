import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, PrimaryButton, SecondaryButton, FormField, TextAreaField, SelectField, PageHeader } from "../../components/ui";
import { crearVacante, getHabilidades, moderarContenido } from "../../services/api";
import FileUploader from "../../components/FileUploader";

const modalidades = [
  { id: "presencial", label: "Presencial", icon: "streamline:city-hall-remix" },
  { id: "remoto", label: "Remoto", icon: "mdi:monitor-outline" },
  { id: "hibrido", label: "Híbrido", icon: "mdi:home-work-outline" },
];

const tiposVacante = [
  { id: "practica", label: "Práctica profesional", icon: "mdi:school-outline" },
  { id: "puesto_laboral", label: "Puesto laboral", icon: "mdi:briefcase-outline" },
];

export default function EmpresaPublicarVacante() {
  const { isDark } = useDark();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState("practica");
  const [titulo, setTitulo] = useState("");
  const [area, setArea] = useState("Mecánica Automotriz");
  const [duracion, setDuracion] = useState("");
  const [horario, setHorario] = useState("");
  const [remuneracion, setRemuneracion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [modalidad, setModalidad] = useState("presencial");
  const [descripcion, setDescripcion] = useState("");
  const [requisitos, setRequisitos] = useState("");
  const [beneficios, setBeneficios] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [habilidadesSeleccionadas, setHabilidadesSeleccionadas] = useState([]);
  const [catalogoHabilidades, setCatalogoHabilidades] = useState([]);
  const [busquedaHab, setBusquedaHab] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";

  useEffect(() => {
    getHabilidades().then(setCatalogoHabilidades).catch(console.error);
  }, []);

  function toggleHabilidad(id) {
    setHabilidadesSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  }

  const handlePublicar = async () => {
    if (!titulo.trim() || !descripcion.trim()) {
      setError("El título y la descripción son obligatorios.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const textoARevisar = [titulo, descripcion, requisitos].filter(Boolean).join(" ").trim();
      const mod = await moderarContenido(textoARevisar);
      if (!mod.aprobado) {
        setError(mod.razon || "La vacante contiene contenido inapropiado.");
        return;
      }

      await crearVacante({
        tipo, titulo, descripcion, requisitos, area, modalidad,
        duracion, horario, remuneracion, direccion, beneficios,
        fecha_limite: fechaLimite || undefined,
        habilidades: habilidadesSeleccionadas,
      }, archivo);
      navigate("/empresa/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

            <div className="mb-4">
              <label className={`block text-xs mb-2 ${M}`}>Tipo de oferta</label>
              <div className="grid grid-cols-2 gap-3">
                {tiposVacante.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipo(t.id)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      tipo === t.id
                        ? `border-2 border-[#378ADD] ${isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"}`
                        : `border ${B}`
                    }`}
                  >
                    <Icon
                      icon={t.icon}
                      width={24}
                      className={`mx-auto mb-1.5 ${tipo === t.id ? "text-[#378ADD]" : M}`}
                    />
                    <span className={`text-sm font-medium ${T}`}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <FormField
              label="Título del puesto"
              placeholder="ej. Practicante Mecánico Automotriz"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Área / Carrera" value={area} onChange={(e) => setArea(e.target.value)}>
                <option>Mecánica Automotriz</option>
                <option>Administración</option>
                <option>Contabilidad</option>
                <option>Servicio al Cliente</option>
              </SelectField>
              <FormField
                label="Duración de la práctica"
                placeholder="ej. 3 meses"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Horario"
                placeholder="ej. Lunes a Viernes 8am–1pm"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
              />
              <FormField
                label="Remuneración (opcional)"
                placeholder="ej. $250.000 mensual"
                value={remuneracion}
                onChange={(e) => setRemuneracion(e.target.value)}
              />
            </div>
            <FormField
              label="Dirección / Ubicación"
              placeholder="ej. Lo Espejo, Santiago"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />

            <div className="mb-4">
              <label className={`block text-xs mb-2 ${M}`}>Modalidad de trabajo</label>
              <div className="grid grid-cols-3 gap-3">
                {modalidades.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModalidad(m.id)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      modalidad === m.id
                        ? `border-2 border-[#378ADD] ${isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"}`
                        : `border ${B}`
                    }`}
                  >
                    <Icon
                      icon={m.icon}
                      width={24}
                      className={`mx-auto mb-1.5 ${modalidad === m.id ? "text-[#378ADD]" : M}`}
                    />
                    <span className={`text-sm font-medium ${T}`}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <TextAreaField
              label="Descripción del puesto"
              placeholder="Describe las actividades que realizará el practicante..."
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            <TextAreaField
              label="Requisitos"
              placeholder="Carrera, conocimientos técnicos, habilidades requeridas..."
              rows={3}
              value={requisitos}
              onChange={(e) => setRequisitos(e.target.value)}
            />
            <TextAreaField
              label="Beneficios"
              placeholder="Certificado de práctica, colación, movilización, posibilidad de contrato, etc."
              rows={2}
              value={beneficios}
              onChange={(e) => setBeneficios(e.target.value)}
            />
            {catalogoHabilidades.length > 0 && (
              <div className="mb-4">
                <label className={`block text-xs mb-2 ${M}`}>Habilidades que buscas</label>

                {/* Chips seleccionados */}
                {habilidadesSeleccionadas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {habilidadesSeleccionadas.map((id) => {
                      const h = catalogoHabilidades.find((x) => x.id === id);
                      if (!h) return null;
                      return (
                        <span key={id} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-[#0F4D8A] text-white">
                          {h.nombre}
                          <button
                            type="button"
                            onClick={() => toggleHabilidad(id)}
                            className="hover:opacity-70 transition-opacity leading-none"
                          >
                            <Icon icon="mdi:close" width={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Buscador */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${B} ${isDark ? "bg-[#313130]" : "bg-[#F7F6F3]"} mb-3`}>
                  <Icon icon="mdi:magnify" width={16} className={M} />
                  <input
                    type="text"
                    value={busquedaHab}
                    onChange={(e) => setBusquedaHab(e.target.value)}
                    placeholder="Buscar habilidad..."
                    className={`flex-1 bg-transparent text-sm outline-none ${T} placeholder-[#B4B2A9]`}
                  />
                  {busquedaHab && (
                    <button type="button" onClick={() => setBusquedaHab("")}>
                      <Icon icon="mdi:close-circle" width={15} className={M} />
                    </button>
                  )}
                </div>

                {/* Resultados filtrados por categoría */}
                {["tecnica", "blanda"].map((cat) => {
                  const termino = busquedaHab.toLowerCase().trim();
                  const grupo = catalogoHabilidades.filter(
                    (h) => h.categoria === cat &&
                    !habilidadesSeleccionadas.includes(h.id) &&
                    (!termino || h.nombre.toLowerCase().includes(termino))
                  );
                  if (grupo.length === 0) return null;
                  return (
                    <div key={cat} className="mb-3">
                      <p className={`text-xs font-medium ${M} mb-1.5`}>
                        {cat === "tecnica" ? "Técnicas" : "Socioemocionales"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {grupo.map((h) => (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => toggleHabilidad(h.id)}
                            className={`text-xs px-3 py-1 rounded-full border transition-colors ${B} ${M} hover:border-[#378ADD] hover:text-[#378ADD]`}
                          >
                            {h.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Sin resultados */}
                {busquedaHab.trim() &&
                  catalogoHabilidades.filter(
                    (h) => !habilidadesSeleccionadas.includes(h.id) &&
                    h.nombre.toLowerCase().includes(busquedaHab.toLowerCase().trim())
                  ).length === 0 && (
                  <p className={`text-xs ${M}`}>Sin resultados para "{busquedaHab}"</p>
                )}
              </div>
            )}

            <FormField
              label="Fecha límite de postulación"
              type="date"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
            />

            <div className="mb-4">
              <label className={`block text-xs mb-2 ${M}`}>Imagen o archivo adjunto (opcional)</label>
              <FileUploader
                title="Imagen, video o documento"
                accept="image/*,video/*,.pdf"
                icon="mdi:image-outline"
                onFileSelect={(file) => setArchivo(file)}
              />
            </div>

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <div className="flex gap-3 mt-2">
              <PrimaryButton
                className="flex-1"
                onClick={handlePublicar}
                disabled={loading}
              >
                {loading ? "Publicando..." : "Publicar vacante"}
              </PrimaryButton>
              <SecondaryButton className="flex-1" onClick={() => navigate("/empresa/dashboard")}>
                Cancelar
              </SecondaryButton>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <p className={`text-sm font-medium ${T} mb-3`}>Vista previa</p>
            <div className={`p-3 rounded-lg ${isDark ? "bg-[#313130]" : "bg-[#F7F6F3]"}`}>
              <p className={`text-sm font-semibold ${T}`}>{titulo || "Título del puesto"}</p>
              <p className={`text-xs ${M} mt-1 flex items-center gap-1`}>
                <Icon icon="cuida:building-outline" width={12} />
                {direccion || "Ubicación"}
              </p>
              <p className={`text-xs ${M} mt-1`}>{duracion || "Duración"} · {horario || "Horario"}</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tipo === "practica" ? "bg-[#FEF3C7] text-[#92400E]" : "bg-[#D1FAE5] text-[#065F46]"}`}>
                  {tipo === "practica" ? "Práctica" : "Puesto laboral"}
                </span>
                {area && <span className="text-xs bg-[#E6F1FB] text-[#0F4D8A] px-2 py-0.5 rounded-full">{area}</span>}
                <span className="text-xs bg-[#E6F1FB] text-[#0F4D8A] px-2 py-0.5 rounded-full capitalize">{modalidad}</span>
              </div>
              {habilidadesSeleccionadas.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {habilidadesSeleccionadas.map((id) => {
                    const h = catalogoHabilidades.find((x) => x.id === id);
                    return h ? (
                      <span key={id} className="text-xs bg-[#0F4D8A]/10 text-[#0F4D8A] border border-[#0F4D8A]/30 px-2 py-0.5 rounded-full">
                        {h.nombre}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
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
        </div>
      </div>
    </div>
  );
}
