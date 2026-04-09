const router = require("express").Router();
const db = require("../db");
const { verificarToken } = require("../middleware/auth");

// GET /api/publicaciones — feed de publicaciones activas
router.get("/", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.titulo, p.contenido, p.publicado_en, p.vacante_id,
              tp.nombre AS tipo,
              u.rol AS autor_rol,
              CASE u.rol
                WHEN 'empresa'    THEN pe.nombre_empresa
                WHEN 'estudiante' THEN est.nombre_completo
                ELSE 'Centro Educacional'
              END AS autor_nombre
       FROM publicaciones p
       JOIN tipos_publicacion tp  ON tp.id  = p.tipo_id
       JOIN usuarios u            ON u.id   = p.autor_id
       LEFT JOIN perfiles_empresas pe    ON pe.usuario_id  = u.id
       LEFT JOIN perfiles_estudiantes est ON est.usuario_id = u.id
       WHERE p.esta_activa = TRUE
       ORDER BY p.publicado_en DESC
       LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// POST /api/publicaciones — crear publicación
router.post("/", verificarToken, async (req, res) => {
  const { titulo, contenido, tipo_nombre, vacante_id } = req.body;
  if (!titulo || !tipo_nombre)
    return res.status(400).json({ error: "titulo y tipo_nombre son requeridos" });

  try {
    const [tipo] = await db.query(
      "SELECT id FROM tipos_publicacion WHERE nombre = ?",
      [tipo_nombre]
    );
    if (tipo.length === 0)
      return res.status(400).json({ error: "Tipo de publicación inválido" });

    const [result] = await db.query(
      "INSERT INTO publicaciones (autor_id, tipo_id, vacante_id, titulo, contenido) VALUES (?, ?, ?, ?, ?)",
      [req.usuario.id, tipo[0].id, vacante_id || null, titulo, contenido || null]
    );
    res.status(201).json({ id: result.insertId, mensaje: "Publicación creada" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// DELETE /api/publicaciones/:id — desactivar publicación (autor o centro)
router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const { id, rol } = req.usuario;
    let result;

    if (rol === "centro") {
      [result] = await db.query(
        "UPDATE publicaciones SET esta_activa = FALSE WHERE id = ?",
        [req.params.id]
      );
    } else {
      [result] = await db.query(
        "UPDATE publicaciones SET esta_activa = FALSE WHERE id = ? AND autor_id = ?",
        [req.params.id, id]
      );
    }

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Publicación no encontrada o sin permisos" });

    res.json({ mensaje: "Publicación eliminada" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
