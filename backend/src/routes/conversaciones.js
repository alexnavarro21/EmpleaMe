const router = require("express").Router();
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");

// GET /api/conversaciones — lista de conversaciones del usuario actual
router.get("/", verificarToken, async (req, res) => {
  const { id, rol } = req.usuario;
  try {
    let rows;

    if (rol === "empresa") {
      [rows] = await db.query(
        `SELECT c.id, c.creada_en,
                pe.usuario_id AS contraparte_id,
                pe.nombre_completo AS contraparte,
                (SELECT m.contenido FROM mensajes m WHERE m.conversacion_id = c.id ORDER BY m.enviado_en DESC LIMIT 1) AS ultimo_mensaje,
                (SELECT m.enviado_en FROM mensajes m WHERE m.conversacion_id = c.id ORDER BY m.enviado_en DESC LIMIT 1) AS ultimo_tiempo,
                (SELECT COUNT(*) FROM mensajes m WHERE m.conversacion_id = c.id AND m.leido = FALSE AND m.remitente_id != ?) AS no_leidos
         FROM conversaciones c
         JOIN perfiles_estudiantes pe ON pe.usuario_id = c.estudiante_id
         WHERE c.empresa_id = ?
         ORDER BY ultimo_tiempo DESC`,
        [id, id]
      );
    } else if (rol === "estudiante") {
      [rows] = await db.query(
        `SELECT c.id, c.creada_en,
                emp.usuario_id AS contraparte_id,
                emp.nombre_empresa AS contraparte,
                (SELECT m.contenido FROM mensajes m WHERE m.conversacion_id = c.id ORDER BY m.enviado_en DESC LIMIT 1) AS ultimo_mensaje,
                (SELECT m.enviado_en FROM mensajes m WHERE m.conversacion_id = c.id ORDER BY m.enviado_en DESC LIMIT 1) AS ultimo_tiempo,
                (SELECT COUNT(*) FROM mensajes m WHERE m.conversacion_id = c.id AND m.leido = FALSE AND m.remitente_id != ?) AS no_leidos
         FROM conversaciones c
         JOIN perfiles_empresas emp ON emp.usuario_id = c.empresa_id
         WHERE c.estudiante_id = ?
         ORDER BY ultimo_tiempo DESC`,
        [id, id]
      );
    } else {
      // Centro/admin ve todas
      [rows] = await db.query(
        `SELECT c.id, c.creada_en, c.empresa_id, c.estudiante_id,
                emp.nombre_empresa, pe.nombre_completo AS nombre_estudiante,
                (SELECT m.contenido FROM mensajes m WHERE m.conversacion_id = c.id ORDER BY m.enviado_en DESC LIMIT 1) AS ultimo_mensaje,
                (SELECT m.enviado_en FROM mensajes m WHERE m.conversacion_id = c.id ORDER BY m.enviado_en DESC LIMIT 1) AS ultimo_tiempo
         FROM conversaciones c
         JOIN perfiles_empresas emp ON emp.usuario_id = c.empresa_id
         JOIN perfiles_estudiantes pe ON pe.usuario_id = c.estudiante_id
         ORDER BY ultimo_tiempo DESC`
      );
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/conversaciones — iniciar conversación
// Empresa: { estudiante_id }
// Estudiante: { empresa_id }
router.post("/", verificarToken, async (req, res) => {
  const { rol, id } = req.usuario;

  let empresa_id, estudiante_id;

  if (rol === "empresa") {
    empresa_id = id;
    estudiante_id = req.body.estudiante_id;
    if (!estudiante_id)
      return res.status(400).json({ error: "estudiante_id es requerido" });
  } else if (rol === "estudiante") {
    empresa_id = req.body.empresa_id;
    estudiante_id = id;
    if (!empresa_id)
      return res.status(400).json({ error: "empresa_id es requerido" });
  } else {
    return res.status(403).json({ error: "Solo empresas y estudiantes pueden iniciar conversaciones" });
  }

  try {
    const [existing] = await db.query(
      "SELECT id FROM conversaciones WHERE empresa_id = ? AND estudiante_id = ?",
      [empresa_id, estudiante_id]
    );
    if (existing.length > 0)
      return res.json({ id: existing[0].id, mensaje: "Conversación existente" });

    const [result] = await db.query(
      "INSERT INTO conversaciones (empresa_id, estudiante_id) VALUES (?, ?)",
      [empresa_id, estudiante_id]
    );
    res.status(201).json({ id: result.insertId, mensaje: "Conversación creada" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      const [existing] = await db.query(
        "SELECT id FROM conversaciones WHERE empresa_id = ? AND estudiante_id = ?",
        [empresa_id, estudiante_id]
      );
      return res.json({ id: existing[0].id });
    }
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/conversaciones/:id/mensajes — mensajes de una conversación
router.get("/:id/mensajes", verificarToken, async (req, res) => {
  try {
    const [conv] = await db.query(
      "SELECT * FROM conversaciones WHERE id = ?",
      [req.params.id]
    );
    if (conv.length === 0)
      return res.status(404).json({ error: "Conversación no encontrada" });

    const { id, rol } = req.usuario;
    if (rol !== "centro" && conv[0].empresa_id !== id && conv[0].estudiante_id !== id)
      return res.status(403).json({ error: "Sin permisos" });

    const [rows] = await db.query(
      `SELECT m.id, m.remitente_id, m.contenido, m.enviado_en, m.leido,
              u.rol AS remitente_rol
       FROM mensajes m
       JOIN usuarios u ON u.id = m.remitente_id
       WHERE m.conversacion_id = ?
       ORDER BY m.enviado_en ASC`,
      [req.params.id]
    );

    // Marcar mensajes del otro como leídos
    await db.query(
      "UPDATE mensajes SET leido = TRUE WHERE conversacion_id = ? AND remitente_id != ?",
      [req.params.id, id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/conversaciones/:id/mensajes — enviar mensaje
router.post("/:id/mensajes", verificarToken, async (req, res) => {
  const { contenido } = req.body;
  if (!contenido || !contenido.trim())
    return res.status(400).json({ error: "contenido es requerido" });

  try {
    const [conv] = await db.query(
      "SELECT * FROM conversaciones WHERE id = ?",
      [req.params.id]
    );
    if (conv.length === 0)
      return res.status(404).json({ error: "Conversación no encontrada" });

    const { id, rol } = req.usuario;
    if (rol !== "centro" && conv[0].empresa_id !== id && conv[0].estudiante_id !== id)
      return res.status(403).json({ error: "Sin permisos" });

    const [result] = await db.query(
      "INSERT INTO mensajes (conversacion_id, remitente_id, contenido) VALUES (?, ?, ?)",
      [req.params.id, id, contenido.trim()]
    );

    // Notificación al destinatario
    try {
      const recipientId = conv[0].empresa_id === id ? conv[0].estudiante_id : conv[0].empresa_id;
      const [[sender]] = await db.query(
        `SELECT COALESCE(pe.nombre_empresa, est.nombre_completo, 'Usuario') AS nombre
         FROM usuarios u
         LEFT JOIN perfiles_empresas pe     ON pe.usuario_id  = u.id
         LEFT JOIN perfiles_estudiantes est ON est.usuario_id = u.id
         WHERE u.id = ?`, [id]
      );
      await db.query(
        "INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido) VALUES (?, 'mensaje', ?, ?)",
        [recipientId, `Nuevo mensaje de ${sender.nombre}`, contenido.trim().substring(0, 150)]
      );
    } catch (_) { /* no bloquear si falla la notificación */ }

    res.status(201).json({ id: result.insertId, mensaje: "Mensaje enviado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
