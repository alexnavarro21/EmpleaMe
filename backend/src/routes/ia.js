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
    semestre:           perfil.semestre,
    habilidades:        habilidades.map(h => ({ nombre: h.nombre, nivel: h.nivel_dominio })),
    idiomas:            idiomas.map(i => ({ idioma: i.idioma, nivel: i.nivel })),
    historial_academico: historial_academico.map(a => ({ titulo: a.titulo, institucion: a.institucion })),
    historial_laboral:  historial_laboral.map(l => ({ cargo: l.cargo, empresa: l.empresa_nombre, descripcion: l.descripcion })),
    posts:              posts.map(p => ({ titulo: p.titulo, contenido: p.contenido })),
  });
  return crypto.createHash("sha256").update(contenido).digest("hex");
}

// ── Construye el prompt para Claude ─────────────────────────────────────────
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

  return `1+1`;
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
      "SELECT * FROM perfiles_estudiantes WHERE usuario_id = ?",
      [estudiante_id]
    );
    if (!perfil) return res.status(404).json({ error: "Estudiante no encontrado" });

    const [[vacante]] = await db.query(
      "SELECT titulo, area, modalidad, tipo, descripcion FROM vacantes WHERE id = ? AND empresa_id = ?",
      [vacante_id, req.usuario.id]
    );
    if (!vacante) return res.status(404).json({ error: "Vacante no encontrada" });

    const [habilidades]        = await db.query(`SELECT h.nombre, h.categoria, he.nivel_dominio FROM habilidades_estudiantes he JOIN habilidades h ON h.id = he.habilidad_id WHERE he.estudiante_id = ?`, [estudiante_id]);
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

    const model   = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

module.exports = router;
