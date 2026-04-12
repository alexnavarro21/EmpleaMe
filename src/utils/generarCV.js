/**
 * generarCV(datos)
 * Abre una ventana nueva con el CV diseñado y dispara el diálogo de impresión.
 *
 * datos: {
 *   nombre, carrera, telefono, correo, region, comuna, rut, biografia, promedio, fotoUrl,
 *   idiomas: [{ idioma, nivel }],
 *   habilidadesBlandas:  [{ nombre }],
 *   habilidadesTecnicas: [{ nombre }],
 *   experiencia: [{ cargo, empresa_nombre, fecha_inicio, fecha_fin, descripcion }],
 *   formacion:   [{ titulo, institucion, fecha_inicio, fecha_fin }],
 * }
 */

// ─── Colores ─────────────────────────────────────────────────────────────────
const C = {
  navy:      "#1a3558",
  navyLight: "#24487a",
  accent:    "#2d6abf",
  white:     "#ffffff",
  textDark:  "#1a1a1a",
  textMid:   "#444444",
  textGray:  "#888888",
  sideText:  "#dde4f0",
  sideMuted: "#8fa8cc",
};

// ─── Nivel → porcentaje barra ─────────────────────────────────────────────────
const NIVEL_PCT = { Básico: 25, Intermedio: 55, Avanzado: 80, Nativo: 100 };

// ─── SVG icons inline (MDI paths) ────────────────────────────────────────────
const PATH = {
  phone:    "M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  email:    "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z",
  location: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  id:       "M2 3C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H2zm6 4c1.4 0 2.5 1.1 2.5 2.5S9.4 12 8 12s-2.5-1.1-2.5-2.5S6.6 7 8 7zm-5 9.5c0-1.67 3.33-2.5 5-2.5s5 .83 5 2.5V17H3v-.5zM14 8h7v2h-7V8zm0 4h7v2h-7v-2z",
};

function icon(key, color = C.accent, size = 13) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" style="flex-shrink:0;margin-top:1px;"><path d="${PATH[key]}"/></svg>`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(fecha) {
  if (!fecha) return null;
  return new Date(fecha).toLocaleDateString("es-CL", { month: "short", year: "numeric" });
}

function barra(nivel) {
  const pct = NIVEL_PCT[nivel] || 30;
  return `<div style="width:100%;height:4px;background:rgba(255,255,255,.15);border-radius:2px;margin-top:4px;">
    <div style="width:${pct}%;height:100%;background:${C.accent};border-radius:2px;"></div>
  </div>`;
}

function sideSection(titulo, body) {
  return `<div style="margin-bottom:22px;">
    <div style="font-family:'Raleway',sans-serif;font-size:9px;font-weight:800;letter-spacing:2px;
                text-transform:uppercase;color:${C.sideText};
                border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:6px;margin-bottom:10px;">
      ${titulo}
    </div>
    ${body}
  </div>`;
}

function mainSection(titulo, body) {
  return `<div style="margin-bottom:20px;">
    <div style="font-family:'Raleway',sans-serif;font-size:10px;font-weight:800;letter-spacing:2px;
                text-transform:uppercase;color:${C.navy};
                border-bottom:2px solid ${C.navy};padding-bottom:5px;margin-bottom:12px;">
      ${titulo}
    </div>
    ${body}
  </div>`;
}

// ─── Export principal ─────────────────────────────────────────────────────────
export function generarCV(datos) {
  const {
    nombre            = "Estudiante",
    carrera           = "",
    telefono          = "",
    correo            = "",
    region            = "",
    comuna            = "",
    rut               = "",
    biografia         = "",
    promedio          = "",
    fotoUrl           = null,
    idiomas           = [],
    habilidadesBlandas  = [],
    habilidadesTecnicas = [],
    experiencia       = [],
    formacion         = [],
  } = datos;

  const partes       = nombre.trim().split(" ");
  const inicial      = partes[0]?.charAt(0).toUpperCase() || "?";
  const apellidos    = partes.slice(-2).join(" ").toUpperCase();
  const primerNombre = partes.slice(0, partes.length - 2).join(" ");

  const carreraDisplay = {
    "Mecanica Automotriz": "Técnico en Mecánica Automotriz",
    "Administracion":      "Técnico en Administración",
  }[carrera] || carrera;

  /* ── SIDEBAR ─────────────────────────────────────────── */

  // Contacto
  const contactoRows = [
    telefono && `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:11px;">
      ${icon("phone", C.accent, 13)}<span>${telefono}</span></div>`,
    correo   && `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;font-size:11px;">
      ${icon("email", C.accent, 13)}<span style="word-break:break-all;">${correo}</span></div>`,
    (region || comuna) && `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;font-size:11px;">
      ${icon("location", C.accent, 13)}<span>${[comuna, region].filter(Boolean).join(", ")}</span></div>`,
    rut && `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:11px;">
      ${icon("id", C.accent, 13)}<span>${rut}</span></div>`,
  ].filter(Boolean).join("");

  // Idiomas
  const idiomasHtml = idiomas.length
    ? idiomas.map(i => `<div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;">
          <span style="font-weight:600;">${i.idioma}</span>
          <span style="color:${C.sideMuted};font-size:9px;letter-spacing:.5px;">${i.nivel?.toUpperCase()}</span>
        </div>
        ${barra(i.nivel)}
      </div>`).join("")
    : `<p style="font-size:11px;color:${C.sideMuted};">Sin idiomas registrados</p>`;

  // Habilidades blandas
  const hBlandasHtml = habilidadesBlandas.length
    ? habilidadesBlandas.map(h => `<div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;font-size:11px;">
        <div style="width:5px;height:5px;border-radius:50%;background:${C.accent};flex-shrink:0;"></div>
        ${h.nombre}
      </div>`).join("")
    : `<p style="font-size:11px;color:${C.sideMuted};">Sin habilidades</p>`;

  // Habilidades técnicas
  const hTecnicasHtml = habilidadesTecnicas.length
    ? habilidadesTecnicas.map(h => `<div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;font-size:11px;">
        <div style="width:5px;height:5px;border-radius:50%;background:${C.accent};flex-shrink:0;"></div>
        ${h.nombre}
      </div>`).join("")
    : `<p style="font-size:11px;color:${C.sideMuted};">Sin habilidades técnicas</p>`;

  const sidebarHtml = `
    <div style="color:${C.sideText};line-height:1.5;">
      ${contactoRows ? sideSection("Contacto", contactoRows) : ""}
      ${idiomas.length ? sideSection("Idiomas", idiomasHtml) : ""}
      ${habilidadesBlandas.length ? sideSection("Habilidades", hBlandasHtml) : ""}
      ${habilidadesTecnicas.length ? sideSection("Hab. Técnicas", hTecnicasHtml) : ""}
    </div>`;

  /* ── MAIN ────────────────────────────────────────────── */

  const perfilHtml = mainSection("Perfil",
    `<p style="font-size:12px;color:${C.textMid};line-height:1.75;text-align:justify;">
      ${biografia || "Sin resumen profesional."}
    </p>`
  );

  let expHtml = "";
  if (experiencia.length) {
    const items = experiencia.map(e => {
      const fi = fmt(e.fecha_inicio);
      const ff = fmt(e.fecha_fin);
      const periodo = fi ? `${fi} – ${ff || "Presente"}` : "";
      const puntos = e.descripcion
        ? `<ul style="margin:5px 0 0 0;padding-left:14px;color:${C.textMid};">
            ${e.descripcion.split(/\n/).filter(s => s.trim()).map(s =>
              `<li style="margin-bottom:3px;font-size:11px;">${s.trim()}</li>`
            ).join("")}
          </ul>`
        : "";
      return `<div style="margin-bottom:14px;">
        <div style="font-family:'Raleway',sans-serif;font-size:13px;font-weight:700;color:${C.textDark};">${e.cargo}</div>
        <div style="font-size:11px;margin-top:2px;">
          <strong style="color:${C.textDark};">${e.empresa_nombre}</strong>
          ${periodo ? `<span style="color:${C.textGray};"> | ${periodo}</span>` : ""}
        </div>
        ${puntos}
      </div>`;
    }).join("");
    expHtml = mainSection("Experiencia Profesional", items);
  }

  const formItems = [];
  // Carrera propia siempre aparece primero
  formItems.push(`<div style="margin-bottom:12px;">
    <div style="font-family:'Raleway',sans-serif;font-size:13px;font-weight:700;color:${C.textDark};">${carreraDisplay}</div>
    <div style="font-size:11px;font-style:italic;margin-top:2px;">
      <strong style="color:${C.textDark};">C.E. Cardenal J.M. Caro</strong>
      ${promedio ? `<span style="color:${C.textGray};"> | Promedio: ${promedio}</span>` : ""}
    </div>
  </div>`);
  formacion.forEach(f => {
    const periodo = f.fecha_inicio
      ? `${f.fecha_inicio}${f.fecha_fin ? ` – ${f.fecha_fin}` : ""}`
      : "";
    formItems.push(`<div style="margin-bottom:12px;">
      <div style="font-family:'Raleway',sans-serif;font-size:13px;font-weight:700;color:${C.textDark};">${f.titulo}</div>
      <div style="font-size:11px;font-style:italic;margin-top:2px;">
        <strong style="color:${C.textDark};">${f.institucion}</strong>
        ${periodo ? `<span style="color:${C.textGray};"> | ${periodo}</span>` : ""}
      </div>
    </div>`);
  });

  const formHtml = mainSection("Formación", formItems.join(""));

  /* ── HTML COMPLETO ───────────────────────────────────── */
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>CV — ${nombre}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *,*::before,*::after {
      margin: 0; padding: 0; box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Raleway', 'Segoe UI', Arial, sans-serif;
      background: #f0f0f0;
    }
    @page {
      size: A4 portrait;
      margin: 0;
    }
    @media print {
      body { background: white; }
      .no-print { display: none !important; }
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      background: white;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    /* ── Decoración geométrica ── */
    .deco-tr {
      position: absolute;
      top: 0; right: 0; width: 0; height: 0;
      border-style: solid;
      border-width: 0 100px 100px 0;
      border-color: transparent ${C.navy} transparent transparent;
      opacity: .3;
    }
    .deco-tr2 {
      position: absolute;
      top: 0; right: 0; width: 0; height: 0;
      border-style: solid;
      border-width: 0 60px 60px 0;
      border-color: transparent ${C.accent} transparent transparent;
      opacity: .45;
    }

    /* ── Header ── */
    .header {
      display: flex;
      align-items: center;
      gap: 22px;
      padding: 26px 30px 22px 26px;
      background: white;
      position: relative;
      z-index: 1;
      border-bottom: 3px solid ${C.navy};
    }
    .header-text { flex: 1; }
    .header-nombre {
      font-size: 28px;
      font-weight: 300;
      color: ${C.textDark};
      letter-spacing: 1px;
      line-height: 1.1;
    }
    .header-apellido {
      font-weight: 800;
      color: ${C.navy};
    }
    .header-cargo {
      font-size: 11px;
      font-weight: 700;
      color: ${C.accent};
      letter-spacing: 2.5px;
      text-transform: uppercase;
      margin-top: 6px;
    }

    /* ── Cuerpo ── */
    .body {
      display: flex;
      flex: 1;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 68mm;
      background: ${C.navy};
      padding: 22px 16px 20px;
      flex-shrink: 0;
    }

    /* ── Main ── */
    .main {
      flex: 1;
      padding: 22px 24px 20px 22px;
      background: white;
    }

    /* ── Footer ── */
    .footer {
      font-family: 'Raleway', sans-serif;
      font-size: 7.5px;
      color: #bbb;
      text-align: center;
      padding: 7px 0 9px;
      background: white;
      letter-spacing: 1px;
    }

    /* ── Botón de impresión (no aparece en PDF) ── */
    .print-btn {
      position: fixed;
      bottom: 24px; right: 24px;
      background: ${C.accent};
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-family: 'Raleway', sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,.2);
      z-index: 100;
    }
    .print-btn:hover { background: ${C.navy}; }
  </style>
</head>
<body>
  <div class="page">

    <!-- Decoración -->
    <div class="deco-tr"></div>
    <div class="deco-tr2"></div>

    <!-- Header -->
    <div class="header">
      ${fotoUrl
        ? `<img src="${fotoUrl}" alt="${nombre}" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid ${C.accent};flex-shrink:0;"/>`
        : `<div style="width:90px;height:90px;border-radius:50%;background:${C.navy};border:3px solid ${C.accent};
                       display:flex;align-items:center;justify-content:center;
                       font-family:'Raleway',sans-serif;font-size:36px;font-weight:800;
                       color:white;flex-shrink:0;">${inicial}</div>`
      }
      <div class="header-text">
        <div class="header-nombre">
          ${primerNombre} <span class="header-apellido">${apellidos}</span>
        </div>
        <div class="header-cargo">${carreraDisplay}</div>
      </div>
    </div>

    <!-- Body -->
    <div class="body">

      <!-- Sidebar -->
      <div class="sidebar">
        ${sidebarHtml}
      </div>

      <!-- Main content -->
      <div class="main">
        ${perfilHtml}
        ${expHtml}
        ${formHtml}
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">GENERADO POR EMPLEAME · C.E. CARDENAL J.M. CARO</div>

  </div>

  <!-- Botón manual para reimprimir si cierran el diálogo -->
  <button class="print-btn no-print" onclick="window.print()">
    Descargar PDF
  </button>

  <script>
    // Esperar a que la fuente Raleway cargue antes de imprimir
    document.fonts.ready.then(function() {
      setTimeout(function() { window.print(); }, 400);
    });
  </script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=960,height=760");
  if (!win) {
    alert("Por favor permite ventanas emergentes para descargar el CV.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
