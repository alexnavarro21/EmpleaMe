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

// POST /api/notas-admin/:conversacion_id — agrega una nueva nota al historial
router.post("/:conversacion_id", verificarToken, soloRol("centro"), async (req, res) => {
  const { contenido } = req.body;
  if (!contenido?.trim()) return res.status(400).json({ error: "La nota no puede estar vacía" });
  try {
    await db.query(
      "INSERT INTO notas_admin (conversacion_id, admin_id, contenido) VALUES (?, ?, ?)",
      [req.params.conversacion_id, req.usuario.id, contenido.trim()]
    );
    res.status(201).json({ mensaje: "Nota agregada" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
