import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, FormField, PageHeader, TextAreaField, SoftSkillBar } from "../../components/ui";
import { getEstudianteById, actualizarPerfilEstudiante } from "../../services/api";

const tabs = ["Personal", "Académico", "Habilidades", "Video"];

const careerDisplay = {
  "Administracion": "Administración",
  "Mecanica Automotriz": "Mecánica Automotriz",
};

export default function EstudiantePerfil() {
  const { isDark } = useDark();
  const [activeTab, setActiveTab] = useState("Personal");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Form state
  const [nombre, setNombre] = useState("");
  const [carrera, setCarrera] = useState("");
  const [telefono, setTelefono] = useState("");
  const [biografia, setBiografia] = useState("");
  const [semestre, setSemestre] = useState("");
  const [promedio, setPromedio] = useState("");
  const [habilidades, setHabilidades] = useState([]);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    getEstudianteById(usuario.id)
      .then((data) => {
        setNombre(data.nombre_completo || "");
        setCarrera(data.carrera || "");
        setTelefono(data.telefono || "");
        setBiografia(data.biografia || "");
        setSemestre(data.semestre ? String(data.semestre) : "");
        setPromedio(data.promedio ? String(data.promedio) : "");
        setHabilidades(data.habilidades || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [usuario.id]);

  const handleGuardar = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      await actualizarPerfilEstudiante(usuario.id, {
        nombre_completo: nombre,
        carrera,
        telefono,
        biografia,
        semestre: semestre ? parseInt(semestre) : null,
        promedio: promedio ? parseFloat(promedio) : null,
      });
      setSaveMsg("Cambios guardados");
      setEditMode(false);
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveMsg("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const nombreCarrera = careerDisplay[carrera] || carrera;
  const habilidadesTecnicas = habilidades.filter((h) => h.categoria === "tecnica");
  const habilidadesBlandas = habilidades.filter((h) => h.categoria === "blanda");

  const completado = [nombre, carrera, telefono, biografia, semestre, promedio]
    .filter(Boolean).length;
  const pctCompleto = Math.round((completado / 6) * 100);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-24 ${M}`}>
        <Icon icon="mdi:loading" width={28} className="animate-spin mr-2" />
        Cargando perfil...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Mi Perfil"
        subtitle="Gestiona tu información y descarga tu CV"
        action={
          <div className="flex gap-2 items-center">
            {saveMsg && <span className="text-xs text-green-600">{saveMsg}</span>}
            <SecondaryButton onClick={() => { setEditMode(!editMode); setSaveMsg(""); }}>
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
            <p className={`text-base font-semibold ${T}`}>{nombre || "Sin nombre"}</p>
            <p className={`text-xs ${M} mb-2`}>{nombreCarrera || "Sin carrera"}</p>
            <Badge color="blue">Estudiante Activo</Badge>
            <div className={`mt-4 pt-4 border-t ${B} text-left`}>
              <div className="flex justify-between text-xs mb-1">
                <span className={M}>Perfil completado</span>
                <span className="text-[#378ADD]">{pctCompleto}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full ${S}`}>
                <div className="h-1.5 bg-[#378ADD] rounded-full" style={{ width: `${pctCompleto}%` }} />
              </div>
            </div>
          </Card>

          {promedio && (
            <Card>
              <p className={`text-xs font-medium ${T} mb-1`}>Promedio académico</p>
              <p className={`text-2xl font-semibold ${T}`}>{parseFloat(promedio).toFixed(1)}</p>
              <p className={`text-xs ${M}`}>Escala 1.0 — 7.0</p>
            </Card>
          )}
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
                  <FormField
                    label="Nombre completo"
                    placeholder="Tu nombre y apellido"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={!editMode}
                    className="col-span-2"
                  />
                  <FormField
                    label="Teléfono"
                    type="tel"
                    placeholder="+56 9 1234 5678"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    disabled={!editMode}
                  />
                  <FormField
                    label="Correo electrónico"
                    type="email"
                    placeholder={usuario.correo || "tucorreo@email.com"}
                    value={usuario.correo || ""}
                    disabled
                  />
                  {editMode && (
                    <div className="col-span-2 mt-2">
                      <PrimaryButton className="w-full" onClick={handleGuardar} disabled={saving}>
                        {saving ? "Guardando..." : "Guardar cambios"}
                      </PrimaryButton>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Académico" && (
                <div className="grid grid-cols-2 gap-x-6">
                  <FormField
                    label="Establecimiento"
                    placeholder="C.E. Cardenal J.M. Caro"
                    value="C.E. Cardenal J.M. Caro"
                    disabled
                    className="col-span-2"
                  />
                  <div className="mb-4">
                    <label className={`block text-xs mb-1.5 ${M}`}>Carrera técnica</label>
                    <select
                      value={carrera}
                      onChange={(e) => setCarrera(e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                        isDark
                          ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]"
                          : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
                      } disabled:opacity-60`}
                    >
                      <option value="">Selecciona tu carrera</option>
                      <option value="Administracion">Administración</option>
                      <option value="Mecanica Automotriz">Mecánica Automotriz</option>
                    </select>
                  </div>
                  <FormField
                    label="Semestre actual"
                    placeholder="ej. 4"
                    type="number"
                    value={semestre}
                    onChange={(e) => setSemestre(e.target.value)}
                    disabled={!editMode}
                  />
                  <FormField
                    label="Promedio general"
                    placeholder="ej. 6.5"
                    type="number"
                    step="0.1"
                    min="1"
                    max="7"
                    value={promedio}
                    onChange={(e) => setPromedio(e.target.value)}
                    disabled={!editMode}
                  />
                  <TextAreaField
                    label="Sobre mí / Presentación"
                    placeholder="Cuéntale a las empresas quién eres y qué buscas..."
                    rows={3}
                    value={biografia}
                    onChange={(e) => setBiografia(e.target.value)}
                    disabled={!editMode}
                  />
                  {editMode && (
                    <div className="col-span-2 mt-2">
                      <PrimaryButton className="w-full" onClick={handleGuardar} disabled={saving}>
                        {saving ? "Guardando..." : "Guardar cambios"}
                      </PrimaryButton>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Habilidades" && (
                <div>
                  <p className={`text-xs font-medium ${T} mb-3`}>Habilidades técnicas</p>
                  {habilidadesTecnicas.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {habilidadesTecnicas.map((h) => (
                        <span
                          key={h.id || h.nombre}
                          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${B} ${T}`}
                        >
                          {h.nombre}
                          <span className={`text-xs ${M}`}>· {h.nivel_dominio}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-xs ${M} mb-6`}>No tienes habilidades registradas aún. El docente las asignará desde el panel de administración.</p>
                  )}

                  {habilidadesBlandas.length > 0 && (
                    <div className={`pt-5 border-t ${B}`}>
                      <div className="flex items-center gap-2 mb-4">
                        <Icon icon="hugeicons:brain-02" width={18} className="text-[#378ADD]" />
                        <p className={`text-xs font-medium ${T}`}>Habilidades blandas</p>
                        <span className={`text-xs ${M}`}>— evaluadas por docente</span>
                      </div>
                      {habilidadesBlandas.map((h) => (
                        <SoftSkillBar
                          key={h.id || h.nombre}
                          label={h.nombre}
                          percentage={h.nivel_dominio === "Avanzado" ? 90 : h.nivel_dominio === "Intermedio" ? 65 : 40}
                        />
                      ))}
                    </div>
                  )}
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
