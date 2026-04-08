import { useDark } from "../context/DarkModeContext";

export function FormField({ label, type = "text", placeholder, value, onChange, className = "", ...props }) {
  const { isDark } = useDark();
  return (
    <div className={`mb-3 ${className}`}>
      <label className={`block text-xs mb-1.5 ${isDark ? "text-[#B4B2A9]" : "text-[#5F5E5A]"}`}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all
          focus:border-[#378ADD] focus:ring-2 focus:ring-[#B5D4F4]
          disabled:opacity-60 disabled:cursor-not-allowed
          ${isDark
            ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
            : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
          }`}
        {...props}
      />
    </div>
  );
}

export function TextAreaField({ label, placeholder, rows = 4, value, onChange, ...props }) {
  const { isDark } = useDark();
  return (
    <div className="mb-3">
      <label className={`block text-xs mb-1.5 ${isDark ? "text-[#B4B2A9]" : "text-[#5F5E5A]"}`}>{label}</label>
      <textarea
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all resize-none
          focus:border-[#378ADD] focus:ring-2 focus:ring-[#B5D4F4]
          disabled:opacity-60 disabled:cursor-not-allowed
          ${isDark
            ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
            : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
          }`}
        {...props}
      />
    </div>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`py-2.5 px-4 bg-[#185FA5] hover:bg-[#0C447C] text-[#E6F1FB] rounded-lg text-sm font-medium transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`py-2.5 px-4 border border-[#185FA5] text-[#185FA5] hover:bg-[#E6F1FB] rounded-lg text-sm font-medium transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }) {
  const { isDark } = useDark();
  return (
    <div className={`rounded-xl border p-5 ${isDark ? "bg-[#262624] border-[#3a3a38]" : "bg-white border-[#D3D1C7]"} ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, color = "blue" }) {
  const variants = {
    blue: "bg-[#E6F1FB] text-[#185FA5]",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
    gray: "bg-[#F7F6F3] text-[#5F5E5A]",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${variants[color] ?? variants.blue}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, sub, subColor = "text-[#378ADD]" }) {
  const { isDark } = useDark();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  return (
    <Card>
      <p className={`text-xs ${M} mb-1`}>{label}</p>
      <p className={`text-3xl font-semibold ${T}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
    </Card>
  );
}

export function PageHeader({ title, subtitle, action }) {
  const { isDark } = useDark();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
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
  const { isDark } = useDark();
  return (
    <div className={`mb-3 ${className}`}>
      <label className={`block text-xs mb-1.5 ${isDark ? "text-[#B4B2A9]" : "text-[#5F5E5A]"}`}>{label}</label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-all
          focus:border-[#378ADD] focus:ring-2 focus:ring-[#B5D4F4]
          disabled:opacity-60 disabled:cursor-not-allowed
          ${isDark
            ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]"
            : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
          }`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function SoftSkillBar({ label, percentage }) {
  const { isDark } = useDark();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F0F4F8]";

  const color =
    percentage >= 85 ? "#22c55e" :
    percentage >= 70 ? "#378ADD" :
    "#f59e0b";

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className={`text-sm ${T}`}>{label}</span>
        <span className="text-xs font-semibold" style={{ color }}>{percentage}%</span>
      </div>
      <div className={`w-full h-2 rounded-full ${S}`}>
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
