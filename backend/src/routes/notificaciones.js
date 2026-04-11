const router = require("express").Router();
const db = require("../db");
const { verificarToken } = require("../middleware/auth");

// GET /api/notificaciones?pagina=1&porPagina=10
router.get("/", verificarToken, async (req, res) => {
  const { id } = req.usuario;
  const pagina    = Math.max(1, parseInt(req.query.pagina)    || 1);
  const porPagina = Math.min(50, parseInt(req.query.porPagina) || 10);
  const offset    = (pagina - 1) * porPagina;
  try {
    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) AS total FROM notificaciones WHERE usuario_id = ?", [id]
    );
    const [[{ noLeidas }]] = await db.query(
      "SELECT COUNT(*) AS noLeidas FROM notificaciones WHERE usuario_id = ? AND leida = FALSE", [id]
    );
    const [rows] = await db.query(
      `SELECT id, tipo, titulo, contenido, leida, creada_en
       FROM notificaciones
       WHERE usuario_id = ?
       ORDER BY creada_en DESC
       LIMIT ? OFFSET ?`,
      [id, porPagina, offset]
    );
    res.json({ notificaciones: rows, total, noLeidas });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/notificaciones/no-leidas  — solo el conteo
router.get("/no-leidas", verificarToken, async (req, res) => {
  try {
    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) AS count FROM notificaciones WHERE usuario_id = ? AND leida = FALSE",
      [req.usuario.id]
    );
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/notificaciones/leidas  — marca todas como leídas
router.put("/leidas", verificarToken, async (req, res) => {
  try {
    await db.query(
      "UPDATE notificaciones SET leida = TRUE WHERE usuario_id = ? AND leida = FALSE",
      [req.usuario.id]
    );
    res.json({ mensaje: "Notificaciones marcadas como leídas" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
