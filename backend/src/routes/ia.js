const router      = require("express").Router();
const crypto      = require("crypto");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const db          = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Construye un hash SHA-256 del perfil del estudiante ──────────────────────
function calcularHashPerfil(perfil, habilidades, idiomas, historial_academico, historial_laboral, posts) {
  const contenido = JSON.stringify({
    biografia:          perfil.biografia,
    promedio:           perfil.promedio,
    calificacion_docente: perfil.calificacion_docente,
    nivel:              perfil.nivel,
    habilidades:        habilidades.map(h => ({ nombre: h.nombre, nivel: h.nivel_dominio })),
    idiomas:            idiomas.map(i => ({ idioma: i.idioma, nivel: i.nivel })),
    historial_academico: historial_academico.map(a => ({ titulo: a.titulo, institucion: a.institucion })),
    historial_laboral:  historial_laboral.map(l => ({ cargo: l.cargo, empresa: l.empresa_nombre, descripcion: l.descripcion })),
    posts:              posts.map(p => ({ titulo: p.titulo, contenido: p.contenido })),
  });
  return crypto.createHash("sha256").update(contenido).digest("hex");
}

// ── Construye el prompt para Gemini ─────────────────────────────────────────
function buildPrompt(perfil, habilidades, idiomas, historial_academico, historial_laboral, posts, vacante) {
  const hTecnicas = habilidades.filter(h => h.categoria === "tecnica").map(h => `${h.nombre}${h.nivel_dominio ? ` (${h.nivel_dominio})` : ""}`).join(", ");
  const hBlandas  = habilidades.filter(h => h.categoria === "blanda").map(h => h.nombre).join(", ");

  const histAcad = historial_academico.map(a =>
    `- ${a.titulo} en ${a.institucion}${a.fecha_inicio ? ` (${a.fecha_inicio}${a.fecha_fin ? ` – ${a.fecha_fin}` : " – en curso"})` : ""}`
  ).join("\n");

  const histLab = historial_laboral.length
    ? historial_laboral.map(l =>
        `- ${l.cargo} en ${l.empresa_nombre}${l.descripcion ? `: ${l.descripcion}` : ""}`
      ).join("\n")
    : "Sin experiencia laboral registrada";

  const idiomasStr = idiomas.length
    ? idiomas.map(i => `${i.idioma} (${i.nivel})`).join(", ")
    : "No especificados";


  const postsStr = posts.length
    ? posts.slice(0, 5).map(p => `- "${p.titulo}": ${p.contenido || ""}`).join("\n")
    : "Sin publicaciones";

  return `Eres un asistente de reclutamiento para la plataforma EmpleaMe. Analiza el perfil de este estudiante y genera un resumen conciso para ayudar a la empresa a decidir si es un buen candidato para la vacante.

VACANTE:
- Título: ${vacante.titulo}
- Área: ${vacante.area || "No especificada"}
- Modalidad: ${vacante.modalidad || "No especificada"}
- Tipo: ${vacante.tipo === "puesto_laboral" ? "Puesto laboral" : "Práctica profesional"}
${vacante.descripcion ? `- Descripción: ${vacante.descripcion}` : ""}

PERFIL DEL ESTUDIANTE:
- Nombre: ${perfil.nombre_completo}
- Carrera: ${perfil.carrera}
- Nivel: ${perfil.nivel || "No especificado"}
- Promedio académico: ${perfil.promedio ? `${perfil.promedio} / 7.0` : "No registrado"}
- Evaluación docente: ${perfil.calificacion_docente ? `${perfil.calificacion_docente} / 7.0` : "No registrada"}
- Sobre mí: ${perfil.biografia || "Sin biografía"}

Habilidades técnicas: ${hTecnicas || "No especificadas"}
Habilidades blandas: ${hBlandas || "No especificadas"}
Idiomas: ${idiomasStr}

Historial académico:
${histAcad || "No registrado"}

Experiencia laboral:
${histLab}

Publicaciones recientes:
${postsStr}

Genera un resumen en español con estas secciones (sin markdown, texto plano):
1. PERFIL GENERAL: 2 oraciones describiendo al estudiante.
2. PUNTOS FUERTES: 2-3 fortalezas relevantes para esta vacante.
3. ÁREAS DE MEJORA: 1-2 aspectos a considerar.
4. COMPATIBILIDAD: Una frase final indicando qué tan compatible es con la vacante (Alta / Media / Baja) y por qué.
`;
}

// ── GET /api/ia/resumen/:estudiante_id/:vacante_id ───────────────────────────
router.get("/resumen/:estudiante_id/:vacante_id", verificarToken, soloRol("empresa"), async (req, res) => {
  const { estudiante_id, vacante_id } = req.params;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: "Servicio de IA no configurado. Contacta al administrador." });
  }

  try {
    // 1. Obtener todos los datos del estudiante
    const [[perfil]] = await db.query(
      `SELECT pe.*, c.nombre AS carrera
       FROM perfiles_estudiantes pe
       LEFT JOIN carreras c ON c.id = pe.carrera_id
       WHERE pe.usuario_id = ?`,
      [estudiante_id]
    );
    if (!perfil) return res.status(404).json({ error: "Estudiante no encontrado" });

    const [[vacante]] = await db.query(
      "SELECT titulo, area, modalidad, tipo, descripcion FROM vacantes WHERE id = ? AND empresa_id = ?",
      [vacante_id, req.usuario.id]
    );
    if (!vacante) return res.status(404).json({ error: "Vacante no encontrada" });

    const [habilidades]        = await db.query(`SELECT h.nombre, ch.nombre AS categoria, he.nivel_dominio FROM habilidades_estudiantes he JOIN habilidades h ON h.id = he.habilidad_id JOIN categorias_habilidades ch ON ch.id = h.categoria_id WHERE he.estudiante_id = ?`, [estudiante_id]);
    const [idiomas]            = await db.query("SELECT idioma, nivel FROM idiomas_estudiantes WHERE estudiante_id = ?", [estudiante_id]);
    const [historial_academico]= await db.query("SELECT titulo, institucion, fecha_inicio, fecha_fin FROM historial_academico WHERE estudiante_id = ? ORDER BY fecha_inicio DESC", [estudiante_id]);
    const [historial_laboral]  = await db.query("SELECT cargo, empresa_nombre, descripcion, fecha_inicio, fecha_fin FROM historial_laboral WHERE estudiante_id = ? ORDER BY fecha_inicio DESC", [estudiante_id]);
    const [posts]              = await db.query("SELECT titulo, contenido FROM publicaciones WHERE autor_id = ? ORDER BY publicado_en DESC LIMIT 5", [estudiante_id]);

    // 2. Calcular hash del perfil actual
    const hashActual = calcularHashPerfil(perfil, habilidades, idiomas, historial_academico, historial_laboral, posts);

    // 3. Buscar resumen cacheado
    const [[cacheado]] = await db.query(
      "SELECT resumen, perfil_hash FROM resumenes_ia WHERE estudiante_id = ? AND vacante_id = ?",
      [estudiante_id, vacante_id]
    );

    // 4. Si existe y el hash coincide, devolver caché
    if (cacheado && cacheado.perfil_hash === hashActual) {
      return res.json({ resumen: cacheado.resumen, desde_cache: true });
    }

    // 5. Generar nuevo resumen con Gemini 1.5 Flash
    const prompt = buildPrompt(perfil, habilidades, idiomas, historial_academico, historial_laboral, posts, vacante);

    const model   = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result  = await model.generateContent(prompt);
    const resumen = result.response.text().trim();

    // 6. Guardar o actualizar en caché
    await db.query(
      `INSERT INTO resumenes_ia (estudiante_id, vacante_id, resumen, perfil_hash)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE resumen = VALUES(resumen), perfil_hash = VALUES(perfil_hash)`,
      [estudiante_id, vacante_id, resumen, hashActual]
    );

    res.json({ resumen, desde_cache: false });

  } catch (err) {
    console.error("Error generando resumen IA:", err.message);
    res.status(500).json({ error: "Error al generar el resumen. Intenta de nuevo." });
    console.error(err);
  }
});

// GET /api/ia/ranking/:vacante_id — ranking de postulantes por compatibilidad (con caché)
router.get("/ranking/:vacante_id", verificarToken, soloRol("empresa"), async (req, res) => {
  const vacante_id = parseInt(req.params.vacante_id);
  const empresaId  = req.usuario.id;

  if (!process.env.GEMINI_API_KEY)
    return res.status(503).json({ error: "Servicio de IA no configurado. Contacta al administrador." });

  try {
    // 1. Verificar que la vacante pertenece a esta empresa
    const [[vacante]] = await db.query(
      "SELECT id, titulo, area, modalidad, tipo, descripcion FROM vacantes WHERE id = ? AND empresa_id = ?",
      [vacante_id, empresaId]
    );
    if (!vacante) return res.status(404).json({ error: "Vacante no encontrada" });

    // 2. Obtener postulantes ordenados por ID para hash consistente
    const [postulantes] = await db.query(
      "SELECT p.estudiante_id FROM postulaciones p WHERE p.vacante_id = ? ORDER BY p.estudiante_id ASC",
      [vacante_id]
    );
    if (postulantes.length === 0) return res.json({ ranking: [], desde_cache: false });

    const estudianteIds = postulantes.map(p => p.estudiante_id);

    // 3. Obtener perfil_hash actuales de resumenes_ia para calcular el hash del ranking
    const [hashRows] = await db.query(
      `SELECT estudiante_id, perfil_hash FROM resumenes_ia WHERE vacante_id = ? AND estudiante_id IN (?)`,
      [vacante_id, estudianteIds]
    );
    const hashMap = Object.fromEntries(hashRows.map(r => [r.estudiante_id, r.perfil_hash]));

    const rankingHashInput = JSON.stringify(
      estudianteIds.map(id => ({ id, h: hashMap[id] || "none" }))
    );
    const rankingHashCandidate = crypto.createHash("sha256").update(rankingHashInput).digest("hex");

    // 4. Revisar caché de ranking
    const [[cached]] = await db.query(
      "SELECT ranking, ranking_hash FROM rankings_ia WHERE vacante_id = ?",
      [vacante_id]
    );
    if (cached && cached.ranking_hash === rankingHashCandidate) {
      return res.json({ ranking: JSON.parse(cached.ranking), desde_cache: true });
    }

    // 5. Generar / refrescar resúmenes y extraer compatibilidad
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const PUNTAJE = { Alta: 3, Media: 2, Baja: 1 };
    const resultados = [];

    for (const estudianteId of estudianteIds) {
      try {
        const [[perfil]]              = await db.query(`SELECT pe.*, c.nombre AS carrera FROM perfiles_estudiantes pe LEFT JOIN carreras c ON c.id = pe.carrera_id WHERE pe.usuario_id = ?`, [estudianteId]);
        if (!perfil) { resultados.push({ estudiante_id: estudianteId, compatibilidad: "Baja" }); continue; }

        const [habilidades]           = await db.query(`SELECT h.nombre, ch.nombre AS categoria, he.nivel_dominio FROM habilidades_estudiantes he JOIN habilidades h ON h.id = he.habilidad_id JOIN categorias_habilidades ch ON ch.id = h.categoria_id WHERE he.estudiante_id = ?`, [estudianteId]);
        const [idiomas]               = await db.query("SELECT idioma, nivel FROM idiomas_estudiantes WHERE estudiante_id = ?", [estudianteId]);
        const [historial_academico]   = await db.query("SELECT titulo, institucion, fecha_inicio, fecha_fin FROM historial_academico WHERE estudiante_id = ? ORDER BY fecha_inicio DESC", [estudianteId]);
        const [historial_laboral]     = await db.query("SELECT cargo, empresa_nombre, descripcion, fecha_inicio, fecha_fin FROM historial_laboral WHERE estudiante_id = ? ORDER BY fecha_inicio DESC", [estudianteId]);
        const [posts]                 = await db.query("SELECT titulo, contenido FROM publicaciones WHERE autor_id = ? ORDER BY publicado_en DESC LIMIT 5", [estudianteId]);

        const hashActual = calcularHashPerfil(perfil, habilidades, idiomas, historial_academico, historial_laboral, posts);

        const [[cacheado]] = await db.query(
          "SELECT resumen, perfil_hash FROM resumenes_ia WHERE estudiante_id = ? AND vacante_id = ?",
          [estudianteId, vacante_id]
        );

        let resumen;
        if (cacheado && cacheado.perfil_hash === hashActual) {
          resumen = cacheado.resumen;
        } else {
          const prompt = buildPrompt(perfil, habilidades, idiomas, historial_academico, historial_laboral, posts, vacante);
          const result = await model.generateContent(prompt);
          resumen = result.response.text().trim();
          await db.query(
            `INSERT INTO resumenes_ia (estudiante_id, vacante_id, resumen, perfil_hash)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE resumen = VALUES(resumen), perfil_hash = VALUES(perfil_hash)`,
            [estudianteId, vacante_id, resumen, hashActual]
          );
        }

        const match = resumen.match(/COMPATIBILIDAD[^\n]*(Alta|Media|Baja)/i);
        const compatibilidad = match
          ? match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase()
          : "Baja";

        resultados.push({ estudiante_id: estudianteId, compatibilidad, puntaje: PUNTAJE[compatibilidad] || 1 });
      } catch {
        resultados.push({ estudiante_id: estudianteId, compatibilidad: "Baja", puntaje: 1 });
      }
    }

    resultados.sort((a, b) => b.puntaje - a.puntaje);

    // 6. Recomputar hash final con los perfil_hash reales (ya guardados en resumenes_ia)
    const [hashRowsFresh] = await db.query(
      `SELECT estudiante_id, perfil_hash FROM resumenes_ia WHERE vacante_id = ? AND estudiante_id IN (?)`,
      [vacante_id, estudianteIds]
    );
    const hashMapFresh = Object.fromEntries(hashRowsFresh.map(r => [r.estudiante_id, r.perfil_hash]));
    const rankingHashFinal = crypto.createHash("sha256").update(
      JSON.stringify(estudianteIds.map(id => ({ id, h: hashMapFresh[id] || "none" })))
    ).digest("hex");

    // 7. Guardar ranking en caché
    await db.query(
      `INSERT INTO rankings_ia (vacante_id, ranking, ranking_hash)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE ranking = VALUES(ranking), ranking_hash = VALUES(ranking_hash), generado_en = NOW()`,
      [vacante_id, JSON.stringify(resultados), rankingHashFinal]
    );

    res.json({ ranking: resultados, desde_cache: false });
  } catch (err) {
    console.error("Error generando ranking:", err.message);
    res.status(500).json({ error: "Error al generar el ranking. Intenta de nuevo." });
  }
});

// ── Helpers resumen conversación ────────────────────────────────────────────
function agruparMensajesPorDia(mensajes) {
  const grupos = {};
  for (const msg of mensajes) {
    const fecha = new Date(msg.enviado_en).toLocaleDateString("es-CL", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    if (!grupos[fecha]) grupos[fecha] = [];
    grupos[fecha].push(`[${msg.remitente_nombre}]: ${msg.contenido}`);
  }
  return Object.entries(grupos)
    .map(([fecha, msgs]) => `${fecha}:\n${msgs.join("\n")}`)
    .join("\n\n");
}

// ── GET /api/ia/resumen-conversacion/:conversacion_id ────────────────────────
router.get("/resumen-conversacion/:conversacion_id", verificarToken, soloRol("colegio"), async (req, res) => {
  const conversacion_id = parseInt(req.params.conversacion_id);
  const colegioId = req.usuario.id;
  try {
    const [[conv]] = await db.query(
      `SELECT c.id FROM conversaciones c
       JOIN perfiles_estudiantes pe ON pe.usuario_id = c.estudiante_id
       WHERE c.id = ? AND pe.colegio_id = ?`,
      [conversacion_id, colegioId]
    );
    if (!conv) return res.status(403).json({ error: "Sin acceso a esta conversación" });

    const [[existente]] = await db.query(
      "SELECT resumen, ultimo_mensaje_id, generado_en FROM resumenes_conversacion WHERE conversacion_id = ?",
      [conversacion_id]
    );

    const ultimoId = existente?.ultimo_mensaje_id ?? 0;
    const [[{ nuevos }]] = await db.query(
      "SELECT COUNT(*) AS nuevos FROM mensajes WHERE conversacion_id = ? AND id > ?",
      [conversacion_id, ultimoId]
    );

    res.json({
      resumen: existente?.resumen ?? null,
      generado_en: existente?.generado_en ?? null,
      mensajes_nuevos: nuevos,
    });
  } catch (err) {
    console.error("Error obteniendo resumen conversación:", err.message);
    res.status(500).json({ error: "Error al obtener el resumen." });
  }
});

// ── POST /api/ia/resumen-conversacion/:conversacion_id ───────────────────────
router.post("/resumen-conversacion/:conversacion_id", verificarToken, soloRol("colegio"), async (req, res) => {
  const conversacion_id = parseInt(req.params.conversacion_id);
  const colegioId = req.usuario.id;

  if (!process.env.GEMINI_API_KEY)
    return res.status(503).json({ error: "Servicio de IA no configurado." });

  try {
    const [[conv]] = await db.query(
      `SELECT c.id, pe.nombre_completo AS nombre_estudiante, emp.nombre_empresa
       FROM conversaciones c
       JOIN perfiles_estudiantes pe ON pe.usuario_id = c.estudiante_id
       JOIN perfiles_empresas emp ON emp.usuario_id = c.empresa_id
       WHERE c.id = ? AND pe.colegio_id = ?`,
      [conversacion_id, colegioId]
    );
    if (!conv) return res.status(403).json({ error: "Sin acceso a esta conversación" });

    const [[existente]] = await db.query(
      "SELECT resumen, ultimo_mensaje_id FROM resumenes_conversacion WHERE conversacion_id = ?",
      [conversacion_id]
    );

    const ultimoId = existente?.ultimo_mensaje_id ?? 0;

    const [mensajesNuevos] = await db.query(
      `SELECT m.id, m.contenido, m.enviado_en,
              COALESCE(pe.nombre_completo, emp.nombre_empresa) AS remitente_nombre
       FROM mensajes m
       LEFT JOIN perfiles_estudiantes pe ON pe.usuario_id = m.remitente_id
       LEFT JOIN perfiles_empresas emp ON emp.usuario_id = m.remitente_id
       WHERE m.conversacion_id = ? AND m.id > ?
       ORDER BY m.enviado_en ASC`,
      [conversacion_id, ultimoId]
    );

    // Sin mensajes nuevos y ya existe resumen → devolver caché
    if (mensajesNuevos.length === 0 && existente) {
      const [[fresh]] = await db.query(
        "SELECT resumen, generado_en FROM resumenes_conversacion WHERE conversacion_id = ?",
        [conversacion_id]
      );
      return res.json({ resumen: fresh.resumen, generado_en: fresh.generado_en, mensajes_nuevos: 0, desde_cache: true });
    }

    // Sin ningún mensaje en el chat
    if (mensajesNuevos.length === 0) {
      return res.json({ resumen: null, mensajes_nuevos: 0, desde_cache: true });
    }

    const mensajesAgrupados = agruparMensajesPorDia(mensajesNuevos);

    let prompt;
    if (existente) {
      prompt = `Eres un asistente de supervisión escolar en EmpleaMe, una plataforma de prácticas profesionales.
La conversación supervisada es entre ${conv.nombre_estudiante} (estudiante) y ${conv.nombre_empresa} (empresa).

Resumen actual de la conversación:
---
${existente.resumen}
---

Mensajes nuevos desde el último resumen, agrupados por día:
${mensajesAgrupados}

Actualiza el resumen añadiendo los días nuevos o completando días existentes si llegaron más mensajes. Mantén el formato de una línea por día: "📅 [fecha]: [descripción breve de los temas tratados]". Responde solo con el resumen completo actualizado, sin texto adicional.`;
    } else {
      prompt = `Eres un asistente de supervisión escolar en EmpleaMe, una plataforma de prácticas profesionales.
La conversación supervisada es entre ${conv.nombre_estudiante} (estudiante) y ${conv.nombre_empresa} (empresa).

Genera un resumen diario de esta conversación. Una línea por día con el formato: "📅 [fecha]: [descripción breve de los temas tratados ese día]". Si en un día se trató más de un tema, mencionálos en la misma línea separados por punto y coma. Responde solo con el resumen, sin texto adicional.

Mensajes:
${mensajesAgrupados}`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    const resumen = result.response.text().trim();
    const nuevoUltimoId = mensajesNuevos[mensajesNuevos.length - 1].id;

    await db.query(
      `INSERT INTO resumenes_conversacion (conversacion_id, admin_id, resumen, ultimo_mensaje_id)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE resumen = VALUES(resumen), ultimo_mensaje_id = VALUES(ultimo_mensaje_id), admin_id = VALUES(admin_id), generado_en = NOW()`,
      [conversacion_id, colegioId, resumen, nuevoUltimoId]
    );

    res.json({ resumen, generado_en: new Date().toISOString(), mensajes_nuevos: 0, desde_cache: false });
  } catch (err) {
    console.error("Error generando resumen conversación:", err.message);
    res.status(500).json({ error: "Error al generar el resumen. Intenta de nuevo." });
  }
});

// POST /api/ia/moderar — verifica si un contenido es apropiado para la plataforma
router.post("/moderar", verificarToken, async (req, res) => {
  const { contenido } = req.body;
  if (!contenido || !contenido.trim())
    return res.status(400).json({ error: "contenido es requerido" });

  if (!process.env.GEMINI_API_KEY)
    return res.json({ aprobado: true });

  try {
    const prompt = `Eres un moderador de contenido para EmpleaMe, una plataforma educativa de prácticas profesionales en Chile.
Analiza el siguiente texto y determina si es apropiado para publicarse en la plataforma.

Texto: "${contenido.trim().substring(0, 1000)}"

Responde ÚNICAMENTE con JSON válido (sin markdown): {"aprobado": true o false, "razon": "explicación breve en español"}
Considera INAPROPIADO: groserías, insultos, discriminación, contenido sexual, amenazas, spam, datos de contacto personal para evadir la plataforma.
Considera APROPIADO: ofertas de trabajo, descripciones de talleres, publicaciones profesionales, preguntas técnicas.`;

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.json({ aprobado: true });

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({ aprobado: Boolean(parsed.aprobado), razon: parsed.razon || "" });
  } catch (err) {
    console.error("Error moderando contenido:", err.message);
    res.json({ aprobado: true });
  }
});

module.exports = router;
