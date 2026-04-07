const router = require("express").Router();
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");

// GET /api/vacantes  — vacantes activas
router.get("/", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT v.*, pe.nombre_empresa
       FROM vacantes v
       JOIN perfiles_empresas pe ON pe.usuario_id = v.empresa_id
       WHERE v.esta_activa = TRUE
       ORDER BY v.fecha_creacion DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/vacantes/empresa/:id  — vacantes de una empresa específica
router.get("/empresa/:id", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM vacantes WHERE empresa_id = ? ORDER BY fecha_creacion DESC",
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/vacantes  — publicar vacante (solo empresa)
router.post("/", verificarToken, soloRol("empresa"), async (req, res) => {
  const { titulo, descripcion, requisitos } = req.body;
  if (!titulo || !descripcion)
    return res.status(400).json({ error: "titulo y descripcion son requeridos" });
  try {
    const [result] = await db.query(
      "INSERT INTO vacantes (empresa_id, titulo, descripcion, requisitos) VALUES (?, ?, ?, ?)",
      [req.usuario.id, titulo, descripcion, requisitos || null]
    );
    res.status(201).json({ id: result.insertId, mensaje: "Vacante publicada" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/vacantes/:id/desactivar  — desactivar vacante (solo empresa)
router.put("/:id/desactivar", verificarToken, soloRol("empresa"), async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE vacantes SET esta_activa = FALSE WHERE id = ? AND empresa_id = ?",
      [req.params.id, req.usuario.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Vacante no encontrada o sin permisos" });
    res.json({ mensaje: "Vacante desactivada" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
