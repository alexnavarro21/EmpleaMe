const router = require("express").Router();
const db = require("../db");
const { verificarToken } = require("../middleware/auth");
const upload = require("../middleware/multerConfig");

// POST /api/publicaciones — crear publicación con soporte de archivos
router.post("/", verificarToken, upload.single("archivo_multimedia"), async (req, res) => {
  const { titulo, contenido, tipo_nombre, vacante_id, tipo } = req.body;
  const archivo = req.file;

  const tituloFinal = titulo || "Actualización de estado";
  const tipoFinal = tipo_nombre || tipo || (archivo ? "multimedia" : "general");

  try {
    const [tipoDb] = await db.query(
      "SELECT id FROM tipos_publicacion WHERE nombre = ?",
      [tipoFinal]
    );
    const tipoId = tipoDb.length > 0 ? tipoDb[0].id : 1;

    const url_multimedia = archivo ? `/uploads/${archivo.filename}` : null;

    const [result] = await db.query(
      "INSERT INTO publicaciones (autor_id, tipo_id, vacante_id, titulo, contenido, url_multimedia) VALUES (?, ?, ?, ?, ?, ?)",
      [req.usuario.id, tipoId, vacante_id || null, tituloFinal, contenido || null, url_multimedia]
    );

    res.status(201).json({ id: result.insertId, mensaje: "Publicación creada con éxito", url_multimedia });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

// GET /api/publicaciones — feed de publicaciones activas (opcionalmente filtrado por autor_id)
router.get("/", verificarToken, async (req, res) => {
  const { autor_id } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.titulo, p.contenido, p.publicado_en, p.vacante_id, p.url_multimedia,
              p.autor_id,
              tp.nombre AS tipo,
              u.rol AS autor_rol,
              CASE u.rol
                WHEN 'empresa'    THEN pe.nombre_empresa
                WHEN 'estudiante' THEN est.nombre_completo
                ELSE 'Centro Educacional'
              END AS autor_nombre,
              v.tipo AS vacante_tipo, v.area, v.modalidad, v.duracion, v.remuneracion, v.direccion
       FROM publicaciones p
       JOIN tipos_publicacion tp   ON tp.id  = p.tipo_id
       JOIN usuarios u             ON u.id   = p.autor_id
       LEFT JOIN perfiles_empresas pe     ON pe.usuario_id  = u.id
       LEFT JOIN perfiles_estudiantes est ON est.usuario_id = u.id
       LEFT JOIN vacantes v               ON v.id = p.vacante_id
       WHERE p.esta_activa = TRUE
       ${autor_id ? "AND p.autor_id = ?" : ""}
       ORDER BY p.publicado_en DESC
       LIMIT 50`,
      autor_id ? [autor_id] : []
    );
    res.json(rows);
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