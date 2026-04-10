import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Badge, PageHeader } from "../../components/ui";
import { getConversaciones, getMensajes } from "../../services/api";

function timeLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
}

export default function AdminMensajeria() {
  const { isDark } = useDark();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [search, setSearch] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]" : "bg-[#F7F6F3]";
  const cardBg = isDark ? "bg-[#262624]" : "bg-white";

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selected) {
      loadMessages(selected);
      clearInterval(pollRef.current);
      pollRef.current = setInterval(() => loadMessages(selected), 10000);
    }
    return () => clearInterval(pollRef.current);
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations() {
    try {
      const data = await getConversaciones();
      setConversations(data);
      if (data.length > 0 && !selected) setSelected(data[0].id);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConvs(false);
    }
  }

  async function loadMessages(convId) {
    setLoadingMsgs(true);
    try {
      const data = await getMensajes(convId);
      setMessages(data);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }

  const filteredConvs = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.nombre_estudiante || "").toLowerCase().includes(q) ||
      (c.nombre_empresa || "").toLowerCase().includes(q)
    );
  });

  const conv = conversations.find((c) => c.id === selected);

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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none border transition-all focus:border-[#378ADD] ${
                  isDark
                    ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                    : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
                }`}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className={`flex items-center justify-center h-full ${M}`}>
                <Icon icon="mdi:loading" width={22} className="animate-spin" />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className={`flex flex-col items-center justify-center h-full gap-2 ${M} px-4 text-center`}>
                <Icon icon="mdi:chat-outline" width={32} />
                <p className="text-xs">No hay conversaciones activas</p>
              </div>
            ) : (
              filteredConvs.map((c) => (
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
                    <span className={`text-xs font-medium ${T} truncate flex-1`}>
                      {c.nombre_estudiante || "Estudiante"}
                    </span>
                    <span className={`text-xs ${M} flex-shrink-0 ml-2`}>
                      {timeLabel(c.ultimo_tiempo)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#378ADD] truncate flex-1">
                      {c.nombre_empresa || "Empresa"}
                    </span>
                    {c.no_leidos > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#0F4D8A] text-white text-xs flex items-center justify-center flex-shrink-0 ml-2">
                        {c.no_leidos}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${M} truncate mt-0.5`}>{c.ultimo_mensaje || "Sin mensajes"}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selected || !conv ? (
            <div className={`flex-1 flex flex-col items-center justify-center ${M}`}>
              <Icon icon="mdi:chat-outline" width={48} className="mb-3 opacity-40" />
              <p className="text-sm">Selecciona una conversación</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className={`px-5 py-3 border-b ${B} ${cardBg} flex items-center justify-between flex-shrink-0`}>
                <div>
                  <p className={`text-sm font-semibold ${T}`}>
                    {conv.nombre_estudiante} — {conv.nombre_empresa}
                  </p>
                  <p className={`text-xs ${M}`}>
                    Supervisión de admin · {messages.length} mensajes
                  </p>
                </div>
                <Badge color="green">activa</Badge>
              </div>

              {/* Admin notice */}
              <div className={`px-5 py-2 text-xs flex items-center gap-2 flex-shrink-0 ${
                isDark ? "bg-[#1a2e42] text-[#B5D4F4]" : "bg-[#E6F1FB] text-[#0F4D8A]"
              }`}>
                <Icon icon="mdi:information-outline" width={14} />
                Como administrador puedes ver esta conversación, pero los participantes no ven tu presencia
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {loadingMsgs ? (
                  <div className={`flex items-center justify-center h-full ${M}`}>
                    <Icon icon="mdi:loading" width={24} className="animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className={`flex items-center justify-center h-full ${M}`}>
                    <p className="text-sm">Sin mensajes en esta conversación</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isEmpresa = msg.remitente_rol === "empresa";
                    return (
                      <div key={i} className={`flex ${isEmpresa ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-xs flex flex-col ${isEmpresa ? "items-start" : "items-end"}`}>
                          <span className={`text-xs ${M} mb-1`}>
                            {isEmpresa ? conv.nombre_empresa : conv.nombre_estudiante}
                          </span>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                            isEmpresa
                              ? isDark ? "bg-[#313130] text-[#D3D1C7]" : "bg-[#F7F6F3] text-[#2C2C2A]"
                              : "bg-[#0F4D8A] text-[#E6F1FB]"
                          }`}>
                            {msg.contenido}
                          </div>
                          <span className={`text-xs ${M} mt-1`}>
                            {timeLabel(msg.enviado_en)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
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
                    className="px-4 py-2 bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB] rounded-lg text-sm transition-colors flex-shrink-0"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
