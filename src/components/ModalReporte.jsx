import { useState } from "react";
import { Icon } from "@iconify/react";
import { MOTIVOS_REPORTE } from "../utils/reportes";
import { crearReporte } from "../services/api";
import { useDark } from "../context/DarkModeContext";

export default function ModalReporte({ tipo, referenciaId, titulo, onCerrar }) {
  const { isDark } = useDark();
  const T  = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]" : "border-[#E8E6E1]";
  const BG = isDark ? "bg-[#262624]" : "bg-white";

  const [motivo, setMotivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = async () => {
    if (!motivo) return;
    setEnviando(true);
    try {
      await crearReporte({ tipo, referencia_id: referenciaId, motivo });
    } catch (e) {
      if (!e.message?.includes("Ya reportaste")) {
        setEnviando(false);
        return;
      }
    }
    setEnviado(true);
    setEnviando(false);
    setTimeout(onCerrar, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onCerrar}>
      <div className={`w-full max-w-sm rounded-2xl p-5 shadow-xl border ${B} ${BG}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className={`text-sm font-semibold ${T}`}>{titulo || "¿Por qué realizas este reporte?"}</p>
          <button onClick={onCerrar} className={`${M} hover:text-red-400 transition-colors`}>
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>

        {enviado ? (
          <div className="flex flex-col items-center py-4 gap-2">
            <Icon icon="mdi:check-circle-outline" width={32} className="text-green-500" />
            <p className={`text-sm ${T}`}>Reporte enviado. Lo revisaremos pronto.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 mb-5">
              {MOTIVOS_REPORTE.map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setMotivo(val)}
                  className={`text-left text-xs px-3 py-2.5 rounded-lg border transition-colors ${
                    motivo === val
                      ? "border-amber-500 bg-amber-500/10 text-amber-500"
                      : `${B} ${M} hover:border-amber-400/50 hover:text-amber-400`
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={handleEnviar}
              disabled={!motivo || enviando}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Enviar reporte"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
