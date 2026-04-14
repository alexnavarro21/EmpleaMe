const router = require("express").Router();
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");

// GET /api/notas-admin/:conversacion_id — todas las notas de la conversación + la del admin actual
router.get("/:conversacion_id", verificarToken, soloRol("centro"), async (req, res) => {
  try {
    const [todas] = await db.query(
      `SELECT n.id, n.admin_id, n.contenido, n.actualizado_en,
              u.correo AS admin_nombre,
              (n.admin_id = ?) AS es_propia
       FROM notas_admin n
       JOIN usuarios u ON u.id = n.admin_id
       WHERE n.conversacion_id = ?
       ORDER BY n.actualizado_en DESC`,
      [req.usuario.id, req.params.conversacion_id]
    );
    res.json(todas);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/notas-admin/:conversacion_id — crea o actualiza la nota
router.put("/:conversacion_id", verificarToken, soloRol("centro"), async (req, res) => {
  const { contenido } = req.body;
  if (contenido === undefined) return res.status(400).json({ error: "contenido es requerido" });
  try {
    await db.query(
      `INSERT INTO notas_admin (conversacion_id, admin_id, contenido)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE contenido = VALUES(contenido), actualizado_en = CURRENT_TIMESTAMP`,
      [req.params.conversacion_id, req.usuario.id, contenido]
    );
    res.json({ mensaje: "Nota guardada" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
