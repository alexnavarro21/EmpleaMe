import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";
import { PageHeader } from "../components/ui";

// Mock de datos de los Reels
const initialReels = [
{
    id: 1,
    student: "Felipe Rojas",
    role: "Practicante Mecánico",
    description: "Diagnosticando un motor con escáner OBD-II 🚗🔧",
    likes: 124,
    videoPlaceholder: "bg-[#1a2e42]" // Simulamos el video con un color
},
{
    id: 2,
    student: "Valentina Soto",
    role: "Desarrolladora Front-End",
    description: "Mi primer componente interactivo en React 💻✨",
    likes: 89,
    videoPlaceholder: "bg-[#2a2416]"
},
{
    id: 3,
    student: "Diego Tapia",
    role: "Técnico Electricista",
    description: "Armando un tablero de control industrial ⚡",
    likes: 210,
    videoPlaceholder: "bg-[#1e1e1c]"
}
];

export default function Reels() {
const { isDark } = useDark();
const location = useLocation();
const [reels, setReels] = useState(initialReels);

  // Descubrir qué rol está viendo la pantalla viendo la URL
const currentRole = location.pathname.startsWith("/admin")
    ? "admin"
    : location.pathname.startsWith("/empresa")
    ? "empresa"
    : "estudiante";

const handleDelete = (id) => {
    if(window.confirm("¿Estás seguro de eliminar este reel?")) {
    setReels(reels.filter(r => r.id !== id));
    }
};

const handleUpload = () => {
    alert("Simulación: Abriendo cámara o galería para subir video...");
};

return (
    <div className="max-w-2xl mx-auto">
    <div className="flex items-center justify-between mb-6">
        <PageHeader 
        title="Experiencias en Acción" 
        subtitle="Descubre el talento de nuestros alumnos en formato Reel"
        />
        {/* Solo el estudiante puede subir videos */}
        {currentRole === "estudiante" && (
        <button 
            onClick={handleUpload}
            className="flex items-center gap-2 bg-[#185FA5] hover:bg-[#0C447C] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
            <Icon icon="mdi:video-plus-outline" width={20} />
            Subir Reel
        </button>
        )}
    </div>

      {/* Contenedor tipo TikTok / Instagram Reels */}
    <div className="flex flex-col gap-8 items-center pb-10">
        {reels.map((reel) => (
        <div 
            key={reel.id} 
            className={`relative w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden shadow-lg border ${isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]"}`}
        >
            {/* Simulación del Video */}
            <div className={`absolute inset-0 ${reel.videoPlaceholder} flex items-center justify-center`}>
            <Icon icon="mdi:play-circle-outline" width={64} className="text-white/50" />
            </div>

            {/* Capa de Información (Overlay) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
            
            <div className="flex justify-between items-end">
                <div className="flex-1">
                <h3 className="font-bold text-lg">{reel.student}</h3>
                <p className="text-[#85B7EB] text-sm mb-2">{reel.role}</p>
                <p className="text-sm text-gray-200 line-clamp-2">{reel.description}</p>
                </div>

                {/* Botones Laterales */}
                <div className="flex flex-col items-center gap-4 ml-4">
                <button className="flex flex-col items-center gap-1 hover:text-[#378ADD] transition-colors">
                    <Icon icon="mdi:heart-outline" width={28} />
                    <span className="text-xs font-medium">{reel.likes}</span>
                </button>
                <button className="flex flex-col items-center gap-1 hover:text-[#378ADD] transition-colors">
                    <Icon icon="mdi:comment-outline" width={28} />
                    <span className="text-xs font-medium">12</span>
                </button>

                  {/* Botón de Moderación: SOLO ADMIN */}
                {currentRole === "admin" && (
                    <button 
                    onClick={() => handleDelete(reel.id)}
                    className="mt-4 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-full transition-colors"
                    title="Eliminar Reel"
                    >
                    <Icon icon="mdi:trash-can-outline" width={24} />
                    </button>
                )}

                  {/* Botón de Acción: SOLO EMPRESA */}
                {currentRole === "empresa" && (
                    <button 
                    className="mt-4 bg-[#185FA5] hover:bg-[#378ADD] text-white p-2 rounded-full transition-colors"
                    title="Contactar Alumno"
                    >
                    <Icon icon="mdi:briefcase-outline" width={24} />
                    </button>
                )}
                </div>
            </div>
            </div>
        </div>
        ))}
        {reels.length === 0 && (
        <p className="text-gray-500 mt-10">No hay reels disponibles en este momento.</p>
        )}
    </div>
    </div>
);
}