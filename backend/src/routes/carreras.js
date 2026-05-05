const router = require("express").Router();
const db = require("../db");
const { verificarToken } = require("../middleware/auth");

// GET /api/carreras — catálogo de carreras
// ?registradas=1 → solo las que al menos un colegio tiene registrada
router.get("/", verificarToken, async (req, res) => {
  try {
    const soloRegistradas = req.query.registradas === "1";
    const query = soloRegistradas
      ? `SELECT DISTINCT c.id, c.nombre
         FROM carreras c
         JOIN colegio_carreras cc ON cc.carrera_id = c.id
         ORDER BY c.nombre ASC`
      : "SELECT id, nombre FROM carreras ORDER BY nombre ASC";
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
