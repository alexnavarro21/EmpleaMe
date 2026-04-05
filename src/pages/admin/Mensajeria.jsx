import { useState } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Badge, PageHeader } from "../../components/ui";

const conversations = [
  {
    id: 1,
    student: "Felipe Rojas",
    company: "Automotriz Salinas",
    lastMsg: "Hola Felipe, revisamos tu perfil y nos parece muy completo...",
    time: "10:32",
    unread: 2,
    status: "activa",
  },
  {
    id: 2,
    student: "Catalina Muñoz",
    company: "ContaServ Chile",
    lastMsg: "Perfecto, ¿puedes venir el jueves a las 3pm?",
    time: "09:15",
    unread: 0,
    status: "activa",
  },
  {
    id: 3,
    student: "Valentina Soto",
    company: "Mutual de Seguridad",
    lastMsg: "Adjunta encontrarás los requisitos de la práctica.",
    time: "Ayer",
    unread: 0,
    status: "activa",
  },
  {
    id: 4,
    student: "Sebastián Contreras",
    company: "Mecánica del Sur",
    lastMsg: "Gracias por tu interés, te contactaremos pronto.",
    time: "Lun",
    unread: 0,
    status: "cerrada",
  },
];

const messages = {
  1: [
    { from: "empresa", sender: "Automotriz Salinas", text: "Hola Felipe, revisamos tu perfil y nos parece muy completo. Tenemos una vacante de Practicante Mecánico.", time: "10:15" },
    { from: "estudiante", sender: "Felipe Rojas", text: "¡Buenas tardes! Me interesa mucho la posición. Tengo experiencia en diagnóstico con escáner OBD-II.", time: "10:20" },
    { from: "empresa", sender: "Automotriz Salinas", text: "Hola Felipe, revisamos tu perfil y nos gustaría coordinar una entrevista técnica esta semana.", time: "10:32" },
  ],
  2: [
    { from: "empresa", sender: "ContaServ Chile", text: "Buenos días Catalina, vimos tu perfil y nos interesa tu manejo de Excel avanzado y contabilidad.", time: "08:30" },
    { from: "estudiante", sender: "Catalina Muñoz", text: "Hola, muchas gracias por contactarme. Me gustaría saber más sobre la práctica disponible.", time: "08:45" },
    { from: "empresa", sender: "ContaServ Chile", text: "Perfecto, ¿puedes venir el jueves a las 3pm?", time: "09:15" },
  ],
};

export default function AdminMensajeria() {
  const { isDark } = useDark();
  const [selected, setSelected] = useState(1);
  const [adminNote, setAdminNote] = useState("");
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";
  const cardBg = isDark ? "bg-[#262624]" : "bg-white";

  const conv = conversations.find((c) => c.id === selected);
  const msgs = messages[selected] || [];

  return (
    <div>
      <PageHeader
        title="Bandeja de Mensajería"
        subtitle="Vista intermediaria de comunicaciones empresa — estudiante"
      />

      <div className={`rounded-xl border ${B} overflow-hidden flex`} style={{ height: "600px" }}>
        {/* Conversation list */}
        <div className={`w-72 flex-shrink-0 border-r ${B} flex flex-col ${cardBg}`}>
          <div className={`p-3 border-b ${B}`}>
            <div className="relative">
              <Icon icon="mdi:search" width={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${M}`} />
              <input
                type="text"
                placeholder="Buscar conversación..."
                className={`w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none border transition-all focus:border-[#378ADD] ${
                  isDark
                    ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                    : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
                }`}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left px-4 py-3 border-b ${B} transition-colors ${
                  selected === c.id
                    ? isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"
                    : isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs font-medium ${T} truncate flex-1`}>{c.student}</span>
                  <span className={`text-xs ${M} flex-shrink-0 ml-2`}>{c.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#378ADD] truncate flex-1">{c.company}</span>
                  {c.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#185FA5] text-white text-xs flex items-center justify-center flex-shrink-0 ml-2">
                      {c.unread}
                    </span>
                  )}
                </div>
                <p className={`text-xs ${M} truncate mt-0.5`}>{c.lastMsg}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Thread header */}
          <div className={`px-5 py-3 border-b ${B} ${cardBg} flex items-center justify-between flex-shrink-0`}>
            <div>
              <p className={`text-sm font-semibold ${T}`}>
                {conv?.student} — {conv?.company}
              </p>
              <p className={`text-xs ${M}`}>Supervisión de admin · {msgs.length} mensajes</p>
            </div>
            <div className="flex gap-2">
              <Badge color={conv?.status === "activa" ? "green" : "gray"}>{conv?.status}</Badge>
              <button className={`text-xs ${M} hover:text-red-500 transition-colors`}>Cerrar hilo</button>
            </div>
          </div>

          {/* Admin notice */}
          <div className={`px-5 py-2 text-xs flex items-center gap-2 ${isDark ? "bg-[#1a2e42] text-[#B5D4F4]" : "bg-[#E6F1FB] text-[#185FA5]"} flex-shrink-0`}>
            <Icon icon="mdi:information-outline" width={14} />
            Como administrador puedes ver esta conversación, pero los participantes no ven tu presencia
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
            {msgs.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "empresa" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-xs flex flex-col ${msg.from === "empresa" ? "items-start" : "items-end"}`}>
                  <span className={`text-xs ${M} mb-1`}>{msg.sender}</span>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    msg.from === "empresa"
                      ? isDark ? "bg-[#313130] text-[#D3D1C7]" : "bg-[#F7F6F3] text-[#2C2C2A]"
                      : "bg-[#185FA5] text-[#E6F1FB]"
                  }`}>
                    {msg.text}
                  </div>
                  <span className={`text-xs ${M} mt-1`}>{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Admin note input */}
          <div className={`px-5 py-3 border-t ${B} ${cardBg} flex-shrink-0`}>
            <p className={`text-xs ${M} mb-2`}>Nota interna del administrador (solo visible para otros admins)</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Añadir nota interna..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                  isDark
                    ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                    : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
                }`}
              />
              <button
                onClick={() => setAdminNote("")}
                className="px-4 py-2 bg-[#185FA5] hover:bg-[#0C447C] text-[#E6F1FB] rounded-lg text-sm transition-colors flex-shrink-0"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
