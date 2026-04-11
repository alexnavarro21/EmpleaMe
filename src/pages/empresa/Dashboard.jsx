import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, StatCard, PageHeader, PrimaryButton, Paginacion } from "../../components/ui";
import { getVacantesEmpresa, getPostulantesEmpresa, getPostulantesAceptados, actualizarEstadoPostulacion, iniciarConversacion, enviarMensaje, activarVacante, desactivarVacante, completarPractica } from "../../services/api";
import PostulantesVacanteModal from "../../components/PostulantesVacanteModal";

const postColor = { pendiente: "blue", aceptado: "green", rechazado: "gray" };
const postLabel = { pendiente: "nuevo", aceptado: "aceptado", rechazado: "rechazado" };

function MotivoModal({ titulo, descripcion, placeholder, requerido, confirmLabel, confirmClass, onConfirmar, onCancelar, isDark, T, M, B, BG }) {
  const [motivo, setMotivo] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancelar}>
      <div className={`w-full max-w-sm rounded-2xl p-6 shadow-xl ${BG}`} onClick={(e) => e.stopPropagation()}>
        <h3 className={`text-base font-semibold ${T} mb-1`}>{titulo}</h3>
        <p className={`text-sm ${M} mb-4`}>{descripcion}</p>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border resize-none transition-all focus:border-[#378ADD] ${
            isDark
              ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
              : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
          }`}
        />
        <div className="flex gap-2 justify-end mt-4">
          <button
            onClick={onCancelar}
            className={`px-4 py-2 text-sm rounded-lg border ${B} ${M} hover:border-[#378ADD] transition-colors`}
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar(motivo.trim())}
            disabled={requerido && !motivo.trim()}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmpresaDashboard() {
  const { isDark } = useDark();
  const navigate = useNavigate();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";

  const [vacantes, setVacantes] = useState([]);
  const [postulantes, setPostulantes] = useState([]);
  const [aceptados, setAceptados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactandoId, setContactandoId] = useState(null);
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [completando, setCompletando] = useState(null);
  const [modalRechazar, setModalRechazar] = useState(null);   // postulante object
  const [modalDesactivar, setModalDesactivar] = useState(null); // vacante object
  const [paginaVacantes, setPaginaVacantes] = useState(1);
  const [porPaginaVacantes, setPorPaginaVacantes] = useState(6);
  const [busquedaVacante, setBusquedaVacante] = useState("");

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [vacs, posts, acepts] = await Promise.all([
          getVacantesEmpresa(usuario.id),
          getPostulantesEmpresa(),
          getPostulantesAceptados(),
        ]);
        setVacantes(vacs);
        setPostulantes(posts);
        setAceptados(acepts);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, [usuario.id]);

  const handleToggleVacante = async (vacante) => {
    if (vacante.esta_activa) {
      // Deactivating: show justification modal first
      setModalDesactivar(vacante);
      return;
    }
    // Activating: no confirmation needed
    setToggling(vacante.id);
    try {
      await activarVacante(vacante.id);
      setVacantes((prev) => prev.map((v) => v.id === vacante.id ? { ...v, esta_activa: true } : v));
    } catch (err) {
      console.error("Error al activar vacante:", err);
    } finally {
      setToggling(null);
    }
  };

  const handleDesactivarConfirmado = async (vacante, motivo) => {
    setModalDesactivar(null);
    // Collect affected pending applicants before deactivating
    const afectados = postulantes.filter((p) => p.vacante_id === vacante.id);
    setToggling(vacante.id);
    try {
      await desactivarVacante(vacante.id);
      setVacantes((prev) => prev.map((v) => v.id === vacante.id ? { ...v, esta_activa: false } : v));
      setPostulantes((prev) => prev.filter((p) => p.vacante_id !== vacante.id));
      // Send message to each affected applicant
      for (const p of afectados) {
        try {
          const conv = await iniciarConversacion(p.estudiante_id);
          const texto = `La vacante "${vacante.titulo}" a la que postulaste ha sido cerrada.${motivo ? `\n\nMotivo: ${motivo}` : ""}\n\nGracias por tu interés. ¡Te deseamos mucho éxito en tu búsqueda!`;
          await enviarMensaje(conv.id, texto);
        } catch (e) {
          console.error("Error enviando mensaje de cierre a", p.nombre_completo, e);
        }
      }
    } catch (err) {
      console.error("Error al desactivar vacante:", err);
    } finally {
      setToggling(null);
    }
  };

  const handleContactar = async (estudianteId) => {
    setContactandoId(estudianteId);
    try {
      const conv = await iniciarConversacion(estudianteId);
      navigate("/empresa/mensajeria", { state: { conversacionId: conv.id } });
    } catch (err) {
      console.error("Error al contactar:", err);
    } finally {
      setContactandoId(null);
    }
  };

  const handleAceptar = async (postulante) => {
    try {
      await actualizarEstadoPostulacion(postulante.id, "aceptado");
      setAceptados((prev) => [{ ...postulante, estado: "aceptado" }, ...prev]);
      setPostulantes((prev) => prev.filter((p) => p.id !== postulante.id));
      // Auto-message
      const conv = await iniciarConversacion(postulante.estudiante_id);
      await enviarMensaje(conv.id,
        `¡Felicidades, ${postulante.nombre_completo}! Has sido aceptado/a en la vacante "${postulante.vacante_titulo}". La empresa se pondrá en contacto contigo pronto para coordinar los detalles. ¡Mucho éxito!`
      );
    } catch (err) {
      console.error("Error al aceptar postulante:", err);
    }
  };

  const handleRechazarConfirmado = async (postulante, motivo) => {
    setModalRechazar(null);
    try {
      await actualizarEstadoPostulacion(postulante.id, "rechazado");
      setPostulantes((prev) => prev.filter((p) => p.id !== postulante.id));
      // Auto-message
      const conv = await iniciarConversacion(postulante.estudiante_id);
      const texto = `Hemos revisado tu postulación a la vacante "${postulante.vacante_titulo}". Lamentablemente, en esta ocasión no has sido seleccionado/a.${motivo ? `\n\nMotivo: ${motivo}` : ""}\n\n¡Te deseamos mucho éxito en tu búsqueda!`;
      await enviarMensaje(conv.id, texto);
    } catch (err) {
      console.error("Error al rechazar postulante:", err);
    }
  };

  // Kept for PostulantesVacanteModal compatibility
  const handleEstado = async (postulacionId, nuevoEstado) => {
    try {
      await actualizarEstadoPostulacion(postulacionId, nuevoEstado);
      if (nuevoEstado === "aceptado") {
        const post = postulantes.find((p) => p.id === postulacionId);
        if (post) setAceptados((prev) => [{ ...post, estado: "aceptado" }, ...prev]);
      }
      setPostulantes((prev) => prev.filter((p) => p.id !== postulacionId));
    } catch (err) {
      console.error("Error actualizando estado:", err);
    }
  };

  const handleCompletar = async (postulacionId) => {
    const practica = aceptados.find((p) => p.id === postulacionId);
    setCompletando(postulacionId);
    try {
      await completarPractica(postulacionId);
      setAceptados((prev) => prev.filter((p) => p.id !== postulacionId));
      // Auto-message
      if (practica) {
        const esPuesto = practica.vacante_tipo === "puesto_laboral";
        const conv = await iniciarConversacion(practica.estudiante_id);
        await enviarMensaje(conv.id,
          `¡Felicidades, ${practica.nombre_completo}! Has completado exitosamente tu ${esPuesto ? "período en el puesto" : "práctica"} en "${practica.vacante_titulo}". Tu experiencia ha quedado registrada en tu perfil de EmpleaMe. ¡Mucho éxito en tu camino profesional! 🎉`
        );
      }
    } catch (err) {
      console.error("Error al completar práctica:", err);
    } finally {
      setCompletando(null);
    }
  };

  const vacantesActivas = vacantes.filter((v) => v.esta_activa).length;
  const vacantesInactivas = vacantes.length - vacantesActivas;
  const vacantesFiltradas = vacantes.filter((v) =>
    !busquedaVacante || v.titulo?.toLowerCase().includes(busquedaVacante.toLowerCase())
  );
  const totalPaginasVacantes = Math.ceil(vacantesFiltradas.length / porPaginaVacantes);
  const vacantesPagina = vacantesFiltradas.slice(
    (paginaVacantes - 1) * porPaginaVacantes,
    paginaVacantes * porPaginaVacantes
  );
  const totalPostulantes = vacantes.reduce((acc, v) => acc + (v.total_postulantes || 0), 0);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-24 ${M}`}>
        <Icon icon="mdi:loading" width={28} className="animate-spin mr-2" />
        Cargando...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Panel Empresa"
        subtitle={usuario.nombre_empresa || "Mi empresa"}
        action={
          <Link
            to="/empresa/publicar"
            className="flex items-center gap-2 text-base font-semibold bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] px-6 py-3 rounded-lg transition-colors"
          >
            <Icon icon="mdi:plus" width={20} />
            Publicar vacante
          </Link>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Vacantes activas" value={String(vacantesActivas)} sub={`${vacantes.length} en total`} />
        <StatCard label="Vacantes inactivas" value={String(vacantesInactivas)} sub="Cerradas o pausadas" subColor="text-[#888780]" />
        <StatCard label="Total postulantes" value={String(totalPostulantes)} sub="Acumulado" />
        <StatCard label="Postulantes pendientes" value={String(postulantes.length)} sub="Sin revisar" subColor="text-amber-500" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <h2 className={`text-sm font-semibold ${T} flex items-center gap-2 flex-1`}>
              <Icon icon="mdi:clipboard-list-outline" width={16} className="text-[#378ADD]" />
              Mis vacantes
            </h2>
            {vacantes.length > 0 && (
              <div className="relative">
                <Icon icon="mdi:search" width={13} className={`absolute left-2 top-1/2 -translate-y-1/2 ${M}`} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={busquedaVacante}
                  onChange={(e) => { setBusquedaVacante(e.target.value); setPaginaVacantes(1); }}
                  className={`pl-7 pr-2 py-1.5 rounded-lg text-xs outline-none border transition-all focus:border-[#378ADD] w-32 ${
                    isDark
                      ? "bg-[#262624] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                      : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
                  }`}
                />
              </div>
            )}
            <Link to="/empresa/publicar" className="text-xs text-[#378ADD] hover:underline">+ Nueva</Link>
          </div>

          {vacantes.length === 0 ? (
            <p className={`text-xs ${M} text-center py-8`}>No tienes vacantes publicadas aún.</p>
          ) : vacantesFiltradas.length === 0 ? (
            <p className={`text-xs ${M} text-center py-6`}>Sin resultados para "{busquedaVacante}".</p>
          ) : (
            <div className="flex flex-col gap-3">
              {vacantesPagina.map((v) => (
                <div key={v.id} className={`p-3 rounded-lg border ${B} ${!v.esta_activa ? (isDark ? "opacity-60" : "opacity-70") : ""}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-medium ${T} truncate pr-2`}>{v.titulo}</p>
                    <Badge color={v.esta_activa ? "green" : "gray"}>
                      {v.esta_activa ? "activa" : "inactiva"}
                    </Badge>
                  </div>
                  <p className={`text-xs ${M} mb-2`}>
                    {v.tipo === "puesto_laboral" ? "Puesto laboral" : "Práctica"} · {v.area || "—"} · {v.modalidad || "presencial"}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs ${M}`}>{v.total_postulantes || 0} postulantes</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleVacante(v)}
                        disabled={toggling === v.id}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                          v.esta_activa
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        } disabled:opacity-50`}
                      >
                        <Icon
                          icon={toggling === v.id ? "mdi:loading" : v.esta_activa ? "mdi:pause-circle-outline" : "mdi:play-circle-outline"}
                          width={14}
                          className={toggling === v.id ? "animate-spin" : ""}
                        />
                        {v.esta_activa ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => setVacanteSeleccionada(v)}
                        className="text-xs text-[#378ADD] hover:underline"
                      >
                        Ver postulantes →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-sm font-semibold ${T} flex items-center gap-2`}>
              <Icon icon="mdi:account-group-outline" width={16} className="text-[#378ADD]" />
              Postulantes pendientes
            </h2>
          </div>

          {postulantes.length === 0 ? (
            <p className={`text-xs ${M} text-center py-8`}>No hay postulantes pendientes.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {postulantes.slice(0, 6).map((p) => (
                <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg border ${B}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                    <Icon icon="mynaui:user-solid" width={20} className="text-[#378ADD]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${T} truncate`}>{p.nombre_completo}</p>
                      <Badge color={postColor[p.estado]}>{postLabel[p.estado]}</Badge>
                    </div>
                    <p className={`text-xs ${M}`}>
                      {p.carrera} {p.promedio ? `· Nota: ${parseFloat(p.promedio).toFixed(1)}` : ""}
                    </p>
                    {p.vacante_titulo && (
                      <p className={`text-xs text-[#378ADD] truncate`}>
                        <Icon icon="mdi:briefcase-outline" width={11} className="inline mr-0.5 mb-0.5" />
                        {p.vacante_titulo}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {p.estado === "pendiente" && (
                      <>
                        <button
                          onClick={() => handleAceptar(p)}
                          className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => setModalRechazar(p)}
                          className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleContactar(p.estudiante_id)}
                      disabled={contactandoId === p.estudiante_id}
                      title="Enviar mensaje"
                      className={`${M} hover:text-[#378ADD] transition-colors disabled:opacity-50`}
                    >
                      <Icon
                        icon={contactandoId === p.estudiante_id ? "mdi:loading" : "mdi:message-outline"}
                        width={18}
                        className={contactandoId === p.estudiante_id ? "animate-spin" : ""}
                      />
                    </button>
                    <Link
                      to={`/empresa/candidato/${p.estudiante_id}`}
                      className={`${M} hover:text-[#378ADD] transition-colors`}
                    >
                      <Icon icon="mdi:chevron-right" width={20} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Sección: Prácticas en curso (aceptadas) */}
      {aceptados.length > 0 && (
        <Card className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon icon="mdi:briefcase-check-outline" width={16} className="text-[#378ADD]" />
            <h2 className={`text-sm font-semibold ${T}`}>Prácticas en curso</h2>
            <span className={`ml-auto text-xs ${M}`}>Marca como completada cuando el estudiante finalice</span>
          </div>

          <div className="flex flex-col gap-3">
            {aceptados.map((p) => (
              <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg border ${B}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                  <Icon icon="mynaui:user-solid" width={20} className="text-[#378ADD]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${T} truncate`}>{p.nombre_completo}</p>
                  <p className={`text-xs ${M}`}>{p.carrera}</p>
                  {p.vacante_titulo && (
                    <p className={`text-xs text-[#378ADD] truncate`}>
                      <Icon icon="mdi:briefcase-outline" width={11} className="inline mr-0.5 mb-0.5" />
                      {p.vacante_titulo}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleCompletar(p.id)}
                    disabled={completando === p.id}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    <Icon
                      icon={completando === p.id ? "mdi:loading" : "mdi:check-circle-outline"}
                      width={14}
                      className={completando === p.id ? "animate-spin" : ""}
                    />
                    {completando === p.id ? "Procesando..." : "Marcar como completada"}
                  </button>
                  <Link
                    to={`/empresa/candidato/${p.estudiante_id}`}
                    className={`${M} hover:text-[#378ADD] transition-colors`}
                  >
                    <Icon icon="mdi:chevron-right" width={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {vacanteSeleccionada && (
        <PostulantesVacanteModal
          vacante={vacanteSeleccionada}
          onClose={() => setVacanteSeleccionada(null)}
          onEstadoCambiado={() => getPostulantesEmpresa().then(setPostulantes).catch(console.error)}
        />
      )}

      {modalRechazar && (
        <MotivoModal
          titulo="Rechazar postulante"
          descripcion={`Ingresa el motivo por el que rechazas a ${modalRechazar.nombre_completo}. Se enviará un mensaje automático al estudiante.`}
          placeholder="Ej: El perfil no cumple con los requisitos del puesto..."
          requerido={false}
          confirmLabel="Rechazar y notificar"
          confirmClass="bg-red-600 hover:bg-red-700 text-white"
          onConfirmar={(motivo) => handleRechazarConfirmado(modalRechazar, motivo)}
          onCancelar={() => setModalRechazar(null)}
          isDark={isDark} T={T} M={M} B={B} BG={BG}
        />
      )}

      {modalDesactivar && (
        <MotivoModal
          titulo="Cerrar vacante"
          descripcion={`Al cerrar "${modalDesactivar.titulo}", los postulantes pendientes serán rechazados y recibirán un mensaje. Indica el motivo.`}
          placeholder="Ej: La posición fue cubierta internamente..."
          requerido={false}
          confirmLabel="Cerrar y notificar"
          confirmClass="bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB]"
          onConfirmar={(motivo) => handleDesactivarConfirmado(modalDesactivar, motivo)}
          onCancelar={() => setModalDesactivar(null)}
          isDark={isDark} T={T} M={M} B={B} BG={BG}
        />
      )}

    </div>
  );
}
