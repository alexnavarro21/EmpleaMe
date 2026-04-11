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

const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

export default function EstudianteMensajeria() {
  const { isDark } = useDark();
  const location = useLocation();

  // Tab: "empresas" | "estudiantes"
  const [tab, setTab] = useState("empresas");

  // Conversaciones con empresas
  const [convEmpresas, setConvEmpresas] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [mensajesEmpresa, setMensajesEmpresa] = useState([]);

  // Conversaciones directas (estudiante↔estudiante)
  const [convDirectas, setConvDirectas] = useState([]);
  const [selectedDirecta, setSelectedDirecta] = useState(null);
  const [mensajesDirecta, setMensajesDirecta] = useState([]);

  const [newMessage, setNewMessage] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const cardBg = isDark ? "bg-[#262624]" : "bg-white";

  // Cargar conversaciones iniciales
  useEffect(() => {
    const targetEmpresa = location.state?.conversacionId;
    const targetDirecta = location.state?.directaId;

    Promise.allSettled([getConversaciones(), getMensajesDirectos()])
      .then(([empRes, dirRes]) => {
        if (empRes.status === "fulfilled") {
          setConvEmpresas(empRes.value);
          if (targetEmpresa) {
            setTab("empresas");
            setSelectedEmpresa(targetEmpresa);
          } else if (!targetDirecta && empRes.value.length > 0) {
            setSelectedEmpresa(empRes.value[0].id);
          }
        }
        if (dirRes.status === "fulfilled") {
          setConvDirectas(dirRes.value);
          if (targetDirecta) {
            setTab("estudiantes");
            setSelectedDirecta(targetDirecta);
          }
        }
      })
      .finally(() => setLoadingConvs(false));
  }, []);

  // Cargar mensajes de empresa seleccionada
  useEffect(() => {
    if (!selectedEmpresa) return;
    setLoadingMsgs(true);
    getMensajes(selectedEmpresa)
      .then(setMensajesEmpresa)
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));
  }, [selectedEmpresa]);

  // Cargar mensajes de directa seleccionada
  useEffect(() => {
    if (!selectedDirecta) return;
    setLoadingMsgs(true);
    getMensajesDeDirecta(selectedDirecta)
      .then(setMensajesDirecta)
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));
  }, [selectedDirecta]);

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajesEmpresa, mensajesDirecta]);

  // Polling mensajes empresa
  useEffect(() => {
    if (!selectedEmpresa || tab !== "empresas") return;
    const interval = setInterval(() => {
      getMensajes(selectedEmpresa).then(setMensajesEmpresa).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedEmpresa, tab]);

  // Polling mensajes directos
  useEffect(() => {
    if (!selectedDirecta || tab !== "estudiantes") return;
    const interval = setInterval(() => {
      getMensajesDeDirecta(selectedDirecta).then(setMensajesDirecta).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedDirecta, tab]);

  const convEmpresa = convEmpresas.find((c) => c.id === selectedEmpresa);
  const convDirecta = convDirectas.find((c) => c.id === selectedDirecta);
  const activeConv = tab === "empresas" ? convEmpresa : convDirecta;
  const activeMessages = tab === "empresas" ? mensajesEmpresa : mensajesDirecta;
  const totalNoLeidos = [...convEmpresas, ...convDirectas].reduce((n, c) => n + (c.no_leidos || 0), 0);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    const selected = tab === "empresas" ? selectedEmpresa : selectedDirecta;
    if (!selected) return;

    setSending(true);
    try {
      if (tab === "empresas") {
        await enviarMensaje(selected, newMessage.trim());
        const updated = await getMensajes(selected);
        setMensajesEmpresa(updated);
        setConvEmpresas((prev) =>
          prev.map((c) =>
            c.id === selected
              ? { ...c, ultimo_mensaje: newMessage.trim(), ultimo_tiempo: new Date().toISOString(), no_leidos: 0 }
              : c
          )
        );
      } else {
        await enviarMensajeDirecto(selected, newMessage.trim());
        const updated = await getMensajesDeDirecta(selected);
        setMensajesDirecta(updated);
        setConvDirectas((prev) =>
          prev.map((c) =>
            c.id === selected
              ? { ...c, ultimo_mensaje: newMessage.trim(), ultimo_tiempo: new Date().toISOString(), no_leidos: 0 }
              : c
          )
        );
      }
      setNewMessage("");
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

  const conversations = tab === "empresas" ? convEmpresas : convDirectas;
  const selected = tab === "empresas" ? selectedEmpresa : selectedDirecta;
  const setSelected = tab === "empresas" ? setSelectedEmpresa : setSelectedDirecta;

  return (
    <div>
      <PageHeader
        title="Mis Mensajes"
        subtitle="Comunícate con empresas y otros estudiantes"
      />

      {/* Tabs */}
      <div className={`flex gap-1 mb-4 p-1 rounded-xl w-fit border ${B} ${cardBg}`}>
        {[
          { id: "empresas", icon: "mdi:office-building-outline", label: "Empresas",
            badge: convEmpresas.reduce((n, c) => n + (c.no_leidos || 0), 0) },
          { id: "estudiantes", icon: "mynaui:user-solid", label: "Estudiantes",
            badge: convDirectas.reduce((n, c) => n + (c.no_leidos || 0), 0) },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setNewMessage(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-[#0F4D8A] text-[#E6F1FB]"
                : `${M} hover:bg-[#0F4D8A]/10`
            }`}
          >
            <Icon icon={t.icon} width={15} />
            {t.label}
            {t.badge > 0 && (
              <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                tab === t.id ? "bg-white text-[#0F4D8A]" : "bg-[#0F4D8A] text-white"
              }`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={`rounded-xl border ${B} overflow-hidden flex`} style={{ height: "560px" }}>
        {/* Lista de Conversaciones */}
        <div className={`w-72 flex-shrink-0 border-r ${B} flex flex-col ${cardBg}`}>
          <div className="flex-1 overflow-y-auto pt-2">
            {conversations.length === 0 ? (
              <p className={`text-xs ${M} text-center py-8 px-4`}>
                {tab === "empresas"
                  ? "Aún no tienes conversaciones con empresas."
                  : "Aún no tienes conversaciones con otros estudiantes."}
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
                    <span className={`text-sm font-semibold truncate flex-1 ${
                      tab === "empresas" ? "text-[#378ADD]" : T
                    }`}>
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
          {!activeConv ? (
            <div className={`flex-1 flex items-center justify-center ${M}`}>
              <p className="text-sm">Selecciona una conversación</p>
            </div>
          ) : (
            <>
              <div className={`px-5 py-3 border-b ${B} ${cardBg} flex items-center justify-between flex-shrink-0`}>
                <div>
                  <p className={`text-sm font-semibold ${T}`}>{activeConv.contraparte}</p>
                  <p className={`text-xs ${M}`}>{tab === "empresas" ? "Empresa" : "Estudiante"}</p>
                </div>
                <Badge color="green">activa</Badge>
              </div>

              {tab === "empresas" && (
                <div className={`px-5 py-2 text-xs flex items-center gap-2 flex-shrink-0 ${
                  isDark ? "bg-[#2a2416] text-[#e5b34a]" : "bg-[#fff8e6] text-[#b38600]"
                }`}>
                  <Icon icon="mdi:shield-lock-outline" width={14} />
                  Tus datos de contacto están protegidos. Esta conversación está mediada por el Centro Educacional.
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {loadingMsgs ? (
                  <div className={`flex items-center justify-center py-8 ${M}`}>
                    <Icon icon="mdi:loading" width={20} className="animate-spin mr-2" />
                    Cargando...
                  </div>
                ) : activeMessages.length === 0 ? (
                  <p className={`text-xs ${M} text-center py-8`}>
                    No hay mensajes aún. ¡Inicia la conversación!
                  </p>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe = msg.remitente_id === usuario.id;
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
