const router = require("express").Router({ mergeParams: true });
const db = require("../db");
const { verificarToken } = require("../middleware/auth");

// GET /api/publicaciones/:id/comentarios
router.get("/", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.contenido, c.creado_en,
              CASE u.rol
                WHEN 'empresa'    THEN pe.nombre_empresa
                WHEN 'estudiante' THEN est.nombre_completo
                ELSE 'Centro Educacional'
              END AS autor_nombre,
              u.rol AS autor_rol
       FROM comentarios c
       JOIN usuarios u ON u.id = c.autor_id
       LEFT JOIN perfiles_empresas pe      ON pe.usuario_id  = u.id
       LEFT JOIN perfiles_estudiantes est  ON est.usuario_id = u.id
       WHERE c.publicacion_id = ?
       ORDER BY c.creado_en ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/publicaciones/:id/comentarios
router.post("/", verificarToken, async (req, res) => {
  const { contenido } = req.body;
  if (!contenido?.trim())
    return res.status(400).json({ error: "El contenido es requerido" });
  try {
    const [result] = await db.query(
      "INSERT INTO comentarios (publicacion_id, autor_id, contenido) VALUES (?, ?, ?)",
      [req.params.id, req.usuario.id, contenido.trim()]
    );
    res.status(201).json({ id: result.insertId, mensaje: "Comentario agregado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
