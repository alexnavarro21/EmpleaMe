import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { Card, Badge, SecondaryButton, PrimaryButton, PageHeader } from "../components/ui";
import { getEmpresaById, getVacantesEmpresa, postularAVacante } from "../services/api";

export default function PerfilEmpresaPublico() {
  const { isDark } = useDark();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [empresa, setEmpresa] = useState(null);
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // { [vacanteId]: "idle" | "loading" | "ok" | "error" | "duplicado" }
  const [postulando, setPostulando] = useState({});

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";

  const esEstudiante = location.pathname.startsWith("/estudiante");

  useEffect(() => {
    Promise.allSettled([getEmpresaById(id), getVacantesEmpresa(id)])
      .then(([emp, vacs]) => {
        if (emp.status === "fulfilled") setEmpresa(emp.value);
        else setError("No se pudo cargar el perfil de la empresa.");
        if (vacs.status === "fulfilled") setVacantes(vacs.value);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePostular = async (vacanteId) => {
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
            <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-[#185FA5] flex items-center justify-center text-white text-3xl font-bold">
              {empresa.nombre_empresa?.[0]?.toUpperCase() ?? "E"}
            </div>
            <p className={`text-lg font-semibold ${T}`}>{empresa.nombre_empresa}</p>
            <p className={`text-xs ${M} mb-3`}>Empresa registrada en EmpleaMe</p>
            <Badge color="blue">Empresa Verificada</Badge>

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
            <h3 className={`text-sm font-semibold ${T} mb-4 flex items-center gap-2`}>
              <Icon icon="mdi:clipboard-list-outline" width={16} className="text-[#378ADD]" />
              Vacantes activas
              {vacantesActivas.length > 0 && (
                <span className="ml-1 text-xs font-normal text-[#378ADD]">({vacantesActivas.length})</span>
              )}
            </h3>

            {vacantesActivas.length === 0 ? (
              <div className={`text-center py-8 ${M}`}>
                <Icon icon="mdi:clipboard-remove-outline" width={36} className="mx-auto mb-2" />
                <p className="text-sm">No hay vacantes activas en este momento.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {vacantesActivas.map((v) => {
                  const estado = postulando[v.id] || "idle";
                  return (
                    <div key={v.id} className={`p-4 rounded-lg border ${B}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`text-sm font-semibold ${T}`}>{v.titulo}</p>
                        <Badge color="green">Activa</Badge>
                      </div>
                      <p className={`text-xs ${M} mb-2`}>{v.area || "—"} · {v.modalidad || "Presencial"}</p>
                      {v.descripcion && (
                        <p className={`text-xs ${M} mb-3`}>{v.descripcion}</p>
                      )}

                      {esEstudiante && (
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-dashed" style={{ borderColor: isDark ? "#3a3a38" : "#D3D1C7" }}>
                          {estado === "ok" ? (
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
                              {estado === "loading" ? "Enviando..." : "Postular a esta práctica"}
                            </PrimaryButton>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
