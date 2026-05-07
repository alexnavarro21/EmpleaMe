import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDark } from "../context/DarkModeContext";
import { getNotificaciones } from "../services/api";

function MascotaSVG({ pose }) {
  const saludando = pose === "saludando";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-110 -90 225 470" aria-hidden="true" width="100%" height="100%">
      {/* Cuerpo */}
      <path d="M -64 96 L -56 88 Q -50 84 -44 84 L 44 84 Q 50 84 56 88 L 64 96 L 78 304 L -78 304 Z" fill="#378ADD"/>
      <path d="M -44 84 L -10 140 L -18 84 Z" fill="#2A6FB8"/>
      <path d="M 44 84 L 10 140 L 18 84 Z" fill="#2A6FB8"/>
      <rect x="-72" y="190" width="148" height="14" fill="#2A6FB8"/>
      <rect x="-8" y="188" width="16" height="18" rx="2" fill="#6BAEE8"/>
      <circle cx="-14" cy="164" r="3" fill="#1F5A99"/>
      <circle cx="14" cy="164" r="3" fill="#1F5A99"/>
      <circle cx="-14" cy="230" r="3" fill="#1F5A99"/>
      <circle cx="14" cy="230" r="3" fill="#1F5A99"/>
      {/* Cuello / solapa */}
      <path d="M -44 84 Q -52 56 -36 46 L 36 46 Q 52 56 44 84 L 18 84 L 10 70 L -10 70 L -18 84 Z" fill="#378ADD"/>
      {/* Cara */}
      <path d="M -30 22 L -30 50 Q -28 60 -14 60 L 26 60 Q 36 60 38 54 L 38 22 Z" fill="#BFD9F2"/>
      {/* Sombrero */}
      <path d="M -28 24 L -18 -16 L -2 4 L 12 -26 L 28 0 L 38 24 Z" fill="#2A6FB8"/>
      <rect x="-46" y="22" width="100" height="8" fill="#6BAEE8"/>
      <ellipse cx="4" cy="32" rx="56" ry="6" fill="#1F5A99"/>
      <ellipse cx="4" cy="30" rx="56" ry="5" fill="#2A6FB8"/>
      {/* Ojos */}
      <circle cx="-12" cy="42" r="6.5" fill="#E8F1FB"/>
      <circle cx="-11" cy="42" r="3.2" fill="#1F5A99"/>
      <circle cx="14" cy="42" r="6.5" fill="#E8F1FB"/>
      <circle cx="15" cy="42" r="3.2" fill="#1F5A99"/>
      {/* Boca */}
      <ellipse cx="1" cy="58" rx="9" ry="16" fill="#6BAEE8" stroke="#2A6FB8" strokeWidth="2.4"/>
      <path d="M -7 64 Q 1 80 9 64 Q 8 72 1 74 Q -6 72 -7 64 Z" fill="#378ADD"/>
      {/* Piernas */}
      <path d="M -50 304 L 52 304 L 48 344 L -46 344 Z" fill="#6BAEE8"/>
      <path d="M -50 344 L 4 344 L 8 360 Q 8 368 0 368 L -50 368 Z" fill="#1F5A99"/>
      <path d="M 8 344 L 56 344 L 60 360 Q 60 368 52 368 L 8 368 Z" fill="#1F5A99"/>
      {/* Maletín */}
      <path d="M 36 218 Q 36 202 56 202 Q 76 202 76 218" fill="none" stroke="#6BAEE8" strokeWidth="3.4" strokeLinecap="round"/>
      <ellipse cx="56" cy="216" rx="8" ry="6" fill="#BFD9F2"/>
      <rect x="14" y="222" width="92" height="58" rx="5" fill="#2A6FB8"/>
      <line x1="14" y1="238" x2="106" y2="238" stroke="#1F5A99" strokeWidth="2.4"/>
      <rect x="54" y="242" width="14" height="6" rx="1.6" fill="#6BAEE8"/>
      {/* Brazo — condicional por pose */}
      {saludando ? (
        <g>
          <path d="M -56 92 Q -100 38 -84 -42 L -64 -46 Q -76 28 -38 92 Z" fill="#378ADD"/>
          <path d="M -86 -40 L -62 -44 L -60 -54 L -84 -50 Z" fill="#2A6FB8"/>
          <g transform="translate(-74,-62)">
            <ellipse cx="0" cy="0" rx="11" ry="12" fill="#BFD9F2"/>
            <rect x="-9" y="-16" width="4.4" height="11" rx="1.6" fill="#BFD9F2"/>
            <rect x="-3" y="-18" width="4.4" height="13" rx="1.6" fill="#BFD9F2"/>
            <rect x="3" y="-17" width="4.4" height="12" rx="1.6" fill="#BFD9F2"/>
            <rect x="9" y="-14" width="4.2" height="9" rx="1.6" fill="#BFD9F2"/>
            <ellipse cx="12" cy="3" rx="3.6" ry="5.4" fill="#BFD9F2"/>
          </g>
        </g>
      ) : (
        <g>
          <path d="M -56 92 Q -68 180 -60 280 L -44 280 Q -48 180 -38 92 Z" fill="#378ADD"/>
          <path d="M -62 276 L -42 276 L -42 286 L -62 286 Z" fill="#2A6FB8"/>
          <ellipse cx="-52" cy="294" rx="7" ry="8" fill="#BFD9F2"/>
        </g>
      )}
    </svg>
  );
}

export default function Mascota({ pose = "saludando", className = "" }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <MascotaSVG pose={pose} />
    </motion.div>
  );
}

export function MascotaFlotante() {
  const { isDark } = useDark();
  const [noLeidas, setNoLeidas] = useState(0);
  const [burbuja, setBurbuja] = useState(null);
  const [pose, setPose] = useState("neutral");
  const lastIdRef = useRef(null);
  const initializedRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => {
      clearInterval(interval);
      clearTimeout(timerRef.current);
    };
  }, []);

  function cerrarBurbuja() {
    setBurbuja(null);
    setPose("neutral");
  }

  async function fetchNotifs() {
    try {
      const { notificaciones, noLeidas: n } = await getNotificaciones(1, 1);
      setNoLeidas(n);
      const latest = notificaciones?.[0];
      if (!initializedRef.current) {
        lastIdRef.current = latest?.id ?? null;
        initializedRef.current = true;
        return;
      }
      if (latest && latest.id !== lastIdRef.current && n > 0) {
        lastIdRef.current = latest.id;
        setBurbuja(latest.titulo);
        setPose("saludando");
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setBurbuja(null);
          setPose("neutral");
        }, 10000);
      }
    } catch (_) {}
  }

  const bg     = isDark ? "bg-[#262624]" : "bg-white";
  const border = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const text   = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const muted  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {burbuja && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.18 }}
            onClick={cerrarBurbuja}
            className={`pointer-events-auto max-w-[200px] ${bg} border ${border} rounded-2xl rounded-br-sm px-3 py-2 shadow-lg text-xs ${text} leading-snug cursor-pointer select-none`}
          >
            {burbuja}
            {noLeidas > 1 && (
              <span className={`block ${muted} mt-0.5`}>y {noLeidas - 1} más</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative pointer-events-auto w-20">
<motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          onClick={cerrarBurbuja}
          className="cursor-pointer"
        >
          <MascotaSVG pose={pose} />
        </motion.div>
      </div>
    </div>
  );
}
