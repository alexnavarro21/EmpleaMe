import { Icon } from "@iconify/react";
import { useDark } from "../context/DarkModeContext";

// Paleta alto contraste (Okabe-Ito, modo cálido claro)
// bg: #FFF9E8  card: #FFFFFF  border: #BFB49A
// text: #1A1510  muted: #3A3428  label: #6A6455
// primary: #0A3A6A  accent: #C45E00  success: #1E7A3A

export function FormField({ label, type = "text", placeholder, value, onChange, className = "", ...props }) {
  const { isDark, isContrast } = useDark();
  return (
    <div className={`mb-3 ${className}`}>
      <label className={`block text-xs mb-1.5 font-medium ${
        isContrast ? "text-[#3A3428]"
        : isDark ? "text-[#B4B2A9]"
        : "text-[#5F5E5A]"
      }`}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all
          focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed
          ${isContrast
            ? "bg-white border-[#9A9278] text-[#1A1510] placeholder-[#6A6455] focus:border-[#0A3A6A] focus:ring-[#0A3A6A]/20"
            : isDark
            ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A] focus:border-[#378ADD] focus:ring-[#B5D4F4]"
            : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9] focus:border-[#378ADD] focus:ring-[#B5D4F4]"
          }`}
        {...props}
      />
    </div>
  );
}

export function TextAreaField({ label, placeholder, rows = 4, value, onChange, ...props }) {
  const { isDark, isContrast } = useDark();
  return (
    <div className="mb-3">
      <label className={`block text-xs mb-1.5 font-medium ${
        isContrast ? "text-[#3A3428]"
        : isDark ? "text-[#B4B2A9]"
        : "text-[#5F5E5A]"
      }`}>{label}</label>
      <textarea
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all resize-none
          focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed
          ${isContrast
            ? "bg-white border-[#9A9278] text-[#1A1510] placeholder-[#6A6455] focus:border-[#0A3A6A] focus:ring-[#0A3A6A]/20"
            : isDark
            ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A] focus:border-[#378ADD] focus:ring-[#B5D4F4]"
            : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9] focus:border-[#378ADD] focus:ring-[#B5D4F4]"
          }`}
        {...props}
      />
    </div>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`py-2.5 px-4 bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] rounded-lg text-sm font-medium transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`py-2.5 px-4 border border-[#0F4D8A] text-[#0F4D8A] hover:bg-[#E6F1FB] rounded-lg text-sm font-medium transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }) {
  const { isDark, isContrast } = useDark();
  return (
    <div className={`rounded-xl border p-5 ${
      isContrast ? "bg-white border-[#BFB49A]"
      : isDark ? "bg-[#262624] border-[#3a3a38]"
      : "bg-white border-[#D3D1C7]"
    } ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, color = "blue" }) {
  const { isContrast } = useDark();

  // Modo alto contraste: bordes visibles + colores Okabe-Ito seguros para daltónicos
  const variants = isContrast
    ? {
        blue:   "bg-[#DDEEFF] text-[#003D7A] border border-[#0057A8] font-semibold",
        green:  "bg-[#D4F0DC] text-[#1A5C28] border border-[#1E7A3A] font-semibold",
        yellow: "bg-[#FFF0C0] text-[#5C3A00] border border-[#C45E00] font-semibold",
        red:    "bg-[#FFE4D0] text-[#8A2600] border border-[#C45E00] font-semibold",
        gray:   "bg-[#F0EDE4] text-[#3A3428] border border-[#9A9278] font-semibold",
        orange: "bg-[#FFE4D0] text-[#8A2600] border border-[#C45E00] font-semibold",
        purple: "bg-[#EDE8FF] text-[#4A0080] border border-[#6B00B6] font-semibold",
      }
    : {
        blue:   "bg-[#E6F1FB] text-[#0F4D8A]",
        green:  "bg-green-50 text-green-700",
        yellow: "bg-yellow-50 text-yellow-700",
        red:    "bg-red-50 text-red-700",
        gray:   "bg-[#F7F6F3] text-[#5F5E5A]",
        orange: "bg-orange-50 text-orange-700",
        purple: "bg-purple-50 text-purple-700",
      };

  return (
    <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${variants[color] ?? variants.blue}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, sub, subColor = "text-[#378ADD]" }) {
  const { isDark, isContrast } = useDark();
  const T = isContrast ? "text-[#1A1510]" : isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isContrast ? "text-[#3A3428]" : isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const subC = isContrast ? "text-[#C45E00] font-semibold" : subColor;
  return (
    <Card>
      <p className={`text-xs ${M} mb-1`}>{label}</p>
      <p className={`text-3xl font-semibold ${T}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${subC}`}>{sub}</p>}
    </Card>
  );
}

export function PageHeader({ title, subtitle, action }) {
  const { isDark, isContrast } = useDark();
  const T = isContrast ? "text-[#1A1510]" : isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isContrast ? "text-[#3A3428]" : isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className={`text-xl font-semibold ${T}`}>{title}</h1>
        {subtitle && <p className={`text-sm mt-0.5 ${M}`}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SelectField({ label, children, className = "", value, onChange, ...props }) {
  const { isDark, isContrast } = useDark();
  return (
    <div className={`mb-3 ${className}`}>
      <label className={`block text-xs mb-1.5 font-medium ${
        isContrast ? "text-[#3A3428]"
        : isDark ? "text-[#B4B2A9]"
        : "text-[#5F5E5A]"
      }`}>{label}</label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all
          focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed
          ${isContrast
            ? "bg-white border-[#9A9278] text-[#1A1510] focus:border-[#0A3A6A] focus:ring-[#0A3A6A]/20"
            : isDark
            ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] focus:border-[#378ADD] focus:ring-[#B5D4F4]"
            : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] focus:border-[#378ADD] focus:ring-[#B5D4F4]"
          }`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function SoftSkillBar({ label, percentage }) {
  const { isDark, isContrast } = useDark();
  const T = isContrast ? "text-[#1A1510]" : isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const S = isContrast ? "bg-[#EDE8D8]" : isDark ? "bg-[#313130]" : "bg-[#F0F4F8]";

  // Paleta Okabe-Ito: teal / azul / naranja (sin rojo ni verde puro)
  const color = isContrast
    ? (percentage >= 85 ? "#1E7A3A" : percentage >= 70 ? "#0057A8" : "#C45E00")
    : (percentage >= 85 ? "#22c55e" : percentage >= 70 ? "#378ADD" : "#f59e0b");

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className={`text-sm ${T}`}>{label}</span>
        <span className={`text-xs font-bold`} style={{ color }}>{percentage}%</span>
      </div>
      <div className={`w-full h-2.5 rounded-full ${S}`}>
        <div
          className="h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function Paginacion({ paginaActual, totalPaginas, onCambiar, porPagina, opciones, onCambiarPorPagina }) {
  const { isDark, isContrast } = useDark();
  const T = isContrast ? "text-[#1A1510]" : isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isContrast ? "text-[#3A3428]" : isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isContrast ? "border-[#BFB49A]" : isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isContrast ? "bg-white" : isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";
  const hover = isContrast
    ? "hover:border-[#0A3A6A] hover:text-[#0A3A6A]"
    : "hover:border-[#378ADD] hover:text-[#378ADD]";
  const activeBtn = isContrast
    ? "bg-[#0A3A6A] border-[#0A3A6A] text-white font-bold"
    : "bg-[#0F4D8A] border-[#0F4D8A] text-[#E6F1FB]";

  const showPerPage = opciones && onCambiarPorPagina;
  if (totalPaginas <= 1 && !showPerPage) return null;

  const pages = [];
  if (totalPaginas <= 7) {
    for (let i = 1; i <= totalPaginas; i++) pages.push(i);
  } else {
    pages.push(1);
    if (paginaActual > 3) pages.push("...");
    for (let i = Math.max(2, paginaActual - 1); i <= Math.min(totalPaginas - 1, paginaActual + 1); i++) {
      pages.push(i);
    }
    if (paginaActual < totalPaginas - 2) pages.push("...");
    pages.push(totalPaginas);
  }

  const btnBase = `w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors border`;

  return (
    <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onCambiar(paginaActual - 1)}
          disabled={paginaActual === 1 || totalPaginas <= 1}
          className={`${btnBase} ${B} ${M} ${hover} disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <Icon icon="mdi:chevron-left" width={16} />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className={`w-8 text-center text-sm ${M}`}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onCambiar(p)}
              className={`${btnBase} font-medium ${
                p === paginaActual ? activeBtn : `${S} ${B} ${T} ${hover}`
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onCambiar(paginaActual + 1)}
          disabled={paginaActual === totalPaginas || totalPaginas <= 1}
          className={`${btnBase} ${B} ${M} ${hover} disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <Icon icon="mdi:chevron-right" width={16} />
        </button>
      </div>

      {showPerPage && (
        <div className={`flex items-center gap-2 text-xs ${M}`}>
          <span>Mostrar:</span>
          <select
            value={porPagina}
            onChange={(e) => onCambiarPorPagina(Number(e.target.value))}
            className={`px-2 py-1.5 rounded-lg border text-xs outline-none transition-colors cursor-pointer ${
              isContrast
                ? "bg-white border-[#9A9278] text-[#1A1510] focus:border-[#0A3A6A]"
                : isDark
                ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] focus:border-[#378ADD]"
                : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] focus:border-[#378ADD]"
            }`}
          >
            {opciones.map((o) => (
              <option key={o} value={o}>{o} por página</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
