import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Badge, PageHeader } from "../../components/ui";
import {
  getConversaciones, getMensajes, enviarMensaje,
  getMensajesDirectos, getMensajesDeDirecta, enviarMensajeDirecto,
} from "../../services/api";

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

// ── Panel candidatos (conversaciones empresa↔estudiante) ─────────────────────
function CandidatosPanel({ isDark, initialConvId }) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const cardBg = isDark ? "bg-[#262624]" : "bg-white";

  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const bottomRef = useRef(null);
  const lastMsgIdRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    getConversaciones()
      .then((data) => {
        setConversations(data);
        if (initialConvId && data.some((c) => c.id === initialConvId)) {
          setSelected(initialConvId);
        } else if (data.length > 0) {
          setSelected(data[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingMsgs(true);
    getMensajes(selected).then(setMessages).catch(() => {}).finally(() => setLoadingMsgs(false));
    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => getMensajes(selected).then(setMessages).catch(() => {}), 5000);
    return () => clearInterval(pollRef.current);
  }, [selected]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastId = messages[messages.length - 1].id;
    if (lastId !== lastMsgIdRef.current) {
      lastMsgIdRef.current = lastId;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const conv = conversations.find((c) => c.id === selected);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selected || sending) return;
    setSending(true);
    setErrorEnvio("");
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
      setErrorEnvio(err.message || "Error al enviar mensaje");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`rounded-xl border ${B} overflow-hidden flex`} style={{ height: "600px" }}>
      <div className={`w-72 flex-shrink-0 border-r ${B} flex flex-col ${cardBg}`}>
        <div className="flex-1 overflow-y-auto pt-2">
          {loadingConvs ? (
            <div className={`flex items-center justify-center h-full ${M}`}><Icon icon="mdi:loading" width={22} className="animate-spin" /></div>
          ) : conversations.length === 0 ? (
            <p className={`text-xs ${M} text-center py-8 px-4`}>
              Aún no tienes conversaciones. Inicia una desde el perfil de un candidato.
            </p>
          ) : conversations.map((c) => (
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
                <span className={`text-sm font-semibold ${T} truncate flex-1`}>{c.contraparte}</span>
                <span className={`text-xs ${M} flex-shrink-0 ml-2`}>{formatTime(c.ultimo_tiempo)}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-xs ${M} truncate flex-1`}>{c.ultimo_mensaje || "Sin mensajes aún"}</p>
                {c.no_leidos > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#0F4D8A] text-white text-xs flex items-center justify-center flex-shrink-0 ml-2">
                    {c.no_leidos}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

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
                <p className={`text-xs ${M} text-center py-8`}>No hay mensajes aún. ¡Inicia la conversación!</p>
              ) : messages.map((msg) => {
                const isMe = Number(msg.remitente_id) === Number(usuario.id);
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
                      <span className={`text-xs ${M} mt-1`}>{formatTime(msg.enviado_en)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {errorEnvio && (
              <p className="px-5 py-1 text-xs text-red-500 bg-red-50 dark:bg-red-900/20">{errorEnvio}</p>
            )}
            <form onSubmit={handleSend} className={`px-5 py-3 border-t ${B} ${cardBg} flex gap-2 flex-shrink-0`}>
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
  );
}

// ── Panel instituciones (mensajes_directos con colegios y SLEP) ──────────────
function InstitucionesPanel({ isDark, initialDirectaId }) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const cardBg = isDark ? "bg-[#262624]" : "bg-white";

  const [convs, setConvs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const lastMsgIdRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    getMensajesDirectos()
      .then((data) => {
        setConvs(data);
        if (initialDirectaId) {
          setSelected(initialDirectaId);
        } else if (data.length > 0) {
          setSelected(data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingMsgs(true);
    getMensajesDeDirecta(selected).then(setMessages).catch(() => {}).finally(() => setLoadingMsgs(false));
    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => getMensajesDeDirecta(selected).then(setMessages).catch(() => {}), 5000);
    return () => clearInterval(pollRef.current);
  }, [selected]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastId = messages[messages.length - 1].id;
    if (lastId !== lastMsgIdRef.current) {
      lastMsgIdRef.current = lastId;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const conv = convs.find((c) => c.id === selected);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selected || sending) return;
    setSending(true);
    try {
      await enviarMensajeDirecto(selected, newMessage.trim());
      setNewMessage("");
      const updated = await getMensajesDeDirecta(selected);
      setMessages(updated);
      setConvs((prev) =>
        prev.map((c) => c.id === selected ? { ...c, ultimo_mensaje: newMessage.trim(), ultimo_tiempo: new Date().toISOString() } : c)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`rounded-xl border ${B} overflow-hidden flex`} style={{ height: "600px" }}>
      <div className={`w-72 flex-shrink-0 border-r ${B} flex flex-col ${cardBg}`}>
        <div className="flex-1 overflow-y-auto pt-2">
          {loading ? (
            <div className={`flex items-center justify-center h-full ${M}`}><Icon icon="mdi:loading" width={22} className="animate-spin" /></div>
          ) : convs.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-full gap-2 ${M} px-4 text-center`}>
              <Icon icon="mdi:chat-outline" width={32} />
              <p className="text-xs">Sin mensajes con instituciones aún</p>
            </div>
          ) : convs.map((c) => (
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
                <span className={`text-sm font-semibold ${T} truncate flex-1`}>{c.contraparte}</span>
                <span className={`text-xs ${M} ml-2 flex-shrink-0`}>{formatTime(c.ultimo_tiempo)}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-xs ${M} truncate flex-1`}>{c.ultimo_mensaje || "Sin mensajes aún"}</p>
                {c.no_leidos > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#0F4D8A] text-white text-xs flex items-center justify-center flex-shrink-0 ml-2">
                    {c.no_leidos}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {!conv ? (
          <div className={`flex-1 flex items-center justify-center ${M}`}>
            <p className="text-sm">Selecciona una conversación</p>
          </div>
        ) : (
          <>
            <div className={`px-5 py-3 border-b ${B} ${cardBg} flex items-center justify-between flex-shrink-0`}>
              <div>
                <p className={`text-sm font-semibold ${T}`}>{conv.contraparte}</p>
                <p className={`text-xs ${M}`}>Mensaje directo</p>
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
                <p className={`text-xs ${M} text-center py-8`}>No hay mensajes aún. ¡Inicia la conversación!</p>
              ) : messages.map((msg) => {
                const isMe = Number(msg.remitente_id) === Number(usuario.id);
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <span className={`text-xs ${M} mb-1`}>{isMe ? "Tú" : conv.contraparte}</span>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? "bg-[#0F4D8A] text-[#E6F1FB]"
                          : isDark ? "bg-[#313130] text-[#D3D1C7]" : "bg-[#F7F6F3] text-[#2C2C2A]"
                      }`}>
                        {msg.contenido}
                      </div>
                      <span className={`text-xs ${M} mt-1`}>{formatTime(msg.enviado_en)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className={`px-5 py-3 border-t ${B} ${cardBg} flex gap-2 flex-shrink-0`}>
              <input
                type="text"
                placeholder="Escribe un mensaje..."
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
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function EmpresaMensajeria() {
  const { isDark } = useDark();
  const location = useLocation();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const cardBg = isDark ? "bg-[#262624]" : "bg-white";

  const initialConvId  = location.state?.conversacionId ?? null;
  const initialDirectaId = location.state?.directaId ?? null;
  const [tab, setTab] = useState(initialDirectaId ? "instituciones" : "candidatos");

  return (
    <div>
      <PageHeader
        title="Mensajería"
        subtitle="Comunícate con candidatos e instituciones"
      />

      <div className={`flex gap-1 mb-4 p-1 rounded-xl w-fit border ${B} ${cardBg}`}>
        {[
          { id: "candidatos",    icon: "mdi:account-group-outline",  label: "Candidatos" },
          { id: "instituciones", icon: "mdi:domain",                 label: "Instituciones" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? "bg-[#0F4D8A] text-[#E6F1FB]" : `${M} hover:bg-[#0F4D8A]/10`
            }`}
          >
            <Icon icon={t.icon} width={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "candidatos"    && <CandidatosPanel    isDark={isDark} initialConvId={initialConvId} />}
      {tab === "instituciones" && <InstitucionesPanel isDark={isDark} initialDirectaId={initialDirectaId} />}
    </div>
  );
}
