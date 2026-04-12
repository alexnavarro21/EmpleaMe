import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { generarCV } from "../../utils/generarCV";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, FormField, PageHeader, TextAreaField, SoftSkillBar } from "../../components/ui";
import PublicacionesUsuario from "../../components/PublicacionesUsuario";
import { getEstudianteById, actualizarPerfilEstudiante, getPostulacionesEstudiante } from "../../services/api";
import { REGIONES_COMUNAS, REGIONES } from "../../data/regionesComunas";
import { validarRut, formatearRut } from "../../utils/validarRut";
import { calcularCompletitud } from "../../utils/perfilCompletitud";

const tabs = ["Personal", "Habilidades", "Idiomas & Historial", "Postulaciones"];

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
  const [estadoCivil, setEstadoCivil] = useState("");
  const [rut, setRut] = useState("");
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [habilidades, setHabilidades] = useState([]);
  const [idiomas, setIdiomas] = useState([]);
  const [historialAcademico, setHistorialAcademico] = useState([]);
  const [historialLaboral, setHistorialLaboral] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [favoritosLaboral, setFavoritosLaboral] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("usuario") || "{}");
      const raw = localStorage.getItem(`favoritos_laborales_${u.id}`);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    Promise.allSettled([
      getEstudianteById(usuario.id),
      getPostulacionesEstudiante(),
    ]).then(([perfil, posts]) => {
      if (perfil.status === "fulfilled") {
        const data = perfil.value;
        setNombre(data.nombre_completo || "");
        setCarrera(data.carrera || "");
        setTelefono(data.telefono || "");
        setBiografia(data.biografia || "");
        setSemestre(data.semestre ? String(data.semestre) : "");
        setPromedio(data.promedio ? String(data.promedio) : "");
        setEstadoCivil(data.estado_civil || "");
        setRut(data.rut || "");
        setRegion(data.region || "");
        setComuna(data.comuna || "");
        setHabilidades(data.habilidades || []);
        setIdiomas(data.idiomas || []);
        setHistorialAcademico(data.historial_academico || []);
        setHistorialLaboral(data.historial_laboral || []);
      }
      if (posts.status === "fulfilled") setPostulaciones(posts.value);
    }).finally(() => setLoading(false));
  }, [usuario.id]);

  const handleGuardar = async () => {
    if (rut && !rutValido) {
      setSaveMsg("Error: El RUT ingresado no es válido");
      return;
    }
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
        estado_civil: estadoCivil || null,
        rut: rut || null,
        region: region || null,
        comuna: comuna || null,
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
  const descargarCV = () => {
    generarCV({
      nombre,
      carrera,
      telefono,
      correo:  usuario.correo || "",
      region,
      comuna,
      rut,
      biografia,
      promedio,
      idiomas,
      habilidadesBlandas:  habilidades.filter(h => h.categoria === "blanda"),
      habilidadesTecnicas: habilidades.filter(h => h.categoria === "tecnica"),
      experiencia: laboralesFavoritos,
      formacion:   historialAcademico,
    });
  };

  const toggleFavorito = (id) => {
    setFavoritosLaboral((prev) => {
      let next;
      if (prev.includes(id)) {
        next = prev.filter((x) => x !== id);
      } else {
        if (prev.length >= 3) return prev; // máximo 3
        next = [...prev, id];
      }
      localStorage.setItem(`favoritos_laborales_${usuario.id}`, JSON.stringify(next));
      return next;
    });
  };

  const nombreCarrera = careerDisplay[carrera] || carrera;
  const habilidadesTecnicas = habilidades.filter((h) => h.categoria === "tecnica");
  const habilidadesBlandas = habilidades.filter((h) => h.categoria === "blanda");
  const laboralesFavoritos = historialLaboral.filter((l) => favoritosLaboral.includes(l.id));

  const rutValido = validarRut(rut);
  const pctCompleto = calcularCompletitud({ nombre_completo: nombre, carrera, telefono, biografia, estado_civil: estadoCivil, rut, region, comuna });

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
            <PrimaryButton className="flex items-center gap-2" onClick={descargarCV}>
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
            <p className={`text-xs ${M}`}>{nombreCarrera || "Sin carrera"}</p>
            {(comuna || region) && (
              <p className={`text-xs ${M} mb-1 flex items-center justify-center gap-1`}>
                <Icon icon="mdi:map-marker-outline" width={12} />
                {[comuna, region].filter(Boolean).join(", ")}
              </p>
            )}
            {rut && <p className={`text-xs ${M} mb-2`}>RUT: {rut}</p>}
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
                      ? "border-[#0F4D8A] text-[#0F4D8A] font-medium"
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
                  <div className="mb-4">
                    <label className={`block text-xs mb-1.5 ${M}`}>RUT</label>
                    <input
                      type="text"
                      placeholder="12.345.678-9"
                      value={rut}
                      onChange={(e) => setRut(formatearRut(e.target.value))}
                      maxLength={12}
                      disabled={!editMode}
                      className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] disabled:opacity-60 ${
                        rut && !rutValido
                          ? "border-red-400 focus:border-red-400"
                          : rut && rutValido
                          ? "border-green-500 focus:border-green-500"
                          : isDark
                          ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder:text-[#888780]"
                          : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder:text-[#888780]"
                      } ${isDark ? "bg-[#313130] text-[#D3D1C7] placeholder:text-[#888780]" : "bg-[#F7F6F3] text-[#2C2C2A] placeholder:text-[#888780]"}`}
                    />
                    {rut && !rutValido && (
                      <p className="text-xs text-red-400 mt-1">RUT inválido</p>
                    )}
                    {rut && rutValido && (
                      <p className="text-xs text-green-500 mt-1">RUT válido</p>
                    )}
                  </div>
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
                  <div className="mb-4">
                    <label className={`block text-xs mb-1.5 ${M}`}>Estado civil</label>
                    <select
                      value={estadoCivil}
                      onChange={(e) => setEstadoCivil(e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                        isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]"
                               : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
                      } disabled:opacity-60`}
                    >
                      <option value="">Sin especificar</option>
                      <option value="soltero">Soltero/a</option>
                      <option value="casado">Casado/a</option>
                      <option value="divorciado">Divorciado/a</option>
                      <option value="viudo">Viudo/a</option>
                      <option value="conviviente civil">Conviviente civil</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className={`block text-xs mb-1.5 ${M}`}>Carrera técnica</label>
                    <select
                      value={carrera}
                      onChange={(e) => setCarrera(e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                        isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]"
                               : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
                      } disabled:opacity-60`}
                    >
                      <option value="">Selecciona tu carrera</option>
                      <option value="Administracion">Administración</option>
                      <option value="Mecanica Automotriz">Mecánica Automotriz</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className={`block text-xs mb-1.5 ${M}`}>Región</label>
                    <select
                      value={region}
                      onChange={(e) => { setRegion(e.target.value); setComuna(""); }}
                      disabled={!editMode}
                      className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                        isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]"
                               : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
                      } disabled:opacity-60`}
                    >
                      <option value="">Selecciona tu región</option>
                      {REGIONES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className={`block text-xs mb-1.5 ${M}`}>Comuna</label>
                    <select
                      value={comuna}
                      onChange={(e) => setComuna(e.target.value)}
                      disabled={!editMode || !region}
                      className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                        isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]"
                               : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
                      } disabled:opacity-60`}
                    >
                      <option value="">{region ? "Selecciona tu comuna" : "Primero selecciona región"}</option>
                      {(REGIONES_COMUNAS[region] || []).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`block text-xs ${M}`}>Sobre mí / Presentación</label>
                      <span className={`text-xs ${biografia.length > 450 ? "text-red-400" : M}`}>{biografia.length}/500</span>
                    </div>
                    <textarea
                      placeholder="Cuéntale a las empresas quién eres, qué buscas y cuáles son tus fortalezas..."
                      rows={7}
                      maxLength={500}
                      value={biografia}
                      onChange={(e) => setBiografia(e.target.value)}
                      disabled={!editMode}
                      className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] resize-none disabled:opacity-60 ${
                        isDark
                          ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                          : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#888780]"
                      }`}
                    />
                  </div>
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
                          percentage={h.porcentaje ?? (h.nivel_dominio === "Avanzado" ? 90 : h.nivel_dominio === "Intermedio" ? 65 : 40)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Idiomas & Historial" && (
                <div className="flex flex-col gap-6">
                  {/* Idiomas */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon icon="mdi:translate" width={16} className="text-[#378ADD]" />
                      <p className={`text-xs font-semibold ${T}`}>Idiomas</p>
                    </div>
                    {idiomas.length === 0 ? (
                      <p className={`text-xs ${M}`}>Sin idiomas registrados. El docente puede agregarlos desde el panel de gestión.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {idiomas.map((i) => (
                          <span key={i.id} className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${B} ${T}`}>
                            {i.idioma}
                            <span className={`text-xs ${M}`}>· {i.nivel}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Historial académico */}
                  <div className={`pt-5 border-t ${B}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon icon="mdi:school" width={16} className="text-[#378ADD]" />
                      <p className={`text-xs font-semibold ${T}`}>Historial académico</p>
                    </div>
                    {historialAcademico.length === 0 ? (
                      <p className={`text-xs ${M}`}>Sin registros académicos. El docente puede agregarlos desde el panel de gestión.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {historialAcademico.map((a) => (
                          <div key={a.id} className={`p-3 rounded-lg border ${B}`}>
                            <p className={`text-sm font-semibold ${T}`}>{a.titulo}</p>
                            <p className={`text-xs ${M}`}>{a.institucion}{a.area ? ` · ${a.area}` : ""}</p>
                            {(a.fecha_inicio || a.fecha_fin) && (
                              <p className={`text-xs ${M} mt-0.5`}>{a.fecha_inicio || "?"} – {a.fecha_fin || "En curso"}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Historial laboral */}
                  <div className={`pt-5 border-t ${B}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon icon="mdi:briefcase" width={16} className="text-[#378ADD]" />
                        <p className={`text-xs font-semibold ${T}`}>Experiencia laboral</p>
                      </div>
                      <span className={`text-xs ${M}`}>
                        Marca hasta 3 ★ para incluir en tu CV
                        {favoritosLaboral.length > 0 && <span className="ml-1 text-amber-500 font-medium">({favoritosLaboral.length}/3 seleccionadas)</span>}
                      </span>
                    </div>
                    {historialLaboral.length === 0 ? (
                      <p className={`text-xs ${M}`}>Sin experiencia laboral registrada.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {historialLaboral.map((l) => {
                          const esFavorita = favoritosLaboral.includes(l.id);
                          const puedeAgregar = favoritosLaboral.length < 3 || esFavorita;
                          return (
                            <div key={l.id} className={`p-3 rounded-lg border transition-colors ${esFavorita ? (isDark ? "border-amber-500/60 bg-amber-500/5" : "border-amber-400 bg-amber-50") : B}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-semibold ${T}`}>{l.cargo}</p>
                                  <p className={`text-xs ${M}`}>{l.empresa_nombre}</p>
                                  {(l.fecha_inicio || l.fecha_fin) && (
                                    <p className={`text-xs ${M} mt-0.5`}>
                                      {l.fecha_inicio ? new Date(l.fecha_inicio).toLocaleDateString("es-CL", { month: "short", year: "numeric" }) : "?"}
                                      {" – "}
                                      {l.fecha_fin ? new Date(l.fecha_fin).toLocaleDateString("es-CL", { month: "short", year: "numeric" }) : "Presente"}
                                    </p>
                                  )}
                                  {l.descripcion && <p className={`text-xs ${M} mt-1`}>{l.descripcion}</p>}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => toggleFavorito(l.id)}
                                    disabled={!puedeAgregar}
                                    title={esFavorita ? "Quitar de CV" : puedeAgregar ? "Incluir en CV" : "Máximo 3 seleccionadas"}
                                    className={`p-1 rounded-lg transition-colors ${!puedeAgregar && !esFavorita ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                                  >
                                    <Icon
                                      icon={esFavorita ? "mdi:star" : "mdi:star-outline"}
                                      width={18}
                                      className={esFavorita ? "text-amber-400" : M}
                                    />
                                  </button>
                                  <Badge color={l.tipo === "practica_completada" ? "green" : "blue"}>
                                    {l.tipo === "practica_completada" ? "Práctica" : "Verificado"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Postulaciones" && (
                <div className="flex flex-col gap-3">
                  {postulaciones.length === 0 ? (
                    <div className={`text-center py-12 ${M}`}>
                      <Icon icon="mdi:send-clock-outline" width={40} className="mx-auto mb-3" />
                      <p className={`text-sm font-medium ${T}`}>Aún no has postulado a ninguna práctica</p>
                      <p className="text-xs mt-1">Busca empresas y postula desde sus perfiles</p>
                    </div>
                  ) : (
                    postulaciones.map((p) => {
                      const estadoConfig = {
                        pendiente:  { color: "blue",  icon: "mdi:clock-outline",        label: "Pendiente"   },
                        aceptado:   { color: "green", icon: "mdi:check-circle-outline", label: "Aceptado"    },
                        rechazado:  { color: "red",   icon: "mdi:close-circle-outline", label: "Rechazado"   },
                        completado: { color: "green", icon: "mdi:briefcase-check",      label: "Completado"  },
                      }[p.estado] || { color: "gray", icon: "mdi:help-circle-outline", label: p.estado };

                      return (
                        <div key={p.id} className={`flex items-start gap-4 p-4 rounded-lg border ${B}`}>
                          <Icon icon={estadoConfig.icon} width={22} className={
                            estadoConfig.color === "green" ? "text-green-500 flex-shrink-0 mt-0.5" :
                            estadoConfig.color === "red"   ? "text-red-500 flex-shrink-0 mt-0.5"   :
                            estadoConfig.color === "blue"  ? "text-[#378ADD] flex-shrink-0 mt-0.5" :
                            `${M} flex-shrink-0 mt-0.5`
                          } />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${T}`}>{p.titulo}</p>
                            <p className={`text-xs ${M}`}>{p.nombre_empresa}{p.area ? ` · ${p.area}` : ""}{p.modalidad ? ` · ${p.modalidad}` : ""}</p>
                            <p className={`text-xs ${M} mt-1`}>{new Date(p.fecha_creacion).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}</p>
                          </div>
                          <Badge color={estadoConfig.color}>{estadoConfig.label}</Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

            </div>
          </Card>
        </div>
      </div>

      <PublicacionesUsuario usuarioId={usuario.id} />
    </div>
  );
}
