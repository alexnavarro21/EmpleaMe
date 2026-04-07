import { useState } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Badge, PageHeader } from "../../components/ui";

// Mocks adaptados para la vista del estudiante
const conversations = [
  {
    id: 1,
    counterpart: "Automotriz Salinas", // Con quién habla
    lastMsg: "Hola Felipe, revisamos tu perfil y nos gustaría coordinar...",
    time: "10:32",
    unread: 1,
    status: "activa",
  },
  {
    id: 4,
    counterpart: "Mecánica del Sur",
    lastMsg: "Gracias por tu interés, te contactaremos pronto.",
    time: "Lun",
    unread: 0,
    status: "cerrada",
  },
];

const messagesMock = {
  1: [
    { from: "empresa", sender: "Automotriz Salinas", text: "Hola Felipe, revisamos tu perfil y nos parece muy completo. Tenemos una vacante de Practicante Mecánico.", time: "10:15" },
    { from: "estudiante", sender: "Tú", text: "¡Buenas tardes! Me interesa mucho la posición. Tengo experiencia en diagnóstico con escáner OBD-II.", time: "10:20" },
    { from: "empresa", sender: "Automotriz Salinas", text: "Hola Felipe, revisamos tu perfil y nos gustaría coordinar una entrevista técnica esta semana.", time: "10:32" },
  ],
  4: [
    { from: "estudiante", sender: "Tú", text: "Estimados, adjunto mi CV para la vacante.", time: "Lun" },
    { from: "empresa", sender: "Mecánica del Sur", text: "Gracias por tu interés, te contactaremos pronto.", time: "Lun" },
  ]
};

export default function EstudianteMensajeria() {
  const { isDark } = useDark();
  const [selected, setSelected] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  // Estado local para poder agregar mensajes visualmente en el prototipo
  const [messages, setMessages] = useState(messagesMock);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const cardBg = isDark ? "bg-[#262624]" : "bg-white";

  const conv = conversations.find((c) => c.id === selected);
  const msgs = messages[selected] || [];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsgObj = {
      from: "estudiante",
      sender: "Tú",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages({
      ...messages,
      [selected]: [...msgs, newMsgObj]
    });
    setNewMessage("");
  };

  return (
    <div>
      <PageHeader
        title="Mis Mensajes"
        subtitle="Comunícate con las empresas interesadas en tu perfil"
      />

      <div className={`rounded-xl border ${B} overflow-hidden flex`} style={{ height: "600px" }}>
        {/* Lista de Conversaciones */}
        <div className={`w-72 flex-shrink-0 border-r ${B} flex flex-col ${cardBg}`}>
          <div className="flex-1 overflow-y-auto pt-2">
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
                  <span className={`text-sm font-semibold text-[#378ADD] truncate flex-1`}>{c.counterpart}</span>
                  <span className={`text-xs ${M} flex-shrink-0 ml-2`}>{c.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${M} truncate flex-1`}>{c.lastMsg}</p>
                  {c.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#185FA5] text-white text-xs flex items-center justify-center flex-shrink-0 ml-2">
                      {c.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Hilo del Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className={`px-5 py-3 border-b ${B} ${cardBg} flex items-center justify-between flex-shrink-0`}>
            <div>
              <p className={`text-sm font-semibold ${T}`}>{conv?.counterpart}</p>
            </div>
            <Badge color={conv?.status === "activa" ? "green" : "gray"}>{conv?.status}</Badge>
          </div>

          {/* Aviso de Privacidad Estudiante */}
          <div className={`px-5 py-2 text-xs flex items-center gap-2 ${isDark ? "bg-[#2a2416] text-[#e5b34a]" : "bg-[#fff8e6] text-[#b38600]"} flex-shrink-0`}>
            <Icon icon="mdi:shield-lock-outline" width={14} />
            Tus datos de contacto están protegidos. Esta conversación está mediada por el Centro Educacional.
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
            {msgs.map((msg, i) => {
              const isMe = msg.from === "estudiante";
              return (
                <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <span className={`text-xs ${M} mb-1`}>{msg.sender}</span>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                      isMe
                        ? "bg-[#185FA5] text-[#E6F1FB]"
                        : isDark ? "bg-[#313130] text-[#D3D1C7]" : "bg-[#F7F6F3] text-[#2C2C2A]"
                    }`}>
                      {msg.text}
                    </div>
                    <span className={`text-xs ${M} mt-1`}>{msg.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input para el Estudiante */}
          <form onSubmit={handleSendMessage} className={`px-5 py-3 border-t ${B} ${cardBg} flex gap-2 flex-shrink-0`}>
            <input
              type="text"
              placeholder={conv?.status === "activa" ? "Escribe un mensaje..." : "Conversación cerrada"}
              disabled={conv?.status !== "activa"}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className={`flex-1 px-4 py-2.5 rounded-full text-sm outline-none border transition-all focus:border-[#378ADD] ${
                isDark
                  ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                  : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
              } disabled:opacity-50`}
            />
            <button
              type="submit"
              disabled={conv?.status !== "activa"}
              className="w-10 h-10 rounded-full bg-[#185FA5] hover:bg-[#0C447C] text-white flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Icon icon="mdi:send" width={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}