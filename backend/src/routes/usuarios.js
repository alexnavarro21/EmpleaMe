const router = require("express").Router();
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");

// GET /api/usuarios  — solo centro/admin
router.get("/", verificarToken, soloRol("colegio"), async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, correo, rol, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// DELETE /api/usuarios/:id  — solo centro/admin, y solo sobre estudiantes de su propia institución
router.delete("/:id", verificarToken, soloRol("colegio"), async (req, res) => {
  try {
    const [[esMiEstudiante]] = await db.query(
      "SELECT 1 FROM perfiles_estudiantes WHERE usuario_id = ? AND colegio_id = ?",
      [req.params.id, req.usuario.id]
    );
    if (!esMiEstudiante)
      return res.status(403).json({ error: "Este estudiante no pertenece a tu institución" });

    const [result] = await db.query("DELETE FROM usuarios WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ mensaje: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
