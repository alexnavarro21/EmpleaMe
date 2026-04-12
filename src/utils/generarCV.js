/**
 * generarCV(datos)
 * Genera el HTML completo de un CV y abre una ventana para imprimir/guardar como PDF.
 *
 * datos: {
 *   nombre, carrera, telefono, correo, region, comuna, rut, biografia, promedio,
 *   idiomas: [{ idioma, nivel }],
 *   habilidadesBlandas:  [{ nombre }],
 *   habilidadesTecnicas: [{ nombre }],
 *   experiencia: [{ cargo, empresa_nombre, fecha_inicio, fecha_fin, descripcion }],
 *   formacion:   [{ titulo, institucion, fecha_inicio, fecha_fin }],
 * }
 */

const NIVEL_BARRA = {
  Básico:     25,
  Intermedio: 55,
  Avanzado:   80,
  Nativo:     100,
};

const SIDEBAR_COLOR = "#1a3558";   // azul marino oscuro (igual al template)
const ACCENT_COLOR  = "#2d6abf";   // azul accent para sección header
const TEXT_DARK     = "#1a1a1a";
const TEXT_MID      = "#444444";
const TEXT_LIGHT    = "#c8d4e8";
const TEXT_SIDEBAR  = "#e8edf5";

function fmt(fecha) {
  if (!fecha) return null;
  const d = new Date(fecha);
  return d.toLocaleDateString("es-CL", { month: "short", year: "numeric" });
}

function barraIdioma(nivel) {
  const pct = NIVEL_BARRA[nivel] || 30;
  return `
    <div style="width:100%;height:5px;background:rgba(255,255,255,0.15);border-radius:3px;margin-top:4px;">
      <div style="width:${pct}%;height:100%;background:${ACCENT_COLOR};border-radius:3px;"></div>
    </div>`;
}

function seccionSidebar(titulo, contenido) {
  return `
    <div style="margin-bottom:22px;">
      <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;
                  color:${TEXT_LIGHT};border-bottom:1px solid rgba(255,255,255,0.15);
                  padding-bottom:6px;margin-bottom:10px;">
        ${titulo}
      </div>
      ${contenido}
    </div>`;
}

function seccionMain(titulo, contenido) {
  return `
    <div style="margin-bottom:22px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;
                  color:${SIDEBAR_COLOR};border-bottom:2px solid ${SIDEBAR_COLOR};
                  padding-bottom:5px;margin-bottom:12px;">
        ${titulo}
      </div>
      ${contenido}
    </div>`;
}

export function generarCV(datos) {
  const {
    nombre = "Estudiante",
    carrera = "",
    telefono = "",
    correo = "",
    region = "",
    comuna = "",
    rut = "",
    biografia = "",
    promedio = "",
    idiomas = [],
    habilidadesBlandas = [],
    habilidadesTecnicas = [],
    experiencia = [],
    formacion = [],
  } = datos;

  // Inicial para el círculo
  const inicial = nombre.trim().charAt(0).toUpperCase();
  const apellido = nombre.trim().split(" ").slice(-1)[0]?.toUpperCase() || "";
  const nombreParte = nombre.trim().split(" ").slice(0, -1).join(" ");

  const carreraDisplay = {
    "Mecanica Automotriz": "Técnico en Mecánica Automotriz",
    "Administracion":      "Técnico en Administración",
  }[carrera] || carrera;

  /* ── SIDEBAR ───────────────────────────────────────────── */

  // Contacto
  const contactoItems = [
    telefono  && `<div style="margin-bottom:7px;display:flex;align-items:flex-start;gap:8px;"><span style="flex-shrink:0;">📞</span><span>${telefono}</span></div>`,
    correo    && `<div style="margin-bottom:7px;display:flex;align-items:flex-start;gap:8px;"><span style="flex-shrink:0;">✉</span><span style="word-break:break-all;">${correo}</span></div>`,
    (region || comuna) && `<div style="margin-bottom:7px;display:flex;align-items:flex-start;gap:8px;"><span style="flex-shrink:0;">📍</span><span>${[comuna, region].filter(Boolean).join(", ")}</span></div>`,
    rut       && `<div style="margin-bottom:7px;display:flex;align-items:flex-start;gap:8px;"><span style="flex-shrink:0;">🪪</span><span>${rut}</span></div>`,
  ].filter(Boolean).join("");

  const contactoHtml = contactoItems || `<p style="font-size:11px;opacity:.5;">Sin datos de contacto</p>`;

  // Idiomas
  const idiomasHtml = idiomas.length
    ? idiomas.map(i => `
        <div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;font-size:11px;">
            <span>${i.idioma}</span>
            <span style="opacity:.6;font-size:10px;">${i.nivel}</span>
          </div>
          ${barraIdioma(i.nivel)}
        </div>`).join("")
    : `<p style="font-size:11px;opacity:.5;">Sin idiomas registrados</p>`;

  // Habilidades blandas
  const hBlandasHtml = habilidadesBlandas.length
    ? habilidadesBlandas.map(h => `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;font-size:11px;">
          <span style="width:5px;height:5px;background:${ACCENT_COLOR};border-radius:50%;flex-shrink:0;"></span>
          ${h.nombre}
        </div>`).join("")
    : `<p style="font-size:11px;opacity:.5;">Sin habilidades registradas</p>`;

  // Habilidades técnicas
  const hTecnicasHtml = habilidadesTecnicas.length
    ? habilidadesTecnicas.map(h => `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;font-size:11px;">
          <span style="width:5px;height:5px;background:${ACCENT_COLOR};border-radius:50%;flex-shrink:0;"></span>
          ${h.nombre}
        </div>`).join("")
    : `<p style="font-size:11px;opacity:.5;">Sin habilidades técnicas registradas</p>`;

  const sidebarHtml = `
    <div style="font-size:12px;color:${TEXT_SIDEBAR};line-height:1.5;">
      ${seccionSidebar("Contacto", contactoHtml)}
      ${idiomas.length ? seccionSidebar("Idiomas", idiomasHtml) : ""}
      ${habilidadesBlandas.length ? seccionSidebar("Habilidades", hBlandasHtml) : ""}
      ${habilidadesTecnicas.length ? seccionSidebar("Hab. Técnicas", hTecnicasHtml) : ""}
    </div>`;

  /* ── MAIN CONTENT ──────────────────────────────────────── */

  // Perfil/Biografía
  const perfilHtml = seccionMain("Perfil",
    `<p style="font-size:12px;color:${TEXT_MID};line-height:1.7;text-align:justify;">
      ${biografia || "Sin resumen profesional."}
    </p>`
  );

  // Experiencia profesional (solo favoritos — estrellas)
  let expHtml = "";
  if (experiencia.length) {
    const items = experiencia.map(e => {
      const fi = fmt(e.fecha_inicio);
      const ff = fmt(e.fecha_fin);
      const periodo = fi ? `${fi} – ${ff || "Presente"}` : "";
      const desc = e.descripcion
        ? `<ul style="margin:6px 0 0 0;padding-left:16px;">
            ${e.descripcion.split(/\n|\.(?=\s|$)/).filter(s => s.trim()).map(s =>
              `<li style="margin-bottom:3px;">${s.trim()}</li>`
            ).join("")}
           </ul>`
        : "";
      return `
        <div style="margin-bottom:14px;">
          <div style="font-size:13px;font-weight:700;color:${TEXT_DARK};">${e.cargo}</div>
          <div style="font-size:11px;color:${TEXT_MID};margin-top:2px;">
            <strong>${e.empresa_nombre}</strong>${periodo ? ` <span style="color:#888;">| ${periodo}</span>` : ""}
          </div>
          <div style="font-size:11px;color:${TEXT_MID};line-height:1.6;">${desc}</div>
        </div>`;
    }).join("");
    expHtml = seccionMain("Experiencia Profesional", items);
  }

  // Formación
  let formHtml = "";
  if (formacion.length) {
    const items = formacion.map(f => {
      const fi = f.fecha_inicio || "";
      const ff = f.fecha_fin   || "";
      const periodo = fi ? `${fi}${ff ? ` – ${ff}` : ""}` : "";
      return `
        <div style="margin-bottom:12px;">
          <div style="font-size:13px;font-weight:700;color:${TEXT_DARK};">${f.titulo}</div>
          <div style="font-size:11px;color:${TEXT_MID};margin-top:2px;font-style:italic;">
            <strong>${f.institucion}</strong>${periodo ? ` <span style="color:#888;">| ${periodo}</span>` : ""}
          </div>
        </div>`;
    }).join("");

    // Si hay promedio, lo agrego como primer item de formación
    const promedioItem = promedio
      ? `<div style="margin-bottom:12px;">
           <div style="font-size:13px;font-weight:700;color:${TEXT_DARK};">${carreraDisplay}</div>
           <div style="font-size:11px;color:${TEXT_MID};margin-top:2px;font-style:italic;">
             C.E. Cardenal J.M. Caro <span style="color:#888;">| Promedio: ${promedio}</span>
           </div>
         </div>`
      : `<div style="margin-bottom:12px;">
           <div style="font-size:13px;font-weight:700;color:${TEXT_DARK};">${carreraDisplay}</div>
           <div style="font-size:11px;color:${TEXT_MID};margin-top:2px;font-style:italic;">
             C.E. Cardenal J.M. Caro
           </div>
         </div>`;

    formHtml = seccionMain("Formación", promedioItem + items);
  } else if (carreraDisplay) {
    const promedioItem = `
      <div style="margin-bottom:12px;">
        <div style="font-size:13px;font-weight:700;color:${TEXT_DARK};">${carreraDisplay}</div>
        <div style="font-size:11px;color:${TEXT_MID};margin-top:2px;font-style:italic;">
          C.E. Cardenal J.M. Caro${promedio ? ` <span style="color:#888;">| Promedio: ${promedio}</span>` : ""}
        </div>
      </div>`;
    formHtml = seccionMain("Formación", promedioItem);
  }

  /* ── HTML COMPLETO ─────────────────────────────────────── */
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>CV — ${nombre}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#fff; }
    @page { size: A4 portrait; margin: 0; }
    @media print {
      html, body { width:210mm; height:297mm; }
      .no-print { display:none; }
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      background: #fff;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    /* Decoración geométrica superior derecha */
    .deco-top {
      position: absolute;
      top: 0; right: 0;
      width: 0; height: 0;
      border-style: solid;
      border-width: 0 90px 90px 0;
      border-color: transparent ${SIDEBAR_COLOR} transparent transparent;
      opacity: .35;
    }
    .deco-top2 {
      position: absolute;
      top: 0; right: 0;
      width: 0; height: 0;
      border-style: solid;
      border-width: 0 55px 55px 0;
      border-color: transparent ${ACCENT_COLOR} transparent transparent;
      opacity: .5;
    }
    /* Header */
    .header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 28px 30px 24px 24px;
      background: #fff;
      position: relative;
      z-index: 1;
    }
    .avatar {
      width: 72px; height: 72px; border-radius: 50%;
      background: ${SIDEBAR_COLOR};
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 30px; font-weight: 700;
      flex-shrink: 0;
      border: 3px solid ${ACCENT_COLOR};
    }
    .header-nombre { font-size: 26px; font-weight: 800; color: ${TEXT_DARK}; letter-spacing: -0.5px; }
    .header-apellido { color: ${SIDEBAR_COLOR}; }
    .header-cargo { font-size: 12px; font-weight: 600; color: ${ACCENT_COLOR}; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px; }
    /* Cuerpo 2 columnas */
    .body {
      display: flex;
      flex: 1;
    }
    /* Sidebar */
    .sidebar {
      width: 72mm;
      background: ${SIDEBAR_COLOR};
      padding: 24px 18px;
      flex-shrink: 0;
    }
    /* Main */
    .main {
      flex: 1;
      padding: 24px 24px 20px 22px;
      background: #fff;
    }
    /* Pie */
    .footer {
      font-size: 8px; color: #bbb; text-align: center;
      padding: 8px 0 10px;
      border-top: 1px solid #f0f0f0;
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Decoración -->
    <div class="deco-top"></div>
    <div class="deco-top2"></div>

    <!-- Header -->
    <div class="header">
      <div class="avatar">${inicial}</div>
      <div>
        <div class="header-nombre">
          ${nombreParte} <span class="header-apellido">${apellido}</span>
        </div>
        <div class="header-cargo">${carreraDisplay}</div>
      </div>
    </div>

    <!-- Cuerpo -->
    <div class="body">
      <!-- Sidebar -->
      <div class="sidebar">
        ${sidebarHtml}
      </div>

      <!-- Contenido principal -->
      <div class="main">
        ${perfilHtml}
        ${expHtml}
        ${formHtml}
      </div>
    </div>

    <div class="footer">
      Generado por EmpleaMe · C.E. Cardenal J.M. Caro
    </div>
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`;

  const ventana = window.open("", "_blank", "width=900,height=700");
  if (!ventana) {
    alert("Por favor permite ventanas emergentes para descargar el CV.");
    return;
  }
  ventana.document.write(html);
  ventana.document.close();
}
