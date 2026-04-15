import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { Card, Badge, SecondaryButton, PrimaryButton, PageHeader, Paginacion } from "../components/ui";
import PublicacionesUsuario from "../components/PublicacionesUsuario";
import { getEmpresaById, getVacantesEmpresa, postularAVacante, iniciarConversacionConEmpresa, getEstudianteById, getMediaUrl, toggleSeguir, getEstadoSeguimiento } from "../services/api";
import { calcularCompletitud } from "../utils/perfilCompletitud";

export default function PerfilEmpresaPublico() {
  const { isDark } = useDark();
  const navigate = useNavigate();
  const { id } = useParams();

  const [empresa, setEmpresa] = useState(null);
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // { [vacanteId]: "idle" | "loading" | "ok" | "error" | "duplicado" }
  const [postulando, setPostulando] = useState({});
  const [contactando, setContactando] = useState(false);
  const [perfilCompleto, setPerfilCompleto] = useState(true);
  const [paginaVacantes, setPaginaVacantes] = useState(1);
  const [porPaginaVacantes, setPorPaginaVacantes] = useState(3);
  const [busquedaVacante, setBusquedaVacante] = useState("");
  const [siguiendo, setSiguiendo] = useState(false);
  const [seguidoresCount, setSeguidoresCount] = useState(0);
  const [toggleandoSeguir, setToggleandoSeguir] = useState(false);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const esEstudiante = usuario.rol === "estudiante";

  useEffect(() => {
    const promesas = [getEmpresaById(id), getVacantesEmpresa(id)];
    if (usuario.rol === "estudiante" && usuario.id) {
      promesas.push(getEstudianteById(usuario.id));
    }
    Promise.allSettled(promesas).then(([emp, vacs, propio]) => {
      if (emp.status === "fulfilled") setEmpresa(emp.value);
      else setError("No se pudo cargar el perfil de la empresa.");
      if (vacs.status === "fulfilled") setVacantes(vacs.value);
      if (propio?.status === "fulfilled") {
        setPerfilCompleto(calcularCompletitud(propio.value) === 100);
      }
    }).finally(() => setLoading(false));

    // Estado de seguimiento (cualquier rol, excepto ver su propio perfil)
    if (usuario.id && parseInt(id) !== usuario.id) {
      getEstadoSeguimiento(id)
        .then((est) => {
          setSiguiendo(est.siguiendo);
          setSeguidoresCount(est.seguidores);
        })
        .catch(() => {});
    }
  }, [id]);

  const handleToggleSeguir = async () => {
    setToggleandoSeguir(true);
    try {
      const res = await toggleSeguir(id);
      setSiguiendo(res.siguiendo);
      setSeguidoresCount((c) => res.siguiendo ? c + 1 : Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    } finally {
      setToggleandoSeguir(false);
    }
  };

  const handlePostular = async (vacanteId) => {
    if (!perfilCompleto) {
      setPostulando((p) => ({ ...p, [vacanteId]: "incompleto" }));
      return;
    }
    setPostulando((p) => ({ ...p, [vacanteId]: "loading" }));
    try {
      await postularAVacante(vacanteId);
      setPostulando((p) => ({ ...p, [vacanteId]: "ok" }));
    } catch (err) {
      const estado = err.message.toLowerCase().includes("ya") ? "duplicado" : "error";
      setPostulando((p) => ({ ...p, [vacanteId]: estado }));
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-24 ${M}`}>
        <Icon icon="mdi:loading" width={28} className="animate-spin mr-2" />
        Cargando perfil...
      </div>
    );
  }

  if (error || !empresa) {
    return (
      <div className={`text-center py-24 ${M}`}>
        <Icon icon="mdi:office-building-remove-outline" width={48} className="mx-auto mb-3" />
        <p className={`text-base font-medium ${T}`}>{error || "Empresa no encontrada"}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-[#378ADD] hover:underline">
          ← Volver
        </button>
      </div>
    );
  }

  const vacantesActivas = vacantes.filter((v) => v.esta_activa);
  const vacantesFiltradas = vacantes.filter((v) =>
    !busquedaVacante || v.titulo?.toLowerCase().includes(busquedaVacante.toLowerCase())
  );
  const totalPaginasVacantes = Math.ceil(vacantesFiltradas.length / porPaginaVacantes);
  const vacantesPagina = vacantesFiltradas.slice(
    (paginaVacantes - 1) * porPaginaVacantes,
    paginaVacantes * porPaginaVacantes
  );

  return (
    <div>
      <PageHeader
        title={empresa.nombre_empresa}
        subtitle="Perfil de empresa"
        action={<SecondaryButton onClick={() => navigate(-1)}>← Volver</SecondaryButton>}
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <Card className="text-center">
            {empresa.foto_perfil ? (
              <img src={getMediaUrl(empresa.foto_perfil)} className="w-20 h-20 rounded-full object-cover mx-auto mb-3" alt="" />
            ) : (
              <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-[#0F4D8A] flex items-center justify-center text-white text-3xl font-bold">
                {empresa.nombre_empresa?.[0]?.toUpperCase() ?? "E"}
              </div>
            )}
            <p className={`text-lg font-semibold ${T}`}>{empresa.nombre_empresa}</p>
            {(empresa.comuna || empresa.region) && (
              <p className={`text-xs ${M} flex items-center justify-center gap-1`}>
                <Icon icon="mdi:map-marker-outline" width={12} />
                {[empresa.comuna, empresa.region].filter(Boolean).join(", ")}
              </p>
            )}
            <p className={`text-xs ${M} mb-3`}>Empresa registrada en EmpleaMe</p>
            <Badge color="blue">Empresa Verificada</Badge>

            {/* Botón Seguir (visible para todos excepto la propia empresa) */}
            {usuario.id && parseInt(id) !== usuario.id && (
              <button
                onClick={handleToggleSeguir}
                disabled={toggleandoSeguir}
                className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border ${
                  siguiendo
                    ? `${isDark ? "border-[#3a3a38] text-[#D3D1C7] hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400" : "border-[#D3D1C7] text-[#5F5E5A] hover:bg-red-50 hover:border-red-300 hover:text-red-500"}`
                    : "border-[#378ADD] bg-[#378ADD]/10 text-[#378ADD] hover:bg-[#378ADD]/20"
                }`}
              >
                <Icon
                  icon={toggleandoSeguir ? "mdi:loading" : siguiendo ? "mdi:account-check" : "mdi:account-plus-outline"}
                  width={16}
                  className={toggleandoSeguir ? "animate-spin" : ""}
                />
                {toggleandoSeguir ? "..." : siguiendo ? "Siguiendo" : "Seguir"}
              </button>
            )}

            {seguidoresCount > 0 && (
              <p className={`text-xs ${M} mt-2`}>
                <Icon icon="mdi:account-group-outline" width={12} className="inline mr-1" />
                {seguidoresCount} seguidor{seguidoresCount !== 1 ? "es" : ""}
              </p>
            )}

            {esEstudiante && (
              <button
                onClick={async () => {
                  setContactando(true);
                  try {
                    const conv = await iniciarConversacionConEmpresa(id);
                    navigate("/estudiante/mensajeria", { state: { conversacionId: conv.id } });
                  } catch (err) {
                    console.error("Error al contactar:", err);
                  } finally {
                    setContactando(false);
                  }
                }}
                disabled={contactando}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Icon icon={contactando ? "mdi:loading" : "mdi:message-outline"} width={16} className={contactando ? "animate-spin" : ""} />
                {contactando ? "Abriendo chat..." : "Contactar empresa"}
              </button>
            )}

            <div className={`mt-4 pt-4 border-t ${B} flex flex-col gap-2.5 text-left`}>
              {empresa.telefono_contacto && (
                <p className={`flex items-center gap-2 text-xs ${M}`}>
                  <Icon icon="mdi:phone-outline" width={14} className="flex-shrink-0 text-[#378ADD]" />
                  {empresa.telefono_contacto}
                </p>
              )}
              <p className={`flex items-center gap-2 text-xs ${M}`}>
                <Icon icon="mdi:briefcase-outline" width={14} className="flex-shrink-0 text-[#378ADD]" />
                {vacantesActivas.length} vacante{vacantesActivas.length !== 1 ? "s" : ""} activa{vacantesActivas.length !== 1 ? "s" : ""}
              </p>
            </div>
          </Card>
        </div>

        {/* Main */}
        <div className="col-span-2 flex flex-col gap-4">
          {empresa.descripcion && (
            <Card>
              <h3 className={`text-sm font-semibold ${T} mb-2`}>Sobre la empresa</h3>
              <p className={`text-sm ${M} leading-relaxed`}>{empresa.descripcion}</p>
            </Card>
          )}

          <Card>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h3 className={`text-sm font-semibold ${T} flex items-center gap-2 flex-1`}>
                <Icon icon="mdi:clipboard-list-outline" width={16} className="text-[#378ADD]" />
                Vacantes
                {vacantesActivas.length > 0 && (
                  <span className="ml-1 text-xs font-normal text-[#378ADD]">{vacantesActivas.length} activa{vacantesActivas.length !== 1 ? "s" : ""}</span>
                )}
              </h3>
              {vacantes.length > 0 && (
                <div className="relative">
                  <Icon icon="mdi:search" width={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${M}`} />
                  <input
                    type="text"
                    placeholder="Buscar vacante..."
                    value={busquedaVacante}
                    onChange={(e) => { setBusquedaVacante(e.target.value); setPaginaVacantes(1); }}
                    className={`pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none border transition-all focus:border-[#378ADD] w-44 ${
                      isDark
                        ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                        : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
                    }`}
                  />
                </div>
              )}
            </div>

            {vacantes.length === 0 ? (
              <div className={`text-center py-8 ${M}`}>
                <Icon icon="mdi:clipboard-remove-outline" width={36} className="mx-auto mb-2" />
                <p className="text-sm">Esta empresa no tiene vacantes publicadas.</p>
              </div>
            ) : vacantesFiltradas.length === 0 ? (
              <div className={`text-center py-8 ${M}`}>
                <Icon icon="mdi:magnify-close" width={36} className="mx-auto mb-2" />
                <p className="text-sm">Sin resultados para "{busquedaVacante}".</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {vacantesPagina.map((v) => {
                  const estado = postulando[v.id] || "idle";
                  const activa = !!v.esta_activa;
                  return (
                    <div key={v.id} className={`p-4 rounded-lg border ${B} ${!activa ? "opacity-60" : ""}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`text-sm font-semibold ${T}`}>{v.titulo}</p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Badge color={v.tipo === "puesto_laboral" ? "green" : "orange"}>
                            {v.tipo === "puesto_laboral" ? "Puesto laboral" : "Práctica"}
                          </Badge>
                          <Badge color={activa ? "green" : "gray"}>
                            {activa ? "Activa" : "Cerrada"}
                          </Badge>
                        </div>
                      </div>
                      <p className={`text-xs ${M} mb-2`}>{v.area || "—"} · {v.modalidad || "Presencial"}</p>
                      {v.descripcion && (
                        <p className={`text-xs ${M} mb-3`}>{v.descripcion}</p>
                      )}

                      {esEstudiante && (
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-dashed" style={{ borderColor: isDark ? "#3a3a38" : "#D3D1C7" }}>
                          {!activa ? (
                            <p className={`flex items-center gap-1.5 text-xs ${M}`}>
                              <Icon icon="mdi:close-circle-outline" width={15} />
                              Esta vacante ya no está disponible
                            </p>
                          ) : estado === "ok" ? (
                            <p className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                              <Icon icon="mdi:check-circle" width={15} />
                              Postulación enviada
                            </p>
                          ) : estado === "duplicado" ? (
                            <p className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                              <Icon icon="mdi:information-outline" width={15} />
                              Ya postulaste a esta vacante
                            </p>
                          ) : estado === "error" ? (
                            <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                              <Icon icon="mdi:alert-circle-outline" width={15} />
                              Error al postular, intenta de nuevo
                            </p>
                          ) : estado === "incompleto" ? (
                            <div>
                              <p className="flex items-center gap-1.5 text-xs text-orange-500 font-medium">
                                <Icon icon="mdi:account-alert-outline" width={15} />
                                Perfil incompleto
                              </p>
                              <p className={`text-xs ${M} mt-0.5`}>
                                Completa tu perfil al 100% para poder postular.{" "}
                                <a href="/estudiante/perfil" className="text-[#378ADD] hover:underline">Ir a mi perfil →</a>
                              </p>
                            </div>
                          ) : (
                            <PrimaryButton
                              onClick={() => handlePostular(v.id)}
                              disabled={estado === "loading"}
                              className="flex items-center gap-2"
                            >
                              {estado === "loading" ? (
                                <Icon icon="mdi:loading" width={15} className="animate-spin" />
                              ) : (
                                <Icon icon="mdi:send-outline" width={15} />
                              )}
                              {estado === "loading" ? "Enviando..." : `Postular a esta ${v.tipo === "puesto_laboral" ? "oferta" : "práctica"}`}
                            </PrimaryButton>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <Paginacion
              paginaActual={paginaVacantes}
              totalPaginas={totalPaginasVacantes}
              onCambiar={setPaginaVacantes}
              porPagina={porPaginaVacantes}
              opciones={[3, 6, 9, 15]}
              onCambiarPorPagina={(n) => { setPorPaginaVacantes(n); setPaginaVacantes(1); }}
            />
          </Card>
        </div>
      </div>

      <PublicacionesUsuario usuarioId={id} />
    </div>
  );
}
