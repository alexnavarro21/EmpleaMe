import { useState } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { PrimaryButton } from "./ui";
import FileUploader from "./FileUploader";
import { crearPublicacion } from "../services/api";

export default function CrearPublicacion({ onPublicado }) {
  const { isDark } = useDark();
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [mostrarUploader, setMostrarUploader] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async () => {
    if (!contenido.trim() && !archivo) return;

    setCargando(true);
    const formData = new FormData();
    formData.append("titulo", titulo.trim() || "Actualización de estado");
    formData.append("contenido", contenido);
    formData.append("tipo_nombre", "general");
    if (archivo) formData.append("archivo_multimedia", archivo);

    try {
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
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${isDark ? "bg-[#313130] text-[#85B7EB]" : "bg-[#E6F1FB] text-[#0F4D8A]"}`}>
          <Icon icon="mynaui:user-solid" width={20} />
        </div>

        <div className="flex-1">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título (opcional)"
            className={`w-full bg-transparent outline-none text-sm font-semibold mb-2 ${isDark ? "text-[#D3D1C7] placeholder-[#5F5E5A]" : "text-[#2C2C2A] placeholder-[#888780]"}`}
          />
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
