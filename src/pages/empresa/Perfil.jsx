import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, Badge, PrimaryButton, SecondaryButton, FormField, PageHeader } from "../../components/ui";
import PublicacionesUsuario from "../../components/PublicacionesUsuario";
import { getEmpresaById, actualizarPerfilEmpresa, getVacantesEmpresa, subirFotoPerfil, getMediaUrl } from "../../services/api";
import { REGIONES_COMUNAS, REGIONES } from "../../data/regionesComunas";


export default function EmpresaPerfil() {
  const { isDark } = useDark();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [telefono, setTelefono] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [vacantes, setVacantes] = useState([]);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    async function cargar() {
      try {
        const [perfil, vacs] = await Promise.all([
          getEmpresaById(usuario.id),
          getVacantesEmpresa(usuario.id),
        ]);
        setNombreEmpresa(perfil.nombre_empresa || "");
        setFotoPerfil(perfil.foto_perfil || null);
        localStorage.setItem(`foto_perfil_${usuario.id}`,perfil.foto_perfil || "");
        setTelefono(perfil.telefono_contacto || "");
        setDescripcion(perfil.descripcion || "");
        setRegion(perfil.region || "");
        setComuna(perfil.comuna || "");
        setVacantes(vacs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [usuario.id]);

  const handleGuardar = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      await actualizarPerfilEmpresa(usuario.id, {
        nombre_empresa: nombreEmpresa,
        telefono_contacto: telefono,
        descripcion,
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

  const completado = [nombreEmpresa, telefono, descripcion, region, comuna].filter(Boolean).length;
  const pctCompleto = Math.round((completado / 5) * 100);
  const vacantesActivas = vacantes.filter((v) => v.esta_activa).length;

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
        title="Perfil de Empresa"
        subtitle="Gestiona la información de tu empresa"
        action={
          <div className="flex gap-2 items-center">
            {saveMsg && (
              <span className={`text-xs ${saveMsg.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
                {saveMsg}
              </span>
            )}
            <SecondaryButton onClick={() => { setEditMode(!editMode); setSaveMsg(""); }}>
              {editMode ? "Cancelar" : "Editar perfil"}
            </SecondaryButton>
            <Link to="/empresa/publicar">
              <PrimaryButton className="flex items-center gap-2">
                <Icon icon="mdi:plus" width={16} />
                Nueva vacante
              </PrimaryButton>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Left: card de empresa */}
        <div className="flex flex-col gap-4">
          <Card className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              {fotoPerfil ? (
                <img src={getMediaUrl(fotoPerfil)} alt="Logo empresa" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#0F4D8A]">
                  <span className="text-3xl font-bold text-white">
                    {nombreEmpresa ? nombreEmpresa[0].toUpperCase() : "E"}
                  </span>
                </div>
              )}
              {editMode && (
                <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setSubiendoFoto(true);
                      try {
                        const { foto_perfil } = await subirFotoPerfil(file);
                        setFotoPerfil(foto_perfil);
                        localStorage.setItem(`foto_perfil_${usuario.id}`,foto_perfil || "");
                      } catch (err) {
                        setSaveMsg("Error al subir foto: " + err.message);
                      } finally {
                        setSubiendoFoto(false);
                      }
                    }}
                  />
                  {subiendoFoto
                    ? <Icon icon="mdi:loading" width={22} className="text-white animate-spin" />
                    : <Icon icon="mdi:camera" width={22} className="text-white" />
                  }
                </label>
              )}
            </div>
            <p className={`text-base font-semibold ${T}`}>{nombreEmpresa || "Sin nombre"}</p>
            <p className={`text-xs ${M}`}>{usuario.correo}</p>
            {(comuna || region) && (
              <p className={`text-xs ${M} mb-2 flex items-center justify-center gap-1`}>
                <Icon icon="mdi:map-marker-outline" width={12} />
                {[comuna, region].filter(Boolean).join(", ")}
              </p>
            )}
            <Badge color="blue">Empresa Verificada</Badge>

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

          {/* Stats rápidos */}
          <Card>
            <p className={`text-xs font-semibold ${T} mb-3`}>Resumen</p>
            <div className="flex flex-col gap-3">
              {[
                { icon: "mdi:clipboard-list-outline", label: "Vacantes publicadas", value: vacantes.length },
                { icon: "mdi:check-circle-outline", label: "Vacantes activas", value: vacantesActivas },
                { icon: "mdi:account-group-outline", label: "Total postulantes", value: vacantes.reduce((a, v) => a + (v.total_postulantes || 0), 0) },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon={stat.icon} width={15} className="text-[#378ADD]" />
                    <span className={`text-xs ${M}`}>{stat.label}</span>
                  </div>
                  <span className={`text-sm font-semibold ${T}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Información */}
        <div className="col-span-2">
          <Card>
            <div className="grid grid-cols-2 gap-x-6">
              <FormField
                label="Nombre de la empresa"
                placeholder="Ej: Automotriz Salinas"
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
                disabled={!editMode}
                className="col-span-2"
              />
              <FormField
                label="Teléfono de contacto"
                type="tel"
                placeholder="+56 9 1234 5678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={!editMode}
              />
              <FormField
                label="Correo electrónico"
                type="email"
                value={usuario.correo || ""}
                disabled
              />
              <div className="mb-3">
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
                  <option value="">Selecciona la región</option>
                  {REGIONES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
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
                  <option value="">{region ? "Selecciona la comuna" : "Primero selecciona región"}</option>
                  {(REGIONES_COMUNAS[region] || []).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 mb-3">
                <label className={`block text-xs mb-1.5 ${M}`}>Descripción de la empresa</label>
                <textarea
                  rows={4}
                  placeholder="Cuéntales a los estudiantes qué hace tu empresa, su cultura y qué ofrece..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all resize-none
                    focus:border-[#378ADD] focus:ring-2 focus:ring-[#B5D4F4] disabled:opacity-60
                    ${isDark
                      ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                      : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
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
          </Card>
        </div>
      </div>

      <PublicacionesUsuario usuarioId={usuario.id} />
    </div>
  );
}
