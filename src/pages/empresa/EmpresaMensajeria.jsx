import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Badge, PageHeader } from "../../components/ui";
import { getConversaciones, getMensajes, enviarMensaje } from "../../services/api";

function MensajeBurbuja({ contenido }) {
  const match = contenido.match(/\[VACANTE_INVITACION:(\d+):(\d+)\]/);
  if (match) {
    const [, vacanteId, empresaId] = match;
    const texto = contenido.replace(/\n?\[VACANTE_INVITACION:\d+:\d+\]/, "").trim();
    return (
      <div>
        <p className="mb-2">{texto}</p>
        <Link
          to={`/empresa-publica/${empresaId}`}
          className="inline-flex items-center gap-1 text-xs font-semibold underline opacity-90 hover:opacity-100"
        >
          Ver vacante →
        </Link>
      </div>
    );
  }
  return contenido;
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "2-digit", month: "short" });
}

const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

export default function EmpresaMensajeria() {
  const { isDark } = useDark();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const cardBg = isDark ? "bg-[#262624]" : "bg-white";

  // Cargar conversaciones
  useEffect(() => {
    const targetId = location.state?.conversacionId;
    getConversaciones()
      .then((data) => {
        setConversations(data);
        if (targetId && data.some((c) => c.id === targetId)) {
          setSelected(targetId);
        } else if (data.length > 0) {
          setSelected(data[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingConvs(false));
  }, []);

  // Cargar mensajes al seleccionar conversación
  useEffect(() => {
    if (!selected) return;
    setLoadingMsgs(true);
    getMensajes(selected)
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));
  }, [selected]);

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling cada 5 segundos para mensajes nuevos
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(() => {
      getMensajes(selected).then(setMessages).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [selected]);

  const conv = conversations.find((c) => c.id === selected);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selected || sending) return;
    setSending(true);
    try {
      await enviarMensaje(selected, newMessage.trim());
      setNewMessage("");
      const updated = await getMensajes(selected);
      setMessages(updated);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selected
            ? { ...c, ultimo_mensaje: newMessage.trim(), ultimo_tiempo: new Date().toISOString(), no_leidos: 0 }
            : c
        )
      );
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    } finally {
      setSending(false);
    }
  };

  if (loadingConvs) {
    return (
      <div className={`flex items-center justify-center py-24 ${M}`}>
        <Icon icon="mdi:loading" width={28} className="animate-spin mr-2" />
        Cargando mensajes...
      </div>
    );
  }

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
            {conversations.length === 0 ? (
              <p className={`text-xs ${M} text-center py-8 px-4`}>
                Aún no tienes conversaciones. Inicia una desde el perfil de un estudiante.
              </p>
            ) : (
              conversations.map((c) => (
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
                    <span className={`text-sm font-semibold ${T} truncate flex-1`}>
                      {c.contraparte}
                    </span>
                    <span className={`text-xs ${M} flex-shrink-0 ml-2`}>
                      {formatTime(c.ultimo_tiempo)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${M} truncate flex-1`}>
                      {c.ultimo_mensaje || "Sin mensajes aún"}
                    </p>
                    {c.no_leidos > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#0F4D8A] text-white text-xs flex items-center justify-center flex-shrink-0 ml-2">
                        {c.no_leidos}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Hilo del Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {!conv ? (
            <div className={`flex-1 flex items-center justify-center ${M}`}>
              <p className="text-sm">Selecciona una conversación</p>
            </div>
          ) : (
            <>
              <div className={`px-5 py-3 border-b ${B} ${cardBg} flex items-center justify-between flex-shrink-0`}>
                <div>
                  <Link
                    to={`/empresa/candidato/${conv.contraparte_id}`}
                    className={`text-sm font-semibold hover:underline hover:text-[#378ADD] transition-colors ${T}`}
                  >
                    {conv.contraparte}
                  </Link>
                  <p className={`text-xs ${M}`}>Candidato</p>
                </div>
                <Badge color="green">activa</Badge>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {loadingMsgs ? (
                  <div className={`flex items-center justify-center py-8 ${M}`}>
                    <Icon icon="mdi:loading" width={20} className="animate-spin mr-2" />
                    Cargando...
                  </div>
                ) : messages.length === 0 ? (
                  <p className={`text-xs ${M} text-center py-8`}>
                    No hay mensajes aún. ¡Inicia la conversación!
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.remitente_id === usuario.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <span className={`text-xs ${M} mb-1`}>{isMe ? "Tú" : conv.contraparte}</span>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                            isMe
                              ? "bg-[#0F4D8A] text-[#E6F1FB]"
                              : isDark ? "bg-[#313130] text-[#D3D1C7]" : "bg-[#F7F6F3] text-[#2C2C2A]"
                          }`}>
                            <MensajeBurbuja contenido={msg.contenido} />
                          </div>
                          <span className={`text-xs ${M} mt-1`}>
                            {formatTime(msg.enviado_en)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSendMessage} className={`px-5 py-3 border-t ${B} ${cardBg} flex gap-2 flex-shrink-0`}>
                <input
                  type="text"
                  placeholder="Escribe un mensaje al candidato..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className={`flex-1 px-4 py-2.5 rounded-full text-sm outline-none border transition-all focus:border-[#378ADD] ${
                    isDark
                      ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                      : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
                  }`}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="w-10 h-10 rounded-full bg-[#0F4D8A] hover:bg-[#0A3A6A] text-white flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  <Icon icon={sending ? "mdi:loading" : "mdi:send"} width={18} className={sending ? "animate-spin" : ""} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
