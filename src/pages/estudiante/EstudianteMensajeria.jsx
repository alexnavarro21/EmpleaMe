import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Badge, PageHeader } from "../../components/ui";
import {
  getConversaciones, getMensajes, enviarMensaje,
  getMensajesDirectos, getMensajesDeDirecta, enviarMensajeDirecto,
  getMediaUrl,
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

const ROL_LABEL = {
  empresa:    "Empresa",
  estudiante: "Estudiante",
  colegio:    "Colegio",
  slep:       "SLEP",
};

function RolTag({ rol, isDark }) {
  const label = ROL_LABEL[rol] || rol;
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
      isDark ? "bg-[#3a3a38] text-[#888780]" : "bg-[#ECEAE5] text-[#5F5E5A]"
    }`}>
      {label}
    </span>
  );
}

export default function EstudianteMensajeria() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const { isDark } = useDark();
  const location = useLocation();

  const [convEmpresas, setConvEmpresas] = useState([]);
  const [convDirectas, setConvDirectas] = useState([]);

  // conv unificada seleccionada: { id, esDirecta }
  const [selected, setSelected] = useState(null);
  const [mensajes, setMensajes] = useState([]);

  const [newMessage, setNewMessage] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const bottomRef = useRef(null);
  const lastMsgIdRef = useRef(null);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const cardBg = isDark ? "bg-[#262624]" : "bg-white";

  useEffect(() => {
    const targetEmpresa = location.state?.conversacionId;
    const targetDirecta = location.state?.directaId;

    Promise.allSettled([getConversaciones(), getMensajesDirectos()])
      .then(([empRes, dirRes]) => {
        const empresas = empRes.status === "fulfilled" ? empRes.value : [];
        const directas = dirRes.status === "fulfilled" ? dirRes.value : [];
        setConvEmpresas(empresas);
        setConvDirectas(directas);

        if (targetEmpresa) {
          setSelected({ id: targetEmpresa, esDirecta: false });
        } else if (targetDirecta) {
          setSelected({ id: targetDirecta, esDirecta: true });
        } else if (empresas.length > 0 || directas.length > 0) {
          // Seleccionar la más reciente entre ambas listas
          const todas = [
            ...empresas.map((c) => ({ ...c, esDirecta: false })),
            ...directas.map((c) => ({ ...c, esDirecta: true })),
          ].sort((a, b) => new Date(b.ultimo_tiempo || 0) - new Date(a.ultimo_tiempo || 0));
          if (todas.length > 0) setSelected({ id: todas[0].id, esDirecta: todas[0].esDirecta });
        }
      })
      .finally(() => setLoadingConvs(false));
  }, []);

  // Cargar mensajes cuando cambia la conversación seleccionada
  useEffect(() => {
    if (!selected) return;
    setLoadingMsgs(true);
    const loader = selected.esDirecta
      ? getMensajesDeDirecta(selected.id)
      : getMensajes(selected.id);
    loader
      .then(setMensajes)
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));
  }, [selected?.id, selected?.esDirecta]);

  // Scroll al último mensaje nuevo
  useEffect(() => {
    if (mensajes.length === 0) return;
    const lastId = mensajes[mensajes.length - 1].id;
    if (lastId !== lastMsgIdRef.current) {
      lastMsgIdRef.current = lastId;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes]);

  // Polling
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(() => {
      const loader = selected.esDirecta
        ? getMensajesDeDirecta(selected.id)
        : getMensajes(selected.id);
      loader.then(setMensajes).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [selected?.id, selected?.esDirecta]);

  // Lista unificada ordenada por recencia
  const todasLasConvs = [
    ...convEmpresas.map((c) => ({ ...c, esDirecta: false, contraparte_rol: "empresa", foto: c.contraparte_foto })),
    ...convDirectas.map((c) => ({ ...c, esDirecta: true, foto: c.foto_contraparte })),
  ].sort((a, b) => new Date(b.ultimo_tiempo || 0) - new Date(a.ultimo_tiempo || 0));

  const activeConv = selected
    ? todasLasConvs.find((c) => c.id === selected.id && c.esDirecta === selected.esDirecta)
    : null;

  const profileLink = activeConv
    ? activeConv.contraparte_rol === "empresa"
      ? `/empresa-publica/${activeConv.contraparte_id}`
      : activeConv.contraparte_rol === "colegio"
      ? `/colegio-publico/${activeConv.contraparte_id}`
      : `/estudiante/candidato/${activeConv.contraparte_id}`
    : "#";

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !selected) return;
    setSending(true);
    setErrorEnvio("");
    try {
      if (selected.esDirecta) {
        await enviarMensajeDirecto(selected.id, newMessage.trim());
        const updated = await getMensajesDeDirecta(selected.id);
        setMensajes(updated);
        setConvDirectas((prev) =>
          prev.map((c) =>
            c.id === selected.id
              ? { ...c, ultimo_mensaje: newMessage.trim(), ultimo_tiempo: new Date().toISOString(), no_leidos: 0 }
              : c
          )
        );
      } else {
        await enviarMensaje(selected.id, newMessage.trim());
        const updated = await getMensajes(selected.id);
        setMensajes(updated);
        setConvEmpresas((prev) =>
          prev.map((c) =>
            c.id === selected.id
              ? { ...c, ultimo_mensaje: newMessage.trim(), ultimo_tiempo: new Date().toISOString(), no_leidos: 0 }
              : c
          )
        );
      }
      setNewMessage("");
    } catch (err) {
      setErrorEnvio(err.message || "Error al enviar mensaje");
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
        title="Mis Mensajes"
        subtitle="Comunícate con empresas, tu colegio y otros estudiantes"
      />

      <div className={`rounded-xl border ${B} overflow-hidden flex`} style={{ height: "560px" }}>
        {/* Lista de conversaciones */}
        <div className={`w-72 flex-shrink-0 border-r ${B} flex flex-col ${cardBg}`}>
          <div className="flex-1 overflow-y-auto pt-2">
            {todasLasConvs.length === 0 ? (
              <p className={`text-xs ${M} text-center py-8 px-4`}>
                Aún no tienes conversaciones.
              </p>
            ) : (
              todasLasConvs.map((c) => {
                const isActive = selected?.id === c.id && selected?.esDirecta === c.esDirecta;
                return (
                  <button
                    key={`${c.esDirecta ? "d" : "e"}-${c.id}`}
                    onClick={() => {
                      setSelected({ id: c.id, esDirecta: c.esDirecta });
                      setNewMessage("");
                      (c.esDirecta ? setConvDirectas : setConvEmpresas)((prev) =>
                        prev.map((x) => x.id === c.id ? { ...x, no_leidos: 0 } : x)
                      );
                    }}
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
                          {(c.contraparte || "?")[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-sm font-semibold truncate flex-1 ${T}`}>
                            {c.contraparte}
                          </span>
                          <span className={`text-xs ${M} flex-shrink-0`}>
                            {formatTime(c.ultimo_tiempo)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs ${M} truncate flex-1`}>
                            {c.ultimo_mensaje || "Sin mensajes aún"}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <RolTag rol={c.contraparte_rol} isDark={isDark} />
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
              })
            )}
          </div>
        </div>

        {/* Hilo del chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeConv ? (
            <div className={`flex-1 flex items-center justify-center ${M}`}>
              <p className="text-sm">Selecciona una conversación</p>
            </div>
          ) : (
            <>
              {/* Header del chat */}
              <div className={`px-5 py-3 border-b ${B} ${cardBg} flex items-center justify-between flex-shrink-0`}>
                <div className="flex items-center gap-3">
                  {activeConv.foto ? (
                    <img src={getMediaUrl(activeConv.foto)} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#0F4D8A] flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold">
                      {(activeConv.contraparte || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={profileLink}
                        className={`text-sm font-semibold hover:underline hover:text-[#378ADD] transition-colors ${T}`}
                      >
                        {activeConv.contraparte}
                      </Link>
                      <RolTag rol={activeConv.contraparte_rol} isDark={isDark} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Aviso privacidad solo para empresa */}
              {!activeConv.esDirecta && (
                <div className={`px-5 py-2 text-xs flex items-center gap-2 flex-shrink-0 ${
                  isDark ? "bg-[#2a2416] text-[#e5b34a]" : "bg-[#fff8e6] text-[#b38600]"
                }`}>
                  <Icon icon="mdi:shield-lock-outline" width={14} />
                  Tus datos de contacto están protegidos. Esta conversación está mediada por el Centro Educacional.
                </div>
              )}

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {loadingMsgs ? (
                  <div className={`flex items-center justify-center py-8 ${M}`}>
                    <Icon icon="mdi:loading" width={20} className="animate-spin mr-2" />
                    Cargando...
                  </div>
                ) : mensajes.length === 0 ? (
                  <p className={`text-xs ${M} text-center py-8`}>
                    No hay mensajes aún. ¡Inicia la conversación!
                  </p>
                ) : (
                  mensajes.map((msg) => {
                    const isMe = Number(msg.remitente_id) === Number(usuario.id);
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <span className={`text-xs ${M} mb-1`}>{isMe ? "Tú" : activeConv.contraparte}</span>
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
                  })
                )}
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
    </div>
  );
}
