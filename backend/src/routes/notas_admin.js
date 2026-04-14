const router = require("express").Router();
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");

// GET /api/notas-admin/:conversacion_id — obtiene la nota del admin para esa conversación
router.get("/:conversacion_id", verificarToken, soloRol("centro"), async (req, res) => {
  try {
    const [[nota]] = await db.query(
      "SELECT contenido, actualizado_en FROM notas_admin WHERE conversacion_id = ? AND admin_id = ?",
      [req.params.conversacion_id, req.usuario.id]
    );
    res.json(nota || { contenido: "", actualizado_en: null });
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
