/**
 * generarCV(datos)
 * Genera el CV como PDF y lo descarga automáticamente.
 * Usa html2canvas para capturar el HTML renderizado + jsPDF para crear el archivo.
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

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// ─── Colores ──────────────────────────────────────────────────────────────────
const C = {
  navy:     "#1a3558",
  accent:   "#2d6abf",
  white:    "#ffffff",
  textDark: "#1a1a1a",
  textMid:  "#444444",
  textGray: "#888888",
  sideText: "#dde4f0",
  sideMid:  "#8fa8cc",
};

// ─── Nivel → % barra ──────────────────────────────────────────────────────────
const NIVEL_PCT = { Básico: 25, Intermedio: 55, Avanzado: 80, Nativo: 100 };

// ─── SVG inline (MDI paths) ───────────────────────────────────────────────────
const PATH = {
  phone:    "M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  email:    "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z",
  location: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  id:       "M2 3C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H2zm6 4c1.4 0 2.5 1.1 2.5 2.5S9.4 12 8 12s-2.5-1.1-2.5-2.5S6.6 7 8 7zm-5 9.5c0-1.67 3.33-2.5 5-2.5s5 .83 5 2.5V17H3v-.5zM14 8h7v2h-7V8zm0 4h7v2h-7v-2z",
};

function icon(key, color = C.accent, size = 13) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="${PATH[key]}"/></svg>`;
}

function fmt(fecha) {
  if (!fecha) return null;
  return new Date(fecha).toLocaleDateString("es-CL", { month: "short", year: "numeric" });
}

function barra(nivel) {
  const pct = NIVEL_PCT[nivel] || 30;
  return `<div style="width:100%;height:4px;background:rgba(255,255,255,.18);border-radius:2px;margin-top:3px;">
    <div style="width:${pct}%;height:100%;background:${C.accent};border-radius:2px;"></div>
  </div>`;
}

function sideSection(titulo, body) {
  return `<div style="margin-bottom:20px;">
    <div style="font-size:8.5px;font-weight:800;letter-spacing:2px;text-transform:uppercase;
                color:${C.sideText};border-bottom:1px solid rgba(255,255,255,.2);
                padding-bottom:5px;margin-bottom:9px;">${titulo}</div>
    ${body}
  </div>`;
}

function mainSection(titulo, body) {
  return `<div style="margin-bottom:18px;">
    <div style="font-size:9.5px;font-weight:800;letter-spacing:2px;text-transform:uppercase;
                color:${C.navy};border-bottom:2px solid ${C.navy};
                padding-bottom:4px;margin-bottom:11px;">${titulo}</div>
    ${body}
  </div>`;
}

// ─── Constructor de HTML del CV ───────────────────────────────────────────────
function buildCVHtml(datos) {
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
  const primerNombre = partes[0] || "";
  const apellidos    = partes.slice(1).join(" ");

  const carreraDisplay = {
    "Mecanica Automotriz": "Técnico en Mecánica Automotriz",
    "Administracion":      "Técnico en Administración",
  }[carrera] || carrera;

  /* ── Sidebar ─────────────────────────── */
  const avatarHtml = fotoUrl
    ? `<img src="${fotoUrl}" style="width:86px;height:86px;border-radius:50%;object-fit:cover;border:3px solid ${C.accent};display:block;margin:0 auto 16px;"/>`
    : `<div style="width:86px;height:86px;border-radius:50%;background:#24487a;border:3px solid ${C.accent};
                   display:flex;align-items:center;justify-content:center;
                   font-size:34px;font-weight:800;color:#fff;margin:0 auto 16px;">${inicial}</div>`;

  const contactRows = [
    telefono           && `<div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;font-size:10.5px;">${icon("phone")} ${telefono}</div>`,
    correo             && `<div style="display:flex;align-items:flex-start;gap:7px;margin-bottom:7px;font-size:10.5px;">${icon("email")} <span style="word-break:break-all;">${correo}</span></div>`,
    (region || comuna) && `<div style="display:flex;align-items:flex-start;gap:7px;margin-bottom:7px;font-size:10.5px;">${icon("location")} ${[comuna, region].filter(Boolean).join(", ")}</div>`,
    rut                && `<div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;font-size:10.5px;">${icon("id")} ${rut}</div>`,
  ].filter(Boolean).join("");

  const idiomasHtml = idiomas.length
    ? idiomas.map(i => `<div style="margin-bottom:9px;">
        <div style="display:flex;justify-content:space-between;font-size:10.5px;">
          <span style="font-weight:600;">${i.idioma}</span>
          <span style="color:${C.sideMid};font-size:9px;">${i.nivel?.toUpperCase() || ""}</span>
        </div>${barra(i.nivel)}
      </div>`).join("")
    : "";

  const dot = `<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:${C.accent};margin-right:6px;flex-shrink:0;"></span>`;

  const hBlandasHtml = habilidadesBlandas.map(h =>
    `<div style="display:flex;align-items:center;margin-bottom:6px;font-size:10.5px;">${dot}${h.nombre}</div>`
  ).join("");

  const hTecnicasHtml = habilidadesTecnicas.map(h =>
    `<div style="display:flex;align-items:center;margin-bottom:6px;font-size:10.5px;">${dot}${h.nombre}</div>`
  ).join("");

  const sidebarContent = `
    <div style="color:${C.sideText};line-height:1.5;">
      ${avatarHtml}
      ${contactRows ? sideSection("Contacto", contactRows) : ""}
      ${idiomas.length ? sideSection("Idiomas", idiomasHtml) : ""}
      ${habilidadesBlandas.length ? sideSection("Habilidades", hBlandasHtml) : ""}
      ${habilidadesTecnicas.length ? sideSection("Hab. Técnicas", hTecnicasHtml) : ""}
    </div>`;

  /* ── Main ────────────────────────────── */
  const perfilHtml = mainSection("Perfil",
    `<p style="font-size:11px;color:${C.textMid};line-height:1.75;text-align:justify;">
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
        ? `<ul style="margin:5px 0 0 0;padding-left:13px;color:${C.textMid};">
            ${e.descripcion.split(/\n/).filter(s => s.trim()).map(s =>
              `<li style="margin-bottom:2px;font-size:10.5px;">${s.trim()}</li>`
            ).join("")}
           </ul>`
        : "";
      return `<div style="margin-bottom:13px;">
        <div style="font-size:12.5px;font-weight:700;color:${C.textDark};">${e.cargo}</div>
        <div style="font-size:10.5px;margin-top:2px;">
          <strong style="color:${C.textDark};">${e.empresa_nombre}</strong>
          ${periodo ? `<span style="color:${C.textGray};"> | ${periodo}</span>` : ""}
        </div>${puntos}
      </div>`;
    }).join("");
    expHtml = mainSection("Experiencia Profesional", items);
  }

  const formItems = [`<div style="margin-bottom:11px;">
    <div style="font-size:12.5px;font-weight:700;color:${C.textDark};">${carreraDisplay}</div>
    <div style="font-size:10.5px;font-style:italic;margin-top:2px;">
      <strong style="color:${C.textDark};">C.E. Cardenal J.M. Caro</strong>
      ${promedio ? `<span style="color:${C.textGray};"> | Promedio: ${promedio}</span>` : ""}
    </div>
  </div>`];

  formacion.forEach(f => {
    const periodo = f.fecha_inicio ? `${f.fecha_inicio}${f.fecha_fin ? ` – ${f.fecha_fin}` : ""}` : "";
    formItems.push(`<div style="margin-bottom:11px;">
      <div style="font-size:12.5px;font-weight:700;color:${C.textDark};">${f.titulo}</div>
      <div style="font-size:10.5px;font-style:italic;margin-top:2px;">
        <strong style="color:${C.textDark};">${f.institucion}</strong>
        ${periodo ? `<span style="color:${C.textGray};"> | ${periodo}</span>` : ""}
      </div>
    </div>`);
  });

  const formHtml = mainSection("Formación", formItems.join(""));

  /* ── HTML completo ───────────────────── */
  return `
    <div style="
      width:794px;
      font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;
      background:#fff;
      position:relative;
      overflow:hidden;
    ">
      <!-- Decoración esquina superior derecha -->
      <div style="position:absolute;top:0;right:0;width:0;height:0;
                  border-style:solid;border-width:0 100px 100px 0;
                  border-color:transparent ${C.navy} transparent transparent;opacity:.3;"></div>
      <div style="position:absolute;top:0;right:0;width:0;height:0;
                  border-style:solid;border-width:0 60px 60px 0;
                  border-color:transparent ${C.accent} transparent transparent;opacity:.45;"></div>

      <!-- Header -->
      <div style="display:flex;align-items:center;gap:20px;
                  padding:24px 28px 20px 24px;background:#fff;
                  border-bottom:3px solid ${C.navy};position:relative;z-index:1;">
        ${fotoUrl
          ? `<img src="${fotoUrl}" style="width:86px;height:86px;border-radius:50%;object-fit:cover;border:3px solid ${C.accent};flex-shrink:0;"/>`
          : `<div style="width:86px;height:86px;border-radius:50%;background:${C.navy};
                         border:3px solid ${C.accent};display:flex;align-items:center;
                         justify-content:center;font-size:34px;font-weight:800;
                         color:#fff;flex-shrink:0;">${inicial}</div>`
        }
        <div>
          <div style="font-size:26px;font-weight:300;color:${C.textDark};letter-spacing:1px;line-height:1.1;">
            ${primerNombre} <span style="font-weight:800;color:${C.navy};">${apellidos}</span>
          </div>
          <div style="font-size:10px;font-weight:700;color:${C.accent};letter-spacing:2.5px;
                      text-transform:uppercase;margin-top:5px;">${carreraDisplay}</div>
        </div>
      </div>

      <!-- Body: sidebar + main -->
      <div style="display:flex;">

        <!-- Sidebar -->
        <div style="width:240px;background:${C.navy};padding:20px 16px;flex-shrink:0;">
          ${sidebarContent}
        </div>

        <!-- Main -->
        <div style="flex:1;padding:20px 22px 18px 20px;background:#fff;">
          ${perfilHtml}
          ${expHtml}
          ${formHtml}
        </div>

      </div>

      <!-- Footer -->
      <div style="font-size:7.5px;color:#bbb;text-align:center;padding:6px 0 8px;
                  background:#fff;letter-spacing:1px;border-top:1px solid #f0f0f0;">
        GENERADO POR EMPLEAME · C.E. CARDENAL J.M. CARO
      </div>
    </div>`;
}

// ─── Función exportada ────────────────────────────────────────────────────────
export async function generarCV(datos, onProgreso) {
  // 1. Crear contenedor oculto fuera de la pantalla
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 794px;
    background: white;
    z-index: -9999;
  `;
  wrapper.innerHTML = buildCVHtml(datos);
  document.body.appendChild(wrapper);

  try {
    onProgreso?.("Generando PDF…");

    // 2. Capturar como imagen
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });

    // 3. Crear PDF A4
    const pdf     = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfW    = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfH    = pdf.internal.pageSize.getHeight();  // 297mm
    const imgH    = (canvas.height * pdfW) / canvas.width;

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    if (imgH <= pdfH) {
      // Cabe en una sola página
      pdf.addImage(imgData, "JPEG", 0, 0, pdfW, imgH);
    } else {
      // Partir en páginas si el contenido es muy largo
      let yOffset = 0;
      while (yOffset < imgH) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, -yOffset, pdfW, imgH);
        yOffset += pdfH;
      }
    }

    // 4. Descargar automáticamente
    const nombreArchivo = `CV_${(datos.nombre || "Estudiante").replace(/\s+/g, "_")}.pdf`;
    pdf.save(nombreArchivo);

  } finally {
    document.body.removeChild(wrapper);
    onProgreso?.(null);
  }
}
