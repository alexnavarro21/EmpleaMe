import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, StatCard, PageHeader, PrimaryButton } from "../../components/ui";
import { getVacantesEmpresa, getPostulantesEmpresa, actualizarEstadoPostulacion, iniciarConversacion, activarVacante, desactivarVacante } from "../../services/api";
import PostulantesVacanteModal from "../../components/PostulantesVacanteModal";

const statusColor = { activa: "green", cerrada: "gray", pausada: "yellow" };
const postColor = { pendiente: "blue", aceptado: "green", rechazado: "gray" };
const postLabel = { pendiente: "nuevo", aceptado: "aceptado", rechazado: "rechazado" };

export default function EmpresaDashboard() {
  const { isDark } = useDark();
  const navigate = useNavigate();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const [vacantes, setVacantes] = useState([]);
  const [postulantes, setPostulantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactandoId, setContactandoId] = useState(null);
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);
  const [toggling, setToggling] = useState(null);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [vacs, posts] = await Promise.all([
          getVacantesEmpresa(usuario.id),
          getPostulantesEmpresa(),
        ]);
        setVacantes(vacs);
        setPostulantes(posts);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, [usuario.id]);

  const handleToggleVacante = async (vacante) => {
    setToggling(vacante.id);
    try {
      if (vacante.esta_activa) {
        await desactivarVacante(vacante.id);
      } else {
        await activarVacante(vacante.id);
      }
      setVacantes((prev) =>
        prev.map((v) => v.id === vacante.id ? { ...v, esta_activa: !v.esta_activa } : v)
      );
      if (vacante.esta_activa) {
        // Se desactivó — refrescar pendientes porque algunos pasaron a rechazados
        getPostulantesEmpresa().then(setPostulantes).catch(console.error);
      }
    } catch (err) {
      console.error("Error al cambiar estado de vacante:", err);
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

  const handleEstado = async (postulacionId, nuevoEstado) => {
    try {
      await actualizarEstadoPostulacion(postulacionId, nuevoEstado);
      setPostulantes((prev) => prev.filter((p) => p.id !== postulacionId));
    } catch (err) {
      console.error("Error actualizando estado:", err);
    }
  };

  const vacantesActivas = vacantes.filter((v) => v.esta_activa).length;
  const vacantesInactivas = vacantes.length - vacantesActivas;
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
        title="Dashboard Empresa"
        subtitle={usuario.nombre_empresa || "Mi empresa"}
        action={
          <Link
            to="/empresa/publicar"
            className="flex items-center gap-2 text-sm bg-[#185FA5] hover:bg-[#0C447C] text-[#E6F1FB] px-4 py-2 rounded-lg transition-colors"
          >
            <Icon icon="mdi:plus" width={16} />
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
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-sm font-semibold ${T} flex items-center gap-2`}>
              <Icon icon="mdi:clipboard-list-outline" width={16} className="text-[#378ADD]" />
              Mis vacantes
            </h2>
            <Link to="/empresa/publicar" className="text-xs text-[#378ADD] hover:underline">+ Nueva</Link>
          </div>

          {vacantes.length === 0 ? (
            <p className={`text-xs ${M} text-center py-8`}>No tienes vacantes publicadas aún.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {vacantes.map((v) => (
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
                          onClick={() => handleEstado(p.id, "aceptado")}
                          className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleEstado(p.id, "rechazado")}
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

      {vacanteSeleccionada && (
        <PostulantesVacanteModal
          vacante={vacanteSeleccionada}
          onClose={() => setVacanteSeleccionada(null)}
          onEstadoCambiado={() => getPostulantesEmpresa().then(setPostulantes).catch(console.error)}
        />
      )}

      <div className={`mt-6 p-4 rounded-xl border ${B} ${isDark ? "bg-[#262624]" : "bg-white"}`}>
        <p className={`text-sm font-semibold ${T} mb-3`}>Acciones rápidas</p>
        <div className="flex gap-3 flex-wrap">
          <Link to="/empresa/publicar">
            <PrimaryButton className="flex items-center gap-2">
              <Icon icon="mdi:plus" width={16} />
              Nueva vacante
            </PrimaryButton>
          </Link>
          <Link to="/empresa/buscador">
            <PrimaryButton className="bg-[#378ADD] hover:bg-[#185FA5] flex items-center gap-2">
              <Icon icon="mdi:search" width={16} />
              Buscar estudiantes
            </PrimaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
