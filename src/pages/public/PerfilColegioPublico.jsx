import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card } from "../../components/ui";
import PublicacionesUsuario from "../../components/PublicacionesUsuario";
import { getColegioById, getMediaUrl, iniciarMensajeDirecto } from "../../services/api";

export default function PerfilColegioPublico() {
  const { isDark } = useDark();
  const navigate = useNavigate();
  const { id } = useParams();

  const [colegio, setColegio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contactando, setContactando] = useState(false);
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    getColegioById(id)
      .then((data) => setColegio(data))
      .catch(() => setError("No se pudo cargar el perfil del colegio."))
      .finally(() => setLoading(false));

  }, [id]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-24 ${M}`}>
        <Icon icon="mdi:loading" width={28} className="animate-spin mr-2" />
        Cargando perfil...
      </div>
    );
  }

  if (error || !colegio) {
    return (
      <div className={`text-center py-24 ${M}`}>
        <Icon icon="mdi:school-outline" width={48} className="mx-auto mb-3" />
        <p className={`text-base font-medium ${T}`}>{error || "Colegio no encontrado"}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-[#378ADD] hover:underline">
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className={`mb-4 flex items-center gap-1.5 text-sm transition-colors ${M} hover:text-[#378ADD]`}
      >
        <Icon icon="mdi:arrow-left" width={18} />
        Volver
      </button>

      <div className="grid grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <Card className="text-center">
            {colegio.foto_perfil ? (
              <img src={getMediaUrl(colegio.foto_perfil)} className="w-20 h-20 rounded-full object-cover mx-auto mb-3" alt="" />
            ) : (
              <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-[#0F4D8A] flex items-center justify-center text-white text-3xl font-bold">
                {colegio.nombre_institucion?.[0]?.toUpperCase() ?? "C"}
              </div>
            )}
            <p className={`text-lg font-semibold ${T}`}>{colegio.nombre_institucion}</p>
            {(colegio.comuna || colegio.region) && (
              <p className={`text-xs ${M} flex items-center justify-center gap-1 mt-1`}>
                <Icon icon="mdi:map-marker-outline" width={12} />
                {[colegio.comuna, colegio.region].filter(Boolean).join(", ")}
              </p>
            )}
            <p className={`text-xs ${M} mt-1 mb-3`}>Institución educativa en EmpleaMe</p>

            {usuario.rol === "slep" && (
              <button
                onClick={async () => {
                  setContactando(true);
                  try {
                    const conv = await iniciarMensajeDirecto(id);
                    navigate("/slep/mensajeria", { state: { directaId: conv.id } });
                  } catch (err) {
                    console.error("Error al contactar:", err);
                  } finally {
                    setContactando(false);
                  }
                }}
                disabled={contactando}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Icon icon={contactando ? "mdi:loading" : "mdi:message-outline"} width={16} className={contactando ? "animate-spin" : ""} />
                {contactando ? "Abriendo chat..." : "Iniciar conversación"}
              </button>
            )}

            <div className={`mt-4 pt-4 border-t ${B} flex flex-col gap-2.5 text-left`}>
              {colegio.telefono_contacto && (
                <p className={`flex items-center gap-2 text-xs ${M}`}>
                  <Icon icon="mdi:phone-outline" width={14} className="flex-shrink-0 text-[#378ADD]" />
                  {colegio.telefono_contacto}
                </p>
              )}
              {colegio.correo && (
                <p className={`flex items-center gap-2 text-xs ${M}`}>
                  <Icon icon="mdi:email-outline" width={14} className="flex-shrink-0 text-[#378ADD]" />
                  {colegio.correo}
                </p>
              )}
              <p className={`flex items-center gap-2 text-xs ${M}`}>
                <Icon icon="mdi:account-group-outline" width={14} className="flex-shrink-0 text-[#378ADD]" />
                {colegio.total_estudiantes ?? 0} estudiante{colegio.total_estudiantes !== 1 ? "s" : ""} registrado{colegio.total_estudiantes !== 1 ? "s" : ""}
              </p>
              {colegio.carreras_impartidas?.length > 0 && (
                <div>
                  <p className={`text-xs ${M} mb-1.5`}>Carreras impartidas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {colegio.carreras_impartidas.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0F4D8A]/10 text-[#378ADD] border border-[#378ADD]/30"
                      >
                        {c === "Administracion" ? "Administración" : c === "Mecanica Automotriz" ? "Mecánica Automotriz" : c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Main */}
        <div className="col-span-2 flex flex-col gap-4">
          {colegio.descripcion && (
            <Card>
              <h3 className={`text-sm font-semibold ${T} mb-2`}>Sobre la institución</h3>
              <p className={`text-sm ${M} leading-relaxed`}>{colegio.descripcion}</p>
            </Card>
          )}
        </div>
      </div>

      <PublicacionesUsuario usuarioId={id} puedeModerar={usuario.rol === "slep"} />
    </div>
  );
}
