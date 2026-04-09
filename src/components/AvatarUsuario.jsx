import { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { actualizarFotoPerfil } from '../services/api';

export default function AvatarUsuario({ urlInicial }) {
  // Mostramos la foto del usuario o una genérica si no tiene
  const [fotoUrl, setFotoUrl] = useState(urlInicial || "https://ui-avatars.com/api/?name=Usuario&background=E6F1FB&color=185FA5");
  const [subiendo, setSubiendo] = useState(false);
  
  // Referencia para conectar el clic de la foto con el input oculto
  const fileInputRef = useRef(null);

  const handleSubirFoto = async (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;

    // Validación: que no suban fotos más pesadas que 5MB
    if (archivo.size > 5 * 1024 * 1024) {
      alert("La imagen es demasiado grande. El máximo permitido es 5MB.");
      return;
    }

    setSubiendo(true);
    const formData = new FormData();
    formData.append("foto_perfil", archivo);

    try {
      // Llamamos al backend
      const respuesta = await actualizarFotoPerfil(formData);
      
      // Actualizamos la foto en pantalla
      const BASE_URL_BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || "https://empleame.up.railway.app";
      setFotoUrl(`${BASE_URL_BACKEND}${respuesta.foto_perfil}`);
      
    } catch (error) {
      console.error(error);
      alert("Hubo un error al subir la foto.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Contenedor circular principal */}
      <div 
        className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md cursor-pointer"
        onClick={() => fileInputRef.current.click()} 
      >
        {/* Imagen actual */}
        <img 
          src={fotoUrl} 
          alt="Foto de perfil" 
          className={`w-full h-full object-cover transition-opacity duration-300 ${subiendo ? 'opacity-40' : 'opacity-100'}`}
        />

        {/* Overlay oscuro al pasar el mouse */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Icon icon="mdi:camera" className="text-white text-3xl mb-1" />
          <span className="text-white text-xs font-semibold">Cambiar foto</span>
        </div>

        {/* Círculo de carga mientras se sube */}
        {subiendo && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
             <Icon icon="mdi:loading" className="text-[#185FA5] text-4xl animate-spin" />
          </div>
        )}
      </div>

      {/* Input de archivo Oculto */}
      <input 
        type="file" 
        accept="image/png, image/jpeg, image/jpg" 
        ref={fileInputRef}
        onChange={handleSubirFoto} 
        className="hidden" 
      />
      
      <p className="text-[10px] text-gray-400 mt-2">JPG o PNG (Máx 5MB)</p>
    </div>
  );
}