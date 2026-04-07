import { useState } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Badge, PageHeader } from "../../components/ui";

// Mocks adaptados para la vista de la empresa
const conversations = [
  {
    id: 1,
    counterpart: "Felipe Rojas", // Con quién habla
    role: "Practicante Mecánico",
    lastMsg: "Hola Felipe, revisamos tu perfil y nos gustaría coordinar...",
    time: "10:32",
    unread: 0,
    status: "activa",
  },
  {
    id: 5,
    counterpart: "Daniela Perez",
    role: "Técnico Automotriz",
    lastMsg: "Estaré atenta a su respuesta.",
    time: "Ayer",
    unread: 1,
    status: "activa",
  },
];

const messagesMock = {
  1: [
    { from: "empresa", sender: "Tú", text: "Hola Felipe, revisamos tu perfil y nos parece muy completo. Tenemos una vacante de Practicante Mecánico.", time: "10:15" },
    { from: "estudiante", sender: "Felipe Rojas", text: "¡Buenas tardes! Me interesa mucho la posición. Tengo experiencia en diagnóstico con escáner OBD-II.", time: "10:20" },
    { from: "empresa", sender: "Tú", text: "Hola Felipe, revisamos tu perfil y nos gustaría coordinar una entrevista técnica esta semana.", time: "10:32" },
  ]
};

export default function EmpresaMensajeria() {
  const { isDark } = useDark();
  const [selected, setSelected] = useState(1);
  const [newMessage, setNewMessage] = useState("");
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
      from: "empresa",
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
        title="Mensajes con Candidatos"
        subtitle="Gestiona el contacto con los estudiantes para tus vacantes"
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
                  <span className={`text-sm font-semibold ${T} truncate flex-1`}>{c.counterpart}</span>
                  <span className={`text-xs ${M} flex-shrink-0 ml-2`}>{c.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#378ADD] truncate flex-1">{c.role}</span>
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

        {/* Hilo del Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className={`px-5 py-3 border-b ${B} ${cardBg} flex items-center justify-between flex-shrink-0`}>
            <div>
              <p className={`text-sm font-semibold ${T}`}>{conv?.counterpart}</p>
              <p className={`text-xs ${M}`}>Postulante a: {conv?.role}</p>
            </div>
            <Badge color={conv?.status === "activa" ? "green" : "gray"}>{conv?.status}</Badge>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
            {msgs.map((msg, i) => {
              const isMe = msg.from === "empresa";
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

          {/* Input para la Empresa */}
          <form onSubmit={handleSendMessage} className={`px-5 py-3 border-t ${B} ${cardBg} flex gap-2 flex-shrink-0`}>
            <input
              type="text"
              placeholder={conv?.status === "activa" ? "Escribe un mensaje al candidato..." : "Conversación cerrada"}
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