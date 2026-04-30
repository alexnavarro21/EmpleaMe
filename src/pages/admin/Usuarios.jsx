import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useDark } from "../../context/DarkModeContext";
import { Card, PageHeader } from "../../components/ui";
import {
  getUsuariosAdmin,
  marcarEgresado,
  cambiarContrasenaEstudiante,
  eliminarUsuario,
} from "../../services/api";

const NIVELES = ["1° Medio", "2° Medio", "3° Medio", "4° Medio"];

function AccionesDropdown({ userId, isDark, onEliminado }) {
  const [open, setOpen]           = useState(false);
  const [modo, setModo]           = useState("idle"); // idle | egresar | pwd | eliminar
  const [accion, setAccion]       = useState("idle"); // idle | loading | ok | error | no_registro
  const [nuevaPwd, setNuevaPwd]   = useState("");
  const [pwdCargando, setPwdCargando] = useState(false);
  const [pwdMsg, setPwdMsg]       = useState(""); // "ok:..." | "error:..."
  const ref = useRef(null);

  const T  = isDark ? "text-[#D3D1C7]"  : "text-[#2C2C2A]";
  const M  = isDark ? "text-[#888780]"  : "text-[#5F5E5A]";
  const B  = isDark ? "border-[#3a3a38]": "border-[#D3D1C7]";
  const BG = isDark ? "bg-[#262624]"    : "bg-white";
  const S  = isDark ? "bg-[#313130]"    : "bg-[#F7F6F3]";

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEgresar = async () => {
    setAccion("loading");
    try {
      await marcarEgresado(userId);
      setAccion("ok");
      setModo("idle");
    } catch (err) {
      setAccion(err.message?.includes("No hay registro") ? "no_registro" : "error");
      setModo("idle");
    }
  };

  const handleCambiarPwd = async (e) => {
    e.preventDefault();
    if (nuevaPwd.length < 6) { setPwdMsg("error:Mínimo 6 caracteres"); return; }
    setPwdCargando(true);
    setPwdMsg("");
    try {
      await cambiarContrasenaEstudiante(userId, nuevaPwd);
      setPwdMsg("ok:Contraseña actualizada");
      setNuevaPwd("");
      setTimeout(() => { setModo("idle"); setPwdMsg(""); }, 1500);
    } catch (err) {
      setPwdMsg("error:" + err.message);
    } finally {
      setPwdCargando(false);
    }
  };

  const handleEliminar = async () => {
    setAccion("loading");
    try {
      await eliminarUsuario(userId);
      onEliminado(userId);
    } catch (err) {
      setAccion("error");
      setModo("idle");
    }
  };

  // Estado: egresado con éxito
  if (accion === "ok") {
    return (
      <div className="flex items-center gap-2">
        <a href={`/admin/candidato/${userId}`} className="text-xs text-[#378ADD] hover:underline">Ver perfil</a>
        <span className="text-xs text-green-500 flex items-center gap-1">
          <Icon icon="mdi:check-circle-outline" width={13} />
          Egresado
        </span>
      </div>
    );
  }

  // Modo: confirmar egreso
  if (modo === "egresar") {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs ${B} ${BG}`}>
        <span className={M}>¿Marcar egresado?</span>
        <button
          onClick={handleEgresar}
          disabled={accion === "loading"}
          className="text-amber-500 hover:text-amber-600 font-medium disabled:opacity-50"
        >
          {accion === "loading" ? <Icon icon="mdi:loading" width={12} className="animate-spin" /> : "Sí"}
        </button>
        <span className={M}>·</span>
        <button onClick={() => setModo("idle")} className={`${M} hover:text-red-400`}>No</button>
      </div>
    );
  }

  // Modo: confirmar eliminar
  if (modo === "eliminar") {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs border-red-400/50 ${BG}`}>
        <span className="text-red-400">¿Eliminar usuario?</span>
        <button
          onClick={handleEliminar}
          disabled={accion === "loading"}
          className="text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
        >
          {accion === "loading" ? <Icon icon="mdi:loading" width={12} className="animate-spin" /> : "Sí"}
        </button>
        <span className={M}>·</span>
        <button onClick={() => setModo("idle")} className={`${M} hover:text-[#378ADD]`}>No</button>
      </div>
    );
  }

  // Modo: cambiar contraseña
  if (modo === "pwd") {
    return (
      <form onSubmit={handleCambiarPwd} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs ${B} ${BG}`}>
        <input
          type="password"
          value={nuevaPwd}
          onChange={(e) => setNuevaPwd(e.target.value)}
          placeholder="Nueva contraseña"
          autoFocus
          className={`text-xs outline-none bg-transparent w-28 ${M}`}
        />
        {pwdMsg ? (
          <span className={pwdMsg.startsWith("ok:") ? "text-green-500" : "text-red-400"}>
            {pwdMsg.replace(/^(ok:|error:)/, "")}
          </span>
        ) : (
          <>
            <button type="submit" disabled={pwdCargando} className="text-[#378ADD] hover:text-[#0F4D8A] font-medium disabled:opacity-50">
              {pwdCargando ? <Icon icon="mdi:loading" width={12} className="animate-spin" /> : "Guardar"}
            </button>
            <span className={M}>·</span>
            <button type="button" onClick={() => setModo("idle")} className={`${M} hover:text-red-400`}>✕</button>
          </>
        )}
      </form>
    );
  }

  // Estado idle: botón de 3 puntos + dropdown
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`p-1.5 rounded-lg transition-colors ${
          isDark
            ? "text-[#888780] hover:bg-[#313130] hover:text-[#D3D1C7]"
            : "text-[#888780] hover:bg-[#F7F6F3] hover:text-[#2C2C2A]"
        }`}
      >
        <Icon icon="mdi:dots-vertical" width={18} />
      </button>

      {open && (
        <div className={`absolute right-0 z-20 mt-1 w-44 rounded-xl border shadow-lg py-1 ${B} ${BG}`}>
          <a
            href={`/admin/candidato/${userId}`}
            className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
              isDark ? "text-[#D3D1C7] hover:bg-[#313130]" : "text-[#2C2C2A] hover:bg-[#F7F6F3]"
            }`}
            onClick={() => setOpen(false)}
          >
            <Icon icon="mdi:account-outline" width={15} className="text-[#378ADD]" />
            Ver perfil
          </a>

          {accion !== "ok" && (
            <button
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                isDark ? "text-[#D3D1C7] hover:bg-[#313130]" : "text-[#2C2C2A] hover:bg-[#F7F6F3]"
              }`}
              onClick={() => { setModo("egresar"); setAccion("idle"); setOpen(false); }}
            >
              <Icon icon="mdi:school-outline" width={15} className="text-amber-500" />
              Marcar egresado
            </button>
          )}

          <button
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
              isDark ? "text-[#D3D1C7] hover:bg-[#313130]" : "text-[#2C2C2A] hover:bg-[#F7F6F3]"
            }`}
            onClick={() => { setModo("pwd"); setNuevaPwd(""); setPwdMsg(""); setOpen(false); }}
          >
            <Icon icon="mdi:key-outline" width={15} className="text-[#378ADD]" />
            Cambiar contraseña
          </button>

          <div className={`my-1 border-t ${B}`} />

          <button
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
              isDark ? "text-red-400 hover:bg-[#313130]" : "text-red-500 hover:bg-[#F7F6F3]"
            }`}
            onClick={() => { setModo("eliminar"); setAccion("idle"); setOpen(false); }}
          >
            <Icon icon="mdi:trash-can-outline" width={15} />
            Eliminar
          </button>
        </div>
      )}

      {(accion === "no_registro" || accion === "error") && (
        <p className="text-xs text-red-400 mt-1">
          {accion === "no_registro" ? "Sin registro en curso" : "Error al procesar"}
        </p>
      )}
    </div>
  );
}

export default function AdminUsuarios() {
  const { isDark } = useDark();
  const [search, setSearch]           = useState("");
  const [carreraFilter, setCarreraFilter] = useState("todas");
  const [nivelFilter, setNivelFilter]     = useState("todos");
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);

  const T = isDark ? "text-[#D3D1C7]" : "text-[#2C2C2A]";
  const M = isDark ? "text-[#888780]" : "text-[#5F5E5A]";
  const B = isDark ? "border-[#3a3a38]" : "border-[#D3D1C7]";
  const S = isDark ? "bg-[#313130]"   : "bg-[#F7F6F3]";

  useEffect(() => {
    async function load() {
      try {
        const data = await getUsuariosAdmin();
        setUsers(
          data.map((u) => ({
            id:      u.id,
            name:    u.nombre || u.correo,
            email:   u.correo,
            rut:     u.rut   || "—",
            carrera: u.carrera || "—",
            nivel:   u.nivel  || "—",
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const carreras = ["todas", ...Array.from(new Set(users.map((u) => u.carrera).filter((c) => c !== "—")))];

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.rut.toLowerCase().includes(q);
    const matchCarrera = carreraFilter === "todas" || u.carrera === carreraFilter;
    const matchNivel   = nivelFilter   === "todos"  || u.nivel   === nivelFilter;
    return matchSearch && matchCarrera && matchNivel;
  });

  const handleEliminado = (id) => setUsers((prev) => prev.filter((u) => u.id !== id));

  const selectCls = `text-sm outline-none border rounded-lg px-3 py-2 transition-all focus:border-[#378ADD] ${
    isDark
      ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7]"
      : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A]"
  }`;

  return (
    <div>
      <PageHeader
        title="Gestión de Estudiantes"
        subtitle={loading ? "Cargando..." : `${filtered.length} estudiante${filtered.length !== 1 ? "s" : ""}`}
      />

      <Card className="p-0 overflow-hidden">
        {/* Barra de búsqueda y filtros */}
        <div className={`flex items-center gap-3 p-4 border-b ${B} flex-wrap`}>
          <div className="relative flex-1 min-w-48">
            <Icon icon="mdi:search" width={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${M}`} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o RUT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none border transition-all focus:border-[#378ADD] ${
                isDark
                  ? "bg-[#313130] border-[#3a3a38] text-[#D3D1C7] placeholder-[#5F5E5A]"
                  : "bg-[#F7F6F3] border-[#D3D1C7] text-[#2C2C2A] placeholder-[#B4B2A9]"
              }`}
            />
          </div>

          <select value={carreraFilter} onChange={(e) => setCarreraFilter(e.target.value)} className={selectCls}>
            <option value="todas">Todas las carreras</option>
            {carreras.filter((c) => c !== "todas").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select value={nivelFilter} onChange={(e) => setNivelFilter(e.target.value)} className={selectCls}>
            <option value="todos">Todos los niveles</option>
            {NIVELES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          {(carreraFilter !== "todas" || nivelFilter !== "todos" || search) && (
            <button
              onClick={() => { setSearch(""); setCarreraFilter("todas"); setNivelFilter("todos"); }}
              className={`text-xs px-2 py-1.5 rounded-lg transition-colors ${S} ${M} hover:text-red-400`}
            >
              <Icon icon="mdi:close" width={14} />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className={`text-center py-12 ${M}`}>
              <Icon icon="mdi:loading" width={32} className="mx-auto mb-3 animate-spin" />
              <p className="text-sm">Cargando estudiantes...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className={`border-b ${B} ${S}`}>
                  {["Estudiante", "RUT", "Email", "Carrera", "Nivel", "Acciones"].map((h) => (
                    <th key={h} className={`text-left text-xs font-medium ${M} px-5 py-3`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className={`border-b ${B} last:border-0 transition-colors ${
                      isDark ? "hover:bg-[#313130]/50" : "hover:bg-[#F7F6F3]"
                    }`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${S}`}>
                          <Icon icon="mynaui:user-solid" width={16} className="text-[#378ADD]" />
                        </div>
                        <span className={`text-sm font-medium ${T}`}>{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-mono ${M}`}>{u.rut}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm ${M}`}>{u.email}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm ${M}`}>{u.carrera}</span>
                    </td>
                    <td className="px-5 py-3">
                      {u.nivel !== "—" ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${B} ${M}`}>{u.nivel}</span>
                      ) : (
                        <span className={`text-sm ${M}`}>—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <AccionesDropdown userId={u.id} isDark={isDark} onEliminado={handleEliminado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filtered.length === 0 && (
            <div className={`text-center py-12 ${M}`}>
              <Icon icon="mdi:magnify" width={40} className="mx-auto mb-3" />
              <p className={`text-sm ${T}`}>
                {users.length === 0 ? "No hay estudiantes registrados" : "Sin resultados para los filtros aplicados"}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
