const router = require("express").Router();
const db = require("../db");
const { verificarToken, soloRol } = require("../middleware/auth");

// POST /api/postulaciones  — estudiante postula a una vacante
router.post("/", verificarToken, soloRol("estudiante"), async (req, res) => {
  const { vacante_id } = req.body;
  if (!vacante_id) return res.status(400).json({ error: "vacante_id es requerido" });
  try {
    const [result] = await db.query(
      "INSERT INTO postulaciones (vacante_id, estudiante_id) VALUES (?, ?)",
      [vacante_id, req.usuario.id]
    );
    res.status(201).json({ id: result.insertId, mensaje: "Postulación enviada" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Ya postulaste a esta vacante" });
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/postulaciones/estudiante  — estudiante ve sus propias postulaciones con estado
router.get("/estudiante", verificarToken, soloRol("estudiante"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.estado, p.fecha_creacion,
              v.id AS vacante_id, v.titulo, v.area, v.modalidad,
              pe.nombre_empresa
       FROM postulaciones p
       JOIN vacantes v ON v.id = p.vacante_id
       JOIN perfiles_empresas pe ON pe.usuario_id = v.empresa_id
       WHERE p.estudiante_id = ?
       ORDER BY p.fecha_creacion DESC`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/postulaciones/empresa  — empresa ve postulantes recientes de todas sus vacantes
router.get("/empresa", verificarToken, soloRol("empresa"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.estado, p.fecha_creacion,
              pe.usuario_id AS estudiante_id, pe.nombre_completo, pe.carrera,
              pe.promedio, pe.calificacion_docente,
              v.titulo AS vacante_titulo, v.id AS vacante_id
       FROM postulaciones p
       JOIN perfiles_estudiantes pe ON pe.usuario_id = p.estudiante_id
       JOIN vacantes v ON v.id = p.vacante_id
       WHERE v.empresa_id = ?
       ORDER BY p.fecha_creacion DESC
       LIMIT 20`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/postulaciones/vacante/:id  — empresa ve postulantes de una vacante específica
router.get("/vacante/:id", verificarToken, soloRol("empresa"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.estado, p.fecha_creacion,
              pe.usuario_id AS estudiante_id, pe.nombre_completo, pe.carrera,
              pe.promedio, pe.calificacion_docente, pe.biografia
       FROM postulaciones p
       JOIN perfiles_estudiantes pe ON pe.usuario_id = p.estudiante_id
       WHERE p.vacante_id = ?
       ORDER BY p.fecha_creacion DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// PUT /api/postulaciones/:id/estado  — empresa actualiza estado de una postulación
router.put("/:id/estado", verificarToken, soloRol("empresa"), async (req, res) => {
  const { estado } = req.body;
  if (!["pendiente", "aceptado", "rechazado"].includes(estado))
    return res.status(400).json({ error: "Estado inválido" });
  try {
    const [result] = await db.query(
      `UPDATE postulaciones p
       JOIN vacantes v ON v.id = p.vacante_id
       SET p.estado = ?
       WHERE p.id = ? AND v.empresa_id = ?`,
      [estado, req.params.id, req.usuario.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Postulación no encontrada o sin permisos" });
    res.json({ mensaje: "Estado actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
