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
              CASE u.rol
                WHEN 'empresa'    THEN pe.foto_perfil
                WHEN 'estudiante' THEN est.foto_perfil
                ELSE NULL
              END AS autor_foto_perfil,
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

  if (contenido.length > 1000)
    return res.status(400).json({ error: "El comentario no puede superar 1000 caracteres" });
  try {
    const [result] = await db.query(
      "INSERT INTO comentarios (publicacion_id, autor_id, contenido) VALUES (?, ?, ?)",
      [req.params.id, req.usuario.id, contenido.trim()]
    );

    // Notificación al autor de la publicación (si no es el mismo que comenta)
    try {
      const [[pub]] = await db.query("SELECT autor_id FROM publicaciones WHERE id = ?", [req.params.id]);
      if (pub && pub.autor_id !== req.usuario.id) {
        const [[commenter]] = await db.query(
          `SELECT COALESCE(pe.nombre_empresa, est.nombre_completo, 'Usuario') AS nombre
           FROM usuarios u
           LEFT JOIN perfiles_empresas pe     ON pe.usuario_id  = u.id
           LEFT JOIN perfiles_estudiantes est ON est.usuario_id = u.id
           WHERE u.id = ?`, [req.usuario.id]
        );
        await db.query(
          "INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido) VALUES (?, 'comentario', ?, ?)",
          [pub.autor_id, `${commenter.nombre} comentó en tu publicación`, contenido.trim().substring(0, 150)]
        );
      }
    } catch (_) { /* no bloquear si falla la notificación */ }

    res.status(201).json({ id: result.insertId, mensaje: "Comentario agregado" });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

module.exports = router;
