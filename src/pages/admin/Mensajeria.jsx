import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Badge, PageHeader } from "../../components/ui";
import {
  getConversaciones, getMensajes, getNotasAdmin, agregarNotaAdmin,
  getMensajesDirectos, getMensajesDeDirecta, enviarMensajeDirecto,
} from "../../services/api";

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
}

function formatFecha(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Panel supervisión (solo lectura + notas) ──────────────────────────────────
function SupervisionPanel({ isDark }) {
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const cardBg = isDark ? "bg-[#262624]" : "bg-white";

  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [search, setSearch] = useState("");
  const [todasNotas, setTodasNotas] = useState([]);
  const [notaTexto, setNotaTexto] = useState("");
  const [agregando, setAgregando] = useState(false);
  const [agregadoOk, setAgregadoOk] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    getConversaciones()
      .then((data) => { setConversations(data); if (data.length > 0) setSelected(data[0].id); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingMsgs(true);
    getMensajes(selected).then(setMessages).catch(() => {}).finally(() => setLoadingMsgs(false));
    getNotasAdmin(selected).then(setTodasNotas).catch(() => {});
    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => getMensajes(selected).then(setMessages).catch(() => {}), 10000);
    return () => clearInterval(pollRef.current);
  }, [selected]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleAgregarNota() {
    if (!selected || !notaTexto.trim()) return;
    setAgregando(true);
    try {
      await agregarNotaAdmin(selected, notaTexto);
      setNotaTexto("");
      setAgregadoOk(true);
      setTimeout(() => setAgregadoOk(false), 2000);
      const data = await getNotasAdmin(selected);
      setTodasNotas(data);
    } catch { /* silently fail */ } finally { setAgregando(false); }
  }

  const filteredConvs = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (c.nombre_estudiante || "").toLowerCase().includes(q) || (c.nombre_empresa || "").toLowerCase().includes(q);
  });
  const conv = conversations.find((c) => c.id === selected);

  return (
    <div className={`rounded-xl border ${B} overflow-hidden flex`} style={{ height: "600px" }}>
      {/* Lista */}
      <div className={`w-72 flex-shrink-0 border-r ${B} flex flex-col ${cardBg}`}>
        <div className={`p-3 border-b ${B}`}>
          <div className="relative">
            <Icon icon="mdi:search" width={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${M}`} />
            <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none border focus:border-[#378ADD] ${isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]" : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"}`}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className={`flex items-center justify-center h-full ${M}`}><Icon icon="mdi:loading" width={22} className="animate-spin" /></div>
          ) : filteredConvs.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-full gap-2 ${M} px-4 text-center`}>
              <Icon icon="mdi:chat-outline" width={32} />
              <p className="text-xs">Sin conversaciones de tus estudiantes</p>
            </div>
          ) : filteredConvs.map((c) => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className={`w-full text-left px-4 py-3 border-b ${B} transition-colors ${selected === c.id ? (isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]") : (isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]")}`}>
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-xs font-medium ${T} truncate flex-1`}>{c.nombre_estudiante || "Estudiante"}</span>
                <span className={`text-xs ${M} flex-shrink-0 ml-2`}>{formatTime(c.ultimo_tiempo)}</span>
              </div>
              <span className="text-xs text-[#378ADD] truncate block">{c.nombre_empresa || "Empresa"}</span>
              <p className={`text-xs ${M} truncate mt-0.5`}>{c.ultimo_mensaje || "Sin mensajes"}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Mensajes (read-only) */}
      <div className="flex-1 flex flex-col min-w-0">
        {!conv ? (
          <div className={`flex-1 flex flex-col items-center justify-center ${M}`}>
            <Icon icon="mdi:chat-outline" width={48} className="mb-3 opacity-40" />
            <p className="text-sm">Selecciona una conversación</p>
          </div>
        ) : (
          <>
            <div className={`px-5 py-3 border-b ${B} ${cardBg} flex items-center justify-between flex-shrink-0`}>
              <div>
                <p className={`text-sm font-semibold ${T}`}>{conv.nombre_estudiante} — {conv.nombre_empresa}</p>
                <p className={`text-xs ${M}`}>Supervisión · {messages.length} mensajes</p>
              </div>
              <Badge color="green">activa</Badge>
            </div>
            <div className={`px-5 py-2 text-xs flex items-center gap-2 flex-shrink-0 ${isDark ? "bg-[#1a2e42] text-[#B5D4F4]" : "bg-[#E6F1FB] text-[#0F4D8A]"}`}>
              <Icon icon="mdi:information-outline" width={14} />
              Vista de supervisión — los participantes no ven tu presencia
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {loadingMsgs ? (
                <div className={`flex items-center justify-center h-full ${M}`}><Icon icon="mdi:loading" width={24} className="animate-spin" /></div>
              ) : messages.length === 0 ? (
                <div className={`flex items-center justify-center h-full ${M}`}><p className="text-sm">Sin mensajes</p></div>
              ) : messages.map((msg, i) => {
                const isEmpresa = msg.remitente_rol === "empresa";
                return (
                  <div key={i} className={`flex ${isEmpresa ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-xs flex flex-col ${isEmpresa ? "items-start" : "items-end"}`}>
                      <span className={`text-xs ${M} mb-1`}>{isEmpresa ? conv.nombre_empresa : conv.nombre_estudiante}</span>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${isEmpresa ? (isDark ? "bg-[#313130] text-[#D3D1C7]" : "bg-[#F7F6F3] text-[#2C2C2A]") : "bg-[#0F4D8A] text-[#E6F1FB]"}`}>
                        {msg.contenido}
                      </div>
                      <span className={`text-xs ${M} mt-1`}>{formatTime(msg.enviado_en)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>

      {/* Notas */}
      <div className={`w-64 flex-shrink-0 border-l ${B} flex flex-col ${cardBg}`}>
        <div className={`px-4 py-3 border-b ${B} flex items-center gap-2`}>
          <Icon icon="mdi:note-edit-outline" width={16} className="text-[#378ADD]" />
          <span className={`text-sm font-semibold ${T}`}>Notas internas</span>
        </div>
        {!selected ? (
          <div className={`flex-1 flex flex-col items-center justify-center gap-2 ${M} px-4 text-center`}>
            <Icon icon="mdi:note-outline" width={28} className="opacity-30" />
            <p className="text-xs">Selecciona una conversación</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className={`p-4 flex flex-col gap-2 flex-shrink-0 border-b ${B}`}>
              <textarea value={notaTexto} onChange={(e) => setNotaTexto(e.target.value)} placeholder="Escribe una nota..." rows={4}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAgregarNota(); }}
                className={`w-full px-3 py-2 rounded-lg text-xs outline-none border resize-none focus:border-[#378ADD] ${isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]" : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"}`}
              />
              <button onClick={handleAgregarNota} disabled={agregando || !notaTexto.trim()}
                className={`w-full py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 ${agregadoOk ? "bg-green-600 text-white" : notaTexto.trim() ? "bg-[#0F4D8A] hover:bg-[#0A3A6A] text-[#E6F1FB]" : (isDark ? "bg-[#313130] text-[#5F5E5A] cursor-not-allowed" : "bg-[#F7F6F3] text-[#B4B2A9] cursor-not-allowed")}`}>
                {agregando ? <><Icon icon="mdi:loading" width={13} className="animate-spin" />Agregando...</> : agregadoOk ? <><Icon icon="mdi:check" width={13} />Nota agregada</> : <><Icon icon="mdi:plus" width={13} />Agregar nota</>}
              </button>
              <p className={`text-xs ${M} opacity-60 text-center`}>Ctrl+Enter para agregar</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {todasNotas.length === 0 ? (
                <div className={`px-4 py-8 text-center ${M}`}>
                  <Icon icon="mdi:note-outline" width={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Sin notas aún</p>
                </div>
              ) : todasNotas.map((nota) => (
                <div key={nota.id} className={`px-4 py-3 border-b ${B} last:border-0 ${nota.es_propia ? (isDark ? "bg-[#0F4D8A]/10" : "bg-[#EFF6FF]") : ""}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold ${nota.es_propia ? "text-[#378ADD]" : T}`}>{nota.es_propia ? "Tú" : nota.admin_nombre}</span>
                    <span className={`text-xs ${M} opacity-60`}>{formatFecha(nota.actualizado_en)}</span>
                  </div>
                  <p className={`text-xs ${M} leading-relaxed`}>{nota.contenido}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Panel mensajes directos (bidireccional) ───────────────────────────────────
function DirectosPanel({ isDark, initialDirectaId }) {
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
      setConvs((prev) => prev.map((c) => c.id === selected ? { ...c, ultimo_mensaje: newMessage.trim(), ultimo_tiempo: new Date().toISOString() } : c));
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`rounded-xl border ${B} overflow-hidden flex`} style={{ height: "600px" }}>
      {/* Lista */}
      <div className={`w-72 flex-shrink-0 border-r ${B} flex flex-col ${cardBg}`}>
        <div className="flex-1 overflow-y-auto pt-2">
          {loading ? (
            <div className={`flex items-center justify-center h-full ${M}`}><Icon icon="mdi:loading" width={22} className="animate-spin" /></div>
          ) : convs.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-full gap-2 ${M} px-4 text-center`}>
              <Icon icon="mdi:chat-outline" width={32} />
              <p className="text-xs">Sin mensajes directos aún</p>
            </div>
          ) : convs.map((c) => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className={`w-full text-left px-4 py-3 border-b ${B} transition-colors ${selected === c.id ? (isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]") : (isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]")}`}>
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-sm font-semibold ${T} truncate flex-1`}>{c.contraparte}</span>
                <span className={`text-xs ${M} ml-2 flex-shrink-0`}>{formatTime(c.ultimo_tiempo)}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-xs ${M} truncate flex-1`}>{c.ultimo_mensaje || "Sin mensajes aún"}</p>
                {c.no_leidos > 0 && <span className="w-4 h-4 rounded-full bg-[#0F4D8A] text-white text-xs flex items-center justify-center flex-shrink-0 ml-2">{c.no_leidos}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {!conv ? (
          <div className={`flex-1 flex items-center justify-center ${M}`}><p className="text-sm">Selecciona una conversación</p></div>
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
                <div className={`flex items-center justify-center py-8 ${M}`}><Icon icon="mdi:loading" width={20} className="animate-spin mr-2" />Cargando...</div>
              ) : messages.length === 0 ? (
                <p className={`text-xs ${M} text-center py-8`}>No hay mensajes aún. ¡Inicia la conversación!</p>
              ) : messages.map((msg) => {
                const isMe = Number(msg.remitente_id) === Number(usuario.id);
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <span className={`text-xs ${M} mb-1`}>{isMe ? "Tú" : conv.contraparte}</span>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-[#0F4D8A] text-[#E6F1FB]" : (isDark ? "bg-[#313130] text-[#D3D1C7]" : "bg-[#F7F6F3] text-[#2C2C2A]")}`}>
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
              <input type="text" placeholder="Escribe un mensaje..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                className={`flex-1 px-4 py-2.5 rounded-full text-sm outline-none border focus:border-[#378ADD] ${isDark ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]" : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"}`}
              />
              <button type="submit" disabled={sending || !newMessage.trim()}
                className="w-10 h-10 rounded-full bg-[#0F4D8A] hover:bg-[#0A3A6A] text-white flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0">
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
export default function AdminMensajeria() {
  const { isDark } = useDark();
  const location = useLocation();
  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const cardBg = isDark ? "bg-[#262624]" : "bg-white";

  const initialDirectaId = location.state?.directaId ?? null;
  const [tab, setTab] = useState(initialDirectaId ? "directos" : "supervision");

  return (
    <div>
      <PageHeader title="Mensajería" subtitle="Supervisión de conversaciones y mensajes directos" />

      <div className={`flex gap-1 mb-4 p-1 rounded-xl w-fit border ${B} ${cardBg}`}>
        {[
          { id: "supervision", icon: "mdi:shield-eye-outline", label: "Supervisión" },
          { id: "directos",    icon: "mdi:message-text-outline", label: "Mensajes directos" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-[#0F4D8A] text-[#E6F1FB]" : `${M} hover:bg-[#0F4D8A]/10`}`}>
            <Icon icon={t.icon} width={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "supervision" && <SupervisionPanel isDark={isDark} />}
      {tab === "directos"    && <DirectosPanel    isDark={isDark} initialDirectaId={initialDirectaId} />}
    </div>
  );
}
