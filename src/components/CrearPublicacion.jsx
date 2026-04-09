import { useState } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { PrimaryButton } from "./ui";
import FileUploader from "./FileUploader";
import { crearPublicacion } from "../services/api"; // 👈 ¡AQUÍ ESTÁ LA CONEXIÓN!

export default function CrearPublicacion() {
  const { isDark } = useDark();
  const [contenido, setContenido] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [mostrarUploader, setMostrarUploader] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async () => {
    if (!contenido.trim() && !archivo) {
      alert("Por favor escribe algo o adjunta un archivo.");
      return;
    }

    setCargando(true);


const formData = new FormData();
    // 1. Datos básicos
    formData.append("usuario_id", 1); 
    formData.append("contenido", contenido);
    
    // 🚀 2. LO QUE EL BACKEND EXIGE PARA DEJARNOS PASAR
    formData.append("titulo", "Nueva publicación"); // Le pasamos un título por defecto
    formData.append("tipo_nombre", "general");      // Usamos "general" que existe en tu BD
    
    // 3. El archivo (si es que hay)
    if (archivo) {
      formData.append("archivo_multimedia", archivo);
    }

    try {
      // 🚀 AQUÍ SE ENVÍA DE VERDAD AL BACKEND
      await crearPublicacion(formData);
      
      setContenido("");
      setArchivo(null);
      setMostrarUploader(false);
      alert("¡Publicación creada con éxito!");
      
      // Opcional: Recarga la página para ver el post nuevo
      window.location.reload(); 
      
    } catch (error) {
      console.error(error);
      alert("Hubo un error al publicar. Revisa la consola.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={`p-4 rounded-xl border mb-6 shadow-sm ${isDark ? "bg-[#262624] border-[#3a3a38]" : "bg-white border-[#D3D1C7]"}`}>
      <div className="flex gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${isDark ? "bg-[#313130] text-[#85B7EB]" : "bg-[#E6F1FB] text-[#185FA5]"}`}>
          YO
        </div>
        
        <div className="flex-1">
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="¿Qué quieres compartir con la red de EmpleaMe?"
            rows={archivo ? 2 : 3}
            className={`w-full bg-transparent resize-none outline-none text-sm transition-all ${isDark ? "text-[#D3D1C7] placeholder-[#5F5E5A]" : "text-[#2C2C2A] placeholder-[#888780]"}`}
          />

          {mostrarUploader && (
            <div className="mt-3 mb-2 animate-fade-in">
              <FileUploader 
                title="Sube una imagen, video o documento" 
                accept="image/*,video/*,.pdf" 
                icon="mdi:paperclip"
                onFileSelect={(file) => setArchivo(file)} 
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-gray-300 dark:border-gray-700">
            <div className="flex gap-2">
              <button 
                onClick={() => setMostrarUploader(!mostrarUploader)}
                className={`p-2 rounded-full transition-colors ${archivo || mostrarUploader ? 'text-[#378ADD]' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Adjuntar archivo"
              >
                <Icon icon="mdi:paperclip" width={22} />
              </button>
            </div>
            
            <PrimaryButton onClick={handleSubmit} disabled={(!contenido.trim() && !archivo) || cargando}>
              {cargando ? "Publicando..." : "Publicar"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}