const router = require("express").Router();
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");

// GET /api/habilidades  — catálogo completo
router.get("/", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM habilidades ORDER BY categoria, nombre");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/habilidades  — agregar al catálogo (solo centro)
router.post("/", verificarToken, soloRol("centro"), async (req, res) => {
  const { nombre, categoria } = req.body;
  if (!nombre || !categoria)
    return res.status(400).json({ error: "nombre y categoria son requeridos" });
  try {
    const [result] = await db.query(
      "INSERT INTO habilidades (nombre, categoria) VALUES (?, ?)",
      [nombre, categoria]
    );
    res.status(201).json({ id: result.insertId, nombre, categoria });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/habilidades/:id/estudiantes  — estudiantes que tienen esta habilidad asignada
router.get("/:id/estudiantes", verificarToken, soloRol("centro"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pe.nombre_completo, pe.usuario_id
       FROM habilidades_estudiantes he
       JOIN perfiles_estudiantes pe ON pe.usuario_id = he.estudiante_id
       WHERE he.habilidad_id = ?
       ORDER BY pe.nombre_completo`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/habilidades/estudiante  — asignar habilidad a estudiante
router.post("/estudiante", verificarToken, async (req, res) => {
  const { estudiante_id, habilidad_id, nivel_dominio } = req.body;
  if (!estudiante_id || !habilidad_id || !nivel_dominio)
    return res.status(400).json({ error: "estudiante_id, habilidad_id y nivel_dominio requeridos" });
  try {
    const [result] = await db.query(
      "INSERT INTO habilidades_estudiantes (estudiante_id, habilidad_id, nivel_dominio) VALUES (?, ?, ?)",
      [estudiante_id, habilidad_id, nivel_dominio]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// DELETE /api/habilidades/estudiante/:id  — quitar habilidad de estudiante
router.delete("/estudiante/:id", verificarToken, async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM habilidades_estudiantes WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Habilidad no encontrada" });
    res.json({ mensaje: "Habilidad eliminada" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/habilidades/estudiante/:id/validar  — validar habilidad (solo centro)
router.put("/estudiante/:id/validar", verificarToken, soloRol("centro"), async (req, res) => {
  try {
    await db.query(
      "UPDATE habilidades_estudiantes SET esta_validada = TRUE WHERE id = ?",
      [req.params.id]
    );
    res.json({ mensaje: "Habilidad validada" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
