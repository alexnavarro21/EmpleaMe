import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import {
  getConversaciones, getMensajes, enviarMensaje,
  getMensajesDirectos, getMensajesDeDirecta, enviarMensajeDirecto,
  getMediaUrl,
} from "../../services/api";

function MensajeBurbuja({ contenido }) {
  const match = contenido.match(/\[VACANTE_INVITACION:(\d+):(\d+)\]/);
  if (match) {
    const [, , empresaId] = match;
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

const ROL_LABEL = {
  empresa: "Empresa", estudiante: "Estudiante", colegio: "Colegio", slep: "SLEP",
};

function RolTag({ rol, isDark }) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
      isDark ? "bg-[#3a3a38] text-[#888780]" : "bg-[#ECEAE5] text-[#5F5E5A]"
    }`}>
      {ROL_LABEL[rol] || rol || "–"}
    </span>
  );
}

export default function EmpresaMensajeria() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const { isDark } = useDark();
  const location = useLocation();

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const cardBg = isDark ? "bg-[#262624]" : "bg-white";

  const initialConvId = location.state?.conversacionId ?? null;
  const initialDirectaId = location.state?.directaId ?? null;

  const [convCandidatos, setConvCandidatos] = useState([]);
  const [convDirectas, setConvDirectas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // { id, tipo: "candidato" | "directo" }
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const bottomRef = useRef(null);
  const lastMsgIdRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    Promise.all([
      getConversaciones().catch(() => []),
      getMensajesDirectos().catch(() => []),
    ]).then(([candidatos, directas]) => {
      setConvCandidatos(candidatos);
      setConvDirectas(directas);

      if (initialConvId && candidatos.some((c) => c.id === initialConvId)) {
        setSelected({ id: initialConvId, tipo: "candidato" });
      } else if (initialDirectaId && directas.some((c) => c.id === initialDirectaId)) {
        setSelected({ id: initialDirectaId, tipo: "directo" });
      } else {
        const all = [
          ...candidatos.map((c) => ({ id: c.id, tipo: "candidato", t: c.ultimo_tiempo })),
          ...directas.map((c) => ({ id: c.id, tipo: "directo", t: c.ultimo_tiempo })),
        ].sort((a, b) => new Date(b.t || 0) - new Date(a.t || 0));
        if (all.length > 0) setSelected({ id: all[0].id, tipo: all[0].tipo });
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingMsgs(true);
    clearInterval(pollRef.current);

    const fetch = selected.tipo === "candidato"
      ? () => getMensajes(selected.id)
      : () => getMensajesDeDirecta(selected.id);

    fetch().then(setMessages).catch(() => {}).finally(() => setLoadingMsgs(false));
    pollRef.current = setInterval(() => fetch().then(setMessages).catch(() => {}), 5000);
    return () => clearInterval(pollRef.current);
  }, [selected?.id, selected?.tipo]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastId = messages[messages.length - 1].id;
    if (lastId !== lastMsgIdRef.current) {
      lastMsgIdRef.current = lastId;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const allConvs = [
    ...convCandidatos.map((c) => ({
      id: c.id, tipo: "candidato",
      nombre: c.contraparte, foto: c.contraparte_foto,
      contraparteId: c.contraparte_id,
      tag: "estudiante",
      ultimo_mensaje: c.ultimo_mensaje, ultimo_tiempo: c.ultimo_tiempo,
      no_leidos: c.no_leidos,
    })),
    ...convDirectas.map((c) => ({
      id: c.id, tipo: "directo",
      nombre: c.contraparte, foto: c.foto_contraparte,
      tag: c.contraparte_rol,
      ultimo_mensaje: c.ultimo_mensaje, ultimo_tiempo: c.ultimo_tiempo,
      no_leidos: c.no_leidos,
    })),
  ].sort((a, b) => new Date(b.ultimo_tiempo || 0) - new Date(a.ultimo_tiempo || 0));

  const activeConv = allConvs.find(
    (c) => c.id === selected?.id && c.tipo === selected?.tipo
  );

  const handleSelect = (conv) => {
    setSelected({ id: conv.id, tipo: conv.tipo });
    setNewMessage("");
    if (conv.tipo === "candidato") {
      setConvCandidatos((prev) => prev.map((c) => c.id === conv.id ? { ...c, no_leidos: 0 } : c));
    } else {
      setConvDirectas((prev) => prev.map((c) => c.id === conv.id ? { ...c, no_leidos: 0 } : c));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selected || sending) return;
    setSending(true);
    setErrorEnvio("");
    try {
      if (selected.tipo === "candidato") {
        await enviarMensaje(selected.id, newMessage.trim());
        const updated = await getMensajes(selected.id);
        setMessages(updated);
        setConvCandidatos((prev) =>
          prev.map((c) => c.id === selected.id
            ? { ...c, ultimo_mensaje: newMessage.trim(), ultimo_tiempo: new Date().toISOString(), no_leidos: 0 }
            : c)
        );
      } else {
        await enviarMensajeDirecto(selected.id, newMessage.trim());
        const updated = await getMensajesDeDirecta(selected.id);
        setMessages(updated);
        setConvDirectas((prev) =>
          prev.map((c) => c.id === selected.id
            ? { ...c, ultimo_mensaje: newMessage.trim(), ultimo_tiempo: new Date().toISOString() }
            : c)
        );
      }
      setNewMessage("");
    } catch (err) {
      setErrorEnvio(err.message || "Error al enviar");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 flex overflow-hidden" style={{ top: "56px" }}>
      {/* Sidebar */}
      <div className={`w-72 flex-shrink-0 border-r ${B} flex flex-col ${cardBg}`}>
        <div className="flex-1 overflow-y-auto pt-2">
          {loading ? (
            <div className={`flex items-center justify-center h-full ${M}`}>
              <Icon icon="mdi:loading" width={22} className="animate-spin" />
            </div>
          ) : allConvs.length === 0 ? (
            <p className={`text-xs ${M} text-center py-8 px-4`}>
              Sin conversaciones aún. Inicia una desde el perfil de un candidato.
            </p>
          ) : allConvs.map((c) => {
            const isActive = selected?.id === c.id && selected?.tipo === c.tipo;
            return (
              <button
                key={`${c.tipo}-${c.id}`}
                onClick={() => handleSelect(c)}
                className={`w-full text-left px-3 py-3 border-b ${B} transition-colors ${
                  isActive
                    ? isDark ? "bg-[#1a2e42]" : "bg-[#E6F1FB]"
                    : isDark ? "hover:bg-[#313130]" : "hover:bg-[#F7F6F3]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {c.foto ? (
                    <img src={getMediaUrl(c.foto)} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#0F4D8A] flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold">
                      {(c.nombre || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-sm font-semibold truncate flex-1 ${T}`}>{c.nombre}</span>
                      <span className={`text-xs ${M} flex-shrink-0`}>{formatTime(c.ultimo_tiempo)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs ${M} truncate flex-1`}>{c.ultimo_mensaje || "Sin mensajes aún"}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <RolTag rol={c.tag} isDark={isDark} />
                        {c.no_leidos > 0 && (
                          <span className="w-4 h-4 rounded-full bg-[#0F4D8A] text-white text-xs flex items-center justify-center">
                            {c.no_leidos}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeConv ? (
          <div className={`flex-1 flex items-center justify-center ${M}`}>
            <p className="text-sm">Selecciona una conversación</p>
          </div>
        ) : (
          <>
            <div className={`px-5 py-3 border-b ${B} ${cardBg} flex items-center gap-3 flex-shrink-0`}>
              {activeConv.foto ? (
                <img src={getMediaUrl(activeConv.foto)} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#0F4D8A] flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold">
                  {(activeConv.nombre || "?")[0].toUpperCase()}
                </div>
              )}
              <div className="flex items-center gap-2">
                {activeConv.tipo === "candidato" && activeConv.contraparteId ? (
                  <Link
                    to={`/empresa/candidato/${activeConv.contraparteId}`}
                    className={`text-sm font-semibold hover:underline hover:text-[#378ADD] transition-colors ${T}`}
                  >
                    {activeConv.nombre}
                  </Link>
                ) : (
                  <span className={`text-sm font-semibold ${T}`}>{activeConv.nombre}</span>
                )}
                <RolTag rol={activeConv.tag} isDark={isDark} />
              </div>
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
                      <span className={`text-xs ${M} mb-1`}>{isMe ? "Tú" : activeConv.nombre}</span>
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
