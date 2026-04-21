import { useState } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { PrimaryButton } from "./ui";
import FileUploader from "./FileUploader";
import { crearPublicacion, moderarContenido } from "../services/api";

export default function CrearPublicacion({ onPublicado }) {
  const { isDark } = useDark();
  const BASE_ORIGIN = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001";
  const usuarioId = JSON.parse(localStorage.getItem("usuario") || "{}").id;
  const raw = localStorage.getItem(`foto_perfil_${usuarioId}`) || "";
  const fotoPerfil = raw ? (raw.startsWith("http") ? raw : `${BASE_ORIGIN}${raw}`) : null;
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [mostrarUploader, setMostrarUploader] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMod, setErrorMod] = useState("");

  const handleSubmit = async () => {
    if (!contenido.trim() && !archivo) return;

    setErrorMod("");
    setCargando(true);

    try {
      const textoARevisar = [titulo, contenido].filter(Boolean).join(" ").trim();
      if (textoARevisar) {
        const mod = await moderarContenido(textoARevisar);
        if (!mod.aprobado) {
          setErrorMod(mod.razon || "Tu publicación contiene contenido inapropiado.");
          return;
        }
      }

      const formData = new FormData();
      formData.append("titulo", titulo.trim() || "Actualización de estado");
      formData.append("contenido", contenido);
      formData.append("tipo_nombre", "general");
      if (archivo) formData.append("archivo_multimedia", archivo);

      await crearPublicacion(formData);
      setTitulo("");
      setContenido("");
      setArchivo(null);
      setMostrarUploader(false);
      if (onPublicado) onPublicado();
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";

  return (
    <div className={`p-4 rounded-xl border shadow-sm ${isDark ? "bg-[#262624] border-[#3a3a38]" : "bg-white border-[#D3D1C7]"}`}>
      <div className="flex gap-3">
        {fotoPerfil ? (
          <img src={fotoPerfil} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${isDark ? "bg-[#313130] text-[#85B7EB]" : "bg-[#E6F1FB] text-[#0F4D8A]"}`}>
            <Icon icon="mynaui:user-solid" width={20} />
          </div>
        )}

        <div className="flex-1">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título (opcional)"
            className={`w-full bg-transparent outline-none text-sm font-semibold pb-2 ${isDark ? "text-[#D3D1C7] placeholder-[#5F5E5A]" : "text-[#2C2C2A] placeholder-[#888780]"}`}
          />
          <div className={`border-t mb-3 ${isDark ? "border-[#3a3a38]" : "border-[#E8E6E1]"}`} />
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="¿Qué quieres compartir con la red de EmpleaMe?"
            rows={archivo ? 2 : 3}
            className={`w-full bg-transparent resize-none outline-none text-sm ${isDark ? "text-[#D3D1C7] placeholder-[#5F5E5A]" : "text-[#2C2C2A] placeholder-[#888780]"}`}
          />

          {mostrarUploader && (
            <div className="mt-3 mb-2">
              <FileUploader
                title="Sube una imagen, video o documento"
                accept="image/*,video/*,.pdf"
                icon="mdi:paperclip"
                onFileSelect={(file) => setArchivo(file)}
              />
            </div>
          )}

          {errorMod && (
            <p className="text-xs text-red-500 mt-2">{errorMod}</p>
          )}

          <div className={`flex items-center justify-between mt-3 pt-3 border-t border-dashed ${B}`}>
            <button
              onClick={() => setMostrarUploader(!mostrarUploader)}
              className={`p-2 rounded-full transition-colors ${archivo || mostrarUploader ? "text-[#378ADD]" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              title="Adjuntar archivo"
            >
              <Icon icon="mdi:paperclip" width={22} />
            </button>

            <PrimaryButton onClick={handleSubmit} disabled={(!contenido.trim() && !archivo) || cargando}>
              {cargando ? "Publicando..." : "Publicar"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
