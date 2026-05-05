const router = require("express").Router();
const db = require("../db");
const { verificarToken } = require("../middleware/auth");

// GET /api/carreras — catálogo completo de carreras
router.get("/", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, nombre FROM carreras ORDER BY nombre ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
