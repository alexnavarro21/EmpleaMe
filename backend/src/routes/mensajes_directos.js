const router = require("express").Router();
const db = require("../db");
const { verificarToken } = require("../middleware/auth");

// GET /api/mensajes-directos — conversaciones del usuario actual
router.get("/", verificarToken, async (req, res) => {
  const { id } = req.usuario;
  try {
    const [rows] = await db.query(
      `SELECT cd.id, cd.creada_en,
              IF(cd.usuario1_id = ?, cd.usuario2_id, cd.usuario1_id) AS contraparte_id,
              IF(cd.usuario1_id = ?,
                 COALESCE(pe2.nombre_completo, emp2.nombre_empresa),
                 COALESCE(pe1.nombre_completo, emp1.nombre_empresa)
              ) AS contraparte,
              (SELECT md.contenido FROM mensajes_directos md WHERE md.conversacion_id = cd.id ORDER BY md.enviado_en DESC LIMIT 1) AS ultimo_mensaje,
              (SELECT md.enviado_en FROM mensajes_directos md WHERE md.conversacion_id = cd.id ORDER BY md.enviado_en DESC LIMIT 1) AS ultimo_tiempo,
              (SELECT COUNT(*) FROM mensajes_directos md WHERE md.conversacion_id = cd.id AND md.leido = FALSE AND md.remitente_id != ?) AS no_leidos
       FROM conversaciones_directas cd
       LEFT JOIN perfiles_estudiantes pe1 ON pe1.usuario_id = cd.usuario1_id
       LEFT JOIN perfiles_empresas emp1   ON emp1.usuario_id = cd.usuario1_id
       LEFT JOIN perfiles_estudiantes pe2 ON pe2.usuario_id = cd.usuario2_id
       LEFT JOIN perfiles_empresas emp2   ON emp2.usuario_id = cd.usuario2_id
       WHERE cd.usuario1_id = ? OR cd.usuario2_id = ?
       ORDER BY ultimo_tiempo DESC`,
      [id, id, id, id, id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/mensajes-directos — iniciar o recuperar conversación con { destinatario_id }
router.post("/", verificarToken, async (req, res) => {
  const { id } = req.usuario;
  const { destinatario_id } = req.body;

  if (!destinatario_id)
    return res.status(400).json({ error: "destinatario_id es requerido" });
  if (destinatario_id === id)
    return res.status(400).json({ error: "No puedes iniciar una conversación contigo mismo" });

  // Siempre guardamos con el menor ID primero para garantizar unicidad
  const u1 = Math.min(id, destinatario_id);
  const u2 = Math.max(id, destinatario_id);

  try {
    const [existing] = await db.query(
      "SELECT id FROM conversaciones_directas WHERE usuario1_id = ? AND usuario2_id = ?",
      [u1, u2]
    );
    if (existing.length > 0)
      return res.json({ id: existing[0].id, mensaje: "Conversación existente" });

    const [result] = await db.query(
      "INSERT INTO conversaciones_directas (usuario1_id, usuario2_id) VALUES (?, ?)",
      [u1, u2]
    );
    res.status(201).json({ id: result.insertId, mensaje: "Conversación creada" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      const [existing] = await db.query(
        "SELECT id FROM conversaciones_directas WHERE usuario1_id = ? AND usuario2_id = ?",
        [u1, u2]
      );
      return res.json({ id: existing[0].id });
    }
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/mensajes-directos/:id/mensajes — mensajes de una conversación
router.get("/:id/mensajes", verificarToken, async (req, res) => {
  const { id } = req.usuario;
  try {
    const [conv] = await db.query(
      "SELECT * FROM conversaciones_directas WHERE id = ?",
      [req.params.id]
    );
    if (conv.length === 0)
      return res.status(404).json({ error: "Conversación no encontrada" });
    if (conv[0].usuario1_id !== id && conv[0].usuario2_id !== id)
      return res.status(403).json({ error: "Sin permisos" });

    const [rows] = await db.query(
      `SELECT id, remitente_id, contenido, enviado_en, leido
       FROM mensajes_directos
       WHERE conversacion_id = ?
       ORDER BY enviado_en ASC`,
      [req.params.id]
    );

    // Marcar como leídos los mensajes del otro
    await db.query(
      "UPDATE mensajes_directos SET leido = TRUE WHERE conversacion_id = ? AND remitente_id != ?",
      [req.params.id, id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/mensajes-directos/:id/mensajes — enviar mensaje
router.post("/:id/mensajes", verificarToken, async (req, res) => {
  const { contenido } = req.body;
  const { id } = req.usuario;

  if (!contenido || !contenido.trim())
    return res.status(400).json({ error: "contenido es requerido" });

  try {
    const [conv] = await db.query(
      "SELECT * FROM conversaciones_directas WHERE id = ?",
      [req.params.id]
    );
    if (conv.length === 0)
      return res.status(404).json({ error: "Conversación no encontrada" });
    if (conv[0].usuario1_id !== id && conv[0].usuario2_id !== id)
      return res.status(403).json({ error: "Sin permisos" });

    const [result] = await db.query(
      "INSERT INTO mensajes_directos (conversacion_id, remitente_id, contenido) VALUES (?, ?, ?)",
      [req.params.id, id, contenido.trim()]
    );
    res.status(201).json({ id: result.insertId, mensaje: "Mensaje enviado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
